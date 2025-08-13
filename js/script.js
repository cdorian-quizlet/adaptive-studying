// DOM Elements
const searchInput = document.querySelector('.search-input');
// Revert to original search input reference
const homeSearch = searchInput;
const jumpBackCard = document.querySelector('.jump-back-card');
const continueButton = document.querySelector('.continue-button');
// Support multiple menus (progress card + help card)
const moreOptionsBtns = document.querySelectorAll('.jump-back-card .more-options, .help-card .more-options');
const recentItems = document.querySelectorAll('.recent-item');
const navItems = document.querySelectorAll('.nav-item');
const profileAvatar = document.querySelector('.profile-avatar');
const bottomSheet = document.getElementById('bottomSheet');
const closeBottomSheet = document.getElementById('closeBottomSheet');
const resetProgressBtn = document.getElementById('resetProgress');
const resetOnboardingBtn = document.getElementById('resetOnboarding');

// Chat Elements
const chatOverlay = document.getElementById('chatOverlay');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendMessageBtn = document.getElementById('sendMessage');
const closeChatBtn = document.getElementById('closeChat');

// Configuration
let PROGRESS_VALUE = 0; // Dynamic progress value

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadStudyProgress();
    toggleFirstTimeState();
    updateJumpBackCardFromOnboarding();
    // Load dynamic homepage content from API (skip if CORS issues expected)
    // Disable API loading to avoid CORS errors in console
    // loadHomeContentFromApi();
    setupEventListeners();
    setupHapticFeedback();
    setupAccessibility();
});

// Also refresh progress when page becomes visible (e.g., returning from diagnostic test)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        loadStudyProgress();
    }
});

// Event Listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', function(e) {
        // Debounced live preview could go here; keep quiet to avoid spam toasts
    });

    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query) {
                // Navigate to study page using search API
                window.location.href = `html/study.html?search=${encodeURIComponent(query)}`;
            }
        }
    });

    // Jump back card interactions
    jumpBackCard.addEventListener('click', function(e) {
        if (e.target === continueButton) return;
        if (e.target.closest && e.target.closest('.more-options')) return;
        navigateToStudyScreen();
    });

    // Continue button
    continueButton.addEventListener('click', function(e) {
        e.stopPropagation();
        navigateToStudyScreen();
    });

    // More options buttons (progress card + help card)
    moreOptionsBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            showBottomSheet();
        });
    });

    // Dynamic recent items (event delegation)
    const recentsList = document.querySelector('.recents-list');
    if (recentsList) {
        recentsList.addEventListener('click', function(e) {
            const item = e.target.closest('.recent-item');
            if (!item) return;
            const subject = item.dataset.subject;
            const subcategory = item.dataset.subcategory;
            if (subject && subcategory) {
                window.location.href = `html/study.html?subject=${encodeURIComponent(subject)}&subcategory=${encodeURIComponent(subcategory)}`;
            } else if (subject) {
                window.location.href = `html/study.html?subject=${encodeURIComponent(subject)}`;
            } else {
                const title = item.querySelector('.item-title')?.textContent || 'set';
                showToast(`Opening ${title}`);
            }
        });
    }

    // Study options
    const studyOptions = document.querySelectorAll('.study-option');
    studyOptions.forEach(option => {
        option.addEventListener('click', function() {
            const action = this.textContent.trim();
            // Route to plan flow for study plan
            if (/^make a study plan$/i.test(action) || /^study plan$/i.test(action)) {
                smoothNavigate('html/plan-flow.html');
                return;
            }
            openChatWithSelection(action);
        });
    });

    // Navigation items
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            
            const label = this.querySelector('span').textContent;
            showToast(`Navigating to ${label}`);
        });
    });

    // Profile avatar
    profileAvatar.addEventListener('click', function() {
        showToast('Profile menu opened');
    });

    // Bottom sheet functionality
    closeBottomSheet.addEventListener('click', function() {
        hideBottomSheet();
    });

    resetProgressBtn.addEventListener('click', function() {
        resetStudyProgress();
        hideBottomSheet();
    });

    if (resetOnboardingBtn) {
        resetOnboardingBtn.addEventListener('click', function() {
            resetOnboardingFlow();
            hideBottomSheet();
        });
    }

    // Close bottom sheet on backdrop click
    bottomSheet.addEventListener('click', function(e) {
        if (e.target === bottomSheet) {
            hideBottomSheet();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'Escape':
                if (searchInput === document.activeElement) {
                    searchInput.blur();
                }
                break;
            case 'Enter':
                if (document.activeElement === jumpBackCard) {
                    navigateToStudyScreen();
                }
                break;
        }
    });

    // Touch gestures
    setupTouchGestures();
}

// Determine whether to show first-time help state or standard state
function toggleFirstTimeState() {
    const helpSection = document.querySelector('.help-section');
    const jumpBackSection = document.querySelector('.jump-back-section');
    const studyingNewSection = document.querySelector('.studying-new-section');

    // Determine actual state based on onboarding flag
    const hasOnboarded = localStorage.getItem('onboarding_completed') === 'true';
    const isFirstTime = !hasOnboarded;

    if (helpSection && jumpBackSection) {
        if (isFirstTime) {
            helpSection.style.display = 'block';
            helpSection.classList.remove('as-section');
            jumpBackSection.style.display = 'none';
            if (studyingNewSection) studyingNewSection.style.display = 'none';
        } else {
            helpSection.style.display = 'block';
            helpSection.classList.add('as-section');
            jumpBackSection.style.display = '';
            // Place help section below progress card
            try {
                if (helpSection.parentNode && jumpBackSection.parentNode && helpSection !== null) {
                    jumpBackSection.insertAdjacentElement('afterend', helpSection);
                }
            } catch (_) {}
        }
    }
}

// Update jump-back card title using onboarding data if present
function updateJumpBackCardFromOnboarding() {
    try {
        const hasOnboarded = localStorage.getItem('onboarding_completed') === 'true';
        if (!hasOnboarded) return;
        const course = localStorage.getItem('onboarding_course') || '';
        let goals = [];
        try { goals = JSON.parse(localStorage.getItem('onboarding_goals') || '[]'); } catch(_) {}
        const firstGoal = Array.isArray(goals) && goals.length > 0 ? goals[0] : '';
        const title = [course, firstGoal].filter(Boolean).join(' ');
        const cardTitleEl = document.querySelector('.jump-back-card .card-title');
        if (cardTitleEl && title) {
            cardTitleEl.textContent = title;
        }

        // When progress card is shown, remove help card menu and sparkle; ensure debug menu is accessible via progress card menu
        const helpMenu = document.querySelector('.help-card .more-options');
        if (helpMenu) helpMenu.style.display = 'none';
        const sparkle = document.querySelector('.help-sparkle-img');
        if (sparkle) sparkle.style.display = 'none';
        // Progress card menu already wired to bottom sheet; nothing else needed here
    } catch (e) {
        console.warn('Failed to update jump-back card from onboarding', e);
    }
}

// Load homepage dynamic content from API
async function loadHomeContentFromApi() {
    if (!window.QuizletApi) return;
    // Prefer help card's options if visible; otherwise default
    const studyingOptions = document.querySelector('.help-section .studying-options') || document.querySelector('.studying-new-section .studying-options');
    const recentsList = document.querySelector('.recents-list');
    const jumpBackTitle = document.querySelector('.jump-back-card .card-title');

    // Decide a subject to feature
    let featuredSubject = (localStorage.getItem('homeSubject') || '').trim();
    try {
        const subjects = await window.QuizletApi.getSubjects();
        if (Array.isArray(subjects) && subjects.length > 0) {
            if (!featuredSubject) {
                featuredSubject = String(subjects[0]).toLowerCase();
            }
            // Render subject chips under the primary options
            if (studyingOptions) {
                // Avoid duplicating if called again
                if (!studyingOptions.querySelector('.subject-chip')) {
                    const fragment = document.createDocumentFragment();
                    subjects.slice(0, 6).forEach(subj => {
                        const btn = document.createElement('button');
                        btn.className = 'study-option subject-chip';
                        btn.textContent = String(subj).charAt(0).toUpperCase() + String(subj).slice(1);
                        btn.addEventListener('click', () => {
                            const s = String(subj).toLowerCase();
                            localStorage.setItem('homeSubject', s);
                            window.location.href = `html/study.html?subject=${encodeURIComponent(s)}`;
                        });
                        fragment.appendChild(btn);
                    });
                    studyingOptions.appendChild(fragment);
                }
            }
        }
    } catch (e) {
        // Silently handle API failures - CORS issues with Quizlet API
        // The app will continue to work with default content
    }

    // Update Jump Back In title to reflect featured subject
    if (jumpBackTitle && featuredSubject) {
        const pretty = featuredSubject.charAt(0).toUpperCase() + featuredSubject.slice(1);
        jumpBackTitle.textContent = `${pretty} Study`;
    }

    // Populate Recents using API data
    try {
        const subjectForRecents = featuredSubject || 'biology';
        const cards = await window.QuizletApi.getFlashcardsBySubject(subjectForRecents);
        if (Array.isArray(cards) && cards.length > 0 && recentsList) {
            // Group cards by subcategory/topic to approximate "sets"
            const groups = new Map();
            cards.forEach(card => {
                const key = (card.subcategory || card.topic || 'General').toString();
                if (!groups.has(key)) groups.set(key, { items: [], sample: card });
                groups.get(key).items.push(card);
            });
            const groupArray = Array.from(groups.entries())
                .sort((a, b) => b[1].items.length - a[1].items.length)
                .slice(0, 4);

            // Render
            recentsList.innerHTML = '';
            const fragment = document.createDocumentFragment();
            groupArray.forEach(([subcategory, data]) => {
                const item = document.createElement('div');
                item.className = 'recent-item';
                item.dataset.subject = subjectForRecents;
                item.dataset.subcategory = subcategory;
                item.innerHTML = `
                    <div class="item-icon">
                        <img src="images/thumbnails.png" alt="Study Set Thumbnail" class="thumbnail-image">
                    </div>
                    <div class="item-info">
                        <h4 class="item-title">${escapeHtml(subcategory)}</h4>
                        <p class="item-subtitle">${data.items.length} cards • ${capitalize(subjectForRecents)}</p>
                    </div>
                `;
                fragment.appendChild(item);
            });
            recentsList.appendChild(fragment);
        }
    } catch (e) {
        // Silently handle API failures - CORS issues with Quizlet API
        // The recents list will remain empty or show default content
    }
}

// Utilities
function capitalize(str) {
    if (!str) return '';
    return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Load and display study progress
function loadStudyProgress() {
    let PROGRESS_VALUE = 0;
    
    // Check for diagnostic test progress
    const studyPathData = localStorage.getItem('studyPathData');
    if (studyPathData) {
        try {
            const pathData = JSON.parse(studyPathData);
            if (pathData.roundProgress) {
                const diagnosticProgress = Object.values(pathData.roundProgress).reduce((sum, progress) => sum + progress, 0);
                const diagnosticPercentage = Math.round((diagnosticProgress / 50) * 100);
                PROGRESS_VALUE = Math.max(PROGRESS_VALUE, diagnosticPercentage);
                console.log('Diagnostic Progress:', { diagnosticProgress, diagnosticPercentage, finalProgress: PROGRESS_VALUE });
            }
        } catch (error) {
            console.error('Error parsing study path data:', error);
        }
    }
    
    // Fallback to old progress system
    if (PROGRESS_VALUE === 0) {
        const savedProgress = localStorage.getItem('studyProgress');
        const currentQuestionIndex = localStorage.getItem('currentQuestionIndex') || 0;
        const totalQuestions = 50; // Total questions (all 50 state capitals)
        
        if (savedProgress) {
            PROGRESS_VALUE = parseInt(savedProgress);
        } else {
            // Calculate progress based on current question index
            PROGRESS_VALUE = Math.round((parseInt(currentQuestionIndex) / totalQuestions) * 100);
        }
    }
    
    // Update progress bar
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = `${PROGRESS_VALUE}%`;
    }
    
    // Update progress text
    const progressText = document.querySelector('.progress-text');
    if (progressText) {
        progressText.textContent = `${PROGRESS_VALUE}% complete`;
    }
    
    // Store the calculated progress for other screens
    localStorage.setItem('studyProgress', PROGRESS_VALUE.toString());
}

