// Diagnostic Test 3 - Cards 36-50
// Covers the final cell biology concepts (36-50)

// Test state
let currentQuestionIndex = 0;
let currentQuestion = null;
let selectedAnswer = null;
let isAnswered = false;
let testQuestions = [];
let testResults = {
    correct: 0,
    total: 0,
    accuracy: 0,
    questionsAnswered: []
};

// Questions for cards 36-50 (final cell biology concepts)
const diagnosticQuestions = [
    {
        id: 36,
        question: "Which organelle is responsible for cellular digestion?",
        correctAnswer: "Lysosomes",
        options: ["Lysosomes", "Peroxisomes", "Vacuoles", "Golgi apparatus"],
        type: "multiple_choice"
    },
    {
        id: 37,
        question: "What is the function of the cell membrane carbohydrates?",
        correctAnswer: "Cell recognition and communication",
        options: ["Cell recognition and communication", "Transport molecules", "Produce energy", "Store nutrients"],
        type: "multiple_choice"
    },
    {
        id: 38,
        question: "Which of the following is NOT a function of the cytoskeleton?",
        correctAnswer: "Energy production",
        options: ["Energy production", "Structural support", "Cell movement", "Organelle transport"],
        type: "multiple_choice"
    },
    {
        id: 39,
        question: "What is the function of the nuclear lamina?",
        correctAnswer: "Provide structural support to the nucleus",
        options: ["Provide structural support to the nucleus", "Produce energy", "Synthesize proteins", "Break down molecules"],
        type: "multiple_choice"
    },
    {
        id: 40,
        question: "Which organelle is responsible for lipid metabolism?",
        correctAnswer: "Smooth endoplasmic reticulum",
        options: ["Smooth endoplasmic reticulum", "Rough endoplasmic reticulum", "Golgi apparatus", "Lysosomes"],
        type: "multiple_choice"
    },
    {
        id: 41,
        question: "What is the function of the cell membrane glycoproteins?",
        correctAnswer: "Cell recognition and signaling",
        options: ["Cell recognition and signaling", "Transport molecules", "Produce energy", "Store nutrients"],
        type: "multiple_choice"
    },
    {
        id: 42,
        question: "Which of the following is a characteristic of plant cells?",
        correctAnswer: "Cell wall and chloroplasts",
        options: ["Cell wall and chloroplasts", "Centrioles", "Lysosomes", "Small vacuoles"],
        type: "multiple_choice"
    },
    {
        id: 43,
        question: "What is the function of the cell membrane glycolipids?",
        correctAnswer: "Cell recognition and protection",
        options: ["Cell recognition and protection", "Transport molecules", "Produce energy", "Store nutrients"],
        type: "multiple_choice"
    },
    {
        id: 44,
        question: "Which organelle is responsible for protein synthesis?",
        correctAnswer: "Ribosomes",
        options: ["Ribosomes", "Golgi apparatus", "Lysosomes", "Peroxisomes"],
        type: "multiple_choice"
    },
    {
        id: 45,
        question: "What is the function of the cell membrane integral proteins?",
        correctAnswer: "Transport molecules across the membrane",
        options: ["Transport molecules across the membrane", "Produce energy", "Store nutrients", "Break down waste"],
        type: "multiple_choice"
    },
    {
        id: 46,
        question: "Which of the following is a function of the nucleus?",
        correctAnswer: "DNA replication",
        options: ["DNA replication", "Energy production", "Protein synthesis", "Waste breakdown"],
        type: "multiple_choice"
    },
    {
        id: 47,
        question: "What is the function of the cell membrane peripheral proteins?",
        correctAnswer: "Cell signaling and support",
        options: ["Cell signaling and support", "Transport molecules", "Produce energy", "Store nutrients"],
        type: "multiple_choice"
    },
    {
        id: 48,
        question: "Which organelle is responsible for cellular respiration?",
        correctAnswer: "Mitochondria",
        options: ["Mitochondria", "Chloroplasts", "Nucleus", "Golgi apparatus"],
        type: "multiple_choice"
    },
    {
        id: 49,
        question: "What is the function of the cell membrane fluid mosaic model?",
        correctAnswer: "Describe the dynamic nature of the membrane",
        options: ["Describe the dynamic nature of the membrane", "Transport molecules", "Produce energy", "Store nutrients"],
        type: "multiple_choice"
    },
    {
        id: 50,
        question: "What is the capital of Wyoming?",
        correctAnswer: "Cheyenne",
        options: ["Cheyenne", "Casper", "Laramie", "Gillette"],
        type: "multiple_choice"
    }
];

