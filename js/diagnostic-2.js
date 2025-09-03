// Diagnostic Test 2 - Cards 22-35
// Covers cell biology concepts 22-35

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

// Questions for cards 22-35 (cell biology concepts 22-35)
const diagnosticQuestions = [
    {
        id: 22,
        question: "Which of the following is a characteristic of eukaryotic cells?",
        correctAnswer: "Membrane-bound organelles",
        options: ["Membrane-bound organelles", "Small size", "Simple structure", "No nucleus"],
        type: "multiple_choice"
    },
    {
        id: 23,
        question: "What is the function of the centrioles?",
        correctAnswer: "Organize microtubules during cell division",
        options: ["Organize microtubules during cell division", "Produce energy", "Store nutrients", "Break down waste"],
        type: "multiple_choice"
    },
    {
        id: 24,
        question: "Which organelle is responsible for detoxification in liver cells?",
        correctAnswer: "Smooth endoplasmic reticulum",
        options: ["Smooth endoplasmic reticulum", "Rough endoplasmic reticulum", "Golgi apparatus", "Lysosomes"],
        type: "multiple_choice"
    },
    {
        id: 25,
        question: "What is the function of the nuclear pores?",
        correctAnswer: "Allow materials to pass between nucleus and cytoplasm",
        options: ["Allow materials to pass between nucleus and cytoplasm", "Produce energy", "Synthesize proteins", "Break down molecules"],
        type: "multiple_choice"
    },
    {
        id: 26,
        question: "Which organelle contains digestive enzymes?",
        correctAnswer: "Lysosomes",
        options: ["Lysosomes", "Peroxisomes", "Vacuoles", "Golgi apparatus"],
        type: "multiple_choice"
    },
    {
        id: 27,
        question: "What is the function of the cell membrane proteins?",
        correctAnswer: "Transport molecules and cell signaling",
        options: ["Transport molecules and cell signaling", "Produce energy", "Store nutrients", "Break down waste"],
        type: "multiple_choice"
    },
    {
        id: 28,
        question: "Which of the following is found in both plant and animal cells?",
        correctAnswer: "Mitochondria",
        options: ["Mitochondria", "Chloroplasts", "Cell wall", "Central vacuole"],
        type: "multiple_choice"
    },
    {
        id: 29,
        question: "What is the function of the extracellular matrix?",
        correctAnswer: "Provide structural support and cell communication",
        options: ["Provide structural support and cell communication", "Produce energy", "Store genetic material", "Break down waste"],
        type: "multiple_choice"
    },
    {
        id: 30,
        question: "Which organelle is responsible for protein modification and packaging?",
        correctAnswer: "Golgi apparatus",
        options: ["Golgi apparatus", "Ribosomes", "Endoplasmic reticulum", "Lysosomes"],
        type: "multiple_choice"
    },
    {
        id: 31,
        question: "What is the function of the cytoskeleton microtubules?",
        correctAnswer: "Provide structural support and enable transport",
        options: ["Provide structural support and enable transport", "Produce energy", "Store nutrients", "Break down waste"],
        type: "multiple_choice"
    },
    {
        id: 32,
        question: "Which organelle is responsible for breaking down hydrogen peroxide?",
        correctAnswer: "Peroxisomes",
        options: ["Peroxisomes", "Lysosomes", "Vacuoles", "Mitochondria"],
        type: "multiple_choice"
    },
    {
        id: 33,
        question: "What is the function of the cell membrane phospholipids?",
        correctAnswer: "Form the basic structure of the membrane",
        options: ["Form the basic structure of the membrane", "Transport molecules", "Produce energy", "Store nutrients"],
        type: "multiple_choice"
    },
    {
        id: 34,
        question: "Which of the following is a function of the nucleus?",
        correctAnswer: "Control gene expression",
        options: ["Control gene expression", "Produce energy", "Break down molecules", "Transport materials"],
        type: "multiple_choice"
    },
    {
        id: 35,
        question: "What is the capital of Ohio?",
        correctAnswer: "Columbus",
        options: ["Columbus", "Cleveland", "Cincinnati", "Toledo"],
        type: "multiple_choice"
    }
];

// Header component instance
let appHeader = null;

// DOM elements (will be initialized when DOM loads)
let questionContainer, questionText, questionPrompt, multipleChoice, textInput, textAnswer, submitBtn;
let currentQuestionEl, totalQuestionsEl, progressFill, closeBtn;
let introScreen, studyContent, startTestBtn, resultsScreen, resultsStats, continueBtn;

// API Badge functions for debugging
function createApiBadge() {
    const badge = document.createElement('span');
    badge.className = 'api-badge';
    badge.textContent = 'API';
    badge.style.cssText = `
        display: inline-block;
        margin-left: 8px;
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 11px;
        line-height: 1;
        color: #4255FF;
        background: #EDEFFF;
        vertical-align: middle;
    `;
    return badge;
}

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

function setSourceBadge(element) {
    if (!element) return;
    
    console.log('🔍 DIAGNOSTIC-2 BADGE DEBUG: Setting badge for element, currentQuestionIndex:', currentQuestionIndex);
    console.log('🔍 DIAGNOSTIC-2 BADGE DEBUG: Current question:', testQuestions[currentQuestionIndex]);
    console.log('🔍 DIAGNOSTIC-2 BADGE DEBUG: window.USING_API_CONTENT:', window.USING_API_CONTENT);
    
    element.querySelectorAll('.api-badge, .static-badge').forEach(b => b.remove());
    
    const currentQuestion = testQuestions[currentQuestionIndex];
    const isApiQuestion = currentQuestion && (currentQuestion._raw || currentQuestion.source === 'api' || window.USING_API_CONTENT);
    
    console.log('🔍 DIAGNOSTIC-2 BADGE DEBUG: Is API question?', isApiQuestion);
    
    if (isApiQuestion) {
        console.log('🔍 DIAGNOSTIC-2 BADGE DEBUG: Adding API badge');
        element.appendChild(createApiBadge());
    } else {
        console.log('🔍 DIAGNOSTIC-2 BADGE DEBUG: Adding STATIC badge');
        element.appendChild(createStaticBadge());
    }
}

// Create correct answer pill for debugging
function createCorrectAnswerPill() {
    const pill = document.createElement('span');
    pill.className = 'correct-answer-pill';
    pill.textContent = 'CORRECT';
    pill.style.cssText = `
        display: inline-block;
        margin-left: 8px;
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 11px;
        line-height: 1;
        color: #059669;
        background: #ECFDF5;
        border: 1px solid #10B981;
        vertical-align: middle;
        font-weight: 600;
    `;
    return pill;
}

// Add correct answer pill to option if it's the correct answer
function addCorrectAnswerPill(element, optionText) {
    if (!element || !currentQuestion) return;
    
    // Remove existing correct answer pills
    element.querySelectorAll('.correct-answer-pill').forEach(p => p.remove());
    
    // Add correct answer pill if this option is correct
    if (optionText === currentQuestion.correctAnswer) {
        element.appendChild(createCorrectAnswerPill());
    }
}

