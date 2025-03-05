import { CommonModule } from '@angular/common';
import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

export interface TableColumn {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  cellTemplate?: TemplateRef<any>;
  template?: string; // Added template field for dynamic template selection
}

export interface TableConfig {
  columns: TableColumn[];
  showSearch?: boolean;
  searchPlaceholder?: string;
  itemsPerPage?: number;
  tableClasses?: string;       // Added custom table classes
  headerClasses?: string;      // Added custom header classes
  cellClasses?: string;        // Added custom cell classes
  disableHorizontalScroll?: boolean; // Added option to disable horizontal scroll
  overflowHandling?: 'truncate' | 'wrap'; // Added overflow handling option
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent {
  @Input() config!: TableConfig;
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() noDataMessage = 'No data available';
  @Input() noResultMessage = 'No matching results found';
  @Input() emptyStateIcon = 'fas fa-folder-open';
  @Input() loadingIcon = 'fas fa-circle-notch fa-spin';
  
  @Input() set searchTerm(value: string) {
    this._searchTerm = value;
    this.applyFilters();
  }
  
  get searchTerm(): string {
    return this._searchTerm;
  }
  
  @Output() rowClick = new EventEmitter<any>();
  @Output() search = new EventEmitter<string>();
  @Output() actionClick = new EventEmitter<{action: string, item: any}>();
  
  @ContentChild('actionsTemplate') actionsTemplate?: TemplateRef<any>;
  @ContentChild('emptyStateTemplate') emptyStateTemplate?: TemplateRef<any>;
  @ContentChild('loadingTemplate') loadingTemplate?: TemplateRef<any>;
  
  // Add support for dynamic templates
  @ContentChild('nameTemplate') nameTemplate?: TemplateRef<any>;
  @ContentChild('descriptionTemplate') descriptionTemplate?: TemplateRef<any>;
  @ContentChild('guidelinesTemplate') guidelinesTemplate?: TemplateRef<any>;
  @ContentChild('tipsTemplate') tipsTemplate?: TemplateRef<any>;
  
  filteredData: any[] = [];
  private _searchTerm = '';
  
  ngOnChanges() {
    this.applyFilters();
  }
  
  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this._searchTerm = target.value;
    this.search.emit(this._searchTerm);
    this.applyFilters();
  }
  
  onRowClick(item: any): void {
    this.rowClick.emit(item);
  }
  
  // Get template by name
  getTemplateByName(templateName: string): TemplateRef<any> | undefined {
    const templates: {[key: string]: TemplateRef<any> | undefined} = {
      'actionsTemplate': this.actionsTemplate,
      'nameTemplate': this.nameTemplate,
      'descriptionTemplate': this.descriptionTemplate,
      'guidelinesTemplate': this.guidelinesTemplate,
      'tipsTemplate': this.tipsTemplate
    };
    return templates[templateName];
  }
  
  private applyFilters(): void {
    if (!this.data) {
      this.filteredData = [];
      return;
    }
    
    if (!this._searchTerm) {
      this.filteredData = [...this.data];
      return;
    }
    
    const searchStr = this._searchTerm.toLowerCase();
    this.filteredData = this.data.filter(item => {
      return this.config.columns.some(column => {
        const value = this.getNestedProperty(item, column.key);
        return value && String(value).toLowerCase().includes(searchStr);
      });
    });
  }
  
  public getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  }
}