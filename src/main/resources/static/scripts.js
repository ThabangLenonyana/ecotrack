// Constants for DOM elements
const ELEMENTS = {
    loading: document.getElementById('loading'),
    categoriesGrid: document.getElementById('categories-grid'),
    errorMessage: document.getElementById('error-message'),
    template: document.getElementById('category-template'),
    modal: document.getElementById('category-modal')
};

// API endpoints
const API = {
    categories: '/api/categories'
};

// Store categories data globally for modal access
let categoriesData = [];

// Initialize the page
async function initializePage() {
    try {
        await loadCategories();
        setupModalEvents();
    } catch (error) {
        showError();
        console.error('Failed to load categories:', error);
    }
}

// Load categories from the API
async function loadCategories() {
    const response = await fetch(API.categories);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    categoriesData = await response.json();
    displayCategories(categoriesData);
}

// Display categories in the grid
function displayCategories(categories) {
    hideLoading();
    
    if (!categories.length) {
        showNoCategories();
        return;
    }

    categories.forEach((category, index) => {
        const card = createCategoryCard(category, index);
        ELEMENTS.categoriesGrid.appendChild(card);
    });
}

// Create a category card
function createCategoryCard(category, index) {
    const template = ELEMENTS.template.content.cloneNode(true);
    
    template.querySelector('.category-name').textContent = category.name;
    template.querySelector('.category-description').textContent = 
        category.description.length > 150 
            ? category.description.substring(0, 150) + '...' 
            : category.description;

    const moreInfoBtn = template.querySelector('.more-info-btn');
    moreInfoBtn.dataset.categoryIndex = index;
    
    return template;
}

// Setup modal events
function setupModalEvents() {
    // Close modal when clicking outside
    ELEMENTS.modal.addEventListener('click', (e) => {
        if (e.target === ELEMENTS.modal) {
            hideModal();
        }
    });

    // Close modal when clicking close button
    ELEMENTS.modal.querySelector('.close-modal').addEventListener('click', hideModal);

    // Handle more info button clicks
    ELEMENTS.categoriesGrid.addEventListener('click', (e) => {
        const moreInfoBtn = e.target.closest('.more-info-btn');
        if (moreInfoBtn) {
            const index = moreInfoBtn.dataset.categoryIndex;
            showModal(categoriesData[index]);
        }
    });
}

// Show modal with category details
function showModal(category) {
    const modal = ELEMENTS.modal;
    
    // Set basic information
    modal.querySelector('.modal-category-name').textContent = category.name;
    modal.querySelector('.modal-category-description').textContent = category.description;
    
    // Set guidelines
    const guidelinesList = modal.querySelector('.modal-guidelines-list');
    guidelinesList.innerHTML = '';
    if (category.disposalGuidelines && category.disposalGuidelines.length) {
        category.disposalGuidelines.forEach(guideline => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${guideline.title}</strong><br>
                          <span class="text-gray-600">${guideline.instructions}</span>`;
            guidelinesList.appendChild(li);
        });
    } else {
        guidelinesList.innerHTML = '<li class="text-gray-500">No guidelines available</li>';
    }
    
    // Set recycling tips
    const tipsList = modal.querySelector('.modal-tips-list');
    tipsList.innerHTML = '';
    if (category.recyclingTips && category.recyclingTips.length) {
        category.recyclingTips.forEach(tip => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${tip.title}</strong><br>
                          <span class="text-gray-600">${tip.content}</span>`;
            tipsList.appendChild(li);
        });
    } else {
        tipsList.innerHTML = '<li class="text-gray-500">No tips available</li>';
    }
    
    modal.classList.remove('hidden');
}

// Hide modal
function hideModal() {
    ELEMENTS.modal.classList.add('hidden');
}

// Utility functions
function hideLoading() {
    ELEMENTS.loading.classList.add('hidden');
}

function showError() {
    hideLoading();
    ELEMENTS.errorMessage.classList.remove('hidden');
}

function showNoCategories() {
    ELEMENTS.categoriesGrid.innerHTML = `
        <div class="col-span-full text-center text-gray-600 py-8">
            No waste categories found.
        </div>
    `;
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);