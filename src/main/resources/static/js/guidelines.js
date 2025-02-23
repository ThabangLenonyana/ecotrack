// DOM Elements and Templates
const guidelinesTableContainer = document.getElementById('guidelines-table-container');

// Create namespace for Guidelines module
const GuidelineManager = {
    DEBUG: true,
    templates: {},
    TEMPLATE_PATH: {
        table: '/components/guideline-table.html',
        form: '/components/guideline-form-modal.html',
        actions: '/components/guideline-actions.html',
        confirm: '/components/confirm-modal.html'
    },

    debugLog(message, data = null) {
        if (this.DEBUG) {
            if (data) {
                console.log(`[Guidelines] ${message}:`, data);
            } else {
                console.log(`[Guidelines] ${message}`);
            }
        }
    },

    async loadTemplates() {
        try {
            this.debugLog('Starting template loading process');
            const templateContainer = document.getElementById('templates-container');
            
            if (!templateContainer) {
                this.debugLog('Template container not found - creating new one');
                const newContainer = document.createElement('div');
                newContainer.id = 'templates-container';
                document.body.appendChild(newContainer);
                this.debugLog('Created new template container', newContainer);
            }

            // Fetch templates
            const templatePromises = Object.entries(this.TEMPLATE_PATH).map(async ([key, path]) => {
                this.debugLog(`Fetching template: ${key}`, { path });
                try {
                    const response = await fetch(path);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const html = await response.text();
                    this.debugLog(`Template ${key} loaded`, { preview: html.substring(0, 100) });
                    return { key, html };
                } catch (error) {
                    this.debugLog(`Failed to load template ${key}`, error);
                    throw error;
                }
            });

            const [tableHtml, formHtml, actionsHtml, confirmHtml] = await Promise.all(templatePromises);

            templateContainer.innerHTML = tableHtml.html + formHtml.html + actionsHtml.html + confirmHtml.html;

            // Store template references
            this.templates.table = document.getElementById('guidelines-table-template');
            this.templates.row = document.getElementById('guideline-row-template');
            this.templates.form = document.getElementById('guideline-form-modal-template');
            this.templates.actions = document.getElementById('guideline-actions-template');
            this.templates.rowActions = document.getElementById('row-actions-template');
            this.templates.confirm = document.getElementById('confirm-modal-template');

            // Verify templates - match CategoryManager's approach
            const templateIds = {
                table: 'guidelines-table-template',
                row: 'guideline-row-template',
                form: 'guideline-form-modal-template',
                actions: 'guideline-actions-template',
                rowActions: 'row-actions-template',
                confirm: 'confirm-modal-template'
            };

            Object.entries(templateIds).forEach(([key, id]) => {
                const template = document.getElementById(id);
                this.debugLog(`Verifying template: ${key}`, { id, found: !!template });
                
                if (!template) {
                    throw new Error(`Template "${key}" not found`);
                }
                this.templates[key] = template;
            });

            this.debugLog('Template loading completed successfully');
            return true;

        } catch (error) {
            this.debugLog('Template loading failed', error);
            showError(`Failed to load templates: ${error.message}`);
            return false;
        }
    }
};

/**
 * Initialize the guidelines section
 */
