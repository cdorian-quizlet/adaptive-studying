// Study Plan screen logic (migrated from study-path.js)

// Header component instance
let appHeader = null;

let pathSteps = document.querySelectorAll('.path-step'); // Will be updated when we generate dynamic content

// Progress Elements - will be initialized after DOM loads
let progressSummary = null;
const progressRingFill = document.querySelector('.progress-ring-fill');

// Progress text fade timeout tracking
let progressTextFadeTimeout = null;

// Clear existing progress text fade animation
function clearProgressTextFade() {
    if (progressTextFadeTimeout) {
        clearTimeout(progressTextFadeTimeout);
        progressTextFadeTimeout = null;
    }
    
    // Reset any existing fade states
    const currentRoundText = document.querySelector('.path-step.current .step-progress-text');
    if (currentRoundText) {
        currentRoundText.classList.remove('fade-out');
        currentRoundText.style.opacity = '1';
    }
}

// Start progress text fade animation
function startProgressTextFade(textElement) {
    clearProgressTextFade(); // Clear any existing fade
    
    progressTextFadeTimeout = setTimeout(() => {
        if (textElement) {
            textElement.classList.add('fade-out');
        }
    }, 2000); // Show for 2 seconds then fade
}

// Show progress text and fade-out when coming from question screen
function showProgressTextWithFadeOut(textElement) {
    if (!textElement) {
        console.log('⚠️ No textElement provided to showProgressTextWithFadeOut');
        return;
    }
    
    console.log('🎬 Showing progress text immediately, will fade out after few seconds', textElement.textContent);
    
    clearProgressTextFade(); // Clear any existing fade
    
    // Remove any existing animation classes and show immediately
    textElement.classList.remove('fade-out', 'auto-fade', 'entering');
    textElement.style.opacity = '1';
    
    // After a few seconds, start the fade-out
    setTimeout(() => {
        console.log('🎬 Starting fade-out after delay');
        startProgressTextFade(textElement);
        
        // Clear the fromQuestionScreen flag after triggering animation
        sessionStorage.removeItem('fromQuestionScreen');
    }, 3000); // 3 seconds before fade-out starts
}

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
    currentRound: 1, // Ensure this is never NaN
    completedRounds: 0, // Ensure this is never NaN
    currentRoundProgress: 0, // Ensure this is never NaN
    totalQuestionsAnswered: 0,
    accuracy: 0,
    concepts: [], // Array of concept names that become rounds
    courseName: '', // Course name for header
    questionsPerRound: 7 // Default questions per round
};

    // Initialize the study plan
document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM elements
    progressSummary = document.getElementById('progressSummary');
    
    // Initialize progress ring first
    initializeProgressRing();
    
    // Initialize floating feedback input
    initFloatingFeedback();
    
    // Load onboarding data first so we have course and goal info
    loadOnboardingData();
    
    // Initialize header component with proper title
    initializeHeader();
    
    // Generate dynamic study plan and load path data
    generateDynamicStudyPlan();
    
    // Force aggressive loading of progress data from study session
    forceLoadProgressFromStudySession();
    loadStudyPathData();

    // Use simplified progress system (no adaptive learning dependency)
    setTimeout(() => {
        // Check if progress has been reset FIRST, before loading any data
        const hasProgressData = localStorage.getItem('studyPathData') || localStorage.getItem('dailyProgress');
        if (!hasProgressData) {
            console.log('No progress data found on page load, resetting overview card');
            // Reset overview card immediately for 0% state
            const overviewTitle = document.querySelector('.overview-title');
            
            if (progressSummary) {
                progressSummary.style.display = 'none'; // Hide progress summary for 0% state
            }
            if (overviewTitle) {
                const examDate = formatExamDate();
                if (examDate) {
                    overviewTitle.textContent = `Let's get ready for your test ${examDate}`;
                } else {
                    overviewTitle.textContent = "let's get ready for Exam 1. You got this!";
                }
            }
            
            // Initialize circular progress properly to start from 0% (with visible pill)
            initializeProgressRing();
            
            // Reset circular progress and ensure circular view is shown
            updateCircularProgress(0, false); // Don't animate the initial 0% reset
            
            // Make sure circular view is visible and add zero-state class
            const circularView = document.getElementById('circularProgressView');
            const trendView = document.getElementById('trendGraphView');
            if (circularView) {
                circularView.style.display = 'flex';
                circularView.classList.add('zero-state');
            }
            if (trendView) trendView.style.display = 'none';
        } else {
            // Use simplified sync with traditional calculation
            syncDailyProgressWithHome();
        }
    }, 200); // Small delay to ensure DOM is ready

    updateUI();
    setupEventListeners();
    animateCompletedSteps();
    
    // Clear any existing progress text fade animations
    clearProgressTextFade();
    

    // Show onboarding bottom sheet if coming from plan flow
    maybeShowOnboardingSheet();

    // Initialize material icons
    initMaterialIcons();
});

