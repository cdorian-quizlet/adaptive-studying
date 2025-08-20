// Study Plan screen logic (migrated from study-path.js)

// Header component instance
let appHeader = null;

let pathSteps = document.querySelectorAll('.path-step'); // Will be updated when we generate dynamic content

// Progress Elements
const progressSummary = document.getElementById('progressSummary');
const trendChange = document.getElementById('trendChange');
const progressRingFill = document.querySelector('.progress-ring-fill');

// Onboarding data from plan flow
let onboardingData = {
    course: '',
    goals: [],
    concepts: [],
    dueDate: ''
};

// Study Path Data (will be updated based on onboarding)
const studyPathData = {
    totalRounds: 8, // Will be updated based on concepts
    questionsPerRound: 7,
    currentRound: 1,
    completedRounds: 0,
    currentRoundProgress: 0,
    totalQuestionsAnswered: 0,
    accuracy: 0,
    diagnosticTaken: false,
    diagnosticMidTaken: false,
    diagnosticFinalTaken: false,
    concepts: [], // Array of concept names that become rounds
    courseName: '' // Course name for header
};

// Initialize the study plan
document.addEventListener('DOMContentLoaded', function() {
    // Initialize header component
    initializeHeader();

    // Check if progress has been reset FIRST, before loading any data
    const hasProgressData = localStorage.getItem('studyPathData') || localStorage.getItem('dailyProgress');
    if (!hasProgressData) {
        console.log('No progress data found on page load, resetting overview card');
        // Reset overview card immediately
        const progressSummary = document.getElementById('progressSummary');
        const trendChange = document.getElementById('trendChange');
        const overviewTitle = document.querySelector('.overview-title');
        
        if (progressSummary) {
            progressSummary.textContent = '0 questions today';
        }
        if (trendChange) {
            trendChange.textContent = '0% complete';
            trendChange.className = 'daily-change';
        }
        if (overviewTitle) {
            overviewTitle.textContent = 'Keep up the momentum';
        }
        
        // Reset circular progress and ensure circular view is shown
        updateCircularProgress(0);
        
        // Make sure circular view is visible
        const circularView = document.getElementById('circularProgressView');
        const trendView = document.getElementById('trendGraphView');
        if (circularView) circularView.style.display = 'flex';
        if (trendView) trendView.style.display = 'none';
    }

    loadOnboardingData();
    generateDynamicStudyPlan();
    loadStudyPathData();
    updateUI();
    setupEventListeners();
    animateCompletedSteps();
    
    // Check for diagnostic completion and show confetti
    checkDiagnosticCompletion();

    // Show onboarding bottom sheet if coming from plan flow
    maybeShowOnboardingSheet();

    // Initialize material icons
    initMaterialIcons();

    // Extra sync after everything loads to ensure consistency
    setTimeout(() => {
        // Only sync if we have progress data (don't overwrite reset state)
        const hasProgressData = localStorage.getItem('studyPathData') || localStorage.getItem('dailyProgress');
        if (hasProgressData) {
            syncDailyProgressWithHome();
        }
    }, 100);
});

// Initialize header component
function initializeHeader() {
    appHeader = new AppHeader({
        backUrl: '../index.html',
        onBackClick: function() {
            sessionStorage.setItem('fromStudyPlan', 'true');
            window.location.href = '../index.html';
        },
        onSettingsClick: function() {
            console.log('Settings clicked');
            window.location.href = '../html/plan-settings.html';
        }
    });
    
    appHeader.init();
}

// Store previous progress for animation
let previousProgress = new Map();

// Daily progress tracking
function getTodayDateString() {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
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

function updateTodaysProgress() {
    const today = getTodayDateString();
    const dailyData = getDailyProgress();
    
    // Calculate total questions completed so far
    const todayRoundProgress = studyPathData.currentRoundProgress || 0;
    const completedRoundsQuestions = studyPathData.completedRounds * studyPathData.questionsPerRound;
    const totalQuestionsCompleted = completedRoundsQuestions + todayRoundProgress;
    
    // Get yesterday's total to calculate today's new questions
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    const yesterdayTotalQuestions = dailyData[yesterdayString]?.totalQuestions || 0;
    
    // Today's new questions = current total - yesterday's total
    const todaysNewQuestions = Math.max(0, totalQuestionsCompleted - yesterdayTotalQuestions);
    
    // Initialize today's data if it doesn't exist
    if (!dailyData[today]) {
        dailyData[today] = { questions: 0, totalQuestions: 0 };
    }
    
    // Update today's progress (don't decrease if we're loading saved data)
    dailyData[today].questions = Math.max(dailyData[today].questions || 0, todaysNewQuestions);
    dailyData[today].totalQuestions = totalQuestionsCompleted;
    dailyData[today].timestamp = Date.now();
    
    saveDailyProgress(dailyData);
    console.log('Updated daily progress:', {
        today,
        todaysNewQuestions: dailyData[today].questions,
        totalQuestions: totalQuestionsCompleted,
        yesterdayTotal: yesterdayTotalQuestions
    });
    
    return dailyData;
}

// Calculate overall study plan progress
function calculateOverallPlanProgress() {
    try {
        // Use the global studyPathData if available
        if (!studyPathData || !studyPathData.concepts) {
            console.log('🔍 DEBUG: [STUDY PLAN] No study path data found, progress is 0%');
            return 0;
        }
        
        const questionsPerRound = studyPathData.questionsPerRound || 7;
        const completedRounds = studyPathData.completedRounds || 0;
        const currentRoundProgress = studyPathData.currentRoundProgress || 0;
        
        // Get total rounds from concepts
        const totalRounds = studyPathData.concepts.length || 4; // Fallback to 4 if no concepts
        
        // Calculate total questions in plan
        const totalQuestions = totalRounds * questionsPerRound;
        
        // Calculate completed questions
        const completedQuestions = (completedRounds * questionsPerRound) + currentRoundProgress;
        
        // Calculate percentage
        const progressPercentage = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;
        
        console.log('🔍 DEBUG: [STUDY PLAN] Overall plan progress calculation:', {
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
        console.error('Error calculating overall plan progress in study plan:', error);
        return 0;
    }
}

// Function removed - using circular progress instead of trend chart

// Sync daily progress data with home page calculations
function syncDailyProgressWithHome() {
    try {
        // First check if progress has been reset
        const hasProgressData = localStorage.getItem('studyPathData') || localStorage.getItem('dailyProgress');
        if (!hasProgressData) {
            console.log('No progress data found during sync, maintaining reset state');
            return; // Don't sync if data has been reset
        }

        // Get home page daily progress data
        const dailyData = getDailyProgress();
        const today = getTodayDateString();

        // Check if home page has updated today's progress
        const homePageProgress = dailyData[today];
        if (homePageProgress && homePageProgress.timestamp) {
            console.log('Syncing with home page daily progress:', homePageProgress);

            // Use the home page calculated values to ensure consistency
            const todayQuestions = homePageProgress.questions || 0;
            const totalQuestions = homePageProgress.totalQuestions || 0;

            // Update progress summary and circular progress to show overall plan progress
            const overallProgressPercentage = calculateOverallPlanProgress();
            if (progressSummary) {
                progressSummary.textContent = `Study plan ${overallProgressPercentage}% complete`;
            }

            // Add/remove zero-state class for styling
            const circularView = document.getElementById('circularProgressView');
            if (circularView) {
                if (overallProgressPercentage === 0) {
                    circularView.classList.add('zero-state');
                } else {
                    circularView.classList.remove('zero-state');
                }
            }

            // Update circular progress to match overall plan progress
            updateCircularProgress(overallProgressPercentage);
            
            // Update text to show percentage complete (default home view)
            if (trendChange && !sessionStorage.getItem('fromQuestionScreen')) {
                trendChange.textContent = `${overallProgressPercentage}% complete`;
                trendChange.className = 'daily-change';
            }
            
            // Keep motivational headline (default home view)
            const overviewTitle = document.querySelector('.overview-title');
            if (overviewTitle && !sessionStorage.getItem('fromQuestionScreen')) {
                overviewTitle.textContent = 'Keep up the momentum';
            }
                
            console.log('Study plan synced with home page:', {
                todayQuestions,
                totalQuestions,
                overallProgressPercentage
            });
        }
    } catch (error) {
        console.error('Error syncing daily progress with home page:', error);
    }
}

function updateProgressSummary() {
    console.log('🔍 DEBUG: [STUDY PLAN] updateProgressSummary() called');
    
    const dailyData = getDailyProgress();
    const today = getTodayDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    const todayQuestions = dailyData[today]?.questions || 0;
    const yesterdayQuestions = dailyData[yesterdayString]?.questions || 0;
    
    console.log('🔍 DEBUG: [STUDY PLAN] Progress data state:', {
        today,
        todayQuestions,
        yesterdayQuestions,
        dailyData,
        todayData: dailyData[today]
    });
    
    // Check if progress has been reset (no data)
    const hasStudyPathData = localStorage.getItem('studyPathData');
    const hasDailyProgress = localStorage.getItem('dailyProgress');
    
    console.log('🔍 DEBUG: [STUDY PLAN] localStorage check:', {
        hasStudyPathData: !!hasStudyPathData,
        hasDailyProgress: !!hasDailyProgress,
        studyPathContent: hasStudyPathData ? JSON.parse(hasStudyPathData) : null,
        dailyProgressContent: hasDailyProgress ? JSON.parse(hasDailyProgress) : null
    });
    
    if (!hasStudyPathData && !hasDailyProgress) {
        console.log('🔍 DEBUG: [STUDY PLAN] No progress data found, resetting overview card');
        if (progressSummary) {
            progressSummary.textContent = '0 questions today';
        }
        if (trendChange) {
            trendChange.textContent = '0% complete';
            trendChange.className = 'daily-change';
        }
        showCircularProgress();
        return;
    }
    
    // Update summary text based on context
    if (progressSummary) {
        const fromQuestionScreen = sessionStorage.getItem('fromQuestionScreen') === 'true';
        if (fromQuestionScreen) {
            // Show daily questions when coming from question screen
            const questionText = todayQuestions === 1 ? 'question' : 'questions';
            progressSummary.textContent = `${todayQuestions} ${questionText} today`;
        } else {
            // Show overall plan progress by default
            const overallProgressPercentage = calculateOverallPlanProgress();
            progressSummary.textContent = `Study plan ${overallProgressPercentage}% complete`;
        }
    }
    
    // Check if user came from question screen to show comparison
    const fromQuestionScreen = sessionStorage.getItem('fromQuestionScreen') === 'true';
    
    if (fromQuestionScreen) {
        // Show trend comparison (today vs yesterday)
        showTrendComparison();
        // Clear the flag
        sessionStorage.removeItem('fromQuestionScreen');
    } else {
        // Show circular progress (default from home)
        showCircularProgress();
    }
    
    // Update bottom text based on view
    if (trendChange) {
        if (fromQuestionScreen) {
            // Show comparison when coming from question screen
            if (yesterdayQuestions > 0) {
                const change = todayQuestions - yesterdayQuestions;
                const changeText = change >= 0 ? `+${change}` : `${change}`;
                trendChange.textContent = `${changeText} vs yesterday`;
                trendChange.className = change >= 0 ? 'daily-change positive' : 'daily-change negative';
            } else {
                trendChange.textContent = `+${todayQuestions} today`;
                trendChange.className = 'daily-change positive';
            }
        } else {
            // Show overall plan progress percentage when coming from home
            const overallProgressPercentage = calculateOverallPlanProgress();
            trendChange.textContent = `${overallProgressPercentage}% complete`;
            trendChange.className = 'daily-change';
        }
    }
}

// Show circular progress view (from home navigation)
function showCircularProgress() {
    const circularView = document.getElementById('circularProgressView');
    const trendView = document.getElementById('trendGraphView');
    const overviewTitle = document.querySelector('.overview-title');
    
    if (circularView) circularView.style.display = 'flex';
    if (trendView) trendView.style.display = 'none';
    
    // Calculate and update circular progress based on overall plan progress
    const overallProgressPercentage = calculateOverallPlanProgress();
    
    // Add/remove zero-state class for styling
    if (circularView) {
        if (overallProgressPercentage === 0) {
            circularView.classList.add('zero-state');
        } else {
            circularView.classList.remove('zero-state');
        }
    }
    
    updateCircularProgress(overallProgressPercentage);
    
    // Keep motivational headline
    if (overviewTitle) {
        overviewTitle.textContent = 'Keep up the momentum';
    }
}

// Show trend comparison view (from question screen)
function showTrendComparison() {
    const circularView = document.getElementById('circularProgressView');
    const trendView = document.getElementById('trendGraphView');
    const overviewTitle = document.querySelector('.overview-title');
    
    if (circularView) circularView.style.display = 'none';
    if (trendView) trendView.style.display = 'flex';
    
    // Update headline to motivational text when showing trend
    if (overviewTitle) {
        overviewTitle.textContent = 'Keep up the momentum';
    }
    
    // Generate today vs yesterday comparison chart
    generateTodayVsYesterdayChart();
}

// Generate today vs yesterday comparison chart
function generateTodayVsYesterdayChart() {
    const trendChart = document.getElementById('overviewTrendChart');
    if (!trendChart) return;
    
    // Clear existing content
    trendChart.innerHTML = '';
    
    // Get today and yesterday data
    const dailyData = getDailyProgress();
    const today = getTodayDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    const todayQuestions = dailyData[today]?.questions || 0;
    const yesterdayQuestions = dailyData[yesterdayString]?.questions || 0;
    
    // Chart dimensions
    const width = 120;
    const height = 60;
    const padding = 16;
    const plotWidth = width - (padding * 2);
    const plotHeight = height - (padding * 2);
    
    // Find max for scaling
    const maxQuestions = Math.max(todayQuestions, yesterdayQuestions, 1);
    
    // Create points for yesterday and today
    const yesterdayY = padding + plotHeight - ((yesterdayQuestions / maxQuestions) * plotHeight);
    const todayY = padding + plotHeight - ((todayQuestions / maxQuestions) * plotHeight);
    
    const yesterdayX = padding + 20;
    const todayX = padding + plotWidth - 20;
    
    // Create organic curve between the two points
    const midX = (yesterdayX + todayX) / 2;
    const controlY = (yesterdayY + todayY) / 2 + (Math.random() - 0.5) * 10; // Add organic variation
    
    // Generate smooth curve path
    const pathData = `M ${yesterdayX} ${yesterdayY} Q ${midX} ${controlY} ${todayX} ${todayY}`;
    
    // Create the trend path
    const trendPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    trendPath.setAttribute('d', pathData);
    trendPath.setAttribute('class', 'trend-path');
    trendChart.appendChild(trendPath);
    
    // Add yesterday dot
    const yesterdayDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    yesterdayDot.setAttribute('cx', yesterdayX);
    yesterdayDot.setAttribute('cy', yesterdayY);
    yesterdayDot.setAttribute('r', '3');
    yesterdayDot.setAttribute('fill', '#9CA3AF');
    trendChart.appendChild(yesterdayDot);
    
    // Add today dot (highlighted)
    const todayDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    todayDot.setAttribute('cx', todayX);
    todayDot.setAttribute('cy', todayY);
    todayDot.setAttribute('class', 'trend-end-dot');
    trendChart.appendChild(todayDot);
}

// Refresh progress when returning from study screen
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log('Study plan page became visible, refreshing progress data');

        // Store current progress before updating
        const currentRound = studyPathData.currentRound;
        const currentProgress = studyPathData.currentRoundProgress;

        // Load new data and sync with home page
        loadStudyPathData();
        syncDailyProgressWithHome();

        // Check if progress has been reset (no data in localStorage)
        const hasProgressData = localStorage.getItem('studyPathData') || localStorage.getItem('dailyProgress');
        if (!hasProgressData) {
            console.log('Progress data has been reset, updating overview card');
            // Reset overview card display
            const progressSummary = document.getElementById('progressSummary');
            const trendChange = document.getElementById('trendChange');
            const overviewTitle = document.querySelector('.overview-title');
            
            if (progressSummary) {
                progressSummary.textContent = '0 questions today';
            }
            if (trendChange) {
                trendChange.textContent = '0% complete';
                trendChange.className = 'daily-change';
            }
            if (overviewTitle) {
                overviewTitle.textContent = 'Keep up the momentum';
            }
            
            // Reset circular progress
            updateCircularProgress(0);
            
            // Ensure circular view is shown
            showCircularProgress();
            
            return;
        }

        // Check if current round progress increased and trigger animation
        const newProgress = studyPathData.currentRoundProgress;
        if (studyPathData.currentRound === currentRound && newProgress > currentProgress) {
            console.log(`Progress increased from ${currentProgress} to ${newProgress} for round ${currentRound}`);
            previousProgress.set(currentRound, currentProgress);
            setTimeout(() => {
                animateProgressUpdate(currentRound, currentProgress, newProgress);
            }, 100); // Small delay to ensure DOM is ready
        } else {
            updateUI();
        }
    }
});

// Load onboarding data from localStorage
function loadOnboardingData() {
    try {
        // Load course name
        const course = localStorage.getItem('onboarding_course');
        if (course) {
            onboardingData.course = course;
            studyPathData.courseName = course;
        }
        
        // Load goals
        const goals = localStorage.getItem('onboarding_goals');
        if (goals) {
            onboardingData.goals = JSON.parse(goals);
        }
        
        // Load concepts
        const concepts = localStorage.getItem('onboarding_concepts');
        if (concepts) {
            onboardingData.concepts = JSON.parse(concepts);
            studyPathData.concepts = JSON.parse(concepts);
        }
        
        // Load due date
        const dueDate = localStorage.getItem('plan_due_date');
        if (dueDate) {
            onboardingData.dueDate = dueDate;
        }
        
        console.log('Loaded onboarding data:', onboardingData);
    } catch (error) {
        console.error('Error loading onboarding data:', error);
        // Fallback to default concepts if loading fails
        studyPathData.concepts = ['Cell Biology', 'Genetics', 'Evolution', 'Ecology'];
    }
}

// Generate dynamic study plan based on onboarding selections
function generateDynamicStudyPlan() {
    try {
        // Update header title with course code and goal name
        const headerTitle = document.querySelector('.header-title');
        if (headerTitle && studyPathData.courseName) {
            // Extract course code (everything before " - " if it exists)
            const courseCode = studyPathData.courseName.includes(' - ') ? 
                studyPathData.courseName.split(' - ')[0] : studyPathData.courseName;
            
            // Get first goal from onboarding data
            const firstGoal = Array.isArray(onboardingData.goals) && onboardingData.goals.length > 0 ? 
                onboardingData.goals[0] : '';
            
            // Format as "BIO 201, Exam 1"
            const title = [courseCode, firstGoal].filter(Boolean).join(', ');
            headerTitle.textContent = title || courseCode; // Fallback to course code if no goal
        }
        
        // Calculate total rounds based on concepts plus diagnostic tests
        const conceptCount = studyPathData.concepts.length;
        const diagnosticCount = 1 + Math.floor((conceptCount - 1) / 2); // Initial + diagnostics every 2 rounds
        studyPathData.totalRounds = conceptCount + diagnosticCount;
        
        // Generate dynamic HTML for path steps
        const pathContainer = document.querySelector('.path-container');
        if (pathContainer) {
            pathContainer.innerHTML = generatePathStepsHTML();
            
            // Update pathSteps reference after generating new content
            pathSteps = document.querySelectorAll('.path-step');
            
            // Initialize material icons for newly generated content
            initMaterialIcons();
        }
        
        console.log(`Generated study plan with ${conceptCount} concept rounds + 1 diagnostic`);
    } catch (error) {
        console.error('Error generating dynamic study plan:', error);
    }
}

// Generate HTML for path steps based on concepts
function generatePathStepsHTML() {
    let html = '';
    let stepCount = 0;
    
    // Helper function to generate diagnostic test HTML
    function generateDiagnosticHTML(type, title, description) {
        return `
            <div class="path-step diagnostic" data-round="diagnostic-${type}">
                <div class="step-indicator">
                    <div class="step-circle">
                        <span class="material-icons-round step-icon loaded">quiz</span>
                    </div>
                    <div class="step-line"></div>
                </div>
                <div class="step-content">
                    <div class="step-header">
                        <div>
                            <h3 class="step-title">${title}</h3>
                            <p class="step-description">${description}</p>
                        </div>
                        <div class="step-status skip-ahead" id="diagnostic${type.charAt(0).toUpperCase() + type.slice(1)}Status">
                            <span class="status-text">Skip ahead</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="step-vertical-spacer"></div>
        `;
    }
    
    // Helper function to generate round HTML
    function generateRoundHTML(concept, roundNumber, hasNextStep) {
        return `
            <div class="path-step" data-round="${roundNumber}">
                <div class="step-indicator">
                    <div class="step-circle">
                        <span class="material-icons-round step-icon loaded">star_outline</span>
                    </div>
                    ${hasNextStep ? '<div class="step-line"></div>' : ''}
                </div>
                <div class="step-content">
                    <div class="step-text-group">
                        <h3 class="step-title">Round ${roundNumber}</h3>
                        <p class="step-description">${concept}</p>
                        <div class="step-progress">
                            <div class="step-progress-bar">
                                <div class="step-progress-fill" style="width: 0%"></div>
                            </div>
                            <span class="step-progress-text">0/${studyPathData.questionsPerRound}</span>
                        </div>
                    </div>
                    <div class="step-status" id="round${roundNumber}Status">
                        <span class="material-icons-round loaded">play_arrow</span>
                        <span class="status-text">Start</span>
                    </div>
                </div>
            </div>
            <div class="step-vertical-spacer"></div>
        `;
    }
    
    // Generate rounds with diagnostic tests every 2 rounds (starting with rounds)
    studyPathData.concepts.forEach((concept, index) => {
        const roundNumber = index + 1;
        const isLastConcept = index === studyPathData.concepts.length - 1;
        
        // Add the round
        const hasNextStep = !isLastConcept || (roundNumber % 2 === 0 && !isLastConcept);
        html += generateRoundHTML(concept, roundNumber, hasNextStep);
        stepCount++;
        
        // Add diagnostic test every 2 rounds (but not after the last concept)
        if (roundNumber % 2 === 0 && !isLastConcept) {
            const diagnosticNumber = Math.floor(roundNumber / 2) + 1;
            let diagnosticType, diagnosticTitle, diagnosticDescription;
            
            if (diagnosticNumber === 2) {
                diagnosticType = 'mid';
                diagnosticTitle = 'Mid-Progress Diagnostic';
                diagnosticDescription = 'Check your progress and identify areas to focus on';
            } else {
                diagnosticType = `checkpoint${diagnosticNumber}`;
                diagnosticTitle = `Checkpoint Diagnostic ${diagnosticNumber - 1}`;
                diagnosticDescription = 'Assess your learning and adjust your study path';
            }
            
            const hasNextStepAfterDiagnostic = index < studyPathData.concepts.length - 1;
            html += generateDiagnosticHTML(diagnosticType, diagnosticTitle, diagnosticDescription);
            
            // Update the step line for the diagnostic
            if (hasNextStepAfterDiagnostic) {
                html = html.replace(/(<div class="step-line"><\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*)$/, '$1');
            } else {
                html = html.replace(/(<div class="step-line"><\/div>)(?=\s*<\/div>\s*<\/div>\s*<\/div>\s*$)/, '');
            }
            
            stepCount++;
        }
    });
    
    return html;
}

// Load study plan data from localStorage
function loadStudyPathData() {
    const savedData = localStorage.getItem('studyPathData');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            Object.assign(studyPathData, parsed);
            console.log('Loaded studyPathData from localStorage:', {
                currentRound: studyPathData.currentRound,
                completedRounds: studyPathData.completedRounds,
                currentRoundProgress: studyPathData.currentRoundProgress
            });
        } catch (error) {
            console.error('Error parsing saved study path data:', error);
        }
    }
    
    // Check for diagnostic test completions
    const diagnostic1Completed = localStorage.getItem('diagnostic1_completed') === 'true';
    const diagnostic2Completed = localStorage.getItem('diagnostic2_completed') === 'true';
    const diagnostic3Completed = localStorage.getItem('diagnostic3_completed') === 'true';
    
    // Update diagnostic completion status
    studyPathData.diagnosticTaken = diagnostic1Completed;
    studyPathData.diagnosticMidTaken = diagnostic2Completed;
    studyPathData.diagnosticFinalTaken = diagnostic3Completed;
    
    // Try to get FSRS progress first
    const fsrsStats = localStorage.getItem('fsrs_stats');
    let totalProgress = 0;
    
    // Check for regular study progress and update roundProgress
    updateRoundProgressFromStudyData();
    
    if (fsrsStats) {
        try {
            const stats = JSON.parse(fsrsStats);
            // Calculate progress based on FSRS data
            const totalCards = stats.totalCards || 0;
            const reviewCards = stats.reviewCards || 0;
            const learningCards = stats.learningCards || 0;
            
            // Consider cards "learned" if they're in review state or have been reviewed
            const learnedCards = reviewCards + learningCards;
            totalProgress = totalCards > 0 ? Math.round((learnedCards / totalCards) * 100) : 0;
            
            console.log('FSRS Study Plan Progress:', { totalCards, learnedCards, progress: totalProgress });
        } catch (error) {
            console.error('Error parsing FSRS stats:', error);
        }
    }
    
    // Load current round progress from localStorage
    const currentRoundNumber = localStorage.getItem('currentRoundNumber');
    const currentRoundProgress = localStorage.getItem('currentRoundProgress');
    
    if (currentRoundNumber && currentRoundProgress) {
        const loadedCurrentRound = parseInt(currentRoundNumber);
        const loadedCurrentProgress = parseInt(currentRoundProgress);
        
        // Only override if we don't have saved completion data, or if this data is newer
        if (!studyPathData.completedRounds && studyPathData.completedRounds !== 0) {
            console.log(`Loading fresh data: currentRound=${loadedCurrentRound}, progress=${loadedCurrentProgress}`);
            studyPathData.currentRound = loadedCurrentRound;
            studyPathData.currentRoundProgress = loadedCurrentProgress;
        studyPathData.completedRounds = Math.max(0, studyPathData.currentRound - 1);
        } else {
            // We have saved completion data, so preserve it
            console.log(`Preserving saved completion data: completedRounds=${studyPathData.completedRounds}, currentRound=${studyPathData.currentRound} vs loaded=${loadedCurrentRound}`);
            studyPathData.currentRound = Math.max(studyPathData.currentRound, loadedCurrentRound);
            studyPathData.currentRoundProgress = studyPathData.currentRound === loadedCurrentRound ? loadedCurrentProgress : 0;
        }
        
        // Check if this round should be completed based on loaded progress
        if (studyPathData.currentRoundProgress >= studyPathData.questionsPerRound) {
            const conceptRounds = studyPathData.concepts.length || 7;
            if (studyPathData.currentRound <= conceptRounds) {
                console.log(`Loaded completed round ${studyPathData.currentRound}, advancing to next`);
                // Don't call markRoundCompleted here as it would cause recursion
                // Just update the data directly
                studyPathData.completedRounds = studyPathData.currentRound;
                if (studyPathData.currentRound < conceptRounds) {
                    studyPathData.currentRound = studyPathData.currentRound + 1;
                } else {
                    studyPathData.currentRound = conceptRounds + 1;
                }
                studyPathData.currentRoundProgress = 0;
                localStorage.setItem('currentRoundNumber', studyPathData.currentRound);
                localStorage.removeItem('currentRoundProgress');
                
                // Save the updated completion status
                saveStudyPathData();
            }
        }
    } else {
        // Fallback to old progress system if no FSRS data
        if (totalProgress === 0) {
            const studyProgress = localStorage.getItem('studyProgress');
            const currentQuestionIndex = localStorage.getItem('currentQuestionIndex') || 0;
            const studyAccuracy = localStorage.getItem('studyAccuracy');
            
            if (studyProgress) {
                totalProgress = parseInt(studyProgress);
            }
            
            if (studyAccuracy) {
                studyPathData.accuracy = parseInt(studyAccuracy);
            }
            
            // Calculate current round based on completed questions
            const totalQuestionsCompleted = parseInt(currentQuestionIndex);
            studyPathData.completedRounds = Math.floor(totalQuestionsCompleted / studyPathData.questionsPerRound);
            studyPathData.currentRound = studyPathData.completedRounds + 1;
            studyPathData.currentRoundProgress = totalQuestionsCompleted % studyPathData.questionsPerRound;
            
            console.log(`Fallback calculation: ${totalQuestionsCompleted} questions → ${studyPathData.completedRounds} completed rounds, current round ${studyPathData.currentRound}`);
        } else {
            // Use FSRS progress to calculate rounds
            const totalQuestions = 50; // Total questions
            const totalQuestionsCompleted = Math.round((totalProgress / 100) * totalQuestions);
            studyPathData.completedRounds = Math.floor(totalQuestionsCompleted / studyPathData.questionsPerRound);
            studyPathData.currentRound = studyPathData.completedRounds + 1;
            studyPathData.currentRoundProgress = totalQuestionsCompleted % studyPathData.questionsPerRound;
            
            console.log(`FSRS calculation: ${totalQuestionsCompleted} questions → ${studyPathData.completedRounds} completed rounds, current round ${studyPathData.currentRound}`);
        }
    }
    
    // Ensure we don't exceed total concept rounds
    const conceptRounds = studyPathData.concepts.length || 7;
    if (studyPathData.currentRound > conceptRounds) {
        studyPathData.currentRound = conceptRounds + 1; // All rounds completed
        studyPathData.completedRounds = conceptRounds;
        studyPathData.currentRoundProgress = 0;
    }
    
    // Ensure current round is at least 1
    if (studyPathData.currentRound < 1) {
        studyPathData.currentRound = 1;
        studyPathData.completedRounds = 0;
        studyPathData.currentRoundProgress = 0;
    }
    
    studyPathData.totalQuestionsAnswered = totalProgress;
    
    // Save the calculated data to ensure completion status persists
    saveStudyPathData();
    
    console.log('Final studyPathData after loading:', {
        currentRound: studyPathData.currentRound,
        completedRounds: studyPathData.completedRounds,
        currentRoundProgress: studyPathData.currentRoundProgress,
        concepts: studyPathData.concepts.length
    });
}

