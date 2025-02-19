// Constants for DOM elements and API endpoints
const ELEMENTS = {
    categoryModal: document.getElementById('categoryModal'),
    deleteModal: document.getElementById('deleteModal'),
    categoryForm: document.getElementById('categoryForm'),
    categoriesTableBody: document.getElementById('categoriesTableBody'),
    modalTitle: document.getElementById('modalTitle'),
    addCategoryBtn: document.getElementById('addCategoryBtn'),
    confirmDeleteBtn: document.getElementById('confirmDelete'),
    cancelDeleteBtn: document.getElementById('cancelDelete')
};

const API = {
    categories: '/api/categories'
};

let categories = [];
let categoryToDelete = null;

// Initialize the dashboard
async function initializeDashboard() {
    const setupSuccess = setupEventListeners();
    if (!setupSuccess) {
        console.error('Dashboard initialization failed');
        return;
    }

    try {
        await loadCategories();
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

function validateRequiredElements() {
    const requiredElements = [
        { name: 'Category Modal', element: ELEMENTS.categoryModal },
        { name: 'Delete Modal', element: ELEMENTS.deleteModal },
        { name: 'Category Form', element: ELEMENTS.categoryForm },
        { name: 'Categories Table Body', element: ELEMENTS.categoriesTableBody },
        { name: 'Modal Title', element: ELEMENTS.modalTitle },
        { name: 'Add Category Button', element: ELEMENTS.addCategoryBtn },
        { name: 'Confirm Delete Button', element: ELEMENTS.confirmDeleteBtn },
        { name: 'Cancel Delete Button', element: ELEMENTS.cancelDeleteBtn }
    ];

    const missingElements = requiredElements.filter(item => !item.element);
    
    if (missingElements.length > 0) {
        console.error('Missing required DOM elements:', 
            missingElements.map(item => item.name).join(', '));
        return false;
    }
    return true;
}

// Set up event listeners for buttons and forms
function setupEventListeners() {
    if (!validateRequiredElements()) {
        console.error('Failed to setup event listeners: Missing required elements');
        return false;
    }

    try {
        // Add category button
        ELEMENTS.addCategoryBtn.addEventListener('click', () => showCategoryModal());

        // Category form submission
        ELEMENTS.categoryForm.addEventListener('submit', handleCategorySubmit);

        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', hideModals);
        });

        // Delete confirmation
        ELEMENTS.confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);
        ELEMENTS.cancelDeleteBtn.addEventListener('click', hideModals);

        return true;
    } catch (error) {
        console.error('Error setting up event listeners:', error);
        return false;
    }
}

// Load categories from API
async function loadCategories() {
    try {
        const response = await fetch(API.categories);
        if (!response.ok) throw new Error('Failed to fetch categories');
        
        categories = await response.json();
        renderCategoriesTable();
    } catch (error) {
        console.error('Error loading categories:', error);
        // TODO: Show error notification
    }
}

// Render categories table
function renderCategoriesTable() {
    ELEMENTS.categoriesTableBody.innerHTML = categories.map(category => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">${category.name}</td>
            <td class="px-6 py-4">${truncateText(category.description, 100)}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button onclick="editCategory(${category.id})" class="text-blue-600 hover:text-blue-800 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="showDeleteModal(${category.id})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Show category modal for add/edit
function showCategoryModal(category = null) {
    ELEMENTS.modalTitle.textContent = category ? 'Edit Category' : 'Add New Category';
    ELEMENTS.categoryForm.categoryId.value = category?.id || '';
    ELEMENTS.categoryForm.name.value = category?.name || '';
    ELEMENTS.categoryForm.description.value = category?.description || '';
    ELEMENTS.categoryModal.classList.remove('hidden');
}

// Handle category form submission
async function handleCategorySubmit(event) {
    event.preventDefault();
    
    const formData = {
        id: ELEMENTS.categoryForm.categoryId.value,
        name: ELEMENTS.categoryForm.name.value,
        description: ELEMENTS.categoryForm.description.value
    };

    try {
        const isEdit = formData.id !== '';
        const response = await fetch(
            isEdit ? `${API.categories}/${formData.id}` : API.categories,
            {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            }
        );

        if (!response.ok) throw new Error('Failed to save category');
        
        await loadCategories();
        hideModals();
    } catch (error) {
        console.error('Error saving category:', error);
        // TODO: Show error notification
    }
}

// Edit category
function editCategory(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
        showCategoryModal(category);
    }
}

// Show delete confirmation modal
function showDeleteModal(categoryId) {
    categoryToDelete = categoryId;
    ELEMENTS.deleteModal.classList.remove('hidden');
}

// Handle delete confirmation
async function handleDeleteConfirm() {
    if (!categoryToDelete) return;

    try {
        const response = await fetch(`${API.categories}/${categoryToDelete}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete category');
        
        await loadCategories();
        hideModals();
    } catch (error) {
        console.error('Error deleting category:', error);
        // TODO: Show error notification
    }
}

// Hide all modals
function hideModals() {
    ELEMENTS.categoryModal.classList.add('hidden');
    ELEMENTS.deleteModal.classList.add('hidden');
    ELEMENTS.categoryForm.reset();
    categoryToDelete = null;
}

// Utility function to truncate text
function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDashboard);