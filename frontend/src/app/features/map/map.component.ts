import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacilityMapComponent } from './components/facility-map/facility-map.component';
import { InfoWindowComponent } from './components/info-window/info-window.component';
import { MapControlsComponent } from './components/map-controls/map-controls.component';
import { RecyclingFacility } from '../../models/recycling-facility';
import { HeaderNavComponent } from '../../shared/components/header-nav/header-nav.component';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    CommonModule, 
    FacilityMapComponent, 
    InfoWindowComponent, 
    MapControlsComponent,
    HeaderNavComponent
  ],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent {
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

  onFacilitySelected(facility: RecyclingFacility): void {
    this.selectedFacility = facility;
    this.showInfoWindow = true;
  }

  onCloseInfoWindow(): void {
    this.showInfoWindow = false;
  }

  onFiltersChanged(filters: any): void {
    this.activeFilters = filters;
  }

  onFacilitiesUpdated(facilities: RecyclingFacility[]): void {
    this.facilities = facilities;
  }
}