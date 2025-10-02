// Round End Screen Logic

// DOM Elements
let roundNumberEl, roundConceptEl, xpAmountEl, questionsAnsweredEl, accuracyPercentEl, streakBonusEl;
let nextRoundBtn, reviewBtn;

// Round themes mapping (same as study.js)
const roundThemes = {
    1: "Cell Structure & Function",
    2: "Organelles & Metabolism", 
    3: "Membrane Biology",
    4: "Cellular Processes",
    5: "Advanced Cell Biology",
    6: "Cell Division & Growth",
    7: "Specialized Cells",
    8: "Final Concepts"
};

// Initialize the round end screen
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Round end screen DOM loaded');
    initializePageHeader();
    initializeRoundEnd();
    setupEventListeners();
    
    // Initialize audio manager
    if (typeof audioManager !== 'undefined') {
        console.log('🎵 Audio manager available, initializing sounds');
        audioManager.initializeUISounds();
    } else {
        console.warn('⚠️ Audio manager not available');
    }
    
    loadRoundData();
});

function initializePageHeader() {
    // Initialize the header component
    if (typeof AppHeader !== 'undefined') {
        new AppHeader({
            showBackButton: false,
            showCloseButton: true,
            showSettingsButton: false,
            onClose: () => {
                window.location.href = '../html/study-plan.html';
            }
        });
    }
}

function initializeRoundEnd() {
    // Get DOM elements with error checking
    roundNumberEl = document.getElementById('roundNumber');
    roundConceptEl = document.getElementById('roundConcept');
    xpAmountEl = document.getElementById('xpAmount');
    questionsAnsweredEl = document.getElementById('questionsAnswered');
    accuracyPercentEl = document.getElementById('accuracyPercent');
    streakBonusEl = document.getElementById('streakBonus');
    nextRoundBtn = document.getElementById('nextRoundBtn');
    reviewBtn = document.getElementById('reviewBtn');
    
    // Check for critical elements
    if (!xpAmountEl) {
        console.error('❌ Critical element missing: xpAmount');
    }
    if (!nextRoundBtn) {
        console.error('❌ Critical element missing: nextRoundBtn');
    }
    
    console.log('✅ Round end screen initialized');
}

function setupEventListeners() {
    // Next round button
    if (nextRoundBtn) {
        nextRoundBtn.addEventListener('click', handleNextRound);
    }
    
    // Review round button
    if (reviewBtn) {
        reviewBtn.addEventListener('click', handleReviewRound);
    }
}

function loadRoundData() {
    try {
        // Get current round number from localStorage
        const currentRound = parseInt(localStorage.getItem('currentRoundNumber')) || 1;
        const completedRound = currentRound; // The round we just completed
        
        console.log('Loading round data for completed round:', completedRound);
        
        // Update round info
        if (roundNumberEl) {
            roundNumberEl.textContent = completedRound;
        }
        
        if (roundConceptEl) {
            const conceptName = roundThemes[completedRound] || `Round ${completedRound}`;
            roundConceptEl.textContent = conceptName;
        }
        
        // Load static XP data for now (will be replaced with real data later)
        loadStaticXPData(completedRound);
        
        // Check if this is a session end (step remains current) vs step completion
        let isSessionEnd = false;
        let stepStaysCurrentForMoreSessions = false;
        
        try {
            const sessionData = sessionStorage.getItem('completedRoundData');
            if (sessionData) {
                const data = JSON.parse(sessionData);
                isSessionEnd = data.isSessionEnd;
                stepStaysCurrentForMoreSessions = data.stepStaysCurrentForMoreSessions;
            }
        } catch (e) {
            console.warn('Could not parse session data:', e);
        }
        
        // Always show step completion UI since we now advance after each 10-question round
        const titleEl = document.querySelector('.round-title');
        if (titleEl) {
            titleEl.innerHTML = `Round <span id="roundNumber">${completedRound}</span> complete!`;
        }
        
        const conceptEl = document.querySelector('.round-concept');
        if (conceptEl) {
            const conceptName = roundThemes[completedRound] || `Round ${completedRound}`;
            conceptEl.textContent = conceptName;
        }
        
        // Determine next action based on remaining steps
        const totalConcepts = getTotalConcepts();
        const hasMoreRounds = completedRound < totalConcepts;
        
        if (nextRoundBtn) {
            if (hasMoreRounds) {
                nextRoundBtn.innerHTML = `
                    <span class="button-text">Continue</span>
                    <div class="button-spinner">
                        <svg class="material-spinner-small" width="24" height="24" viewBox="0 0 24 24">
                            <circle class="spinner-path-small" cx="12" cy="12" r="10" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"></circle>
                        </svg>
                    </div>
                `;
            } else {
                nextRoundBtn.innerHTML = `
                    <span class="button-text">Continue</span>
                    <div class="button-spinner">
                        <svg class="material-spinner-small" width="24" height="24" viewBox="0 0 24 24">
                            <circle class="spinner-path-small" cx="12" cy="12" r="10" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"></circle>
                        </svg>
                    </div>
                `;
            }
        }
        
    } catch (error) {
        console.error('Error loading round data:', error);
        // Fallback to default values
        if (roundNumberEl) roundNumberEl.textContent = '1';
        if (roundConceptEl) roundConceptEl.textContent = 'Cell Structure & Function';
        loadStaticXPData(1);
    }
}

