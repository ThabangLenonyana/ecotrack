/**
 * Initialize the overview section of the dashboard
 */
async function initializeOverviewSection() {
    try {
        // Load the overview template
        const template = await loadOverviewTemplate();
        if (!template) return;

        // Insert the template into the main content area
        const mainContent = document.querySelector('main');
        mainContent.insertBefore(template, mainContent.firstChild);

        // Initialize the overview data
        await updateOverviewStats();
        await loadRecentActivity();
        setupQuickActions();
    } catch (error) {
        console.error('Failed to initialize overview section:', error);
    }
}

/**
 * Load the overview template from the components directory
 */
async function loadOverviewTemplate() {
    try {
        const response = await fetch('/components/dashboard-overview.html');
        const html = await response.text();
        
        const container = document.createElement('div');
        container.innerHTML = html;
        
        const template = container.querySelector('#overview-section-template');
        return template.content.cloneNode(true);
    } catch (error) {
        console.error('Failed to load overview template:', error);
        return null;
    }
}

/**
 * Update the statistics in the overview section
 */
async function updateOverviewStats() {
    const statsElements = {
        categories: document.querySelector('[data-stats-categories]'),
        guidelines: document.querySelector('[data-stats-guidelines]'),
        tips: document.querySelector('[data-stats-tips]'),
        engagement: document.querySelector('[data-stats-engagement]')
    };

    try {
        // Show loading state
        Object.values(statsElements).forEach(el => {
            if (el) el.textContent = 'Loading...';
        });

        // Fetch stats from mock service
        const stats = await MockDataService.getDashboardStats();
        
        // Update stats in the UI
        if (statsElements.categories) statsElements.categories.textContent = stats.categoriesCount;
        if (statsElements.guidelines) statsElements.guidelines.textContent = stats.guidelinesCount;
        if (statsElements.tips) statsElements.tips.textContent = stats.tipsCount;
        if (statsElements.engagement) statsElements.engagement.textContent = stats.userEngagement + '%';
        
        // Update increase percentages with error checking
        const increaseElements = {
            categories: document.querySelector('[data-stats-categories-increase]'),
            guidelines: document.querySelector('[data-stats-guidelines-increase]'),
            tips: document.querySelector('[data-stats-tips-increase]'),
            engagement: document.querySelector('[data-stats-engagement-increase]')
        };

        Object.entries(increaseElements).forEach(([key, el]) => {
            if (el && stats[`${key}Increase`] !== undefined) {
                el.textContent = `${stats[`${key}Increase`]}%`;
            }
        });

    } catch (error) {
        console.error('Failed to update overview stats:', error);
        // Show error state
        Object.values(statsElements).forEach(el => {
            if (el) el.textContent = 'Error loading data';
        });
    }
}

/**
 * Load and display recent activity
 */
async function loadRecentActivity() {
    const container = document.querySelector('[data-recent-activity]');
    if (!container) return;

    try {
        // Show loading state
        container.innerHTML = '<div class="text-gray-500">Loading recent activity...</div>';

        const activities = await MockDataService.getRecentActivity();
        
        if (activities.length === 0) {
            container.innerHTML = '<div class="text-gray-500">No recent activity</div>';
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-${activity.color}-500 rounded-full"></div>
                <p class="text-sm text-gray-600">${activity.description}</p>
                <span class="text-xs text-gray-400">${activity.timeAgo}</span>
            </div>
        `).join('');

    } catch (error) {
        console.error('Failed to load recent activity:', error);
        container.innerHTML = '<div class="text-red-500">Error loading recent activity</div>';
    }
}

/**
 * Setup event listeners for quick action buttons
 */
function setupQuickActions() {
    const actionButtons = document.querySelectorAll('[data-action]');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.getAttribute('data-action');
            switch (action) {
                case 'add-category':
                    showCategoryForm();
                    break;
                case 'add-guideline':
                    showGuidelineForm();
                    break;
                case 'add-tip':
                    showTipForm();
                    break;
                case 'view-reports':
                    document.querySelector('[href="#reports"]').click();
                    break;
            }
        });
    });
}