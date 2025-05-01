import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FacilityService } from '../../../../service/facility.service';

@Component({
  selector: 'app-map-controls',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './map-controls.component.html',
  styleUrls: ['./map-controls.component.scss']
})
export class MapControlsComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<any>();
  @Output() facilitiesUpdated = new EventEmitter<any[]>();
  
  filterForm!: FormGroup;
  searchQuery = '';
  locationEnabled = false;
  
  // Track dropdown states
  dropdownStates = {
    city: false,
    materials: false,
    facilityType: false
  };
  
  // City list for filtering
  cities = [
    { value: 'johannesburg', label: 'Johannesburg', icon: 'fas fa-city' },
    { value: 'pretoria', label: 'Pretoria', icon: 'fas fa-city' },
    { value: 'capeTown', label: 'Cape Town', icon: 'fas fa-city' },
    { value: 'durban', label: 'Durban', icon: 'fas fa-city' },
    { value: 'portElizabeth', label: 'Port Elizabeth', icon: 'fas fa-city' }
  ];
  
  // Predefined facility types and materials for filtering
  facilityTypes = [
    { value: 'dropOff', label: 'Drop-Off Centers', icon: 'fas fa-recycle' },
    { value: 'buyback', label: 'Buyback Centers', icon: 'fas fa-exchange-alt' },
    { value: 'recycler', label: 'Recyclers', icon: 'fas fa-industry' },
    { value: 'landfill', label: 'Landfills', icon: 'fas fa-trash' },
    { value: 'compost', label: 'Composting', icon: 'fas fa-leaf' }
  ];
  
  materials = [
    { value: 'paper', label: 'Paper', icon: 'fas fa-newspaper' },
    { value: 'plastic', label: 'Plastic', icon: 'fas fa-wine-bottle' },
    { value: 'glass', label: 'Glass', icon: 'fas fa-wine-glass-alt' },
    { value: 'metal', label: 'Metal', icon: 'fas fa-utensils' },
    { value: 'electronics', label: 'E-Waste', icon: 'fas fa-laptop' },
    { value: 'organics', label: 'Organics', icon: 'fas fa-apple-alt' }
  ];
  
  // Default radius range options (now just for reference)
  radiusOptions = [5, 10, 20, 50];
  
  constructor(private fb: FormBuilder, private facilityService: FacilityService) { }
  
  ngOnInit(): void {
    this.initializeForm();
  }
  
  private initializeForm(): void {
    // Create form group with nested form groups for filters
    this.filterForm = this.fb.group({
      cities: this.fb.group({}),
      types: this.fb.group({}),
      materials: this.fb.group({}),
      radius: [10], // Default radius
      sortBy: ['nearest']
    });
    
    // Add form controls dynamically for cities
    this.cities.forEach(city => {
      (this.filterForm.get('cities') as FormGroup).addControl(
        city.value, this.fb.control(false)
      );
    });
    
    // Add form controls dynamically for facility types
    this.facilityTypes.forEach(type => {
      (this.filterForm.get('types') as FormGroup).addControl(
        type.value, this.fb.control(false)
      );
    });
    
    // Add form controls dynamically for materials
    this.materials.forEach(material => {
      (this.filterForm.get('materials') as FormGroup).addControl(
        material.value, this.fb.control(false)
      );
    });
    
    // Subscribe to value changes to emit filter updates
    this.filterForm.valueChanges.subscribe(formValue => {
      // Transform form values into a more usable format
      const filters = this.transformFormValues();
      this.filtersChanged.emit(filters);
    });
  }
  
  // Helper method to get selected values from form group
  private getSelectedValues(formGroup: {[key: string]: boolean}): string[] {
    return Object.entries(formGroup)
      .filter(([_, selected]) => selected)
      .map(([value, _]) => value);
  }
  
  // Toggle dropdown menus
  toggleDropdown(dropdown: 'city' | 'materials' | 'facilityType'): void {
    // Close all other dropdowns
    Object.keys(this.dropdownStates).forEach(key => {
      if (key !== dropdown) {
        this.dropdownStates[key as keyof typeof this.dropdownStates] = false;
      }
    });
    
    // Toggle the selected dropdown
    this.dropdownStates[dropdown] = !this.dropdownStates[dropdown];
  }
  
  // Handle search query
  onSearch(): void {
    console.log('Searching for:', this.searchQuery);
    // Here you would typically call a geocoding service
    // For now we'll just emit the filter update with the search query
    const filters = this.transformFormValues();
    filters.searchQuery = this.searchQuery;
    this.filtersChanged.emit(filters);
  }
  
  // Toggle location services
  toggleLocation(): void {
    this.locationEnabled = !this.locationEnabled;
    
    if (this.locationEnabled) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const radius = this.filterForm.get('radius')?.value || 10;
            
            // Call the FacilityService to get nearby facilities
            this.facilityService.getNearbyFacilities(latitude, longitude, radius)
              .subscribe({
                next: (facilities) => {
                  // Emit the facilities to update the map
                  this.facilitiesUpdated.emit(facilities);
                  
                  // Also update filters with location info for other components
                  const filters = this.transformFormValues();
                  filters.userLocation = { latitude, longitude };
                  this.filtersChanged.emit(filters);
                },
                error: (error) => {
                  console.error('Error fetching nearby facilities:', error);
                  this.locationEnabled = false;
                  alert('Unable to fetch nearby facilities. Please try again later.');
                }
              });
          },
          (error) => {
            console.error('Geolocation error:', error);
            this.locationEnabled = false;
            
            if (error.code === error.PERMISSION_DENIED) {
              alert('Location permission denied. Please enable location services to use this feature.');
            } else {
              alert('Unable to get your current location. Please try again later.');
            }
          }
        );
      } else {
        alert('Geolocation is not supported by your browser.');
        this.locationEnabled = false;
      }
    } else {
      // When location is disabled, load all facilities again
      this.facilityService.getAllFacilities()
        .subscribe({
          next: (facilities) => {
            this.facilitiesUpdated.emit(facilities);
            
            // Also update filters to remove location
            const filters = this.transformFormValues();
            filters.userLocation = null;
            this.filtersChanged.emit(filters);
          },
          error: (error) => {
            console.error('Error fetching all facilities:', error);
          }
        });
    }
  }
  
  // Update the incrementRadius and decrementRadius methods to refresh nearby facilities
  incrementRadius(): void {
    const currentRadius = this.filterForm.get('radius')?.value || 0;
    const nextIndex = this.radiusOptions.findIndex(r => r > currentRadius);
    
    if (nextIndex !== -1) {
      this.filterForm.get('radius')?.setValue(this.radiusOptions[nextIndex]);
    } else if (currentRadius < 100) {
      this.filterForm.get('radius')?.setValue(currentRadius + 10);
    }
    
    // If location is enabled, refresh the nearby facilities with new radius
    if (this.locationEnabled) {
      this.refreshNearbyFacilities();
    }
  }
  
  decrementRadius(): void {
    const currentRadius = this.filterForm.get('radius')?.value || 0;
    if (currentRadius <= 5) {
      return;
    }
    
    const prevIndex = this.radiusOptions
      .slice()
      .reverse()
      .findIndex(r => r < currentRadius);
    
    if (prevIndex !== -1 && prevIndex < this.radiusOptions.length) {
      const index = this.radiusOptions.length - prevIndex - 1;
      this.filterForm.get('radius')?.setValue(this.radiusOptions[index]);
    } else if (currentRadius > 50) {
      this.filterForm.get('radius')?.setValue(currentRadius - 10);
    }
    
    // If location is enabled, refresh the nearby facilities with new radius
    if (this.locationEnabled) {
      this.refreshNearbyFacilities();
    }
  }
  
  // Helper method to refresh nearby facilities when radius changes
  private refreshNearbyFacilities(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const radius = this.filterForm.get('radius')?.value || 10;
          
          this.facilityService.getNearbyFacilities(latitude, longitude, radius)
            .subscribe({
              next: (facilities) => {
                this.facilitiesUpdated.emit(facilities);
                
                // Also update filters with location info
                const filters = this.transformFormValues();
                filters.userLocation = { latitude, longitude };
                this.filtersChanged.emit(filters);
              },
              error: (error) => {
                console.error('Error refreshing nearby facilities:', error);
              }
            });
        },
        (error) => {
          console.error('Error getting location for radius update:', error);
        }
      );
    }
  }
  
  // Toggle city selection
  toggleCity(cityName: string): void {
    const control = (this.filterForm.get('cities') as FormGroup).get(cityName);
    if (control) {
      control.setValue(!control.value);
    }
  }
  
  // Toggle facility type selection
  toggleFacilityType(typeName: string): void {
    const control = (this.filterForm.get('types') as FormGroup).get(typeName);
    if (control) {
      control.setValue(!control.value);
    }
  }
  
  // Toggle material selection
  toggleMaterial(materialName: string): void {
    const control = (this.filterForm.get('materials') as FormGroup).get(materialName);
    if (control) {
      control.setValue(!control.value);
    }
  }
  
  // Reset all filters
  resetFilters(): void {
    // Reset city filters
    Object.keys((this.filterForm.get('cities') as FormGroup).controls)
      .forEach(key => (this.filterForm.get('cities') as FormGroup).get(key)?.setValue(false));
    
    // Reset types
    Object.keys((this.filterForm.get('types') as FormGroup).controls)
      .forEach(key => (this.filterForm.get('types') as FormGroup).get(key)?.setValue(false));
    
    // Reset materials
    Object.keys((this.filterForm.get('materials') as FormGroup).controls)
      .forEach(key => (this.filterForm.get('materials') as FormGroup).get(key)?.setValue(false));
    
    // Reset other filters
    this.filterForm.patchValue({
      radius: 10,
      sortBy: 'nearest'
    });
    
    // Reset search and location
    this.searchQuery = '';
    this.locationEnabled = false;
    
    // Emit reset filters
    this.filtersChanged.emit({
      cities: [],
      types: [],
      materials: [],
      radius: 10,
      sortBy: 'nearest',
      userLocation: null,
      searchQuery: ''
    });
  }
  
  // Get number of selected items for a filter group
  getSelectedCount(groupName: 'cities' | 'types' | 'materials'): number {
    return this.getSelectedValues(this.filterForm.get(groupName)?.value || {}).length;
  }
  
  // Transform form values for emitting
  private transformFormValues(): any {
    const formValue = this.filterForm.value;
    return {
      cities: this.getSelectedValues(formValue.cities),
      types: this.getSelectedValues(formValue.types),
      materials: this.getSelectedValues(formValue.materials),
      radius: formValue.radius,
      sortBy: formValue.sortBy
    };
  }
}