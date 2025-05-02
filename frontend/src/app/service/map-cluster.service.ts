import { Injectable } from '@angular/core';
import { RecyclingFacility } from '../models/recycling-facility';
import { FacilityTypeMapper } from '../utils/facility-type-mapper';
import { Subject } from 'rxjs';
import { GeographicContextService } from './geographic-context.service';
import { stat } from 'fs';

// Interface for region cluster (municipality or city)
export interface RegionCluster {
  name: string;
  count: number;
  facilities: RecyclingFacility[];
  bounds: google.maps.LatLngBounds;
  center: google.maps.LatLngLiteral;
}

// Level of clustering hierarchy
export type ClusterLevel = 'province' | 'municipality' | 'city' | 'facility';

@Injectable({
  providedIn: 'root'
})
export class MapClusteringService {
  // Add a state change subject
  private stateChangeSubject = new Subject<{
    level: ClusterLevel;
    municipality: string | null;
    city: string | null;
  }>();

  public stateChanged$ = this.stateChangeSubject.asObservable();

  // Map instances
  private map: google.maps.Map | null = null;
  
  // Cluster data
  private municipalityClusters: Map<string, RegionCluster> = new Map();
  private cityClusters: Map<string, RegionCluster> = new Map();
  
  // Event handlers that component provides
  private onFacilitySelectCallback: ((facility: RecyclingFacility) => void) | null = null;

  // Reference to markers on the map
  private markers: google.maps.marker.AdvancedMarkerElement[] = [];

  private cachedFacilities: RecyclingFacility[] = [];
  private stateHistory: Array<{
    level: ClusterLevel;
    municipality: string | null;
    city: string | null;
    mapZoom?: number;
    mapBounds?: {
      north: number;
      east: number;
      south: number;
      west: number;
    };
  }> = [];

  // Zoom thresholds for automatic transitions
  private readonly ZOOM_MUNICIPALITY = 9;  // Show municipalities below this zoom
  private readonly ZOOM_CITY = 11;         // Show cities between this and municipality zoom
  private readonly ZOOM_FACILITY = 13;     // Show facilities above this zoom

  constructor(private geographicContextService: GeographicContextService) {
    // Subscribe to context changes to update clustering accordingly
    this.geographicContextService.context$.subscribe(context => {
      // Only respond to context changes if we have a map and facilities
      if (!this.map || this.cachedFacilities.length === 0) return;
      
      // Based on the context level, update our internal state
      let updateNeeded = false;
      
      switch(context.level) {
        case 'province':
          updateNeeded = this.currentLevel !== 'province';
          this.currentLevel = 'province';
          this.selectedMunicipality = null;
          this.selectedCity = null;
          break;
        case 'municipality':
          updateNeeded = 
            this.currentLevel !== 'municipality' || 
            this.selectedMunicipality !== context.municipalityName;
          this.currentLevel = 'municipality';
          this.selectedMunicipality = context.municipalityName || null;
          this.selectedCity = null;
          break;
        case 'city':
          updateNeeded = 
            this.currentLevel !== 'city' || 
            this.selectedCity !== context.cityName;
          this.currentLevel = 'city';
          this.selectedMunicipality = context.municipalityName || null;
          this.selectedCity = context.cityName || null;
          break;
        case 'facility':
          // For facility level, we keep the city context
          updateNeeded = 
            this.currentLevel !== 'facility';
          this.currentLevel = 'facility';
          this.selectedMunicipality = context.municipalityName || null;
          this.selectedCity = context.cityName || null;
          break;
      }
      
      if (updateNeeded) {
        this.applyClusteringToFacilities(this.cachedFacilities);
      }
    });
  }

  // Current view state (internal to clustering service)
  private currentLevel: ClusterLevel = 'province';
  private selectedMunicipality: string | null = null;
  private selectedCity: string | null = null;

  /**
   * Initialize the clustering service with a map instance
   */
  initialize(
    map: google.maps.Map,
    onFacilitySelect: (facility: RecyclingFacility) => void
  ): void {
    this.map = map;
    this.onFacilitySelectCallback = onFacilitySelect;

    // Set initial state to province level
    this.currentLevel = 'province';
    this.selectedMunicipality = null;
    this.selectedCity = null;

    // Update context service to match
    this.geographicContextService.goToProvince();

    // Add zoom listener to handle dynamic clustering based on zoom level
    map.addListener('zoom_changed', () => {
      const zoom = map.getZoom();
      console.log('Map zoom changed:', zoom);
      this.handleZoomChange(zoom);
    });
  }
  

