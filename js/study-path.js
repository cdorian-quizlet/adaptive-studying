// DOM Elements
const backBtn = document.getElementById('backBtn');
const settingsBtn = document.getElementById('settingsBtn');

const pathSteps = document.querySelectorAll('.path-step');

// Progress Elements
const overallProgress = document.getElementById('overallProgress');
const cardProgress = document.getElementById('cardProgress');
const progressRingFill = document.querySelector('.progress-ring-fill');

// Study Path Data
const studyPathData = {
    totalRounds: 8,
    questionsPerRound: 7,
    currentRound: 1,
    completedRounds: 0,
    currentRoundProgress: 0,
    totalQuestionsAnswered: 0,
    accuracy: 0,
    diagnosticTaken: false,
    diagnosticMidTaken: false,
    diagnosticFinalTaken: false
};

// Initialize the study path
document.addEventListener('DOMContentLoaded', function() {
    loadStudyPathData();
    updateUI();
    setupEventListeners();
    animateCompletedSteps();
    
    // Check for diagnostic completion and show confetti
    checkDiagnosticCompletion();

    // Show onboarding bottom sheet if coming from plan flow
    maybeShowOnboardingSheet();
});

// Refresh progress when returning from study screen
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log('Page became visible, refreshing progress data');
        loadStudyPathData();
        updateUI();
    }
});

// Load study path data from localStorage
function loadStudyPathData() {
    const savedData = localStorage.getItem('studyPathData');
    if (savedData) {
        Object.assign(studyPathData, JSON.parse(savedData));
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
            
            console.log('FSRS Study Path Progress:', { totalCards, learnedCards, progress: totalProgress });
        } catch (error) {
            console.error('Error parsing FSRS stats:', error);
        }
    }
    
    // Load current round progress from localStorage
    const currentRoundNumber = localStorage.getItem('currentRoundNumber');
    const currentRoundProgress = localStorage.getItem('currentRoundProgress');
    
    if (currentRoundNumber && currentRoundProgress) {
        studyPathData.currentRound = parseInt(currentRoundNumber);
        studyPathData.currentRoundProgress = parseInt(currentRoundProgress);
        studyPathData.completedRounds = Math.max(0, studyPathData.currentRound - 1);
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
            studyPathData.currentRound = Math.floor(totalQuestionsCompleted / studyPathData.questionsPerRound) + 1;
            studyPathData.completedRounds = Math.floor(totalQuestionsCompleted / studyPathData.questionsPerRound);
            studyPathData.currentRoundProgress = totalQuestionsCompleted % studyPathData.questionsPerRound;
        } else {
            // Use FSRS progress to calculate rounds
            const totalQuestions = 50; // Total questions
            const totalQuestionsCompleted = Math.round((totalProgress / 100) * totalQuestions);
            studyPathData.currentRound = Math.floor(totalQuestionsCompleted / studyPathData.questionsPerRound) + 1;
            studyPathData.completedRounds = Math.floor(totalQuestionsCompleted / studyPathData.questionsPerRound);
            studyPathData.currentRoundProgress = totalQuestionsCompleted % studyPathData.questionsPerRound;
        }
    }
    
    // Ensure we don't exceed total rounds
    if (studyPathData.currentRound > studyPathData.totalRounds) {
        studyPathData.currentRound = studyPathData.totalRounds;
        studyPathData.completedRounds = studyPathData.totalRounds - 1;
        studyPathData.currentRoundProgress = studyPathData.questionsPerRound;
    }
    
    studyPathData.totalQuestionsAnswered = totalProgress;
}

// Update the UI with current data
function updateUI() {
    // Calculate total progress including diagnostic tests
    let totalProgress = studyPathData.totalQuestionsAnswered || 0;
    
    // Add progress from diagnostic tests
    if (studyPathData.roundProgress) {
        const diagnosticProgress = Object.values(studyPathData.roundProgress).reduce((sum, progress) => sum + progress, 0);
        const diagnosticPercentage = Math.round((diagnosticProgress / 50) * 100);
        totalProgress = Math.max(totalProgress, diagnosticPercentage);
    }
    
    // Update overview stats
    overallProgress.textContent = `${totalProgress}%`;
    
    // Update card progress
    const cardsLearned = Math.round((totalProgress / 100) * 50);
    cardProgress.textContent = `${cardsLearned} of 50 cards learned`;
    
    // Update circular progress ring
    updateCircularProgress(totalProgress);
    
    // Update path steps
    updatePathSteps();
}

