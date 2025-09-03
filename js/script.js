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



// Configuration
let PROGRESS_VALUE = 0; // Dynamic progress value

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚨 HOME PAGE LOAD: Starting home page initialization');
    
    // IMMEDIATELY check localStorage state on page load
    console.log('🚨 HOME PAGE LOAD: Checking localStorage state...');
    debugLocalStorageQuick();
    
    // Check for stale data that might be causing 70% issue
    const dailyData = getDailyProgress();
    const today = getTodayDateString();
    console.log('🚨 HOME PAGE LOAD: Daily data check:', {
        today,
        dailyData,
        todayData: dailyData[today]
    });
    
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
        // Check if user is returning from study plan
        const fromStudyPlan = sessionStorage.getItem('fromStudyPlan');
        if (fromStudyPlan === 'true') {
            sessionStorage.removeItem('fromStudyPlan');
            animateProgressUpdate();
        } else {
        loadStudyProgress();
        }
    }
});

// Check for URL parameter indicating return from study plan
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from') === 'study-plan') {
        // Remove the parameter from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        // Trigger animation after a short delay
        setTimeout(() => {
            animateProgressUpdate();
        }, 100);
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
                smoothNavigate('html/plan-flow.html?goal=study-plan');
                return;
            }
            
            // Route to plan flow for cram for a test
            if (/^cram for a test$/i.test(action)) {
                smoothNavigate('html/plan-flow.html?goal=cram');
                return;
            }
            
            // Route to plan flow for memorize terms
            if (/^memorize terms$/i.test(action)) {
                smoothNavigate('html/plan-flow.html?goal=memorize');
                return;
            }
            
            if (/^something else$/i.test(action)) {
                showToast('Something else flow opened');
                return;
            }
            // Fallback for any other buttons
            showToast(`${action} flow opened`);
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
        
        // Extract just the course code (everything before " - " if it exists)
        const courseCode = course.includes(' - ') ? course.split(' - ')[0] : course;
        
        const title = [courseCode, firstGoal].filter(Boolean).join(', ');
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
    
    // Skip API calls if they're likely to fail (development/local environment)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') {
        console.log('Skipping API calls in local environment');
        return;
    }
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
    console.log('🔍 DEBUG: loadStudyProgress() called');
    
    // Check if we have any study data at all
    const hasStudyPathData = localStorage.getItem('studyPathData');
    const hasDailyProgress = localStorage.getItem('dailyProgress');
    
    console.log('🔍 DEBUG: localStorage check', {
        hasStudyPathData: !!hasStudyPathData,
        hasDailyProgress: !!hasDailyProgress,
        studyPathDataContent: hasStudyPathData ? JSON.parse(hasStudyPathData) : null,
        dailyProgressContent: hasDailyProgress ? JSON.parse(hasDailyProgress) : null
    });
    
    // If no study data exists, force progress to 0
    if (!hasStudyPathData && !hasDailyProgress) {
        console.log('🔍 DEBUG: No study data found, setting progress to 0');
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        const progressBar = document.querySelector('.progress-bar');
        
        if (progressFill) {
            progressFill.style.width = '0%';
        }
        if (progressText) {
            progressText.textContent = '0% complete';
        }
        if (progressBar) {
            progressBar.classList.add('zero-state');
        }
        return;
    }
    
    // Update today's progress from study data first
    updateTodaysProgressFromStudyData();
    
    // Load daily progress data
    const dailyData = getDailyProgress();
    const today = getTodayDateString();
    const todayQuestions = dailyData[today]?.questions || 0;
    
    console.log('🔍 DEBUG: Progress calculation:', { 
        today, 
        todayQuestions, 
        dailyData,
        todayData: dailyData[today]
    });
    
    // Calculate overall study plan progress using simplified system
    let overallProgressPercentage = calculateOverallPlanProgress();
    
    console.log('🔍 DEBUG: Final progress calculation:', {
        todayQuestions,
        overallProgressPercentage
    });
    
    // Add error handling and validation
    if (isNaN(overallProgressPercentage) || overallProgressPercentage < 0) {
        console.warn('⚠️ Invalid progress percentage, defaulting to 0:', overallProgressPercentage);
        overallProgressPercentage = 0;
    }
    
    // Cap at 100%
    overallProgressPercentage = Math.min(overallProgressPercentage, 100);
    
    // SAFEGUARD: If we detect suspicious 70% progress, force it to 0
    if (overallProgressPercentage === 70) {
        console.log('🚨 SAFEGUARD: Detected 70% progress, likely from stale data. Forcing to 0.');
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        const progressBar = document.querySelector('.progress-bar');
        
        if (progressFill) {
            progressFill.style.width = '0%';
        }
        if (progressText) {
            progressText.textContent = '0% complete';
        }
        if (progressBar) {
            progressBar.classList.add('zero-state');
        }
        
        // Clear the problematic data
        const today = getTodayDateString();
        const dailyData = getDailyProgress();
        if (dailyData[today]) {
            console.log('🚨 SAFEGUARD: Clearing today\'s problematic data:', dailyData[today]);
            delete dailyData[today];
            saveDailyProgress(dailyData);
        }
        
        return; // Exit early after forcing reset
    }
    
    // Update progress bar
    const progressFill = document.querySelector('.progress-fill');
    const progressBar = document.querySelector('.progress-bar');
    
    if (progressFill) {
        progressFill.style.width = `${overallProgressPercentage}%`;
    }
    
    // Add/remove zero-state class for styling
    if (progressBar) {
        if (overallProgressPercentage === 0) {
            progressBar.classList.add('zero-state');
        } else {
            progressBar.classList.remove('zero-state');
        }
    }
    
    // Update progress text to show percentage complete
    const progressText = document.querySelector('.progress-text');
    if (progressText) {
        progressText.textContent = `${overallProgressPercentage}% complete`;
    }
    
    console.log('✅ Progress updated successfully:', {
        percentage: overallProgressPercentage,
        fillWidth: progressFill?.style.width,
        textContent: progressText?.textContent,
        hasProgressFill: !!progressFill,
        hasProgressText: !!progressText
    });
}

