import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { MarkerClusterer, GridAlgorithm } from '@googlemaps/markerclusterer';
import { RecyclingFacility } from '../../../../models/recycling-facility';
import { FacilityService } from '../../../../service/facility.service';
import { FacilityTypeMapper } from '../../../../utils/facility-type-mapper';

// Declare google globally
declare var google: any;

@Component({
  selector: 'app-facility-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './facility-map.component.html',
  styleUrls: ['./facility-map.component.scss']
})
export class FacilityMapComponent implements OnInit {
  // Output event to emit selected facility
  @Output() facilitySelected = new EventEmitter<RecyclingFacility>();
  
  // Default center is Gauteng
  center: google.maps.LatLngLiteral = { lat: -26.2041, lng: 28.0473 };
  zoom = 8.5;
  markers: google.maps.marker.AdvancedMarkerElement[] = [];
  facilities: RecyclingFacility[] = [];
  isLoading = true;
  mapOptions: google.maps.MapOptions = {
    mapId: '447a24cd5b049c0e',
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    maxZoom: 15,
    minZoom: 8,
  };
  private map!: google.maps.Map;
  private clusterer!: MarkerClusterer;
  private zoomThreshold = 13; // Zoom level at which clustering is disabled
  private mapFullyInitialized = false;

  constructor(private facilityService: FacilityService) {}

  ngOnInit(): void {
    this.loadFacilities();
  }

  async onMapInitialized(map: google.maps.Map) {
    this.map = map;
    // Ensure the marker library is loaded before creating markers/clusterer
    await google.maps.importLibrary("marker");
    if (this.markers.length > 0) {
      this.setupMarkerClusterer();
    }
    
    // Add zoom changed listener to handle clustering visibility
    this.map.addListener('zoom_changed', () => {
      this.handleZoomChange();
    });
  }
  
  // Handle zoom changes to show/hide clusters based on zoom level
  private handleZoomChange(): void {
    if (!this.map || !this.clusterer) return;
    
    const currentZoom = this.map.getZoom();
    // Ensure currentZoom is defined before comparison
    if (currentZoom !== undefined && currentZoom >= this.zoomThreshold) {
      // If zoomed in enough, hide clusters and show individual markers
      this.showIndividualMarkers();
    } else {
      // Otherwise show clusters
      this.showClusters();
    }
  }
  
  // Show individual markers and hide clusters
  private showIndividualMarkers(): void {
    if (this.clusterer) {
      this.clusterer.clearMarkers();
    }
    
    // Make sure all markers are visible on the map
    this.markers.forEach(marker => {
      marker.map = this.map;
    });
  }
  
  // Show clusters and manage markers through the clusterer
  private showClusters(): void {
    if (this.clusterer) {
      // Reset the clusterer with current markers
      this.clusterer.clearMarkers();
      this.clusterer.addMarkers(this.markers);
    } else {
      // Initialize clusterer if it doesn't exist
      this.setupMarkerClusterer();
    }
  }

  loadFacilities(): void {
    this.isLoading = true;
    this.facilityService.getAllFacilities().subscribe({
      next: async (data) => {
        this.facilities = data;
        // Ensure the marker library is loaded before creating markers
        await google.maps.importLibrary("marker");
        this.createMarkers();
        this.isLoading = false;
        
        if (this.map) {
          this.setupMarkerClusterer();
        }
      },
      error: (error) => {
        console.error('Error loading facilities:', error);
        this.isLoading = false;
      }
    });
  }

