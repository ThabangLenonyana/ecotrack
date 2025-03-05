import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
    },

    {
      path: 'dashboard',
      loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
    }
];