// Navigation Functions
function navigateToStudyScreen() {
    // Add loading state
    jumpBackCard.style.pointerEvents = 'none';
    continueButton.textContent = 'Loading...';
    continueButton.style.opacity = '0.7';
    
    // Simulate navigation delay
    setTimeout(() => {
        // Navigate to study path screen
        window.location.href = 'html/study-plan.html';
    }, 1000);
}

function smoothNavigate(url) {
    document.body.classList.add('page-fade-out');
    setTimeout(()=>{ window.location.href = url; }, 200);
}

// Bottom Sheet Functions
function showBottomSheet() {
    bottomSheet.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideBottomSheet() {
    bottomSheet.classList.remove('show');
    document.body.style.overflow = '';
}

function resetStudyProgress() {
    // Reset progress in localStorage
    localStorage.removeItem('studyProgress');
    localStorage.removeItem('currentQuestionIndex');
    localStorage.removeItem('questionAttempts');
    localStorage.removeItem('studyPathData');
    localStorage.removeItem('studyAccuracy');
    
    // Reset round progress data
    localStorage.removeItem('currentRoundNumber');
    localStorage.removeItem('currentRoundProgress');
    localStorage.removeItem('roundProgressData');
    localStorage.removeItem('targetRound');
    localStorage.removeItem('targetQuestionIndex');
    
    // Reset diagnostic test data
    localStorage.removeItem('diagnostic1_completed');
    localStorage.removeItem('diagnostic1_accuracy');
    localStorage.removeItem('diagnostic1_cards_learned');
    localStorage.removeItem('diagnostic2_completed');
    localStorage.removeItem('diagnostic2_accuracy');
    localStorage.removeItem('diagnostic2_cards_learned');
    localStorage.removeItem('diagnostic3_completed');
    localStorage.removeItem('diagnostic3_accuracy');
    localStorage.removeItem('diagnostic3_cards_learned');
    
    // Reset progress bar
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = '0%';
    }
    
    // Reset progress text
    const progressText = document.querySelector('.progress-text');
    if (progressText) {
        progressText.textContent = '0% complete';
    }
    
    // Update the global progress value
    PROGRESS_VALUE = 0;
    
    // Reset questions array if it exists in the global scope
    if (typeof window.resetQuestionsArray === 'function') {
        window.resetQuestionsArray();
    }
    
    showToast('Study progress and path data reset successfully');
}

// Onboarding reset (for upcoming onboarding flow)
function resetOnboardingFlow() {
    // Clear any onboarding flags (future-proof)
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('onboarding_step');
    localStorage.removeItem('homeSubject');
    localStorage.removeItem('onboarding_sheet_open');
    localStorage.removeItem('onboarding_knowledge_pill');
    localStorage.removeItem('onboarding_knowledge_headline');
    localStorage.removeItem('onboarding_course');
    localStorage.removeItem('onboarding_goals');
    localStorage.removeItem('onboarding_concepts');
    localStorage.removeItem('plan_due_date');
    // Force first-time state on next load
    showToast('Onboarding has been reset');
    // Immediately show help card again
    const helpSection = document.querySelector('.help-section');
    const jumpBackSection = document.querySelector('.jump-back-section');
    const studyingNewSection = document.querySelector('.studying-new-section');
    if (helpSection && jumpBackSection) {
        helpSection.style.display = 'block';
        helpSection.classList.remove('as-section');
        jumpBackSection.style.display = 'none';
        const sparkle = document.querySelector('.help-sparkle-img');
        if (sparkle) sparkle.style.display = '';
        const helpMenu = document.querySelector('.help-card .more-options');
        if (helpMenu) helpMenu.style.display = '';
        if (studyingNewSection) studyingNewSection.style.display = 'none';
    }
}

// Haptic Feedback (for mobile devices)
function setupHapticFeedback() {
    if ('vibrate' in navigator) {
        // Add haptic feedback to interactive elements
        const interactiveElements = [
            jumpBackCard, continueButton,
            ...moreOptionsBtns,
            ...recentItems, ...navItems, profileAvatar
        ];
        
        interactiveElements.forEach(element => {
            element.addEventListener('click', function() {
                navigator.vibrate(10); // Short vibration
            });
        });
    }
}

