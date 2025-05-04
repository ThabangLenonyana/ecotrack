// src/app/features/scanner/components/camera/camera.component.ts
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class CameraComponent implements OnInit, OnDestroy {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;
  @Output() captureComplete = new EventEmitter<{dataUrl: string, file: File}>();
  @Output() captureCancelled = new EventEmitter<void>();
  
  stream: MediaStream | null = null;
  error: string | null = null;
  isLoading = true;
  currentFacingMode = 'environment'; // default to rear camera
  hasMultipleCameras = false;

  constructor() {}

  ngOnInit(): void {
    this.checkForMultipleCameras();
    this.initCamera();
  }

  ngOnDestroy(): void {
    this.stopStream();
  }

  private async checkForMultipleCameras(): Promise<void> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      this.hasMultipleCameras = videoDevices.length > 1;
    } catch (err) {
      console.error('Error checking for multiple cameras:', err);
    }
  }

  private async initCamera(): Promise<void> {
    try {
      this.isLoading = true;
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: this.currentFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (this.videoElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
      }
    } catch (err) {
      this.error = 'Could not access camera. Please check permissions.';
      console.error('Camera error:', err);
    } finally {
      this.isLoading = false;
    }
  }

  switchCamera(): void {
    this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
    this.stopStream();
    this.initCamera();
  }

  private stopStream(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  capture(): void {
    if (!this.videoElement || !this.canvasElement || !this.stream) {
      return;
    }

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    
    // Set canvas size to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg');
      
      // Convert to File object
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'waste-image.jpg', { type: 'image/jpeg' });
          this.captureComplete.emit({ dataUrl, file });
        }
      }, 'image/jpeg', 0.95);
    }
    
    // Stop the camera
    this.stopStream();
  }

  cancel(): void {
    this.stopStream();
    this.captureCancelled.emit();
  }
}