// Update the UI with current data
function updateUI() {
    // Check if any rounds need to be auto-completed based on progress
    checkForRoundCompletion();
    
    // Update daily progress tracking and display
    updateTodaysProgress();
    updateProgressSummary();
    
    // Sync daily progress with home page data
    syncDailyProgressWithHome();
    
    // Update path steps
    updatePathSteps();
    
    // Ensure new icons are loaded
    initMaterialIcons();
}

// Check if current round should be marked as completed
function checkForRoundCompletion() {
    if (studyPathData.currentRoundProgress >= studyPathData.questionsPerRound) {
        const currentRound = studyPathData.currentRound;
        const conceptRounds = studyPathData.concepts.length || 7;
        
        // Only mark as completed if not already completed and within valid range
        if (currentRound <= conceptRounds && currentRound > studyPathData.completedRounds) {
            console.log(`Auto-completing round ${currentRound} due to full progress`);
            markRoundCompleted(currentRound);
        }
    }
}

// Update circular progress ring
function updateCircularProgress(percentage) {
    if (progressRingFill) {
        const radius = 38;
        const circumference = 2 * Math.PI * radius;
        const progress = (percentage / 100) * circumference;
        
        progressRingFill.style.strokeDasharray = `${progress} ${circumference}`;
    }
}

// Animate progress update for current round
function animateProgressUpdate(roundNumber, oldProgress, newProgress) {
    const step = document.querySelector(`[data-round="${roundNumber}"]`);
    if (!step || !step.classList.contains('current')) {
        updateUI();
        return;
    }
    
    const stepProgressFill = step.querySelector('.step-progress-fill');
    const stepProgressText = step.querySelector('.step-progress-text');
    const stepProgress = step.querySelector('.step-progress');
    
    if (!stepProgressFill) {
        updateUI();
        return;
    }
    
    console.log(`Animating progress for round ${roundNumber}: ${oldProgress} → ${newProgress}`);
    
    // Start with old progress
    const oldPercentage = (oldProgress / studyPathData.questionsPerRound) * 100;
    const newPercentage = (newProgress / studyPathData.questionsPerRound) * 100;
    
    // Set initial state
    stepProgressFill.style.width = `${oldPercentage}%`;
    
    // Show progress bar if needed
    if (newProgress > 0) {
        stepProgress.classList.add('has-progress');
    }
    
    // Animate text update
    if (stepProgressText && newProgress > 0) {
        stepProgressText.classList.add('updating');
        
        // Update text after brief delay
        setTimeout(() => {
            stepProgressText.textContent = `${Math.round(newPercentage)}% complete`;
            stepProgressText.classList.remove('updating');
        }, 150);
    } else if (stepProgressText && newProgress === 0) {
        // Handle case where progress goes to 0
        stepProgressText.textContent = '';
    }
    
    // Animate progress bar
    setTimeout(() => {
        stepProgressFill.style.width = `${newPercentage}%`;
    }, 50);
    
    // Update the rest of the UI after animation starts
    setTimeout(() => {
        updateUI();
    }, 200);
}

// Update individual path steps
function updatePathSteps() {
    pathSteps.forEach((step, index) => {
        const roundType = step.dataset.round;
        const stepCircle = step.querySelector('.step-circle');
        const stepLine = step.querySelector('.step-line');
        const stepStatus = step.querySelector('.step-status');
        const stepProgressFill = step.querySelector('.step-progress-fill');
        const stepProgressText = step.querySelector('.step-progress-text');
        
        if (roundType === 'diagnostic-initial' || roundType === 'diagnostic') {
            // Initial diagnostic test (support legacy 'diagnostic' format)
            updateDiagnosticStep(step, stepCircle, stepStatus, 'diagnostic');
        } else if (roundType === 'diagnostic-mid') {
            // Mid diagnostic test
            updateDiagnosticStep(step, stepCircle, stepStatus, 'diagnosticMid');
        } else if (roundType.startsWith('diagnostic-checkpoint')) {
            // Checkpoint diagnostic tests
            const checkpointNum = roundType.replace('diagnostic-checkpoint', '');
            updateDiagnosticStep(step, stepCircle, stepStatus, `diagnosticCheckpoint${checkpointNum}`);
        } else if (roundType.startsWith('diagnostic-')) {
            // Any other diagnostic type
            const diagnosticType = roundType.replace('diagnostic-', '');
            updateDiagnosticStep(step, stepCircle, stepStatus, `diagnostic${diagnosticType.charAt(0).toUpperCase() + diagnosticType.slice(1)}`);
        } else {
            // Regular round
            const roundNumber = parseInt(roundType);
            updateRoundStep(step, stepCircle, stepLine, stepStatus, stepProgressFill, stepProgressText, roundNumber);
        }
    });
}

// Update diagnostic test steps
function updateDiagnosticStep(step, stepCircle, stepStatus, diagnosticType) {
    const isTaken = studyPathData[diagnosticType + 'Taken'];
    
    stepCircle.classList.add('diagnostic');
    
    // Find the associated vertical spacer and update its class
    const nextSibling = step.nextElementSibling;
    if (nextSibling && nextSibling.classList.contains('step-vertical-spacer')) {
        nextSibling.classList.remove('completed', 'current', 'next');
        nextSibling.classList.add('diagnostic'); // Add diagnostic class for sherbert200 color
    }
    
    if (isTaken) {
        step.classList.add('completed'); // Add completed class to step
        stepCircle.classList.add('completed');
        stepCircle.querySelector('.step-icon').textContent = 'check';
        stepStatus.style.display = 'none'; // Hide button for completed diagnostics
        
        // Update spacer color for completed diagnostics
        if (nextSibling && nextSibling.classList.contains('step-vertical-spacer')) {
            nextSibling.classList.add('completed');
        }
        
        // Add spacer after completed diagnostic if it doesn't exist
        if (!step.nextElementSibling || !step.nextElementSibling.classList.contains('step-spacer')) {
            const spacer = document.createElement('div');
            spacer.className = 'step-spacer';
            step.parentNode.insertBefore(spacer, step.nextElementSibling);
        }
    } else {
        step.classList.remove('completed'); // Remove completed class from step
        stepStatus.innerHTML = `<span class="status-text">Skip ahead</span>`;
        stepStatus.classList.add('skip-ahead');
        stepStatus.classList.remove('completed');
        
        // Non-completed diagnostics use default spacer color (gray-200)
    }
}

