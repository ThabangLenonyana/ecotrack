import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss'
})
export class ConfirmModalComponent {
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to perform this action?';
  @Input() confirmButtonText = 'Confirm';
  @Input() cancelButtonText = 'Cancel';
  @Input() confirmButtonClass = 'bg-red-500 hover:bg-red-600';
  @Input() icon = 'fas fa-exclamation-triangle';
  @Input() iconClass = 'text-red-500';
  @Input() showBackdrop = true;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}