  /**
   * Reset clustering state
   */
  reset(): void {
    this.clearMarkers();
    this.currentLevel = 'province';
    this.selectedMunicipality = null;
    this.selectedCity = null;
    this.municipalityClusters.clear();
    this.cityClusters.clear();
    
    // Reset context in the service
    this.geographicContextService.goToProvince();
  }

  /**
   * Clear all current markers from the map
   */
  clearMarkers(): void {
    this.markers.forEach(marker => marker.map = null);
    this.markers = [];
    
    // Also clear any controls we've added
    if (this.map) {
      this.map.controls[google.maps.ControlPosition.TOP_LEFT].clear();
    }
  }

  /**
   * Apply clustering to the provided facilities
   */
  applyClusteringToFacilities(facilities: RecyclingFacility[]): void {
    // Cache facilities if provided (non-empty array)
    if (facilities.length > 0) {
      this.cachedFacilities = [...facilities];
    }

    // Use cached facilities if empty array was passed
    const facilitiesToUse = facilities.length > 0 ? facilities : this.cachedFacilities;

    this.clearMarkers();

    switch (this.currentLevel) {
      case 'province':
        this.processMunicipalityClusters(facilitiesToUse);
        this.showMunicipalityClusters();
        break;
      case 'municipality':
        if (this.selectedMunicipality) {
          this.processCityClusters(facilitiesToUse, this.selectedMunicipality);
          this.showCityClusters();
        }
        break;
      case 'city':
      case 'facility':
        if (this.selectedMunicipality && this.selectedCity) {
          this.showFacilitiesInCity(facilitiesToUse);
        }
        break;
    }
  }

