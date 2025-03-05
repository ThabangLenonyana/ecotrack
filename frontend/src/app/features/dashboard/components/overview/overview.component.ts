import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Activity } from '../../../../models/activity';
import { DashboardStat } from '../../../../models/dashboard-stat';
import { QuickAction } from '../../../../models/quick-action';
import { DashboardService } from '../../../../service/dashboard.service';


@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit {
  stats: DashboardStat[] = [];
  recentActivities: Activity[] = [];
  quickActions: QuickAction[] = [];
  loading = {
    stats: true,
    activities: true
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentActivity();
    this.setupQuickActions();
  }

  private loadStats(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading.stats = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.loading.stats = false;
      }
    });
  }

  private loadRecentActivity(): void {
    this.dashboardService.getRecentActivities().subscribe({
      next: (data) => {
        this.recentActivities = data;
        this.loading.activities = false;
      },
      error: (error) => {
        console.error('Error loading activities:', error);
        this.loading.activities = false;
      }
    });
  }

  private setupQuickActions(): void {
    this.dashboardService.getQuickActions().subscribe({
      next: (data) => {
        // Add descriptions if they don't exist in the data from the service
        this.quickActions = data.map(action => ({
          ...action,
          description: action.description || this.getDefaultDescription(action.action)
        }));
      },
      error: (error) => {
        console.error('Error loading quick actions:', error);
      }
    });
  }

  private getDefaultDescription(action: string): string {
    const descriptions: {[key: string]: string} = {
      'add-category': 'Create a new waste category',
      'add-guideline': 'Create disposal guidelines',
      'add-tip': 'Share recycling tips',
      'view-reports': 'Check performance metrics',
      'manage-users': 'Update user permissions',
      'settings': 'Configure application settings',
      'export-data': 'Download reports and data',
      'help': 'Get assistance and documentation'
    };
    
    
    return descriptions[action] || 'Perform quick action';
  }

  navigateTo(action: string, route?: string): void {
    if (route) {
      // Route navigation will be handled by routerLink in the template
      return;
    }
    
    console.log(`Action triggered: ${action}`);
    // Additional action logic can be implemented here
  }
}