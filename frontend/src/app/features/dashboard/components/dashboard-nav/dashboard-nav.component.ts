import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-dashboard-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-nav.component.html',
  styleUrl: './dashboard-nav.component.scss'
})
export class DashboardNavComponent {
  navItems = [
    { 
      href: '/dashboard/overview', 
      icon: 'fas fa-chart-pie', 
      label: 'Overview' 
    },
    { 
      href: '/dashboard/categories', 
      icon: 'fas fa-tags', 
      label: 'Categories' 
    },
    { 
      href: '/dashboard/guidelines', 
      icon: 'fas fa-book', 
      label: 'Guidelines' 
    },
    { 
      href: '/dashboard/tips', 
      icon: 'fas fa-lightbulb', 
      label: 'Tips' 
    },
    { 
      href: '/dashboard/reports', 
      icon: 'fas fa-chart-bar', 
      label: 'Reports' 
    }
  ];
}