// Daily progress helper functions for home page
function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
}

function getDailyProgress() {
    try {
        const dailyData = localStorage.getItem('dailyProgress');
        return dailyData ? JSON.parse(dailyData) : {};
    } catch (error) {
        console.error('Error loading daily progress:', error);
        return {};
    }
}

function saveDailyProgress(data) {
    try {
        localStorage.setItem('dailyProgress', JSON.stringify(data));
        } catch (error) {
        console.error('Error saving daily progress:', error);
    }
}

// Update today's progress from study session data
function updateTodaysProgressFromStudyData() {
    console.log('🔍 DEBUG: updateTodaysProgressFromStudyData() called');
    
    const today = getTodayDateString();
    const dailyData = getDailyProgress();
    
    console.log('🔍 DEBUG: Starting data state:', {
        today,
        dailyData,
        todayData: dailyData[today]
    });
    
    // Check if progress has been reset - if so, don't calculate from stale data
    const hasStudyPathData = localStorage.getItem('studyPathData');
    if (!hasStudyPathData) {
        console.log('🔍 DEBUG: No study path data found, maintaining reset state for daily progress');
        // Ensure today's data is at zero if no study path exists
        if (!dailyData[today]) {
            dailyData[today] = { questions: 0, totalQuestions: 0, timestamp: Date.now() };
            saveDailyProgress(dailyData);
            console.log('🔍 DEBUG: Created zero progress data for today');
        } else {
            console.log('🔍 DEBUG: Today already has data:', dailyData[today]);
        }
        return dailyData;
    }
    
    // Get study path data
    let studyPathData = {};
    try {
        const savedData = localStorage.getItem('studyPathData');
        if (savedData) {
            studyPathData = JSON.parse(savedData);
        }
    } catch (error) {
        console.error('Error loading study path data:', error);
        return dailyData;
    }
    
    // Calculate total questions completed - but only if we have valid data
    const questionsPerRound = studyPathData.questionsPerRound || 7;
    const completedRounds = studyPathData.completedRounds || 0;
    const currentRoundProgress = studyPathData.currentRoundProgress || 0;
    
    // Safety check: if all values are 0, don't create fake progress
    if (completedRounds === 0 && currentRoundProgress === 0) {
        console.log('No actual progress found in study path data');
        if (!dailyData[today]) {
            dailyData[today] = { questions: 0, totalQuestions: 0, timestamp: Date.now() };
            saveDailyProgress(dailyData);
        }
        return dailyData;
    }
    
    const totalQuestionsCompleted = (completedRounds * questionsPerRound) + currentRoundProgress;
    
    // Get yesterday's total to calculate today's new questions
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    const yesterdayTotalQuestions = dailyData[yesterdayString]?.totalQuestions || 0;
    
    // Today's new questions = current total - yesterday's total
    const todaysNewQuestions = Math.max(0, totalQuestionsCompleted - yesterdayTotalQuestions);
    
    console.log('Daily Progress Calculation:', {
        today,
        totalQuestionsCompleted,
        yesterdayTotalQuestions,
        todaysNewQuestions,
        completedRounds,
        currentRoundProgress,
        questionsPerRound
    });
    
    // Initialize today's data if it doesn't exist
    if (!dailyData[today]) {
        dailyData[today] = { questions: 0, totalQuestions: 0 };
    }
    
    // Update today's progress (don't decrease if we're loading saved data)
    // Also preserve any higher values that might have been set by the study plan
    const existingQuestions = dailyData[today].questions || 0;
    const existingTotal = dailyData[today].totalQuestions || 0;
    
    dailyData[today].questions = Math.max(existingQuestions, todaysNewQuestions);
    dailyData[today].totalQuestions = Math.max(existingTotal, totalQuestionsCompleted);
    dailyData[today].timestamp = Date.now();
    
    saveDailyProgress(dailyData);
    
    console.log('Updated home page daily progress:', {
        todaysQuestions: dailyData[today].questions,
        totalQuestions: totalQuestionsCompleted
    });
    
    return dailyData;
}

