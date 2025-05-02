import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface GeographicContext {
  level: 'province' | 'municipality' | 'city' | 'facility';
  provinceName?: string;
  municipalityName?: string;
  cityName?: string;
  facilityId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeographicContextService {
  private contextSubject = new BehaviorSubject<GeographicContext>({
    level: 'province',
    provinceName: 'Gauteng'
  });

  // Public observable for components to subscribe to
  public context$ = this.contextSubject.asObservable();

  constructor() {}

  // Get current context synchronously (for one-time checks)
  getCurrentContext(): GeographicContext {
    return this.contextSubject.getValue();
  }

  // Update the geographic context
  updateContext(context: Partial<GeographicContext>): void {
    const currentContext = this.contextSubject.getValue();
    
    // Create a new context object with updated fields
    const newContext: GeographicContext = {
      ...currentContext,
      ...context
    };
    
    // When changing to higher levels, clear lower level fields
    if (context.level === 'province') {
      newContext.municipalityName = undefined;
      newContext.cityName = undefined;
      newContext.facilityId = undefined;
    } else if (context.level === 'municipality') {
      newContext.cityName = undefined;
      newContext.facilityId = undefined;
    } else if (context.level === 'city') {
      newContext.facilityId = undefined;
    }
    
    // Emit the updated context
    this.contextSubject.next(newContext);
  }

  // Helper methods for common transitions
  goToProvince(provinceName: string = 'Gauteng'): void {
    this.updateContext({
      level: 'province',
      provinceName
    });
  }

  goToMunicipality(municipalityName: string): void {
    this.updateContext({
      level: 'municipality',
      municipalityName
    });
  }

  goToCity(cityName: string): void {
    this.updateContext({
      level: 'city',
      cityName
    });
  }

  goToFacility(facilityId: number): void {
    this.updateContext({
      level: 'facility',
      facilityId
    });
  }

  // Go back one level in the hierarchy
  goBack(): boolean {
    const current = this.getCurrentContext();
    
    if (current.level === 'facility' && current.cityName) {
      this.goToCity(current.cityName);
      return true;
    } else if (current.level === 'city' && current.municipalityName) {
      this.goToMunicipality(current.municipalityName);
      return true;
    } else if (current.level === 'municipality') {
      this.goToProvince();
      return true;
    }
    
    return false; // Can't go back further
  }
}