// Toast Notification System
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
        bottom: 48px;
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

// Toast with one action button (Design System variant)
function showToastWithAction(message, actionText, onAction, duration = 5000) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast toast--one-action';

    // Container styles
    toast.style.cssText = `
        position: fixed;
        bottom: 48px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: var(--spacing-none, 0);
        width: 90%;
        min-width: 320px;
        max-width: 480px;
        min-height: 72px;
        padding: var(--spacing-none, 0);
        background: var(--sys-surface-inverse, #1A1D28);
        color: var(--sys-text-inverse, #FFFFFF);
        border-radius: var(--radius-large, 16px);
        box-shadow: var(--shadow-medium);
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    const content = document.createElement('div');
    content.textContent = message;
    content.style.cssText = `
        width: 100%;
        padding: var(--spacing-small, 16px) var(--spacing-small, 16px) 8px var(--spacing-small, 16px);
        font-size: 14px;
        font-weight: 600;
        text-align: left;
    `;

    const actions = document.createElement('div');
    actions.style.cssText = `
        width: 100%;
        display: flex;
        justify-content: flex-end;
        padding: 0 var(--spacing-small, 16px) var(--spacing-small, 16px) var(--spacing-small, 16px);
    `;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = actionText;
    btn.style.cssText = `
        background: transparent;
        border: none;
        color: var(--sys-text-inverse, #FFFFFF);
        font-weight: 700;
        cursor: pointer;
        padding: 8px 12px;
        border-radius: var(--radius-small, 4px);
    `;
    btn.addEventListener('click', () => { try { onAction && onAction(); } catch(e){} toast.remove(); });

    actions.appendChild(btn);
    toast.appendChild(content);
    toast.appendChild(actions);
    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => { toast.style.opacity = '1'; });

    // Animate out and remove
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
    }, duration);
}

// Toast with two action buttons (Design System variant)
function showToastWithTwoActions(message, primaryText, onPrimary, secondaryText, onSecondary, duration = 7000) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast toast--two-actions';
    toast.style.cssText = `
        position: fixed;
        bottom: 48px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-none, 0);
        width: 90%;
        min-width: 320px;
        max-width: 480px;
        min-height: 104px;
        padding: var(--spacing-small, 16px);
        background: var(--sys-surface-inverse, #1A1D28);
        color: var(--sys-text-inverse, #FFFFFF);
        border-radius: var(--radius-large, 16px);
        box-shadow: var(--shadow-medium);
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    const content = document.createElement('div');
    content.textContent = message;
    content.style.cssText = `
        width: 100%;
        font-size: 14px;
        font-weight: 600;
        text-align: left;
        margin-bottom: 8px;
    `;

    const actions = document.createElement('div');
    actions.style.cssText = `
        display: flex;
        gap: 8px;
        width: 100%;
        justify-content: flex-end;
    `;

    const primaryBtn = document.createElement('button');
    primaryBtn.type = 'button';
    primaryBtn.textContent = primaryText;
    primaryBtn.style.cssText = `
        background: transparent;
        border: none;
        color: var(--sys-text-inverse, #FFFFFF);
        font-weight: 700;
        cursor: pointer;
        padding: 8px 12px;
        border-radius: var(--radius-small, 4px);
    `;
    primaryBtn.addEventListener('click', () => { try { onPrimary && onPrimary(); } catch(e){} toast.remove(); });

    const secondaryBtn = document.createElement('button');
    secondaryBtn.type = 'button';
    secondaryBtn.textContent = secondaryText;
    secondaryBtn.style.cssText = `
        background: transparent;
        border: none;
        color: var(--sys-text-inverse, #FFFFFF);
        font-weight: 700;
        cursor: pointer;
        padding: 8px 12px;
        border-radius: var(--radius-small, 4px);
        opacity: 0.9;
    `;
    secondaryBtn.addEventListener('click', () => { try { onSecondary && onSecondary(); } catch(e){} toast.remove(); });

    actions.appendChild(secondaryBtn);
    actions.appendChild(primaryBtn);
    toast.appendChild(content);
    toast.appendChild(actions);
    document.body.appendChild(toast);

    requestAnimationFrame(() => { toast.style.opacity = '1'; });
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
    }, duration);
}