// Header component instance
let appHeader = null;

// DOM elements (will be initialized when DOM loads)
let questionContainer, questionText, questionPrompt, multipleChoice, textInput, textAnswer, submitBtn;
let currentQuestionEl, totalQuestionsEl, progressFill, closeBtn;
let introScreen, studyContent, startTestBtn, resultsScreen, resultsStats, continueBtn;

// QA badge helpers for static content
function createStaticBadge() {
    const badge = document.createElement('span');
    badge.className = 'static-badge';
    badge.textContent = 'STATIC';
    badge.style.cssText = `
        display: inline-block;
        margin-left: 8px;
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 11px;
        line-height: 1;
        color: #586380;
        background: #EDEFF4;
        vertical-align: middle;
    `;
    return badge;
}

function setStaticBadge(element) {
    if (!element) return;
    element.querySelectorAll('.api-badge, .static-badge').forEach(b => b.remove());
    element.appendChild(createStaticBadge());
}

// Ensure Material icons become visible once fonts load
function handleIconLoading() {
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            const icons = document.querySelectorAll('.material-icons-round, .material-symbols-rounded');
            icons.forEach(icon => icon.classList.add('loaded'));
        });
    } else {
        setTimeout(() => {
            const icons = document.querySelectorAll('.material-icons-round, .material-symbols-rounded');
            icons.forEach(icon => icon.classList.add('loaded'));
        }, 100);
    }
}

// Initialize header component
function initializeHeader() {
    appHeader = new AppHeader({
        backUrl: '../html/study-plan.html',
        backButtonIcon: 'close',
        title: 'Quiz 3',
        loadTitleFromStorage: false,
        onBackClick: function() {
            if (confirm('Are you sure you want to exit the diagnostic test? Your progress will be lost.')) {
                window.location.href = '../html/study-plan.html';
            }
        },
        onSettingsClick: function() {
            if (appHeader) {
                appHeader.showToast('Quiz settings coming soon!');
            }
        }
    });
    
    appHeader.init();
}

// Check if intro icon image loads successfully
function checkIntroIconLoad() {
    const introIcon = document.querySelector('.intro-icon');
    if (!introIcon) return;
    
    // Create a test image to check if the background image loads
    const testImg = new Image();
    testImg.onload = function() {
        // Image loaded successfully, hide fallback
        introIcon.classList.add('loaded');
    };
    testImg.onerror = function() {
        // Image failed to load, keep fallback visible
        console.log('Intro icon image failed to load, showing fallback');
    };
    testImg.src = '../images/brand-practice-tests.png';
}

// Initialize the diagnostic test
async function initDiagnosticTest() {
    // Initialize header component
    initializeHeader();
    
    // Initialize DOM elements
    questionContainer = document.getElementById('questionContainer');
    questionText = document.getElementById('questionText');
    questionPrompt = document.getElementById('questionPrompt');
    multipleChoice = document.getElementById('multipleChoice');
    textInput = document.getElementById('textInput');
    textAnswer = document.getElementById('textAnswer');
    submitBtn = document.getElementById('submitBtn');
    currentQuestionEl = document.getElementById('currentQuestion');
    totalQuestionsEl = document.getElementById('totalQuestions');
    progressFill = document.getElementById('progressFill');
    closeBtn = document.getElementById('closeBtn');
    
    introScreen = document.getElementById('introScreen');
    studyContent = document.getElementById('studyContent');
    startTestBtn = document.getElementById('startTestBtn');
    resultsScreen = document.getElementById('resultsScreen');
    resultsStats = document.getElementById('resultsStats');
    continueBtn = document.getElementById('continueBtn');
    
    // Check if intro icon loads
    checkIntroIconLoad();
    
    // Select 10 random questions from cards 36-50
    const shuffled = diagnosticQuestions.sort(() => 0.5 - Math.random());
    testQuestions = shuffled.slice(0, 10);
    
    // Mix question types - make some written questions
    testQuestions = testQuestions.map((q, index) => {
        if (index % 3 === 0) { // Every 3rd question is written
            return {
                ...q,
                type: "written"
            };
        }
        return q;
    });
    
    testResults.total = testQuestions.length;
    
    // Setup event listeners (but don't start the test yet)
    setupEventListeners();

    // Make sure icons are visible
    handleIconLoading();
}