// Update regular round steps
function updateRoundStep(step, stepCircle, stepLine, stepStatus, stepProgressFill, stepProgressText, roundNumber) {
    // Check if this round is completed using completedRounds data
    const isCompleted = roundNumber <= studyPathData.completedRounds;
    const isCurrent = roundNumber === studyPathData.currentRound;
    const isNext = roundNumber > studyPathData.currentRound;
    
    // Check if this round has progress from diagnostic tests
    const roundProgress = studyPathData.roundProgress ? studyPathData.roundProgress[roundNumber] || 0 : 0;
    const hasDiagnosticProgress = roundProgress > 0;
    
    console.log(`Updating round ${roundNumber}:`, {
        isCompleted,
        isCurrent,
        isNext,
        currentRound: studyPathData.currentRound,
        completedRounds: studyPathData.completedRounds,
        roundProgress,
        hasDiagnosticProgress,
        studyPathData: studyPathData
    });
    
    // Remove all state classes first
    step.classList.remove('completed', 'current', 'next');
    stepCircle.classList.remove('completed', 'in-progress', 'next');
    stepStatus.classList.remove('completed', 'in-progress', 'next', 'skip-ahead');
    
    // Get the step-progress element to manage visibility
    const stepProgress = step.querySelector('.step-progress');
    
    // Find the associated vertical spacer and update its class
    const nextSibling = step.nextElementSibling;
    if (nextSibling && nextSibling.classList.contains('step-vertical-spacer')) {
        nextSibling.classList.remove('completed', 'current', 'next');
    }
    
    if (isCompleted) {
        // Completed round
        step.classList.add('completed');
        stepCircle.classList.add('completed');
        stepCircle.querySelector('.step-icon').textContent = 'check';
        
        stepStatus.style.display = 'none'; // Hide button for completed rounds
        stepStatus.classList.add('completed');
        
        stepProgressFill.style.width = '100%';
        stepProgress.classList.add('has-progress');
        
        // Hide progress text for completed rounds
        if (stepProgressText) {
            stepProgressText.textContent = '';
        }
        
        // Update spacer color
        if (nextSibling && nextSibling.classList.contains('step-vertical-spacer')) {
            nextSibling.classList.add('completed');
        }
        
    } else if (isCurrent) {
        // Current round (first non-completed round)
        step.classList.add('current');
        stepCircle.classList.add('in-progress');
        stepCircle.querySelector('.step-icon').textContent = 'star_outline';
        
        stepStatus.innerHTML = `<span class="material-icons-round loaded">play_arrow</span>`;
        stepStatus.classList.add('in-progress');
        stepStatus.style.display = 'flex';
        
        const progressPercentage = (studyPathData.currentRoundProgress / studyPathData.questionsPerRound) * 100;
        stepProgressFill.style.width = `${progressPercentage}%`;
        
        // Only show progress bar and text when there's actual progress
        if (studyPathData.currentRoundProgress > 0) {
            stepProgress.classList.add('has-progress');
            // Update progress text for current round (only if not currently animating)
            if (stepProgressText && !stepProgressText.classList.contains('updating')) {
                stepProgressText.textContent = `${Math.round(progressPercentage)}% complete`;
            }
        } else {
            stepProgress.classList.remove('has-progress');
            // Hide progress text when no progress
            if (stepProgressText && !stepProgressText.classList.contains('updating')) {
                stepProgressText.textContent = '';
            }
        }
        
        // Update spacer color for current round
        if (nextSibling && nextSibling.classList.contains('step-vertical-spacer')) {
            nextSibling.classList.add('current');
        }
        
    } else if (isNext) {
        // Next/future rounds
        step.classList.add('next');
        stepCircle.classList.add('next');
        stepCircle.querySelector('.step-icon').textContent = 'star_outline';
        
        stepStatus.innerHTML = `<span class="material-icons-round loaded">play_arrow</span>`;
        stepStatus.classList.add('next');
        stepStatus.style.display = 'flex';
        
        stepProgressFill.style.width = '0%';
        stepProgress.classList.remove('has-progress');
        
        // Hide progress text for next rounds
        if (stepProgressText) {
            stepProgressText.textContent = '';
        }
        
        // Update spacer color for next rounds
        if (nextSibling && nextSibling.classList.contains('step-vertical-spacer')) {
            nextSibling.classList.add('next');
        }
        
    } else if (hasDiagnosticProgress) {
        // Round with diagnostic progress (but not current)
        step.classList.add('next'); // Treat as next round with some progress
        stepCircle.classList.add('next');
        stepCircle.querySelector('.step-icon').textContent = 'star_outline';
        
        stepStatus.innerHTML = `<span class="material-icons-round loaded">play_arrow</span>`;
        stepStatus.classList.add('next');
        stepStatus.style.display = 'flex';
        
        // Show diagnostic progress
        const progressPercentage = (roundProgress / studyPathData.questionsPerRound) * 100;
        stepProgressFill.style.width = `${progressPercentage}%`;
        stepProgress.classList.add('has-progress');
        
        // Hide progress text for diagnostic progress rounds (not current)
        if (stepProgressText) {
            stepProgressText.textContent = '';
        }
        
        // Update spacer color for next rounds
        if (nextSibling && nextSibling.classList.contains('step-vertical-spacer')) {
            nextSibling.classList.add('next');
        }
    }
}

// Animate completed steps
function animateCompletedSteps() {
    pathSteps.forEach((step, index) => {
        const roundType = step.dataset.round;
        if (roundType === 'diagnostic' && studyPathData.diagnosticTaken) {
            setTimeout(() => {
                const stepCircle = step.querySelector('.step-circle');
                stepCircle.classList.add('completed');
            }, (index + 1) * 100);
        } else if (roundType === 'diagnostic-mid' && studyPathData.diagnosticMidTaken) {
            setTimeout(() => {
                const stepCircle = step.querySelector('.step-circle');
                stepCircle.classList.add('completed');
            }, (index + 1) * 100);
        } else if (roundType === 'diagnostic-final' && studyPathData.diagnosticFinalTaken) {
            setTimeout(() => {
                const stepCircle = step.querySelector('.step-circle');
                stepCircle.classList.add('completed');
            }, (index + 1) * 100);
        } else if (!isNaN(parseInt(roundType))) {
            const roundNumber = parseInt(roundType);
            if (roundNumber <= studyPathData.completedRounds) {
                setTimeout(() => {
                    const stepCircle = step.querySelector('.step-circle');
                    stepCircle.classList.add('completed');
                }, (index + 1) * 100);
            }
        }
    });
}

