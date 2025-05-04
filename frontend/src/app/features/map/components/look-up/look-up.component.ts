import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapControlsComponent } from '../map-controls/map-controls.component';
import { FacilityService } from '../../../../service/facility.service';
import { RecyclingFacility } from '../../../../models/recycling-facility';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HeaderNavComponent } from '../../../../shared/components/header-nav/header-nav.component'; // Add this import

interface PageEvent {
  previousPageIndex: number;
  pageIndex: number;
  pageSize: number;
  length: number;
}

@Component({
  selector: 'app-look-up',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MapControlsComponent,
    MatIconModule,
    HeaderNavComponent // Add HeaderNavComponent to imports
  ],
  templateUrl: './look-up.component.html',
  styleUrl: './look-up.component.scss'
})
export class LookUpComponent implements OnInit, OnDestroy {
  // Make Math available in the template
  Math = Math;

  // Facility data
  facilities: RecyclingFacility[] = [];
  filteredFacilities: RecyclingFacility[] = [];
  
  // Pagination
  pageSize = 12;
  pageSizeOptions: number[] = [6, 12, 24, 48];
  pageIndex = 0;
  totalFacilities = 0;
  
  // UI state
  isLoading = true;
  error: string | null = null;
  activeFilters: any = {};
  
  // Destroy subject for unsubscribing
  private destroy$ = new Subject<void>();
  
  // Add these properties for the header-nav component
  mapNavItems = [
    { label: 'Map View', route: '/map', icon: 'map' },
    { label: 'Lookup', route: '/map/lookup', icon: 'search', active: true },
    { label: 'Recycling Guide', route: '/map/guide', icon: 'info' }
  ];
  
  mapPageDescriptions = {
    'lookup': 'Search for recycling facilities by location, material type, or facility name.'
  };

  constructor(
    private facilityService: FacilityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFacilities();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all facilities from the API
   */
  loadFacilities(): void {
    this.isLoading = true;
    this.error = null;
    
    this.facilityService.getAllFacilities()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.facilities = data;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading facilities:', err);
          this.error = 'Unable to load recycling facilities. Please try again later.';
          this.isLoading = false;
        }
      });
  }

  /**
   * Apply filters and pagination to the facilities
   */
  applyFilters(): void {
    // Start with all facilities
    let result = [...this.facilities];
    
    // Apply active filters if they exist
    if (this.activeFilters) {
      // Filter by cities if selected
      if (this.activeFilters.cities && this.activeFilters.cities.length > 0) {
        result = result.filter(facility => 
          facility.city && this.activeFilters.cities.includes(facility.city.toLowerCase())
        );
      }
      
      // Filter by facility types if selected
      if (this.activeFilters.types && this.activeFilters.types.length > 0) {
        result = result.filter(facility => 
          facility.type && this.activeFilters.types.includes(facility.type.toLowerCase())
        );
      }
      
      // Filter by materials if selected
      if (this.activeFilters.materials && this.activeFilters.materials.length > 0) {
        result = result.filter(facility => {
          if (!facility.acceptedMaterials) return false;
          
          // Check if facility accepts any of the selected materials
          return this.activeFilters.materials.some((material: string) => 
            facility.acceptedMaterials && facility.acceptedMaterials[material]
          );
        });
      }
      
      // Sort by distance if location is available and sortBy is 'nearest'
      if (this.activeFilters.userLocation && this.activeFilters.sortBy === 'nearest') {
        // The facilities should already have distance calculated from the API
        result.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      } else if (this.activeFilters.sortBy === 'name') {
        // Sort alphabetically by name
        result.sort((a, b) => a.name.localeCompare(b.name));
      }
    }
    
    // Update total count for pagination
    this.totalFacilities = result.length;
    
    // Apply pagination
    const startIndex = this.pageIndex * this.pageSize;
    this.filteredFacilities = result.slice(startIndex, startIndex + this.pageSize);
  }
  
  /**
   * Handle page changes
   */
  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.applyFilters();
    
    // Scroll to top of results when page changes
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }
  
  /**
   * Handle page size changes
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 0; // Reset to first page
    this.applyFilters();
  }

  /**
   * Handle when filters are changed in the map-controls component
   */
  onFiltersChanged(filters: any): void {
    this.activeFilters = filters;
    this.pageIndex = 0; // Reset to first page when filters change
    this.applyFilters();
  }
  
  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.activeFilters = {};
    this.pageIndex = 0;
    this.applyFilters();
  }
  
  /**
   * Handle when facilities are updated from map-controls component (when search occurs)
   */
  onFacilitiesUpdated(facilities: RecyclingFacility[]): void {
    this.facilities = facilities;
    this.pageIndex = 0;
    this.applyFilters();
  }
  
  /**
   * Format the accepted materials list for display
   */
  formatMaterialsList(materials: {[key: string]: boolean} | undefined): string[] {
    if (!materials) return [];
    
    return Object.entries(materials)
      .filter(([_, accepted]) => accepted)
      .map(([material, _]) => this.formatMaterialName(material))
      .slice(0, 3); // Only show first 3 materials
  }
  
  /**
   * Format material name for display (convert camelCase to Title Case)
   */
  formatMaterialName(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }
  
  /**
   * Get count of additional materials beyond the first 3
   */
  getAdditionalMaterialsCount(materials: {[key: string]: boolean} | undefined): number {
    if (!materials) return 0;
    
    const acceptedCount = Object.values(materials).filter(v => v).length;
    return Math.max(0, acceptedCount - 3);
  }
  
  /**
   * Navigate to view facility details
   */
  viewFacilityDetails(facility: RecyclingFacility): void {
    this.router.navigate(['/facility', facility.id]);
  }
  
  /**
   * Navigate to map view centered on this facility
   */
  viewOnMap(facility: RecyclingFacility): void {
    this.router.navigate(['/map'], {
      queryParams: {
        lat: facility.latitude,
        lng: facility.longitude,
        id: facility.id
      }
    });
  }
}