// Show the current question
function showQuestion() {
    currentQuestion = testQuestions[currentQuestionIndex];
    questionText.textContent = currentQuestion.question;
    setStaticBadge(questionText);
    
    // Hide all answer types
    multipleChoice.style.display = 'none';
    textInput.style.display = 'none';
    
    // Show the appropriate answer type
    if (currentQuestion.type === 'multiple_choice') {
        showMultipleChoice();
    } else {
        showTextInput();
    }
    
    // Reset state
    selectedAnswer = null;
    isAnswered = false;
    
    // Update progress
    updateProgress();
    
    // Show question container
    questionContainer.style.display = 'block';
    questionContainer.classList.remove('fade-out');
}

// Show multiple choice options
function showMultipleChoice() {
    multipleChoice.style.display = 'flex';
    questionPrompt.textContent = 'Choose the correct answer';
    const optionBtns = multipleChoice.querySelectorAll('.option-btn');
    
    optionBtns.forEach((btn, index) => {
        btn.textContent = currentQuestion.options[index];
        btn.dataset.answer = currentQuestion.options[index];
        btn.className = 'option-btn';
        btn.disabled = false;
        btn.style.cursor = 'pointer';
        setStaticBadge(btn);
    });
}

// Show text input
function showTextInput() {
    textInput.style.display = 'flex';
    questionPrompt.style.display = 'none';
    textAnswer.value = '';
    textAnswer.focus();
}

// Handle answer selection
function handleAnswerSelect(answer) {
    if (isAnswered) return;
    
    selectedAnswer = answer;
    isAnswered = true;
    
    // Update UI to show selection
    if (currentQuestion.type === 'multiple_choice') {
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => {
            if (btn.dataset.answer === answer) {
                btn.classList.add('selected');
            }
        });
    }
    
    // Check answer after a brief delay
    setTimeout(checkAnswer, 500);
}

// Check if the answer is correct
function checkAnswer() {
    const isCorrect = selectedAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
    
    // Record the result
    testResults.questionsAnswered.push({
        questionId: currentQuestion.id,
        correct: isCorrect,
        answer: selectedAnswer
    });
    
    if (isCorrect) {
        testResults.correct++;
    }
    

    
    // Move directly to next question (no feedback)
    nextQuestion();
}

// Show feedback function removed - no longer needed for diagnostic tests

// Show text input error
function showTextInputError() {
    // Add error styling to input
    textAnswer.classList.add('error');
    
    // Add error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = 'Please enter an answer before continuing.';
    errorMessage.style.cssText = `
        color: #FF6B6B;
        font-size: 14px;
        font-weight: 500;
        margin-top: 8px;
        text-align: left;
    `;
    
    // Insert error message after the input
    const textInputContainer = document.querySelector('.text-input-container');
    if (textInputContainer) {
        // Remove any existing error message
        const existingError = textInputContainer.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        textInputContainer.appendChild(errorMessage);
    }
    
    // Clear error when user starts typing
    textAnswer.addEventListener('input', clearTextInputError, { once: true });
}