  /**
   * Handle zoom changes to show appropriate level of detail
   */
  handleZoomChange(zoom: number | undefined): boolean {
  if (!this.map || zoom === undefined) return false;

  console.log('Handling zoom change:', zoom, 'Current level:', this.currentLevel);

  // Store current state before potential changes
  const prevState = {
    level: this.currentLevel,
    municipality: this.selectedMunicipality,
    city: this.selectedCity
  };

  let stateChanged = false;

  // Determine new level based on zoom
  if (zoom <= this.ZOOM_MUNICIPALITY) {
    // Low zoom - show municipalities
    if (this.currentLevel !== 'province') {
      console.log('Zoom level indicates province view, current level:', this.currentLevel);
      this.storeStateInHistory();
      this.currentLevel = 'province';
      this.selectedMunicipality = null;
      this.selectedCity = null;
      
      // Update context service
      this.geographicContextService.goToProvince();
      stateChanged = true;
    }
  } else if (zoom <= this.ZOOM_CITY) {
    // Medium zoom - if we have a selected municipality, show cities
    if (this.currentLevel === 'facility' || (this.currentLevel === 'province' && this.cachedFacilities.length > 0)) {
      console.log('Zoom level indicates municipality view, current level:', this.currentLevel);
      
      if (this.currentLevel === 'facility') {
        // Going from facility to city level
        this.storeStateInHistory();
        this.currentLevel = 'city';
        
        // Update context service
        if (this.selectedCity && this.selectedMunicipality) {
          this.geographicContextService.goToCity(this.selectedCity);
          stateChanged = true;
        }
      } else if (this.currentLevel === 'province') {
        // When zooming in from province view, try to determine a municipality based on map center
        this.storeStateInHistory();
        
        // Find the closest municipality to the center of the map
        const center = this.map.getCenter();
        if (center && this.municipalityClusters.size > 0) {
          let closestMunicipality = null;
          let closestDistance = Infinity;
          
          this.municipalityClusters.forEach((cluster, municipalityName) => {
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
              center,
              new google.maps.LatLng(cluster.center.lat, cluster.center.lng)
            );
            
            if (distance < closestDistance) {
              closestDistance = distance;
              closestMunicipality = municipalityName;
            }
          });
          
          if (closestMunicipality) {
            this.selectedMunicipality = closestMunicipality;
            this.currentLevel = 'municipality';
            this.geographicContextService.goToMunicipality(closestMunicipality);
            stateChanged = true;
          }
        }
      }
    }
  } else if (zoom > this.ZOOM_FACILITY) {
    // High zoom - if we have a selected municipality, show detailed view
    if ((this.currentLevel === 'city' || this.currentLevel === 'municipality') && 
        this.selectedMunicipality && this.cachedFacilities.length > 0) {
      console.log('Zoom level indicates facility view, current level:', this.currentLevel);
      this.storeStateInHistory();
      
      if (this.currentLevel === 'city' && this.selectedCity) {
        // If we have a city, transition to facility view for that city
        this.currentLevel = 'facility';
        this.geographicContextService.goToCity(this.selectedCity);
        stateChanged = true;
      } else if (this.currentLevel === 'municipality') {
        // Try to determine a city based on map center
        const center = this.map.getCenter();
        if (center && this.cityClusters.size > 0) {
          let closestCity = null;
          let closestDistance = Infinity;
          
          this.cityClusters.forEach((cluster, cityName) => {
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
              center,
              new google.maps.LatLng(cluster.center.lat, cluster.center.lng)
            );
            
            if (distance < closestDistance) {
              closestDistance = distance;
              closestCity = cityName;
            }
          });
          
          if (closestCity) {
            this.selectedCity = closestCity;
            this.currentLevel = 'city';
            this.geographicContextService.goToCity(closestCity);
            stateChanged = true;
          }
        }
      }
    }
  }

  // If the state changed, apply clustering
  if (stateChanged || prevState.level !== this.currentLevel ||
    prevState.municipality !== this.selectedMunicipality ||
    prevState.city !== this.selectedCity) {
    console.log('State changed, applying clustering. New state:', 
      this.currentLevel, this.selectedMunicipality, this.selectedCity);
    this.applyClusteringToFacilities(this.cachedFacilities);
    this.emitStateChange();
    return true; // Indicate state change occurred
  }

  return false; // No state change
}

  /**
   * Store current state in history before changing
   */
  private storeStateInHistory(): void {
    if (!this.map) return;
  
    const currentBounds = this.map.getBounds();
    const currentZoom = this.map.getZoom();
    
    this.stateHistory.push({
      level: this.currentLevel,
      municipality: this.selectedMunicipality,
      city: this.selectedCity,
      mapZoom: currentZoom !== undefined ? currentZoom : undefined,
      mapBounds: currentBounds ? {
        north: currentBounds.getNorthEast().lat(),
        east: currentBounds.getNorthEast().lng(),
        south: currentBounds.getSouthWest().lat(),
        west: currentBounds.getSouthWest().lng()
      } : undefined
    });
    
    // Limit history size to prevent memory issues
    if (this.stateHistory.length > 10) {
      this.stateHistory.shift();
    }
  }
  
  /**
   * Get current clustering state
   */
  getClusteringState(): {
    level: ClusterLevel;
    municipality: string | null;
    city: string | null;
  } {
    return {
      level: this.currentLevel,
      municipality: this.selectedMunicipality,
      city: this.selectedCity
    };
  }

  /**
   * Process facilities and group them by municipality
   */
  private processMunicipalityClusters(facilities: RecyclingFacility[]): void {
    this.municipalityClusters.clear();
    
    facilities.forEach(facility => {
      if (!facility.municipality) return; // Skip if no municipality data
      
      if (!this.municipalityClusters.has(facility.municipality)) {
        // Create new municipality cluster
        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: facility.latitude, lng: facility.longitude });
        
        this.municipalityClusters.set(facility.municipality, {
          name: facility.municipality,
          count: 1,
          facilities: [facility],
          bounds: bounds,
          center: { lat: facility.latitude, lng: facility.longitude }
        });
      } else {
        // Update existing municipality cluster
        const cluster = this.municipalityClusters.get(facility.municipality)!;
        cluster.count++;
        cluster.facilities.push(facility);
        cluster.bounds.extend({ lat: facility.latitude, lng: facility.longitude });
        
        // Recalculate center
        const center = cluster.bounds.getCenter();
        cluster.center = { lat: center.lat(), lng: center.lng() };
      }
    });
  }

  /**
   * Process facilities within a municipality and group them by city
   */
  private processCityClusters(facilities: RecyclingFacility[], municipalityName: string): void {
    this.cityClusters.clear();
    
    // Get facilities in the selected municipality
    const facilitiesInMunicipality = facilities.filter(
      f => f.municipality === municipalityName
    );
    
    facilitiesInMunicipality.forEach(facility => {
      if (!facility.city) return; // Skip if no city data
      
      if (!this.cityClusters.has(facility.city)) {
        // Create new city cluster
        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: facility.latitude, lng: facility.longitude });
        
        this.cityClusters.set(facility.city, {
          name: facility.city,
          count: 1,
          facilities: [facility],
          bounds: bounds,
          center: { lat: facility.latitude, lng: facility.longitude }
        });
      } else {
        // Update existing city cluster
        const cluster = this.cityClusters.get(facility.city)!;
        cluster.count++;
        cluster.facilities.push(facility);
        cluster.bounds.extend({ lat: facility.latitude, lng: facility.longitude });
        
        // Recalculate center
        const center = cluster.bounds.getCenter();
        cluster.center = { lat: center.lat(), lng: center.lng() };
      }
    });
  }

  /**
   * Display municipality level clusters
   */
  private showMunicipalityClusters(): void {
    if (!this.map) return;
    
    // Create markers for each municipality cluster
    this.municipalityClusters.forEach((cluster, municipalityName) => {
      const markerElement = this.createClusterMarkerElement(
        municipalityName, 
        cluster.count, 
        '#16a34a', // Changed to green (was blue #2563eb)
        'fa-building'
      );
      
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: cluster.center,
        map: this.map,
        title: `${municipalityName} (${cluster.count} facilities)`,
        content: markerElement
      });
      
      // Handle click to zoom into municipality
      marker.addListener('gmp-click', () => {
        if (!this.map) return;

        // Store current state before changing
        this.storeStateInHistory();

        this.selectedMunicipality = municipalityName;
        this.currentLevel = 'municipality';

        // Zoom to municipality bounds
        this.map.fitBounds(cluster.bounds, 50); // 50px padding

        // Update context service
        this.geographicContextService.goToMunicipality(municipalityName);

        // Notify about state change
        this.emitStateChange();

        // Apply clustering with cached facilities
        this.applyClusteringToFacilities([]);
      });
      
      this.markers.push(marker);
    });
  }

  private emitStateChange() {
    this.stateChangeSubject.next({
      level: this.currentLevel,
      municipality: this.selectedMunicipality,
      city: this.selectedCity
    });
  }

  /**
   * Display city level clusters for selected municipality
   */
  private showCityClusters(): void {
    if (!this.map || !this.selectedMunicipality) return;
    
    // Create markers for each city cluster
    this.cityClusters.forEach((cluster, cityName) => {
      const markerElement = this.createClusterMarkerElement(
        cityName, 
        cluster.count, 
        '#22c55e', // Lighter green for cities to maintain distinction
        'fa-city'
      );
      
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: cluster.center,
        map: this.map,
        title: `${cityName} (${cluster.count} facilities)`,
        content: markerElement
      });
      
      // Handle click to zoom into city
      marker.addListener('gmp-click', () => {
        if (!this.map) return;

        // Store current state before changing
        this.storeStateInHistory();

        this.selectedCity = cityName;
        this.currentLevel = 'city';

        // Zoom to city bounds
        this.map.fitBounds(cluster.bounds, 50); // 50px padding

        // Update context service
        this.geographicContextService.goToCity(cityName);

        // Notify about state change
        this.emitStateChange();

        // Apply clustering with cached facilities
        this.applyClusteringToFacilities([]);
      });
      
      this.markers.push(marker);
    });
    
    // Add back button to return to municipality level
    this.addBackButton(() => this.goBack());
  }

  /**
   * Display individual facilities in selected city
   */
  private showFacilitiesInCity(facilities: RecyclingFacility[]): void {
    if (!this.map || !this.selectedMunicipality || !this.selectedCity) return;
    
    // Filter facilities by selected city and municipality
    const facilitiesInCity = facilities.filter(
      f => f.municipality === this.selectedMunicipality && f.city === this.selectedCity
    );
    
    // Get current zoom level
    const currentZoom = this.map.getZoom();
    
    // Only show markers if zoom is between 11 and 14
    if (currentZoom === undefined || currentZoom < 11 || currentZoom > 14) {
      // Add back button but don't show markers if outside zoom range
      this.addBackButton(() => this.goBack());
      return;
    }
    
    // Create markers for individual facilities
    facilitiesInCity.forEach(facility => {
      const marker = this.createFacilityMarker(facility);
      this.markers.push(marker);
    });
    
    // Add back button to return to city level
    this.addBackButton(() => this.goBack());
  }

  /**
   * Create a styled marker element for clusters
   */
  private createClusterMarkerElement(
    name: string, 
    count: number, 
    color: string,
    icon: string = 'fa-map-marker-alt'
  ): HTMLElement {
    // Implementation unchanged
    const element = document.createElement('div');
    
    // Calculate size based on count (logarithmic scale)
    // Min size 60px, then scales up based on count
    const baseSize = 30;
    const sizeIncrement = 30;
    // Using logarithmic scale to prevent extremely large circles
    const size = baseSize + (Math.log10(count + 1) * sizeIncrement);
    
    // Calculate opacity based on count (0.65 to 0.9 range)
    const baseOpacity = 0.5;
    const maxOpacity = 0.85;
    // Normalize opacity based on count tiers
    const opacity = baseOpacity + Math.min(count / 35, 1) * (maxOpacity - baseOpacity);
    
    element.innerHTML = `
      <div class="cluster-content">
        <div class="cluster-name">${name}</div>
        <div class="cluster-count">${count}</div>
      </div>
    `;
    
    element.className = 'cluster-marker';
    element.style.backgroundColor = color;
    element.style.opacity = opacity.toString();
    element.style.color = 'white';
    element.style.borderRadius = '50%'; // Make it circular
    element.style.width = `${size}px`;
    element.style.height = `${size}px`;
    element.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    element.style.fontSize = '10px';
    element.style.display = 'flex';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'center';
    element.style.textAlign = 'center';
    element.style.cursor = 'pointer';
    element.style.transition = 'all 0.2s ease-in-out';
    element.style.border = `2px solid ${color}`;
    
    // Style the inner content
    const content = element.querySelector('.cluster-content') as HTMLElement;
    if (content) {
      content.style.display = 'flex';
      content.style.flexDirection = 'column';
      content.style.alignItems = 'center';
      content.style.justifyContent = 'center';
      content.style.lineHeight = '1.2';
      content.style.padding = '5px';
    }
    
    // Style the name
    const nameElement = element.querySelector('.cluster-name') as HTMLElement;
    if (nameElement) {
      nameElement.style.fontSize = count > 30 ? '12px' : '10px';
      nameElement.style.whiteSpace = 'nowrap';
      nameElement.style.overflow = 'hidden';
      nameElement.style.textOverflow = 'ellipsis';
      nameElement.style.maxWidth = `${size - 20}px`;
    }
    
    // Style the count
    const countElement = element.querySelector('.cluster-count') as HTMLElement;
    if (countElement) {
      countElement.style.fontSize = count > 30 ? '18px' : '16px';
      countElement.style.fontWeight = 'bold';
    }
    
    // Add hover effect
    element.addEventListener('mouseover', () => {
      element.style.transform = 'scale(1.05)';
      element.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
      element.style.opacity = '1';
      element.style.zIndex = '1000';
    });
    
    element.addEventListener('mouseout', () => {
      element.style.transform = 'scale(1)';
      element.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
      element.style.opacity = opacity.toString();
      element.style.zIndex = 'auto';
    });
    
    return element;
  }

  /**
   * Create individual facility marker with dynamic sizing
   */
  private createFacilityMarker(facility: RecyclingFacility): google.maps.marker.AdvancedMarkerElement {
    if (!this.map) throw new Error("Map not initialized");
    
    const markerElement = document.createElement('div');
    
    // Get the current zoom level
    const currentZoom = this.map.getZoom();
    
    // Calculate size based on zoom level (smaller at lower zoom levels)
    let markerSize: number;
    if (!currentZoom || currentZoom === 11) {
      markerSize = 22; // Very small at zoom level 11
    } else if (currentZoom === 12) {
      markerSize = 26; // Slightly larger at zoom level 12
    } else if (currentZoom === 13) {
      markerSize = 30; // Medium size at zoom level 13
    } else {
      markerSize = 34; // Largest at zoom level 14
    }
    
    // Using the FacilityTypeMapper
    const markerColor = FacilityTypeMapper.getMarkerColor(facility.type);
    const markerIcon = FacilityTypeMapper.getFontAwesomeIcon(facility.type);
    
    // Create a glyph-based marker with improved styling
    markerElement.innerHTML = `
      <div class="marker-pulse"></div>
      <i class="${markerIcon}" aria-hidden="true"></i>
    `;
    
    markerElement.className = 'facility-marker';
    markerElement.style.fontSize = `${Math.max(12, markerSize/2)}px`;
    markerElement.style.color = markerColor;
    markerElement.style.backgroundColor = 'white';
    markerElement.style.borderRadius = '50%';
    markerElement.style.width = `${markerSize}px`;
    markerElement.style.height = `${markerSize}px`;
    markerElement.style.padding = `${markerSize/10}px`;
    markerElement.style.boxShadow = '0 3px 8px rgba(0,0,0,0.4)';
    markerElement.style.cursor = 'pointer';
    markerElement.style.display = 'flex';
    markerElement.style.justifyContent = 'center';
    markerElement.style.alignItems = 'center';
    markerElement.style.border = `2px solid ${markerColor}`;
    markerElement.style.transition = 'all 0.3s ease';
    markerElement.style.position = 'relative';
    markerElement.style.zIndex = '1';
    
    // Style the pulse animation
    const pulse = markerElement.querySelector('.marker-pulse') as HTMLElement;
    if (pulse) {
      pulse.style.position = 'absolute';
      pulse.style.top = '0';
      pulse.style.left = '0';
      pulse.style.right = '0';
      pulse.style.bottom = '0';
      pulse.style.borderRadius = '50%';
      pulse.style.border = `2px solid ${markerColor}`;
      pulse.style.opacity = '0';
      pulse.style.transform = 'scale(1)';
      pulse.style.animation = 'pulse 2s infinite';
    }
    
    // Add CSS animation for the pulse effect
    if (!document.getElementById('marker-animations')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'marker-animations';
      styleSheet.textContent = `
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          70% {
            transform: scale(1.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(styleSheet);
    }
    
    // Enhanced hover effects
    markerElement.addEventListener('mouseover', () => {
      markerElement.style.transform = 'scale(1.15) translateY(-5px)';
      markerElement.style.boxShadow = `0 6px 16px rgba(0,0,0,0.3), 0 0 8px ${markerColor}80`;
      markerElement.style.borderWidth = '3px';
      markerElement.style.zIndex = '100';
    });
    
    markerElement.addEventListener('mouseout', () => {
      markerElement.style.transform = 'scale(1) translateY(0)';
      markerElement.style.boxShadow = '0 3px 8px rgba(0,0,0,0.4)';
      markerElement.style.borderWidth = '2px';
      markerElement.style.zIndex = '1';
    });

    // Add a tooltip showing facility name on hover
    const tooltip = document.createElement('div');
    tooltip.className = 'facility-tooltip';
    tooltip.textContent = facility.name;
    tooltip.style.position = 'absolute';
    tooltip.style.bottom = '100%';
    tooltip.style.left = '50%';
    tooltip.style.transform = 'translateX(-50%)';
    tooltip.style.backgroundColor = 'rgba(0,0,0,0.8)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '5px 10px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '12px';
    tooltip.style.whiteSpace = 'nowrap';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.opacity = '0';
    tooltip.style.transition = 'opacity 0.2s ease';
    tooltip.style.marginBottom = '5px';
    tooltip.style.zIndex = '2';
    
    markerElement.appendChild(tooltip);
    
    markerElement.addEventListener('mouseover', () => {
      tooltip.style.opacity = '1';
    });
    
    markerElement.addEventListener('mouseout', () => {
      tooltip.style.opacity = '0';
    });

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: {
        lat: facility.latitude,
        lng: facility.longitude
      },
      map: this.map,
      title: facility.name,
      content: markerElement,
    });

    // Update marker size when zoom changes and hide/show based on zoom level
    this.map.addListener('zoom_changed', () => {
      if (!this.map) return;
      const newZoom = this.map.getZoom();
      if (newZoom === undefined) return;
      
      // Only show markers between zoom levels 11 and 14
      if (newZoom < 11 || newZoom > 14) {
        marker.map = null; // Hide marker
        return;
      } else {
        marker.map = this.map; // Show marker
      }
      
      // Recalculate marker size
      let newSize: number;
      if (newZoom === 11) {
        newSize = 22;
      } else if (newZoom === 12) {
        newSize = 26;
      } else if (newZoom === 13) {
        newSize = 30;
      } else {
        newSize = 34;
      }
      
      // Update the marker size
      markerElement.style.width = `${newSize}px`;
      markerElement.style.height = `${newSize}px`;
      markerElement.style.fontSize = `${Math.max(12, newSize/2)}px`;
    });

    // Emit the selected facility on click
    marker.addListener('gmp-click', () => {
      if (this.onFacilitySelectCallback) {
        this.onFacilitySelectCallback(facility);
        
        // Update context to facility level
        this.geographicContextService.updateContext({
          level: 'facility',
          facilityId: facility.id
        });
      }
    });

    return marker;
  }

  /**
   * Add back button to the map
   */
  private addBackButton(clickHandler: () => void): void {
    if (!this.map) return;

    const backButton = document.createElement('button');
    backButton.textContent = '← Back';
    backButton.className = 'back-button';
    backButton.style.backgroundColor = '#ffffff';
    backButton.style.border = '1px solid #dddddd';
    backButton.style.borderRadius = '4px';
    backButton.style.padding = '8px 12px';
    backButton.style.margin = '10px';
    backButton.style.cursor = 'pointer';
    backButton.style.fontSize = '14px';
    backButton.style.fontWeight = 'bold';
    backButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

    backButton.addEventListener('click', clickHandler);

    const backButtonContainer = document.createElement('div');
    backButtonContainer.appendChild(backButton);

    this.map.controls[google.maps.ControlPosition.TOP_LEFT].clear();
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(backButtonContainer);
  }

  /**
   * Go back to previous clustering state
   * @returns true if navigation was successful, false otherwise
   */
  goBack(): boolean {
    // First try to use the geographic context service's goBack method
    const navigationSuccessful = this.geographicContextService.goBack();
    
    if (navigationSuccessful) {
      return true;
    }
    
    // Fall back to the old history-based approach if needed
    if (this.stateHistory.length === 0) return false;

    // Get the previous state
    const previousState = this.stateHistory.pop();

    if (!previousState) return false;

    // Restore previous state
    this.currentLevel = previousState.level;
    this.selectedMunicipality = previousState.municipality;
    this.selectedCity = previousState.city;

    // Update the context service to reflect these changes
    if (previousState.level === 'province') {
      this.geographicContextService.goToProvince();
    } else if (previousState.level === 'municipality' && previousState.municipality) {
      this.geographicContextService.goToMunicipality(previousState.municipality);
    } else if (previousState.level === 'city' && previousState.city) {
      this.geographicContextService.goToCity(previousState.city);
    }

    // Apply clustering with cached facilities
    this.applyClusteringToFacilities(this.cachedFacilities);

    // Restore map view (with slight delay to ensure markers are ready)
    setTimeout(() => {
      if (!this.map) return;

      // If we have bounds, use them
      if (previousState.mapBounds) {
        const bounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(previousState.mapBounds.south, previousState.mapBounds.west), // southwest corner
          new google.maps.LatLng(previousState.mapBounds.north, previousState.mapBounds.east)  // northeast corner
        );
        this.map.fitBounds(bounds);
      }
      // Otherwise if we have zoom level, use that
      else if (previousState.mapZoom !== undefined) {
        this.map.setZoom(previousState.mapZoom);
      }
    }, 100);

    this.emitStateChange();

    return true;
  }
  
  /**
   * Check if there's state history available to go back to
   */
  hasHistory(): boolean {
    return this.stateHistory.length > 0;
  }
}