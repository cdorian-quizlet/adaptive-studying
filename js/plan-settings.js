// Plan Settings screen logic

// DOM Elements
const closeBtn = document.getElementById('closeBtn');
const deletePlanBtn = document.getElementById('deletePlanBtn');

// Setting value elements
const courseValue = document.getElementById('courseValue');
const goalValue = document.getElementById('goalValue');
const conceptsValue = document.getElementById('conceptsValue');
const knowledgeValue = document.getElementById('knowledgeValue');
const dateValue = document.getElementById('dateValue');

// Setting items (clickable)
const courseSetting = document.getElementById('courseSetting');
const goalSetting = document.getElementById('goalSetting');
const conceptsSetting = document.getElementById('conceptsSetting');
const knowledgeSetting = document.getElementById('knowledgeSetting');
const dateSetting = document.getElementById('dateSetting');

// Initialize the settings screen
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    setupEventListeners();
    initMaterialIcons();
});

// Load settings from localStorage
function loadSettings() {
    try {
        // Load course
        const course = localStorage.getItem('onboarding_course');
        if (course) {
            // Extract course code (everything before " - " if it exists)
            const courseCode = course.includes(' - ') ? 
                course.split(' - ')[0] : course;
            courseValue.textContent = courseCode;
        }

        // Load goals
        const goals = localStorage.getItem('onboarding_goals');
        if (goals) {
            try {
                const goalsArray = JSON.parse(goals);
                if (Array.isArray(goalsArray) && goalsArray.length > 0) {
                    goalValue.textContent = goalsArray.join(', ');
                }
            } catch (e) {
                console.error('Error parsing goals:', e);
            }
        }

        // Load concepts
        const concepts = localStorage.getItem('onboarding_concepts');
        if (concepts) {
            try {
                const conceptsArray = JSON.parse(concepts);
                if (Array.isArray(conceptsArray) && conceptsArray.length > 0) {
                    // Limit display to avoid too long text
                    const displayConcepts = conceptsArray.length > 3 ? 
                        conceptsArray.slice(0, 3).join(', ') + '...' : 
                        conceptsArray.join(', ');
                    conceptsValue.textContent = displayConcepts;
                }
            } catch (e) {
                console.error('Error parsing concepts:', e);
            }
        }

        // Load knowledge level
        const knowledgeLevel = localStorage.getItem('onboarding_knowledge_level');
        const knowledgePill = localStorage.getItem('onboarding_knowledge_pill');
        if (knowledgeLevel && knowledgePill) {
            knowledgeValue.textContent = `${knowledgePill}, ${knowledgeLevel}`;
        } else if (knowledgePill) {
            knowledgeValue.textContent = knowledgePill;
        } else if (knowledgeLevel) {
            knowledgeValue.textContent = knowledgeLevel;
        }

        // Load due date
        const dueDate = localStorage.getItem('plan_due_date');
        if (dueDate) {
            // Format the date nicely
            try {
                const date = new Date(dueDate);
                const options = { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                };
                dateValue.textContent = date.toLocaleDateString('en-US', options);
            } catch (e) {
                dateValue.textContent = dueDate;
            }
        }

        console.log('Settings loaded successfully');
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Close button
    closeBtn.addEventListener('click', function() {
        window.location.href = '../html/study-plan.html';
    });

    // Setting item clicks (for future editing functionality)
    courseSetting.addEventListener('click', function() {
        // Future: Open course selection
        console.log('Course setting clicked');
        showToast('Course editing coming soon');
    });

    goalSetting.addEventListener('click', function() {
        // Future: Open goal selection
        console.log('Goal setting clicked');
        showToast('Goal editing coming soon');
    });

    conceptsSetting.addEventListener('click', function() {
        // Future: Open concepts selection
        console.log('Concepts setting clicked');
        showToast('Concepts editing coming soon');
    });

    knowledgeSetting.addEventListener('click', function() {
        // Future: Open knowledge level selection
        console.log('Knowledge setting clicked');
        showToast('Knowledge level editing coming soon');
    });

    dateSetting.addEventListener('click', function() {
        // Future: Open date picker
        console.log('Date setting clicked');
        showToast('Date editing coming soon');
    });

    // Delete plan button
    deletePlanBtn.addEventListener('click', function() {
        const confirmed = confirm('Are you sure you want to delete this study plan? This action cannot be undone.');
        if (confirmed) {
            deletePlan();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'Escape':
                closeBtn.click();
                break;
        }
    });
}

// Delete the study plan
function deletePlan() {
    try {
        // Clear all onboarding and study plan data
        const keysToRemove = [
            'onboarding_course',
            'onboarding_goals',
            'onboarding_concepts',
            'onboarding_knowledge_level',
            'onboarding_knowledge_pill',
            'onboarding_knowledge_headline',
            'plan_due_date',
            'onboarding_completed',
            'onboarding_sheet_open',
            'studyPathData',
            'currentRoundNumber',
            'currentRoundProgress',
            'roundProgressData',
            'studyProgress',
            'currentQuestionIndex',
            'studyAccuracy',
            'diagnostic1_completed',
            'diagnostic2_completed',
            'diagnostic3_completed',
            'fsrs_stats'
        ];

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });

        showToast('Study plan deleted successfully', 2000);
        
        // Redirect to home page after a short delay
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);

    } catch (error) {
        console.error('Error deleting plan:', error);
        showToast('Error deleting plan. Please try again.');
    }
}

// Initialize material icons
function initMaterialIcons() {
    // Check if fonts are loaded
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            const icons = document.querySelectorAll('.material-icons-round, .material-symbols-rounded');
            icons.forEach(icon => icon.classList.add('loaded'));
        });
    } else {
        // Fallback: show icons after a short delay
        setTimeout(() => {
            const icons = document.querySelectorAll('.material-icons-round, .material-symbols-rounded');
            icons.forEach(icon => icon.classList.add('loaded'));
        }, 500);
    }
}

// Toast notification system
function showToast(message, duration = 3000) {
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
