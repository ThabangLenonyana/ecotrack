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
  featuredCategories: WasteCategory[] = [];
  currentIndex: number = 0;
  carouselItemsToShow: number = 3;
  showingAllCategories: boolean = false;
  Math = Math; // To access Math in the template

  @Output() viewDetails = new EventEmitter<WasteCategory>();

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadCategories();
  }

  private loadCategories() {
    this.apiService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        // Get the first 5 categories for the featured carousel
        this.featuredCategories = categories.slice(0, 5);
      },
      error: (error) => console.error('Error loading categories:', error)
    });
  }

  nextSlide(): void {
    const maxIndex = this.featuredCategories.length - this.carouselItemsToShow;
    this.currentIndex = Math.min(this.currentIndex + 1, maxIndex);
  }

  prevSlide(): void {
    this.currentIndex = Math.max(this.currentIndex - 1, 0);
  }

  goToSlide(index: number): void {
    // Make sure we navigate to the beginning of a group
    const groupStartIndex = Math.floor(index / this.carouselItemsToShow) * this.carouselItemsToShow;
    this.currentIndex = Math.min(groupStartIndex, this.featuredCategories.length - this.carouselItemsToShow);
  }

  showAllCategories(): void {
    this.showingAllCategories = true;
  }

  hideAllCategories(): void {
    this.showingAllCategories = false;
    // Reset carousel position when hiding all categories
    this.currentIndex = 0;
  }

  onViewDetails(category: WasteCategory): void {
    this.viewDetails.emit(category);
  }

  // Get the number of indicator groups needed (based on carouselItemsToShow)
getIndicatorGroups(): number[] {
  const totalGroups = Math.ceil(this.featuredCategories.length / this.carouselItemsToShow);
  return Array(totalGroups).fill(0);
}

// Get the current active group
getCurrentGroup(): number {
  return Math.floor(this.currentIndex / this.carouselItemsToShow);
}

// Navigate directly to a specific group
goToGroup(groupIndex: number): void {
  this.currentIndex = groupIndex * this.carouselItemsToShow;
}
}