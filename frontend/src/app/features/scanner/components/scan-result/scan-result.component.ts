// src/app/features/scanner/components/scan-result/scan-result.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ScannerService } from '../../../../service/scanner.service';
import { ImageAnalysisResponse } from '../../../../models/image-analysis.model';

@Component({
  selector: 'app-scan-result',
  templateUrl: './scan-result.component.html',
  styleUrls: ['./scan-result.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ScanResultComponent implements OnInit {
  result: ImageAnalysisResponse | null = null;
  
  constructor(
    private scannerService: ScannerService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.result = this.scannerService.getCurrentResult();
    
    // If no result is found, redirect to scanner
    if (!this.result) {
      this.router.navigate(['/scanner']);
    }
  }

  scanNew(): void {
    this.scannerService.clearResult();
    this.router.navigate(['/scanner']);
  }

  getMapUrl(location: any): string {
    return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
  }

  getMaterialStatusClass(): string {
    if (!this.result) return '';
    return this.result.material.recyclable ? 'recyclable' : 'non-recyclable';
  }

  getMaterialStatusText(): string {
    if (!this.result) return '';
    return this.result.material.recyclable ? 'Recyclable' : 'Non-Recyclable';
  }

  getMaterialStatusBadgeClass(): string {
    if (!this.result?.material.recyclable) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-green-100 text-green-800';
  }

  getMaterialStatusIcon(): string {
    if (!this.result?.material.recyclable) {
      return 'fa-trash-alt';
    }
    return 'fa-recycle';
  }

  getMaterialStatusIconClass(): string {
    if (!this.result?.material.recyclable) {
      return 'bg-red-100/20 backdrop-blur-sm';
    }
    return 'bg-green-100/20 backdrop-blur-sm';
  }
}