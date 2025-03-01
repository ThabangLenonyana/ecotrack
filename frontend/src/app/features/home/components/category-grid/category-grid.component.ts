import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { WasteCategory } from '../../../../models/waste-category';
import { ApiService } from '../../../../service/api.service';
import { CategoryCardComponent } from '../category-card/category-card.component';

@Component({
  selector: 'app-category-grid',
  standalone: true,
  imports: [CommonModule, CategoryCardComponent],
  templateUrl: './category-grid.component.html',
  styleUrls: ['./category-grid.component.scss']
})
export class CategoryGridComponent implements OnInit {
  categories: WasteCategory[] = [];
  @Output() viewCategoryDetails = new EventEmitter<WasteCategory>();

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadCategories();
  }

  private loadCategories() {
    this.apiService.getAllCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: (error) => console.error('Error loading categories:', error)
    });
  }

  onViewDetails(category: WasteCategory): void {
    this.viewCategoryDetails.emit(category);
  }
}