// Calculate overall study plan progress using simplified grading system
function calculateOverallPlanProgress() {
    try {
        // Get study path data for calculation
        const studyPathData = localStorage.getItem('studyPathData');
        if (!studyPathData) {
            console.log('🔍 DEBUG: No study path data found, progress is 0%');
            return 0;
        }
        
        const pathData = JSON.parse(studyPathData);
        const questionsPerRound = pathData.questionsPerRound || 7;
        const completedRounds = pathData.completedRounds || 0;
        const currentRoundProgress = pathData.currentRoundProgress || 0;
        
        // Get total rounds from concepts (since study plan is based on concepts)
        const concepts = pathData.concepts || [];
        const totalRounds = concepts.length || 4; // Fallback to 4 if no concepts
        
        // Calculate total questions in plan
        const totalQuestions = totalRounds * questionsPerRound;
        
        // Calculate completed questions
        const completedQuestions = (completedRounds * questionsPerRound) + currentRoundProgress;
        
        // Calculate percentage
        const progressPercentage = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;
        
        console.log('🔍 DEBUG: Simplified progress calculation:', {
            totalRounds,
            questionsPerRound,
            totalQuestions,
            completedRounds,
            currentRoundProgress,
            completedQuestions,
            progressPercentage
        });
        
        return Math.min(progressPercentage, 100); // Cap at 100%
        
    } catch (error) {
        console.error('Error calculating overall plan progress:', error);
        return 0;
    }
}

// Get progress from adaptive learning system
function getAdaptiveLearningProgress() {
    try {
        // Check if adaptive learning system is available
        if (typeof window === 'undefined' || !window.AdaptiveLearning) {
            console.log('🔍 DEBUG: Adaptive learning system not available');
            return null;
        }
        
        // Load adaptive learning state
        window.AdaptiveLearning.loadState();
        
        // Get all questions from the study session
        const totalQuestions = 50; // Standard question pool size
        let completedQuestions = 0;
        
        // Count completed questions according to adaptive learning
        for (let questionId = 1; questionId <= totalQuestions; questionId++) {
            if (window.AdaptiveLearning.isQuestionCompleted(questionId)) {
                completedQuestions++;
            }
        }
        
        // Calculate percentage
        const progressPercentage = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;
        
        console.log('🔍 DEBUG: Adaptive learning progress:', {
            totalQuestions,
            completedQuestions,
            progressPercentage
        });
        
        return Math.min(progressPercentage, 100); // Cap at 100%
        
    } catch (error) {
        console.error('Error getting adaptive learning progress:', error);
        return null;
    }
}

