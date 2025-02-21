/**
 * Utility class for loading and managing components
 */
class ComponentLoader {
    /**
     * Load a component template and insert it into the DOM
     * @param {string} templatePath - Path to the template file
     * @param {string} containerId - ID of the container element
     * @returns {Promise<HTMLElement>} The loaded template content
     */
    static async loadComponent(templatePath, containerId) {
        try {
            const response = await fetch(templatePath);
            const html = await response.text();
            
            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`Container with id "${containerId}" not found`);
            }

            const temp = document.createElement('div');
            temp.innerHTML = html;
            const template = temp.querySelector('template');
            
            if (!template) {
                throw new Error('Template not found in component file');
            }

            const content = template.content.cloneNode(true);
            container.appendChild(content);
            
            return container.lastElementChild;
        } catch (error) {
            console.error(`Failed to load component from ${templatePath}:`, error);
            return null;
        }
    }

    /**
     * Initialize header component with logo
     */
    static async initializeHeader() {
        try {
            // Load header first
            const header = await this.loadComponent('/components/header.html', 'header-container');
            if (!header) {
                throw new Error('Failed to load header component');
            }

            // Then load logo into the logo container
            await this.loadComponent('/components/logo.html', 'logo-template');
            
            return header;
        } catch (error) {
            console.error('Error initializing header:', error);
            return null;
        }
    }

    /**
     * Initialize dashboard navigation
     */
    static async initializeDashboardNav() {
        await this.loadComponent('/components/dashboard-nav.html', 'nav-container');
    }

    static async initializeOverview() {
        try {
            // Load main overview template
            const overview = await this.loadComponent('/components/dashboard-overview.html', 'overview-container');
            if (!overview) {
                throw new Error('Failed to load overview template');
            }
    
            // Load subcomponents into their respective containers
            await Promise.all([
                this.loadComponent('/components/stats-cards.html', 'stats-container'),
                this.loadComponent('/components/activity-timeline.html', 'activity-container'),
                this.loadComponent('/components/quick-actions.html', 'actions-container')
            ]);
    
            // Initialize overview data
            await updateOverviewStats();
            await loadRecentActivity();
            setupQuickActions();
    
            return overview;
        } catch (error) {
            console.error('Failed to initialize overview:', error);
            return null;
        }
    }

    static async waitForContainer(containerId, maxAttempts = 5) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const checkContainer = () => {
                const container = document.getElementById(containerId);
                if (container) {
                    resolve(container);
                } else if (attempts >= maxAttempts) {
                    reject(new Error(`Container ${containerId} not found after ${maxAttempts} attempts`));
                } else {
                    attempts++;
                    setTimeout(checkContainer, 100);
                }
            };
            checkContainer();
        });
    }
}