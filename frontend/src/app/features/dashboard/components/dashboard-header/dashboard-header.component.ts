import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { DashboardNavComponent } from '../dashboard-nav/dashboard-nav.component';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, RouterModule, DashboardNavComponent],
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.scss'
})
export class DashboardHeaderComponent implements OnInit {
  currentPage = 'Overview';
  pageDescriptions: { [key: string]: string } = {
    'overview': 'Get a quick snapshot of waste management analytics and metrics to monitor your environmental impact.',
    'categories': 'Manage waste categories and classification standards to ensure proper sorting and disposal.',
    'guidelines': 'Create and edit disposal guidelines to educate users on proper waste handling techniques.',
    'tips': 'Share recycling tips and sustainability suggestions to promote eco-friendly practices.',
    'reports': 'View detailed analytics on waste management performance and environmental impact metrics.'
  };
  
  currentDescription = this.pageDescriptions['overview'];
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    // Set initial page based on current URL
    this.updatePageInfo(this.router.url);
    
    // Subscribe to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => event as NavigationEnd)
    ).subscribe((event) => {
      this.updatePageInfo(event.urlAfterRedirects);
    });
  }
  
  private updatePageInfo(url: string): void {
    const urlParts = url.split('/');
    const page = urlParts[urlParts.length - 1] || 'overview';
    
    // Set current page name (capitalize first letter)
    this.currentPage = page.charAt(0).toUpperCase() + page.slice(1);
    
    // Set page description
    this.currentDescription = this.pageDescriptions[page.toLowerCase()] || 
      'Manage your waste management system efficiently and sustainably.';
  }
}