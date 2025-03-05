import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      
      {
        path: 'overview',
        loadComponent: () => import('./components/overview/overview.component').then(m => m.OverviewComponent)
      },
      
      {
        path: 'categories',
        loadComponent: () => import('./components/categories/categories.component').then(m => m.CategoriesComponent)
      },
      
      {
        path: 'guidelines',
        loadComponent: () => import('./components/guidelines/guidelines.component').then(m => m.GuidelinesComponent)
      },
      /*
      {
        path: 'tips',
        loadComponent: () => import('./pages/tips/tips.component').then(m => m.TipsComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent)
      }
      */
    ] 
    
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }