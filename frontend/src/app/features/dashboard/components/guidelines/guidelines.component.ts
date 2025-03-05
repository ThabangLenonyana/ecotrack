import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DisposalGuideline } from '../../../../models/disposal-guideline';
import { WasteCategory } from '../../../../models/waste-category';
import { ApiService } from '../../../../service/api.service';
import { ConfirmModalComponent } from '../../../../shared/confirm-modal/confirm-modal.component';
import { DataTableComponent } from '../../../../shared/data-table/data-table.component';
import { FormModalComponent } from '../../../../shared/form-modal/form-modal.component';
import { Action, TableActionsComponent } from '../../../../shared/table-actions/table-actions.component';

@Component({
  selector: 'app-guidelines',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    DataTableComponent,
    ConfirmModalComponent,
    FormModalComponent,
    TableActionsComponent
  ],
  templateUrl: './guidelines.component.html',
  styleUrl: './guidelines.component.scss'
})
export class GuidelinesComponent implements OnInit {
  @ViewChild('titleTemplate') titleTemplate!: TemplateRef<any>;
  @ViewChild('instructionsTemplate') instructionsTemplate!: TemplateRef<any>;
  @ViewChild('categoryTemplate') categoryTemplate!: TemplateRef<any>;

  guidelines: DisposalGuideline[] = [];
  categories: WasteCategory[] = [];
  loading = true;
  loadingCategories = true;
  searchTerm = '';
  
  // Form modal state
  showFormModal = false;
  guidelineForm: FormGroup;
  isEditMode = false;
  currentGuidelineId?: number;
  
  // Assign modal state
  showAssignModal = false;
  assignForm: FormGroup;
  guidelineToAssign?: DisposalGuideline;
  
  // Confirm delete modal state
  showDeleteModal = false;
  guidelineToDelete?: DisposalGuideline;
  
  // Table configuration
  tableConfig: {
    columns: Array<{
      key: string;
      header: string;
      width: string;
      template?: string;
    }>;
    showSearch: boolean;
    searchPlaceholder: string;
    tableClasses?: string;
    cellClasses?: string;
    headerClasses?: string;
    disableHorizontalScroll?: boolean;
    overflowHandling?: 'truncate' | 'wrap';
  } = {
    columns: [
      { 
        key: 'title', 
        header: 'Guideline Title', 
        width: '25%',
        template: 'titleTemplate'
      },
      { 
        key: 'instructions', 
        header: 'Guideline Instructions', 
        width: '45%',
        template: 'instructionsTemplate'
      },
      { 
        key: 'categoryId', 
        header: 'Category', 
        width: '15%',
        template: 'categoryTemplate'
      },
      { 
        key: 'actions',
        header: 'Actions',
        width: '15%',
        template: 'actionsTemplate'
      }
    ],
    showSearch: true,
    searchPlaceholder: 'Search guidelines...',
    tableClasses: 'table-fixed w-full whitespace-nowrap',
    cellClasses: 'px-4 py-3 text-sm overflow-hidden',
    headerClasses: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
    disableHorizontalScroll: true,
    overflowHandling: 'truncate'
  };

  // Table actions
  tableActions: Action[] = [
    { 
      name: 'assign', 
      icon: 'fas fa-link', 
      color: 'green', 
      tooltip: 'Assign to category'
    },
    { 
      name: 'edit', 
      icon: 'fas fa-edit', 
      color: 'blue', 
      tooltip: 'Edit guideline'
    },
    { 
      name: 'delete', 
      icon: 'fas fa-trash', 
      color: 'red', 
      tooltip: 'Delete guideline'
    }
  ];

  constructor(private apiService: ApiService, private fb: FormBuilder) {
    this.guidelineForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      instructions: ['', [Validators.required, Validators.minLength(10)]],
      categoryId: ['']
    });
    
    this.assignForm = this.fb.group({
      categoryId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadGuidelines();
    this.loadCategories();
  }

  loadGuidelines(): void {
    this.loading = true;
    this.apiService.getAllGuidelines().subscribe({
      next: (data) => {
        this.guidelines = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading guidelines:', error);
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.loadingCategories = true;
    this.apiService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loadingCategories = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loadingCategories = false;
      }
    });
  }

  getCategoryNameById(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unassigned';
  }

  onSearch(term: string): void {
    this.searchTerm = term;
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentGuidelineId = undefined;
    this.guidelineForm.reset({
      categoryId: ''
    });
    this.showFormModal = true;
  }

  openEditModal(guideline: DisposalGuideline): void {
    this.isEditMode = true;
    this.currentGuidelineId = guideline.id;
    this.guidelineForm.patchValue({
      title: guideline.title,
      instructions: guideline.instructions,
      categoryId: guideline.categoryId || ''
    });
    this.showFormModal = true;
  }

  openAssignModal(guideline: DisposalGuideline): void {
    this.guidelineToAssign = guideline;
    this.assignForm.patchValue({
      categoryId: guideline.categoryId || ''
    });
    this.showAssignModal = true;
  }

  onActionClick(event: {action: string, item: DisposalGuideline}): void {
    switch(event.action) {
      case 'edit':
        this.openEditModal(event.item);
        break;
      case 'delete':
        this.openDeleteConfirmation(event.item);
        break;
      case 'assign':
        this.openAssignModal(event.item);
        break;
    }
  }

  openDeleteConfirmation(guideline: DisposalGuideline): void {
    this.guidelineToDelete = guideline;
    this.showDeleteModal = true;
  }

  onFormSubmit(): void {
    if (this.guidelineForm.invalid) {
      this.guidelineForm.markAllAsTouched();
      return;
    }

    const guidelineData: DisposalGuideline = {
      ...this.guidelineForm.value,
      categoryId: this.guidelineForm.value.categoryId || null
    };

    if (this.isEditMode && this.currentGuidelineId) {
      this.apiService.updateGuideline(this.currentGuidelineId, guidelineData).subscribe({
        next: () => {
          this.closeFormModal();
          this.loadGuidelines();
        },
        error: (error) => console.error('Error updating guideline:', error)
      });
    } else {
      this.apiService.createGuideline(guidelineData).subscribe({
        next: () => {
          this.closeFormModal();
          this.loadGuidelines();
        },
        error: (error) => console.error('Error creating guideline:', error)
      });
    }
  }

  onAssignSubmit(): void {
    if (this.assignForm.invalid || !this.guidelineToAssign?.id) {
      return;
    }

    const updatedGuideline: DisposalGuideline = {
      ...this.guidelineToAssign,
      categoryId: this.assignForm.value.categoryId || null
    };

    this.apiService.updateGuideline(this.guidelineToAssign.id, updatedGuideline).subscribe({
      next: () => {
        this.closeAssignModal();
        this.loadGuidelines();
      },
      error: (error) => console.error('Error assigning guideline to category:', error)
    });
  }

  onDeleteConfirm(): void {
    if (!this.guidelineToDelete?.id) return;
    
    this.apiService.deleteGuideline(this.guidelineToDelete.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadGuidelines();
      },
      error: (error) => {
        console.error('Error deleting guideline:', error);
        this.closeDeleteModal();
      }
    });
  }

  closeFormModal(): void {
    this.showFormModal = false;
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.guidelineToAssign = undefined;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.guidelineToDelete = undefined;
  }
}