window.initializeGuidelinesSection = async function() {
    try {
        const section = document.getElementById('guidelines-section');
        if (!section) {
            GuidelineManager.debugLog('Guidelines section not found');
            throw new Error('Guidelines section not found');
        }

        // Load templates with retries - match CategoryManager's pattern
        let templatesLoaded = false;
        let retries = 3;
        while (!templatesLoaded && retries > 0) {
            templatesLoaded = await GuidelineManager.loadTemplates();
            if (!templatesLoaded) {
                GuidelineManager.debugLog(`Template loading failed, retries left: ${retries}`);
                retries--;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        if (!templatesLoaded) {
            throw new Error('Failed to load templates after multiple attempts');
        }

        // Initialize actions
        const actionsContent = GuidelineManager.templates.actions.content.cloneNode(true);
        section.insertBefore(actionsContent, section.firstChild);

        // Initialize table container
        if (!guidelinesTableContainer) {
            guidelinesTableContainer = document.createElement('div');
            guidelinesTableContainer.id = 'guidelines-table-container';
            section.appendChild(guidelinesTableContainer);
        }

        // Setup event listeners immediately after actions are added
        setupEventListeners();
        await loadGuidelinesTable();

        GuidelineManager.debugLog('Guidelines section initialized successfully');

    } catch (error) {
        GuidelineManager.debugLog('Initialization failed', error);
        showError(`Failed to initialize guidelines section: ${error.message}`);
        throw error;
    }
}

/**
 * Load and display guidelines in the table
 */
async function loadGuidelinesTable() {
    try {
        const guidelines = await ApiService.getGuidelines();
        renderGuidelinesTable(guidelines);
    } catch (error) {
        console.error('Error loading guidelines:', error);
        showError('Failed to load guidelines');
    }
}

/**
 * Render guidelines table
 */
function renderGuidelinesTable(guidelines) {
    try {
        // Verify required templates and containers
        if (!GuidelineManager.templates.table || !guidelinesTableContainer) {
            throw new Error('Missing required templates or containers');
        }

        // Clone table template
        const tableContent = GuidelineManager.templates.table.content.cloneNode(true);
        if (!tableContent) {
            throw new Error('Failed to clone table template');
        }

        // Get tbody element
        const tbody = tableContent.querySelector('tbody');
        if (!tbody) {
            throw new Error('Table body not found in template');
        }

        // Clear existing content
        tbody.innerHTML = '';

        // Handle empty state
        if (!Array.isArray(guidelines) || guidelines.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                        No guidelines found
                    </td>
                </tr>
            `;
        } else {
            // Create and append rows
            guidelines.forEach(guideline => {
                const row = createGuidelineRow(guideline);
                if (row) tbody.appendChild(row);
            });
        }

        // Wrap table in responsive container
        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'table-wrapper';
        const scrollIndicator = document.createElement('div');
        scrollIndicator.className = 'scroll-indicator';
        
        tableWrapper.appendChild(tableContent);
        tableWrapper.appendChild(scrollIndicator);
        guidelinesTableContainer.innerHTML = '';
        guidelinesTableContainer.appendChild(tableWrapper);
        
        // Check for horizontal overflow
        const checkOverflow = () => {
            const hasOverflow = tableWrapper.scrollWidth > tableWrapper.clientWidth;
            tableWrapper.classList.toggle('has-overflow', hasOverflow);
        };
        
        // Check on load and resize
        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        
    } catch (error) {
        console.error('Error rendering guidelines table:', error);
        showError('Failed to render guidelines table');
    }
}

/**
 * Create a table row for a guideline
 */
function createGuidelineRow(guideline) {
    try {
        // Verify required templates
        if (!GuidelineManager.templates.row || !GuidelineManager.templates.rowActions) {
            throw new Error('Required templates not found');
        }

        // Clone row template
        const row = GuidelineManager.templates.row.content.cloneNode(true);
        if (!row) {
            throw new Error('Failed to clone row template');
        }

        // Get required elements
        const titleEl = row.querySelector('[data-guideline-title]');
        const instructionsEl = row.querySelector('[data-guideline-instructions]');
        const categoryBadge = row.querySelector('[data-category-badge]');
        const actionButtons = row.querySelector('[data-action-buttons]');

        // Verify all elements exist
        if (!titleEl || !instructionsEl || !categoryBadge || !actionButtons) {
            throw new Error('Required row elements not found');
        }

        // Set basic data
        titleEl.textContent = guideline.title || '';
        instructionsEl.textContent = guideline.instructions || '';
        
        // Set category badge
        if (guideline.category) {
            categoryBadge.textContent = guideline.category.name;
            categoryBadge.className = 'px-2 py-1 text-sm rounded-full bg-green-100 text-green-800';
        } else {
            categoryBadge.textContent = 'Unassigned';
            categoryBadge.className = 'px-2 py-1 text-sm rounded-full bg-gray-100 text-gray-800';
        }

        // Clone and append row actions
        const rowActionsContent = GuidelineManager.templates.rowActions.content.cloneNode(true);
        if (!rowActionsContent) {
            throw new Error('Failed to clone row actions template');
        }
        
        actionButtons.appendChild(rowActionsContent);

        // Get action buttons after they're added to DOM
        const assignBtn = actionButtons.querySelector('[data-assign-btn]');
        const unassignBtn = actionButtons.querySelector('[data-unassign-btn]');
        const editBtn = actionButtons.querySelector('[data-edit-btn]');
        const deleteBtn = actionButtons.querySelector('[data-delete-btn]');

        if (!assignBtn || !unassignBtn || !editBtn || !deleteBtn) {
            throw new Error('Required action buttons not found');
        }

        // Set button visibility
        if (guideline.category) {
            assignBtn.classList.add('hidden');
            unassignBtn.classList.remove('hidden');
        } else {
            assignBtn.classList.remove('hidden');
            unassignBtn.classList.add('hidden');
        }

        // Add guideline ID for reference
        row.querySelector('[data-guideline-row]').dataset.guidelineId = guideline.id;

        // Add event listeners
        assignBtn.addEventListener('click', () => showAssignCategoryModal(guideline.id));
        unassignBtn.addEventListener('click', () => unassignCategory(guideline.id));
        editBtn.addEventListener('click', () => showGuidelineForm(guideline.id));
        deleteBtn.addEventListener('click', () => deleteGuideline(guideline.id));
        
        return row;
    } catch (error) {
        console.error('Error creating guideline row:', error);
        return null;
    }
}

/**
 * Show modal for assigning a category
 */
async function showAssignCategoryModal(guidelineId) {
    const template = document.getElementById('category-assign-modal-template');
    const modalContent = template.content.cloneNode(true);
    const select = modalContent.querySelector('#assign-category-select');

    try {
        // Load categories
        const categories = await ApiService.getCategories();
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });

        // Setup confirm button
        modalContent.querySelector('[data-confirm-assign]').addEventListener('click', async () => {
            const categoryId = select.value;
            if (!categoryId) return;
            
            try {
                await ApiService.assignGuidelineToCategory(guidelineId, categoryId);
                closeModal();
                await loadGuidelinesTable();
                showToast('Guideline assigned successfully');
            } catch (error) {
                showError('Failed to assign guideline to category');
            }
        });

        // Show modal
        modalContainer.innerHTML = '';
        modalContainer.appendChild(modalContent);
        modalContainer.classList.remove('hidden');
    } catch (error) {
        showError('Failed to load categories');
    }
}

/**
 * Unassign a guideline from its category
 */
async function unassignCategory(guidelineId) {
    try {
        const confirmed = await ConfirmDialog.show({
            title: 'Unassign Category',
            message: 'Are you sure you want to unassign this guideline from its category?',
            confirmText: 'Unassign',
            cancelText: 'Cancel',
            confirmClass: 'px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600'
        });

        if (!confirmed) return;

        await ApiService.unassignGuideline(guidelineId);
        await loadGuidelinesTable();
        showToast('Guideline unassigned successfully');
    } catch (error) {
        showError('Failed to unassign guideline');
    }
}

/**
 * Show guideline form modal
 */
async function showGuidelineForm(guidelineId = null) {
    try {
        if (!GuidelineManager.templates.form) {
            throw new Error('Guideline form template not found');
        }

        const modalContent = GuidelineManager.templates.form.content.cloneNode(true);
        
        // Set modal title
        modalContent.querySelector('[data-modal-title]').textContent = 
            guidelineId ? 'Edit Guideline' : 'Add New Guideline';

        // Get categories for select dropdown
        const categories = await ApiService.getCategories();
        const select = modalContent.querySelector('#categoryId');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });

        // If editing, populate form with guideline data
        if (guidelineId) {
            const guideline = await ApiService.getGuidelineById(guidelineId);
            modalContent.querySelector('#title').value = guideline.title;
            modalContent.querySelector('#instructions').value = guideline.instructions;
            modalContent.querySelector('#categoryId').value = guideline.category?.id || '';
        }

        // Setup form submission
        const form = modalContent.querySelector('#guideline-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleGuidelineSubmit(form, guidelineId);
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
        console.error('Error showing guideline form:', error);
        showError('Failed to show guideline form');
    }
}

/**
 * Handle guideline form submission
 */
async function handleGuidelineSubmit(form, guidelineId) {
    try {
        const formData = {
            title: form.title.value.trim(),
            instructions: form.instructions.value.trim(),
            categoryId: form.categoryId.value || null  // Ensure null if no category selected
        };

        let guideline;
        if (guidelineId) {
            guideline = await ApiService.updateGuideline(guidelineId, formData);
            // If category was selected, assign it
            if (formData.categoryId) {
                await ApiService.assignGuidelineToCategory(guidelineId, formData.categoryId);
            }
        } else {
            // Create guideline first
            guideline = await ApiService.createGuideline({
                title: formData.title,
                instructions: formData.instructions
            });
            
            // Then assign category if selected
            if (formData.categoryId) {
                await ApiService.assignGuidelineToCategory(guideline.id, formData.categoryId);
            }
        }

        closeModal();
        await loadGuidelinesTable();
        showToast(`Guideline successfully ${guidelineId ? 'updated' : 'created'}`);
    } catch (error) {
        console.error('Error saving guideline:', error);
        showError('Failed to save guideline');
    }
}

/**
 * Delete a guideline
 */
async function deleteGuideline(id) {
    const row = document.querySelector(`[data-guideline-id="${id}"]`);
    if (!row) {
        console.error('Guideline row not found');
        return;
    }

    try {
        const confirmed = await ConfirmDialog.show({
            title: 'Delete Guideline',
            message: 'Are you sure you want to delete this guideline?',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            confirmClass: 'px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600'
        });

        if (!confirmed) return;

        row.classList.add('opacity-50');
        
        await ApiService.deleteGuideline(id);
        await loadGuidelinesTable();
        
        showToast('Guideline deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting guideline:', error);
        showToast(error.message || 'Failed to delete guideline', 'error');
        if (row) row.classList.remove('opacity-50');
    }
}

// Setup event listeners for the guidelines section
function setupEventListeners() {
    const addButton = document.getElementById('add-guideline-btn');
    if (addButton) {
        // Match the pattern used in categories.js
        addButton.addEventListener('click', () => showGuidelineForm());
    } else {
        console.error('Add guideline button not found in template');
    }
}

// Remove duplicate button from template and move to proper section
function initializeActionButtons(section) {
    if (!section || !GuidelineManager.templates.actions) {
        throw new Error('Section or actions template not found');
    }

    const actionsContent = GuidelineManager.templates.actions.content.cloneNode(true);
    section.insertBefore(actionsContent, section.firstChild);

    // Setup event listeners right after adding the buttons
    setupEventListeners();
}

// Helper functions should match categories.js
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `px-4 py-2 rounded-lg shadow-lg mb-2 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    toast.textContent = message;
    
    document.getElementById('toast-container')?.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function closeModal() {
    modalContainer.classList.add('hidden');
    setTimeout(() => {
        modalContainer.innerHTML = '';
    }, 200);
}

function showError(message) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg mb-2';
    toast.textContent = message;

    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Add to ApiService class
ApiService.assignGuidelineToCategory = async function(guidelineId, categoryId) {
    const response = await fetch(`/api/guidelines/${guidelineId}/assign/${categoryId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) throw new Error('Failed to assign guideline to category');
    return response.json();
};

ApiService.unassignGuideline = async function(guidelineId) {
    const response = await fetch(`/api/guidelines/${guidelineId}/unassign`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) throw new Error('Failed to unassign guideline');
    return response.json();
};