// Clear text input error
function clearTextInputError() {
    textAnswer.classList.remove('error');
    const errorMessage = document.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Move to next question
function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex >= testQuestions.length) {
        // Test complete
        completeTest();
        return;
    }
    
    // Smooth transition to next question
    const questionContainer = document.querySelector('.question-container');
    questionContainer.classList.add('fade-out');
    
    setTimeout(() => {
        // Reset UI for next question
        questionPrompt.classList.remove('feedback', 'incorrect');
        questionPrompt.style.color = '';
        questionPrompt.textContent = 'Choose the correct answer';
        
        // Reset multiple choice buttons
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => {
            btn.classList.remove('selected', 'correct', 'incorrect');
            btn.disabled = false;
            btn.style.cursor = 'pointer';
        });
        
        // Reset text input
        if (textAnswer) {
            textAnswer.value = '';
        }
        
        showQuestion();
        
        // Fade back in
        questionContainer.classList.remove('fade-out');
    }, 100);
}

// Complete the test
function completeTest() {
    // Calculate results
    testResults.accuracy = Math.round((testResults.correct / testResults.total) * 100);
    
    // Hide question container
    questionContainer.style.display = 'none';
    
    // Show results
    showResults();
    
    // Update study path progress based on diagnostic results
    updateStudyPathProgress();
}

// Show test results
function showResults() {
    resultsStats.innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${testResults.correct}/${testResults.total}</div>
            <div class="stat-label">Correct Answers</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${testResults.accuracy}%</div>
            <div class="stat-label">Accuracy</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${testResults.total - testResults.correct}</div>
            <div class="stat-label">Incorrect</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${testResults.total}</div>
            <div class="stat-label">Total Questions</div>
        </div>
    `;
    
    resultsScreen.style.display = 'flex';
}

// Update study path progress based on diagnostic results
function updateStudyPathProgress() {
    // Calculate how many cards should be marked as learned based on diagnostic performance
    const cardsToMark = Math.round((testResults.accuracy / 100) * 15); // 15 cards in this range (36-50)
    

    
    // Mark diagnostic as completed
    localStorage.setItem('diagnostic3_completed', 'true');
    localStorage.setItem('diagnostic3_accuracy', testResults.accuracy.toString());
    localStorage.setItem('diagnostic3_cards_learned', cardsToMark.toString());
}

// Update progress bar and counter
function updateProgress() {
    // Progress fill shows completed questions
    const fillProgress = (currentQuestionIndex / testQuestions.length) * 100;
    
    const progressBar = document.querySelector('.progress-bar');
    const progressCounter = document.getElementById('progressCounter');
    
    // Handle zero state (first question)
    if (fillProgress === 0) {
        // Add zero-state class for CSS styling
        if (progressBar) {
            progressBar.classList.add('zero-state');
        }
        // CSS handles the styling, but we still need to clear any inline styles
        if (progressFill) {
            progressFill.style.width = '';
        }
        if (progressCounter) {
            progressCounter.style.left = '';
        }
    } else {
        // Remove zero-state class and use normal progress
        if (progressBar) {
            progressBar.classList.remove('zero-state');
        }
        if (progressFill) {
            progressFill.style.width = `${fillProgress}%`;
        }
        if (progressCounter) {
            progressCounter.style.left = `${fillProgress}%`;
        }
    }
    
    currentQuestionEl.textContent = currentQuestionIndex + 1;
}

// Setup event listeners
function setupEventListeners() {
    // Multiple choice buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('option-btn') && !isAnswered) {
            handleAnswerSelect(e.target.dataset.answer);
        }
    });
    
    // Text input submit
    submitBtn.addEventListener('click', () => {
        if (!isAnswered) {
            if (textAnswer.value.trim()) {
                handleAnswerSelect(textAnswer.value.trim());
            } else {
                showTextInputError();
            }
        }
    });
    
    // Text input enter key
    textAnswer.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !isAnswered) {
            if (textAnswer.value.trim()) {
                handleAnswerSelect(textAnswer.value.trim());
            } else {
                showTextInputError();
            }
        }
    });
    
    // Start test button
    startTestBtn.addEventListener('click', () => {
        introScreen.style.display = 'none';
        studyContent.style.display = 'block';
        showQuestion();
    });
    
    // Navigation is now handled by AppHeader component
    
    continueBtn.addEventListener('click', () => {
        window.location.href = '../html/study-plan.html?diagnostic=3&accuracy=' + testResults.accuracy;
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initDiagnosticTest); 