import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Action {
  name: string;
  icon: string;
  label?: string;
  color?: string;
  tooltip?: string;
  visible?: boolean | ((item: any) => boolean);
  disabled?: boolean | ((item: any) => boolean);
}

@Component({
  selector: 'app-table-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-actions.component.html',
  styleUrl: './table-actions.component.scss'
})
export class TableActionsComponent {
  @Input() actions: Action[] = [];
  @Input() item: any;
  @Input() showDividers = true;
  
  @Output() actionClick = new EventEmitter<{action: string, item: any}>();
  
  onClick(action: Action): void {
    if (this.isDisabled(action)) {
      return;
    }
    this.actionClick.emit({action: action.name, item: this.item});
  }
  
  isVisible(action: Action): boolean {
    if (action.visible === undefined) {
      return true;
    }
    if (typeof action.visible === 'function') {
      return action.visible(this.item);
    }
    return action.visible;
  }
  
  isDisabled(action: Action): boolean {
    if (action.disabled === undefined) {
      return false;
    }
    if (typeof action.disabled === 'function') {
      return action.disabled(this.item);
    }
    return action.disabled;
  }
  
  getButtonClass(action: Action): string {
    const color = action.color || 'blue';
    const baseClass = `text-${color}-600 hover:text-${color}-800 p-2 rounded-full hover:bg-${color}-50 transition-colors`;
    
    if (this.isDisabled(action)) {
      return 'text-gray-400 p-2 cursor-not-allowed';
    }
    
    return baseClass;
  }
}