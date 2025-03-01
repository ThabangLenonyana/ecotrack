import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { WasteCategory } from '../../../../models/waste-category';

@Component({
  selector: 'app-category-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-modal.component.html',
  styleUrls: ['./category-modal.component.scss']
})
export class CategoryModalComponent {
  @Input() category?: WasteCategory;
  isOpen = false;

  open(category: WasteCategory) {
    this.category = category;
    this.isOpen = true;
    document.body.classList.add('overflow-hidden'); // Prevent background scrolling
  }

  close() {
    this.isOpen = false;
    document.body.classList.remove('overflow-hidden');
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

  getDifficultyClass(difficulty: string): string {
    const classMap: { [key: string]: string } = {
      'Easy': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Hard': 'bg-red-100 text-red-800',
    };
    return classMap[difficulty] || 'bg-gray-100 text-gray-800';
  }

  getMaterialsArray(materialString: string): string[] {
    if (!materialString) return [];
    return materialString.split(',').map(item => item.trim()).filter(item => item.length > 0);
  }
}