// Animate progress update when returning from study plan
function animateProgressUpdate() {
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (!progressFill || !progressText) return;
    
            // Wait for screen to fully load before starting animation
        setTimeout(() => {
            // First, update today's progress from study data
            updateTodaysProgressFromStudyData();

            // Get current and new progress values
            const dailyData = getDailyProgress();
            const today = getTodayDateString();
            const todayQuestions = dailyData[today]?.questions || 0;

            console.log('Animation Debug:', {
                today,
                todayQuestions,
                dailyData,
                allData: dailyData
            });

            // Calculate new progress percentage based on overall plan progress
            const newProgressPercentage = calculateOverallPlanProgress();
        
        // Store original progress width for animation
        const currentWidth = parseInt(progressFill.style.width) || 0;
        
        // Step 1: Animate progress bar from current to new value (slower)
        progressFill.style.transition = 'width 2.2s cubic-bezier(0.25, 0.1, 0.25, 1)';
        progressFill.style.width = `${newProgressPercentage}%`;
        
        // Step 2: Show actual questions completed today
        const questionText = todayQuestions === 1 ? 'question' : 'questions';
        const dailyText = `${todayQuestions} ${questionText} today`;
        
        console.log('Animation will show:', dailyText);
        
        setTimeout(() => {
            // Simply change text content - no special styling
            progressText.textContent = dailyText;
        }, 1200); // Start text change partway through slower progress animation
        
        // Step 3: Animate back to percentage complete
        setTimeout(() => {
            // Simply change back to percentage text - no special styling cleanup needed
            progressText.textContent = `${newProgressPercentage}% complete`;
            
            // Clean up progress bar transition
            setTimeout(() => {
                progressFill.style.transition = '';
            }, 500);
        }, 4000); // Show daily text for longer with slower animation
        
    }, 800); // Delay start of animation to let screen load
}

// Set flag when navigating to study plan (to detect return)
function setStudyPlanFlag() {
    sessionStorage.setItem('fromStudyPlan', 'true');
}

// Add animation test buttons to debug bottom sheet
function addAnimationTestButtons() {
    const bottomSheetActions = document.querySelector('.bottom-sheet-actions');
    
    // Check if buttons already exist to prevent duplicates
    if (bottomSheetActions && !bottomSheetActions.querySelector('.animation-test-section')) {
        // Create separator
        const separator = document.createElement('div');
        separator.style.cssText = `
            height: 1px;
            background: var(--sys-border-primary);
            margin: 16px 0;
            opacity: 0.5;
        `;
        bottomSheetActions.appendChild(separator);
        
        // Add section title with class for duplicate detection
        const animationTitle = document.createElement('h4');
        animationTitle.className = 'animation-test-section';
        animationTitle.textContent = 'Test Progress Animation';
        animationTitle.style.cssText = `
            margin: 16px 0 8px 0;
            font-size: 14px;
            font-weight: 600;
            color: var(--sys-text-primary);
        `;
        bottomSheetActions.appendChild(animationTitle);
        
        // Test with 1 question (singular)
        const animBtn1 = document.createElement('button');
        animBtn1.className = 'action-button';
        animBtn1.innerHTML = `
            <span class="material-icons-round">play_arrow</span>
            <span class="subheading-3">Test Animation: 1 question today</span>
        `;
        animBtn1.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            simulateQuestionsCompleted(1);
            const bottomSheet = document.getElementById('bottomSheet');
            if (bottomSheet) bottomSheet.style.display = 'none';
        });
        bottomSheetActions.appendChild(animBtn1);
        
        // Test with 3 questions (plural)
        const animBtn3 = document.createElement('button');
        animBtn3.className = 'action-button';
        animBtn3.innerHTML = `
            <span class="material-icons-round">play_arrow</span>
            <span class="subheading-3">Test Animation: 3 questions today</span>
        `;
        animBtn3.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            simulateQuestionsCompleted(3);
            const bottomSheet = document.getElementById('bottomSheet');
            if (bottomSheet) bottomSheet.style.display = 'none';
        });
        bottomSheetActions.appendChild(animBtn3);
        
        // Test with 7 questions
        const animBtn7 = document.createElement('button');
        animBtn7.className = 'action-button';
        animBtn7.innerHTML = `
            <span class="material-icons-round">play_arrow</span>
            <span class="subheading-3">Test Animation: 7 questions today</span>
        `;
        animBtn7.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            simulateQuestionsCompleted(7);
            const bottomSheet = document.getElementById('bottomSheet');
            if (bottomSheet) bottomSheet.style.display = 'none';
        });
        bottomSheetActions.appendChild(animBtn7);
        
        // Clear test data button
        const clearTestBtn = document.createElement('button');
        clearTestBtn.className = 'action-button';
        clearTestBtn.innerHTML = `
            <span class="material-icons-round">clear_all</span>
            <span class="subheading-3">Clear Test Progress Data</span>
        `;
        clearTestBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            clearTestProgressData();
            const bottomSheet = document.getElementById('bottomSheet');
            if (bottomSheet) bottomSheet.style.display = 'none';
        });
        bottomSheetActions.appendChild(clearTestBtn);
        
        // Debug: Show localStorage contents
        const debugBtn = document.createElement('button');
        debugBtn.className = 'action-button';
        debugBtn.innerHTML = `
            <span class="material-icons-round">bug_report</span>
            <span class="subheading-3">Debug: Show localStorage</span>
        `;
        debugBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            debugLocalStorage();
            const bottomSheet = document.getElementById('bottomSheet');
            if (bottomSheet) bottomSheet.style.display = 'none';
        });
        bottomSheetActions.appendChild(debugBtn);
        
        // Emergency fix for 70% bug
        const emergencyBtn = document.createElement('button');
        emergencyBtn.className = 'action-button';
        emergencyBtn.innerHTML = `
            <span class="material-icons-round">healing</span>
            <span class="subheading-3">🩹 Fix 70% Progress Bug</span>
        `;
        emergencyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            emergency70PercentFix();
            const bottomSheet = document.getElementById('bottomSheet');
            if (bottomSheet) bottomSheet.style.display = 'none';
        });
        bottomSheetActions.appendChild(emergencyBtn);
        
        // Nuclear option: Clear ALL localStorage 
        const nuclearBtn = document.createElement('button');
        nuclearBtn.className = 'action-button';
        nuclearBtn.innerHTML = `
            <span class="material-icons-round">delete_forever</span>
            <span class="subheading-3">🚨 Nuclear: Clear ALL localStorage</span>
        `;
        nuclearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            nuclearResetLocalStorage();
            const bottomSheet = document.getElementById('bottomSheet');
            if (bottomSheet) bottomSheet.style.display = 'none';
        });
        bottomSheetActions.appendChild(nuclearBtn);
    }
}

