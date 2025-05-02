import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FacilityMapComponent } from './components/facility-map/facility-map.component';
import { MapControlsComponent } from './components/map-controls/map-controls.component';
import { RecyclingFacility } from '../../models/recycling-facility';
import { HeaderNavComponent } from '../../shared/components/header-nav/header-nav.component';
import { MapInfoWindowComponent } from './components/map-info-window/map-info-window.component';
import { MapClusteringService } from '../../service/map-cluster.service';
import { GeographicContextService } from '../../service/geographic-context.service';
import { FacilityService } from '../../service/facility.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    CommonModule, 
    FacilityMapComponent, 
    MapControlsComponent,
    MapInfoWindowComponent,
    HeaderNavComponent,
  ],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {
  // Define map-specific navigation items
  mapNavItems = [
    { href: '/map', icon: 'fas fa-map', label: 'Map' },
    { href: '/map/lookup', icon: 'fas fa-search', label: 'LookUp' },
    { href: '/map/analytics', icon: 'fas fa-chart-pie', label: 'Analytics' },
  ];

  // Define map-specific page descriptions
  mapPageDescriptions = {
    'map': 'Explore the map to find recycling facilities and waste management locations near you.',
    'lookup': 'Use the lookup feature to find specific recycling facilities or waste management services.',
    'analytics': 'View analytics on recycling facility performance and waste management metrics.'
  };

  selectedFacility: RecyclingFacility | null = null;
  showInfoWindow = false;
  activeFilters: any = {
    types: [],
    materials: [],
    radius: null,
    userLocation: null,
    sortBy: null
  }

  // Add a facilities property to pass to the facility-map component
  facilities: RecyclingFacility[] = [];
  
  // Add the missing currentMapView property
  currentMapView: any = {
    zoom: 8,
    center: { lat: 0, lng: 0 },
    activeClusters: [],
    visibleFacilities: []
  };

  // Add subscriptions for services
  private contextSubscription?: Subscription;
  private facilitiesSubscription?: Subscription;

  constructor(
    public clusteringService: MapClusteringService,
    private geographicContextService: GeographicContextService,
    private facilityService: FacilityService,
  ) {}

  ngOnInit() {
    // Subscribe to context updates
    this.contextSubscription = this.geographicContextService.context$.subscribe(context => {
      console.log('Map component received context update:', context);
      
      // When we're at facility level, show the info window for the selected facility
      if (context.level === 'facility' && context.facilityId) {
        const facility = this.facilities.find(f => f.id === context.facilityId);
        if (facility) {
          this.selectedFacility = facility;
          this.showInfoWindow = true;
        }
      }
    });

    this.geographicContextService.goToProvince();

    this.loadAllFacilities();
  }

    loadAllFacilities() {
    console.log('Loading all facilities');
    this.facilitiesSubscription = this.facilityService.getAllFacilities()
      .subscribe({
        next: (facilities) => {
          console.log(`Loaded ${facilities.length} facilities`);
          this.facilities = facilities;
          
          // Update the map view context with the new facilities
          this.updateMapViewContext({
            visibleFacilities: facilities,
            clusters: [],
            zoom: this.currentMapView.zoom,
            center: this.currentMapView.center
          });
        },
        error: (error) => {
          console.error('Error loading facilities:', error);
          // Load sample data as fallback if API fails
        }
      });
  }

  ngOnDestroy() {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }
    if (this.facilitiesSubscription) {
      this.facilitiesSubscription.unsubscribe();
    }
  }

  onFacilitySelected(facility: RecyclingFacility): void {
    this.selectedFacility = facility;
    this.showInfoWindow = true;
    
    // Update context to facility level
    if (facility.id) {
      this.geographicContextService.updateContext({
        level: 'facility',
        facilityId: facility.id,
        municipalityName: facility.municipality,
        cityName: facility.city
      });
    }
  }

  onCloseInfoWindow(): void {
    this.showInfoWindow = false;
    
    // When closing info window, go back to city level if we were at facility level
    const currentContext = this.geographicContextService.getCurrentContext();
    if (currentContext.level === 'facility' && currentContext.cityName) {
      this.geographicContextService.goToCity(currentContext.cityName);
    }
  }

  onFiltersChanged(filters: any): void {
    this.activeFilters = filters;
  }

  onFacilitiesUpdated(facilities: RecyclingFacility[]): void {
    this.facilities = facilities;
  }
  
  // Add the missing updateMapViewContext method
  updateMapViewContext(clusteringState: any): void {
    this.currentMapView = {
      ...this.currentMapView,
      ...clusteringState,
      activeClusters: clusteringState.clusters || [],
      visibleFacilities: clusteringState.visibleFacilities || []
    };
  }
}