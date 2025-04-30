import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { RecyclingFacility } from '../models/recycling-facility';

@Injectable({
  providedIn: 'root'
})
export class FacilityService {
  private apiUrl = `${environment.apiUrl}/locations`;

  constructor(private http: HttpClient) { }

  getAllFacilities(): Observable<RecyclingFacility[]> {
    return this.http.get<any[]>(`${this.apiUrl}/map-data`)
      .pipe(
        map(locations => this.transformLocations(locations)),
        catchError(this.handleError)
      );
  }

  getNearbyFacilities(latitude: number, longitude: number, radius: number = 10): Observable<RecyclingFacility[]> {
    return this.http.get<any[]>(`${this.apiUrl}/nearby`, {
      params: { latitude: `${latitude}`, longitude: `${longitude}`, radius: `${radius}` }
    }).pipe(
      map(locations => this.transformLocations(locations)),
      catchError(this.handleError)
    );
  }

  getFacilitiesByType(type: string): Observable<RecyclingFacility[]> {
    return this.http.get<any[]>(`${this.apiUrl}/by-type/${type}`)
      .pipe(
        map(locations => this.transformLocations(locations)),
        catchError(this.handleError)
      );
  }

  getFacilitiesByMaterials(materials: { [key: string]: boolean }): Observable<RecyclingFacility[]> {
    const params: any = {};
    Object.keys(materials).forEach(material => {
      if (materials[material]) {
        params[material] = 'true';
      }
    });

    return this.http.get<any[]>(`${this.apiUrl}/by-materials`, { params })
      .pipe(
        map(locations => this.transformLocations(locations)),
        catchError(this.handleError)
      );
  }

  private transformLocations(locations: any[]): RecyclingFacility[] {
    return locations.map(location => {
      // Compose address from city and municipality
      const addressParts = [];
      if (location.city) addressParts.push(location.city);
      if (location.municipality) addressParts.push(location.municipality);
      
      return {
        id: location.id,
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        municipality: location.municipality,
        city: location.city,
        address: addressParts.join(', '),
        website: location.website,
        operation: location.operation,
        type: location.type,
        groupName: location.groupName,
        other: location.other,
        distance: location.distance,
        // Pass through the Map directly without transformation
        acceptedMaterials: location.acceptedMaterials || {}
      };
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred while retrieving facility data';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}