// Initialize header component
function initializeHeader() {
    // Generate header title from onboarding data
    let headerTitle = 'Study Plan'; // Default fallback
    
    console.log('Header initialization - onboarding data:', {
        courseName: studyPathData.courseName,
        goals: onboardingData.goals,
        courseIncludesDash: studyPathData.courseName?.includes(' - '),
        extractedCourseCode: studyPathData.courseName?.includes(' - ') ? 
            studyPathData.courseName.split(' - ')[0] : studyPathData.courseName
    });
    
    if (studyPathData.courseName) {
        // Extract course code (everything before " - " if it exists)
        const courseCode = studyPathData.courseName.includes(' - ') ? 
            studyPathData.courseName.split(' - ')[0].trim() : studyPathData.courseName.trim();
        
        // Get first goal from onboarding data (exam name)
        const examName = Array.isArray(onboardingData.goals) && onboardingData.goals.length > 0 ? 
            onboardingData.goals[0].trim() : '';
        
        // Format as "BIOL 210, Exam 1" - just course code and exam name
        if (examName) {
            headerTitle = `${courseCode}, ${examName}`;
        } else {
            headerTitle = courseCode;
        }
        
        console.log('🎯 Generated header title:', headerTitle, {
            courseCode,
            examName,
            originalCourseName: studyPathData.courseName
        });
    } else {
        console.log('⚠️ No course name found in studyPathData');
    }
    
    appHeader = new AppHeader({
        title: headerTitle,
        backUrl: '../index.html',
        backButtonIcon: 'close',
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

// Calculate overall study plan progress using same logic as individual steps
function calculateOverallPlanProgress() {
    try {
        // First try to load fresh studyPathData from localStorage
        const studyPathDataString = localStorage.getItem('studyPathData');
        let currentStudyPathData = studyPathData; // Use global if available
        
        if (studyPathDataString) {
            try {
                currentStudyPathData = JSON.parse(studyPathDataString);
                console.log('🔍 DEBUG: [STUDY PLAN] Loaded fresh studyPathData from localStorage');
            } catch (e) {
                console.warn('Failed to parse studyPathData from localStorage, using global');
            }
        }
        
        // Use the loaded studyPathData
        if (!currentStudyPathData || !currentStudyPathData.concepts) {
            console.log('🔍 DEBUG: [STUDY PLAN] No study path data found, progress is 0%');
            return 0;
        }
        
        const completedRounds = currentStudyPathData.completedRounds || 0;
        const currentRoundNumber = currentStudyPathData.currentRound || 1;
        const currentRoundProgress = currentStudyPathData.currentRoundProgress || 0;
        const totalRounds = currentStudyPathData.concepts.length || 4;
        
        // Load roundProgressData to get actual total formats per round
        const roundProgressDataString = localStorage.getItem('roundProgressData');
        let roundProgressData = {};
        if (roundProgressDataString) {
            try {
                roundProgressData = JSON.parse(roundProgressDataString);
            } catch (e) {
                console.warn('Could not parse roundProgressData for overall calculation');
            }
        }
        
        // CORRECTED APPROACH: Calculate progress based ONLY on actual study data in roundProgressData
        // Ignore completedRounds/currentRoundProgress which may be inaccurate from navigation
        let totalFormatsInPlan = 0;
        let totalCompletedFormats = 0;
        
        console.log(`🎯 CORRECTED PROGRESS CALCULATION METHOD:`);
        console.log(`   ✅ Using ONLY actual study data from roundProgressData`);
        console.log(`   ❌ IGNORING completedRounds (${completedRounds}) and currentRoundProgress (${currentRoundProgress})`);
        console.log(`   📊 This should show accurate progress across ALL steps based on real studying`);
        
        for (let roundNum = 1; roundNum <= totalRounds; roundNum++) {
            const roundData = roundProgressData[roundNum];
            let roundTotalFormats = 28; // Default fallback (7 questions × 4 formats)
            let roundActualProgress = 0;
            
            if (roundData && roundData.totalFormats) {
                roundTotalFormats = roundData.totalFormats;
            }
            
            // Use ONLY actual study progress from roundProgressData, not navigation-based values
            if (roundData && roundData.progress) {
                roundActualProgress = roundData.progress;
                console.log(`📊 Round ${roundNum}: Found ACTUAL study progress = ${roundActualProgress} formats`);
            } else {
                console.log(`📊 Round ${roundNum}: No actual study progress found = 0 formats`);
            }
            
            totalFormatsInPlan += roundTotalFormats;
            totalCompletedFormats += roundActualProgress;
            
            console.log(`📊 Round ${roundNum}: ${roundActualProgress}/${roundTotalFormats} formats (${roundTotalFormats > 0 ? Math.round((roundActualProgress/roundTotalFormats)*100) : 0}% complete)`);
        }
        
        // Calculate percentage using same logic as individual steps
        const progressPercentage = totalFormatsInPlan > 0 ? Math.round((totalCompletedFormats / totalFormatsInPlan) * 100) : 0;
        
        console.log(`🎯 FINAL RESULT: ${totalCompletedFormats} completed formats out of ${totalFormatsInPlan} total formats = ${progressPercentage}%`);
        
        console.log('🎯 OVERVIEW PROGRESS FINAL CALCULATION (CORRECTED):', {
            description: 'Now using ONLY actual study data from roundProgressData',
            calculationMethod: 'ACTUAL STUDY DATA ONLY (not navigation-based values)',
            totalRounds,
            totalFormatsInPlan,
            totalCompletedFormats,
            progressPercentage,
            rawRoundProgressData: roundProgressData,
            actualStudyBreakdown: (() => {
                const breakdown = {};
                for (let roundNum = 1; roundNum <= totalRounds; roundNum++) {
                    const roundData = roundProgressData[roundNum];
                    const roundTotalFormats = roundData?.totalFormats || 28;
                    const roundActualProgress = roundData?.progress || 0;
                    
                    breakdown[`round_${roundNum}`] = {
                        actualProgress: roundActualProgress,
                        totalFormats: roundTotalFormats,
                        percentage: roundTotalFormats > 0 ? Math.round((roundActualProgress / roundTotalFormats) * 100) : 0,
                        hasActualStudyData: !!(roundData && roundData.progress)
                    };
                }
                return breakdown;
            })()
        });
        
        return Math.min(progressPercentage, 100); // Cap at 100%
        
    } catch (error) {
        console.error('Error calculating overall plan progress in study plan:', error);
        return 0;
    }
}

// Get progress from adaptive learning system
function getAdaptiveLearningProgress() {
    try {
        // Check if adaptive learning system is available
        if (typeof window === 'undefined' || !window.AdaptiveLearning) {
            console.log('🔍 DEBUG: [STUDY PLAN] Adaptive learning system not available');
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
        
        console.log('🔍 DEBUG: [STUDY PLAN] Adaptive learning progress calculation:', {
            totalQuestions,
            completedQuestions,
            progressPercentage,
            adaptiveLearningAvailable: !!window.AdaptiveLearning,
            hasState: !!window.AdaptiveLearning?.state
        });
        
        return Math.min(progressPercentage, 100); // Cap at 100%
        
    } catch (error) {
        console.error('Error getting adaptive learning progress:', error);
        return null;
    }
}

// Get detailed adaptive learning statistics for progress insights
function getAdaptiveLearningStats() {
    try {
        if (typeof window === 'undefined' || !window.AdaptiveLearning) {
            return null;
        }
        
        // Load adaptive learning state
        window.AdaptiveLearning.loadState();
        
        const stats = {
            totalQuestions: 50,
            completedQuestions: 0,
            questionsByType: {
                'multiple_choice': 0,
                'written': 0,
                'flashcard': 0,
                'matching': 0,
                'completed': 0
            },
            questionsByDifficulty: {
                'easy': 0,
                'medium': 0,
                'hard': 0
            },
            questionsByDepth: {
                'Recall': 0,
                'Understanding': 0,
                'Application': 0
            }
        };
        
        // Analyze all questions
        for (let questionId = 1; questionId <= stats.totalQuestions; questionId++) {
            if (window.AdaptiveLearning.isQuestionCompleted(questionId)) {
                stats.completedQuestions++;
                stats.questionsByType.completed++;
            } else {
                // Get current question format and details
                try {
                    const debugInfo = window.AdaptiveLearning.getDebugInfo(questionId);
                    if (debugInfo && debugInfo.mode) {
                        const questionType = debugInfo.mode.toLowerCase();
                        if (stats.questionsByType[questionType] !== undefined) {
                            stats.questionsByType[questionType]++;
                        }
                        
                        if (debugInfo.difficulty && stats.questionsByDifficulty[debugInfo.difficulty]) {
                            stats.questionsByDifficulty[debugInfo.difficulty]++;
                        }
                        
                        if (debugInfo.depth && stats.questionsByDepth[debugInfo.depth]) {
                            stats.questionsByDepth[debugInfo.depth]++;
                        }
                    }
                } catch (debugError) {
                    // Question might not be tracked yet, that's ok
                }
            }
        }
        
        return stats;
        
    } catch (error) {
        console.error('Error getting adaptive learning stats:', error);
        return null;
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
            const circularView = document.getElementById('circularProgressView');
            const overviewTitle = document.querySelector('.overview-title');
            
            // Handle 0% state vs. progress state
            if (overallProgressPercentage === 0) {
                // 0% state - special styling and content
                if (circularView) {
                    circularView.classList.add('zero-state');
                }
                if (progressSummary) {
                    progressSummary.style.display = 'none';
                }
                if (overviewTitle) {
                    overviewTitle.textContent = "let's get ready for Exam 1. You got this!";
                }
            } else {
                // Progress state - normal display
                if (circularView) {
                    circularView.classList.remove('zero-state');
                }
                if (progressSummary) {
                    progressSummary.style.display = 'block';
                    progressSummary.textContent = `Study plan ${overallProgressPercentage}% complete`;
                }
                if (overviewTitle) {
                    overviewTitle.textContent = 'Keep up the momentum';
                }
            }

            // Update circular progress to match overall plan progress (no animation for data sync)
            updateCircularProgress(overallProgressPercentage, false);
                
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
    
    // Ensure progressSummary is available
    if (!progressSummary) {
        progressSummary = document.getElementById('progressSummary');
        console.log('🔍 DEBUG: [STUDY PLAN] Re-initializing progressSummary element:', !!progressSummary);
    }
    
    // Use simplified progress calculation
    const dailyData = getDailyProgress();
    const today = getTodayDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    const todayQuestions = dailyData[today]?.questions || 0;
    const yesterdayQuestions = dailyData[yesterdayString]?.questions || 0;
    
    console.log('🔍 DEBUG: [STUDY PLAN] Progress data state (traditional):', {
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
        showCircularProgress();
        return;
    }
    
    // Always show overall plan progress (traditional calculation)
    const overallProgressPercentage = calculateOverallPlanProgress();
    if (progressSummary) {
        if (overallProgressPercentage === 0) {
            progressSummary.style.display = 'none'; // Hide for 0% state
        } else {
            progressSummary.style.display = 'block';
            progressSummary.textContent = `Study plan ${overallProgressPercentage}% complete`;
        }
    }
    
    // Always show circular progress with overall plan progress
    showCircularProgress();
}

// Consolidated function to update overview card progress (replaces conflicting logic)
function updateOverviewCardProgress() {
    console.log('🔍 DEBUG: [STUDY PLAN] updateOverviewCardProgress() called');
    
    // Ensure progressSummary is available
    if (!progressSummary) {
        progressSummary = document.getElementById('progressSummary');
        console.log('🔍 DEBUG: [STUDY PLAN] Re-initializing progressSummary element:', !!progressSummary);
    }
    
    // Get DOM elements
    const circularView = document.getElementById('circularProgressView');
    const overviewTitle = document.querySelector('.overview-title');
    
    // Validate critical DOM elements
    if (!progressSummary) {
        console.error('❌ [STUDY PLAN] progressSummary element not found');
    }
    if (!circularView) {
        console.error('❌ [STUDY PLAN] circularProgressView element not found');
    }
    
    // Use simplified progress calculation directly
    let overallProgressPercentage = calculateOverallPlanProgress();
    console.log('🔍 DEBUG: [STUDY PLAN] Using simplified progress calculation:', overallProgressPercentage);
    
    // Validate and sanitize progress value
    if (isNaN(overallProgressPercentage) || overallProgressPercentage < 0) {
        console.warn('⚠️ [STUDY PLAN] Invalid progress percentage, defaulting to 0:', overallProgressPercentage);
        overallProgressPercentage = 0;
    }
    
    // Cap at 100%
    overallProgressPercentage = Math.min(overallProgressPercentage, 100);
    
    // Update overview card based on progress
    if (overallProgressPercentage === 0) {
        // 0% state - special styling and content
        if (circularView) {
            circularView.classList.add('zero-state');
        }
        if (progressSummary) {
            progressSummary.style.display = 'none';
        }
        if (overviewTitle) {
            const examDate = formatExamDate();
            overviewTitle.textContent = examDate ? `Let's get ready for your test ${examDate}` : "let's get ready for Exam 1. You got this!";
        }
    } else {
        // Progress state - normal display
        if (circularView) {
            circularView.classList.remove('zero-state');
        }
        if (progressSummary) {
            progressSummary.style.display = 'block';
            progressSummary.textContent = `Study plan ${overallProgressPercentage}% complete`;
        }
        if (overviewTitle) {
            const examDate = formatExamDate();
            overviewTitle.textContent = examDate ? `Keep up the momentum for your test ${examDate}` : 'Keep up the momentum';
        }
    }
    
    // Update circular progress (no animation on page load)
    updateCircularProgress(overallProgressPercentage, false);
    
    console.log('🔍 DEBUG: [STUDY PLAN] Overview card updated:', {
        progress: overallProgressPercentage,
        progressSummaryText: progressSummary?.textContent,
        progressSummaryVisible: progressSummary?.style.display !== 'none',
        overviewTitleText: overviewTitle?.textContent
    });
}

// Debug function to test progress tracking
window.debugProgressTracking = function() {
    console.log('🐛 DEBUG: Progress tracking debug info:');
    
    // Check localStorage data
    const studyPathDataStr = localStorage.getItem('studyPathData');
    const currentRoundProgress = localStorage.getItem('currentRoundProgress');
    const currentRoundNumber = localStorage.getItem('currentRoundNumber');
    const studyProgress = localStorage.getItem('studyProgress');
    const roundProgressData = localStorage.getItem('roundProgressData');
    
    console.log('📁 localStorage data:', {
        studyPathData: studyPathDataStr ? JSON.parse(studyPathDataStr) : null,
        currentRoundProgress: currentRoundProgress,
        currentRoundNumber: currentRoundNumber,
        studyProgress: studyProgress,
        roundProgressData: roundProgressData ? JSON.parse(roundProgressData) : null
    });
    
    // Test progress calculation
    const calculatedProgress = calculateOverallPlanProgress();
    console.log('🧮 Calculated progress:', calculatedProgress);
    
    // Check DOM elements
    const progressSummary = document.getElementById('progressSummary');
    const progressPercentageText = document.getElementById('progressPercentageText');
    const circularView = document.getElementById('circularProgressView');
    
    console.log('🎯 DOM elements:', {
        progressSummary: {
            exists: !!progressSummary,
            text: progressSummary?.textContent,
            display: progressSummary?.style.display
        },
        progressPercentageText: {
            exists: !!progressPercentageText,
            text: progressPercentageText?.textContent
        },
        circularView: {
            exists: !!circularView,
            classes: circularView?.className
        }
    });
    
    // Force update
    console.log('🔄 Force updating overview card...');
    updateOverviewCardProgress();
};

// Helper function to format exam date for headlines
function formatExamDate() {
    try {
        const dueDateString = localStorage.getItem('plan_due_date');
        if (!dueDateString) return null;
        
        const dueDate = new Date(dueDateString + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[dueDate.getDay()];
        
        // Get current week bounds
        const currentWeekStart = new Date(today);
        currentWeekStart.setDate(today.getDate() - today.getDay()); // Start of this week (Sunday)
        const currentWeekEnd = new Date(currentWeekStart);
        currentWeekEnd.setDate(currentWeekStart.getDate() + 6); // End of this week (Saturday)
        
        if (diffDays === 0) {
            return 'today';
        } else if (diffDays === 1) {
            return 'tomorrow';
        } else if (diffDays === -1) {
            return 'yesterday';
        } else if (dueDate >= currentWeekStart && dueDate <= currentWeekEnd) {
            // This week
            return `this ${dayName}`;
        } else if (diffDays > 0 && diffDays <= 13) {
            // Next week or the week after
            if (diffDays <= 7) {
                return `${dayName} next week`;
            } else {
                return `on ${dayName}`;
            }
        } else if (diffDays > 13) {
            // Further away - just show the day
            return `on ${dayName}`;
        } else {
            // Past dates
            return `on ${dayName}`;
        }
    } catch (error) {
        console.error('Error formatting exam date:', error);
        return null;
    }
}

// Show circular progress view with overall plan progress
function showCircularProgress() {
    // Ensure progressSummary is available
    if (!progressSummary) {
        progressSummary = document.getElementById('progressSummary');
    }
    
    const circularView = document.getElementById('circularProgressView');
    const trendView = document.getElementById('trendGraphView');
    const overviewTitle = document.querySelector('.overview-title');
    
    if (circularView) circularView.style.display = 'flex';
    if (trendView) trendView.style.display = 'none';
    
    // Calculate and update circular progress based on overall plan progress
    const overallProgressPercentage = calculateOverallPlanProgress();
    
    // Get formatted exam date
    const examDate = formatExamDate();
    
    // Add/remove zero-state class for styling and update content for 0% state
    if (circularView) {
        if (overallProgressPercentage === 0) {
            circularView.classList.add('zero-state');
            
            // Update overview card content for 0% state
            if (overviewTitle) {
                if (examDate) {
                    overviewTitle.textContent = `Let's get ready for your test ${examDate}`;
                } else {
                    overviewTitle.textContent = "let's get ready for Exam 1. You got this!";
                }
            }
            if (progressSummary) {
                progressSummary.style.display = 'none'; // Hide progress summary for 0% state
            }
        } else {
            circularView.classList.remove('zero-state');
            
            // Restore normal overview card content
            if (overviewTitle) {
                if (examDate) {
                    overviewTitle.textContent = `Keep up the momentum for your test ${examDate}`;
                } else {
                    overviewTitle.textContent = 'Keep up the momentum';
                }
            }
            if (progressSummary) {
                progressSummary.style.display = 'block'; // Show progress summary for non-0% state
                progressSummary.textContent = `Study plan ${overallProgressPercentage}% complete`;
            }
        }
    }
    
    // Check if user came from question screen for special animation
    const fromQuestionScreen = sessionStorage.getItem('fromQuestionScreen') === 'true';
    
    // Don't animate on initial page load - only animate for user interactions
    const shouldAnimate = false;
    
    // Don't clear the flag here - let individual progress text animations handle it
    
    // Update the progress after a small delay for page load (no animation)
    setTimeout(() => {
        updateCircularProgress(overallProgressPercentage, shouldAnimate);
    }, 200);
}



// Refresh adaptive learning progress specifically
function refreshAdaptiveLearningProgress() {
    console.log('🔄 Refreshing adaptive learning progress...');
    
    if (window.AdaptiveLearning) {
        // Force reload the adaptive learning state
        window.AdaptiveLearning.loadState();
        
        // Get fresh progress calculation
        const adaptiveProgress = getAdaptiveLearningProgress();
        
        if (adaptiveProgress !== null) {
            console.log('🔄 Updated adaptive learning progress:', adaptiveProgress);
            
            // Update circular progress display (no animation on refresh)
            updateCircularProgress(adaptiveProgress, false);
            
            // Update progress summary
            const overviewTitle = document.querySelector('.overview-title');
            const circularView = document.getElementById('circularProgressView');
            
            if (adaptiveProgress === 0) {
                // 0% state
                if (circularView) circularView.classList.add('zero-state');
                if (progressSummary) progressSummary.style.display = 'none';
                if (overviewTitle) {
                    const examDate = formatExamDate();
                    overviewTitle.textContent = examDate ? `Let's get ready for your test ${examDate}` : "let's get ready for Exam 1. You got this!";
                }
            } else {
                // Progress state
                if (circularView) circularView.classList.remove('zero-state');
                if (progressSummary) {
                    progressSummary.style.display = 'block';
                    progressSummary.textContent = `Study plan ${adaptiveProgress}% complete`;
                }
                if (overviewTitle) {
                    const examDate = formatExamDate();
                    overviewTitle.textContent = examDate ? `Keep up the momentum for your test ${examDate}` : 'Keep up the momentum';
                }
            }
            
            return true; // Progress was updated
        }
    }
    
    return false; // No adaptive learning progress available
}

// Refresh progress when returning from study screen
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log('🔄 STUDY PLAN BECAME VISIBLE - Refreshing progress data');
        
        // Debug current localStorage state
        const currentRoundProgressLS = localStorage.getItem('currentRoundProgress');
        const currentRoundNumberLS = localStorage.getItem('currentRoundNumber');
        const studyPathDataLS = localStorage.getItem('studyPathData');
        const roundProgressDataLS = localStorage.getItem('roundProgressData');
        
        console.log('📱 VISIBILITY CHANGE - Current localStorage:', {
            currentRoundProgress: currentRoundProgressLS,
            currentRoundNumber: currentRoundNumberLS,
            studyPathData: studyPathDataLS ? JSON.parse(studyPathDataLS) : null,
            roundProgressData: roundProgressDataLS ? JSON.parse(roundProgressDataLS) : null,
            fromQuestionScreen: sessionStorage.getItem('fromQuestionScreen')
        });

        // Store current progress before updating
        const currentRound = studyPathData.currentRound;
        const currentProgress = studyPathData.currentRoundProgress;
        
        console.log('📊 BEFORE REFRESH - studyPathData:', {
            currentRound,
            currentProgress,
            completedRounds: studyPathData.completedRounds
        });

        // Force load fresh data from localStorage - be more aggressive about syncing
        if (currentRoundProgressLS && currentRoundNumberLS) {
            const lsRound = parseInt(currentRoundNumberLS) || 1;
            const lsProgress = parseInt(currentRoundProgressLS) || 0;
            
            console.log('🔄 FORCE SYNCING from localStorage:', { lsRound, lsProgress });
            
            // Directly update our studyPathData with the latest from localStorage
            studyPathData.currentRound = lsRound;
            studyPathData.currentRoundProgress = lsProgress;
            
            // Load any additional study path data
            if (studyPathDataLS) {
                try {
                    const lsStudyPath = JSON.parse(studyPathDataLS);
                    // Merge localStorage data, giving priority to direct localStorage values
                    Object.assign(studyPathData, lsStudyPath, {
                        currentRound: lsRound,
                        currentRoundProgress: lsProgress
                    });
                } catch (e) {
                    console.warn('Error parsing studyPathData from localStorage:', e);
                }
            }
        } else {
            // No localStorage data found - use defaults for fresh start
            console.log('🔄 No localStorage data found, using defaults');
            studyPathData.currentRound = 1;
            studyPathData.completedRounds = 0;
            studyPathData.currentRoundProgress = 0;
        }

        // Load new data from localStorage (no adaptive learning dependency)
        console.log('📥 Loading studyPathData from localStorage...');
        loadStudyPathData();
        
        // Force sync round progress data
        updateRoundProgressFromStudyData();
        syncCurrentRoundProgressFromRoundData();
        
        console.log('📊 AFTER REFRESH - studyPathData:', {
            currentRound: studyPathData.currentRound,
            currentProgress: studyPathData.currentRoundProgress,
            completedRounds: studyPathData.completedRounds
        });
        
        // Sync with home page using traditional calculation
        syncDailyProgressWithHome();

        // Check if progress has been reset (no data in localStorage)
        const hasProgressData = localStorage.getItem('studyPathData') || localStorage.getItem('dailyProgress');
        if (!hasProgressData) {
            console.log('❌ Progress data has been reset, updating overview card');
            // Reset overview card display for 0% state
            const overviewTitle = document.querySelector('.overview-title');
            
            if (progressSummary) {
                progressSummary.style.display = 'none'; // Hide progress summary for 0% state
            }
            if (overviewTitle) {
                overviewTitle.textContent = "let's get ready for Exam 1. You got this!";
            }
            
            // Reset circular progress (no animation for reset)
            updateCircularProgress(0, false);
            
            // Ensure circular view is shown
            showCircularProgress();
            
            return;
        }

        // Check if current round progress increased and trigger animation
        const newProgress = studyPathData.currentRoundProgress;
        console.log('🎯 PROGRESS COMPARISON:', {
            oldRound: currentRound,
            newRound: studyPathData.currentRound,
            oldProgress: currentProgress,
            newProgress: newProgress,
            progressIncreased: studyPathData.currentRound === currentRound && newProgress > currentProgress
        });
        
        if (studyPathData.currentRound === currentRound && newProgress > currentProgress) {
            console.log(`📈 Progress increased from ${currentProgress} to ${newProgress} for round ${currentRound}`);
            previousProgress.set(currentRound, currentProgress);
            setTimeout(() => {
                animateProgressUpdate(currentRound, currentProgress, newProgress);
            }, 100); // Small delay to ensure DOM is ready
        } else {
            console.log('🔄 No progress increase detected, calling updateUI');
            updateUI();
        }
        
        // Force complete UI refresh after everything
        setTimeout(() => {
            console.log('🔄 Force complete UI refresh after visibility change...');
            updateOverviewCardProgress();
            updateUI();
        }, 500);
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
        // Header title is now handled in initializeHeader() function
        
        // Calculate total rounds based on concepts
        const conceptCount = studyPathData.concepts.length;
        studyPathData.totalRounds = conceptCount;
        
        // Generate dynamic HTML for path steps
        const pathContainer = document.querySelector('.path-container');
        if (pathContainer) {
            pathContainer.innerHTML = generatePathStepsHTML();
            
            // Update pathSteps reference after generating new content
            pathSteps = document.querySelectorAll('.path-step');
            
            // Initialize material icons for newly generated content
            initMaterialIcons();
        }
        
        console.log(`Generated study plan with ${conceptCount} concept rounds`);
    } catch (error) {
        console.error('Error generating dynamic study plan:', error);
    }
}





// Generate HTML for path steps based on concepts
function generatePathStepsHTML() {
    let html = '';
    let stepCount = 0;
    
    
    // Helper function to generate round HTML
    function generateRoundHTML(concept, roundNumber, hasNextStep) {
        return `
            <div class="path-step" data-round="${roundNumber}">
                <div class="path-step-main">
                    <div class="step-indicator">
                        <div class="step-circle">
                            <span class="material-icons-round step-icon loaded">star_outline</span>
                        </div>
                        ${hasNextStep ? '<div class="step-line"></div>' : ''}
                    </div>
                    <div class="step-content">
                        <div class="step-text-group">
                            <h3 class="step-title">${concept}</h3>
                            ${roundNumber === 2 || roundNumber === 4 ? '<div class="top-focus-pill"><span class="top-focus-pill-icon"></span>Top focus area</div>' : ''}
                            <div class="step-progress">
                                <div class="step-progress-bar">
                                    <div class="step-progress-fill"></div>
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
                <div class="step-accordion-content">
                    ${getAccordionContent(roundNumber)}
                </div>
            </div>
            <div class="step-vertical-spacer"></div>
        `;
    }
    
    // Generate rounds
    studyPathData.concepts.forEach((concept, index) => {
        const roundNumber = index + 1;
        const isLastConcept = index === studyPathData.concepts.length - 1;
        
        // Add the round
        const hasNextStep = !isLastConcept;
        html += generateRoundHTML(concept, roundNumber, hasNextStep);
        stepCount++;
    });
    
    return html;
}

// Load study plan data from localStorage
function loadStudyPathData() {
    const savedData = localStorage.getItem('studyPathData');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            // Safely assign parsed data, ensuring no NaN values are introduced
            Object.assign(studyPathData, parsed);
            
            // Fix any NaN values that might have been loaded from corrupted localStorage
            if (isNaN(studyPathData.currentRound)) {
                console.log('🔧 FIXING: Loaded currentRound was NaN, setting to 1');
                studyPathData.currentRound = 1;
            }
            if (isNaN(studyPathData.completedRounds)) {
                console.log('🔧 FIXING: Loaded completedRounds was NaN, setting to 0');
                studyPathData.completedRounds = 0;
            }
            if (isNaN(studyPathData.currentRoundProgress)) {
                console.log('🔧 FIXING: Loaded currentRoundProgress was NaN, setting to 0');
                studyPathData.currentRoundProgress = 0;
            }
            
            console.log('Loaded studyPathData from localStorage:', {
                currentRound: studyPathData.currentRound,
                completedRounds: studyPathData.completedRounds,
                currentRoundProgress: studyPathData.currentRoundProgress
            });
        } catch (error) {
            console.error('Error parsing saved study path data:', error);
        }
    }
    
    
    // Try to get FSRS progress first
    const fsrsStats = localStorage.getItem('fsrs_stats');
    let totalProgress = 0;
    
    // Check for regular study progress and update roundProgress
    updateRoundProgressFromStudyData();
    
    // Sync current round progress from roundProgressData after loading
    syncCurrentRoundProgressFromRoundData();
    
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
        const loadedCurrentRound = parseInt(currentRoundNumber) || 1;
        const loadedCurrentProgress = parseInt(currentRoundProgress) || 0;
        
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
            // Don't reset progress to 0 - we'll sync it properly after loading roundProgressData
            studyPathData.currentRoundProgress = Math.max(studyPathData.currentRoundProgress || 0, loadedCurrentProgress);
        }
        
        // Check if this round should be completed based on loaded progress
        if (isRoundComplete()) {
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
    
    // Fix any NaN values that might have been introduced and ensure current round is at least 1
    if (isNaN(studyPathData.currentRound) || studyPathData.currentRound < 1) {
        console.log('🔧 FIXING: studyPathData.currentRound was NaN or < 1, setting to 1');
        studyPathData.currentRound = 1;
    }
    if (isNaN(studyPathData.completedRounds) || studyPathData.completedRounds < 0) {
        console.log('🔧 FIXING: studyPathData.completedRounds was NaN or < 0, setting to 0');
        studyPathData.completedRounds = 0;
    }
    if (isNaN(studyPathData.currentRoundProgress)) {
        console.log('🔧 FIXING: studyPathData.currentRoundProgress was NaN, setting to 0');
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
    
    // Update daily progress tracking
    updateTodaysProgress();
    
    // Update overview card progress (consolidated logic)
    updateOverviewCardProgress();
    
    // Update path steps
    updatePathSteps();
    
    // Note: Removed forceCurrentStepProgressDisplay() as it was interfering with proper hide/show logic
    
    // Check if we need to trigger progress text animation for current round when coming from question screen
    const fromQuestionScreen = sessionStorage.getItem('fromQuestionScreen') === 'true';
    if (fromQuestionScreen) {
        console.log('🎬 User came from question screen, checking for current round progress text');
        const currentRoundStep = document.querySelector('.path-step.current');
        if (currentRoundStep) {
            const stepProgressText = currentRoundStep.querySelector('.step-progress-text');
            if (stepProgressText && stepProgressText.textContent.trim() !== '') {
                console.log('🎬 Triggering progress text animation from updateUI');
                showProgressTextWithFadeOut(stepProgressText);
            }
        }
    }
    
    // Ensure new icons are loaded
    initMaterialIcons();
}

// DISABLED: This function was interfering with proper progress bar hide/show logic
// by applying !important styles that couldn't be overridden by CSS rules
/*
function forceCurrentStepProgressDisplay() {
    // This function has been disabled because the !important styles it applied
    // were preventing the proper hiding of progress bars on non-current steps
    console.log('🚫 forceCurrentStepProgressDisplay() disabled - was causing !important style conflicts');
}
*/

// Immediately clean up ONLY the 0% state from steps that are no longer current
function cleanupPreviousCurrentStepProgress() {
    console.log('🧹 Cleaning up 0% state from non-current steps...');
    
    const allSteps = document.querySelectorAll('.path-step');
    
    allSteps.forEach((step) => {
        const roundNumber = parseInt(step.dataset.round);
        const isCurrent = roundNumber === studyPathData.currentRound;
        
        // Only clean up steps that are no longer current
        if (!isCurrent) {
            const stepProgress = step.querySelector('.step-progress');
            const stepProgressFill = step.querySelector('.step-progress-fill');
            const stepProgressText = step.querySelector('.step-progress-text');
            
            if (stepProgress && stepProgressFill && stepProgressText) {
                // Check if this step is currently showing the 0% state (which should only be on current steps)
                const isShowing0State = stepProgress.classList.contains('has-progress') && 
                                       stepProgressText.textContent.includes('0%');
                
                if (isShowing0State) {
                    // This non-current step is incorrectly showing the 0% state - remove it completely
                    stepProgress.classList.remove('has-progress');
                    
                    // Override any !important styles that might be keeping progress bar visible
                    stepProgress.style.cssText = 'display: none !important;';
                    
                    const stepProgressBar = step.querySelector('.step-progress-bar');
                    if (stepProgressBar) {
                        stepProgressBar.style.cssText = 'display: none !important;';
                    }
                    
                    stepProgressFill.style.cssText = 'display: none !important; width: 0% !important;';
                    stepProgressText.style.cssText = 'display: none !important; opacity: 0 !important;';
                    
                    console.log(`🧹 Completely removed 0% state and all progress elements from non-current step ${roundNumber}`);
                } else {
                    console.log(`✅ Step ${roundNumber} is not showing 0% state - leaving it alone`);
                }
            }
        }
    });
}

// Update progress text without CSS transition flicker
function updateProgressTextWithoutFlicker(stepProgressText, progressPercentage, debugLabel = '') {
    if (!stepProgressText) return;
    
    // Temporarily disable all transitions to prevent flickering
    const originalTransition = stepProgressText.style.transition;
    stepProgressText.style.transition = 'none';
    
    // Update the text content
    stepProgressText.textContent = `${Math.round(progressPercentage)}% complete`;
    stepProgressText.style.color = progressPercentage === 0 ? 'var(--color-gray-500)' : 'var(--sys-text-highlight)';
    stepProgressText.style.opacity = '1';
    
    // Force a reflow to ensure the changes take effect before re-enabling transitions
    stepProgressText.offsetHeight;
    
    // Re-enable transitions after a brief delay to allow for smooth future animations
    setTimeout(() => {
        if (stepProgressText && stepProgressText.parentNode) {
            stepProgressText.style.transition = originalTransition;
        }
    }, 50);
    
    console.log(`✅ Set progress text for ${debugLabel}: "${stepProgressText.textContent}" (flicker-free)`);
}

// Calculate progress percentage using correct total available formats
function calculateProgressPercentage(currentRoundNumber = null, currentRoundProgress = null) {
    const roundNum = currentRoundNumber || studyPathData.currentRound;
    const progress = currentRoundProgress !== null ? currentRoundProgress : studyPathData.currentRoundProgress;
    
    // Calculate total available formats for the round
    let totalAvailableFormats = 28; // Default fallback (7 questions × 4 formats each)
    
    // Try to get the actual total formats from roundProgressData
    const roundProgressDataString = localStorage.getItem('roundProgressData');
    if (roundProgressDataString) {
        try {
            const roundProgressData = JSON.parse(roundProgressDataString);
            const roundData = roundProgressData[roundNum];
            if (roundData && roundData.totalFormats) {
                totalAvailableFormats = roundData.totalFormats;
            }
        } catch (e) {
            console.warn('Could not parse roundProgressData, using questionsPerRound as fallback');
        }
    }
    
    const progressPercentage = (progress / totalAvailableFormats) * 100;
    
    console.log(`📊 Progress calculation for round ${roundNum}:`, {
        currentRoundProgress: progress,
        totalAvailableFormats,
        progressPercentage,
        usingFallback: totalAvailableFormats === studyPathData.questionsPerRound
    });
    
    return Math.min(Math.max(progressPercentage, 0), 100); // Clamp between 0-100%
}

// Check if current round should be marked as completed (returns boolean)
function isRoundComplete() {
    // Get the correct total available formats for completion check
    let totalAvailableFormats = 28; // Default fallback (7 questions × 4 formats each)
    
    const roundProgressDataString = localStorage.getItem('roundProgressData');
    if (roundProgressDataString) {
        try {
            const roundProgressData = JSON.parse(roundProgressDataString);
            const roundData = roundProgressData[studyPathData.currentRound];
            if (roundData && roundData.totalFormats) {
                totalAvailableFormats = roundData.totalFormats;
            }
        } catch (e) {
            console.warn('Could not parse roundProgressData for completion check');
        }
    }
    
    return studyPathData.currentRoundProgress >= totalAvailableFormats;
}

// Check if current round should be marked as completed and do the completion
function checkForRoundCompletion() {
    if (isRoundComplete()) {
        const currentRound = studyPathData.currentRound;
        const conceptRounds = studyPathData.concepts.length || 7;
        
        // Only mark as completed if not already completed and within valid range
        if (currentRound <= conceptRounds && currentRound > studyPathData.completedRounds) {
            console.log(`Auto-completing round ${currentRound} due to full progress`);
            markRoundCompleted(currentRound);
        }
    }
}

// Initialize progress ring to ensure proper setup
function initializeProgressRing() {
    const progressRingFill = document.querySelector('.progress-ring-fill');
    if (progressRingFill) {
        const circumference = 2 * Math.PI * 38; // radius = 38
        const minVisibleProgress = 2; // 2% minimum for the pill indicator
        const minOffset = circumference - (minVisibleProgress / 100) * circumference;
        
        progressRingFill.style.strokeDasharray = `${circumference} ${circumference}`;
        progressRingFill.style.strokeDashoffset = minOffset; // Start with small pill visible
        progressRingFill.classList.remove('animate'); // Ensure no animation on initial setup
    }
}

// Update circular progress ring
function updateCircularProgress(percentage, animate = true) {
    const progressRingFill = document.querySelector('.progress-ring-fill');
    const progressPercentageText = document.getElementById('progressPercentageText');
    
    if (!progressRingFill) return;
    
    const radius = 38;
    const circumference = 2 * Math.PI * radius; // ≈ 238.76
    
    // Minimum visible progress (small pill/dot at 0%)
    const minVisibleProgress = 2; // 2% minimum for the pill indicator
    const adjustedPercentage = Math.max(percentage, percentage === 0 ? minVisibleProgress : percentage);
    
    // Calculate the target offset for the adjusted percentage
    const targetOffset = circumference - (adjustedPercentage / 100) * circumference;
    
    // Always set the stroke-dasharray (this doesn't animate)
    progressRingFill.style.strokeDasharray = `${circumference} ${circumference}`;
    
    if (animate) {
        // Enable animation class and set target position
        progressRingFill.classList.add('animate');
        progressRingFill.style.strokeDashoffset = targetOffset;
    } else {
        // Instant update (no animation)
        progressRingFill.classList.remove('animate');
        progressRingFill.style.strokeDashoffset = targetOffset;
    }
    
    // Update percentage text in the center
    if (progressPercentageText) {
        progressPercentageText.textContent = `${Math.round(percentage)}%`;
    }
    
    console.log('🔄 Updated circular progress:', {
        percentage: Math.round(percentage),
        adjustedPercentage: Math.round(adjustedPercentage),
        circumference,
        targetOffset,
        animate
    });
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
    
    // Set initial state with minimum 8px width for 0% state
    const progressBar = step.querySelector('.step-progress-bar');
    if (oldPercentage === 0) {
        stepProgressFill.style.width = '8px';
        stepProgressFill.style.background = 'var(--color-gray-500)'; // Gray for 0% progress
        if (progressBar) progressBar.style.background = 'var(--color-gray-200)'; // Gray background for 0%
    } else {
        stepProgressFill.style.width = `${oldPercentage}%`;
        stepProgressFill.style.background = 'var(--sys-interactive-bg-primary-default)'; // Twilight for actual progress
        if (progressBar) progressBar.style.background = 'var(--color-twilight-200)'; // Twilight background for progress
    }
    
    // Always show progress bar for current step
    stepProgress.classList.add('has-progress');
    
    // Always animate text update
    if (stepProgressText) {
        stepProgressText.classList.add('updating');
        clearProgressTextFade(); // Clear any existing fade
        stepProgressText.style.opacity = '1';
        
        // Update text after brief delay
        setTimeout(() => {
            stepProgressText.textContent = `${Math.round(newPercentage)}% complete`;
            stepProgressText.classList.remove('updating');
            
            // Set text color based on progress
            if (newPercentage === 0) {
                stepProgressText.style.color = 'var(--color-gray-500)';
            } else {
                stepProgressText.style.color = 'var(--sys-text-highlight)';
            }
            
            // Check if user came from question screen for special animation
            const fromQuestionScreen = sessionStorage.getItem('fromQuestionScreen') === 'true';
            if (fromQuestionScreen) {
                // Use entry animation when progress updates from question screen
                showProgressTextWithFadeOut(stepProgressText);
            } else {
                // Start fade out animation after showing updated progress
                startProgressTextFade(stepProgressText);
            }
        }, 150);
    }
    
    // Animate progress bar
    setTimeout(() => {
        if (newPercentage === 0) {
            stepProgressFill.style.width = '8px';
            stepProgressFill.style.background = 'var(--color-gray-500)'; // Gray for 0% progress
            if (stepProgressBar) stepProgressBar.style.background = 'var(--color-gray-200)'; // Gray background for 0%
        } else {
            stepProgressFill.style.width = `${newPercentage}%`;
            stepProgressFill.style.background = 'var(--sys-interactive-bg-primary-default)'; // Twilight for actual progress
            if (stepProgressBar) stepProgressBar.style.background = 'var(--color-twilight-200)'; // Twilight background for progress
        }
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
        
            // Regular round
            const roundNumber = parseInt(roundType);
            updateRoundStep(step, stepCircle, stepLine, stepStatus, stepProgressFill, stepProgressText, roundNumber);
    });
    
    // Cleanup: Ensure only current step has expanded accordion
    setTimeout(() => {
        const currentSteps = document.querySelectorAll('.path-step.current');
        const expandedSteps = document.querySelectorAll('.path-step.expanded');
        
        // If no current step, collapse all accordions
        if (currentSteps.length === 0) {
            expandedSteps.forEach(step => {
                step.classList.remove('expanded');
                const accordionContent = step.querySelector('.step-accordion-content');
                if (accordionContent) {
                    accordionContent.style.maxHeight = '0px';
                }
                step.style.setProperty('--accordion-height', '0px');
                step.style.setProperty('--dynamic-line-height', '0px');
                clearAccordionAnimations(step);
            });
        }
    }, 400); // Delay to allow auto-expansion to complete first
}



// Update regular round steps
function updateRoundStep(step, stepCircle, stepLine, stepStatus, stepProgressFill, stepProgressText, roundNumber) {
    // Declare stepProgressBar once at function level to avoid redeclaration errors
    let stepProgressBar = step.querySelector('.step-progress-bar');
    
    // Check if this round is completed using completedRounds data
    const isCompleted = roundNumber <= studyPathData.completedRounds;
    const isCurrent = roundNumber === studyPathData.currentRound;
    
    // FIXED LOGIC: Handle "skipped" rounds (before current but not completed) as "next" state
    // This prevents UNKNOWN state errors when user jumps ahead
    const isNext = roundNumber > studyPathData.currentRound || 
                   (roundNumber < studyPathData.currentRound && !isCompleted);
    
    
    // Check if this round has progress from previous current round progress
    const roundProgress = studyPathData.roundProgress ? studyPathData.roundProgress[roundNumber] || 0 : 0;
    const hasRoundProgress = roundProgress > 0;
    
    // Check if this was a previously current step that had progress but is no longer current
    const isPreviouslyCurrentWithProgress = !isCurrent && !isCompleted && roundNumber < studyPathData.currentRound && 
                                          (roundProgress > 0 || (studyPathData.currentRoundProgress > 0 && roundNumber === studyPathData.currentRound - 1));
    
    console.log(`🔍 DEBUG: Updating round ${roundNumber}:`, {
        isCompleted,
        isCurrent,
        isNext,
        currentRound: studyPathData.currentRound,
        completedRounds: studyPathData.completedRounds,
        roundProgress,
        hasRoundProgress,
        studyPathDataSnapshot: {
            currentRound: studyPathData.currentRound,
            completedRounds: studyPathData.completedRounds,
            currentRoundProgress: studyPathData.currentRoundProgress,
            concepts: studyPathData.concepts?.length
        },
        stepStateLogic: {
            'roundNumber <= completedRounds': `${roundNumber} <= ${studyPathData.completedRounds} = ${roundNumber <= studyPathData.completedRounds}`,
            'roundNumber === currentRound': `${roundNumber} === ${studyPathData.currentRound} = ${roundNumber === studyPathData.currentRound}`,
            'roundNumber > currentRound': `${roundNumber} > ${studyPathData.currentRound} = ${roundNumber > studyPathData.currentRound}`
        },
        willApplyClasses: {
            current: isCurrent,
            completed: isCompleted,
            next: isNext
        },
        stateCategory: isCompleted ? 'COMPLETED' : 
                       isCurrent ? 'CURRENT' : 
                       isNext ? 'NEXT' : 'UNKNOWN_ERROR'
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
    
    // Debug: Log which path will be taken
    let pathTaken = '';
    if (isCompleted) {
        pathTaken = 'COMPLETED';
    } else if (isCurrent) {
        pathTaken = 'CURRENT';
    } else if (isNext) {
        pathTaken = 'NEXT (includes skipped rounds)';
    } else {
        pathTaken = 'UNKNOWN_ERROR - THIS SHOULD NOT HAPPEN';
    }
    console.log(`🎯 Round ${roundNumber} taking ${pathTaken} path`);
    
    if (isCompleted) {
        // Completed round
        step.classList.add('completed');
        stepCircle.classList.add('completed');
        stepCircle.querySelector('.step-icon').textContent = 'check';
        
        // Show replay button for completed rounds (make them clickable to restart)
        stepStatus.innerHTML = `<span class="material-icons-round loaded">replay</span>`;
        stepStatus.classList.add('completed');
        stepStatus.style.display = 'flex';
        
        stepProgressFill.style.width = '100%';
        stepProgressFill.style.background = 'var(--sys-interactive-bg-primary-default)'; // Twilight for completed progress
        if (stepProgressBar) stepProgressBar.style.background = 'var(--color-twilight-200)'; // Twilight background for completed
        stepProgress.classList.add('has-progress'); // Show progress display for completed rounds
        
        // Show "100% complete" text for completed rounds
        if (stepProgressText) {
            updateProgressTextWithoutFlicker(stepProgressText, 100, `completed round ${roundNumber}`);
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
        
        // Show twilight play button ONLY for current step
        stepStatus.innerHTML = `<span class="material-icons-round loaded">play_arrow</span>`;
        stepStatus.classList.add('in-progress');
        stepStatus.style.display = 'flex';
        console.log(`✅ Showing twilight play button for current round ${roundNumber}`);
        
        // Auto-expand accordion for current step (regardless of progress)
            setTimeout(() => {
                if (!step.classList.contains('expanded')) {
                    expandAccordion(step, roundNumber);
                }
            }, 300); // Small delay to ensure DOM is ready and allow animations to complete
        
        const progressPercentage = calculateProgressPercentage();
        
        console.log(`🎯 Updating current step ${roundNumber} progress:`, {
            currentRoundProgress: studyPathData.currentRoundProgress,
            progressPercentage,
            stepProgressExists: !!stepProgress,
            stepProgressFillExists: !!stepProgressFill,
            stepProgressTextExists: !!stepProgressText
        });
        
        // Always show progress bar for current step, even at 0% (ONLY current step should show 0% progress)
        stepProgress.classList.add('has-progress');
        
        // Force the progress container to be visible with explicit styling
        stepProgress.style.display = 'flex';
        stepProgress.style.alignItems = 'center';
        stepProgress.style.gap = '12px';
        stepProgress.style.marginTop = '8px';
        
        // Ensure progress bar background is visible
        if (stepProgressBar) {
            stepProgressBar.style.display = 'block';
            stepProgressBar.style.width = '88px';
            stepProgressBar.style.height = '8px';
            stepProgressBar.style.borderRadius = '4px';
        }
        
        // Style progress fill based on percentage - using the working logic from debug function
        if (stepProgressFill) {
            // Clear any existing stuck width styles first
            stepProgressFill.style.removeProperty('width');
            
            stepProgressFill.style.display = 'block';
            stepProgressFill.style.height = '100%';
            stepProgressFill.style.borderRadius = '4px';
            stepProgressFill.style.transition = 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease';
            
            // Apply the correct width - this is the key fix
        if (progressPercentage === 0) {
                // 0% state - show 8px gray bar (using the working logic from debug function)
            stepProgressFill.style.width = '8px';
                stepProgressFill.style.background = 'var(--color-gray-500)';
                stepProgressFill.style.opacity = '1';
                stepProgressFill.style.visibility = 'visible';
                if (stepProgressBar) stepProgressBar.style.background = 'var(--color-gray-200)';
                console.log('🔍 Applied 8px width for 0% progress state');
        } else {
                // Progress state - show percentage
            stepProgressFill.style.width = `${progressPercentage}%`;
                stepProgressFill.style.background = 'var(--sys-interactive-bg-primary-default)';
                stepProgressFill.style.opacity = '1';
                stepProgressFill.style.visibility = 'visible';
                if (stepProgressBar) stepProgressBar.style.background = 'var(--color-twilight-200)';
                console.log(`🔍 Applied ${progressPercentage}% width for progress state`);
            }
        }
        
        console.log('🔍 Current step progress bar updated with working fix logic');
        
        // Always show progress text for current step, even at 0%
        if (stepProgressText && !stepProgressText.classList.contains('updating')) {
            // Force progress text to be visible with explicit styling (without transitions)
            stepProgressText.style.display = 'block';
            stepProgressText.style.fontFamily = 'var(--typography-fontFamily)';
            stepProgressText.style.fontSize = 'var(--typography-size-subheading-five)';
            stepProgressText.style.lineHeight = 'var(--typography-lineHeight-subheading-five)';
            stepProgressText.style.fontWeight = '600';
            stepProgressText.style.marginLeft = '12px';
            stepProgressText.style.whiteSpace = 'nowrap';
            stepProgressText.style.visibility = 'visible';
            
            // Check if user came from question screen for special animation
            const fromQuestionScreen = sessionStorage.getItem('fromQuestionScreen') === 'true';
            if (fromQuestionScreen) {
                // Use normal text update for animation case (transitions needed for fade effect)
                stepProgressText.textContent = `${Math.round(progressPercentage)}% complete`;
                stepProgressText.style.color = progressPercentage === 0 ? 'var(--color-gray-500)' : 'var(--sys-text-highlight)';
                stepProgressText.style.opacity = '1';
                console.log('🎬 Triggering progress text entry animation for current round');
                showProgressTextWithFadeOut(stepProgressText);
            } else {
                // Use flicker-free update for normal step selection
                updateProgressTextWithoutFlicker(stepProgressText, progressPercentage, `current round ${roundNumber}`);
                // Start fade out animation after brief display (this will re-enable transitions)
                setTimeout(() => {
                    startProgressTextFade(stepProgressText);
                }, 100);
            }
        }
        
        // Update spacer color for current round
        if (nextSibling && nextSibling.classList.contains('step-vertical-spacer')) {
            nextSibling.classList.add('current');
        }
        
    } else if (isNext && !hasRoundProgress) {
        // Pure next/future rounds with no progress
        step.classList.add('next');
        stepCircle.classList.add('next');
        stepCircle.querySelector('.step-icon').textContent = 'star_outline';
        
        // Don't show play button for next/future rounds - explicitly hide it
        stepStatus.innerHTML = `<span class="material-icons-round loaded">play_arrow</span>`;
        stepStatus.classList.add('next');
        stepStatus.style.display = 'none'; // Explicitly hide play button to override any previous inline styles
        console.log(`🚫 Hiding play button for next round ${roundNumber} (no progress)`);
        
        stepProgressFill.style.width = '0%';
        stepProgressFill.style.background = 'var(--color-gray-500)'; // Gray for disabled/next rounds
        if (stepProgressBar) stepProgressBar.style.background = 'var(--color-gray-200)'; // Gray background for disabled
        stepProgress.classList.remove('has-progress');
        
        // Hide progress text for next rounds with no progress
        if (stepProgressText) {
            stepProgressText.textContent = '';
        }
        
        // Update spacer color for next rounds
        if (nextSibling && nextSibling.classList.contains('step-vertical-spacer')) {
            nextSibling.classList.add('next');
        }
        
    } else if (isNext && hasRoundProgress) {
        // Next rounds that have some progress (either future rounds with progress or skipped rounds)
        step.classList.add('next');
        stepCircle.classList.add('next');  
        stepCircle.querySelector('.step-icon').textContent = 'star_outline';
        
        // Don't show play button for next rounds - explicitly hide it
        stepStatus.innerHTML = `<span class="material-icons-round loaded">play_arrow</span>`;
        stepStatus.classList.add('next');
        stepStatus.style.display = 'none'; // Explicitly hide play button to override any previous inline styles
        console.log(`🚫 Hiding play button for next round ${roundNumber} (with progress)`);
        
        // Show the progress using correct format-based calculation
        const progressPercentage = calculateProgressPercentage(roundNumber, roundProgress);
        console.log(`📊 Next round ${roundNumber} with progress: ${roundProgress} formats = ${progressPercentage}%`);
        
        // Only show progress bar if there's actual progress (> 0%) - never show 0% state for non-current steps
        if (progressPercentage > 0) {
            stepProgressFill.style.width = `${progressPercentage}%`;
            stepProgressFill.style.background = 'var(--sys-interactive-bg-primary-default)';
            if (stepProgressBar) stepProgressBar.style.background = 'var(--color-twilight-200)';
            stepProgress.classList.add('has-progress');
            
            // Show progress text with percentage
            if (stepProgressText) {
                updateProgressTextWithoutFlicker(stepProgressText, progressPercentage, `next round ${roundNumber}`);
            }
            console.log(`✅ Showing progress bar for next round ${roundNumber} with ${progressPercentage}% progress`);
        } else {
            // No actual progress - completely hide progress bar (don't show 0% state for non-current steps)
            stepProgressFill.style.width = '0%';
            stepProgressFill.style.background = 'var(--color-gray-500)';
            if (stepProgressBar) stepProgressBar.style.background = 'var(--color-gray-200)';
            stepProgress.classList.remove('has-progress'); // This hides the entire progress container
            
            // Hide progress text completely for 0% non-current steps
            if (stepProgressText) {
                stepProgressText.textContent = '';
                stepProgressText.style.opacity = '0';
            }
            console.log(`🚫 Completely hiding progress bar for next round ${roundNumber} with 0% progress (no 0% state for non-current steps)`);
        }
        
        // Update spacer color for next rounds
        if (nextSibling && nextSibling.classList.contains('step-vertical-spacer')) {
            nextSibling.classList.add('next');
        }
        
    } else if (isPreviouslyCurrentWithProgress) {
        // This case should now be handled by "isNext && hasRoundProgress" above
        // But keeping this as a fallback for any edge cases
        console.log(`⚠️ Round ${roundNumber}: Reached isPreviouslyCurrentWithProgress fallback - this might be redundant now`);
        
        // Treat as next round with progress (same logic as above)
        step.classList.add('next');
        stepCircle.classList.add('next');
        stepCircle.querySelector('.step-icon').textContent = 'star_outline';
        
        stepStatus.innerHTML = `<span class="material-icons-round loaded">play_arrow</span>`;
        stepStatus.classList.add('next');
        stepStatus.style.display = 'none'; // Explicitly hide play button to override any previous inline styles
        console.log(`🚫 Hiding play button for previously current round ${roundNumber} (fallback)`);
        
        const progressPercentage = calculateProgressPercentage(roundNumber, roundProgress);
        console.log(`📊 Previously current round ${roundNumber} fallback: ${roundProgress} formats = ${progressPercentage}%`);
        
        // Only show progress bar if there's actual progress (> 0%) - never show 0% state for non-current steps
        if (progressPercentage > 0) {
            stepProgressFill.style.width = `${progressPercentage}%`;
            stepProgressFill.style.background = 'var(--sys-interactive-bg-primary-default)';
            if (stepProgressBar) stepProgressBar.style.background = 'var(--color-twilight-200)';
            stepProgress.classList.add('has-progress');
            
            // Show progress text for previously current rounds with actual progress
            if (stepProgressText) {
                updateProgressTextWithoutFlicker(stepProgressText, progressPercentage, `previously current round ${roundNumber} (fallback)`);
            }
            console.log(`✅ Showing progress bar for previously current round ${roundNumber} with ${progressPercentage}% progress`);
        } else {
            // No actual progress - completely hide progress bar (don't show 0% state for non-current steps)
            stepProgressFill.style.width = '0%';
            stepProgressFill.style.background = 'var(--color-gray-500)';
            if (stepProgressBar) stepProgressBar.style.background = 'var(--color-gray-200)';
            stepProgress.classList.remove('has-progress'); // This hides the entire progress container
            
            // Hide progress text completely for 0% non-current steps
            if (stepProgressText) {
                stepProgressText.textContent = '';
                stepProgressText.style.opacity = '0';
            }
            console.log(`🚫 Completely hiding progress bar for previously current round ${roundNumber} with 0% progress (no 0% state for non-current steps)`);
        }
        
        if (nextSibling && nextSibling.classList.contains('step-vertical-spacer')) {
            nextSibling.classList.add('next');
        }
        
    } else if (hasRoundProgress) {
        // General fallback: Round with progress (but not current, completed, or handled above)
        console.log(`⚠️ Round ${roundNumber}: Reached general hasRoundProgress fallback - this might be redundant now`);
        
        step.classList.add('next'); // Treat as next round with some progress
        stepCircle.classList.add('next');
        stepCircle.querySelector('.step-icon').textContent = 'star_outline';
        
        // Don't show play button for rounds with progress - explicitly hide it
        stepStatus.innerHTML = `<span class="material-icons-round loaded">play_arrow</span>`;
        stepStatus.classList.add('next');
        stepStatus.style.display = 'none'; // Explicitly hide play button to override any previous inline styles
        console.log(`🚫 Hiding play button for round ${roundNumber} (general progress fallback)`);
        
        // Show round progress using correct format-based calculation
        const progressPercentage = calculateProgressPercentage(roundNumber, roundProgress);
        console.log(`📊 General fallback round ${roundNumber}: ${roundProgress} formats = ${progressPercentage}%`);
        
        // Only show progress bar if there's actual progress (> 0%) - never show 0% state for non-current steps
        if (progressPercentage > 0) {
            stepProgressFill.style.width = `${progressPercentage}%`;
            stepProgressFill.style.background = 'var(--sys-interactive-bg-primary-default)'; // Twilight for actual progress
            if (stepProgressBar) stepProgressBar.style.background = 'var(--color-twilight-200)'; // Twilight background for progress
            stepProgress.classList.add('has-progress');
            
            // Set progress text when showing progress bar
            if (stepProgressText) {
                updateProgressTextWithoutFlicker(stepProgressText, progressPercentage, `general fallback round ${roundNumber}`);
            }
            console.log(`✅ Showing progress bar for general fallback round ${roundNumber} with ${progressPercentage}% progress`);
        } else {
            // No actual progress - completely hide progress bar (don't show 0% state for non-current steps)
            stepProgressFill.style.width = '0%';
            stepProgressFill.style.background = 'var(--color-gray-500)'; // Gray for no progress
            if (stepProgressBar) stepProgressBar.style.background = 'var(--color-gray-200)'; // Gray background for no progress
            stepProgress.classList.remove('has-progress'); // This hides the entire progress container
            
            // Hide progress text completely for 0% non-current steps
            if (stepProgressText) {
                stepProgressText.textContent = '';
                stepProgressText.style.opacity = '0';
            }
            console.log(`🚫 Completely hiding progress bar for general fallback round ${roundNumber} with 0% progress (no 0% state for non-current steps)`);
        }
        
        // Update spacer color for next rounds
        if (nextSibling && nextSibling.classList.contains('step-vertical-spacer')) {
            nextSibling.classList.add('next');
        }
    } else {
        // This should never happen with the fixed logic above
        console.error(`❌ CRITICAL ERROR: Round ${roundNumber} reached impossible UNKNOWN state!`, {
            isCompleted,
            isCurrent,
            isNext,
            currentRound: studyPathData.currentRound,
            completedRounds: studyPathData.completedRounds
        });
        
        // Fallback: Treat as next state to prevent UI breakdown
        step.classList.add('next');
        stepCircle.classList.add('next');
        stepStatus.style.display = 'none';
        stepStatus.classList.add('next');
    }
    
    // Final debug: Log what classes were actually applied
    console.log(`✅ Round ${roundNumber} final state:`, {
        stepClasses: Array.from(step.classList),
        stepCircleClasses: stepCircle ? Array.from(stepCircle.classList) : 'none',
        stepStatusClasses: stepStatus ? Array.from(stepStatus.classList) : 'none',
        stepStatusDisplay: stepStatus ? stepStatus.style.display : 'none'
    });
}

// Animate completed steps
function animateCompletedSteps() {
    pathSteps.forEach((step, index) => {
        const roundType = step.dataset.round;
        if (false) { // Removed diagnostic logic
            setTimeout(() => {
                const stepCircle = step.querySelector('.step-circle');
                stepCircle.classList.add('completed');
            }, (index + 1) * 100);
        } else if (false) { // Removed diagnostic logic
            setTimeout(() => {
                const stepCircle = step.querySelector('.step-circle');
                stepCircle.classList.add('completed');
            }, (index + 1) * 100);
        } else if (false) { // Removed diagnostic logic
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
    // Path step clicks - use event delegation since content is dynamic
    const pathContainer = document.querySelector('.path-container');
    if (pathContainer) {
        pathContainer.addEventListener('click', function(e) {
            // Check if click was on the "Make a change" button
            const makeChangeBtn = e.target.closest('.make-change-btn');
            if (makeChangeBtn) {
                e.preventDefault();
                e.stopPropagation(); // Prevent accordion from closing
                transformButtonToInput(makeChangeBtn);
                return;
            }
            // Check if click was on path-step-main for non-current steps
            const stepMain = e.target.closest('.path-step-main');
            if (stepMain) {
                const step = stepMain.closest('.path-step');
                if (step && !step.classList.contains('current')) {
                    const roundType = step.dataset.round;
                    
                        // Handle regular rounds - allow skipping ahead
                        const roundNumber = parseInt(roundType);
                        if (roundNumber) {
                            console.log('🎯 Starting round from step-main:', roundNumber);
                            
                            // If clicking on a future round, make it current
                            if (roundNumber > studyPathData.currentRound) {
                                console.log(`🎯 Skipping ahead: ${studyPathData.currentRound} → ${roundNumber}`);
                                
                                // FIRST: Update data immediately and synchronously
                                // Debug current state before preservation
                                console.log(`🔍 BEFORE FORWARD STEP SWITCH:`, {
                                    oldRound: studyPathData.currentRound,
                                    newRound: roundNumber,
                                    oldCurrentRoundProgress: studyPathData.currentRoundProgress,
                                    existingRoundProgress: studyPathData.roundProgress
                                });
                                
                                // DISABLE PROGRESS PRESERVATION - this was causing artificial progress inflation  
                                // Only preserve progress from actual study sessions, not step navigation
                                if (studyPathData.currentRoundProgress > 0) {
                                    console.log(`🚨 POTENTIAL ARTIFICIAL PROGRESS: currentRoundProgress is ${studyPathData.currentRoundProgress} for round ${studyPathData.currentRound}`);
                                    console.log(`🚨 This should only happen from actual studying, not step clicking!`);
                                    console.log(`🚨 NOT preserving this progress to prevent overview card inflation`);
                                } else {
                                    console.log(`✅ No progress to preserve for round ${studyPathData.currentRound}`);
                                }
                                
                                // Update to new round IMMEDIATELY - this ensures updateRoundStep() uses correct data
                                studyPathData.currentRound = roundNumber;
                                
                                // Restore actual progress for this round from roundProgressData (not artificial reset)
                                const roundProgressDataString = localStorage.getItem('roundProgressData');
                                let actualRoundProgress = 0;
                                if (roundProgressDataString) {
                                    try {
                                        const roundProgressData = JSON.parse(roundProgressDataString);
                                        actualRoundProgress = roundProgressData[roundNumber]?.progress || 0;
                                        console.log(`📊 Restoring actual progress for round ${roundNumber}: ${actualRoundProgress} formats`);
                                    } catch (e) {
                                        console.warn('Could not parse roundProgressData when restoring step progress');
                                    }
                                }
                                studyPathData.currentRoundProgress = actualRoundProgress;
                                
                                // DON'T artificially mark steps as completed - keep original completedRounds
                                console.log(`📊 Keeping original completedRounds: ${studyPathData.completedRounds} (not artificially inflating)`);
                                
                                localStorage.setItem('currentRoundNumber', roundNumber);
                                localStorage.setItem('currentRoundProgress', actualRoundProgress.toString());
                                console.log(`💾 Saved to localStorage: currentRoundNumber=${roundNumber}, currentRoundProgress=${actualRoundProgress}`);
                                saveStudyPathData();
                                
                                console.log(`✅ Data updated synchronously: currentRound is now ${studyPathData.currentRound}`);
                                
                                // IMMEDIATELY clean up 0% progress bars from previously current steps
                                cleanupPreviousCurrentStepProgress();
                                
                                // Debug: Check what the progress calculation will see
                                console.log(`🔍 AFTER FORWARD STEP SWITCH - Data state for progress calculation:`, {
                                    currentRound: studyPathData.currentRound,
                                    currentRoundProgress: studyPathData.currentRoundProgress,
                                    completedRounds: studyPathData.completedRounds,
                                    roundProgress: studyPathData.roundProgress,
                                    stateLogicCheck: {
                                        round1: `isCompleted: ${1 <= studyPathData.completedRounds}, isCurrent: ${1 === studyPathData.currentRound}, isNext: ${1 > studyPathData.currentRound}`,
                                        round2: `isCompleted: ${2 <= studyPathData.completedRounds}, isCurrent: ${2 === studyPathData.currentRound}, isNext: ${2 > studyPathData.currentRound}`,
                                        round3: `isCompleted: ${3 <= studyPathData.completedRounds}, isCurrent: ${3 === studyPathData.currentRound}, isNext: ${3 > studyPathData.currentRound}`
                                    }
                                });
                                
                                // THEN: Force immediate UI refresh with correct data
                                updateUI();
                            } else if (roundNumber < studyPathData.currentRound) {
                                // Clicking on a previously completed step - make it current again
                                console.log(`🔄 Going back to round: ${studyPathData.currentRound} → ${roundNumber}`);
                                
                                // FIRST: Update data immediately and synchronously
                                // Debug current state before preservation
                                console.log(`🔍 BEFORE BACKWARD STEP SWITCH:`, {
                                    oldRound: studyPathData.currentRound,
                                    newRound: roundNumber,
                                    oldCurrentRoundProgress: studyPathData.currentRoundProgress,
                                    existingRoundProgress: studyPathData.roundProgress
                                });
                                
                                // DISABLE PROGRESS PRESERVATION - this was causing artificial progress inflation
                                // Only preserve progress from actual study sessions, not step navigation
                                if (studyPathData.currentRoundProgress > 0) {
                                    console.log(`🚨 POTENTIAL ARTIFICIAL PROGRESS: currentRoundProgress is ${studyPathData.currentRoundProgress} for round ${studyPathData.currentRound}`);
                                    console.log(`🚨 This should only happen from actual studying, not step clicking!`);
                                    console.log(`🚨 NOT preserving this progress to prevent overview card inflation`);
                                } else {
                                    console.log(`✅ No progress to preserve for round ${studyPathData.currentRound}`);
                                }
                                
                                // Update to selected round IMMEDIATELY - this ensures updateRoundStep() uses correct data
                                studyPathData.currentRound = roundNumber;
                                
                                // Restore actual progress for this round from roundProgressData (not artificial reset)
                                const roundProgressDataString = localStorage.getItem('roundProgressData');
                                let actualRoundProgress = 0;
                                if (roundProgressDataString) {
                                    try {
                                        const roundProgressData = JSON.parse(roundProgressDataString);
                                        actualRoundProgress = roundProgressData[roundNumber]?.progress || 0;
                                        console.log(`📊 Restoring actual progress for backward round ${roundNumber}: ${actualRoundProgress} formats`);
                                    } catch (e) {
                                        console.warn('Could not parse roundProgressData when restoring backward step progress');
                                    }
                                }
                                studyPathData.currentRoundProgress = actualRoundProgress;
                                
                                // DON'T artificially mark steps as completed - keep original completedRounds  
                                console.log(`📊 Keeping original completedRounds: ${studyPathData.completedRounds} (not artificially inflating)`);
                                
                                localStorage.setItem('currentRoundNumber', roundNumber);
                                localStorage.setItem('currentRoundProgress', actualRoundProgress.toString());
                                console.log(`💾 Saved to localStorage: currentRoundNumber=${roundNumber}, currentRoundProgress=${studyPathData.currentRoundProgress}`);
                                saveStudyPathData();
                                
                                console.log(`✅ Data updated synchronously: currentRound is now ${studyPathData.currentRound}`);
                                
                                // IMMEDIATELY clean up 0% progress bars from previously current steps
                                cleanupPreviousCurrentStepProgress();
                                
                                // Debug: Check what the progress calculation will see
                                console.log(`🔍 AFTER BACKWARD STEP SWITCH - Data state for progress calculation:`, {
                                    currentRound: studyPathData.currentRound,
                                    currentRoundProgress: studyPathData.currentRoundProgress,
                                    completedRounds: studyPathData.completedRounds,
                                    roundProgress: studyPathData.roundProgress,
                                    stateLogicCheck: {
                                        round1: `isCompleted: ${1 <= studyPathData.completedRounds}, isCurrent: ${1 === studyPathData.currentRound}, isNext: ${1 > studyPathData.currentRound}`,
                                        round2: `isCompleted: ${2 <= studyPathData.completedRounds}, isCurrent: ${2 === studyPathData.currentRound}, isNext: ${2 > studyPathData.currentRound}`,
                                        round3: `isCompleted: ${3 <= studyPathData.completedRounds}, isCurrent: ${3 === studyPathData.currentRound}, isNext: ${3 > studyPathData.currentRound}`
                                    }
                                });
                                
                                // THEN: Force immediate UI refresh with correct data
                                updateUI();
                            } else {
                                startRound(roundNumber);
                        }
                    }
                    return;
                }
            }
            
            // Check if click was on the play button (step-status)
            const playButton = e.target.closest('.step-status');
            if (playButton) {
                // Handle play button click - start round
                const step = playButton.closest('.path-step');
                if (!step) return;
                
                const roundType = step.dataset.round;
                console.log('🎯 Play button clicked:', { roundType, classes: step.className });
                
                // Allow all rounds to be clicked
                    const roundNumber = parseInt(roundType);
                    console.log('🎯 Play button clicked for round:', roundNumber);
                    
                    // If clicking on a future round, make it current
                    if (roundNumber > studyPathData.currentRound) {
                        console.log(`Skipping ahead via play button: ${studyPathData.currentRound} → ${roundNumber}`);
                        
                        // Preserve progress of the previously current step
                        if (studyPathData.currentRoundProgress > 0) {
                            if (!studyPathData.roundProgress) {
                                studyPathData.roundProgress = {};
                            }
                            studyPathData.roundProgress[studyPathData.currentRound] = studyPathData.currentRoundProgress;
                            console.log(`Preserving progress for round ${studyPathData.currentRound}: ${studyPathData.currentRoundProgress} questions`);
                        }
                        
                        studyPathData.currentRound = roundNumber;
                        
                        // Restore actual progress for this round from roundProgressData (not artificial reset)
                        const roundProgressDataString = localStorage.getItem('roundProgressData');
                        let actualRoundProgress = 0;
                        if (roundProgressDataString) {
                            try {
                                const roundProgressData = JSON.parse(roundProgressDataString);
                                actualRoundProgress = roundProgressData[roundNumber]?.progress || 0;
                                console.log(`📊 Restoring actual progress for play button round ${roundNumber}: ${actualRoundProgress} formats`);
                            } catch (e) {
                                console.warn('Could not parse roundProgressData when restoring play button step progress');
                            }
                        }
                        studyPathData.currentRoundProgress = actualRoundProgress;
                        
                        localStorage.setItem('currentRoundNumber', roundNumber);
                        localStorage.setItem('currentRoundProgress', actualRoundProgress.toString());
                        saveStudyPathData();
                        
                        // IMMEDIATELY clean up 0% progress bars from previously current steps
                        cleanupPreviousCurrentStepProgress();
                        
                        updateUI(); // Refresh display to show new current step
                    } else {
                        startRound(roundNumber);
                }
                return;
            }
            
            // Check if click was on accordion content (to close accordion)
            const accordionContent = e.target.closest('.step-accordion-content');
            if (accordionContent) {
                // Don't close accordion if clicking on "Make a change" button or input
                const makeChangeBtn = e.target.closest('.make-change-btn');
                const makeChangeInput = e.target.closest('.make-change-input');
                const accordionAction = e.target.closest('.accordion-action');
                
                if (makeChangeBtn || makeChangeInput || accordionAction) {
                    console.log('📋 Ignoring accordion close - clicked on make change element');
                    return; // Don't close accordion when interacting with make change elements
                }
                
                const step = accordionContent.closest('.path-step');
                if (step && step.classList.contains('expanded')) {
                    const roundType = step.dataset.round;
                    const roundNumber = parseInt(roundType);
                    
                    console.log('📋 Closing accordion via content click:', roundNumber);
                    toggleAccordion(step, roundNumber);
                    return;
                }
            }
            
            // Check if click was on step-vertical-spacer (accordion toggle)
            const stepSpacer = e.target.closest('.step-vertical-spacer');
            if (stepSpacer) {
                // Find the previous step element (the one that owns this spacer)
                const step = stepSpacer.previousElementSibling;
                if (step && step.classList.contains('path-step')) {
                    const roundType = step.dataset.round;
                    const roundNumber = parseInt(roundType);
                    
                    
                    // Only allow accordion for current round
                    const isCurrent = step.classList.contains('current');
                    
                    if (roundNumber && isCurrent) {
                        console.log('📋 Toggling accordion via spacer for current round:', roundNumber);
                        toggleAccordion(step, roundNumber);
                        return;
                    } else if (roundNumber && !isCurrent) {
                        console.log('🚫 Accordion blocked via spacer - only available for current round');
                        return;
                    }
                }
            }
            
            // Check if click was on step-progress with has-progress class (accordion toggle)
            const stepProgress = e.target.closest('.step-progress.has-progress');
            if (!stepProgress) return;
            
            const step = stepProgress.closest('.path-step');
            if (!step) return;
            
            const roundType = step.dataset.round;
            console.log('📋 Accordion click on step-progress:', { roundType, classes: step.className });
            
            
            // Only allow accordion for current round
            const roundNumber = parseInt(roundType);
            const isCurrent = step.classList.contains('current');
            
            if (roundNumber && isCurrent) {
                console.log('📋 Toggling accordion for current round:', roundNumber);
                toggleAccordion(step, roundNumber);
            } else if (roundNumber && !isCurrent) {
                console.log('🚫 Accordion blocked - only available for current round');
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'Escape':
                backBtn.click();
                break;
        }
    });
}

// Expand accordion for current step (auto-expand on load)
function expandAccordion(step, roundNumber) {
    const accordionContent = step.querySelector('.step-accordion-content');
    if (!accordionContent) {
        console.log('🚫 No accordion content found for round:', roundNumber);
        return;
    }
    
    // Don't auto-expand if already expanded
    if (step.classList.contains('expanded')) {
        return;
    }
    
    console.log('📋 Auto-expanding accordion for current round:', roundNumber);
    
    // Close all other expanded steps first
    const allSteps = document.querySelectorAll('.path-step.expanded');
    allSteps.forEach(otherStep => {
        if (otherStep !== step) {
            otherStep.classList.remove('expanded');
            const otherContent = otherStep.querySelector('.step-accordion-content');
            if (otherContent) {
                otherContent.style.maxHeight = '0px';
            }
            otherStep.style.setProperty('--accordion-height', '0px');
            otherStep.style.setProperty('--dynamic-line-height', '0px');
            // Clear any existing animation timers for other steps
            clearAccordionAnimations(otherStep);
        }
    });
    
    // Expand current step
    step.classList.add('expanded');
    // Set max-height to scrollHeight for smooth animation
    const contentHeight = accordionContent.scrollHeight;
    accordionContent.style.maxHeight = contentHeight + 'px';
    
    // Set accordion height for extended vertical line overlay and margin
    const totalHeight = contentHeight + 16 + 16; // 16px for expanded margin-top + 16px for accordion-action margin-bottom
    step.style.setProperty('--accordion-height', totalHeight + 'px');
    
    // Set initial dynamic line height for normal accordion expansion
    // Calculate height to reach the bottom of the last text line
    setTimeout(() => {
        // Find the "Up next:" section using the same reliable method as re-planning
        const allSections = accordionContent.querySelectorAll('.accordion-section');
        let nextRoundSection = null;
        allSections.forEach(section => {
            const title = section.querySelector('.accordion-section-title');
            if (title && title.textContent.includes('Up next:')) {
                nextRoundSection = section;
            }
        });
        
        if (nextRoundSection) {
            const nextRoundItems = nextRoundSection.querySelector('.accordion-items');
            if (nextRoundItems) {
                const items = nextRoundItems.querySelectorAll('.accordion-item');
                if (items.length > 0) {
                    const lastItem = items[items.length - 1];
                    
                    // Calculate height from accordion start to bottom of last item
                    const accordionTop = accordionContent.getBoundingClientRect().top;
                    const lastItemBottom = lastItem.getBoundingClientRect().bottom;
                    const lineHeight = lastItemBottom - accordionTop;
                    
                    step.style.setProperty('--dynamic-line-height', `${lineHeight}px`);
                }
            }
        }
    }, 100);
    
    // Start the planning animation sequence
    startPlanningAnimation(step);
}

// Toggle accordion expansion for path steps
function toggleAccordion(step, roundNumber) {
    const accordionContent = step.querySelector('.step-accordion-content');
    if (!accordionContent) {
        console.log('🚫 No accordion content found for round:', roundNumber);
        return;
    }
    
    const isExpanded = step.classList.contains('expanded');
    
    // Close all other expanded steps first
    const allSteps = document.querySelectorAll('.path-step.expanded');
    allSteps.forEach(otherStep => {
        if (otherStep !== step) {
            otherStep.classList.remove('expanded');
            const otherContent = otherStep.querySelector('.step-accordion-content');
            if (otherContent) {
                otherContent.style.maxHeight = '0px';
            }
            otherStep.style.setProperty('--accordion-height', '0px');
            otherStep.style.setProperty('--dynamic-line-height', '0px');
            // Clear any existing animation timers for other steps
            clearAccordionAnimations(otherStep);
        }
    });
    
    // Toggle current step
    if (isExpanded) {
        // Collapse
        step.classList.remove('expanded');
        accordionContent.style.maxHeight = '0px';
        step.style.setProperty('--accordion-height', '0px');
        step.style.setProperty('--dynamic-line-height', '0px');
        // Clear animation timers
        clearAccordionAnimations(step);
        console.log('📋 Collapsed accordion for round:', roundNumber);
    } else {
        // Expand
        step.classList.add('expanded');
        // Set max-height to scrollHeight for smooth animation
        const contentHeight = accordionContent.scrollHeight;
        accordionContent.style.maxHeight = contentHeight + 'px';
        
        // Set accordion height for extended vertical line overlay and margin
        const totalHeight = contentHeight + 16 + 16; // 16px for expanded margin-top + 16px for accordion-action margin-bottom
        step.style.setProperty('--accordion-height', totalHeight + 'px');
        
        // Set initial dynamic line height for normal accordion expansion
        // Calculate height to reach the bottom of the last text line
        setTimeout(() => {
            // Find the "Up next:" section using the same reliable method as re-planning
            const allSections = accordionContent.querySelectorAll('.accordion-section');
            let nextRoundSection = null;
            allSections.forEach(section => {
                const title = section.querySelector('.accordion-section-title');
                if (title && title.textContent.includes('Up next:')) {
                    nextRoundSection = section;
                }
            });
            
            if (nextRoundSection) {
                const nextRoundItems = nextRoundSection.querySelector('.accordion-items');
                if (nextRoundItems) {
                    const items = nextRoundItems.querySelectorAll('.accordion-item');
                    if (items.length > 0) {
                        const lastItem = items[items.length - 1];
                        
                        // Calculate height from accordion start to bottom of last item
                        const accordionTop = accordionContent.getBoundingClientRect().top;
                        const lastItemBottom = lastItem.getBoundingClientRect().bottom;
                        const lineHeight = lastItemBottom - accordionTop;
                        
                        step.style.setProperty('--dynamic-line-height', `${lineHeight}px`);
                    }
                }
            }
        }, 100);
        
        // Start the planning animation sequence
        startPlanningAnimation(step);
        
        console.log('📋 Expanded accordion for round:', roundNumber);
    }
}

// Start the planning animation sequence when accordion opens
function startPlanningAnimation(step) {
    const loadingItem = step.querySelector('.accordion-item.loading');
    const loadingIcon = loadingItem?.querySelector('.accordion-icon');
    const loadingText = loadingItem?.querySelector('.accordion-text');
    
    if (!loadingItem || !loadingIcon || !loadingText) return;
    
    // Set initial state with ellipsis
    loadingText.textContent = 'Planning...';
    loadingIcon.classList.add('spinning');
    
    // Store the animation timer on the step element
    step.planningTimer = setTimeout(() => {
        // After 3 seconds, stop animation and change content
        loadingIcon.classList.remove('spinning');
        loadingIcon.style.background = 'url("../images/circle.png") center/contain no-repeat';
        loadingText.textContent = 'Fun question types for a little break';
        
        // Clear the timer reference
        step.planningTimer = null;
    }, 3000);
}

// Clear accordion animations
function clearAccordionAnimations(step) {
    if (step.planningTimer) {
        clearTimeout(step.planningTimer);
        step.planningTimer = null;
    }
    
    // Reset loading item to initial state
    const loadingItem = step.querySelector('.accordion-item.loading');
    const loadingIcon = loadingItem?.querySelector('.accordion-icon');
    const loadingText = loadingItem?.querySelector('.accordion-text');
    
    if (loadingIcon && loadingText) {
        loadingIcon.classList.remove('spinning');
        loadingIcon.style.background = 'url("../images/spinner.png") center/contain no-repeat';
        loadingText.textContent = 'Planning...';
    }
}

// Transform "Make a change" button into input field
function transformButtonToInput(button) {
    const accordionAction = button.parentElement;
    if (!accordionAction) return;
    
    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'make-change-input';
    input.placeholder = 'Make a change';
    input.value = '';
    input.style.opacity = '0';
    input.style.transform = 'scale(0.95)';
    
    // Add input to container (both button and input visible temporarily)
    accordionAction.appendChild(input);
    
    // Animate button out and input in
    button.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    input.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    
    // Start transition
    setTimeout(() => {
        button.style.opacity = '0';
        button.style.transform = 'scale(0.95)';
        input.style.opacity = '1';
        input.style.transform = 'scale(1)';
    }, 10);
    
    // Remove button and focus input after transition
    setTimeout(() => {
        button.remove();
        input.focus();
    }, 220);
    
    // Handle input events
    input.addEventListener('keydown', function(e) {
        e.stopPropagation(); // Prevent event bubbling to accordion
        if (e.key === 'Enter') {
            handleInputSubmit(input);
        } else if (e.key === 'Escape') {
            // Re-enable floating feedback when escaping
            window.floatingFeedbackDisabled = false;
            restoreButton(accordionAction);
        }
    });
    
    input.addEventListener('blur', function(e) {
        e.stopPropagation(); // Prevent event bubbling to accordion
        // Re-enable floating feedback when input loses focus
        setTimeout(() => {
            window.floatingFeedbackDisabled = false;
        }, 150);
        
        // Small delay to allow for potential enter key press
        setTimeout(() => {
            if (input.value.trim()) {
                handleInputSubmit(input);
            } else {
                restoreButton(accordionAction);
            }
        }, 100);
    });
    
    input.addEventListener('focus', function(e) {
        e.stopPropagation(); // Prevent event bubbling to accordion
        // Disable floating feedback when accordion input is focused
        window.floatingFeedbackDisabled = true;
        hideFloatingFeedback();
    });
    
    input.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling to accordion
    });
}

// Handle input submission
function handleInputSubmit(input) {
    const value = input.value.trim();
    if (value) {
        // Find the accordion content container
        const accordionContent = input.closest('.step-accordion-content');
        
        if (accordionContent) {
            // Start the re-planning animation
            startReplanningAnimation(accordionContent, value);
        }
    }
    
    const accordionAction = input.parentElement;
    restoreButton(accordionAction);
    
    // Re-enable floating feedback after accordion input interaction
    // Small delay to allow button restoration to complete
    setTimeout(() => {
        if (typeof window.floatingFeedbackVisible !== 'undefined' && !window.floatingFeedbackVisible) {
            // Only re-enable if floating feedback was not explicitly hidden by scroll
            window.floatingFeedbackDisabled = false;
        }
    }, 500);
}

// Restore the "Make a change" button
function restoreButton(accordionAction) {
    if (!accordionAction) return;
    
    const currentInput = accordionAction.querySelector('.make-change-input');
    
    // Create button element with explicit width to prevent expansion
    const buttonHTML = `
        <button class="make-change-btn" style="opacity: 0; transform: scale(0.95); transition: opacity 0.2s ease, transform 0.2s ease; width: auto; min-width: fit-content;">
            <span class="make-change-icon"></span>
            <span class="make-change-text">Make a change</span>
        </button>
    `;
    
    // Add button to container
    accordionAction.insertAdjacentHTML('beforeend', buttonHTML);
    const newButton = accordionAction.querySelector('.make-change-btn');
    
    if (currentInput) {
        // Animate input out and button in
        currentInput.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        
        setTimeout(() => {
            currentInput.style.opacity = '0';
            currentInput.style.transform = 'scale(0.95)';
            newButton.style.opacity = '1';
            newButton.style.transform = 'scale(1)';
        }, 10);
        
        // Remove input after transition
        setTimeout(() => {
            currentInput.remove();
            // Clean up button transition styles but keep width properties
            newButton.style.transition = '';
            newButton.style.width = '';
            newButton.style.minWidth = '';
            
            // Re-enable floating feedback after accordion input is restored
            setTimeout(() => {
                if (typeof window.floatingFeedbackVisible !== 'undefined' && !window.floatingFeedbackVisible) {
                    // Only re-enable if floating feedback was not explicitly hidden by scroll
                    window.floatingFeedbackDisabled = false;
                }
            }, 300);
        }, 220);
    } else {
        // No input found, just show button immediately
        newButton.style.opacity = '1';
        newButton.style.transform = 'scale(1)';
        newButton.style.transition = '';
        newButton.style.width = '';
        newButton.style.minWidth = '';
        
        // Re-enable floating feedback
        setTimeout(() => {
            if (typeof window.floatingFeedbackVisible !== 'undefined' && !window.floatingFeedbackVisible) {
                window.floatingFeedbackDisabled = false;
            }
        }, 100);
    }
}

// Start the re-planning animation sequence
function startReplanningAnimation(accordionContent, userRequest) {
    // Find the "Up next:" section by looking for the section title
    const allSections = accordionContent.querySelectorAll('.accordion-section');
    
    let nextRoundSection = null;
    allSections.forEach(section => {
        const title = section.querySelector('.accordion-section-title');
        if (title && title.textContent.includes('Up next:')) {
            nextRoundSection = section;
        }
    });
    
    if (!nextRoundSection) return;
    
    const nextRoundItems = nextRoundSection.querySelector('.accordion-items');
    if (!nextRoundItems) return;
    
    // Get the current round number for difficulty calculation
    const step = accordionContent.closest('.path-step');
    const roundNumber = parseInt(step?.dataset.round) || 1;
    
    // Reset vertical line height to 0 first
    step.style.setProperty('--dynamic-line-height', '0px');
    
    // Animate vertical line to the bottom of the first line below "Up next:" text
    setTimeout(() => {
        if (nextRoundSection) {
            const firstItem = nextRoundItems.querySelector('.accordion-item:first-child');
            if (firstItem) {
                const accordionTop = accordionContent.getBoundingClientRect().top;
                const firstItemBottom = firstItem.getBoundingClientRect().bottom;
                const lineHeight = firstItemBottom - accordionTop;
                
                step.style.setProperty('--dynamic-line-height', `${lineHeight}px`);
            }
        }
    }, 50);
    
    // Store original items data
    const originalItems = getNextRoundItemsData(roundNumber);
    
    // Fade out existing items
    const items = nextRoundItems.querySelectorAll('.accordion-item');
    
    items.forEach((item, index) => {
        setTimeout(() => {
            item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            item.style.opacity = '0';
            item.style.transform = 'translateY(-10px)';
        }, index * 100);
    });
    
    // After fade out and line animation to title, start loading sequence
    setTimeout(() => {
        animateItemsWithLoading(nextRoundItems, originalItems, step);
    }, items.length * 100 + 400); // Extra time for line to animate to title level
}

// Get the data for next round items based on round number
function getNextRoundItemsData(roundNumber) {
    return [
        { text: 'Push the ones you know a bit harder', type: 'planned' },
        { text: 'Retry the tricky ones a bit easier', type: 'planned' },
        { text: 'Mix in a couple new terms', type: 'planned' }
    ];
}

// Animate items back in with loading states
function animateItemsWithLoading(container, itemsData, step) {
    // Clear container
    container.innerHTML = '';
    
    // Add items one by one with loading animation
    // Each item appears only after the previous one completes its full cycle
    itemsData.forEach((itemData, index) => {
        setTimeout(() => {
            addLoadingItem(container, itemData, index, step);
        }, index * 2500); // Full cycle time: 2000ms loading + 500ms for text transition
    });
}

// Add a single item with loading state, then transition to final state
function addLoadingItem(container, itemData, index, step) {
    // Create loading item
    const item = document.createElement('div');
    item.className = 'accordion-item loading';
    item.innerHTML = `
        <div class="accordion-icon spinning"></div>
        <span class="accordion-text">Planning next round...</span>
    `;
    
    // Add with fade-in animation
    item.style.opacity = '0';
    item.style.transform = 'translateY(10px)';
    container.appendChild(item);
    
    // Update vertical line height to accommodate this new item
    // Only grow the line starting from the second item (index 1+)
    if (index > 0) {
        setTimeout(() => {
            if (step) {
                const accordionContent = step.querySelector('.step-accordion-content');
                if (accordionContent) {
                    const accordionTop = accordionContent.getBoundingClientRect().top;
                    const itemBottom = item.getBoundingClientRect().bottom;
                    const lineHeight = itemBottom - accordionTop;
                    
                    step.style.setProperty('--dynamic-line-height', `${lineHeight}px`);
                }
            }
        }, 100); // Small delay to ensure item is fully rendered
    }
    
    // Animate in
    setTimeout(() => {
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
    }, 50);
    
    // After 2 seconds, transition to final state
    setTimeout(() => {
        transitionToFinalState(item, itemData);
    }, 2000);
}

// Transition item from loading to final state
function transitionToFinalState(item, itemData) {
    const icon = item.querySelector('.accordion-icon');
    const text = item.querySelector('.accordion-text');
    
    if (!icon || !text) return;
    
    // Remove spinning animation and loading class
    icon.classList.remove('spinning');
    item.classList.remove('loading');
    item.classList.add(itemData.type);
    
    // Update icon based on type
    if (itemData.type === 'planned') {
        icon.style.background = 'url("../images/circle.png") center/contain no-repeat';
    }
    
    // Update text with slight fade effect
    text.style.opacity = '0.5';
    setTimeout(() => {
        text.textContent = itemData.text;
        text.style.transition = 'opacity 0.3s ease';
        text.style.opacity = '1';
    }, 150);
}

// Generate accordion content based on the mockup design
function getAccordionContent(roundNumber) {
    let html = '';
    
    // Last round section removed - no longer showing
    
    // Up next section (show for all rounds)
    html += `
        <div class="accordion-section">
            <h4 class="accordion-section-title">Up next:</h4>
            <div class="accordion-items">
                <div class="accordion-item planned">
                    <div class="accordion-icon"></div>
                    <span class="accordion-text">Push the ones you know a bit harder</span>
                </div>
                <div class="accordion-item planned">
                    <div class="accordion-icon"></div>
                    <span class="accordion-text">Retry the tricky ones a bit easier</span>
                </div>
                <div class="accordion-item loading">
                    <div class="accordion-icon"></div>
                    <span class="accordion-text">Planning...</span>
                </div>
            </div>
        </div>
    `;
    
    // Add "Make a change" button at the bottom
    html += `
        <div class="accordion-action">
            <button class="make-change-btn">
                <span class="make-change-icon"></span>
                <span class="make-change-text">Make a change</span>
            </button>
        </div>
    `;
    
    return html;
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

// Sync current round progress from detailed round progress data
function syncCurrentRoundProgressFromRoundData() {
    const roundProgressData = localStorage.getItem('roundProgressData');
    if (roundProgressData && studyPathData.currentRound) {
        try {
            const roundData = JSON.parse(roundProgressData);
            const currentRoundData = roundData[studyPathData.currentRound];
            
            if (currentRoundData && currentRoundData.progress !== undefined) {
                // Update current round progress from the detailed data
                const detailedProgress = currentRoundData.progress;
                console.log(`Syncing current round ${studyPathData.currentRound} progress: ${studyPathData.currentRoundProgress} → ${detailedProgress}`);
                studyPathData.currentRoundProgress = detailedProgress;
                
                // Also sync from localStorage currentRoundProgress if it's more recent
                const storedProgress = localStorage.getItem('currentRoundProgress');
                if (storedProgress) {
                    const storedProgressNum = parseInt(storedProgress);
                    if (storedProgressNum > detailedProgress) {
                        console.log(`Using more recent localStorage progress: ${storedProgressNum}`);
                        studyPathData.currentRoundProgress = storedProgressNum;
                    }
                }
            }
        } catch (error) {
            console.error('Error syncing current round progress from round data:', error);
        }
    }
}

// Update roundProgress from regular study session data
function updateRoundProgressFromStudyData() {
    // DISABLED: Adaptive learning integration was causing incorrect step styling
    // The adaptive learning system counts completed questions differently than our round system
    // This was causing all steps to appear as "completed" instead of showing proper current/next states
    
    // Skip adaptive learning integration for now to fix step styling issue
    console.log('Skipping adaptive learning integration - using traditional calculation only');
    
    // Fallback to traditional calculation
    // Get regular study progress
    const studyProgress = localStorage.getItem('studyProgress');
    const currentQuestionIndex = localStorage.getItem('currentQuestionIndex');
    const roundProgressData = localStorage.getItem('roundProgressData');
    
    if (studyProgress || currentQuestionIndex || roundProgressData) {
        console.log('Updating roundProgress from traditional study data');
        
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
            
            // Calculate which rounds have progress
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
    // Before saving, check if there's newer progress data from the study screen
    const currentRoundProgressFromStorage = localStorage.getItem('currentRoundProgress');
    const currentRoundNumberFromStorage = localStorage.getItem('currentRoundNumber');
    
    if (currentRoundProgressFromStorage && currentRoundNumberFromStorage) {
        const storedProgress = parseInt(currentRoundProgressFromStorage);
        const storedRoundNumber = parseInt(currentRoundNumberFromStorage);
        
        // Update our data with the most recent from study screen if it's newer
        if (storedRoundNumber === studyPathData.currentRound && storedProgress > studyPathData.currentRoundProgress) {
            console.log(`Merging newer progress from study screen: ${studyPathData.currentRoundProgress} → ${storedProgress}`);
            studyPathData.currentRoundProgress = storedProgress;
        }
        
        if (storedRoundNumber > studyPathData.currentRound) {
            console.log(`Updating current round from study screen: ${studyPathData.currentRound} → ${storedRoundNumber}`);
            studyPathData.currentRound = storedRoundNumber;
        }
    }
    
    localStorage.setItem('studyPathData', JSON.stringify(studyPathData));
}

// Function to mark a round as completed (called from study screen)
function markRoundCompleted(roundNumber) {
    // Dynamic total rounds based on concepts
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
    if (isRoundComplete()) {
        console.log(`Round ${studyPathData.currentRound} completed with ${questionsCompleted} questions/formats`);
        markRoundCompleted(studyPathData.currentRound);
        return; // markRoundCompleted will call updateUI
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

// Test function for debugging adaptive learning progress
window.testStudyPlanProgress = function() {
    console.log('🧪 Testing Study Plan Progress Integration...');
    
    // Check if adaptive learning is available
    const hasAdaptiveLearning = !!window.AdaptiveLearning;
    console.log('🔍 Adaptive Learning Available:', hasAdaptiveLearning);
    
    if (hasAdaptiveLearning) {
        // Load state and get progress
        window.AdaptiveLearning.loadState();
        const adaptiveProgress = getAdaptiveLearningProgress();
        
        console.log('🔍 Adaptive Learning Progress:', adaptiveProgress);
        
        // Show question completion status
        const totalQuestions = 50;
        let completedQuestions = 0;
        const completedList = [];
        
        for (let questionId = 1; questionId <= totalQuestions; questionId++) {
            if (window.AdaptiveLearning.isQuestionCompleted(questionId)) {
                completedQuestions++;
                completedList.push(questionId);
            }
        }
        
        console.log('🔍 Completed Questions:', {
            total: totalQuestions,
            completed: completedQuestions,
            percentage: Math.round((completedQuestions / totalQuestions) * 100),
            completedList: completedList.slice(0, 10) // Show first 10
        });
        
        // Test refresh function
        console.log('🔄 Testing refresh function...');
        refreshAdaptiveLearningProgress();
    } else {
        console.log('❌ Adaptive Learning not available');
        console.log('🔍 Available global objects:', Object.keys(window).filter(key => key.includes('Adaptive')));
    }
    
    // Test traditional progress
    const traditionalProgress = calculateOverallPlanProgress();
    console.log('🔍 Traditional Progress:', traditionalProgress);
    
    // Current UI state
    const progressSummary = document.getElementById('progressSummary');
    const progressPercentageText = document.getElementById('progressPercentageText');
    const circularView = document.getElementById('circularProgressView');
    
    console.log('🔍 Current UI State:', {
        progressSummaryText: progressSummary?.textContent,
        progressSummaryVisible: progressSummary?.style.display !== 'none',
        circularProgressText: progressPercentageText?.textContent,
        hasZeroStateClass: circularView?.classList.contains('zero-state')
    });
};

// Simple test to check if we can update the progress summary at all
window.testProgressSummary = function() {
    console.log('🧪 Testing progress summary element...');
    
    // Get element fresh each time
    const progressElement = document.getElementById('progressSummary');
    
    console.log('Progress element found:', !!progressElement);
    console.log('Current text:', progressElement?.textContent);
    console.log('Current display:', progressElement?.style.display);
    console.log('Computed display:', progressElement ? getComputedStyle(progressElement).display : 'N/A');
    
    if (progressElement) {
        progressElement.style.display = 'block';
        progressElement.textContent = 'TEST: Study plan 50% complete';
        console.log('✅ Directly updated element');
        console.log('New text:', progressElement.textContent);
        console.log('New display:', progressElement.style.display);
    } else {
        console.log('❌ Element not found!');
    }
};

// Force update overview card progress (for testing)
window.forceUpdateProgress = function(percentage = 25) {
    console.log(`🔄 Forcing progress update to ${percentage}%...`);
    
    // Ensure elements are available
    if (!progressSummary) {
        progressSummary = document.getElementById('progressSummary');
        console.log('Re-getting progressSummary:', !!progressSummary);
    }
    
    const circularView = document.getElementById('circularProgressView');
    const overviewTitle = document.querySelector('.overview-title');
    
    console.log('Elements found:', {
        progressSummary: !!progressSummary,
        circularView: !!circularView,
        overviewTitle: !!overviewTitle
    });
    
    // Update progress summary
    if (progressSummary) {
        console.log('Updating progress summary...');
        if (percentage === 0) {
            progressSummary.style.display = 'none';
        } else {
            progressSummary.style.display = 'block';
            progressSummary.textContent = `Study plan ${percentage}% complete`;
        }
        console.log('Progress summary updated:', progressSummary.textContent);
    } else {
        console.log('❌ progressSummary element not found!');
    }
    
    // Update circular progress
    updateCircularProgress(percentage, true);
    
    // Update overview title
    if (overviewTitle) {
        if (percentage === 0) {
            overviewTitle.textContent = "let's get ready for Exam 1. You got this!";
        } else {
            overviewTitle.textContent = 'Keep up the momentum';
        }
        console.log('Overview title updated:', overviewTitle.textContent);
    }
    
    // Update zero state class
    if (circularView) {
        if (percentage === 0) {
            circularView.classList.add('zero-state');
        } else {
            circularView.classList.remove('zero-state');
        }
    }
    
    console.log(`✅ Progress update complete`);
};

// Test what happens when we call the actual update functions
window.testRealUpdate = function() {
    console.log('🔄 Testing actual update functions...');
    
    // Test progress calculations
    console.log('Testing progress calculations:');
    const adaptiveProgress = getAdaptiveLearningProgress();
    const traditionalProgress = calculateOverallPlanProgress();
    
    console.log('Adaptive progress:', adaptiveProgress);
    console.log('Traditional progress:', traditionalProgress);
    
    // Test calling the actual update functions
    console.log('Calling updateProgressSummary()...');
    updateProgressSummary();
    
    console.log('Calling showCircularProgress()...');
    showCircularProgress();
    
    // Check element state after
    const progressElement = document.getElementById('progressSummary');
    console.log('Progress element after update:', {
        exists: !!progressElement,
        text: progressElement?.textContent,
        display: progressElement?.style.display,
        computedDisplay: progressElement ? getComputedStyle(progressElement).display : 'N/A'
    });
};


// Debug overview card update issues
window.debugOverviewCard = function() {
    console.log('🔍 DEBUGGING OVERVIEW CARD...');
    
    // Check data sources
    const studyPathData = localStorage.getItem('studyPathData');
    const dailyProgress = localStorage.getItem('dailyProgress');
    const currentRoundProgress = localStorage.getItem('currentRoundProgress');
    const currentRoundNumber = localStorage.getItem('currentRoundNumber');
    
    console.log('📊 Data Sources:', {
        hasStudyPathData: !!studyPathData,
        hasDailyProgress: !!dailyProgress,
        currentRoundProgress,
        currentRoundNumber,
        studyPathDataParsed: studyPathData ? JSON.parse(studyPathData) : null,
        dailyProgressParsed: dailyProgress ? JSON.parse(dailyProgress) : null
    });
    
    // Test progress calculations
    const adaptiveProgress = getAdaptiveLearningProgress();
    const traditionalProgress = calculateOverallPlanProgress();
    
    console.log('🧮 Progress Calculations:', {
        adaptiveProgress,
        traditionalProgress,
        studyPathDataGlobal: window.studyPathData || 'Not available'
    });
    
    // Check DOM elements
    const progressSummary = document.getElementById('progressSummary');
    const progressPercentageText = document.getElementById('progressPercentageText');
    const circularView = document.getElementById('circularProgressView');
    const overviewTitle = document.querySelector('.overview-title');
    
    console.log('🎯 DOM Elements:', {
        progressSummary: {
            exists: !!progressSummary,
            text: progressSummary?.textContent,
            visible: progressSummary?.style.display !== 'none',
            computedDisplay: progressSummary ? getComputedStyle(progressSummary).display : 'N/A'
        },
        progressPercentageText: {
            exists: !!progressPercentageText,
            text: progressPercentageText?.textContent
        },
        circularView: {
            exists: !!circularView,
            hasZeroState: circularView?.classList.contains('zero-state'),
            display: circularView?.style.display,
            computedDisplay: circularView ? getComputedStyle(circularView).display : 'N/A'
        },
        overviewTitle: {
            exists: !!overviewTitle,
            text: overviewTitle?.textContent
        }
    });
    
    // Force update functions
    console.log('🔄 Force updating progress...');
    updateProgressSummary();
    showCircularProgress();
    
    console.log('✅ Debug complete. Check elements again:');
    setTimeout(() => {
        console.log('📊 Post-update state:', {
            progressSummaryText: progressSummary?.textContent,
            progressSummaryVisible: progressSummary?.style.display !== 'none',
            circularProgressText: progressPercentageText?.textContent,
            overviewTitleText: overviewTitle?.textContent
        });
    }, 500);
};

// DISABLED: This debug function was applying !important styles that interfered with normal operation
/*
window.debugProgressElements = function() {
    console.log('🔍 COMPREHENSIVE PROGRESS ELEMENTS DEBUG');
    console.log('=====================================');
    
    // Check all path steps first
    const allSteps = document.querySelectorAll('.path-step');
    const currentSteps = document.querySelectorAll('.path-step.current');
    
    console.log(`📊 Total steps: ${allSteps.length}, Current steps: ${currentSteps.length}`);
    console.log(`🎯 StudyPathData:`, {
        currentRound: studyPathData.currentRound,
        currentRoundProgress: studyPathData.currentRoundProgress,
        questionsPerRound: studyPathData.questionsPerRound,
        completedRounds: studyPathData.completedRounds
    });
    
    if (currentSteps.length === 0) {
        console.log('❌ NO CURRENT STEPS FOUND! This is the root issue.');
        console.log('🔍 Checking all steps for debugging:');
        
        allSteps.forEach((step, index) => {
            const roundNumber = step.dataset.round;
            const classes = Array.from(step.classList);
            console.log(`Step ${index + 1} (Round ${roundNumber}):`, {
                classes: classes,
                isCompleted: classes.includes('completed'),
                isCurrent: classes.includes('current'),
                isNext: classes.includes('next')
            });
        });
        return;
    }
    
    currentSteps.forEach((step, index) => {
        const roundNumber = step.dataset.round;
        console.log(`\n🎯 CURRENT STEP ${index + 1} (Round ${roundNumber}) ANALYSIS:`);
        console.log('----------------------------------------');
        
        // Check all progress elements
        const stepProgress = step.querySelector('.step-progress');
        const stepProgressBar = step.querySelector('.step-progress-bar');
        const stepProgressFill = step.querySelector('.step-progress-fill');
        const stepProgressText = step.querySelector('.step-progress-text');
        
        console.log('📋 Element Existence:', {
            stepProgress: !!stepProgress,
            stepProgressBar: !!stepProgressBar,
            stepProgressFill: !!stepProgressFill,
            stepProgressText: !!stepProgressText
        });
        
        if (!stepProgress) {
            console.log('❌ CRITICAL: .step-progress element missing!');
            return;
        }
        
        // Check CSS classes and styles
        const hasProgressClass = stepProgress.classList.contains('has-progress');
        const progressStyles = getComputedStyle(stepProgress);
        
        console.log('🎨 Progress Container Styles:', {
            hasProgressClass: hasProgressClass,
            display: progressStyles.display,
            visibility: progressStyles.visibility,
            opacity: progressStyles.opacity,
            width: progressStyles.width,
            height: progressStyles.height,
            marginTop: progressStyles.marginTop,
            inlineDisplay: stepProgress.style.display,
            classList: Array.from(stepProgress.classList)
        });
        
        if (stepProgressBar) {
            const barStyles = getComputedStyle(stepProgressBar);
            console.log('🎨 Progress Bar Background Styles:', {
                display: barStyles.display,
                width: barStyles.width,
                height: barStyles.height,
                background: barStyles.backgroundColor,
                borderRadius: barStyles.borderRadius,
                inlineStyles: {
                    display: stepProgressBar.style.display,
                    width: stepProgressBar.style.width,
                    height: stepProgressBar.style.height,
                    background: stepProgressBar.style.background
                }
            });
        }
        
        if (stepProgressFill) {
            const fillStyles = getComputedStyle(stepProgressFill);
            console.log('🎨 Progress Fill Styles:', {
                display: fillStyles.display,
                width: fillStyles.width,
                height: fillStyles.height,
                background: fillStyles.backgroundColor,
                inlineStyles: {
                    display: stepProgressFill.style.display,
                    width: stepProgressFill.style.width,
                    height: stepProgressFill.style.height,
                    background: stepProgressFill.style.background
                }
            });
        }
        
        if (stepProgressText) {
            const textStyles = getComputedStyle(stepProgressText);
            console.log('🎨 Progress Text Styles:', {
                display: textStyles.display,
                visibility: textStyles.visibility,
                opacity: textStyles.opacity,
                color: textStyles.color,
                fontSize: textStyles.fontSize,
                content: stepProgressText.textContent,
                inlineStyles: {
                    display: stepProgressText.style.display,
                    opacity: stepProgressText.style.opacity,
                    visibility: stepProgressText.style.visibility,
                    color: stepProgressText.style.color
                }
            });
        }
        
        console.log('\n🔧 APPLYING FIXES...');
        
        // Apply all the fixes
        stepProgress.classList.add('has-progress');
        stepProgress.style.display = 'flex !important';
        stepProgress.style.alignItems = 'center';
        stepProgress.style.gap = '12px';
        stepProgress.style.marginTop = '8px';
        stepProgress.style.visibility = 'visible !important';
        stepProgress.style.opacity = '1 !important';
        
        if (stepProgressBar) {
            stepProgressBar.style.display = 'block !important';
            stepProgressBar.style.width = '88px';
            stepProgressBar.style.height = '8px';
            stepProgressBar.style.borderRadius = '4px';
            stepProgressBar.style.background = 'var(--color-gray-200)';
        }
        
        if (stepProgressFill) {
            const progressPercentage = calculateProgressPercentage();
            stepProgressFill.style.display = 'block !important';
            stepProgressFill.style.height = '100%';
            stepProgressFill.style.borderRadius = '4px';
            
            if (progressPercentage === 0) {
                stepProgressFill.style.width = '8px !important';
                stepProgressFill.style.background = 'var(--color-gray-500) !important';
            } else {
                stepProgressFill.style.width = `${progressPercentage}% !important`;
                stepProgressFill.style.background = 'var(--sys-interactive-bg-primary-default) !important';
            }
        }
        
        if (stepProgressText) {
            const progressPercentage = calculateProgressPercentage();
            stepProgressText.textContent = `${Math.round(progressPercentage)}% complete`;
            stepProgressText.style.display = 'inline-block !important';
            stepProgressText.style.opacity = '1 !important';
            stepProgressText.style.visibility = 'visible !important';
            stepProgressText.style.color = progressPercentage === 0 ? 'var(--color-gray-500)' : 'var(--sys-text-highlight)';
            stepProgressText.style.fontSize = '14px';
            stepProgressText.style.fontWeight = '600';
            stepProgressText.style.marginLeft = '12px';
        }
        
        console.log('✅ All fixes applied with !important declarations');
        
        // Check final computed styles
        setTimeout(() => {
            const finalProgressStyles = getComputedStyle(stepProgress);
            const finalFillStyles = stepProgressFill ? getComputedStyle(stepProgressFill) : null;
            const finalTextStyles = stepProgressText ? getComputedStyle(stepProgressText) : null;
            
            console.log('\n📊 FINAL COMPUTED STYLES AFTER FIXES:');
            console.log('Container:', {
                display: finalProgressStyles.display,
                visibility: finalProgressStyles.visibility,
                opacity: finalProgressStyles.opacity
            });
            if (finalFillStyles) {
                console.log('Fill:', {
                    display: finalFillStyles.display,
                    width: finalFillStyles.width,
                    background: finalFillStyles.backgroundColor
                });
            }
            if (finalTextStyles) {
                console.log('Text:', {
                    display: finalTextStyles.display,
                    visibility: finalTextStyles.visibility,
                    opacity: finalTextStyles.opacity,
                    content: stepProgressText.textContent
                });
            }
        }, 100);
    });
    
    console.log('\n🔄 Complete! Check the current step for progress elements.');
};
*/

// DISABLED: This debug function was applying !important styles that interfered with normal operation
/*
window.fixZeroWidthFills = function() {
    console.log('🔧 FIXING 0% WIDTH PROGRESS FILLS');
    console.log('==================================');
    
    const currentSteps = document.querySelectorAll('.path-step.current');
    
    currentSteps.forEach((step, index) => {
        const stepProgressFill = step.querySelector('.step-progress-fill');
        const stepProgressBar = step.querySelector('.step-progress-bar');
        const stepProgress = step.querySelector('.step-progress');
        
        if (!stepProgressFill) {
            console.log('❌ No step-progress-fill found');
            return;
        }
        
        const currentWidth = stepProgressFill.style.width;
        const progressPercentage = calculateProgressPercentage();
        
        console.log('🎯 Current fill state:', {
            currentStyleWidth: currentWidth,
            progressPercentage: progressPercentage,
            shouldShow8px: progressPercentage === 0
        });
        
        // Clear any existing width styles
        stepProgressFill.style.removeProperty('width');
        
        // Apply the correct width based on progress
        if (progressPercentage === 0) {
            // 0% state - show 8px gray bar
            stepProgressFill.style.width = '8px';
            stepProgressFill.style.background = 'var(--color-gray-500)';
            if (stepProgressBar) stepProgressBar.style.background = 'var(--color-gray-200)';
            console.log('✅ Applied 8px width for 0% state');
        } else {
            // Progress state - show percentage
            stepProgressFill.style.width = `${progressPercentage}%`;
            stepProgressFill.style.background = 'var(--sys-interactive-bg-primary-default)';
            if (stepProgressBar) stepProgressBar.style.background = 'var(--color-twilight-200)';
            console.log(`✅ Applied ${progressPercentage}% width for progress state`);
        }
        
        // Ensure visibility
        stepProgressFill.style.display = 'block';
        stepProgressFill.style.height = '100%';
        stepProgressFill.style.borderRadius = '4px';
        
        if (stepProgress) {
            stepProgress.style.display = 'flex';
            stepProgress.classList.add('has-progress');
        }
        
        console.log('📊 Final fill width:', stepProgressFill.style.width);
    });
};
*/

// DISABLED: This debug function was applying !important styles that interfered with normal operation
/*
window.fixProgressFill = function() {
    console.log('🔧 TARGETED PROGRESS FILL FIX');
    console.log('=============================');
    
    // First run the simple width fix
    fixZeroWidthFills();
    
    const currentSteps = document.querySelectorAll('.path-step.current');
    
    currentSteps.forEach((step, index) => {
        const stepProgressFill = step.querySelector('.step-progress-fill');
        const stepProgressBar = step.querySelector('.step-progress-bar');
        const stepProgress = step.querySelector('.step-progress');
        
        if (!stepProgressFill) {
            console.log('❌ No step-progress-fill found');
            return;
        }
        
        console.log('🎯 Applying additional fixes for current step...');
        
        const progressPercentage = calculateProgressPercentage();
        
        // Apply aggressive styling to ensure visibility
        if (progressPercentage === 0) {
            // 0% state - show 8px gray bar with absolute positioning
            stepProgressFill.style.cssText = `
                display: block !important;
                width: 8px !important;
                height: 100% !important;
                background: var(--color-gray-500) !important;
                border-radius: 4px !important;
                opacity: 1 !important;
                visibility: visible !important;
            `;
        } else {
            // Progress state - show percentage
            stepProgressFill.style.cssText = `
                display: block !important;
                width: ${progressPercentage}% !important;
                height: 100% !important;
                background: var(--sys-interactive-bg-primary-default) !important;
                border-radius: 4px !important;
                opacity: 1 !important;
                visibility: visible !important;
            `;
        }
        
        console.log('✅ Applied final styling:', {
            progressPercentage: progressPercentage,
            width: progressPercentage === 0 ? '8px' : `${progressPercentage}%`
        });
        
        // Double-check the computed styles
        setTimeout(() => {
            const computedFillStyles = getComputedStyle(stepProgressFill);
            console.log('📊 Final computed fill styles:', {
                display: computedFillStyles.display,
                width: computedFillStyles.width,
                height: computedFillStyles.height,
                background: computedFillStyles.backgroundColor,
                opacity: computedFillStyles.opacity,
                visibility: computedFillStyles.visibility
            });
        }, 100);
    });
};
*/

// DISABLED: This debug function was calling other disabled functions that applied !important styles
/*
window.debugCurrentStep = function() {
    console.log('🔍 DEBUG: Current step state check - running comprehensive debug...');
    // These functions have been disabled due to !important style conflicts
    // debugProgressElements();
    // fixProgressFill();
};
*/

// Debug function to check studyPathData values
window.debugStudyPathData = function() {
    console.log('🔍 DEBUG: Current studyPathData state:');
    console.log('========================================');
    console.log('studyPathData:', JSON.stringify(studyPathData, null, 2));
    console.log('\nKey values:');
    console.log('- currentRound:', studyPathData.currentRound);
    console.log('- completedRounds:', studyPathData.completedRounds);
    console.log('- currentRoundProgress:', studyPathData.currentRoundProgress);
    console.log('- concepts length:', studyPathData.concepts?.length);
    
    console.log('\nLocalStorage values:');
    console.log('- currentRoundNumber:', localStorage.getItem('currentRoundNumber'));
    console.log('- currentRoundProgress:', localStorage.getItem('currentRoundProgress'));
    console.log('- studyPathData:', localStorage.getItem('studyPathData'));
    
    console.log('\nStep states for each round:');
    const conceptCount = studyPathData.concepts?.length || 7;
    for (let roundNumber = 1; roundNumber <= conceptCount; roundNumber++) {
        const isCompleted = roundNumber <= studyPathData.completedRounds;
        const isCurrent = roundNumber === studyPathData.currentRound;
        const isNext = roundNumber > studyPathData.currentRound;
        console.log(`Round ${roundNumber}: ${isCompleted ? 'COMPLETED' : isCurrent ? 'CURRENT' : isNext ? 'NEXT' : 'UNKNOWN'}`);
    }
};

// Debug function to manually trigger step updates and see debug output
window.debugUpdateSteps = function() {
    console.log('🔄 DEBUG: Manually triggering updatePathSteps...');
    updatePathSteps();
};

// Force load progress data from study session
function forceLoadProgressFromStudySession() {
    console.log('🚀 FORCE LOADING progress from study session');
    
    // Get all relevant localStorage keys
    const currentRoundProgressLS = localStorage.getItem('currentRoundProgress');
    const currentRoundNumberLS = localStorage.getItem('currentRoundNumber');
    const studyPathDataLS = localStorage.getItem('studyPathData');
    const roundProgressDataLS = localStorage.getItem('roundProgressData');
    
    console.log('📁 Study session localStorage data:', {
        currentRoundProgress: currentRoundProgressLS,
        currentRoundNumber: currentRoundNumberLS,
        studyPathData: studyPathDataLS ? JSON.parse(studyPathDataLS) : null,
        roundProgressData: roundProgressDataLS ? JSON.parse(roundProgressDataLS) : null
    });
    
    // Directly sync the most recent values
    if (currentRoundNumberLS) {
        studyPathData.currentRound = parseInt(currentRoundNumberLS);
    }
    
    if (currentRoundProgressLS) {
        studyPathData.currentRoundProgress = parseInt(currentRoundProgressLS);
    }
    
    // Merge studyPathData from localStorage if available
    if (studyPathDataLS) {
        try {
            const lsStudyPathData = JSON.parse(studyPathDataLS);
            Object.assign(studyPathData, lsStudyPathData, {
                // Always prioritize direct localStorage values
                currentRound: parseInt(currentRoundNumberLS) || lsStudyPathData.currentRound,
                currentRoundProgress: parseInt(currentRoundProgressLS) || lsStudyPathData.currentRoundProgress
            });
        } catch (e) {
            console.warn('Error parsing studyPathData from localStorage:', e);
        }
    }
    
    console.log('✅ Force loaded progress data:', {
        currentRound: studyPathData.currentRound,
        currentRoundProgress: studyPathData.currentRoundProgress,
        completedRounds: studyPathData.completedRounds
    });
}

// Comprehensive progress debug function
window.debugProgressSync = function() {
    console.log('🔍 COMPREHENSIVE PROGRESS DEBUG');
    
    // Check all localStorage keys from study session
    const localStorage_keys = [
        'currentRoundNumber',
        'currentRoundProgress', 
        'studyPathData',
        'roundProgressData',
        'studyProgress'
    ];
    
    console.log('📁 localStorage Data:');
    localStorage_keys.forEach(key => {
        const value = localStorage.getItem(key);
        try {
            console.log(`${key}:`, value ? JSON.parse(value) : value);
        } catch (e) {
            console.log(`${key}:`, value);
        }
    });
    
    // Check current studyPathData state
    console.log('🎯 Current studyPathData:', studyPathData);
    
    // Check calculated progress
    const calculatedProgress = calculateOverallPlanProgress();
    console.log('📊 Calculated overall progress:', calculatedProgress);
    
    // Force refresh all progress data
    console.log('🔄 Force refreshing all progress data...');
    forceLoadProgressFromStudySession();
    loadStudyPathData();
    updateRoundProgressFromStudyData();
    syncCurrentRoundProgressFromRoundData();
    
    console.log('📊 After refresh - studyPathData:', studyPathData);
    console.log('📊 After refresh - calculated progress:', calculateOverallPlanProgress());
    
    // Force UI update
    updateOverviewCardProgress();
    updateUI();
    
    console.log('✅ Progress sync debug complete');
};

// Placeholder function for diagnostic completion (legacy compatibility)
function markDiagnosticCompleted(diagnosticNumber) {
    console.log(`Diagnostic ${diagnosticNumber} completed (placeholder function)`);
    // This function is kept for compatibility but diagnostics have been removed
}

// Export functions for external use
window.StudyPath = {
    markRoundCompleted,
    updateRoundProgress,
    markDiagnosticCompleted,
    getCurrentRound: () => studyPathData.currentRound,
    getCompletedRounds: () => studyPathData.completedRounds,
    refreshAdaptiveLearningProgress, // Export for external testing
    getAdaptiveLearningProgress, // Export for external testing
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

// Floating Feedback Input Scroll Detection
let floatingFeedbackVisible = false;
let scrollDirection = 'up';
let lastScrollY = 0; // Declare first, initialize later

function initFloatingFeedback() {
    const floatingFeedback = document.getElementById('floatingFeedback');
    if (!floatingFeedback) return;

    // Initialize floating feedback state
    window.floatingFeedbackDisabled = false;
    
    // Initialize scroll position after DOM is ready
    lastScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    let scrollTimeout;

    function handleScroll() {
        const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        
        // Determine scroll direction
        if (currentScrollY > lastScrollY) {
            scrollDirection = 'down';
        } else if (currentScrollY < lastScrollY) {
            scrollDirection = 'up';
        }
        lastScrollY = currentScrollY;

        // Clear previous timeout
        clearTimeout(scrollTimeout);

        // Add small delay to avoid rapid toggling
        scrollTimeout = setTimeout(() => {
            const shouldShow = currentScrollY > 100 && scrollDirection === 'down';
            const shouldHide = currentScrollY <= 50 || scrollDirection === 'up';

            if (shouldShow && !floatingFeedbackVisible) {
                showFloatingFeedback();
            } else if (shouldHide && floatingFeedbackVisible) {
                hideFloatingFeedback();
            }
        }, 100);
    }

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Handle input interactions
    const floatingInput = floatingFeedback.querySelector('.floating-input');
    if (floatingInput) {
        floatingInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                handleFloatingInputSubmit(floatingInput);
            } else if (e.key === 'Escape') {
                floatingInput.blur();
            }
        });

        floatingInput.addEventListener('focus', function() {
            // Keep visible while focused
            clearTimeout(hideTimeout);
        });

        floatingInput.addEventListener('blur', function() {
            // Small delay to allow for submission
            setTimeout(() => {
                if (floatingInput.value.trim()) {
                    handleFloatingInputSubmit(floatingInput);
                }
            }, 100);
        });
    }
}

let hideTimeout;

function showFloatingFeedback() {
    const floatingFeedback = document.getElementById('floatingFeedback');
    if (!floatingFeedback) return;

    // Don't show floating feedback if disabled (accordion input is active)
    if (window.floatingFeedbackDisabled) {
        return;
    }

    clearTimeout(hideTimeout);
    floatingFeedbackVisible = true;
    
    // Remove any existing animation classes
    floatingFeedback.classList.remove('exiting');
    
    // Add visible class and entering animation
    floatingFeedback.classList.add('visible', 'entering');
    
    // Remove entering class after animation
    setTimeout(() => {
        floatingFeedback.classList.remove('entering');
    }, 400);
}

function hideFloatingFeedback() {
    const floatingFeedback = document.getElementById('floatingFeedback');
    if (!floatingFeedback) return;

    floatingFeedbackVisible = false;
    
    // Add exiting animation
    floatingFeedback.classList.add('exiting');
    floatingFeedback.classList.remove('entering');
    
    // Remove visible class after animation
    hideTimeout = setTimeout(() => {
        floatingFeedback.classList.remove('visible', 'exiting');
    }, 400);
}

function handleFloatingInputSubmit(input) {
    const value = input.value.trim();
    if (value) {
        console.log('Floating feedback submitted:', value);
        
        // Show success message
        showToast('Thanks for your feedback! We\'ll use this to improve your experience.', 4000);
        
        // Clear input
        input.value = '';
        
        // Hide feedback after submission
        setTimeout(() => {
            hideFloatingFeedback();
        }, 1000);
    }
}

