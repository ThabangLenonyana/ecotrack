import { Component, OnInit, Input, OnChanges, Output, EventEmitter, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GoogleMapsModule } from '@angular/google-maps';
import { RecyclingFacility } from '../../../../models/recycling-facility';
import { FacilityService } from '../../../../service/facility.service';
import { MapClusteringService } from '../../../../service/map-cluster.service';
import { GeographicContextService } from '../../../../service/geographic-context.service';

// Declare google globally
declare var google: any;

@Component({
  selector: 'app-facility-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './facility-map.component.html',
  styleUrls: ['./facility-map.component.scss']
})
export class FacilityMapComponent implements OnInit, OnChanges, OnDestroy {
  @Input() activeFilters: any = {
    types: [],
    materials: [],
    radius: null,
    sortBy: null,
    userLocation: null
  };

  @Input() facilities: RecyclingFacility[] = [];
  
  @Output() facilitySelected = new EventEmitter<RecyclingFacility>();
  @Output() clusteringStateChanged = new EventEmitter<any>();
  
  // Default center only used if no facilities are loaded
  center: google.maps.LatLngLiteral = { lat: -26.2041, lng: 28.0473 };
  zoom = 9;
  filteredFacilities: RecyclingFacility[] = [];
  isLoading = true;
  mapOptions: google.maps.MapOptions = {
    mapId: '447a24cd5b049c0e',
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_BOTTOM,
    },
    fullscreenControl: false,
    mapTypeControl: false,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    maxZoom: 15,
    minZoom: 9, // Lower minZoom to allow seeing more of the map
  };
  private map!: google.maps.Map;
  private userLocationMarker: google.maps.Marker | null = null;
  private subscriptions: Subscription[] = [];
  

  constructor(
    private facilityService: FacilityService,
    public clusteringService: MapClusteringService,
    private geographicContextService: GeographicContextService
  ) {}

  ngOnInit(): void {
    // Subscribe to context changes for positioning the map
    this.subscriptions.push(
      this.geographicContextService.context$.subscribe(context => {
        // Only handle context changes if the map is initialized
        if (!this.map) return;
        
        // Find facilities matching the context and fit map to them if needed
        switch(context.level) {
          case 'municipality':
            if (context.municipalityName) {
              const municipalityFacilities = this.facilities.filter(
                f => f.municipality === context.municipalityName
              );
              if (municipalityFacilities.length > 0) {
                this.fitMapToFacilities(municipalityFacilities);
              }
            }
            break;
            
          case 'city':
            if (context.cityName) {
              const cityFacilities = this.facilities.filter(
                f => f.city === context.cityName
              );
              if (cityFacilities.length > 0) {
                this.fitMapToFacilities(cityFacilities);
              }
            }
            break;
            
          case 'facility':
            if (context.facilityId) {
              const facility = this.facilities.find(f => f.id === context.facilityId);
              if (facility) {
                this.centerMapOnFacility(facility);
              }
            }
            break;
        }
      })
    );

    // Only load all facilities if we don't have any provided
    if (this.facilities.length === 0) {
      this.loadFacilities();
    } else {
      this.filteredFacilities = [...this.facilities];
      this.refreshClustering();
      // Set timeout to ensure map is loaded before fitting bounds
      setTimeout(() => this.fitMapToAllMarkers(), 300);
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to avoid memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    // Handle direct facilities updates from location toggle
    if (changes['facilities'] && !changes['facilities'].firstChange) {
      this.filteredFacilities = [...this.facilities];
      this.refreshClustering();
    }
    
    if (changes['activeFilters'] && !changes['activeFilters'].firstChange) {
      // If user location is provided, center the map there
      if (this.activeFilters.userLocation) {
        this.centerMapOnUserLocation(
          this.activeFilters.userLocation.latitude,
          this.activeFilters.userLocation.longitude
        );
      }
      
      // Only apply filters if we weren't already given filtered facilities
      if (!changes['facilities'] || changes['facilities'].firstChange) {
        this.applyFilters();
      }
    }
  }
  
  onMapInitialized(map: google.maps.Map) {
    this.map = map;
    
    // Initialize the clustering service with our map
    this.clusteringService.initialize(map, (facility) => {
      this.facilitySelected.emit(facility);
    });

    // Track last handled zoom to avoid duplicate handling
    let lastHandledZoom: number | undefined = undefined;
    
    // Add zoom changed listener
    this.map.addListener('zoom_changed', () => {
      const currentZoom = this.map.getZoom();

      // Avoid handling the same zoom level repeatedly
      if (currentZoom !== undefined && currentZoom !== lastHandledZoom) {
        lastHandledZoom = currentZoom;
        this.zoom = currentZoom;

        // Try to handle the zoom change
        this.clusteringService.handleZoomChange(currentZoom);
      }
    });

    // Add idle listener for operations after zoom/pan completion
    this.map.addListener('idle', () => {
      const currentZoom = this.map.getZoom();

      // Double check that clustering state matches zoom level
      // This ensures transitions happen even if zoom_changed didn't trigger right
      if (currentZoom !== undefined && Math.abs((currentZoom - (lastHandledZoom || 0))) > 0.5) {
        lastHandledZoom = currentZoom;
        this.zoom = currentZoom;
        this.clusteringService.handleZoomChange(currentZoom);
      }
    });
    
    // Apply initial clustering if we have facilities
    if (this.map && this.filteredFacilities.length > 0) {
      this.refreshClustering();
      // Set timeout to ensure clusters are rendered before fitting bounds
      setTimeout(() => this.fitMapToAllMarkers(), 300);
    }
  }
  
  // Center map on a specific facility
  private centerMapOnFacility(facility: RecyclingFacility): void {
    if (!this.map) return;
    
    const facilityLocation = {
      lat: facility.latitude,
      lng: facility.longitude
    };
    
    this.map.setCenter(facilityLocation);
    this.map.setZoom(15); // Zoom in close to see the facility
  }
  
  // Fit map to show a specific set of facilities
  private fitMapToFacilities(facilities: RecyclingFacility[]): void {
    if (!this.map || facilities.length === 0) return;
    
    const bounds = new google.maps.LatLngBounds();
    
    facilities.forEach(facility => {
      bounds.extend({
        lat: facility.latitude,
        lng: facility.longitude
      });
    });
    
    this.map.fitBounds(bounds, 50); // 50px padding
  }
  
  // Apply clustering based on the current facilities
  private refreshClustering(): void {
    if (this.map && this.filteredFacilities.length > 0) {
      this.clusteringService.applyClusteringToFacilities(this.filteredFacilities);
    }
  }
  
  // Center map on user's location and adjust zoom
  private centerMapOnUserLocation(latitude: number, longitude: number): void {
    if (this.map) {
      this.center = { lat: latitude, lng: longitude };
      this.map.setCenter(this.center);
      this.map.setZoom(11); // Closer zoom when showing user location

      // Remove existing user location marker if any
      if (this.userLocationMarker) {
        this.userLocationMarker.setMap(null);
      }
      
      // Add user location marker
      this.userLocationMarker = new google.maps.Marker({
        position: this.center,
        map: this.map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
          scale: 8,
        },
        title: 'Your location',
        zIndex: 1000 // Ensure it's above other markers
      });
    }
  }
  
  // Apply filters to the facilities and update markers
  private applyFilters(): void {
    if (this.facilities.length === 0) return;
    
    let filtered = [...this.facilities];
    
    // Filter by facility types
    if (this.activeFilters.types && this.activeFilters.types.length > 0) {
      filtered = filtered.filter(facility => 
        facility.type && this.activeFilters.types.includes(facility.type.toLowerCase())
      );
    }
    
    // Filter by materials
    if (this.activeFilters.materials && this.activeFilters.materials.length > 0) {
      filtered = filtered.filter(facility => {
        if (!facility.acceptedMaterials) return false;
        
        return this.activeFilters.materials.some((material: string) => 
          facility.acceptedMaterials && facility.acceptedMaterials[material]
        );
      });
    }
    
    // Filter by radius if user location is provided
    if (this.activeFilters.userLocation && this.activeFilters.radius) {
      const userLat = this.activeFilters.userLocation.latitude;
      const userLng = this.activeFilters.userLocation.longitude;
      
      filtered = filtered.filter(facility => {
        const distance = this.calculateDistance(
          userLat, userLng, 
          facility.latitude, facility.longitude
        );
        
        // Store the distance for sorting later
        facility.distance = distance;
        return distance <= this.activeFilters.radius;
      });
    }
    
    // Sort facilities
    if (this.activeFilters.sortBy) {
      switch (this.activeFilters.sortBy) {
        case 'nearest':
          if (this.activeFilters.userLocation) {
            filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
          }
          break;
        case 'alphabetical':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    }
    
    this.filteredFacilities = filtered;
    this.refreshClustering();
    
    // Fit map to show all filtered markers
    setTimeout(() => this.fitMapToAllMarkers(), 300);
  }
  
  // Calculate distance between two points using the Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180)
  }

  loadFacilities(): void {
    this.isLoading = true;
    this.facilityService.getAllFacilities().subscribe({
      next: (data) => {
        this.facilities = data;
        this.filteredFacilities = [...data]; // Initially show all facilities
        this.isLoading = false;
        
        // Apply clustering if map is initialized
        if (this.map) {
          this.refreshClustering();
          // Fit map to show all markers
          this.fitMapToAllMarkers();
        }
      },
      error: (error) => {
        console.error('Error loading facilities:', error);
        this.isLoading = false;
      }
    });
  }
  
  /**
   * Fits the map view to include all markers/facilities
   */
  private fitMapToAllMarkers(): void {
    if (!this.map || this.filteredFacilities.length === 0) return;
    
    const bounds = new google.maps.LatLngBounds();
    
    // Add all facility locations to the bounds
    this.filteredFacilities.forEach(facility => {
      bounds.extend({
        lat: facility.latitude,
        lng: facility.longitude
      });
    });
    
    // Fit the map to these bounds with padding
    this.map.fitBounds(bounds, 100); // 100px padding
    
    // If there's only one marker or very close markers, zoom out a bit
    const listenerHandle = this.map.addListener('idle', () => {
      const zoom = this.map.getZoom();
      if (zoom && zoom > 13) {
        this.map.setZoom(13); // Prevent excessive zooming
      }
      // Remove listener after first idle
      google.maps.event.removeListener(listenerHandle);
    });
  }
}