// Update circular progress ring
function updateCircularProgress(percentage) {
    if (progressRingFill) {
        const radius = 32;
        const circumference = 2 * Math.PI * radius;
        const progress = (percentage / 100) * circumference;
        
        progressRingFill.style.strokeDasharray = `${progress} ${circumference}`;
    }
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
        
        if (roundType === 'diagnostic') {
            // Initial diagnostic test
            updateDiagnosticStep(step, stepCircle, stepStatus, 'diagnostic');
        } else if (roundType === 'diagnostic-mid') {
            // Mid diagnostic test
            updateDiagnosticStep(step, stepCircle, stepStatus, 'diagnosticMid');
        } else if (roundType === 'diagnostic-final') {
            // Final diagnostic test
            updateDiagnosticStep(step, stepCircle, stepStatus, 'diagnosticFinal');
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
    if (isTaken) {
        stepCircle.classList.add('completed');
        stepStatus.innerHTML = `
            <span class="material-icons-round status-icon">check_circle</span>
            <span class="status-text">Completed</span>
        `;
        stepStatus.classList.add('completed');
    } else {
        stepStatus.innerHTML = `
            <span class="material-icons-round status-icon">play_arrow</span>
            <span class="status-text">Take Test</span>
        `;
        stepStatus.classList.remove('completed');
    }
}

// Update regular round steps
function updateRoundStep(step, stepCircle, stepLine, stepStatus, stepProgressFill, stepProgressText, roundNumber) {
    const isCompleted = roundNumber <= studyPathData.completedRounds;
    const isCurrent = roundNumber === studyPathData.currentRound;
    
    // Check if this round has progress from diagnostic tests
    const roundProgress = studyPathData.roundProgress ? studyPathData.roundProgress[roundNumber] || 0 : 0;
    const hasDiagnosticProgress = roundProgress > 0;
    
    console.log(`Updating round ${roundNumber}:`, {
        isCompleted,
        isCurrent,
        roundProgress,
        hasDiagnosticProgress,
        studyPathData: studyPathData
    });
    
    // Remove current-round class from all steps first
    step.querySelector('.step-content').classList.remove('current-round');
    
    if (isCompleted) {
        // Completed round
        stepCircle.classList.add('completed');
        stepCircle.classList.remove('in-progress');
        
        if (stepLine) {
            stepLine.classList.add('completed');
        }
        
        stepStatus.innerHTML = `
            <span class="material-icons-round status-icon">check_circle</span>
            <span class="status-text">Completed</span>
        `;
        stepStatus.classList.add('completed');
        
        stepProgressFill.style.width = '100%';
        stepProgressText.textContent = `${studyPathData.questionsPerRound}/${studyPathData.questionsPerRound}`;
        
    } else if (isCurrent) {
        // Current round
        stepCircle.classList.add('in-progress');
        stepCircle.classList.remove('completed');
        
        // Add current-round class for highlighting
        step.querySelector('.step-content').classList.add('current-round');
        
        stepStatus.innerHTML = `
            <span class="material-icons-round status-icon">play_arrow</span>
            <span class="status-text">Continue</span>
        `;
        stepStatus.classList.add('in-progress');
        
        const progressPercentage = (studyPathData.currentRoundProgress / studyPathData.questionsPerRound) * 100;
        stepProgressFill.style.width = `${progressPercentage}%`;
        stepProgressText.textContent = `${studyPathData.currentRoundProgress}/${studyPathData.questionsPerRound}`;
        
    } else if (hasDiagnosticProgress) {
        // Round with diagnostic progress
        stepCircle.classList.remove('completed', 'in-progress');
        
        stepStatus.innerHTML = `
            <span class="material-icons-round status-icon">play_arrow</span>
            <span class="status-text">Start</span>
        `;
        stepStatus.classList.remove('completed', 'in-progress');
        
        // Show diagnostic progress
        const progressPercentage = (roundProgress / studyPathData.questionsPerRound) * 100;
        stepProgressFill.style.width = `${progressPercentage}%`;
        stepProgressText.textContent = `${roundProgress}/${studyPathData.questionsPerRound}`;
        
    } else {
        // Future round
        stepCircle.classList.remove('completed', 'in-progress');
        
        stepStatus.innerHTML = `
            <span class="material-icons-round status-icon">play_arrow</span>
            <span class="status-text">Start</span>
        `;
        stepStatus.classList.remove('completed', 'in-progress');
        
        stepProgressFill.style.width = '0%';
        stepProgressText.textContent = `0/${studyPathData.questionsPerRound}`;
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
    // Back button
    backBtn.addEventListener('click', function() {
        window.location.href = '../index.html';
    });
    
    // Settings button
    settingsBtn.addEventListener('click', function() {
        // Settings functionality would go here
        console.log('Settings clicked');
        showToast('Settings menu opened');
    });
    

    
    // Path step clicks
    pathSteps.forEach((step, index) => {
        step.addEventListener('click', function() {
            const roundType = step.dataset.round;
            
            if (roundType === 'diagnostic') {
                startDiagnosticTest('initial');
            } else if (roundType === 'diagnostic-mid') {
                startDiagnosticTest('mid');
            } else if (roundType === 'diagnostic-final') {
                startDiagnosticTest('final');
            } else {
                const roundNumber = parseInt(roundType);
            startRound(roundNumber);
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
            showToast(`Starting ${type} diagnostic test...`);
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
            
            // Calculate which rounds have progress
            for (let round = 1; round <= studyPathData.totalRounds; round++) {
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

// Save study path data to localStorage
function saveStudyPathData() {
    localStorage.setItem('studyPathData', JSON.stringify(studyPathData));
}

// Function to mark a round as completed (called from study screen)
function markRoundCompleted(roundNumber) {
    if (roundNumber <= studyPathData.totalRounds) {
        studyPathData.completedRounds = Math.max(studyPathData.completedRounds, roundNumber - 1);
        studyPathData.currentRound = roundNumber + 1;
        studyPathData.currentRoundProgress = 0;
        
        // Clear localStorage for completed round
        localStorage.removeItem('currentRoundProgress');
        localStorage.setItem('currentRoundNumber', studyPathData.currentRound);
        
        // Animate the completion
        const step = document.querySelector(`[data-round="${roundNumber}"]`);
        if (step) {
            const stepCircle = step.querySelector('.step-circle');
            stepCircle.classList.add('completed');
            
            // Trigger pulse animation
            stepCircle.style.animation = 'none';
            setTimeout(() => {
                stepCircle.style.animation = 'checkmarkPulse 0.6s ease-out';
            }, 10);
        }
        
        updateUI();
        saveStudyPathData();
    }
}

// Function to update current round progress (called from study screen)
function updateRoundProgress(questionsCompleted) {
    studyPathData.currentRoundProgress = questionsCompleted;
    studyPathData.totalQuestionsAnswered = (studyPathData.completedRounds * studyPathData.questionsPerRound) + questionsCompleted;
    
    // Save to localStorage for persistence
    localStorage.setItem('currentRoundProgress', questionsCompleted);
    
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
    
    // Reload study path data to reflect changes
    loadStudyPathData();
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
    
    // Update round progress based on which cards were learned
    // Round 1: Cards 1-7
    // Round 2: Cards 8-14  
    // Round 3: Cards 15-21
    // Round 4: Cards 22-28
    // Round 5: Cards 29-35
    // Round 6: Cards 36-42
    // Round 7: Cards 43-50
    
    const roundProgress = {
        1: 0, // Cards 1-7
        2: 0, // Cards 8-14
        3: 0, // Cards 15-21
        4: 0, // Cards 22-28
        5: 0, // Cards 29-35
        6: 0, // Cards 36-42
        7: 0  // Cards 43-50
    };
    
    // Count learned cards in each round
    learnedCards.forEach(cardNumber => {
        if (cardNumber >= 1 && cardNumber <= 7) roundProgress[1]++;
        else if (cardNumber >= 8 && cardNumber <= 14) roundProgress[2]++;
        else if (cardNumber >= 15 && cardNumber <= 21) roundProgress[3]++;
        else if (cardNumber >= 22 && cardNumber <= 28) roundProgress[4]++;
        else if (cardNumber >= 29 && cardNumber <= 35) roundProgress[5]++;
        else if (cardNumber >= 36 && cardNumber <= 42) roundProgress[6]++;
        else if (cardNumber >= 43 && cardNumber <= 50) roundProgress[7]++;
    });
    
    console.log('Round progress calculated:', roundProgress);
    
    // Update study path data with round progress
    Object.keys(roundProgress).forEach(roundNumber => {
        const round = parseInt(roundNumber);
        if (roundProgress[round] > 0) {
            // Update the round progress in study path data
            if (!studyPathData.roundProgress) {
                studyPathData.roundProgress = {};
            }
            studyPathData.roundProgress[round] = roundProgress[round];
            console.log(`Updated round ${round} progress to ${roundProgress[round]}`);
        }
    });
    
    console.log('Final studyPathData.roundProgress:', studyPathData.roundProgress);
    
    // Save updated data
    saveStudyPathData();
}

// Export functions for external use
window.StudyPath = {
    markRoundCompleted,
    updateRoundProgress,
    markDiagnosticCompleted,
    getCurrentRound: () => studyPathData.currentRound,
    getCompletedRounds: () => studyPathData.completedRounds,
}; 