function loadStaticXPData(roundNumber) {
    // Static XP data for demonstration - simplified to match mockup
    const totalXP = 40; // Fixed value as shown in mockup, but can be dynamic
    
    // Add a small delay to try to work around autoplay policy
    setTimeout(() => {
        if (xpAmountEl) {
            console.log('🎬 Starting XP animation with audio after delay');
            animateXPCountUp(0, totalXP, 1000);
        }
    }, 500); // 500ms delay
    
    console.log('Loaded static XP data:', {
        roundNumber,
        totalXP
    });
}

// Animate XP number counting up from start to end value (classic roll-up animation)
function animateXPCountUp(startValue, endValue, duration) {
    console.log('🎬 Starting XP roll-up animation (audio triggered from study screen)');
    
    // Audio will be played from the study screen with proper timing
    // No need to play audio here - it's already triggered with the right delay
    
    const totalNumbers = endValue - startValue;
    const timePerNumber = duration / totalNumbers; // Time to show each number
    let currentNumber = startValue;
    
    function rollUp() {
        xpAmountEl.textContent = currentNumber;
        currentNumber++;
        
        if (currentNumber <= endValue) {
            setTimeout(rollUp, timePerNumber);
        }
    }
    
    // Start the roll-up animation
    rollUp();
}

function getTotalConcepts() {
    try {
        // Try to get from onboarding data
        const conceptsData = localStorage.getItem('onboarding_concepts');
        if (conceptsData) {
            const concepts = JSON.parse(conceptsData);
            return concepts.length;
        }
        
        // Fallback to study path data
        const studyPathData = localStorage.getItem('studyPathData');
        if (studyPathData) {
            const data = JSON.parse(studyPathData);
            return data.concepts?.length || 8;
        }
        
        // Default fallback
        return 8;
    } catch (error) {
        console.error('Error getting total concepts:', error);
        return 8;
    }
}

function handleNextRound() {
    // No audio needed here - progress loop is triggered from study screen
    // audioManager.play('buttonClick'); // Will add back when button-click.mp3 is available
    
    if (nextRoundBtn.classList.contains('loading')) {
        return; // Prevent multiple clicks
    }
    
    // Show loading state
    nextRoundBtn.classList.add('loading');
    
    console.log('Next round clicked');
    
    // Simulate brief loading for smooth UX
    setTimeout(() => {
        try {
            // Check if this was a step completion (advance to next step)
            const completedRoundData = sessionStorage.getItem('completedRoundData');
            let isStepCompletion = true; // Default to step completion
            let shouldAdvanceToNextStep = true;
            
            if (completedRoundData) {
                const data = JSON.parse(completedRoundData);
                isStepCompletion = data.isStepCompletion !== false; // Default to true
                shouldAdvanceToNextStep = data.advanceToNextStep !== false; // Default to true
            }
            
            const currentRound = parseInt(localStorage.getItem('currentRoundNumber')) || 1;
            const totalConcepts = getTotalConcepts();
            
            console.log('🎯 ROUND-END: Handling step completion:', {
                currentRound,
                isStepCompletion,
                shouldAdvanceToNextStep,
                totalConcepts
            });
            
            if (isStepCompletion && shouldAdvanceToNextStep) {
                // Step completion - advance to next step or return to study plan
                const nextRound = currentRound + 1;
                
                if (nextRound <= totalConcepts) {
                    // Advance to next step
                    localStorage.setItem('currentRoundNumber', nextRound.toString());
                    
                    // Clear previous round progress
                    localStorage.removeItem('currentRoundProgress');
                    
                    console.log(`✅ Advancing to next step ${nextRound} (completed step ${currentRound})`);
                    
                    // Navigate to study screen for next step
                    window.location.href = '../html/study.html';
                } else {
                    // All steps completed - go to study plan
                    console.log('🎉 All steps completed, returning to study plan');
                    window.location.href = '../html/study-plan.html';
                }
            } else {
                // Fallback: just advance to next step anyway
                const nextRound = currentRound + 1;
                if (nextRound <= totalConcepts) {
                    localStorage.setItem('currentRoundNumber', nextRound.toString());
                    localStorage.removeItem('currentRoundProgress');
                    console.log(`🔄 Fallback: Advancing to step ${nextRound}`);
                    window.location.href = '../html/study.html';
                } else {
                    console.log('🏁 Fallback: All steps completed, returning to study plan');
                    window.location.href = '../html/study-plan.html';
                }
            }
            
        } catch (error) {
            console.error('Error handling next round:', error);
            // Fallback navigation
            window.location.href = '../html/study-plan.html';
        }
    }, 500); // Brief delay for loading animation
}

function handleReviewRound() {
    console.log('Review round clicked');
    
    // For now, just navigate back to study plan
    // In the future, this could show a review screen with round statistics
    window.location.href = '../html/study-plan.html';
}

// Export for debugging
if (typeof window !== 'undefined') {
    window.RoundEnd = {
        loadRoundData,
        handleNextRound,
        handleReviewRound
    };
}
