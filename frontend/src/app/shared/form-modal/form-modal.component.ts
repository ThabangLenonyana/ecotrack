import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-form-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-modal.component.html',
  styleUrl: './form-modal.component.scss'
})
export class FormModalComponent {
  @Input() title = 'Form';
  @Input() icon = 'fas fa-edit';
  @Input() colorClass = 'from-green-500 to-green-600';
  @Input() submitButtonText = 'Save';
  @Input() cancelButtonText = 'Cancel';
  @Input() submitButtonClass = 'bg-green-500 hover:bg-green-600';
  @Input() isSubmitDisabled = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();

  onSubmit(): void {
    this.submit.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}