  // Create markers using AdvancedMarkerElement
  private createMarkers(): void {
    // Clear existing markers before creating new ones
    this.markers.forEach(marker => marker.map = null); // Remove markers from map
    this.markers = []; // Clear the array

    this.markers = this.facilities.map((facility) => {
      const markerElement = document.createElement('div');
      // Using the FacilityTypeMapper
      markerElement.innerHTML = `<i class="${FacilityTypeMapper.getFontAwesomeIcon(facility.type)}" aria-hidden="true"></i>`;
      markerElement.className = 'marker-icon';
      markerElement.style.fontSize = '26px'; // Slightly larger icon
      markerElement.style.color = FacilityTypeMapper.getMarkerColor(facility.type);
      markerElement.style.backgroundColor = 'white';
      markerElement.style.borderRadius = '50%';
      markerElement.style.padding = '10px'; // Increased padding
      markerElement.style.boxShadow = '0 3px 8px rgba(0,0,0,0.4)'; // Enhanced shadow
      markerElement.style.cursor = 'pointer';
      markerElement.style.display = 'flex';
      markerElement.style.justifyContent = 'center';
      markerElement.style.alignItems = 'center';
      markerElement.style.width = '44px'; // Slightly larger size
      markerElement.style.height = '44px'; // Slightly larger size
      markerElement.style.border = `2px solid ${FacilityTypeMapper.getMarkerColor(facility.type)}`;
      markerElement.style.transition = 'all 0.3s ease-in-out';
      
      // Add animation for newly created markers
      markerElement.style.animation = 'markerPulse 1.5s ease-out';
      
      // Add hover effects using event listeners
      markerElement.addEventListener('mouseover', () => {
        markerElement.style.transform = 'scale(1.1)';
        markerElement.style.boxShadow = `0 4px 12px ${FacilityTypeMapper.getMarkerColor(facility.type)}80`;
        markerElement.style.borderWidth = '3px';
      });
      
      markerElement.addEventListener('mouseout', () => {
        markerElement.style.transform = 'scale(1)';
        markerElement.style.boxShadow = '0 3px 8px rgba(0,0,0,0.4)';
        markerElement.style.borderWidth = '2px';
      });

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: {
          lat: facility.latitude,
          lng: facility.longitude
        },
        map: this.map, // Add marker directly to map
        title: facility.name,
        content: markerElement, // Use content for custom icon
      });

      // Simply emit the selected facility on click instead of showing info window
      marker.addListener('gmp-click', () => {
        this.facilitySelected.emit(facility);
      });

      return marker;
    });
  }

  // Initialize marker clusterer
  private setupMarkerClusterer(): void {
    if (this.clusterer) {
      this.clusterer.clearMarkers();
    }

    // Helper function to calculate cluster scale based on count
    const calculateScale = (count: number): number => {
      const minScale = 12;
      const maxScale = 32;
      const scale = minScale + Math.log2(count) * 4;
      return Math.min(Math.max(scale, minScale), maxScale);
    };

    // Helper function to calculate cluster opacity based on count
    const calculateOpacity = (count: number): number => {
      const baseOpacity = 0.4;
      const maxOpacity = 0.85;
      const increaseFactor = 0.003;
      return Math.min(baseOpacity + (count * increaseFactor), maxOpacity);
    };

    // Check current zoom level to determine if clustering should be active
    const currentZoom = this.map.getZoom();
    const shouldCluster = (currentZoom ?? 0) < this.zoomThreshold;
    
    // MarkerClusterer works with AdvancedMarkerElement[]
    this.clusterer = new MarkerClusterer({
      map: shouldCluster ? this.map : null, // Only add to map if below threshold
      markers: this.markers,
      algorithm: new GridAlgorithm({}),
      // Renderer uses google.maps.Marker for cluster icons
      renderer: {
        render: ({ count, position }) => {
          
          const scale = calculateScale(count);
          const opacity = calculateOpacity(count);

          return new google.maps.Marker({
            position,
            label: { text: String(count), color: "white", fontSize: '10px' },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: "#16a34a",
              fillOpacity: opacity,
              strokeWeight: 1,
              strokeColor: "#FFFFFF",
              scale: scale,
            },
            zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
          });
        },
      },
    });
    
    // Apply clustering based on current zoom
    this.handleZoomChange();
  }
}