// Function to fetch questions from API for diagnostic concepts
async function fetchQuestionsFromApiForDiagnostic(conceptsToTest) {
    try {
        // Allow API calls in all environments for diagnostic testing
        console.log('🔍 DIAGNOSTIC API DEBUG: Attempting API call in', window.location.hostname, 'environment');

        // Get onboarding data from localStorage
        const schoolName = localStorage.getItem('onboarding_school');
        const courseName = localStorage.getItem('onboarding_course');
        const goalsData = localStorage.getItem('onboarding_goals');
        
        // Parse arrays from localStorage
        const goals = goalsData ? JSON.parse(goalsData) : [];
        
        // Validate we have the required data
        if (!schoolName || !courseName || goals.length === 0 || conceptsToTest.length === 0) {
            console.log('Missing onboarding data for diagnostic question loading:', {
                school: schoolName || 'MISSING',
                course: courseName || 'MISSING',
                goals: goals.length || 0,
                concepts: conceptsToTest.length || 0
            });
            return [];
        }
        
        // Check if API is available
        if (!window.QuizletApi || !window.QuizletApi.getQuestionsByConcept) {
            console.log('🔍 DIAGNOSTIC API DEBUG: QuizletApi not available or missing getQuestionsByConcept method');
            console.log('🔍 DIAGNOSTIC API DEBUG: window.QuizletApi:', window.QuizletApi);
            console.log('🔍 DIAGNOSTIC API DEBUG: Available API methods:', window.QuizletApi ? Object.keys(window.QuizletApi) : 'N/A');
            return [];
        }
        
        console.log('🔍 DIAGNOSTIC API DEBUG: QuizletApi available, proceeding with API calls');
        
        console.log('Loading diagnostic questions for:', {
            school: schoolName,
            course: courseName,
            goals: goals,
            concepts: conceptsToTest
        });
        
        // Fetch questions for each concept from all selected goals
        const allQuestions = [];
        const questionSet = new Set(); // To avoid duplicates
        
        for (const concept of conceptsToTest) {
            for (const goal of goals) {
                console.log('Fetching diagnostic questions for goal:', goal, 'concept:', concept);
                
                try {
                    // Use the hierarchical API to get questions for this specific concept and goal
                    const response = await window.QuizletApi.getQuestionsByConcept(schoolName, courseName, goal, concept);
                    
                    // Extract questions from the response
                    const questionsFromAPI = response?.content?.questions || [];
                    console.log('Diagnostic API returned:', questionsFromAPI.length, 'questions for goal:', goal, 'concept:', concept);
                    
                    // Process and add unique questions
                    questionsFromAPI.forEach((apiQuestion, index) => {
                        const questionId = apiQuestion.id || `${goal}-${concept}-${index}`;
                        if (!questionSet.has(questionId)) {
                            questionSet.add(questionId);
                            
                            // Map API question format to internal format
                            const mappedQuestion = mapApiQuestionToInternal(apiQuestion, allQuestions.length + 1);
                            allQuestions.push(mappedQuestion);
                        }
                    });
                    
                } catch (error) {
                    console.error('Error fetching diagnostic questions for goal:', goal, 'concept:', concept, error);
                    // Continue with other goals/concepts even if one fails
                }
            }
        }
        
        if (allQuestions.length > 0) {
            // Mark that we're using API-backed content
            window.USING_API_CONTENT = true;
            console.log(`Loaded ${allQuestions.length} diagnostic questions from API for concepts:`, conceptsToTest);
            return allQuestions;
        } else {
            console.log('No diagnostic questions found from API for concepts:', conceptsToTest);
            return [];
        }
        
    } catch (err) {
        console.error('Error loading diagnostic questions from API:', err);
        return [];
    }
}

