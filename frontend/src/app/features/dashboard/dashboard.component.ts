import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderNavComponent } from '../../shared/components/header-nav/header-nav.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderNavComponent, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  // Define dashboard-specific navigation items
  dashboardNavItems = [
    { href: '/dashboard/overview', icon: 'fas fa-chart-pie', label: 'Overview' },
    { href: '/dashboard/categories', icon: 'fas fa-tags', label: 'Categories' },
    { href: '/dashboard/guidelines', icon: 'fas fa-book', label: 'Guidelines' },
    { href: '/dashboard/tips', icon: 'fas fa-lightbulb', label: 'Tips' },
    { href: '/dashboard/reports', icon: 'fas fa-chart-bar', label: 'Reports' }
  ];
  
  // Define dashboard-specific page descriptions
  dashboardPageDescriptions = {
    'overview': 'Get a quick snapshot of waste management analytics and metrics to monitor your environmental impact.',
    'categories': 'Manage waste categories and classification standards to ensure proper sorting and disposal.',
    'guidelines': 'Create and edit disposal guidelines to educate users on proper waste handling techniques.',
    'tips': 'Share recycling tips and sustainability suggestions to promote eco-friendly practices.',
    'reports': 'View detailed analytics on waste management performance and environmental impact metrics.'
  };
}
