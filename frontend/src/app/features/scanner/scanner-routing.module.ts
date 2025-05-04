// src/app/features/scanner/scanner-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScannerComponent } from './scanner.component';
import { ScanResultComponent } from './components/scan-result/scan-result.component';

const routes: Routes = [
  { 
    path: '', 
    component: ScannerComponent 
  },
  { 
    path: 'result', 
    component: ScanResultComponent 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScannerRoutingModule { }