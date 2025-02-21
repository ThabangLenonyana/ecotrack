// DOM Elements and Templates
const categoriesGrid = document.getElementById('categories-grid');
const categoryModal = document.getElementById('category-modal');
let templates = {};

// Default icons for different waste categories
const DEFAULT_ICONS = {
    
    'paper': 'fa-newspaper',
    'glass': 'fa-wine-glass',
    'metal': 'fa-trash-can',
    'organic': 'fa-leaf',
    'electronic': 'fa-laptop',
    'textile': 'fa-shirt',
    'hazardous': 'fa-skull',
    'plastic': 'fa-bottle-water',
    'battery': 'fa-car-battery',
    'medical': 'fa-prescription-bottle',
    'construction': 'fa-hammer',
    'default': 'fa-recycle'
};

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadTemplates();
    initializePage();
});

// Load HTML templates
async function loadTemplates() {
    try {
        const [cardTemplate, modalTemplate] = await Promise.all([
            fetch('/components/category-card.html').then(res => res.text()),
            fetch('/components/category-modal.html').then(res => res.text())
        ]);

        // Add templates to document
        const templateContainer = document.createElement('div');
        templateContainer.style.display = 'none';
        templateContainer.innerHTML = cardTemplate + modalTemplate;
        document.body.appendChild(templateContainer);

        // Store template references
        templates = {
            card: document.getElementById('category-card-template'),
            modal: document.getElementById('category-modal-template'),
            guideline: document.getElementById('guideline-item-template'),
            tip: document.getElementById('tip-item-template')
        };
    } catch (error) {
        console.error('Failed to load templates:', error);
        showError('Failed to load application templates');
    }
}

// Initialize page
async function initializePage() {
    try {
        await loadCategories();
    } catch (error) {
        showError('Failed to load categories');
    }
}

// Load and render categories
async function loadCategories() {
    try {
        const categories = await ApiService.getCategories();
        renderCategories(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
        showError('Failed to load categories');
    }
}

// Render categories grid
function renderCategories(categories) {
    categoriesGrid.innerHTML = '';
    categories.forEach(category => {
        const card = templates.card.content.cloneNode(true);
        
        // Set category icon
        const iconElement = card.querySelector('[data-category-icon]');
        iconElement.className = `fas ${getIconForCategory(category)} text-2xl text-green-600`;
        
        // Populate other card data
        card.querySelector('[data-category-name]').textContent = category.name;
        card.querySelector('[data-category-description]').textContent = category.description;
        
        // Update guidelines badge
        const guidelinesCount = category.disposalGuidelines?.length || 0;
        const guidelinesBadge = card.querySelector('[data-guidelines-badge]');
        card.querySelector('[data-guidelines-count]').textContent = guidelinesCount;
        card.querySelector('[data-guidelines-label]').textContent = 
            guidelinesCount === 1 ? 'Guide' : 'Guides';
        
        if (guidelinesCount === 0) {
            guidelinesBadge.classList.add('border', 'border-gray-300', 'text-gray-400');
        } else {
            guidelinesBadge.classList.add('border', 'border-blue-500', 'text-blue-600');
        }
        
        // Update tips badge
        const tipsCount = category.recyclingTips?.length || 0;
        const tipsBadge = card.querySelector('[data-tips-badge]');
        card.querySelector('[data-tips-count]').textContent = tipsCount;
        card.querySelector('[data-tips-label]').textContent = 
            tipsCount === 1 ? 'Tip' : 'Tips';
        
        if (tipsCount === 0) {
            tipsBadge.classList.add('border', 'border-gray-300', 'text-gray-400');
        } else {
            tipsBadge.classList.add('border', 'border-orange-500', 'text-orange-600');
        }
        
        // Add event listener
        const viewButton = card.querySelector('[data-view-details]');
        viewButton.addEventListener('click', () => showCategoryDetails(category.id));
        
        categoriesGrid.appendChild(card);
    });
}

// Helper function to get appropriate icon for category
function getIconForCategory(category) {
    // Check both type and name for matching waste category
    const categoryType = (category.type || category.name || '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ''); // Remove spaces
    
    // Try to match by checking if the category type/name contains any of our known types
    const matchedType = Object.keys(DEFAULT_ICONS).find(type => 
        categoryType.includes(type)
    );

    return DEFAULT_ICONS[matchedType] || DEFAULT_ICONS.default;
}

// Show category details in modal
async function showCategoryDetails(categoryId) {
    try {
        const category = await ApiService.getCategoryById(categoryId);
        
        // Clone and populate modal template
        const modalContent = templates.modal.content.cloneNode(true);
        
        // Set category icon and name
        const iconElement = modalContent.querySelector('[data-category-icon]');
        iconElement.className = `fas ${getIconForCategory(category)} text-white`;
        modalContent.querySelector('[data-category-name]').textContent = category.name;
        modalContent.querySelector('[data-category-description]').textContent = 
            category.description;
        
        // Render guidelines and tips
        renderGuidelinesList(category.disposalGuidelines, 
            modalContent.querySelector('[data-guidelines-container]'));
        renderTipsList(category.recyclingTips, 
            modalContent.querySelector('[data-tips-container]'));
        
        // Setup close button and animations
        const closeButton = modalContent.querySelector('[data-close-modal]');
        closeButton.addEventListener('click', closeCategoryModal);
        
        // Show modal with fade effect
        categoryModal.innerHTML = '';
        categoryModal.appendChild(modalContent);
        requestAnimationFrame(() => {
            categoryModal.classList.remove('hidden');
            categoryModal.classList.add('backdrop-blur-sm');
        });
    } catch (error) {
        console.error('Error showing category details:', error);
        showError('Failed to load category details');
    }
}

// Render guidelines list
function renderGuidelinesList(guidelines, container) {
    if (!guidelines || guidelines.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No guidelines available</p>';
        return;
    }
    
    const ul = document.createElement('ul');
    ul.className = 'space-y-2';
    
    guidelines.forEach(guideline => {
        const li = templates.guideline.content.cloneNode(true);
        li.querySelector('[data-guideline-title]').textContent = guideline.title;
        li.querySelector('[data-guideline-instructions]').textContent = guideline.instructions;
        ul.appendChild(li);
    });
    
    container.appendChild(ul);
}

// Render tips list
function renderTipsList(tips, container) {
    if (!tips || tips.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No recycling tips available</p>';
        return;
    }
    
    const ul = document.createElement('ul');
    ul.className = 'space-y-2';
    
    tips.forEach(tip => {
        const li = templates.tip.content.cloneNode(true);
        li.querySelector('[data-tip-title]').textContent = tip.title;
        li.querySelector('[data-tip-content]').textContent = tip.content;
        ul.appendChild(li);
    });
    
    container.appendChild(ul);
}

// Close category modal
function closeCategoryModal() {
    categoryModal.classList.add('backdrop-blur-none');
    categoryModal.classList.add('hidden');
    setTimeout(() => {
        categoryModal.innerHTML = '';
    }, 200);
}

// Show error message
function showError(message) {
    const errorTemplate = `
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p class="font-medium">Error</p>
            <p>${message}</p>
        </div>
    `;
    categoriesGrid.innerHTML = errorTemplate;
}