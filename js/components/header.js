// Reusable Header Component
class AppHeader {
    constructor(options = {}) {
        this.options = {
            showBackButton: true,
            showSettingsButton: true,
            title: '',
            backUrl: '../index.html',
            onBackClick: null,
            onSettingsClick: null,
            loadTitleFromStorage: true,
            ...options
        };
        
        this.headerElement = null;
        this.backBtn = null;
        this.settingsBtn = null;
        this.titleElement = null;
    }

    // Create the header HTML structure
    createHeader() {
        const header = document.createElement('header');
        header.className = 'study-path-header';
        
        let headerHTML = '';
        
        // Back button
        if (this.options.showBackButton) {
            headerHTML += `
                <button class="back-btn" id="headerBackBtn">
                    <span class="material-icons-round">arrow_back</span>
                </button>
            `;
        } else {
            headerHTML += '<div></div>'; // Spacer for layout
        }
        
        // Title
        headerHTML += `
            <h1 class="header-title" id="headerTitle">${this.options.title}</h1>
        `;
        
        // Settings button
        if (this.options.showSettingsButton) {
            headerHTML += `
                <button class="settings-btn" id="headerSettingsBtn">
                    <span class="material-symbols-rounded">settings</span>
                </button>
            `;
        } else {
            headerHTML += '<div></div>'; // Spacer for layout
        }
        
        header.innerHTML = headerHTML;
        return header;
    }

    // Initialize the header and add event listeners
    init(container) {
        // Create header element
        this.headerElement = this.createHeader();
        
        // Get references to interactive elements
        this.backBtn = this.headerElement.querySelector('#headerBackBtn');
        this.settingsBtn = this.headerElement.querySelector('#headerSettingsBtn');
        this.titleElement = this.headerElement.querySelector('#headerTitle');
        
        // Insert header into container
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        
        if (container) {
            // Insert at the beginning of the container
            container.insertBefore(this.headerElement, container.firstChild);
        } else {
            // Default to inserting at the beginning of .app-container
            const appContainer = document.querySelector('.app-container');
            if (appContainer) {
                appContainer.insertBefore(this.headerElement, appContainer.firstChild);
            }
        }
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load title from storage if enabled
        if (this.options.loadTitleFromStorage) {
            this.loadTitleFromStorage();
        }
        
        // Initialize material icons
        this.initMaterialIcons();
        
        return this;
    }

    // Set up event listeners for header buttons
    setupEventListeners() {
        if (this.backBtn) {
            this.backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.options.onBackClick) {
                    this.options.onBackClick();
                } else {
                    this.defaultBackAction();
                }
            });
        }
        
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.options.onSettingsClick) {
                    this.options.onSettingsClick();
                } else {
                    this.defaultSettingsAction();
                }
            });
        }
    }

    // Default back button action
    defaultBackAction() {
        // Set flag if going back to home page for animation
        if (this.options.backUrl && this.options.backUrl.includes('index.html')) {
            sessionStorage.setItem('fromStudyPlan', 'true');
        }
        
        window.location.href = this.options.backUrl;
    }

    // Default settings button action
    defaultSettingsAction() {
        console.log('Settings clicked');
        window.location.href = '../html/plan-settings.html';
    }

    // Load title from onboarding data
    loadTitleFromStorage() {
        try {
            const course = localStorage.getItem('onboarding_course');
            const goals = localStorage.getItem('onboarding_goals');
            
            if (course) {
                // Extract course code (everything before " - " if it exists)
                const courseCode = course.includes(' - ') ? 
                    course.split(' - ')[0] : course;
                
                // Get first goal from onboarding data
                let firstGoal = '';
                if (goals) {
                    try {
                        const goalsArray = JSON.parse(goals);
                        firstGoal = Array.isArray(goalsArray) && goalsArray.length > 0 ? 
                            goalsArray[0] : '';
                    } catch (e) {
                        console.error('Error parsing goals:', e);
                    }
                }
                
                // Format as "BIO 201, Exam 1"
                const title = [courseCode, firstGoal].filter(Boolean).join(', ');
                this.setTitle(title || courseCode);
            }
        } catch (error) {
            console.error('Error loading title from storage:', error);
        }
    }

    // Set the header title
    setTitle(title) {
        if (this.titleElement) {
            this.titleElement.textContent = title;
        }
        this.options.title = title;
    }

    // Get the current title
    getTitle() {
        return this.titleElement ? this.titleElement.textContent : this.options.title;
    }

    // Initialize material icons
    initMaterialIcons() {
        // Check if fonts are loaded
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                const icons = this.headerElement.querySelectorAll('.material-icons-round, .material-symbols-rounded');
                icons.forEach(icon => icon.classList.add('loaded'));
            });
        } else {
            // Fallback: show icons after a short delay
            setTimeout(() => {
                const icons = this.headerElement.querySelectorAll('.material-icons-round, .material-symbols-rounded');
                icons.forEach(icon => icon.classList.add('loaded'));
            }, 500);
        }
    }

    // Toast notification system
    showToast(message, duration = 3000) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        // Add toast styles (Design System)
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            gap: 10px;
            width: 90%;
            min-width: 320px;
            max-width: 480px;
            min-height: 72px;
            padding: 0 var(--spacing-small, 16px);
            background: var(--sys-surface-inverse, #1A1D28);
            color: var(--sys-text-inverse, #FFFFFF);
            border-radius: var(--radius-large, 16px);
            box-shadow: var(--shadow-medium);
            font-size: 14px;
            text-align: left;
            font-weight: 600;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        // Add to page
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);
        
        // Animate out and remove
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    // Destroy the header component
    destroy() {
        if (this.headerElement && this.headerElement.parentNode) {
            this.headerElement.parentNode.removeChild(this.headerElement);
        }
        this.headerElement = null;
        this.backBtn = null;
        this.settingsBtn = null;
        this.titleElement = null;
    }
}

// Export for use in other files
window.AppHeader = AppHeader;
