// src/app/services/scanner.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ImageAnalysisResponse } from '../models/image-analysis.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScannerService {
  private apiUrl = environment.apiUrl + '/image-recognition/analyze';
  private currentResult: ImageAnalysisResponse | null = null;

  constructor(private http: HttpClient) {}

  analyzeImage(file: File, latitude?: number, longitude?: number, radius: number = 10): Observable<ImageAnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (latitude && longitude) {
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      formData.append('radius', radius.toString());
    }

    return this.http.post<ImageAnalysisResponse>(this.apiUrl, formData);
  }

  setCurrentResult(result: ImageAnalysisResponse): void {
    this.currentResult = result;
  }

  getCurrentResult(): ImageAnalysisResponse | null {
    return this.currentResult;
  }

  clearResult(): void {
    this.currentResult = null;
  }
}