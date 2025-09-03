// Progress Debug & Fix Module
// This module helps diagnose and fix progress bar issues

console.log('🔧 Progress Debug Module Loaded');

// Ensure we don't interfere with existing functionality
// by wrapping everything in a namespace and being defensive
(function() {
    'use strict';

// Comprehensive diagnostic function
window.diagnoseProgressIssues = function() {
    try {
        console.log('🩺 PROGRESS DIAGNOSIS STARTING...');
        console.log('=====================================');
        
        // 1. Check DOM elements
        console.log('1. DOM ELEMENTS CHECK:');
        const homeProgressFill = document.querySelector('.progress-fill');
        const homeProgressText = document.querySelector('.progress-text');
        const studyPlanProgressSummary = document.getElementById('progressSummary');
        const studyPlanProgressRing = document.querySelector('.progress-ring-fill');
        const studyPlanProgressText = document.getElementById('progressPercentageText');
    
    console.log('   Home page elements:', {
        progressFill: !!homeProgressFill,
        progressText: !!homeProgressText,
        currentWidth: homeProgressFill?.style.width,
        currentText: homeProgressText?.textContent
    });
    
    console.log('   Study plan elements:', {
        progressSummary: !!studyPlanProgressSummary,
        progressRing: !!studyPlanProgressRing,
        progressText: !!studyPlanProgressText,
        summaryText: studyPlanProgressSummary?.textContent,
        summaryVisible: studyPlanProgressSummary?.style.display !== 'none',
        ringOffset: studyPlanProgressRing?.style.strokeDashoffset,
        centerText: studyPlanProgressText?.textContent
    });
    
    // 2. Check localStorage data
    console.log('2. LOCALSTORAGE DATA CHECK:');
    const studyPathData = localStorage.getItem('studyPathData');
    const dailyProgress = localStorage.getItem('dailyProgress');
    const onboardingConcepts = localStorage.getItem('onboarding_concepts');
    const currentRoundProgress = localStorage.getItem('currentRoundProgress');
    const currentRoundNumber = localStorage.getItem('currentRoundNumber');
    
    console.log('   Raw data availability:', {
        hasStudyPathData: !!studyPathData,
        hasDailyProgress: !!dailyProgress,
        hasOnboardingConcepts: !!onboardingConcepts,
        hasCurrentRoundProgress: !!currentRoundProgress,
        hasCurrentRoundNumber: !!currentRoundNumber
    });
    
    // Parse and show data details
    try {
        if (studyPathData) {
            const parsed = JSON.parse(studyPathData);
            console.log('   Study path data:', parsed);
        }
        if (dailyProgress) {
            const parsed = JSON.parse(dailyProgress);
            console.log('   Daily progress data:', parsed);
        }
        if (onboardingConcepts) {
            const parsed = JSON.parse(onboardingConcepts);
            console.log('   Onboarding concepts:', parsed);
        }
    } catch (error) {
        console.error('   Error parsing localStorage data:', error);
    }
    
    // 3. Check adaptive learning system
    console.log('3. ADAPTIVE LEARNING CHECK:');
    const hasAdaptiveLearning = !!window.AdaptiveLearning;
    console.log('   AdaptiveLearning available:', hasAdaptiveLearning);
    
    if (hasAdaptiveLearning) {
        try {
            window.AdaptiveLearning.loadState();
            let completedCount = 0;
            for (let i = 1; i <= 50; i++) {
                if (window.AdaptiveLearning.isQuestionCompleted(i)) {
                    completedCount++;
                }
            }
            const adaptiveProgress = Math.round((completedCount / 50) * 100);
            console.log('   Adaptive learning state:', {
                totalQuestions: 50,
                completedQuestions: completedCount,
                progressPercentage: adaptiveProgress
            });
        } catch (error) {
            console.error('   Adaptive learning error:', error);
        }
    }
    
    // 4. Test progress calculation functions
    console.log('4. PROGRESS CALCULATION TEST:');
    
    // Test home page function (if available)
    if (typeof calculateOverallPlanProgress === 'function') {
        try {
            const homePageProgress = calculateOverallPlanProgress();
            console.log('   Home page calculateOverallPlanProgress():', homePageProgress);
        } catch (error) {
            console.error('   Home page progress calculation error:', error);
        }
    }
    
    // Test study plan function (if available)
    if (typeof window.StudyPath?.getAdaptiveLearningProgress === 'function') {
        try {
            const studyPlanProgress = window.StudyPath.getAdaptiveLearningProgress();
            console.log('   Study plan getAdaptiveLearningProgress():', studyPlanProgress);
        } catch (error) {
            console.error('   Study plan progress calculation error:', error);
        }
    }
    
        console.log('=====================================');
        console.log('🩺 DIAGNOSIS COMPLETE - Check logs above');
        
        return {
            domElements: {
                homeProgressFill: !!homeProgressFill,
                homeProgressText: !!homeProgressText,
                studyPlanElements: !!studyPlanProgressSummary
            },
            dataAvailable: {
                studyPathData: !!studyPathData,
                dailyProgress: !!dailyProgress,
                onboardingConcepts: !!onboardingConcepts
            },
            adaptiveLearning: hasAdaptiveLearning
        };
    } catch (error) {
        console.error('❌ Error during diagnosis (non-critical):', error);
        return { error: error.message };
    }
};

// Force update home page progress
window.forceUpdateHomeProgress = function(percentage = null) {
    console.log(`🔧 Force updating home page progress...`);
    
    // If no percentage provided, calculate it
    let progress = percentage;
    if (progress === null) {
        if (typeof calculateOverallPlanProgress === 'function') {
            progress = calculateOverallPlanProgress();
        } else {
            console.warn('calculateOverallPlanProgress function not available');
            progress = 0;
        }
    }
    
    console.log(`🔧 Setting home progress to ${progress}%`);
    
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    const progressContainer = document.querySelector('.progress-container');
    
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
        console.log('✅ Updated progress fill width');
    } else {
        console.error('❌ Progress fill element not found');
    }
    
    if (progressText) {
        progressText.textContent = `${progress}% complete`;
        console.log('✅ Updated progress text');
    } else {
        console.error('❌ Progress text element not found');
    }
    
    if (progressContainer) {
        if (progress === 0) {
            progressContainer.classList.add('zero-state');
        } else {
            progressContainer.classList.remove('zero-state');
        }
        console.log('✅ Updated progress container state');
    }
    
    return progress;
};

// Force update study plan progress
window.forceUpdateStudyPlanProgress = function(percentage = null) {
    console.log(`🔧 Force updating study plan progress...`);
    
    // If no percentage provided, calculate it
    let progress = percentage;
    if (progress === null) {
        // Try to get progress from study plan functions
        if (typeof window.StudyPath?.getAdaptiveLearningProgress === 'function') {
            progress = window.StudyPath.getAdaptiveLearningProgress() || 0;
        } else if (typeof calculateOverallPlanProgress === 'function') {
            progress = calculateOverallPlanProgress();
        } else {
            console.warn('No progress calculation function available');
            progress = 0;
        }
    }
    
    console.log(`🔧 Setting study plan progress to ${progress}%`);
    
    const progressSummary = document.getElementById('progressSummary');
    const progressRingFill = document.querySelector('.progress-ring-fill');
    const progressPercentageText = document.getElementById('progressPercentageText');
    const circularView = document.getElementById('circularProgressView');
    const overviewTitle = document.querySelector('.overview-title');
    
    // Update circular progress ring
    if (progressRingFill) {
        const radius = 38;
        const circumference = 2 * Math.PI * radius;
        const minVisibleProgress = 2;
        const adjustedPercentage = Math.max(progress, progress === 0 ? minVisibleProgress : progress);
        const targetOffset = circumference - (adjustedPercentage / 100) * circumference;
        
        progressRingFill.style.strokeDasharray = `${circumference} ${circumference}`;
        progressRingFill.style.strokeDashoffset = targetOffset;
        progressRingFill.classList.remove('animate'); // No animation for manual update
        console.log('✅ Updated circular progress ring');
    }
    
    // Update center percentage text
    if (progressPercentageText) {
        progressPercentageText.textContent = `${Math.round(progress)}%`;
        console.log('✅ Updated center percentage text');
    }
    
    // Update progress summary text
    if (progressSummary) {
        if (progress === 0) {
            progressSummary.style.display = 'none';
        } else {
            progressSummary.style.display = 'block';
            progressSummary.textContent = `Study plan ${progress}% complete`;
        }
        console.log('✅ Updated progress summary');
    }
    
    // Update zero state styling
    if (circularView) {
        if (progress === 0) {
            circularView.classList.add('zero-state');
        } else {
            circularView.classList.remove('zero-state');
        }
        console.log('✅ Updated zero state styling');
    }
    
    // Update overview title
    if (overviewTitle) {
        if (progress === 0) {
            overviewTitle.textContent = "let's get ready for Exam 1. You got this!";
        } else {
            overviewTitle.textContent = 'Keep up the momentum';
        }
        console.log('✅ Updated overview title');
    }
    
    return progress;
};

// Create mock data for testing
window.createMockProgressData = function(completedRounds = 1, currentRoundProgress = 3) {
    console.log('🧪 Creating mock progress data...');
    
    const mockData = {
        totalRounds: 8,
        questionsPerRound: 7,
        currentRound: completedRounds + 1,
        completedRounds: completedRounds,
        currentRoundProgress: currentRoundProgress,
        totalQuestionsAnswered: (completedRounds * 7) + currentRoundProgress,
        accuracy: 85,
        diagnosticTaken: completedRounds > 0,
        diagnosticMidTaken: completedRounds > 2,
        diagnosticFinalTaken: false,
        concepts: ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Metabolism', 'Reproduction', 'Development'],
        courseName: 'BIOL 210'
    };
    
    // Save to localStorage
    localStorage.setItem('studyPathData', JSON.stringify(mockData));
    
    // Create daily progress data
    const today = new Date().toISOString().split('T')[0];
    const dailyData = {};
    dailyData[today] = {
        questions: currentRoundProgress,
        totalQuestions: (completedRounds * 7) + currentRoundProgress,
        timestamp: Date.now()
    };
    localStorage.setItem('dailyProgress', JSON.stringify(dailyData));
    
    // Create onboarding concepts
    localStorage.setItem('onboarding_concepts', JSON.stringify(mockData.concepts));
    localStorage.setItem('onboarding_course', mockData.courseName);
    
    console.log('✅ Mock data created:', mockData);
    console.log('🔄 Now call forceUpdateHomeProgress() and forceUpdateStudyPlanProgress() to see the progress bars update');
    
    return mockData;
};

// Reset all progress data
window.resetAllProgressData = function() {
    console.log('🗑️ Resetting all progress data...');
    
    localStorage.removeItem('studyPathData');
    localStorage.removeItem('dailyProgress');
    localStorage.removeItem('onboarding_concepts');
    localStorage.removeItem('onboarding_course');
    localStorage.removeItem('currentRoundProgress');
    localStorage.removeItem('currentRoundNumber');
    
    // Clear adaptive learning if available
    if (window.AdaptiveLearning && typeof window.AdaptiveLearning.clearState === 'function') {
        window.AdaptiveLearning.clearState();
    }
    
    console.log('✅ All progress data reset');
    console.log('🔄 Reload the page to see 0% state');
};

// Test existing functionality
window.testExistingFunctionality = function() {
    console.log('🧪 Testing existing functionality...');
    
    // Test if more-options button exists and has event listeners
    const moreOptionsBtn = document.querySelector('.jump-back-card .more-options');
    console.log('More options button found:', !!moreOptionsBtn);
    
    if (moreOptionsBtn) {
        console.log('More options button classes:', moreOptionsBtn.className);
        console.log('More options button parent:', moreOptionsBtn.parentElement?.className);
        
        // Test if showBottomSheet function exists
        console.log('showBottomSheet function exists:', typeof window.showBottomSheet);
        console.log('StudyApp.showBottomSheet exists:', typeof window.StudyApp?.showBottomSheet);
        
        // Test bottom sheet element
        const bottomSheet = document.getElementById('bottomSheet');
        console.log('Bottom sheet element found:', !!bottomSheet);
        
        if (bottomSheet) {
            console.log('Bottom sheet classes:', bottomSheet.className);
        }
    }
    
    // Check for any JavaScript errors in console
    console.log('💡 If more-options button still not working:');
    console.log('1. Check browser console for JavaScript errors');
    console.log('2. Try clicking directly: document.querySelector(".more-options").click()');
    console.log('3. Or try: StudyApp.showBottomSheet() or showBottomSheet()');
    console.log('4. Or try: manuallyOpenBottomSheet()');
};

// Manually open the bottom sheet (bypass any event listener issues)
window.manuallyOpenBottomSheet = function() {
    console.log('🛠️ Manually opening bottom sheet...');
    
    const bottomSheet = document.getElementById('bottomSheet');
    if (!bottomSheet) {
        console.error('❌ Bottom sheet element not found!');
        return false;
    }
    
    // Manually add the 'show' class and prevent background scrolling
    bottomSheet.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    console.log('✅ Bottom sheet opened manually');
    console.log('🔧 To close it, run: manuallyCloseBottomSheet()');
    
    return true;
};

// Manually close the bottom sheet
window.manuallyCloseBottomSheet = function() {
    console.log('🛠️ Manually closing bottom sheet...');
    
    const bottomSheet = document.getElementById('bottomSheet');
    if (!bottomSheet) {
        console.error('❌ Bottom sheet element not found!');
        return false;
    }
    
    // Manually remove the 'show' class and restore scrolling
    bottomSheet.classList.remove('show');
    document.body.style.overflow = '';
    
    console.log('✅ Bottom sheet closed manually');
    
    return true;
};

// Quick test function to verify both progress bars work
window.testProgressBarsDirectly = function() {
    console.log('🧪 Testing progress bars directly...');
    
    // Test home page progress bar
    const homeProgressFill = document.querySelector('.progress-fill');
    const homeProgressText = document.querySelector('.progress-text');
    
    console.log('Home page elements found:', {
        progressFill: !!homeProgressFill,
        progressText: !!homeProgressText
    });
    
    if (homeProgressFill && homeProgressText) {
        console.log('📊 Setting home page to 35% for testing...');
        homeProgressFill.style.width = '35%';
        homeProgressText.textContent = '35% complete';
        console.log('✅ Home page progress updated');
    } else {
        console.error('❌ Home page progress elements not found');
    }
    
    // Test study plan progress (if on study plan page)
    const studyPlanProgressSummary = document.getElementById('progressSummary');
    const studyPlanProgressRing = document.querySelector('.progress-ring-fill');
    const studyPlanProgressText = document.getElementById('progressPercentageText');
    
    if (studyPlanProgressSummary || studyPlanProgressRing) {
        console.log('Study plan elements found:', {
            progressSummary: !!studyPlanProgressSummary,
            progressRing: !!studyPlanProgressRing,
            progressText: !!studyPlanProgressText
        });
        
        if (studyPlanProgressRing) {
            console.log('📊 Setting study plan circular progress to 45% for testing...');
            const radius = 38;
            const circumference = 2 * Math.PI * radius;
            const percentage = 45;
            const targetOffset = circumference - (percentage / 100) * circumference;
            
            studyPlanProgressRing.style.strokeDasharray = `${circumference} ${circumference}`;
            studyPlanProgressRing.style.strokeDashoffset = targetOffset;
            
            if (studyPlanProgressText) {
                studyPlanProgressText.textContent = '45%';
            }
            
            if (studyPlanProgressSummary) {
                studyPlanProgressSummary.style.display = 'block';
                studyPlanProgressSummary.textContent = 'Study plan 45% complete';
            }
            
            console.log('✅ Study plan progress updated');
        }
    } else {
        console.log('ℹ️ Study plan elements not found (probably not on study plan page)');
    }
    
    console.log('🎯 Test complete! Check if you can see the progress bars now.');
    console.log('💡 If you see progress bars, run: forceUpdateHomeProgress() and forceUpdateStudyPlanProgress()');
    console.log('💡 If you don\'t see them, the DOM elements might not exist or have CSS issues.');
};

// Auto-run diagnosis if we're in development mode (but don't interfere with existing functionality)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Run diagnosis after ALL scripts have loaded and DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            try {
                console.log('🚨 AUTO-RUNNING PROGRESS DIAGNOSIS...');
                window.diagnoseProgressIssues();
                
                console.log('\n🧪 TESTING EXISTING FUNCTIONALITY...');
                window.testExistingFunctionality();
                
                // Auto-suggest fixes
                console.log('\n💡 SUGGESTED FIXES:');
                console.log('1. Run: createMockProgressData() - to create test data');
                console.log('2. Run: forceUpdateHomeProgress(25) - to update home page to 25%');
                console.log('3. Run: forceUpdateStudyPlanProgress(40) - to update study plan to 40%');
                console.log('4. Run: testProgressBarsDirectly() - quick test both progress bars');
                console.log('5. Run: resetAllProgressData() - to reset everything');
                console.log('6. Run: testExistingFunctionality() - to debug more-options button');
                
                // Auto-create some test data if none exists
                const hasAnyData = localStorage.getItem('studyPathData') || localStorage.getItem('dailyProgress');
                if (!hasAnyData) {
                    console.log('\n🔧 No progress data found. Auto-creating test data...');
                    setTimeout(() => {
                        window.createMockProgressData();
                        window.testProgressBarsDirectly();
                    }, 1000);
                }
            } catch (error) {
                console.error('Debug script error (non-critical):', error);
            }
        }, 3000); // Longer delay to ensure everything is loaded
    });
}

})(); // End of debug module IIFE
