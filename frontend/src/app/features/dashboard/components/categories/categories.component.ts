import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WasteCategory } from '../../../../models/waste-category';
import { ApiService } from '../../../../service/api.service';
import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal.component';
import { DataTableComponent } from '../../../../shared/data-table/data-table.component';
import { FormModalComponent } from '../../../../shared/form-modal/form-modal.component';
import { Action, TableActionsComponent } from '../../../../shared/table-actions/table-actions.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    DataTableComponent,
    ConfirmModalComponent,
    FormModalComponent,
    TableActionsComponent
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  categories: WasteCategory[] = [];
  loading = true;
  searchTerm = '';
  
  // Form modal state
  showFormModal = false;
  categoryForm: FormGroup;
  isEditMode = false;
  currentCategoryId?: number;
  
  // Confirm delete modal state
  showDeleteModal = false;
  categoryToDelete?: WasteCategory;
  
  // Table configuration
  tableConfig = {
    columns: [
      { 
        key: 'name', 
        header: 'Name', 
        width: '20%',
        template: 'nameTemplate'
      },
      { 
        key: 'description', 
        header: 'Description', 
        width: '45%',
        template: 'descriptionTemplate'
      },
      { 
        key: 'disposalGuidelines', 
        header: 'Guidelines', 
        width: '15%',
        template: 'guidelinesTemplate'
      },
      { 
        key: 'recyclingTips', 
        header: 'Tips', 
        width: '10%',
        template: 'tipsTemplate'
      },
      { 
        key: 'actions',
        header: 'Actions',
        width: '10%',
        template: 'actionsTemplate'
      }
    ],
    showSearch: true,
    searchPlaceholder: 'Search categories...',
    tableClasses: 'table-fixed w-full whitespace-nowrap',
    cellClasses: 'px-4 py-3 text-sm overflow-hidden',
    headerClasses: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
    disableHorizontalScroll: true,
    overflowHandling: 'truncate' as 'truncate' | 'wrap' | undefined
  };
  
  // Table actions
  tableActions: Action[] = [
    { 
      name: 'edit', 
      icon: 'fas fa-edit', 
      color: 'blue', 
      tooltip: 'Edit category'
    },
    { 
      name: 'delete', 
      icon: 'fas fa-trash', 
      color: 'red', 
      tooltip: 'Delete category'
    }
  ];

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.apiService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
        // You can implement a toast service for error messages
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentCategoryId = undefined;
    this.categoryForm.reset();
    this.showFormModal = true;
  }

  openEditModal(category: WasteCategory): void {
    this.isEditMode = true;
    this.currentCategoryId = category.id;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description
    });
    this.showFormModal = true;
  }

  onActionClick(event: {action: string, item: WasteCategory}): void {
    switch(event.action) {
      case 'edit':
        this.openEditModal(event.item);
        break;
      case 'delete':
        this.openDeleteConfirmation(event.item);
        break;
    }
  }

  openDeleteConfirmation(category: WasteCategory): void {
    this.categoryToDelete = category;
    this.showDeleteModal = true;
  }

  onFormSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const categoryData: WasteCategory = this.categoryForm.value;

    if (this.isEditMode && this.currentCategoryId) {
      this.apiService.updateCategory(this.currentCategoryId, categoryData).subscribe({
        next: () => {
          this.closeFormModal();
          this.loadCategories();
        },
        error: (error) => console.error('Error updating category:', error)
      });
    } else {
      this.apiService.createCategory(categoryData).subscribe({
        next: () => {
          this.closeFormModal();
          this.loadCategories();
        },
        error: (error) => console.error('Error creating category:', error)
      });
    }
  }

  onDeleteConfirm(): void {
    if (!this.categoryToDelete?.id) return;
    
    this.apiService.deleteCategory(this.categoryToDelete.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error deleting category:', error);
        this.closeDeleteModal();
      }
    });
  }

  closeFormModal(): void {
    this.showFormModal = false;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.categoryToDelete = undefined;
  }
}