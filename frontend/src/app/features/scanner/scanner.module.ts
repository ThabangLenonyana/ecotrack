// src/app/features/scanner/scanner.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ScannerRoutingModule } from './scanner-routing.module';
import { ScannerComponent } from './scanner.component';
import { ScanResultComponent } from './components/scan-result/scan-result.component';
import { CameraComponent } from './components/camera/camera.component';

@NgModule({
  imports: [
    CommonModule,
    ScannerRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    ScannerComponent,
    ScanResultComponent,
    CameraComponent
  ]
})
export class ScannerModule { }