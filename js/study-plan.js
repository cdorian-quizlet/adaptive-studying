// Study Plan screen logic (migrated from study-path.js)

// DOM Elements
const backBtn = document.getElementById('backBtn');
const settingsBtn = document.getElementById('settingsBtn');

let pathSteps = document.querySelectorAll('.path-step'); // Will be updated when we generate dynamic content

// Progress Elements
const overallProgress = document.getElementById('overallProgress');
const cardProgress = document.getElementById('cardProgress');
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
});

// Refresh progress when returning from study screen
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log('Page became visible, refreshing progress data');
        loadStudyPathData();
        updateUI();
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
                        <span class="material-icons-round step-icon">quiz</span>
                    </div>
                    <div class="step-line"></div>
                </div>
                <div class="step-content">
                    <div class="step-header">
                        <h3 class="step-title">${title}</h3>
                        <div class="step-status skip-ahead" id="diagnostic${type.charAt(0).toUpperCase() + type.slice(1)}Status">
                            <span class="status-text">Skip ahead</span>
                        </div>
                    </div>
                    <p class="step-description">${description}</p>
                </div>
            </div>
        `;
    }
    
    // Helper function to generate round HTML
    function generateRoundHTML(concept, roundNumber, hasNextStep) {
        return `
            <div class="path-step" data-round="${roundNumber}">
                <div class="step-indicator">
                    <div class="step-circle">
                        <span class="material-icons-round step-icon">star_outline</span>
                    </div>
                    ${hasNextStep ? '<div class="step-line"></div>' : ''}
                </div>
                <div class="step-content">
                    <div class="step-header">
                        <h3 class="step-title">Round ${roundNumber}</h3>
                        <div class="step-status" id="round${roundNumber}Status">
                            <span class="material-icons-round">play_arrow</span>
                            <span class="status-text">Start</span>
                        </div>
                    </div>
                    <p class="step-description">${concept}</p>
                    <div class="step-progress">
                        <div class="step-progress-bar">
                            <div class="step-progress-fill" style="width: 0%"></div>
                        </div>
                        <span class="step-progress-text">0/${studyPathData.questionsPerRound}</span>
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
            
            console.log('FSRS Study Plan Progress:', { totalCards, learnedCards, progress: totalProgress });
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
    cardProgress.textContent = `Study plan ${totalProgress}% Complete`;
    
    // Update circular progress ring
    updateCircularProgress(totalProgress);
    
    // Update path steps
    updatePathSteps();
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
    if (isTaken) {
        step.classList.add('completed'); // Add completed class to step
        stepCircle.classList.add('completed');
        stepCircle.querySelector('.step-icon').textContent = 'check';
        stepStatus.style.display = 'none'; // Hide button for completed diagnostics
        
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
    
    // Get the step-progress element to manage visibility
    const stepProgress = step.querySelector('.step-progress');
    
    if (isCompleted) {
        // Completed round
        step.classList.add('completed'); // Add completed class to step
        stepCircle.classList.add('completed');
        stepCircle.classList.remove('in-progress');
        stepCircle.querySelector('.step-icon').textContent = 'check';
        
        stepStatus.style.display = 'none'; // Hide button for completed rounds
        
        stepProgressFill.style.width = '100%';
        stepProgress.classList.add('has-progress'); // Show progress bar for completed rounds
        
        // Add spacer after completed step if it doesn't exist
        if (!step.nextElementSibling || !step.nextElementSibling.classList.contains('step-spacer')) {
            const spacer = document.createElement('div');
            spacer.className = 'step-spacer';
            step.parentNode.insertBefore(spacer, step.nextElementSibling);
        }
        
    } else if (isCurrent) {
        // Current round
        step.classList.remove('completed'); // Remove completed class from step
        stepCircle.classList.add('in-progress');
        stepCircle.classList.remove('completed');
        stepCircle.querySelector('.step-icon').textContent = 'star_outline';
        
        stepStatus.innerHTML = `<span class="material-icons-round">play_arrow</span>`;
        stepStatus.classList.add('in-progress');
        stepStatus.classList.remove('skip-ahead');
        
        const progressPercentage = (studyPathData.currentRoundProgress / studyPathData.questionsPerRound) * 100;
        stepProgressFill.style.width = `${progressPercentage}%`;
        
        // Show progress bar only if there's actual progress
        if (studyPathData.currentRoundProgress > 0) {
            stepProgress.classList.add('has-progress');
        } else {
            stepProgress.classList.remove('has-progress');
        }
        
    } else if (hasDiagnosticProgress) {
        // Round with diagnostic progress
        step.classList.remove('completed'); // Remove completed class from step
        stepCircle.classList.remove('completed', 'in-progress');
        stepCircle.querySelector('.step-icon').textContent = 'star_outline';
        
        stepStatus.innerHTML = `<span class="material-icons-round">play_arrow</span>`;
        stepStatus.classList.remove('completed', 'in-progress', 'skip-ahead');
        
        // Show diagnostic progress
        const progressPercentage = (roundProgress / studyPathData.questionsPerRound) * 100;
        stepProgressFill.style.width = `${progressPercentage}%`;
        stepProgress.classList.add('has-progress'); // Show progress bar for diagnostic progress
        
    } else {
        // Future round
        step.classList.remove('completed'); // Remove completed class from step
        stepCircle.classList.remove('completed', 'in-progress');
        stepCircle.querySelector('.step-icon').textContent = 'star_outline';
        
        stepStatus.innerHTML = `<span class="material-icons-round">play_arrow</span>`;
        stepStatus.classList.remove('completed', 'in-progress', 'skip-ahead');
        
        stepProgressFill.style.width = '0%';
        stepProgress.classList.remove('has-progress'); // Hide progress bar for future rounds
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
    
    // Map learned cards into rounds (dynamic based on concepts)
    const totalConcepts = studyPathData.concepts.length || 7; // Fallback to 7 if no concepts
    const roundProgress = {};
    for (let i = 1; i <= totalConcepts; i++) {
        roundProgress[i] = 0;
    }
    
    learnedCards.forEach(cardNumber => {
        // Dynamic mapping based on questionsPerRound
        const roundNumber = Math.ceil(cardNumber / studyPathData.questionsPerRound);
        if (roundNumber >= 1 && roundNumber <= totalConcepts) {
            roundProgress[roundNumber]++;
        }
    });
    
    // Update study path data with round progress
    Object.keys(roundProgress).forEach(roundNumber => {
        const round = parseInt(roundNumber);
        if (roundProgress[round] > 0) {
            if (!studyPathData.roundProgress) { studyPathData.roundProgress = {}; }
            studyPathData.roundProgress[round] = roundProgress[round];
        }
    });
    
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

