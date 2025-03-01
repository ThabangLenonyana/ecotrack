import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WasteCategory } from '../../../../models/waste-category';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-card.component.html',
  styleUrls: ['./category-card.component.scss']
})
export class CategoryCardComponent {
  @Input() category!: WasteCategory;
  @Output() viewDetails = new EventEmitter<WasteCategory>();

  get guidelinesCount(): number {
    return this.category.disposalGuidelines?.length || 0;
  }

  get tipsCount(): number {
    return this.category.recyclingTips?.length || 0;
  }

  getIconClass(categoryName: string): string {
    const iconMap: { [key: string]: string } = {
      'Recyclables': 'fa-recycle',
      'Organic': 'fa-leaf',
      'Hazardous': 'fa-exclamation-triangle',
      'Electronic': 'fa-laptop',
      'Paper': 'fa-file-alt',
      'Plastic': 'fa-cube',
      'Metal': 'fa-cogs',
      'Glass': 'fa-wine-glass',
      'Medical': 'fa-hospital',
      'Battery': 'fa-battery-full',
      'Construction': 'fa-hammer',
    };
    return iconMap[categoryName] || 'fa-recycle';
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.category);
  }
}