// Map API question format to internal question format for diagnostics
function mapApiQuestionToInternal(apiQuestion, id) {
    const questionType = apiQuestion.type || 'multiple_choice';
    
    // Handle different API question formats
    let question = apiQuestion.question || apiQuestion.term || '';
    let correctAnswer = apiQuestion.correctAnswer || apiQuestion.definition || '';
    let options = [];
    
    if (questionType === 'multiple_choice' || questionType === 'mcq') {
        // Extract and filter options from API response
        let rawOptions = [];
        if (Array.isArray(apiQuestion.options) && apiQuestion.options.length > 0) {
            rawOptions = apiQuestion.options;
        } else if (Array.isArray(apiQuestion.choices) && apiQuestion.choices.length > 0) {
            rawOptions = apiQuestion.choices;
        }
        
        // Filter out empty, null, undefined, or whitespace-only options
        options = rawOptions.filter(option => 
            option != null && 
            typeof option === 'string' && 
            option.trim().length > 0 &&
            !option.toLowerCase().includes('not available') &&
            !option.toLowerCase().includes('no answer') &&
            !option.toLowerCase().includes('placeholder')
        );
        
        console.log('🔍 DIAGNOSTIC API FILTERING:', {
            questionId: id,
            rawOptions: rawOptions,
            filteredOptions: options,
            filteredCount: options.length
        });
        
        // If we don't have enough valid options after filtering, generate fallback
        if (options.length < 2) {
            console.log('🔍 DIAGNOSTIC API DEBUG: Insufficient valid options, using fallback. Raw options:', rawOptions);
            options = [correctAnswer, 'Option B', 'Option C', 'Option D'];
        }
        
        // Ensure correct answer is in options and is valid
        if (correctAnswer && correctAnswer.trim().length > 0 && !options.includes(correctAnswer)) {
            options[0] = correctAnswer;
        }
        
        // Final validation - ensure all options are still valid
        options = options.filter(option => 
            option && 
            typeof option === 'string' && 
            option.trim().length > 0
        );
        
        console.log('🔍 DIAGNOSTIC FINAL OPTIONS:', {
            questionId: id,
            finalOptions: options,
            correctAnswer: correctAnswer
        });
    } else {
        // For non-MCQ questions, set up as written response
        options = [];
    }
    
    return {
        id: id,
        question: question,
        correctAnswer: correctAnswer,
        options: options,
        type: questionType === 'mcq' ? 'multiple_choice' : questionType,
        source: 'api',
        _raw: apiQuestion // Store original API data
    };
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
        title: 'Quiz 2',
        loadTitleFromStorage: false,
        onBackClick: function() {
            window.location.href = '../html/study-plan.html';
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

// Update intro content based on diagnostic configuration
function updateIntroContent() {
    try {
        const diagnosticConfigStr = localStorage.getItem('diagnosticConfig');
        if (!diagnosticConfigStr) {
            console.log('🔍 INTRO: No diagnostic config found, keeping default content');
            return;
        }
        
        const diagnosticConfig = JSON.parse(diagnosticConfigStr);
        const { conceptsToTest, roundsTested, diagnosticNumber, testDescription } = diagnosticConfig;
        
        console.log('🔍 INTRO: Updating intro content with config:', diagnosticConfig);
        
        // Update intro subtitle with actual concepts being tested
        const introSubtitle = document.getElementById('introSubtitle');
        if (introSubtitle && conceptsToTest && conceptsToTest.length > 0) {
            const conceptsText = conceptsToTest.join(', ');
            introSubtitle.textContent = conceptsText;
            console.log('🔍 INTRO: Updated subtitle to:', conceptsText);
        }
        
        // Update quiz title in button to show correct quiz number
        const startTestBtn = document.getElementById('startTestBtn');
        if (startTestBtn && diagnosticNumber) {
            startTestBtn.textContent = `Start quiz ${diagnosticNumber}`;
            console.log('🔍 INTRO: Updated button to:', `Start quiz ${diagnosticNumber}`);
        }
        
        // Update page title if possible
        if (diagnosticNumber) {
            document.title = `Quiz ${diagnosticNumber} - Diagnostic Test`;
        }
        
        // Update question count based on rounds being tested
        const questionCountElement = document.querySelector('.detail-title');
        if (questionCountElement && roundsTested && roundsTested.length > 0) {
            const totalQuestions = roundsTested.length * (diagnosticConfig.questionsPerRound || 7);
            questionCountElement.textContent = `${Math.min(totalQuestions, 10)} Questions`;
            console.log('🔍 INTRO: Updated question count to:', Math.min(totalQuestions, 10));
        }
        
    } catch (error) {
        console.error('🔍 INTRO: Error updating intro content:', error);
        // Keep default content if there's an error
    }
}

// Initialize the diagnostic test
async function initDiagnosticTest() {
    // Initialize header component
    initializeHeader();
    
    // Update intro content based on diagnostic configuration
    updateIntroContent();
    
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
    
    // Try to load questions from API based on diagnostic configuration first
    try {
        const diagnosticConfigStr = localStorage.getItem('diagnosticConfig');
        if (diagnosticConfigStr) {
            const diagnosticConfig = JSON.parse(diagnosticConfigStr);
            const { conceptsToTest } = diagnosticConfig;
            
            // Try to fetch questions from API first
            const apiQuestions = await fetchQuestionsFromApiForDiagnostic(conceptsToTest);
            
            if (apiQuestions.length > 0) {
                // Use API questions - limit to 10 for diagnostic
                testQuestions = apiQuestions.slice(0, 10);
                console.log(`Using ${testQuestions.length} questions from API for diagnostic 2`);
            } else {
                // Fallback to static questions
                const shuffled = diagnosticQuestions.sort(() => 0.5 - Math.random());
                testQuestions = shuffled.slice(0, 10);
                console.log('Using static questions for diagnostic 2');
            }
        } else {
            // No diagnostic config - use static questions
            const shuffled = diagnosticQuestions.sort(() => 0.5 - Math.random());
            testQuestions = shuffled.slice(0, 10);
            console.log('No diagnostic config - using static questions for diagnostic 2');
        }
    } catch (error) {
        console.error('Error loading diagnostic questions:', error);
        // Fallback to static questions
        const shuffled = diagnosticQuestions.sort(() => 0.5 - Math.random());
        testQuestions = shuffled.slice(0, 10);
    }
    
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

// Apply dynamic text sizing based on character count (reused from study.js)
function applyDynamicTextSizing(element, text) {
    if (!element || !text) return;
    
    const charCount = text.length;
    
    console.log('🔤 Applying dynamic text sizing:', {
        text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        charCount: charCount,
        targetClass: getDynamicTextClass(charCount)
    });
    
    // Remove existing text size classes
    element.classList.remove('text-subheading-1', 'text-subheading-2', 'text-subheading-3', 'text-subheading-5');
    
    // Apply appropriate class based on character count
    element.classList.add(getDynamicTextClass(charCount));
}

// Helper function to determine text class based on character count (reused from study.js)
function getDynamicTextClass(charCount) {
    if (charCount <= 60) {
        return 'text-subheading-1';
    } else if (charCount <= 120) {
        return 'text-subheading-2';
    } else if (charCount <= 224) {
        return 'text-subheading-3';
    } else if (charCount <= 448) {
        return 'text-subheading-5';
    } else {
        // For very long text, use the smallest size
        return 'text-subheading-5';
    }
}

// Show the current question
function showQuestion() {
    currentQuestion = testQuestions[currentQuestionIndex];
    
    // Reset question text classes and set content
    questionText.className = 'question-text'; // Reset classes
    questionText.textContent = currentQuestion.question;
    
    // Apply dynamic text styling based on character count (reused from study.js)
    applyDynamicTextSizing(questionText, currentQuestion.question);
    
    setSourceBadge(questionText);
    
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
    
    console.log('🔍 DIAGNOSTIC MCQ OPTIONS DEBUG:', {
        questionId: currentQuestion?.id,
        hasOptions: !!currentQuestion?.options,
        options: currentQuestion?.options,
        optionsLength: currentQuestion?.options?.length
    });
    
    // Check if options exist and are valid
    if (!currentQuestion?.options || !Array.isArray(currentQuestion.options) || currentQuestion.options.length === 0) {
        console.error('❌ DIAGNOSTIC MCQ OPTIONS ERROR: No valid options found for question', currentQuestion?.id);
        console.error('Question data:', currentQuestion);
        return;
    }
    
    optionBtns.forEach((btn, index) => {
        const optionText = currentQuestion.options[index];
        
        // Skip empty or invalid options
        if (!optionText || typeof optionText !== 'string' || optionText.trim() === '') {
            console.warn('⚠️ DIAGNOSTIC: Skipping empty option at index', index, 'for question', currentQuestion.id);
            btn.style.display = 'none';
            return;
        }
        
        btn.style.display = 'flex';
        btn.textContent = optionText;
        btn.dataset.answer = optionText;
        btn.className = 'option-btn';
        btn.disabled = false;
        btn.style.cursor = 'pointer';
        
        // Add source badge (API/STATIC)
        setSourceBadge(btn);
        
        // Add correct answer pill for debugging
        addCorrectAnswerPill(btn, optionText);
    });
}

// Show text input
function showTextInput() {
    textInput.style.display = 'flex';
    questionPrompt.style.display = 'block';
    questionPrompt.textContent = 'Type your answer';
    textAnswer.value = '';
    textAnswer.classList.remove('incorrect', 'correct');
    textInput.classList.remove('incorrect', 'correct');
    textAnswer.disabled = false;
    submitBtn.disabled = false;
    submitBtn.classList.remove('show'); // Hidden until text is entered
    submitBtn.style.cursor = 'pointer';
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
    const cardsToMark = Math.round((testResults.accuracy / 100) * 14); // 14 cards in this range (22-35)
    

    
    // Mark diagnostic as completed
    localStorage.setItem('diagnostic2_completed', 'true');
    localStorage.setItem('diagnostic2_accuracy', testResults.accuracy.toString());
    localStorage.setItem('diagnostic2_cards_learned', cardsToMark.toString());
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
    
    // Text input change - show/hide submit button based on content (reused from study.js)
    textAnswer.addEventListener('input', (e) => {
        if (e.target.value.trim().length > 0) {
            submitBtn.classList.add('show');
        } else {
            submitBtn.classList.remove('show');
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
        window.location.href = '../html/study-plan.html?diagnostic=2&accuracy=' + testResults.accuracy;
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initDiagnosticTest); 