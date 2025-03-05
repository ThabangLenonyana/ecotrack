import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Activity } from '../models/activity';
import { DashboardStat } from '../models/dashboard-stat';
import { QuickAction } from '../models/quick-action';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  
  constructor() { }
  
  getStats(): Observable<DashboardStat[]> {
    const stats: DashboardStat[] = [
      {
        count: 12,
        increase: 24,
        label: 'Categories',
        icon: 'fas fa-folder',
        color: 'green'
      },
      {
        count: 45,
        increase: 12,
        label: 'Guidelines',
        icon: 'fas fa-book',
        color: 'blue'
      },
      {
        count: 28,
        increase: 18,
        label: 'Tips',
        icon: 'fas fa-lightbulb',
        color: 'yellow'
      },
      {
        count: 87,
        increase: 32,
        label: 'Engagement',
        icon: 'fas fa-chart-line',
        color: 'purple'
      }
    ];
    
    // Simulate API delay
    return of(stats).pipe(delay(800));
  }
  
  getRecentActivities(): Observable<Activity[]> {
    const activities: Activity[] = [
      {
        description: 'New category "Electronics" added',
        timeAgo: '2 minutes ago',
        color: 'green'
      },
      {
        description: 'Updated guideline for "Paper Recycling"',
        timeAgo: '1 hour ago',
        color: 'blue'
      },
      {
        description: 'Assigned tip to "Plastics" category',
        timeAgo: '3 hours ago',
        color: 'yellow'
      },
      {
        description: 'Deleted outdated guideline',
        timeAgo: '1 day ago',
        color: 'red'
      },
      {
        description: 'System maintenance completed',
        timeAgo: '2 days ago',
        color: 'gray'
      }
    ];
    
    // Simulate API delay
    return of(activities).pipe(delay(1200));
  }
  
  getQuickActions(): Observable<QuickAction[]> {
    const quickActions: QuickAction[] = [
      {
        label: 'Add Category',
        icon: 'fas fa-folder-plus',
        color: 'green',
        action: 'add-category',
        route: '/dashboard/categories'
      },
      {
        label: 'Add Guideline',
        icon: 'fas fa-file-alt',
        color: 'blue',
        action: 'add-guideline',
        route: '/dashboard/guidelines'
      },
      {
        label: 'Add Tip',
        icon: 'fas fa-lightbulb',
        color: 'yellow',
        action: 'add-tip',
        route: '/dashboard/tips'
      },
      {
        label: 'View Reports',
        icon: 'fas fa-chart-bar',
        color: 'purple',
        action: 'view-reports',
        route: '/dashboard/reports'
      }
    ];
    
    // Return immediately since this doesn't need a loading state
    return of(quickActions);
  }
}