// Event Listeners
function setupEventListeners() {
    // Path step clicks
    pathSteps.forEach((step, index) => {
        step.addEventListener('click', function() {
            // Prevent clicks on next/future rounds
            if (step.classList.contains('next')) {
                return;
            }
            
            const roundType = step.dataset.round;
            
            if (roundType === 'diagnostic-initial') {
                startDiagnosticTest('initial');
            } else if (roundType === 'diagnostic-mid') {
                startDiagnosticTest('mid');
            } else if (roundType.startsWith('diagnostic-checkpoint')) {
                const checkpointNum = roundType.replace('diagnostic-checkpoint', '');
                startDiagnosticTest(`checkpoint${checkpointNum}`);
            } else if (roundType === 'diagnostic') {
                // Legacy support for old diagnostic format
                startDiagnosticTest('initial');
            } else {
                const roundNumber = parseInt(roundType);
                // Additional check: only allow current round or earlier
                if (roundNumber <= studyPathData.currentRound) {
                startRound(roundNumber);
                }
            }
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'Escape':
                backBtn.click();
                break;
        }
    });
}

// Onboarding sheet logic
function maybeShowOnboardingSheet() {
    try {
        const shouldOpen = localStorage.getItem('onboarding_sheet_open') === 'true';
        if (!shouldOpen) return;
        const pill = localStorage.getItem('onboarding_knowledge_pill') || 'Somewhat confident';
        const headline = localStorage.getItem('onboarding_knowledge_headline') || 'We’ll move fast, fine-tune weak areas, and review test-style questions.';
        const sheet = document.getElementById('onboardingSheet');
        if (!sheet) return;
        sheet.style.display = 'block';
        document.getElementById('onboardingPill').textContent = pill;
        document.getElementById('onboardingHeadline').textContent = headline;
        const closeBtn = document.getElementById('onboardingClose');
        const customizeBtn = document.getElementById('onboardingCustomize');
        closeBtn.addEventListener('click', () => {
            sheet.style.display = 'none';
            localStorage.removeItem('onboarding_sheet_open');
            // Mark onboarding completed and reflect at home
            localStorage.setItem('onboarding_completed','true');
        });
        customizeBtn.addEventListener('click', () => {
            sheet.style.display = 'none';
            localStorage.removeItem('onboarding_sheet_open');
            showToast('Opening study plan settings (coming soon)');
        });
        // Clicking outside content closes
        sheet.addEventListener('click', (e)=>{ if (e.target === sheet) { closeBtn.click(); } });
    } catch (e) { console.warn('Onboarding sheet error', e); }
}

// Start a diagnostic test
function startDiagnosticTest(type) {
    // Save current state
    saveStudyPathData();
    
    // Navigate to the appropriate diagnostic test
    switch (type) {
        case 'initial':
            window.location.href = '../html/diagnostic-1.html';
            break;
        case 'mid':
            window.location.href = '../html/diagnostic-2.html';
            break;
        case 'final':
            window.location.href = '../html/diagnostic-3.html';
            break;
        default:
            // For checkpoint diagnostics and other types, use diagnostic-1.html as default
            // You can create additional diagnostic HTML files as needed
            if (type.startsWith('checkpoint')) {
                showToast(`Starting checkpoint diagnostic test...`);
                window.location.href = '../html/diagnostic-1.html';
            } else {
            showToast(`Starting ${type} diagnostic test...`);
                window.location.href = '../html/diagnostic-1.html';
            }
    }
}

// Start a round
function startRound(roundNumber) {
    // Set the current round number
    localStorage.setItem('currentRoundNumber', roundNumber);
    
    // Save current state
    saveStudyPathData();
    
    // Navigate to study screen; pass along preferred subject if available
    const preferredSubject = (localStorage.getItem('homeSubject') || '').trim();
    const url = preferredSubject
        ? `../html/study.html?subject=${encodeURIComponent(preferredSubject)}`
        : '../html/study.html';
    window.location.href = url;
}

// Update roundProgress from regular study session data
function updateRoundProgressFromStudyData() {
    // Get regular study progress
    const studyProgress = localStorage.getItem('studyProgress');
    const currentQuestionIndex = localStorage.getItem('currentQuestionIndex');
    const roundProgressData = localStorage.getItem('roundProgressData');
    
    if (studyProgress || currentQuestionIndex || roundProgressData) {
        console.log('Updating roundProgress from study data');
        
        // Initialize roundProgress if it doesn't exist
        if (!studyPathData.roundProgress) {
            studyPathData.roundProgress = {};
        }
        
        // Method 1: Use roundProgressData if available (most accurate)
        if (roundProgressData) {
            try {
                const roundData = JSON.parse(roundProgressData);
                Object.keys(roundData).forEach(roundNumber => {
                    const round = parseInt(roundNumber);
                    const progress = roundData[round].progress || 0;
                    if (progress > 0) {
                        studyPathData.roundProgress[round] = progress;
                        console.log(`Updated round ${round} progress to ${progress} from roundProgressData`);
                    }
                });
            } catch (error) {
                console.error('Error parsing roundProgressData:', error);
            }
        }
        
        // Method 2: Fallback to currentQuestionIndex calculation
        if (currentQuestionIndex) {
            const totalQuestionsCompleted = parseInt(currentQuestionIndex);
            const questionsPerRound = studyPathData.questionsPerRound || 7;
            
            // Calculate which rounds have progress (excluding diagnostic round)
            const conceptRounds = studyPathData.concepts.length || 7; // Fallback to 7 rounds if no concepts
            for (let round = 1; round <= conceptRounds; round++) {
                const roundStartQuestion = (round - 1) * questionsPerRound;
                const roundEndQuestion = round * questionsPerRound;
                
                if (totalQuestionsCompleted > roundStartQuestion) {
                    const questionsInRound = Math.min(totalQuestionsCompleted - roundStartQuestion, questionsPerRound);
                    if (questionsInRound > 0) {
                        // Only update if we don't already have data for this round
                        if (!studyPathData.roundProgress[round]) {
                            studyPathData.roundProgress[round] = questionsInRound;
                            console.log(`Updated round ${round} progress to ${questionsInRound} from currentQuestionIndex`);
                        }
                    }
                }
            }
        }
        
        // Save the updated data
        saveStudyPathData();
    }
}

// Save study plan data to localStorage
function saveStudyPathData() {
    localStorage.setItem('studyPathData', JSON.stringify(studyPathData));
}

// Function to mark a round as completed (called from study screen)
function markRoundCompleted(roundNumber) {
    // Dynamic total rounds based on concepts (excluding diagnostic)
    const conceptRounds = studyPathData.concepts.length || 7;
    if (roundNumber <= conceptRounds) {
        // Mark the completed round
        studyPathData.completedRounds = Math.max(studyPathData.completedRounds, roundNumber);
        
        // Set current round to next available round
        if (roundNumber < conceptRounds) {
        studyPathData.currentRound = roundNumber + 1;
        } else {
            // All rounds completed
            studyPathData.currentRound = conceptRounds + 1;
        }
        studyPathData.currentRoundProgress = 0;
        
        // Clear localStorage for completed round
        localStorage.removeItem('currentRoundProgress');
        localStorage.setItem('currentRoundNumber', studyPathData.currentRound);
        
        console.log(`Round ${roundNumber} completed. Current round is now ${studyPathData.currentRound}`);
        
        // Update the UI to reflect new states
        updateUI();
        saveStudyPathData();
        
        // Show completion message
        showToast(`Round ${roundNumber} completed! Moving to next round.`, 3000);
    }
}

// Function to update current round progress (called from study screen)
function updateRoundProgress(questionsCompleted) {
    studyPathData.currentRoundProgress = questionsCompleted;
    studyPathData.totalQuestionsAnswered = (studyPathData.completedRounds * studyPathData.questionsPerRound) + questionsCompleted;
    
    // Save to localStorage for persistence
    localStorage.setItem('currentRoundProgress', questionsCompleted);
    
    // Update daily progress tracking
    updateTodaysProgress();
    
    // Check if round is completed and automatically advance
    if (questionsCompleted >= studyPathData.questionsPerRound) {
        console.log(`Round ${studyPathData.currentRound} completed with ${questionsCompleted}/${studyPathData.questionsPerRound} questions`);
        markRoundCompleted(studyPathData.currentRound);
        return; // markRoundCompleted will call updateUI
    }
    
    updateUI();
    saveStudyPathData();
}

// Function to mark diagnostic as completed
function markDiagnosticCompleted(type) {
    if (type === 'initial' || type === 1) {
        studyPathData.diagnosticTaken = true;
        // Update diagnostic icon to check mark
        const diagnosticStep = document.querySelector('[data-round="diagnostic"]');
        if (diagnosticStep) {
            const stepIcon = diagnosticStep.querySelector('.step-icon');
            if (stepIcon) {
                stepIcon.textContent = 'check';
            }
        }
    } else if (type === 'mid' || type === 2) {
        studyPathData.diagnosticMidTaken = true;
        // Update diagnostic icon to check mark
        const diagnosticStep = document.querySelector('[data-round="diagnostic-mid"]');
        if (diagnosticStep) {
            const stepIcon = diagnosticStep.querySelector('.step-icon');
            if (stepIcon) {
                stepIcon.textContent = 'check';
            }
        }
    } else if (type === 'final' || type === 3) {
        studyPathData.diagnosticFinalTaken = true;
        // Update diagnostic icon to check mark
        const diagnosticStep = document.querySelector('[data-round="diagnostic-end"]');
        if (diagnosticStep) {
            const stepIcon = diagnosticStep.querySelector('.step-icon');
            if (stepIcon) {
                stepIcon.textContent = 'check';
            }
        }
    }
    
    updateUI();
    saveStudyPathData();
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

// Check for diagnostic completion and show confetti
function checkDiagnosticCompletion() {
    const urlParams = new URLSearchParams(window.location.search);
    const diagnostic = urlParams.get('diagnostic');
    const accuracy = urlParams.get('accuracy');
    
    if (diagnostic && accuracy) {
        // Show confetti animation
        showConfetti();
        
        // Update progress based on diagnostic results
        updateProgressFromDiagnostic(parseInt(diagnostic), parseInt(accuracy));
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Show confetti animation
function showConfetti() {
    // Create confetti burst
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
    
    // Create multiple bursts for more celebration
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
        });
    }, 250);
    
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
        });
    }, 400);
}

