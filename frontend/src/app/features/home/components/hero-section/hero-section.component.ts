import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit } from '@angular/core';


declare var VANTA: any;

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent implements OnInit {
  private vantaEffect: any;
  private resizeObserver: ResizeObserver;

  constructor(private elementRef: ElementRef) {
    this.resizeObserver = new ResizeObserver(() => {
      if (this.vantaEffect) {
        this.vantaEffect.resize();
      }
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Wait for DOM to be ready
    setTimeout(() => {
      this.initVantaEffect();
      // Observe size changes
      const heroSection = this.elementRef.nativeElement.querySelector('.hero-section');
      if (heroSection) {
        this.resizeObserver.observe(heroSection);
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.vantaEffect) {
      this.vantaEffect.destroy();
    }
    this.resizeObserver.disconnect();
  }

  private initVantaEffect(): void {
    try {
      this.vantaEffect = VANTA.GLOBE({
        el: this.elementRef.nativeElement.querySelector('.hero-section'),
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0xffffff,
        color2: 0xffffff,
        backgroundColor: 0x1fa748, // Lighter green color
        size: 0.90,
        points: 8.00,
        maxDistance: 25.00,
        spacing: 20.00
      });
      console.log('Vanta effect initialized successfully');
    } catch (error) {
      console.error('Error initializing Vanta effect:', error);
    }
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    // Implement search functionality
  }

}