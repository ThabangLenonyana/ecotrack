import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { WasteCategory } from '../../models/waste-category';
import { CategoryGridComponent } from './components/category-grid/category-grid.component';
import { CategoryModalComponent } from './components/category-modal/category-modal.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [  CommonModule, HeroSectionComponent, CategoryModalComponent, CategoryGridComponent, HeaderComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  @ViewChild(CategoryModalComponent) categoryModal!: CategoryModalComponent;

  openCategoryModal(category: WasteCategory): void {
    this.categoryModal.open(category);
  }
}
