import { Component, OnInit, Output, EventEmitter, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FacilityService } from '../../../../service/facility.service';
import { of } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';

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
  isLoading = true;
  loadError = false;
  searchError = '';
  
  // Search history and suggestions
  searchHistory: string[] = [];
  suggestedLocations: any[] = [];
  showSuggestions = false;
  isSearchFocused = false;
  
  // Maximum number of search history items to keep
  private readonly MAX_SEARCH_HISTORY = 5;

  // Track dropdown states
  dropdownStates = {
    city: false,
    materials: false,
    facilityType: false
  };
  
  // Initialize with empty arrays - will be populated from API
  cities: any[] = [];
  facilityTypes: any[] = [];
  materials: any[] = [];
  
  // Default radius range options (now just for reference)
  radiusOptions = [5, 10, 20, 50];
  private geocoder: google.maps.Geocoder;
  
  constructor(
    private fb: FormBuilder, 
    private facilityService: FacilityService,
    private ngZone: NgZone) { 
      this.geocoder = new google.maps.Geocoder();
     }
  
  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadSearchHistory();
  }
  
  // Load search history from localStorage
  private loadSearchHistory(): void {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        this.searchHistory = JSON.parse(savedHistory);
      } catch (e) {
        console.error('Error parsing search history', e);
        this.searchHistory = [];
      }
    }
  }
  
  // Save search history to localStorage
  private saveSearchHistory(): void {
    localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
  }
  
  // Add a search to history
  private addToSearchHistory(query: string): void {
    // Don't add empty queries or duplicates
    if (!query.trim() || this.searchHistory.includes(query)) {
      return;
    }
    
    // Add to beginning of array
    this.searchHistory.unshift(query);
    
    // Limit the size of history
    if (this.searchHistory.length > this.MAX_SEARCH_HISTORY) {
      this.searchHistory = this.searchHistory.slice(0, this.MAX_SEARCH_HISTORY);
    }
    
    // Save to localStorage
    this.saveSearchHistory();
  }
  
  // Handle input focus
  onSearchFocus(): void {
    this.isSearchFocused = true;
    this.showSuggestions = this.searchQuery.length > 0 || this.searchHistory.length > 0;
    
    // If user has already typed something, show suggestions
    if (this.searchQuery.length >= 3) {
      this.getSuggestions(this.searchQuery);
    }
  }
  
  // Handle input blur
  onSearchBlur(): void {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      this.isSearchFocused = false;
      this.showSuggestions = false;
    }, 200);
  }
  
  // Handle input changes
  onSearchInput(): void {
    // Show history when input is empty
    if (!this.searchQuery || this.searchQuery.length < 3) {
      this.suggestedLocations = [];
      this.showSuggestions = this.isSearchFocused && this.searchHistory.length > 0;
      return;
    }
    
    // Get suggestions from Places API when 3+ characters typed
    this.getSuggestions(this.searchQuery);
    
    // Ensure suggestions are visible
    this.showSuggestions = true;
  }
  
  // Get suggestions from Google Places API
  private getSuggestions(query: string): void {
    if (!query || query.length < 3) return;
    
    try {
      const service = new google.maps.places.AutocompleteService();
      service.getPlacePredictions({
        input: query,
        types: ['geocode'] // Restrict to geocoding results
      }, (predictions, status) => {
        this.ngZone.run(() => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            this.suggestedLocations = predictions.map(prediction => ({
              description: prediction.description,
              placeId: prediction.place_id
            })).slice(0, 5); // Limit to 5 suggestions
          } else {
            this.suggestedLocations = [];
          }
        });
      });
    } catch (error) {
      console.error('Error getting place suggestions:', error);
      this.suggestedLocations = [];
    }
  }
  
  // Select a suggestion or history item
  selectSearchItem(item: string): void {
    this.searchQuery = item;
    this.showSuggestions = false;
    this.onSearch();
  }
  
  // Select a suggestion from the dropdown
  selectSuggestion(suggestion: any): void {
    this.searchQuery = suggestion.description;
    this.showSuggestions = false;
    
    // Use Place ID for more accurate geocoding if available
    if (suggestion.placeId) {
      this.geocoder.geocode(
        { placeId: suggestion.placeId },
        (results, status) => {
          this.ngZone.run(() => {
            this.processingGeocodingResults(results, status);
          });
        }
      );
    } else {
      this.onSearch(); // Fall back to regular search
    }
  }
  
  // Clear search history
  clearSearchHistory(): void {
    this.searchHistory = [];
    localStorage.removeItem('searchHistory');
  }
  
  // Handle search query
  onSearch(): void {
    if (!this.searchQuery?.trim()) {
      return;
    }
    
    this.isLoading = true;
    this.searchError = '';
    this.showSuggestions = false;
    
    // Use Google's geocoder directly
    this.geocoder.geocode(
      { address: this.searchQuery },
      (results, status) => {
        this.ngZone.run(() => {
          this.processingGeocodingResults(results, status);
        });
      }
    );
  }
  
  // Process geocoding results (extracted from onSearch to reuse in selectSuggestion)
  private processingGeocodingResults(results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus): void {
    this.isLoading = false;
    
    if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
      const location = results[0].geometry.location;
      const latitude = location.lat();
      const longitude = location.lng();
      const radius = this.filterForm.get('radius')?.value || 10;
      
      // Add to search history
      this.addToSearchHistory(this.searchQuery);
      
      // Get nearby facilities
      this.facilityService.getNearbyFacilities(latitude, longitude, radius)
        .subscribe({
          next: (facilities) => {
            // Update the facilities on the map
            this.facilitiesUpdated.emit(facilities);
            
            // Update filters with search location
            const filters = this.transformFormValues();
            filters.userLocation = { 
              latitude,
              longitude,
              address: results[0].formatted_address
            };
            this.filtersChanged.emit(filters);
            
            // Enable location-based features
            this.locationEnabled = true;
          },
          error: (error) => {
            console.error('Error fetching facilities near location:', error);
            this.searchError = 'Unable to find facilities near this location.';
          }
        });
    } else {
      this.searchError = 'Location not found. Please try a different search.';
    }
  }
  
  private loadFilterOptions(): void {
    this.isLoading = true;
    this.loadError = false;
    
    // Get all filter options in one call
    this.facilityService.getFilterOptions()
      .pipe(
        catchError(error => {
          console.error('Error loading filter options:', error);
          this.loadError = true;
          return of({ cities: [], facilityTypes: [], materials: [] });
        }),
        finalize(() => {
          if (this.loadError) {
            // No default filters loaded on error
          }
          this.initializeForm();
          this.isLoading = false;
        })
      )
      .subscribe(options => {
        if (options) {
          // Use filter options from API
          this.cities = this.addIconsToCities(options.cities || []);
          this.facilityTypes = this.addIconsToFacilityTypes(options.facilityTypes || []);
          this.materials = this.addIconsToMaterials(options.materials || []);
        }
      });
  }
  
  // Helper methods to add icons to filter options
  private addIconsToCities(cities: any[]): any[] {
    return cities.map(city => ({
      ...city,
      icon: 'fas fa-city'
    }));
  }
  
  private addIconsToFacilityTypes(types: any[]): any[] {
    const iconMap: {[key: string]: string} = {
      'dropoff': 'fas fa-recycle',
      'buyback': 'fas fa-exchange-alt',
      'recycler': 'fas fa-industry',
      'landfill': 'fas fa-trash',
      'compost': 'fas fa-leaf'
    };
    
    return types.map(type => ({
      ...type,
      icon: iconMap[type.value.toLowerCase()] || 'fas fa-building'
    }));
  }
  
  private addIconsToMaterials(materials: any[]): any[] {
    const iconMap: {[key: string]: string} = {
      'plastic': 'fas fa-wine-bottle',
      'paper': 'fas fa-newspaper',
      'cardboard': 'fas fa-box',
      'metal': 'fas fa-utensils',
      'ewaste': 'fas fa-laptop',
      'cartons': 'fas fa-box-open',
      'motoroil': 'fas fa-oil-can'
    };
    
    return materials.map(material => ({
      ...material,
      icon: iconMap[material.value.toLowerCase()] || 'fas fa-box'
    }));
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

  /**
   * Checks if any filters are currently active
   * @returns boolean indicating if any filters are set
   */
  hasActiveFilters(): boolean {
    // Check if any city is selected
    const citiesGroup = this.filterForm.get('cities');
    const hasSelectedCities = citiesGroup && 
      Object.values(citiesGroup.value).some(selected => selected === true);
    
    // Check if any material is selected
    const materialsGroup = this.filterForm.get('materials');
    const hasSelectedMaterials = materialsGroup && 
      Object.values(materialsGroup.value).some(selected => selected === true);
    
    // Check if any facility type is selected
    const typesGroup = this.filterForm.get('types');
    const hasSelectedTypes = typesGroup && 
      Object.values(typesGroup.value).some(selected => selected === true);
    
    // Check if radius is different from default (10 km)
    const radius = this.filterForm.get('radius')?.value;
    const hasCustomRadius = radius !== 10;
    
    // Return true if any filter is set
    return hasSelectedCities || hasSelectedMaterials || hasSelectedTypes || hasCustomRadius;
  }
}