class IPhoneMockup {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.render();
    }

    render() {
        const mockup = `
            <div class="iphone-mockup">
                <div class="iphone-frame">
                    <div class="notch"></div>
                    <div class="screen">
                        <!-- Status Bar -->
                        <div class="status-bar">
                            <div class="status-left">9:41</div>
                            <div class="status-center"></div>
                            <div class="status-right">
                                <span class="signal">
                                    <i class="fas fa-signal"></i>
                                </span>
                                <span class="wifi">
                                    <i class="fas fa-wifi"></i>
                                </span>
                                <span class="battery">
                                    <i class="fas fa-battery-full"></i>
                                </span>
                            </div>
                        </div>

                        <!-- App Content -->
                        <div class="app-content">
                            <!-- Header -->
                            <div class="app-header">
                                <h1>Waste Sort</h1>
                                <p class="subtitle">Smart Recycling Assistant</p>
                                <div class="search-bar">
                                    <i class="fas fa-search"></i>
                                    <input type="text" placeholder="Search waste items...">
                                </div>
                            </div>

                            <!-- Main Categories -->
                            <div class="categories-grid">
                                <div class="category-card recyclable">
                                    <div class="category-icon">
                                        <i class="fas fa-recycle"></i>
                                    </div>
                                    <span>Recyclable</span>
                                    <small>Paper, Plastic, Glass</small>
                                </div>
                                <div class="category-card organic">
                                    <div class="category-icon">
                                        <i class="fas fa-leaf"></i>
                                    </div>
                                    <span>Organic</span>
                                    <small>Food, Garden Waste</small>
                                </div>
                                <div class="category-card hazardous">
                                    <div class="category-icon">
                                        <i class="fas fa-skull"></i>
                                    </div>
                                    <span>Hazardous</span>
                                    <small>Chemicals, Batteries</small>
                                </div>
                                <div class="category-card electronic">
                                    <div class="category-icon">
                                        <i class="fas fa-laptop"></i>
                                    </div>
                                    <span>E-Waste</span>
                                    <small>Electronics, Gadgets</small>
                                </div>
                            </div>

                            <!-- Daily Tip Card -->
                            <div class="tip-section">
                                <div class="tip-card">
                                    <div class="tip-header">
                                        <i class="fas fa-lightbulb"></i>
                                        <h3>Tip of the Day</h3>
                                    </div>
                                    <p>Always rinse plastic containers before recycling to prevent contamination. Remove caps and labels when possible.</p>
                                    <button class="tip-action">Learn More</button>
                                </div>
                            </div>

                            <!-- Quick Actions -->
                            <div class="quick-actions">
                                <button class="scan-btn">
                                    <i class="fas fa-camera"></i>
                                    Scan Item
                                </button>
                                <button class="guide-btn">
                                    <i class="fas fa-book"></i>
                                    Guidelines
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const styles = `
            <style>
                .iphone-mockup {
                    width: 100%;
                    max-width: 250px;
                    margin: 0 auto;
                }
                
                .iphone-frame {
                    background: linear-gradient(45deg, #1a1a1a, #2a2a2a);
                    border-radius: 45px;
                    padding: 12px;
                    box-shadow: 
                        0 20px 40px rgba(0,0,0,0.2),
                        inset 0 2px 10px rgba(255,255,255,0.2),
                        inset 0 -2px 10px rgba(0,0,0,0.5);
                    position: relative;
                }
                
                .notch {
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 150px;
                    height: 25px;
                    background: #1a1a1a;
                    border-bottom-left-radius: 20px;
                    border-bottom-right-radius: 20px;
                    z-index: 2;
                }
                
                .screen {
                    background: #f5f5f5;
                    border-radius: 35px;
                    overflow: hidden;
                    height: 520px; // Reduced height
                    position: relative;
                }
                
                .status-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 5px 20px;
                    background: transparent;
                    color: #000;
                    font-size: 14px;
                    font-weight: 600;
                }

                .status-right {
                    display: flex;
                    gap: 5px;
                }
                
                .app-header {
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    color: white;
                    padding: 15px;
                    border-bottom-left-radius: 25px;
                    border-bottom-right-radius: 25px;
                }
                
                .app-header h1 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 700;
                }

                .subtitle {
                    font-size: 14px;
                    opacity: 0.9;
                    margin-top: 4px;
                }
                
                .search-bar {
                    background: rgba(255,255,255,0.2);
                    border-radius: 12px;
                    padding: 8px 15px;
                    margin-top: 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .search-bar input {
                    background: transparent;
                    border: none;
                    color: white;
                    width: 100%;
                    font-size: 14px;
                }

                .search-bar input::placeholder {
                    color: rgba(255,255,255,0.8);
                }
                
                .categories-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    padding: 15px;
                }
                
                .category-card {
                    background: white;
                    border-radius: 16px;
                    padding: 15px;
                    text-align: center;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }

                .category-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    margin-bottom: 5px;
                }
                
                .recyclable .category-icon { 
                    background: #e3f2fd; 
                    color: #2196F3; 
                }
                .organic .category-icon { 
                    background: #f1f8e9; 
                    color: #8bc34a; 
                }
                .hazardous .category-icon { 
                    background: #fbe9e7; 
                    color: #ff5722; 
                }
                .electronic .category-icon { 
                    background: #ede7f6; 
                    color: #673ab7; 
                }

                .category-card span {
                    font-weight: 600;
                    color: #333;
                }

                .category-card small {
                    font-size: 12px;
                    color: #666;
                }
                
                .tip-section {
                    padding: 0 15px;
                    margin-bottom: 15px;
                }

                .tip-card {
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    border-radius: 16px;
                    padding: 20px;
                    color: white;
                }

                .tip-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 10px;
                }

                .tip-header i {
                    font-size: 20px;
                }

                .tip-header h3 {
                    margin: 0;
                    font-size: 18px;
                }

                .tip-card p {
                    margin: 10px 0;
                    font-size: 14px;
                    line-height: 1.4;
                    opacity: 0.9;
                }

                .tip-action {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    padding: 8px 16px;
                    border-radius: 20px;
                    color: white;
                    font-size: 12px;
                    margin-top: 10px;
                    cursor: pointer;
                }

                .quick-actions {
                    display: flex;
                    gap: 12px;
                    padding: 15px;
                    margin-top: 5px;
                }

                .quick-actions button {
                    flex: 1;
                    background: #f5f5f5;
                    border: 1px solid #e0e0e0;
                    padding: 12px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-size: 14px;
                    color: #333;
                    font-weight: 500;
                }

                .scan-btn i {
                    color: #2196F3;
                }

                .guide-btn i {
                    color: #4CAF50;
                }
            </style>
        `;
        
        this.container.innerHTML = styles + mockup;
    }
}

// Initialize the mockup
document.addEventListener('DOMContentLoaded', () => {
    new IPhoneMockup('phone-mockup');
});
