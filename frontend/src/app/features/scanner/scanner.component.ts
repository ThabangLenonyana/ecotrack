// src/app/features/scanner/scanner.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ScannerService } from '../../service/scanner.service';
import { CameraComponent } from './components/camera/camera.component';
import { HeaderNavComponent } from '../../shared/components/header-nav/header-nav.component';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.scss'],
  standalone: true,
  imports: [CommonModule, CameraComponent, HeaderNavComponent]
})
export class ScannerComponent implements OnInit {
  // Scanner navigation items
  scannerNavItems = [
    { href: '/scanner', icon: 'fas fa-camera', label: 'Scan' },
    { href: '/scanner/history', icon: 'fas fa-history', label: 'History' },
    { href: '/scanner/guide', icon: 'fas fa-book', label: 'Guide' },
  ];

  // Scanner page descriptions
  scannerPageDescriptions = {
    'scanner': 'Scan waste items to identify recyclability and disposal methods.',
    'history': 'View your past scan results and recycling activity.',
    'guide': 'Learn how to properly scan and identify different types of waste materials.',
    'result': 'View detailed analysis of your scanned waste item.'
  };

  capturedImage: string | null = null;
  imageFile: File | null = null;
  isCapturing = false;
  isLoading = false;
  errorMessage: string | null = null;
  
  // Location data
  locationPermissionGranted = false;
  latitude: number | null = null;
  longitude: number | null = null;

  constructor(
    private scannerService: ScannerService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.requestLocationPermission();
  }

  startCapture(): void {
    this.isCapturing = true;
  }

  onImageCaptured(imageData: { dataUrl: string, file: File }): void {
    this.capturedImage = imageData.dataUrl;
    this.imageFile = imageData.file;
    this.isCapturing = false;
  }

  cancelCapture(): void {
    this.isCapturing = false;
  }

  retakePhoto(): void {
    this.capturedImage = null;
    this.imageFile = null;
    this.errorMessage = null;
  }
  
  // New method to handle file selection from device
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Check if file is an image
      if (!file.type.match('image.*')) {
        this.errorMessage = 'Please select an image file.';
        return;
      }
      
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.errorMessage = 'Image size should not exceed 10MB.';
        return;
      }
      
      // Create a data URL from the file
      const reader = new FileReader();
      reader.onload = (e) => {
        this.capturedImage = e.target?.result as string;
        this.imageFile = file;
      };
      reader.onerror = () => {
        this.errorMessage = 'Error reading the image file.';
      };
      reader.readAsDataURL(file);
    }
  }

  analyzeWaste(): void {
    if (!this.imageFile) {
      this.errorMessage = 'No image captured. Please take a photo first.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.scannerService.analyzeImage(
      this.imageFile, 
      this.latitude || undefined, 
      this.longitude || undefined
    ).subscribe({
      next: (result) => {
        this.scannerService.setCurrentResult(result);
        this.isLoading = false;
        this.router.navigate(['/scanner/result']);
      },
      error: (error) => {
        console.error('Error analyzing image:', error);
        this.isLoading = false;
        this.errorMessage = 'Failed to analyze the image. Please try again.';
      }
    });
  }

  private requestLocationPermission(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.locationPermissionGranted = true;
        },
        (error) => {
          console.warn('Location permission denied:', error);
          this.locationPermissionGranted = false;
        }
      );
    } else {
      console.warn('Geolocation not supported by this browser');
      this.locationPermissionGranted = false;
    }
  }
}