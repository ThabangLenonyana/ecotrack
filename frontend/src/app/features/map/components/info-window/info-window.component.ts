import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecyclingFacility } from '../../../../models/recycling-facility';
import { FacilityTypeMapper } from '../../../../utils/facility-type-mapper';

@Component({
  selector: 'app-info-window',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info-window.component.html',
  styleUrls: ['./info-window.component.scss']
})
export class InfoWindowComponent {
  @Input() facility!: RecyclingFacility;
  @Output() closeWindow = new EventEmitter<void>();
  
  // Get facility type icon and color using the mapper
  getIcon(type: string | undefined): string {
    return type ? FacilityTypeMapper.getFontAwesomeIcon(type) : 'fas fa-recycle';
  }
  
  getColor(type: string | undefined): string {
    return type ? FacilityTypeMapper.getMarkerColor(type) : '#16a34a';
  }
  
  // Format accepted materials list from the object
  getAcceptedMaterials(): string[] {
    if (!this.facility.acceptedMaterials) return [];
    
    return Object.entries(this.facility.acceptedMaterials)
      .filter(([_, accepted]) => accepted)
      .map(([material, _]) => this.formatMaterialName(material));
  }
  
  // Format material name for display (convert camelCase to Title Case)
  private formatMaterialName(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }
  
  close(): void {
    this.closeWindow.emit();
  }
  
  openWebsite(website: string): void {
    if (!website.startsWith('http')) {
      website = 'https://' + website;
    }
    window.open(website, '_blank');
  }
}