// src/main/resources/static/js/dashboard/categories.js
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

// Template references object
const templates = {
    table: null,
    row: null,
    form: null,  // Changed from formModal to form to match the template ID
    actions: null,
    rowActions: null,
    confirm: null

};

/**
 * Initialize categories section
 */
async function initializeCategoriesSection() {
    const section = document.getElementById('categories-section');
    if (!section) {
        console.error('Categories section not found');
        return;
    }
    
    if (await loadTemplates()) {
        // Add action buttons
        const actionsContent = templates.actions.content.cloneNode(true);
        section.insertBefore(actionsContent, section.firstChild);
        
        // Create table container if it doesn't exist
        if (!categoriesTableContainer) {
            categoriesTableContainer = document.createElement('div');
            categoriesTableContainer.id = 'categories-table-container';
            section.appendChild(categoriesTableContainer);
        }

        // Initialize table
        await loadCategoriesTable();
        setupEventListeners();
    }
}

/**
 * Load all required templates
 */
async function loadTemplates() {
    try {
        const [tableHtml, formHtml, actionsHtml, confirmHtml] = await Promise.all([
            fetch(TEMPLATE_PATHS.table).then(res => res.text()),
            fetch(TEMPLATE_PATHS.form).then(res => res.text()),
            fetch(TEMPLATE_PATHS.actions).then(res => res.text()),
            fetch(TEMPLATE_PATHS.confirm).then(res => res.text())
        ]);

        const templateContainer = document.getElementById('templates-container');
        if (!templateContainer) throw new Error('Template container not found');

        templateContainer.innerHTML = tableHtml + formHtml + actionsHtml + confirmHtml;

        // Store template references
        templates.table = document.getElementById('categories-table-template');
        templates.row = document.getElementById('category-row-template');
        templates.form = document.getElementById('category-form-modal-template');
        templates.actions = document.getElementById('category-actions-template');
        templates.rowActions = document.getElementById('row-actions-template');
        templates.confirm = document.getElementById('confirm-modal-template');

        // Verify all templates loaded
        const missingTemplates = Object.entries(templates)
            .filter(([key, value]) => !value)
            .map(([key]) => key);

        if (missingTemplates.length > 0) {
            throw new Error(`Missing templates: ${missingTemplates.join(', ')}`);
        }


        return true;
    } catch (error) {
        console.error('Failed to load templates:', error);
        showError('Failed to initialize categories section');
        return false;
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
    if (!templates.table || !categoriesTableContainer) {
        console.error('Missing required templates or containers');
        return;
    }
    
    try {
        const tableContent = templates.table.content.cloneNode(true);
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
    const row = templates.row.content.cloneNode(true);
    
    // Populate row data
    row.querySelector('tr').setAttribute('data-category-id', category.id);
    row.querySelector('[data-category-name]').textContent = category.name;
    row.querySelector('[data-category-description]').textContent = category.description;
    row.querySelector('[data-guidelines-count]').textContent = 
        `${category.disposalGuidelines?.length || 0} guidelines`;
    row.querySelector('[data-tips-count]').textContent = 
        `${category.recyclingTips?.length || 0} tips`;

    // Add action buttons
    const actionButtons = templates.rowActions.content.cloneNode(true);
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
        if (!templates.form) {
            throw new Error('Category form template not found');
        }

        const modalContent = templates.form.content.cloneNode(true);
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
    addButton.addEventListener('click', () => showCategoryForm());
}
