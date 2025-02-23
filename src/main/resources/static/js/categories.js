console.log('Categories.js loaded');

const DEBUG = true;
debugLog('Debug logging initialized');
function debugLog(message, data = null) {
    if (DEBUG) {
        if (data) {
            console.log(`[Categories] ${message}:`, data);
        } else {
            console.log(`[Categories] ${message}`);
        }
    }
}
// DOM Elements and Templates
const modalContainer = document.getElementById('modal-container');
const categoriesTableContainer = document.getElementById('categories-table-container');

// Constants
const TEMPLATE_PATHS = {
    table: '/components/category-table.html',
    form: '/components/category-form-modal.html',
    actions: '/components/category-actions.html',
    confirm: '/components/confirm-modal.html'
};

// Create namespace for Categories module
const CategoryManager = {
    DEBUG: true,
    templates: {},
    TEMPLATE_PATH: {
        table: '/components/category-table.html',
        form: '/components/category-form-modal.html',
        actions: '/components/category-actions.html',
        confirm: '/components/confirm-modal.html'
    },

    debugLog(message, data = null) {
        if (this.DEBUG) {
            if (data) {
                console.log(`[Categories] ${message}:`, data);
            } else {
                console.log(`[Categories] ${message}`);
            }
        }
    },

    async loadTemplates() {
        try {
            this.debugLog('Starting template loading process');
            
            // Add missing modalContainer check
            if (!modalContainer) {
                this.debugLog('Modal container not found');
                throw new Error('Modal container not found');
            }

            // Ensure template container exists
            let templateContainer = document.getElementById('templates-container');
            if (!templateContainer) {
                this.debugLog('Creating template container');
                templateContainer = document.createElement('div');
                templateContainer.id = 'templates-container';
                document.body.appendChild(templateContainer);
            }

            // Load all templates
            const templateLoads = Object.entries(this.TEMPLATE_PATH).map(async ([key, path]) => {
                this.debugLog(`Loading template: ${key} from ${path}`);
                const response = await fetch(path);
                const html = await response.text();
                return { key, html };
            });

            // Wait for all templates to load
            const loadedTemplates = await Promise.all(templateLoads);
            
            // Clear and update template container
            templateContainer.innerHTML = loadedTemplates.map(t => t.html).join('');
            
            // Update template references with explicit IDs
            this.templates = {
                table: document.getElementById('categories-table-template'),
                form: document.getElementById('category-form-modal-template'),
                actions: document.getElementById('category-actions-template'),
                confirm: document.getElementById('confirm-modal-template'),
                row: document.getElementById('category-row-template'),
                rowActions: document.getElementById('row-actions-template')
            };

            // Verify all templates are loaded
            Object.entries(this.templates).forEach(([key, template]) => {
                if (!template) {
                    throw new Error(`Template ${key} not found after loading`);
                }
                this.debugLog(`Template ${key} loaded successfully`);
            });

            return true;
        } catch (error) {
            this.debugLog('Template loading failed:', error);
            console.error('Template loading failed:', error);
            return false;
        }
    }
};

/**
 * Initialize categories section with improved error handling
 */
async function initializeCategoriesSection() {
    try {
        console.log('Starting categories initialization');
        const section = document.getElementById('categories-section');
        
        if (!section) {
            throw new Error('Categories section not found');
        }

        // Load templates first
        let templatesLoaded = await CategoryManager.loadTemplates();
        if (!templatesLoaded) {
            throw new Error('Failed to load templates');
        }

        // Clear section and add action buttons
        const actionsTemplate = CategoryManager.templates.actions;
        if (!actionsTemplate) {
            throw new Error('Actions template not found');
        }

        const actionsContent = actionsTemplate.content.cloneNode(true);
        section.insertBefore(actionsContent, section.firstChild);

        // Setup event listeners explicitly
        const addButton = document.getElementById('add-category-btn');
        if (!addButton) {
            throw new Error('Add category button not found');
        }

        addButton.addEventListener('click', () => {
            console.log('Add category button clicked');
            showCategoryForm();
        });

        // Initialize table
        await loadCategoriesTable();
        
        console.log('Categories section initialized successfully');

    } catch (error) {
        console.error('Failed to initialize categories:', error);
        showError(`Categories initialization failed: ${error.message}`);
    }
}

/**
 * Load and render categories table
 */