// Touch Gesture Support
function setupTouchGestures() {
    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    });

    document.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe up - could trigger refresh or new content
                showToast('Swipe up detected');
            } else {
                // Swipe down - could trigger back navigation
                showToast('Swipe down detected');
            }
        }
    }
}

// Performance Optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll performance
const optimizedScroll = debounce(function() {
    // Handle scroll-based animations or effects
}, 16); // ~60fps

window.addEventListener('scroll', optimizedScroll);

// Accessibility Enhancements
function setupAccessibility() {
    // Add ARIA labels
    searchInput.setAttribute('aria-label', 'Search study sets');
    continueButton.setAttribute('aria-label', 'Continue studying US Capitals');
    moreOptionsBtns.forEach(btn => btn.setAttribute('aria-label', 'More options'));
    profileAvatar.setAttribute('aria-label', 'Profile menu');
    
    // Add role attributes
    jumpBackCard.setAttribute('role', 'button');
    jumpBackCard.setAttribute('tabindex', '0');
    
    recentItems.forEach(item => {
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
    });
    
    navItems.forEach(item => {
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
    });
}

// Service Worker Registration (for PWA capabilities)
// Only register ServiceWorker when served over HTTP/HTTPS (not file://)
if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Chat Functions
function openChatWithSelection(selection) {
    showChat();
    addUserMessage(selection);
    
    // Generate AI response based on selection
    setTimeout(() => {
        const aiResponse = generateAIResponse(selection);
        addAssistantMessage(aiResponse);
    }, 1000);
}

function showChat() {
    chatOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    chatInput.focus();
}

function hideChat() {
    chatOverlay.classList.remove('show');
    document.body.style.overflow = '';
    chatInput.value = '';
}

function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
        <div class="message-avatar">U</div>
        <div class="message-content">${text}</div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function addAssistantMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    messageDiv.innerHTML = `
        <div class="message-avatar">AI</div>
        <div class="message-content">${text}</div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateAIResponse(selection) {
    const responses = {
        'Make a study plan': `Great choice! Let's create a personalized study plan for you. 

I can help you:
• Set specific learning goals
• Break down topics into manageable chunks
• Create a realistic timeline
• Suggest study techniques

What subject are you studying, and when is your target date?`,
        
        'Cram for a test': `I understand you need to study quickly! Let's make the most of your time.

For effective cramming, I recommend:
• Focus on key concepts and definitions
• Use active recall techniques
• Create quick flashcards
• Take practice tests

What subject is your test on, and how much time do you have?`,
        
        'Quickly review': `Perfect! Let's do a quick review to refresh your memory.

I can help you:
• Identify knowledge gaps
• Focus on weak areas
• Use spaced repetition
• Test your recall

What topic would you like to review?`,
        
        'Memorize terms': `Excellent! Memorization is a key study skill.

Let's use proven techniques:
• Mnemonics and memory tricks
• Flashcards with spaced repetition
• Association methods
• Active recall practice

What terms or concepts do you need to memorize?`
    };
    
    return responses[selection] || `I'd be happy to help you with "${selection}"! What specific topic or subject would you like to focus on?`;
}

function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
        addUserMessage(message);
        chatInput.value = '';
        
        // Simulate AI response
        setTimeout(() => {
            const aiResponse = `I understand you're asking about "${message}". Let me help you with that. Could you provide more specific details about what you'd like to learn or practice?`;
            addAssistantMessage(aiResponse);
        }, 1000);
    }
}

// Chat Event Listeners
closeChatBtn.addEventListener('click', hideChat);
sendMessageBtn.addEventListener('click', sendMessage);

chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

chatOverlay.addEventListener('click', function(e) {
    if (e.target === chatOverlay) {
        hideChat();
    }
});

// Export functions for potential external use
window.StudyApp = {
    navigateToStudyScreen,
    showToast,
    showBottomSheet,
    updateProgress: function(newProgress) {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${newProgress}%`;
        }
    },
    openChat: openChatWithSelection
}; 