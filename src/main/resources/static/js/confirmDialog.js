class ConfirmDialog {
    /**
     * Show a confirmation dialog
     * @param {Object} options Dialog options
     * @param {string} options.title Dialog title
     * @param {string} options.message Dialog message
     * @param {string} options.confirmText Text for confirm button
     * @param {string} options.cancelText Text for cancel button
     * @param {string} options.confirmClass CSS classes for confirm button
     * @returns {Promise<boolean>} True if confirmed, false if cancelled
     */
    static async show(options = {}) {
        try {
            // Get template
            const template = document.getElementById('confirm-modal-template');
            if (!template) {
                throw new Error('Confirm modal template not found');
            }

            // Clone template
            const modalContent = template.content.cloneNode(true);
            const modalElement = modalContent.firstElementChild;

            // Update content
            modalElement.querySelector('[data-confirm-title]').textContent = 
                options.title || 'Confirm Action';
            modalElement.querySelector('[data-confirm-message]').textContent = 
                options.message || 'Are you sure?';

            // Update buttons
            const confirmBtn = modalElement.querySelector('[data-confirm-delete]');
            const cancelBtn = modalElement.querySelector('[data-confirm-cancel]');

            if (!confirmBtn || !cancelBtn) {
                throw new Error('Modal buttons not found');
            }

            if (options.confirmText) {
                confirmBtn.textContent = options.confirmText;
            }
            if (options.cancelText) {
                cancelBtn.textContent = options.cancelText;
            }
            if (options.confirmClass) {
                confirmBtn.className = options.confirmClass;
            }

            // Add to DOM
            document.body.appendChild(modalElement);

            // Handle user choice
            return new Promise((resolve) => {
                const cleanup = () => {
                    modalElement.remove();
                    document.removeEventListener('keydown', handleEscape);
                };

                const handleEscape = (e) => {
                    if (e.key === 'Escape') {
                        cleanup();
                        resolve(false);
                    }
                };

                confirmBtn.addEventListener('click', () => {
                    cleanup();
                    resolve(true);
                });

                cancelBtn.addEventListener('click', () => {
                    cleanup();
                    resolve(false);
                });

                // Add escape key handler
                document.addEventListener('keydown', handleEscape);
            });
        } catch (error) {
            console.error('Error showing confirm dialog:', error);
            return false;
        }
    }
}