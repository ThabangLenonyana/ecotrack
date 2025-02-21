/**
 * Mock data service for development and testing
 * Simulates API responses until the backend is ready
 */
const MockDataService = {
    /**
     * Get mock dashboard statistics
     * @returns {Promise<Object>} Mock statistics with simulated delays
     */
    getDashboardStats: async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
            categoriesCount: 12,
            guidelinesCount: 48,
            tipsCount: 36,
            userEngagement: 85,
            categoriesIncrease: 8,
            guidelinesIncrease: 12,
            tipsIncrease: 5,
            engagementIncrease: 15
        };
    },

    /**
     * Get mock recent activity data
     * @returns {Promise<Array>} Array of recent activities with simulated delays
     */
    getRecentActivity: async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return [
            {
                description: 'New category "Electronic Waste" added',
                timeAgo: '2 hours ago',
                color: 'green',
                type: 'category'
            },
            {
                description: 'Updated recycling guidelines for Plastics',
                timeAgo: '4 hours ago',
                color: 'blue',
                type: 'guideline'
            },
            {
                description: 'Added 3 new composting tips',
                timeAgo: '6 hours ago',
                color: 'yellow',
                type: 'tip'
            },
            {
                description: 'Modified Glass disposal guidelines',
                timeAgo: '1 day ago',
                color: 'blue',
                type: 'guideline'
            },
            {
                description: 'New category "Hazardous Waste" added',
                timeAgo: '2 days ago',
                color: 'green',
                type: 'category'
            }
        ];
    }
};