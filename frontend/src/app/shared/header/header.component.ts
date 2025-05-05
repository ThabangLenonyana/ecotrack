import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('mobileMenuAnimation', [
      state('closed', style({
        height: '0',
        opacity: 0
      })),
      state('open', style({
        height: '*',
        opacity: 1
      })),
      transition('closed => open', [
        animate('250ms ease-out')
      ]),
      transition('open => closed', [
        animate('200ms ease-in')
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit {
  isVisible = true;
  lastScrollPosition = 0;
  scrollThreshold = 50;
  isMapPage = false;
  isMobileMenuOpen = false;

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
      // Close mobile menu on navigation
      this.isMobileMenuOpen = false;
    });
    
    // Set initial page state
    this.updateIsMapPage();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    // When menu is open, prevent body scrolling
    if (this.isMobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    document.body.classList.remove('overflow-hidden');
  }

  navigateToScanner(): void {
    this.router.navigate(['/scanner']);
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

  @HostListener('window:resize')
  onWindowResize() {
    // Close mobile menu if screen is resized to desktop view
    if (window.innerWidth >= 768) { // 768px is the md breakpoint in Tailwind
      this.isMobileMenuOpen = false;
      document.body.classList.remove('overflow-hidden');
    }
  }

  isHomeRoute(): boolean {
    return this.router.url === '/';
  }

  isMapRoute(): boolean {
    return this.router.url.includes('/map');
  }

  isAboutRoute(): boolean {
    return this.router.url.includes('/about');
  }

  isDashboardRoute(): boolean {
    return this.router.url.includes('/dashboard');
  }
}