async function loadCategoriesTable() {
    try {
        const categories = await ApiService.getCategories();
        renderCategoriesTable(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
        showError('Failed to load categories');
    }
}

/**
 * Render categories table
 */
function renderCategoriesTable(categories) {
    if (!CategoryManager.templates.table || !categoriesTableContainer) {
        console.error('Missing required templates or containers');
        return;
    }
    
    try {
        const tableContent = CategoryManager.templates.table.content.cloneNode(true);
        const tbody = tableContent.querySelector('tbody');
        
        if (tbody) {
            if (categories.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                            No categories found
                        </td>
                    </tr>
                `;
            } else {
                categories.forEach(category => {
                    const row = createCategoryRow(category);
                    if (row) tbody.appendChild(row);
                });
            }
            
            categoriesTableContainer.innerHTML = '';
            categoriesTableContainer.appendChild(tableContent);
        }
    } catch (error) {
        console.error('Error rendering categories table:', error);
        showError('Failed to render categories');
    }
}

// Create table row for a category
function createCategoryRow(category) {
    const row = CategoryManager.templates.row.content.cloneNode(true);
    
    // Populate row data
    row.querySelector('tr').setAttribute('data-category-id', category.id);
    row.querySelector('[data-category-name]').textContent = category.name;
    row.querySelector('[data-category-description]').textContent = category.description;
    row.querySelector('[data-guidelines-count]').textContent = 
        `${category.disposalGuidelines?.length || 0} guidelines`;
    row.querySelector('[data-tips-count]').textContent = 
        `${category.recyclingTips?.length || 0} tips`;

    // Add action buttons
    const actionButtons = CategoryManager.templates.rowActions.content.cloneNode(true);
    row.querySelector('[data-action-buttons]').appendChild(actionButtons);

    // Setup action buttons
    row.querySelector('[data-edit-btn]').addEventListener('click', () => showCategoryForm(category));
    row.querySelector('[data-delete-btn]').addEventListener('click', () => deleteCategory(category.id));
    
    return row;
}

// Show category form modal
function showCategoryForm(category = null) {
    try {
        // Check if template exists
        if (!CategoryManager.templates.form) {
            throw new Error('Category form template not found');
        }

        const modalContent = CategoryManager.templates.form.content.cloneNode(true);
        const form = modalContent.querySelector('#category-form');
        const titleElement = modalContent.querySelector('[data-modal-title]');
        
        if (!form || !titleElement) {
            throw new Error('Required form elements not found');
        }

        // Set form title and populate fields if editing
        titleElement.textContent = category ? 'Edit Category' : 'Add New Category';
        
        if (category) {
            form.name.value = category.name || '';
            form.description.value = category.description || '';
        }
        
        // Setup form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                name: form.name.value.trim(),
                description: form.description.value.trim()
            };
            
            try {
                if (category) {
                    await ApiService.updateCategory(category.id, formData);
                } else {
                    await ApiService.createCategory(formData);
                }
                closeModal();
                await loadCategoriesTable(); // Refresh table
            } catch (error) {
                console.error('Error saving category:', error);
                showError('Failed to save category');
            }
        });
        
        // Setup close button
        const closeButton = modalContent.querySelector('[data-close-modal]');
        if (closeButton) {
            closeButton.addEventListener('click', closeModal);
        }
        
        // Show modal
        if (!modalContainer) {
            throw new Error('Modal container not found');
        }
        
        modalContainer.innerHTML = '';
        modalContainer.appendChild(modalContent);
        modalContainer.classList.remove('hidden');
    } catch (error) {
        console.error('Error showing category form:', error);
        showError('Failed to show category form');
    }
}

// Delete category
async function deleteCategory(id) {
    const row = document.querySelector(`[data-category-id="${id}"]`);
    if (!row) {
        console.error('Category row not found');
        return;
    }

    try {
        const confirmed = await ConfirmDialog.show({
            title: 'Delete Category',
            message: 'Are you sure you want to delete this category?',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            confirmClass: 'px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600'
        });

        if (!confirmed) return;

        row.classList.add('opacity-50');
        
        await ApiService.deleteCategory(id);
        await loadCategoriesTable();
        
        showToast('Category deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting category:', error);
        showToast(error.message || 'Failed to delete category', 'error');
        if (row) row.classList.remove('opacity-50');
    }
}

// Helper function for showing toasts
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `px-4 py-2 rounded-lg shadow-lg mb-2 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    toast.textContent = message;
    
    document.getElementById('toast-container')?.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Close modal
function closeModal() {
    modalContainer.classList.add('hidden');
    setTimeout(() => {
        modalContainer.innerHTML = '';
    }, 200);
}

// Show error message
function showError(message) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg mb-2';
    toast.textContent = message;

    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    const addButton = document.getElementById('add-category-btn');
    if (addButton) {
        // Consistent event listener registration
        addButton.addEventListener('click', () => showCategoryForm());
    } else {
        CategoryManager.debugLog('Add category button not found');
    }
}

