import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardHeaderComponent } from './components/dashboard-header/dashboard-header.component';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardHeaderComponent, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