// Reset study progress functionality
function resetStudyProgress() {
    try {
        // Clear all progress-related localStorage items
        localStorage.removeItem('studyPathData');
        localStorage.removeItem('dailyProgress');
        localStorage.removeItem('studyStats');
        localStorage.removeItem('fsrsStats');
        
        console.log('✅ Study progress reset successfully - all localStorage data cleared');
        console.log('✅ Test data and real progress data have been cleared');
        
        // Reset the progress bar and text on the page immediately
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        const progressBar = document.querySelector('.progress-bar');
        
        if (progressFill) {
            progressFill.style.width = '0%';
        }
        
        if (progressText) {
            progressText.textContent = '0% complete';
        }
        
        if (progressBar) {
            progressBar.classList.add('zero-state');
        }
        
        // Also clear any session storage flags
        sessionStorage.removeItem('fromStudyPlan');
        sessionStorage.removeItem('fromQuestionScreen');
        
        showToast('Study progress reset successfully');
        
        } catch (error) {
        console.error('Error resetting study progress:', error);
        showToast('Error resetting progress');
    }
}

// Reset onboarding flow
function resetOnboardingFlow() {
    try {
        // Clear onboarding-related localStorage items
        localStorage.removeItem('onboarding_completed');
        localStorage.removeItem('onboarding_course');
        localStorage.removeItem('onboarding_goals');
        localStorage.removeItem('onboarding_concepts');
        localStorage.removeItem('onboarding_goal_type');
        localStorage.removeItem('onboarding_due_date');
        localStorage.removeItem('onboarding_confidence');
        
        console.log('Onboarding flow reset successfully');
        
        showToast('Onboarding reset - page will reload');
        
        // Reload the page to show first-time experience
        setTimeout(() => {
            window.location.reload();
        }, 1500);
        
    } catch (error) {
        console.error('Error resetting onboarding:', error);
        showToast('Error resetting onboarding');
    }
}

