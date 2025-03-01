import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DisposalGuideline } from '../models/disposal-guideline';
import { RecyclingTip } from '../models/recycling-tip';
import { WasteCategory } from '../models/waste-category';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_URL = 'http://localhost:8080/api';
  
  constructor(private http: HttpClient) { }

  // Waste Categories
  getAllCategories(): Observable<WasteCategory[]> {
    return this.http.get<WasteCategory[]>(`${this.API_URL}/categories`);
  }

  getCategoryById(id: number): Observable<WasteCategory> {
    return this.http.get<WasteCategory>(`${this.API_URL}/categories/${id}`);
  }

  createCategory(category: WasteCategory): Observable<WasteCategory> {
    return this.http.post<WasteCategory>(`${this.API_URL}/categories`, category);
  }

  updateCategory(id: number, category: WasteCategory): Observable<WasteCategory> {
    return this.http.put<WasteCategory>(`${this.API_URL}/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/categories/${id}`);
  }

  // Disposal Guidelines
  getAllGuidelines(): Observable<DisposalGuideline[]> {
    return this.http.get<DisposalGuideline[]>(`${this.API_URL}/guidelines`);
  }

  getGuidelineById(id: number): Observable<DisposalGuideline> {
    return this.http.get<DisposalGuideline>(`${this.API_URL}/guidelines/${id}`);
  }

  getGuidelinesByCategory(categoryId: number): Observable<DisposalGuideline[]> {
    return this.http.get<DisposalGuideline[]>(`${this.API_URL}/categories/${categoryId}/guidelines`);
  }

  createGuideline(guideline: DisposalGuideline): Observable<DisposalGuideline> {
    return this.http.post<DisposalGuideline>(`${this.API_URL}/guidelines`, guideline);
  }

  updateGuideline(id: number, guideline: DisposalGuideline): Observable<DisposalGuideline> {
    return this.http.put<DisposalGuideline>(`${this.API_URL}/guidelines/${id}`, guideline);
  }

  deleteGuideline(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/guidelines/${id}`);
  }

  // Recycling Tips
  getAllTips(): Observable<RecyclingTip[]> {
    return this.http.get<RecyclingTip[]>(`${this.API_URL}/tips`);
  }

  getTipById(id: number): Observable<RecyclingTip> {
    return this.http.get<RecyclingTip>(`${this.API_URL}/tips/${id}`);
  }

  getTipsByCategory(categoryId: number): Observable<RecyclingTip[]> {
    return this.http.get<RecyclingTip[]>(`${this.API_URL}/categories/${categoryId}/tips`);
  }

  createTip(tip: RecyclingTip): Observable<RecyclingTip> {
    return this.http.post<RecyclingTip>(`${this.API_URL}/tips`, tip);
  }

  updateTip(id: number, tip: RecyclingTip): Observable<RecyclingTip> {
    return this.http.put<RecyclingTip>(`${this.API_URL}/tips/${id}`, tip);
  }

  deleteTip(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/tips/${id}`);
  }
}