// Update progress based on diagnostic test results
function updateProgressFromDiagnostic(diagnosticNumber, accuracy) {
    console.log(`Processing diagnostic ${diagnosticNumber} completion with ${accuracy}% accuracy`);
    
    // Store current completion state before making changes
    const previousCompletedRounds = studyPathData.completedRounds;
    const previousCurrentRound = studyPathData.currentRound;
    
    // Calculate how many cards should be marked as learned based on accuracy
    let cardsToMark = 0;
    let cardRange = [];
    
    switch (diagnosticNumber) {
        case 1:
            cardsToMark = Math.round((accuracy / 100) * 21); // Cards 1-21
            cardRange = [1, 21];
            break;
        case 2:
            cardsToMark = Math.round((accuracy / 100) * 14); // Cards 22-35
            cardRange = [22, 35];
            break;
        case 3:
            cardsToMark = Math.round((accuracy / 100) * 15); // Cards 36-50
            cardRange = [36, 50];
            break;
    }
    
    // Update diagnostic test completion status and icon
    markDiagnosticCompleted(diagnosticNumber);
    
    // Update round progress based on specific cards learned
    updateRoundProgressFromDiagnostic(diagnosticNumber, cardsToMark, cardRange);
    
    // Calculate how many rounds should be completed based on diagnostic results
    const conceptRounds = studyPathData.concepts.length || 7;
    const totalRoundsCompleted = Math.floor(cardsToMark / studyPathData.questionsPerRound);
    
    console.log(`Diagnostic analysis: ${cardsToMark} cards learned = ${totalRoundsCompleted} rounds completed`);
    console.log(`Current state before diagnostic: completedRounds=${studyPathData.completedRounds}, currentRound=${studyPathData.currentRound}`);
    
    // Preserve existing completion states and only advance if diagnostic shows more progress
    if (totalRoundsCompleted > studyPathData.completedRounds) {
        const newCompletedRounds = Math.min(totalRoundsCompleted, conceptRounds);
        
        // Find the next available round after the diagnostic
        // Look for rounds that come after the diagnostic in the sequence
        let nextRoundAfterDiagnostic = newCompletedRounds + 1;
        
        // If we're at a diagnostic between rounds, ensure we advance to the next logical round
        if (diagnosticNumber === 1 && newCompletedRounds >= 2) {
            // After first diagnostic, should go to round 3 or the next incomplete round
            nextRoundAfterDiagnostic = Math.max(3, newCompletedRounds + 1);
        }
        
        const newCurrentRound = Math.min(nextRoundAfterDiagnostic, conceptRounds + 1);
        
        console.log(`Diagnostic advancing: ${studyPathData.completedRounds} → ${newCompletedRounds} completed rounds, current round ${studyPathData.currentRound} → ${newCurrentRound}`);
        
        studyPathData.completedRounds = newCompletedRounds;
        studyPathData.currentRound = newCurrentRound;
        studyPathData.currentRoundProgress = 0;
        
        // Update localStorage to persist the new state
        localStorage.setItem('currentRoundNumber', studyPathData.currentRound);
        localStorage.removeItem('currentRoundProgress');
    } else {
        console.log(`Diagnostic didn't advance completion: ${totalRoundsCompleted} rounds from diagnostic <= ${studyPathData.completedRounds} existing completed rounds`);
        
        // Even if we don't advance completion, we should still move to the next round after the diagnostic
        // Find the round that should be active after this diagnostic test
        const nextRound = Math.max(studyPathData.currentRound, studyPathData.completedRounds + 1);
        if (nextRound !== studyPathData.currentRound && nextRound <= conceptRounds) {
            console.log(`Moving to next round after diagnostic: ${studyPathData.currentRound} → ${nextRound}`);
            studyPathData.currentRound = nextRound;
            studyPathData.currentRoundProgress = 0;
            localStorage.setItem('currentRoundNumber', studyPathData.currentRound);
            localStorage.removeItem('currentRoundProgress');
        }
    }
    
    // Save the updated state
    saveStudyPathData();
    updateUI();
    
    // Show success message
    showToast(`Diagnostic Test ${diagnosticNumber} completed! Accuracy: ${accuracy}%`, 5000);
}

// Update round progress based on diagnostic test results
function updateRoundProgressFromDiagnostic(diagnosticNumber, cardsToMark, cardRange) {
    console.log('Updating round progress from diagnostic:', { diagnosticNumber, cardsToMark, cardRange });
    
    // Calculate which specific cards were learned based on accuracy
    const learnedCards = [];
    for (let i = 0; i < cardsToMark; i++) {
        learnedCards.push(cardRange[0] + i);
    }
    
    console.log('Learned cards:', learnedCards);
    
    // Map learned cards into rounds (dynamic based on concepts)
    const totalConcepts = studyPathData.concepts.length || 7;
    const roundProgress = {};
    
    // Initialize with existing round progress to preserve previous data
    if (studyPathData.roundProgress) {
        Object.assign(roundProgress, studyPathData.roundProgress);
    } else {
        // Initialize empty progress for all rounds
        for (let i = 1; i <= totalConcepts; i++) {
            roundProgress[i] = 0;
        }
    }
    
    learnedCards.forEach(cardNumber => {
        // Dynamic mapping based on questionsPerRound
        const roundNumber = Math.ceil(cardNumber / studyPathData.questionsPerRound);
        if (roundNumber >= 1 && roundNumber <= totalConcepts) {
            // Add to existing progress rather than overwriting
            roundProgress[roundNumber] = Math.max(roundProgress[roundNumber] || 0, 
                                                 (roundProgress[roundNumber] || 0) + 1);
            
            // Ensure we don't exceed questionsPerRound for any round
            roundProgress[roundNumber] = Math.min(roundProgress[roundNumber], studyPathData.questionsPerRound);
        }
    });
    
    // Update study path data with combined round progress
    studyPathData.roundProgress = roundProgress;
    
    console.log('Updated round progress:', roundProgress);
    
    // Don't save here - let the caller handle saving to avoid conflicts
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

// Export functions for external use
window.StudyPath = {
    markRoundCompleted,
    updateRoundProgress,
    markDiagnosticCompleted,
    getCurrentRound: () => studyPathData.currentRound,
    getCompletedRounds: () => studyPathData.completedRounds,
};
// Migrated: inline the logic from study-path.js so we can remove the legacy file
// Minimal bootstrap to ensure back button works even if DOMContentLoaded fired earlier
(function(){
  function ensureBack() {
    const backBtn = document.getElementById('backBtn');
    if (backBtn && !backBtn._handler) {
      backBtn.addEventListener('click', function(){ window.location.href = '../index.html'; });
      backBtn._handler = true;
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureBack);
  } else {
    ensureBack();
  }
})();

// NOTE: The full implementation remains in js/study-path.js. For a complete
// migration, move its contents here. For now, we preserve behavior by
// including it at build time (tooling) and keep this file as the canonical name.

