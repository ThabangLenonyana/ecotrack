import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WasteCategory } from '../../models/waste-category';
import { CategoryModalComponent } from './components/category-modal/category-modal.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';

interface FAQ {
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    CategoryModalComponent, 
    HeaderComponent, 
    FooterComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild(CategoryModalComponent) categoryModal!: CategoryModalComponent;
  
  faqs: FAQ[] = [];
  
  constructor(private router: Router) {}
  
  ngOnInit(): void {
    // Initialize FAQs
    this.faqs = [
      {
        question: 'How does EcoTrack work?',
        answer: 'EcoTrack uses your location to find the nearest recycling points for different materials. Simply scan the barcode of your item or select the material type, and our app will guide you on how to properly recycle it and where to take it.',
        isOpen: false
      },
      {
        question: 'How do I earn rewards?',
        answer: 'Every time you record a recycling activity in the app, you earn EcoPoints. These points can be redeemed for discounts and special offers from our partner retailers across South Africa.',
        isOpen: false
      },
      {
        question: 'Is EcoTrack available nationwide in South Africa?',
        answer: 'Yes! EcoTrack is available throughout South Africa. Our database of recycling points is constantly growing, with the highest concentration in major cities but increasing coverage in smaller towns and rural areas.',
        isOpen: false
      },
      {
        question: 'Can I use EcoTrack for business recycling?',
        answer: 'Absolutely! We offer EcoTrack Business, a specialized version of our app designed for companies looking to track and improve their recycling practices. Contact us for more information about business plans.',
        isOpen: false
      }
    ];
  }

  openCategoryModal(category: WasteCategory): void {
    this.categoryModal.open(category);
  }
  
  navigateToMap(): void {
    this.router.navigate(['/facility-finder']);
  }
  
  navigateToScanner(): void {
    this.router.navigate(['/eco-scanner']); // Using "EcoScanner" as the improved name for the AI Scanner
  }
  
  toggleFaq(index: number): void {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }
}