// Temporary debug function to test the animation (simulate completing questions)
function simulateQuestionsCompleted(count = 5) {
    const today = getTodayDateString();
    const dailyData = getDailyProgress();
    
    // Initialize today's data if it doesn't exist
    if (!dailyData[today]) {
        dailyData[today] = { questions: 0, totalQuestions: 0 };
    }
    
    // Add the simulated questions - mark as test data
    dailyData[today].questions = count;
    dailyData[today].totalQuestions = count;
    dailyData[today].timestamp = Date.now();
    dailyData[today].isTestData = true; // Mark this as test data
    
    saveDailyProgress(dailyData);
    
    console.log(`⚠️ DEBUG: Simulated ${count} questions completed for testing - animation will show: "${count} ${count === 1 ? 'question' : 'questions'} today"`);
    console.log('⚠️ DEBUG: This is test data and may affect real progress calculation');
    
    // Trigger the animation
    animateProgressUpdate();
}

// Clear test progress data without affecting real study progress
function clearTestProgressData() {
    try {
        const today = getTodayDateString();
        const dailyData = getDailyProgress();
        
        // Check if today's data is marked as test data
        if (dailyData[today] && dailyData[today].isTestData) {
            // Clear today's test data
            delete dailyData[today];
            saveDailyProgress(dailyData);
            
            console.log('✅ Test progress data cleared');
            
            // Reset UI to 0
            const progressFill = document.querySelector('.progress-fill');
            const progressText = document.querySelector('.progress-text');
            const progressBar = document.querySelector('.progress-bar');
            
            if (progressFill) {
                progressFill.style.width = '0%';
            }
            
            if (progressText) {
                progressText.textContent = '0% complete';
            }
            
            if (progressBar) {
                progressBar.classList.add('zero-state');
            }
            
            showToast('Test progress data cleared');
        } else {
            console.log('No test data found to clear');
            showToast('No test data to clear');
        }
        
    } catch (error) {
        console.error('Error clearing test progress data:', error);
        showToast('Error clearing test data');
    }
}

// Quick debug function for page load
function debugLocalStorageQuick() {
    const allKeys = Object.keys(localStorage);
    console.log('🚨 QUICK DEBUG: localStorage keys:', allKeys);
    
    // Check specifically for problematic data
    const dailyProgress = localStorage.getItem('dailyProgress');
    const studyPathData = localStorage.getItem('studyPathData');
    
    if (dailyProgress) {
        try {
            const parsed = JSON.parse(dailyProgress);
            console.log('🚨 QUICK DEBUG: dailyProgress:', parsed);
            
            // Check if today has suspicious data
            const today = new Date().toISOString().split('T')[0];
            if (parsed[today] && parsed[today].questions > 0) {
                console.log('🚨 POTENTIAL ISSUE: Today has questions but should be 0:', parsed[today]);
                
                // Check if this is test data or real data
                if (parsed[today].isTestData) {
                    console.log('🚨 FOUND ISSUE: Test data persisting, clearing it...');
                    delete parsed[today];
                    localStorage.setItem('dailyProgress', JSON.stringify(parsed));
                    console.log('✅ Cleared test data');
                }
            }
        } catch (e) {
            console.log('🚨 ERROR parsing dailyProgress:', e);
        }
    }
    
    if (studyPathData) {
        try {
            const parsed = JSON.parse(studyPathData);
            console.log('🚨 QUICK DEBUG: studyPathData:', parsed);
        } catch (e) {
            console.log('🚨 ERROR parsing studyPathData:', e);
        }
    }
}

// Debug function to inspect localStorage contents
function debugLocalStorage() {
    console.log('🔍 DEBUG: Complete localStorage dump:');
    
    const allKeys = Object.keys(localStorage);
    console.log('🔍 DEBUG: All localStorage keys:', allKeys);
    
    allKeys.forEach(key => {
        try {
            const value = localStorage.getItem(key);
            const parsed = JSON.parse(value);
            console.log(`🔍 DEBUG: ${key}:`, parsed);
        } catch (e) {
            console.log(`🔍 DEBUG: ${key}:`, localStorage.getItem(key));
        }
    });
    
    // Show in alert for user visibility
    const debugInfo = allKeys.map(key => {
        try {
            const value = localStorage.getItem(key);
            const parsed = JSON.parse(value);
            return `${key}: ${JSON.stringify(parsed, null, 2)}`;
        } catch (e) {
            return `${key}: ${localStorage.getItem(key)}`;
        }
    }).join('\n\n');
    
    alert(`localStorage Contents:\n\n${debugInfo}`);
}

