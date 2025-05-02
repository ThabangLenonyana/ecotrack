import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecyclingFacility } from '../../../../models/recycling-facility';
import { FacilityTypeMapper } from '../../../../utils/facility-type-mapper';
import { GeographicContextService, GeographicContext } from '../../../../service/geographic-context.service';
import { Subscription } from 'rxjs';

interface MetricType {
  type: string;
  count: number;
}

interface MetricMaterial {
  name: string;
  count: number;
}

interface MetricLocation {
  name: string;
  count: number;
}

@Component({
  selector: 'app-map-info-window',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-info-window.component.html',
  styleUrls: ['./map-info-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapInfoWindowComponent implements OnInit, OnChanges {
  @Input() facilities: RecyclingFacility[] = [];
  @Input() currentView: any = {
    level: 'province',
    zoom: 8,
    center: { lat: 0, lng: 0 },
    activeClusters: [],
    visibleFacilities: []
  };
  
  visible = true;
  totalFacilities = 0;
  facilityTypes: MetricType[] = [];
  topMaterials: MetricMaterial[] = [];
  // Rename to match the template
  citiesDistribution: MetricLocation[] = [];
  filteredFacilities: RecyclingFacility[] = [];
  
  // Current geographic context
  currentContext: GeographicContext = {
    level: 'province',
    provinceName: 'Gauteng'
  };

  expandedSections = {
    locations: false,
    materials: false,
    types: false
  };
  
  private contextSubscription?: Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    private geographicContextService: GeographicContextService
  ) {}

  ngOnInit(): void {
    // Subscribe to context changes
    this.contextSubscription = this.geographicContextService.context$.subscribe(context => {
      console.log('MapInfoWindow received context update:', context);
      this.currentContext = context;
      this.filterFacilitiesByCurrentContext();
      this.calculateMetrics();
      this.cdr.markForCheck();
    });
    
    // Log facility metadata on first load
    if (this.facilities.length > 0) {
      this.logFacilitiesMetadata();
    }
  }
  
  ngOnDestroy(): void {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('MapInfoWindow changes:', changes);

    // Log facility metadata when facilities update
    if (changes['facilities'] && changes['facilities'].firstChange) {
      this.logFacilitiesMetadata();
    }
    
    if (changes['facilities'] || changes['currentView']) {
      console.log('Filtering facilities by context:', this.currentContext);
      this.filterFacilitiesByCurrentContext();
      this.calculateMetrics();
      this.cdr.markForCheck();
    }
  }

  filterFacilitiesByCurrentContext(): void {
    console.log('Filtering facilities by context level:', this.currentContext.level);

    // Filter facilities based on the current context
    switch (this.currentContext.level) {
      case 'province':
        // For province level, use all facilities (assuming all are in the current province)
        this.filteredFacilities = [...this.facilities];
        console.log(`Showing all ${this.filteredFacilities.length} facilities for province view`);
        break;

      case 'municipality':
        // Filter facilities by selected municipality - case insensitive comparison
        this.filteredFacilities = this.facilities.filter(facility => {
          // Some facilities might have municipality as null or undefined
          if (!facility.municipality) return false;
          
          const municipalityName = this.currentContext.municipalityName || '';
          return facility.municipality.toLowerCase() === municipalityName.toLowerCase();
        });
        console.log(`Found ${this.filteredFacilities.length} facilities in municipality: ${this.currentContext.municipalityName}`);
        break;

      case 'city':
      case 'facility': // For facility view, still show city-level stats
        // Filter facilities by selected city - case insensitive comparison
        this.filteredFacilities = this.facilities.filter(facility => {
          // Some facilities might have city as null or undefined
          if (!facility.city) return false;
          
          const cityName = this.currentContext.cityName || '';
          return facility.city.toLowerCase() === cityName.toLowerCase();
        });
        console.log(`Found ${this.filteredFacilities.length} facilities in city: ${this.currentContext.cityName}`);
        break;
    }

    // Just in case there's no match, log a warning
    if (this.filteredFacilities.length === 0 && this.facilities.length > 0) {
      console.warn('No facilities matched the current context!');
      console.log('Available facilities municipalities:',
        [...new Set(this.facilities.map(f => f.municipality).filter(Boolean))]);
      console.log('Available facilities cities:',
        [...new Set(this.facilities.map(f => f.city).filter(Boolean))]);
    }
  }

  calculateMetrics(): void {
    this.totalFacilities = this.filteredFacilities.length;
    this.calculateFacilityTypes();
    this.calculateTopMaterials();
    this.calculateLocationDistribution();
  }

  calculateFacilityTypes(): void {
    // Group facilities by type
    const typeCount: { [key: string]: number } = {};
    
    this.filteredFacilities.forEach(facility => {
      const type = facility.type || 'Unknown';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    // Convert to array and sort by count
    this.facilityTypes = Object.entries(typeCount)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }

  calculateTopMaterials(): void {
    // Count facilities that accept each material
    const materialsCount: { [key: string]: number } = {};
    
    this.filteredFacilities.forEach(facility => {
      if (!facility.acceptedMaterials) return;
      
      Object.entries(facility.acceptedMaterials).forEach(([material, accepted]) => {
        if (accepted) {
          materialsCount[material] = (materialsCount[material] || 0) + 1;
        }
      });
    });

    // Convert to array and get top 5
    this.topMaterials = Object.entries(materialsCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  calculateLocationDistribution(): void {
    // The field we group by depends on the current context level
    switch (this.currentContext.level) {
      case 'province':
        // Group by municipality when at province level
        this.calculateMunicipalityDistribution();
        break;
        
      case 'municipality':
        // Group by city when at municipality level
        this.calculateCityDistribution();
        break;
        
      case 'city':
      case 'facility':
        // Group by neighborhood or area when at city level
        this.calculateNeighborhoodDistribution();
        break;
    }
  }
  
  calculateMunicipalityDistribution(): void {
    // Extract municipalities from facilities
    const municipalityCount: { [key: string]: number } = {};
    
    this.filteredFacilities.forEach(facility => {
      const municipality = facility.municipality || 'Unknown';
      municipalityCount[municipality] = (municipalityCount[municipality] || 0) + 1;
    });

    // Convert to array and get top 5
    this.citiesDistribution = Object.entries(municipalityCount) // Updated property name
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  calculateCityDistribution(): void {
    // Extract cities from facilities
    const cityCount: { [key: string]: number } = {};
    
    this.filteredFacilities.forEach(facility => {
      const city = facility.city || 'Unknown';
      cityCount[city] = (cityCount[city] || 0) + 1;
    });

    // Convert to array and get top 5
    this.citiesDistribution = Object.entries(cityCount) // Updated property name
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  calculateNeighborhoodDistribution(): void {
    // Extract neighborhoods/areas from addresses
    const areaCount: { [key: string]: number } = {};
    
    this.filteredFacilities.forEach(facility => {
      if (!facility.address) return;
      
      // Simplified approach to extract neighborhood from address
      const addressParts = facility.address.split(',');
      let neighborhood = 'Unknown';
      
      if (addressParts.length > 0) {
        // Try to get the first part as neighborhood/street
        const potentialNeighborhood = addressParts[0].trim();
        if (potentialNeighborhood) {
          neighborhood = potentialNeighborhood;
        }
      }
      
      areaCount[neighborhood] = (areaCount[neighborhood] || 0) + 1;
    });

    // Convert to array and get top 5
    this.citiesDistribution = Object.entries(areaCount) // Updated property name
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  getContextTitle(): string {
    switch(this.currentContext.level) {
      case 'province':
        return `${this.currentContext.provinceName || 'Gauteng'} Province`;
      case 'municipality':
        return `${this.currentContext.municipalityName || ''} Municipality`;
      case 'city':
      case 'facility':
        return `${this.currentContext.cityName || ''}`;
      default:
        return 'Recycling Facilities';
    }
  }

  formatTypeLabel(type: string): string {
    // Convert camelCase or snake_case to Title Case
    return type
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, str => str.toUpperCase());
  }

  formatMaterialName(name: string): string {
    // Convert camelCase to Title Case
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  getLocationLabelText(): string {
    switch (this.currentContext.level) {
      case 'province':
        return 'Municipalities';
      case 'municipality':
        return 'Cities';
      case 'city':
      case 'facility':
        return 'Areas';
      default:
        return 'Locations';
    }
  }

  getColorForType(type: string): string {
    return FacilityTypeMapper.getMarkerColor(type) || '#16a34a';
  }

  toggleVisibility(): void {
    this.visible = !this.visible;
  }

  // Toggle expanded state for a section
toggleSection(section: 'locations' | 'materials' | 'types'): void {
  this.expandedSections[section] = !this.expandedSections[section];
  this.cdr.markForCheck();
}

// Get filtered locations (top 5 or all depending on expanded state)
getFilteredLocations(): MetricLocation[] {
  return this.expandedSections.locations 
    ? this.citiesDistribution 
    : this.citiesDistribution.slice(0, 5);
}

// Get filtered facility types (top 5 or all depending on expanded state)
getFilteredFacilityTypes(): MetricType[] {
  return this.expandedSections.types 
    ? this.facilityTypes 
    : this.facilityTypes.slice(0, 5);
}

// Get filtered materials (top 5 or all depending on expanded state)
getFilteredMaterials(): MetricMaterial[] {
  return this.expandedSections.materials 
    ? this.topMaterials 
    : this.topMaterials.slice(0, 5);
}

// Get count of distinct locations
getDistinctLocationsCount(): number {
  return this.citiesDistribution.length;
}

  // Debugging utility to check facility data structure
  logFacilitiesMetadata(): void {
    if (this.facilities.length === 0) {
      console.log('No facilities data available');
      return;
    }

    console.log(`Total facilities: ${this.facilities.length}`);

    // Count occurrences of each municipality
    const municipalityCounts: { [key: string]: number } = {};
    this.facilities.forEach(facility => {
      const municipality = facility.municipality || 'Unknown';
      municipalityCounts[municipality] = (municipalityCounts[municipality] || 0) + 1;
    });

    console.log('Municipalities distribution:', municipalityCounts);

    // Count occurrences of each city
    const cityCounts: { [key: string]: number } = {};
    this.facilities.forEach(facility => {
      const city = facility.city || 'Unknown';
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    console.log('Cities distribution:', cityCounts);
  }
}