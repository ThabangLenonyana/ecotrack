import { CommonModule } from '@angular/common';
import { Component, ElementRef, Output, EventEmitter, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../../shared/header/header.component';
import { NgxParticlesModule } from "@tsparticles/angular";
import { NgParticlesService } from "@tsparticles/angular";
import { loadSlim } from "@tsparticles/slim";
import { Container, Engine } from "@tsparticles/engine";
import { ecoParticlesConfig } from './particles-config';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, HeaderComponent, NgxParticlesModule, FormsModule],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent implements OnInit {
  @Output() navigateToMapEvent = new EventEmitter<void>();
  @Output() navigateToScannerEvent = new EventEmitter<void>();
  
  particlesOptions: any = ecoParticlesConfig;
  particlesId = "ecoParticles";
  isBrowser: boolean;
  searchQuery: string = '';
  
  constructor(
    private elementRef: ElementRef,
    private ngParticlesService: NgParticlesService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  
  ngOnInit(): void {
    if (this.isBrowser) {
      // Add fullScreen: false to the eco config
      this.particlesOptions = {
        ...ecoParticlesConfig,
        fullScreen: {
          enable: false // Important: set to false when using in a div
        }
      };
      
      // Initialize particles with a short delay to ensure DOM is ready
      setTimeout(() => {
        this.ngParticlesService.init(async (engine: any) => {
          console.log("Initializing eco particles...");
          await loadSlim(engine);
        });
      }, 300);
    }
  }
  
  async particlesInit(engine: any): Promise<void> {
    if (this.isBrowser) {
      console.log("Particles init called");
      await loadSlim(engine);
    }
  }
  
  particlesLoaded(container: any): void {
    if (this.isBrowser) {
      console.log("Eco particles loaded successfully");
    }
  }
  
  navigateToMap(): void {
    this.navigateToMapEvent.emit();
  }
  
  navigateToScanner(): void {
    this.navigateToScannerEvent.emit();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.navigateToMapWithQuery(this.searchQuery);
    }
  }

  useMyLocation(): void {
    if (this.isBrowser && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Navigate to map with current location parameter
          this.navigateToMapWithQuery('current-location', {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // If error, redirect to map without coordinates
          this.navigateToMapWithQuery('');
        }
      );
    } else {
      // If geolocation not available, just navigate to map
      this.navigateToMapWithQuery('');
    }
  }

  private navigateToMapWithQuery(query: string, coords?: { lat: number, lng: number }): void {
    const queryParams: any = {};
    
    if (query) {
      queryParams.q = query;
    }
    
    if (coords) {
      queryParams.lat = coords.lat;
      queryParams.lng = coords.lng;
    }
    
    this.router.navigate(['/map'], { 
      queryParams 
    });
  }
}