// Emergency fix specifically for the 70% progress bug
function emergency70PercentFix() {
    try {
        console.log('🩹 EMERGENCY FIX: Starting 70% progress bug fix...');
        
        const today = getTodayDateString();
        let fixesApplied = [];
        
        // 1. Clear any dailyProgress data for today
        const dailyData = getDailyProgress();
        if (dailyData[today]) {
            console.log('🩹 Clearing today\'s daily progress data:', dailyData[today]);
            delete dailyData[today];
            saveDailyProgress(dailyData);
            fixesApplied.push('Cleared today\'s daily progress');
        }
        
        // 2. Clear studyPathData if it exists but has no real progress
        const studyPathData = localStorage.getItem('studyPathData');
        if (studyPathData) {
            try {
                const parsed = JSON.parse(studyPathData);
                if (parsed.completedRounds === 0 && parsed.currentRoundProgress === 0) {
                    console.log('🩹 Clearing empty studyPathData:', parsed);
                    localStorage.removeItem('studyPathData');
                    fixesApplied.push('Cleared empty study path data');
                }
            } catch (e) {
                console.log('🩹 Clearing corrupt studyPathData');
                localStorage.removeItem('studyPathData');
                fixesApplied.push('Cleared corrupt study path data');
            }
        }
        
        // 3. Force UI to 0%
    const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        const progressBar = document.querySelector('.progress-bar');
        
    if (progressFill) {
            progressFill.style.width = '0%';
        }
        if (progressText) {
            progressText.textContent = '0% complete';
        }
        if (progressBar) {
            progressBar.classList.add('zero-state');
        }
        fixesApplied.push('Reset UI to 0%');
        
        // 4. Clear session storage flags that might be interfering
        sessionStorage.removeItem('fromStudyPlan');
        sessionStorage.removeItem('fromQuestionScreen');
        fixesApplied.push('Cleared session storage flags');
        
        console.log('🩹 EMERGENCY FIX: Completed. Fixes applied:', fixesApplied);
        
        if (fixesApplied.length > 0) {
            showToast(`🩹 Applied ${fixesApplied.length} fixes for 70% bug`);
        } else {
            showToast('🩹 No issues found to fix');
        }
        
        // Force reload the progress to ensure clean state
        setTimeout(() => {
            loadStudyProgress();
        }, 500);
        
    } catch (error) {
        console.error('🩹 Error during emergency fix:', error);
        showToast('🩹 Error during emergency fix');
    }
}

// Nuclear option: Clear ALL localStorage data
function nuclearResetLocalStorage() {
    const confirmed = confirm('🚨 WARNING: This will clear ALL localStorage data including onboarding, progress, and settings. Are you sure?');
    
    if (confirmed) {
        try {
            console.log('🚨 NUCLEAR: Clearing ALL localStorage data');
            localStorage.clear();
            sessionStorage.clear();
            
            // Reset UI immediately
            const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
            const progressBar = document.querySelector('.progress-bar');
            
            if (progressFill) {
                progressFill.style.width = '0%';
            }
    if (progressText) {
                progressText.textContent = '0% complete';
            }
            if (progressBar) {
                progressBar.classList.add('zero-state');
            }
            
            showToast('🚨 ALL localStorage cleared - page will reload');
            
            // Reload the page to start fresh
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('Error during nuclear reset:', error);
            showToast('Error during nuclear reset');
        }
    }
}



// Navigation Functions
function navigateToStudyScreen() {
    // Add loading state
    jumpBackCard.style.pointerEvents = 'none';
    continueButton.classList.add('loading');
    
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
    const progressBar = document.querySelector('.progress-bar');
    if (progressFill) {
        progressFill.style.width = '0%';
    }
    if (progressBar) {
        progressBar.classList.add('zero-state');
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
    localStorage.removeItem('onboarding_goal_type');
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





// Export functions for potential external use
window.StudyApp = {
    navigateToStudyScreen,
    showToast,
    showBottomSheet,
    updateProgress: function(newProgress) {
        const progressFill = document.querySelector('.progress-fill');
        const progressBar = document.querySelector('.progress-bar');
        if (progressFill) {
            progressFill.style.width = `${newProgress}%`;
        }
        if (progressBar) {
            if (newProgress === 0) {
                progressBar.classList.add('zero-state');
            } else {
                progressBar.classList.remove('zero-state');
            }
        }
    }
}; 