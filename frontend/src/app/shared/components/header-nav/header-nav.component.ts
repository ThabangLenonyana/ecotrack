import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { HeaderComponent } from '../../header/header.component';

@Component({
  selector: 'app-header-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './header-nav.component.html',
  styleUrls: ['./header-nav.component.scss']
})
export class HeaderNavComponent implements OnInit {
  // Customizable inputs
  @Input() title: string = 'Dashboard';
  @Input() navItems: any[] = [];
  @Input() pageDescriptions: { [key: string]: string } = {};
  @Input() defaultDescription: string = 'Manage your system efficiently and sustainably.';
  @Input() showProfileButtons: boolean = true;
  
  // Component state
  currentPage: string = '';
  currentDescription: string = '';
  
  constructor(public router: Router) {} // Changed to public for template access
  
  ngOnInit() {
    // Set initial page based on current URL
    this.updatePageInfo(this.router.url || '');
    
    // Subscribe to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => event as NavigationEnd)
    ).subscribe((event) => {
      this.updatePageInfo(event.urlAfterRedirects || '');
    });
    
    // Make sure navItems all have routes
    if (this.navItems) {
      this.navItems = this.navItems.map(item => ({
        ...item,
        route: item.route || '#'
      }));
    }
  }
  
  private updatePageInfo(url: string): void {
    if (!url) return;
    
    const urlParts = url.split('/');
    const page = urlParts[urlParts.length - 1] || 'overview';
    
    // Set current page name (capitalize first letter)
    this.currentPage = page.charAt(0).toUpperCase() + page.slice(1);
    
    // Set page description
    this.currentDescription = this.pageDescriptions[page.toLowerCase()] || 
      this.defaultDescription;
  }
}
