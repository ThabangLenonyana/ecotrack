import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isVisible = true;
  lastScrollPosition = 0;
  scrollThreshold = 50;
  isMapPage = false;

  private updateIsMapPage() {
    this.isMapPage = this.router.url.includes('/map');
  }

  constructor(private router: Router) {}

  ngOnInit() {
    // Check current route and listen for route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateIsMapPage();
    });
    
    // Set initial page state
    this.updateIsMapPage();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    // Only apply fade effect on map page
    if (!this.isMapPage) {
      this.isVisible = true;
      return;
    }

    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    // Check if we've scrolled past threshold and direction is downward
    if (currentScrollPosition > this.lastScrollPosition && 
        currentScrollPosition > this.scrollThreshold) {
      this.isVisible = false;
    } else {
      this.isVisible = true;
    }
    
    this.lastScrollPosition = currentScrollPosition;
  }
}
