// Study session state
let currentQuestionIndex = 0;
let currentQuestion = null;
let selectedAnswer = null;
let isAnswered = false;
let questionsInRound = [];
let currentRoundProgress = 0;
let totalRoundsCompleted = 0;
let questionsPerRound = 7;
let currentRoundNumber = 1; // Track current round number
let roundProgressData = {}; // Track progress within each round

// Matching question state
let matchingPairs = [];
let selectedItems = []; // Store up to 2 selected items
let matchingItems = []; // Store all 12 items (6 terms + 6 definitions) for matching

// Round themes mapping
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



// Question data with adaptive difficulty tracking
const questions = [
    {
        id: 1,
        question: "What is the primary function of the cell membrane?",
        correctAnswer: "Regulate what enters and exits the cell",
        options: ["Regulate what enters and exits the cell", "Produce energy", "Store genetic material", "Break down waste"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 2,
        question: "Which organelle is responsible for producing energy in the form of ATP?",
        correctAnswer: "Mitochondria",
        options: ["Mitochondria", "Nucleus", "Golgi apparatus", "Endoplasmic reticulum"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 3,
        question: "What is the function of the nucleus?",
        correctAnswer: "Store and protect genetic material",
        options: ["Store and protect genetic material", "Produce proteins", "Break down molecules", "Transport materials"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 4,
        question: "Which of the following is NOT a function of the endoplasmic reticulum?",
        correctAnswer: "Energy production",
        options: ["Energy production", "Protein synthesis", "Lipid synthesis", "Detoxification"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 5,
        question: "What is the main function of lysosomes?",
        correctAnswer: "Break down waste and cellular debris",
        options: ["Break down waste and cellular debris", "Produce energy", "Store nutrients", "Transport proteins"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 6,
        question: "Which organelle is responsible for packaging and sorting proteins?",
        correctAnswer: "Golgi apparatus",
        options: ["Golgi apparatus", "Ribosomes", "Vacuoles", "Peroxisomes"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 7,
        question: "What is the function of ribosomes?",
        correctAnswer: "Synthesize proteins",
        options: ["Synthesize proteins", "Store energy", "Break down molecules", "Transport materials"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 8,
        question: "Which of the following is a characteristic of prokaryotic cells?",
        correctAnswer: "No membrane-bound organelles",
        options: ["No membrane-bound organelles", "Large size", "Complex internal structure", "Multiple nuclei"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 9,
        question: "What is the function of the cytoskeleton?",
        correctAnswer: "Provide structural support and enable movement",
        options: ["Provide structural support and enable movement", "Produce energy", "Store genetic material", "Break down waste"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 10,
        question: "Which organelle contains enzymes for breaking down fatty acids?",
        correctAnswer: "Peroxisomes",
        options: ["Peroxisomes", "Lysosomes", "Vacuoles", "Mitochondria"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 11,
        question: "What is the function of the cell wall in plant cells?",
        correctAnswer: "Provide structural support and protection",
        options: ["Provide structural support and protection", "Control what enters the cell", "Produce energy", "Store genetic material"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 12,
        question: "Which organelle is responsible for photosynthesis in plant cells?",
        correctAnswer: "Chloroplasts",
        options: ["Chloroplasts", "Mitochondria", "Vacuoles", "Golgi apparatus"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 13,
        question: "What is the function of the nucleolus?",
        correctAnswer: "Produce ribosomes",
        options: ["Produce ribosomes", "Store DNA", "Break down molecules", "Transport proteins"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 14,
        question: "Which of the following is a function of the smooth endoplasmic reticulum?",
        correctAnswer: "Lipid synthesis",
        options: ["Lipid synthesis", "Protein synthesis", "Energy production", "Waste breakdown"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 15,
        question: "What is the function of the rough endoplasmic reticulum?",
        correctAnswer: "Protein synthesis",
        options: ["Protein synthesis", "Lipid synthesis", "Energy production", "Waste breakdown"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 16,
        question: "Which organelle stores water, nutrients, and waste in plant cells?",
        correctAnswer: "Central vacuole",
        options: ["Central vacuole", "Lysosomes", "Peroxisomes", "Golgi apparatus"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 17,
        question: "What is the function of cilia and flagella?",
        correctAnswer: "Enable cell movement",
        options: ["Enable cell movement", "Produce energy", "Store nutrients", "Break down waste"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 18,
        question: "Which of the following is NOT found in animal cells?",
        correctAnswer: "Chloroplasts",
        options: ["Chloroplasts", "Mitochondria", "Nucleus", "Golgi apparatus"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 19,
        question: "What is the function of the nuclear envelope?",
        correctAnswer: "Separate nucleus from cytoplasm",
        options: ["Separate nucleus from cytoplasm", "Produce energy", "Synthesize proteins", "Break down molecules"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 20,
        question: "Which organelle is responsible for cellular respiration?",
        correctAnswer: "Mitochondria",
        options: ["Mitochondria", "Chloroplasts", "Nucleus", "Golgi apparatus"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 21,
        question: "What is the function of the plasma membrane?",
        correctAnswer: "Control what enters and exits the cell",
        options: ["Control what enters and exits the cell", "Produce energy", "Store genetic material", "Break down waste"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 22,
        question: "Which of the following is a characteristic of eukaryotic cells?",
        correctAnswer: "Membrane-bound organelles",
        options: ["Membrane-bound organelles", "Small size", "Simple structure", "No nucleus"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 23,
        question: "What is the function of the centrioles?",
        correctAnswer: "Organize microtubules during cell division",
        options: ["Organize microtubules during cell division", "Produce energy", "Store nutrients", "Break down waste"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 24,
        question: "Which organelle is responsible for detoxification in liver cells?",
        correctAnswer: "Smooth endoplasmic reticulum",
        options: ["Smooth endoplasmic reticulum", "Rough endoplasmic reticulum", "Golgi apparatus", "Lysosomes"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 25,
        question: "What is the function of the nuclear pores?",
        correctAnswer: "Allow materials to pass between nucleus and cytoplasm",
        options: ["Allow materials to pass between nucleus and cytoplasm", "Produce energy", "Synthesize proteins", "Break down molecules"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 26,
        question: "Which organelle contains digestive enzymes?",
        correctAnswer: "Lysosomes",
        options: ["Lysosomes", "Peroxisomes", "Vacuoles", "Golgi apparatus"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 27,
        question: "What is the function of the cell membrane proteins?",
        correctAnswer: "Transport molecules and cell signaling",
        options: ["Transport molecules and cell signaling", "Produce energy", "Store nutrients", "Break down waste"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 28,
        question: "Which of the following is found in both plant and animal cells?",
        correctAnswer: "Mitochondria",
        options: ["Mitochondria", "Chloroplasts", "Cell wall", "Central vacuole"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 29,
        question: "What is the function of the extracellular matrix?",
        correctAnswer: "Provide structural support and cell communication",
        options: ["Provide structural support and cell communication", "Produce energy", "Store genetic material", "Break down waste"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 30,
        question: "Which organelle is responsible for protein modification and packaging?",
        correctAnswer: "Golgi apparatus",
        options: ["Golgi apparatus", "Ribosomes", "Endoplasmic reticulum", "Lysosomes"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 31,
        question: "What is the function of the cytoskeleton microtubules?",
        correctAnswer: "Provide structural support and enable transport",
        options: ["Provide structural support and enable transport", "Produce energy", "Store nutrients", "Break down waste"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 32,
        question: "Which organelle is responsible for breaking down hydrogen peroxide?",
        correctAnswer: "Peroxisomes",
        options: ["Peroxisomes", "Lysosomes", "Vacuoles", "Mitochondria"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 33,
        question: "What is the function of the cell membrane phospholipids?",
        correctAnswer: "Form the basic structure of the membrane",
        options: ["Form the basic structure of the membrane", "Transport molecules", "Produce energy", "Store nutrients"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 34,
        question: "Which of the following is a function of the nucleus?",
        correctAnswer: "Control gene expression",
        options: ["Control gene expression", "Produce energy", "Break down molecules", "Transport materials"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 35,
        question: "What is the function of the cell membrane cholesterol?",
        correctAnswer: "Maintain membrane fluidity",
        options: ["Maintain membrane fluidity", "Transport molecules", "Produce energy", "Store nutrients"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 36,
        question: "Which organelle is responsible for cellular digestion?",
        correctAnswer: "Lysosomes",
        options: ["Lysosomes", "Peroxisomes", "Vacuoles", "Golgi apparatus"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 37,
        question: "What is the function of the cell membrane carbohydrates?",
        correctAnswer: "Cell recognition and communication",
        options: ["Cell recognition and communication", "Transport molecules", "Produce energy", "Store nutrients"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 38,
        question: "Which of the following is NOT a function of the cytoskeleton?",
        correctAnswer: "Energy production",
        options: ["Energy production", "Structural support", "Cell movement", "Organelle transport"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 39,
        question: "What is the function of the nuclear lamina?",
        correctAnswer: "Provide structural support to the nucleus",
        options: ["Provide structural support to the nucleus", "Produce energy", "Synthesize proteins", "Break down molecules"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 40,
        question: "Which organelle is responsible for lipid metabolism?",
        correctAnswer: "Smooth endoplasmic reticulum",
        options: ["Smooth endoplasmic reticulum", "Rough endoplasmic reticulum", "Golgi apparatus", "Lysosomes"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 41,
        question: "What is the function of the cell membrane glycoproteins?",
        correctAnswer: "Cell recognition and signaling",
        options: ["Cell recognition and signaling", "Transport molecules", "Produce energy", "Store nutrients"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 42,
        question: "Which of the following is a characteristic of plant cells?",
        correctAnswer: "Cell wall and chloroplasts",
        options: ["Cell wall and chloroplasts", "Centrioles", "Lysosomes", "Small vacuoles"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 43,
        question: "What is the function of the cell membrane glycolipids?",
        correctAnswer: "Cell recognition and protection",
        options: ["Cell recognition and protection", "Transport molecules", "Produce energy", "Store nutrients"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 44,
        question: "Which organelle is responsible for protein synthesis?",
        correctAnswer: "Ribosomes",
        options: ["Ribosomes", "Golgi apparatus", "Lysosomes", "Peroxisomes"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 45,
        question: "What is the function of the cell membrane integral proteins?",
        correctAnswer: "Transport molecules across the membrane",
        options: ["Transport molecules across the membrane", "Produce energy", "Store nutrients", "Break down waste"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 46,
        question: "Which of the following is a function of the nucleus?",
        correctAnswer: "DNA replication",
        options: ["DNA replication", "Energy production", "Protein synthesis", "Waste breakdown"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 47,
        question: "What is the function of the cell membrane peripheral proteins?",
        correctAnswer: "Cell signaling and support",
        options: ["Cell signaling and support", "Transport molecules", "Produce energy", "Store nutrients"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 48,
        question: "Which organelle is responsible for cellular respiration?",
        correctAnswer: "Mitochondria",
        options: ["Mitochondria", "Chloroplasts", "Nucleus", "Golgi apparatus"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 49,
        question: "What is the function of the cell membrane fluid mosaic model?",
        correctAnswer: "Describe the dynamic nature of the membrane",
        options: ["Describe the dynamic nature of the membrane", "Transport molecules", "Produce energy", "Store nutrients"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    },
    {
        id: 50,
        question: "Which of the following is NOT found in prokaryotic cells?",
        correctAnswer: "Membrane-bound organelles",
        options: ["Membrane-bound organelles", "Cell membrane", "Ribosomes", "DNA"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice"
    }
];

// DOM elements
const questionContainer = document.getElementById('questionContainer');
const questionText = document.getElementById('questionText');
const questionPrompt = document.getElementById('questionPrompt');
const multipleChoice = document.getElementById('multipleChoice');
const textInput = document.getElementById('textInput');
const trueFalse = document.getElementById('trueFalse');
const flashcard = document.getElementById('flashcard');
const flashcardElement = document.getElementById('flashcardElement');
const gotItBtn = document.getElementById('gotItBtn');
const studyAgainBtn = document.getElementById('studyAgainBtn');
const textAnswer = document.getElementById('textAnswer');
const submitBtn = document.getElementById('submitBtn');
const writtenFeedback = document.getElementById('writtenFeedback');
const correctAnswerFeedback = document.getElementById('correctAnswerFeedback');
const matching = document.getElementById('matching');
const matchingGrid = document.getElementById('matchingGrid');
const matchingSubmitBtn = document.getElementById('matchingSubmitBtn');
const currentQuestionEl = document.getElementById('currentQuestion');
const totalQuestionsEl = document.getElementById('totalQuestions');
const progressFill = document.getElementById('progressFill');
// Header component instance
let appHeader = null;

// QA helpers: show an "API" badge next to content if it came from the API
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
    element.querySelectorAll('.api-badge, .static-badge').forEach(b => b.remove());
    if (currentQuestion && currentQuestion._raw) {
        element.appendChild(createApiBadge());
    } else {
        element.appendChild(createStaticBadge());
    }
}

// Load questions from API based on URL params (search, subject, subcategory)
async function fetchAndLoadQuestionsFromApi() {
    // Skip API calls if they're likely to fail (development/local environment)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') {
        console.log('Skipping API calls in local environment - using static questions');
        return;
    }

    try {
        const params = new URLSearchParams(window.location.search);
        const search = params.get('search');
        const subject = params.get('subject');
        const subcategory = params.get('subcategory');

        let cards = [];
        if (search && window.QuizletApi?.searchFlashcards) {
            cards = await window.QuizletApi.searchFlashcards(search);
        } else if (subject && subcategory && window.QuizletApi?.getFlashcardsBySubjectAndSubcategory) {
            cards = await window.QuizletApi.getFlashcardsBySubjectAndSubcategory(subject, subcategory);
        } else if (subject && window.QuizletApi?.getFlashcardsBySubject) {
            cards = await window.QuizletApi.getFlashcardsBySubject(subject);
        } else if (window.QuizletApi?.getFlashcardsBySubject) {
            // No explicit subject: try preferred subject from home or first available from API
            let fallbackSubject = (localStorage.getItem('homeSubject') || '').trim();
            if (!fallbackSubject && window.QuizletApi?.getSubjects) {
                try {
                    const subjects = await window.QuizletApi.getSubjects();
                    if (Array.isArray(subjects) && subjects.length > 0) {
                        fallbackSubject = String(subjects[0]).toLowerCase();
                    }
                } catch (_) {
                    // Silently ignore getSubjects errors
                }
            }
            fallbackSubject = fallbackSubject || 'biology';
            cards = await window.QuizletApi.getFlashcardsBySubject(fallbackSubject);
        }

        const mapped = window.QuizletApi?.mapApiCardsToQuestions ? window.QuizletApi.mapApiCardsToQuestions(cards) : [];

        if (Array.isArray(mapped) && mapped.length > 0) {
            // Replace contents of the existing questions array (const)
            questions.length = 0;
            // Prefer a manageable number; keep up to 50 like the UI references
            const limited = mapped.slice(0, 50);
            limited.forEach(q => questions.push(q));
            // Mark that we're using API-backed content for this session
            window.USING_API_CONTENT = true;
            console.log(`Loaded ${limited.length} questions from API`);
        }
    } catch (err) {
        // Silently handle API errors in development
        console.log('API unavailable - using static questions');
    }
}

// Initialize header component
function initializeHeader() {
    const roundTheme = roundThemes[currentRoundNumber] || "Study Session";
    
    appHeader = new AppHeader({
        backUrl: '../html/study-plan.html',
        backButtonIcon: 'close',
        title: roundTheme,
        onBackClick: function() {
            // Close study session with confirmation
            if (confirm('Are you sure you want to end this study session? Your progress will be saved.')) {
                // Save current progress before leaving
                saveRoundProgress();
                updateStudyPathData();
                
                if (window.StudyPath) {
                    window.StudyPath.updateRoundProgress(currentRoundProgress);
                }
                
                // Set flag that user is coming from question screen for animation
                sessionStorage.setItem('fromQuestionScreen', 'true');
                
                window.location.href = '../html/study-plan.html';
            }
        },
        onSettingsClick: function() {
            showToast('Round settings coming soon!');
        }
    });
    
    appHeader.init();
}

// Update header title for current round
function updateHeaderTitle() {
    if (appHeader) {
        const roundTheme = roundThemes[currentRoundNumber] || "Study Session";
        appHeader.setTitle(roundTheme);
    }
}

// Initialize the study session
async function initStudySession() {
    // Load current round number from localStorage
    const savedRoundNumber = localStorage.getItem('currentRoundNumber');
    if (savedRoundNumber) {
        currentRoundNumber = parseInt(savedRoundNumber);
    }
    
    // Load round progress data from localStorage
    const savedRoundProgress = localStorage.getItem('roundProgressData');
    if (savedRoundProgress) {
        roundProgressData = JSON.parse(savedRoundProgress);
    }
    // Try to load content from API
    await fetchAndLoadQuestionsFromApi();
    
    // Check if we're starting a specific round or continuing
    const targetRound = localStorage.getItem('targetRound');
    if (targetRound && parseInt(targetRound) !== currentRoundNumber) {
        // Starting a specific round, reset progress for that round
        currentRoundNumber = parseInt(targetRound);
        localStorage.removeItem('targetRound');
    }
    
    // Initialize header component
    initializeHeader();
    
    // Update header title in case round number was loaded from storage
    updateHeaderTitle();
    
    initFirstRound();
    setupEventListeners();
}

// Start a new round
function startNewRound() {
    // Save current round progress before starting new round
    if (currentRoundProgress > 0) {
        saveRoundProgress();
    }
    
    questionsInRound = [];
    currentRoundNumber++;
    
    // Update header title for new round
    updateHeaderTitle();
    
    // Check if we have saved questions for this round
    const roundData = roundProgressData[currentRoundNumber];
    if (roundData && roundData.questionsInRound && roundData.questionsInRound.length > 0) {
        // Create a map for faster lookup
        const questionMap = new Map(questions.map(q => [q.id, q]));
        
        // Restore the exact same questions that were previously selected
        questionsInRound = roundData.questionsInRound
            .map(id => questionMap.get(id))
            .filter(q => q && q.currentFormat !== 'completed');
        
        // If some questions were completed, fill with new ones
        if (questionsInRound.length < 7) {
            const usedIds = new Set(roundData.questionsInRound);
            const availableQuestions = questions.filter(q => 
                q.currentFormat !== 'completed' && !usedIds.has(q.id)
            );
            const shuffled = availableQuestions.sort(() => 0.5 - Math.random());
            const additionalQuestions = shuffled.slice(0, 7 - questionsInRound.length);
            questionsInRound.push(...additionalQuestions);
        }
    } else {
        // Use original logic for new rounds
        const availableQuestions = questions.filter(q => q.currentFormat !== 'completed');
        const shuffled = availableQuestions.sort(() => 0.5 - Math.random());
        questionsInRound = shuffled.slice(0, Math.min(7, availableQuestions.length));
        
        // Assign random question formats for better experience
        assignRandomQuestionFormats();
    }
    
    if (questionsInRound.length === 0) {
        // All questions completed
        endStudySession();
        return;
    }
    
    // Restore progress for the new round
    restoreRoundProgress();
    
    updateProgress();
    showQuestion();
}

// Assign random question formats to questions in round
function assignRandomQuestionFormats() {
    if (questionsInRound.length === 0) return;
    
    // Available question types
    const questionTypes = ['multiple_choice', 'written', 'matching', 'flashcard'];
    
    // Assign random formats to questions
    questionsInRound.forEach((question) => {
        // Randomly select a question type
        const randomIndex = Math.floor(Math.random() * questionTypes.length);
        question.currentFormat = questionTypes[randomIndex];
    });
    
    console.log('Assigned random question formats:', questionsInRound.map(q => q.currentFormat));
}

// Initialize the first round (called on session start)
function initFirstRound() {
    questionsInRound = [];
    
    // Check if we have saved questions for this round
    const roundData = roundProgressData[currentRoundNumber];
    if (roundData && roundData.questionsInRound && roundData.questionsInRound.length > 0) {
        // Create a map for faster lookup
        const questionMap = new Map(questions.map(q => [q.id, q]));
        
        // Restore the exact same questions that were previously selected
        questionsInRound = roundData.questionsInRound
            .map(id => questionMap.get(id))
            .filter(q => q && q.currentFormat !== 'completed');
        
        // If some questions were completed, fill with new ones
        if (questionsInRound.length < 7) {
            const usedIds = new Set(roundData.questionsInRound);
            const availableQuestions = questions.filter(q => 
                q.currentFormat !== 'completed' && !usedIds.has(q.id)
            );
            const shuffled = availableQuestions.sort(() => 0.5 - Math.random());
            const additionalQuestions = shuffled.slice(0, 7 - questionsInRound.length);
            questionsInRound.push(...additionalQuestions);
        }
    } else {
        // Use original logic for new rounds
        const availableQuestions = questions.filter(q => q.currentFormat !== 'completed');
        const shuffled = availableQuestions.sort(() => 0.5 - Math.random());
        questionsInRound = shuffled.slice(0, Math.min(7, availableQuestions.length));
        
        // Assign random question formats for better experience
        assignRandomQuestionFormats();
    }
    
    if (questionsInRound.length === 0) {
        // All questions completed
        endStudySession();
        return;
    }
    
    // Restore progress within the current round
    restoreRoundProgress();
    
    updateProgress();
    showQuestion();
}

// Show the current question
function showQuestion() {
    currentQuestion = questionsInRound[currentQuestionIndex];
    
    // Only set question text for question types that need it (not matching or flashcard)
    if (currentQuestion.currentFormat !== 'matching' && currentQuestion.currentFormat !== 'flashcard') {
        questionText.textContent = currentQuestion.question;
        // Add source badge next to the question text
        setSourceBadge(questionText);
    }
    
    // Hide all answer types
    multipleChoice.style.display = 'none';
    textInput.style.display = 'none';
    trueFalse.style.display = 'none';
    flashcard.style.display = 'none';
    matching.style.display = 'none';
    
    // Remove layout classes
    const studyContent = document.querySelector('.study-content');
    if (studyContent) {
        studyContent.classList.remove('matching-layout');
    }
    
    // Show the appropriate answer type based on current format
    switch (currentQuestion.currentFormat) {
        case 'multiple_choice':
            showMultipleChoice();
            break;
        case 'flashcard':
            showFlashcard();
            break;
        case 'written':
            showTextInput();
            break;
        case 'true_false':
            showTrueFalse();
            break;
        case 'matching':
            showMatching();
            break;
    }
    
    // Reset state
    selectedAnswer = null;
    isAnswered = false;
    
    // Show question container only for question types that need it
    if (currentQuestion.currentFormat !== 'matching' && currentQuestion.currentFormat !== 'flashcard') {
        questionContainer.style.display = 'block';
        questionContainer.classList.remove('fade-out');
    } else {
        questionContainer.style.display = 'none';
    }
}

// Show multiple choice options
function showMultipleChoice() {
    multipleChoice.style.display = 'flex';
    questionPrompt.textContent = 'Choose the correct answer';
    const optionBtns = multipleChoice.querySelectorAll('.option-btn');
    
    // Shuffle the options array to randomize answer position
    const shuffledOptions = [...currentQuestion.options].sort(() => Math.random() - 0.5);
    
    optionBtns.forEach((btn, index) => {
        btn.textContent = shuffledOptions[index];
        btn.dataset.answer = shuffledOptions[index];
        btn.className = 'option-btn'; // Reset all classes
        btn.classList.remove('selected', 'correct', 'correct-selected', 'incorrect', 'shake'); // Explicitly remove any lingering states
        btn.disabled = false;
        btn.style.cursor = 'pointer';
        // Add source badge to each option
        setSourceBadge(btn);
    });
}

// Show flashcard
function showFlashcard() {
    flashcard.style.display = 'flex';
    questionPrompt.textContent = 'Tap the card to flip';
    
    // Set flashcard content
    const termEl = flashcard.querySelector('.flashcard-term');
    const definitionEl = flashcard.querySelector('.flashcard-definition');
    
    termEl.textContent = currentQuestion.question;
    definitionEl.textContent = currentQuestion.correctAnswer;
    // Add source badges to flashcard faces
    setSourceBadge(termEl);
    setSourceBadge(definitionEl);
    
    // Reset flashcard state - hide buttons until card is flipped
    flashcardElement.classList.remove('flipped');
    gotItBtn.style.display = 'none';
    studyAgainBtn.style.display = 'none';
}

// Show text input
function showTextInput() {
    textInput.style.display = 'flex';
    questionPrompt.textContent = 'Type your answer';
    textAnswer.value = '';
    textAnswer.classList.remove('incorrect', 'correct');
    textInput.classList.remove('incorrect', 'correct');
    textAnswer.disabled = false;
    submitBtn.disabled = false;
    submitBtn.classList.remove('show'); // Hidden until text is entered
    submitBtn.style.cursor = 'pointer';
    writtenFeedback.style.display = 'none';
    textAnswer.focus();
}

// Show true/false options
function showTrueFalse() {
    trueFalse.style.display = 'flex';
    const optionBtns = trueFalse.querySelectorAll('.option-btn');
    
    // Create a true/false question based on the original
    const isCorrect = Math.random() > 0.5;
    const falseAnswer = getRandomWrongAnswer();
    
    if (isCorrect) {
        optionBtns[0].textContent = `The capital is ${currentQuestion.correctAnswer}`;
        optionBtns[0].dataset.answer = 'true';
        optionBtns[1].textContent = `The capital is ${falseAnswer}`;
        optionBtns[1].dataset.answer = 'false';
    } else {
        optionBtns[0].textContent = `The capital is ${falseAnswer}`;
        optionBtns[0].dataset.answer = 'true';
        optionBtns[1].textContent = `The capital is ${currentQuestion.correctAnswer}`;
        optionBtns[1].dataset.answer = 'false';
    }
    
    optionBtns.forEach(btn => {
        btn.className = 'option-btn';
        btn.classList.remove('selected', 'correct', 'correct-selected', 'incorrect'); // Clear any lingering states
        btn.disabled = false;
        btn.style.cursor = 'pointer';
        // Add source badge to T/F options (always static today)
        setSourceBadge(btn);
    });
}

// Show matching exercise
function showMatching() {
    matching.style.display = 'flex';
    questionPrompt.textContent = 'Match the items below';
    
    // Add compact layout class for optimized screen usage
    const studyContent = document.querySelector('.study-content');
    if (studyContent) {
        studyContent.classList.add('matching-layout');
    }
    
    // Reset matching state
    matchingPairs = [];
    selectedItems = [];
    
    // Generate 6 questions for matching (current question + 5 random others)
    generateMatchingItems();
    
    // Render all items in grid
    renderMatchingGrid();
}

// Generate 3 questions for matching and create 6 items (3 terms + 3 definitions)
function generateMatchingItems() {
    const matchingQuestions = [currentQuestion];
    
    // Get 2 other questions randomly (reduced from 5)
    const otherQuestions = questions.filter(q => q.id !== currentQuestion.id);
    const shuffled = otherQuestions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 2);
    
    matchingQuestions.push(...selected);
    
    // Create array of all items (terms and definitions)
    matchingItems = [];
    
    matchingQuestions.forEach((question, questionIndex) => {
        // Add term (question)
        matchingItems.push({
            id: `term-${questionIndex}`,
            text: question.question,
            type: 'term',
            pairId: `def-${questionIndex}`,
            questionIndex: questionIndex
        });
        
        // Add definition (answer)
        matchingItems.push({
            id: `def-${questionIndex}`,
            text: question.correctAnswer,
            type: 'definition', 
            pairId: `term-${questionIndex}`,
            questionIndex: questionIndex
        });
    });
    
    // Shuffle all items for random positioning
    matchingItems.sort(() => 0.5 - Math.random());
}

// Render all matching items in a single grid
function renderMatchingGrid() {
    // Clear existing items
    matchingGrid.innerHTML = '';
    
    // Render all items
    matchingItems.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'matching-item';
        itemElement.textContent = item.text;
        itemElement.dataset.itemId = item.id;
        itemElement.dataset.itemIndex = index;
        itemElement.addEventListener('click', () => handleItemClick(index));
        setSourceBadge(itemElement);
        matchingGrid.appendChild(itemElement);
    });
    
    // Hide submit button since we auto-advance
    matchingSubmitBtn.style.display = 'none';
}

// Handle item selection in matching grid
function handleItemClick(itemIndex) {
    if (isAnswered) return;
    
    const item = matchingItems[itemIndex];
    const itemElement = matchingGrid.children[itemIndex];
    
    // Can't select already matched items
    if (itemElement.classList.contains('matched')) return;
    
    // If item is already selected, deselect it
    if (selectedItems.includes(itemIndex)) {
        selectedItems = selectedItems.filter(i => i !== itemIndex);
        itemElement.classList.remove('selected');
        return;
    }
    
    // Can only select 2 items at a time
    if (selectedItems.length >= 2) {
        // Clear previous selections
        selectedItems.forEach(index => {
            matchingGrid.children[index].classList.remove('selected');
        });
        selectedItems = [];
    }
    
    // Select this item
    selectedItems.push(itemIndex);
    itemElement.classList.add('selected');
    
    // If 2 items are selected, try to create a match
    if (selectedItems.length === 2) {
        setTimeout(() => createMatch(), 100); // Quick response for better UX
    }
}

// Create a match between two selected items
function createMatch() {
    if (selectedItems.length !== 2) return;
    
    const [firstIndex, secondIndex] = selectedItems;
    const firstItem = matchingItems[firstIndex];
    const secondItem = matchingItems[secondIndex];
    const firstElement = matchingGrid.children[firstIndex];
    const secondElement = matchingGrid.children[secondIndex];
    
    // Check if these items form a correct pair
    const isCorrectMatch = firstItem.pairId === secondItem.id || secondItem.pairId === firstItem.id;
    
    if (isCorrectMatch) {
        // Valid match - store it and give immediate positive feedback
        const matchNumber = matchingPairs.length + 1;
        matchingPairs.push({
            firstIndex: firstIndex,
            secondIndex: secondIndex,
            matchNumber: matchNumber,
            isCorrect: true
        });
        
        // Immediate positive feedback
        firstElement.classList.remove('selected');
        firstElement.classList.add('correct-match');
        
        secondElement.classList.remove('selected');
        secondElement.classList.add('correct-match');
        
        // Add lightspeed animation after brief green flash
        setTimeout(() => {
            firstElement.classList.remove('correct-match');
            firstElement.classList.add('matched', 'lightspeed');
            secondElement.classList.remove('correct-match');
            secondElement.classList.add('matched', 'lightspeed');
            
            // Elements will be hidden automatically by the lightspeed animation
        }, 400); // Reduced timing for smoother experience
        
        // Update prompt with positive feedback
        questionPrompt.textContent = 'Excellent!';
        questionPrompt.classList.add('feedback');
        
        // Check if all pairs are matched (3 total)
        if (matchingPairs.length === 3) {
            // Immediately advance after all matches complete
            selectedAnswer = 'matching_complete';
            isAnswered = true;
            checkAnswer();
        } else {
            // Reset prompt after feedback
            setTimeout(() => {
                questionPrompt.textContent = 'Match the items below';
                questionPrompt.classList.remove('feedback');
            }, 1200); // Slightly reduced timing for better flow
        }
    } else {
        // Invalid match - immediate negative feedback with shake
        firstElement.classList.add('incorrect', 'shake');
        secondElement.classList.add('incorrect', 'shake');
        
        // Update prompt with negative feedback
        questionPrompt.textContent = 'Try again';
        questionPrompt.classList.add('feedback', 'incorrect');
        
        setTimeout(() => {
            firstElement.classList.remove('selected', 'incorrect', 'shake');
            secondElement.classList.remove('selected', 'incorrect', 'shake');
            
            // Reset prompt
            questionPrompt.textContent = 'Match the items below';
            questionPrompt.classList.remove('feedback', 'incorrect');
        }, 800); // Slightly reduced timing
    }
    
    // Reset selections
    selectedItems = [];
}

// Get a random wrong answer for true/false questions
function getRandomWrongAnswer() {
    let wrongAnswers = [];
    if (Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0) {
        wrongAnswers = currentQuestion.options.filter(option => option !== currentQuestion.correctAnswer);
    }
    if (wrongAnswers.length === 0) {
        // Fallback: use other questions' correct answers as distractors
        wrongAnswers = questions
            .map(q => q.correctAnswer)
            .filter(ans => ans && ans !== currentQuestion.correctAnswer);
    }
    if (wrongAnswers.length === 0) {
        return 'Not applicable';
    }
    return wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
}

// Handle answer selection
function handleAnswerSelect(answer) {
    if (isAnswered) return;
    
    selectedAnswer = answer;
    isAnswered = true;
    
    // Update UI to show selection
    if (currentQuestion.currentFormat === 'multiple_choice' || currentQuestion.currentFormat === 'true_false') {
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => {
            if (btn.dataset.answer === answer) {
                btn.classList.add('selected');
            }
        });
    }
    
    // Check answer after a brief delay
    setTimeout(checkAnswer, 200);
}

// Check if the answer is correct
function checkAnswer() {
    let isCorrect = false;
    
    if (currentQuestion.currentFormat === 'flashcard' && selectedAnswer === 'study_again') {
        // User clicked "Study again" on flashcard - treat as incorrect
        isCorrect = false;
        currentQuestion.attempts++;
    } else if (currentQuestion.currentFormat === 'written') {
        // For written questions, check if answer contains key words from correct answer
        const userAnswer = selectedAnswer.toLowerCase().trim();
        const correctAnswer = currentQuestion.correctAnswer.toLowerCase().trim();
        
        // Simple matching: check if user answer contains key words
        const correctWords = correctAnswer.split(' ').filter(word => word.length > 2);
        const userWords = userAnswer.split(' ');
        
        // Consider correct if user answer contains most key words
        const matchedWords = correctWords.filter(word => 
            userWords.some(userWord => userWord.includes(word) || word.includes(userWord))
        );
        
        isCorrect = matchedWords.length >= Math.ceil(correctWords.length * 0.6); // 60% match threshold
        
        // Update question statistics
        currentQuestion.attempts++;
        if (isCorrect) {
            currentQuestion.correct++;
        }
    } else if (currentQuestion.currentFormat === 'matching') {
        // For matching questions, check how many pairs are correct
        let correctMatches = 0;
        
        matchingPairs.forEach(pair => {
            if (pair.isCorrect) {
                correctMatches++;
            }
        });
        
        // Consider correct if at least 2 out of 3 matches are right (67% threshold)
        isCorrect = correctMatches >= 2;
        
        // Update question statistics
        currentQuestion.attempts++;
        if (isCorrect) {
            currentQuestion.correct++;
        }
        
        // Store the score for feedback
        selectedAnswer = `${correctMatches}/3 correct matches`;
    } else {
        isCorrect = selectedAnswer === currentQuestion.correctAnswer;
        
        // Update question statistics
        currentQuestion.attempts++;
        if (isCorrect) {
            currentQuestion.correct++;
        }
    }
    

    
    // Show feedback BEFORE adapting difficulty
    showFeedback(isCorrect);
    
    // Adapt difficulty for next time in this round
    adaptDifficulty(isCorrect);
    
    // Update progress immediately after answering
    updateProgress(true); // Force full progress after answering
    
    // Save round progress after each answer
    saveRoundProgress();
}

// Adapt question difficulty based on performance
function adaptDifficulty(isCorrect) {
    if (isCorrect) {
        // Make harder next time in this round
        switch (currentQuestion.currentFormat) {
            case 'multiple_choice':
                currentQuestion.currentFormat = 'written';
                break;
            case 'written':
                currentQuestion.currentFormat = 'matching';
                break;
            case 'matching':
                currentQuestion.currentFormat = 'flashcard';
                break;
            case 'flashcard':
                currentQuestion.currentFormat = 'completed';
                break;
            case 'true_false':
                currentQuestion.currentFormat = 'multiple_choice';
                break;
        }
    } else {
        // Make easier next time in this round
        switch (currentQuestion.currentFormat) {
            case 'multiple_choice':
                currentQuestion.currentFormat = 'multiple_choice'; // Stay at multiple choice
                break;
            case 'written':
                currentQuestion.currentFormat = 'multiple_choice';
                break;
            case 'matching':
                currentQuestion.currentFormat = 'written';
                break;
            case 'flashcard':
                currentQuestion.currentFormat = 'matching';
                break;
            case 'true_false':
                currentQuestion.currentFormat = 'multiple_choice';
                break;
        }
    }
}

// Show feedback
function showFeedback(isCorrect) {
    // Update UI to show correct/incorrect answers
    if (currentQuestion.currentFormat === 'multiple_choice' || currentQuestion.currentFormat === 'true_false') {
        // Add a small delay for smoother transition
        setTimeout(() => {
            const optionBtns = document.querySelectorAll('.option-btn');
            optionBtns.forEach(btn => {
                // Clear all previous states first
                btn.classList.remove('selected', 'correct', 'correct-selected', 'incorrect', 'shake');
                
                // Always show the correct answer
                if (btn.dataset.answer === currentQuestion.correctAnswer) {
                    if (isCorrect) {
                        btn.classList.add('correct-selected');
                    } else {
                        btn.classList.add('correct');
                    }
                }
                // Show the incorrect selected answer if user got it wrong
                if (btn.dataset.answer === selectedAnswer && !isCorrect) {
                    btn.classList.add('incorrect', 'shake');
                    
                    // Remove shake class after animation completes
                    setTimeout(() => {
                        btn.classList.remove('shake');
                    }, 500);
                }
            });
        }, 100); // Quicker feedback transition
    } else if (currentQuestion.currentFormat === 'written') {
        // Show feedback for written questions
        if (isCorrect) {
            textAnswer.classList.add('correct');
            textInput.classList.add('correct');
            // For correct answers, just show the correct answer in green
            correctAnswerFeedback.textContent = currentQuestion.correctAnswer;
            setSourceBadge(correctAnswerFeedback);
            writtenFeedback.style.display = 'flex';
        } else {
            textAnswer.classList.add('incorrect');
            textInput.classList.add('incorrect');
            // User's incorrect answer stays in the input field with red styling
            // Just show the correct answer below
            correctAnswerFeedback.textContent = currentQuestion.correctAnswer;
            setSourceBadge(correctAnswerFeedback);
            writtenFeedback.style.display = 'flex';
        }
        
        // Disable input and hide submit button  
        textAnswer.disabled = true;
        submitBtn.classList.remove('show');
    } else if (currentQuestion.currentFormat === 'matching') {
        // Feedback for matching questions is handled in real-time during createMatch()
        // No additional feedback needed here since items fade out immediately
    }
    
    // Handle flashcard feedback
    if (currentQuestion.currentFormat === 'flashcard') {
        if (isCorrect) {
            questionPrompt.textContent = 'Great job!';
            questionPrompt.classList.add('feedback');
            
            // Auto-advance to next question after 1.0 seconds for correct answers
            setTimeout(() => {
                nextQuestion();
            }, 1000);
        } else {
            questionPrompt.textContent = 'Keep studying!';
            questionPrompt.classList.add('feedback', 'incorrect');
            
            // For flashcard incorrect answers, add a continue button
            const continueBtn = document.createElement('button');
            continueBtn.textContent = 'Continue';
            continueBtn.className = 'continue-btn';
            
            continueBtn.addEventListener('click', () => {
                nextQuestion();
            });
            
            // Insert the button into the app container (fixed positioned)
            document.body.appendChild(continueBtn);
        }
        return;
    }
    
    // Update the prompt text to show feedback for other question types
    if (isCorrect) {
        questionPrompt.textContent = 'Excellent!';
        questionPrompt.classList.add('feedback');
        
        // Auto-advance to next question after 1.0 seconds for correct answers
        setTimeout(() => {
            nextQuestion();
        }, 1000);
    } else {
        questionPrompt.textContent = 'No worries, learning is a process!';
        questionPrompt.classList.add('feedback', 'incorrect');
        
        // For incorrect answers, add a manual continue option immediately
        // Add a continue button for incorrect answers immediately
        const continueBtn = document.createElement('button');
        continueBtn.textContent = 'Continue';
        continueBtn.className = 'continue-btn';
        
        continueBtn.addEventListener('click', () => {
            nextQuestion();
        });
        
        // Insert the button into the body (fixed positioned)
        document.body.appendChild(continueBtn);
    }
    
    // Disable all option buttons
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'default';
    });
}

// Move to next question
function nextQuestion() {
    currentQuestionIndex++;
    currentRoundProgress++;
    
    if (currentQuestionIndex >= questionsInRound.length) {
        // End of current round - return to study path
        totalRoundsCompleted++;
        saveRoundProgress();
        completeRound();
        return;
    }
    
    // Remove any continue buttons that might have been added
    const continueBtn = document.querySelector('.continue-btn');
    if (continueBtn) {
        continueBtn.remove();
    }
    
    // Smooth transition to next question
    const questionContainer = document.querySelector('.question-container');
    questionContainer.classList.add('fade-out');
    
    setTimeout(() => {
        // Reset prompt and show next question
        questionPrompt.classList.remove('feedback', 'incorrect');
        questionPrompt.style.color = '';
        questionPrompt.textContent = 'Choose the answer';
        
        // Reset written question state
        if (textAnswer) {
            textAnswer.disabled = false;
            textAnswer.classList.remove('incorrect', 'correct');
        }
        if (textInput) {
            textInput.classList.remove('incorrect', 'correct');
        }
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('show'); // Hide submit button initially
            submitBtn.style.cursor = 'pointer';
        }
        if (writtenFeedback) {
            writtenFeedback.style.display = 'none';
        }
        
        // Reset flashcard state
        if (gotItBtn && studyAgainBtn) {
            gotItBtn.style.display = 'none';
            studyAgainBtn.style.display = 'none';
        }
        
        // Reset option button states
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => {
            btn.classList.remove('selected', 'correct', 'correct-selected', 'incorrect', 'shake');
            btn.disabled = false;
            btn.style.cursor = 'pointer';
        });
        
        showQuestion();
        updateProgress();
        
        // Fade back in
        questionContainer.classList.remove('fade-out');
    }, 150);
}

// Update studyPathData with current progress 
function updateStudyPathData() {
    try {
        // Load existing studyPathData or create new one
        let studyPathData = {};
        const savedData = localStorage.getItem('studyPathData');
        if (savedData) {
            studyPathData = JSON.parse(savedData);
        }
        
        // Update current round and progress
        studyPathData.currentRound = currentRoundNumber;
        studyPathData.currentRoundProgress = currentRoundProgress;
        
        // Update round-specific progress
        if (!studyPathData.roundProgress) {
            studyPathData.roundProgress = {};
        }
        
        // Update progress for current round
        studyPathData.roundProgress[currentRoundNumber] = currentRoundProgress;
        
        // Calculate completed rounds based on questions with 'completed' format
        const completedQuestions = questions.filter(q => q.currentFormat === 'completed').length;
        const questionsPerRound = studyPathData.questionsPerRound || 7;
        const completedRounds = Math.floor(completedQuestions / questionsPerRound);
        studyPathData.completedRounds = Math.max(studyPathData.completedRounds || 0, completedRounds);
        
        // Save updated studyPathData
        localStorage.setItem('studyPathData', JSON.stringify(studyPathData));
        
        console.log('Updated studyPathData from study screen:', {
            currentRound: studyPathData.currentRound,
            currentRoundProgress: studyPathData.currentRoundProgress,
            completedRounds: studyPathData.completedRounds
        });
    } catch (error) {
        console.error('Error updating studyPathData:', error);
    }
}

// Save current round progress
function saveRoundProgress() {
    // Calculate overall progress across all questions for home screen
    const totalQuestions = questions.length;
    const completedQuestions = questions.filter(q => q.currentFormat === 'completed').length;
    const overallProgress = Math.round((completedQuestions / totalQuestions) * 100);
    
    // Save overall progress to localStorage for home screen
    localStorage.setItem('studyProgress', overallProgress);
    localStorage.setItem('currentQuestionIndex', completedQuestions);
    
    // Save current round progress to localStorage
    localStorage.setItem('currentRoundNumber', currentRoundNumber);
    localStorage.setItem('currentRoundProgress', currentRoundProgress);
    
    // Save detailed round progress data
    roundProgressData[currentRoundNumber] = {
        questionIndex: currentQuestionIndex,
        progress: currentRoundProgress,
        questionsInRound: questionsInRound.map(q => q.id)
    };
    localStorage.setItem('roundProgressData', JSON.stringify(roundProgressData));
    
    // Also update studyPathData to keep it in sync
    updateStudyPathData();
    
    // Update study path progress
    if (window.StudyPath) {
        window.StudyPath.updateRoundProgress(currentRoundProgress);
    }
}

// Restore progress within the current round
function restoreRoundProgress() {
    const roundData = roundProgressData[currentRoundNumber];
    
    if (roundData && roundData.questionIndex > 0) {
        // Restore progress within the round
        currentQuestionIndex = roundData.questionIndex;
        currentRoundProgress = roundData.progress;
        
        // Ensure we don't exceed the round length
        if (currentQuestionIndex >= questionsInRound.length) {
            currentQuestionIndex = questionsInRound.length - 1;
            currentRoundProgress = questionsInRound.length;
        }
    } else {
        // Start from beginning of round
        currentQuestionIndex = 0;
        currentRoundProgress = 0;
    }
}

// Complete current round and return to study path
function completeRound() {
    // Mark round as completed in study path
    if (window.StudyPath) {
        window.StudyPath.markRoundCompleted(currentRoundNumber);
    }
    
    // Save final progress
    saveRoundProgress();
    
    // Update studyPathData to mark round as completed
    updateStudyPathData();
    
    // Clear round progress data for completed round
    delete roundProgressData[currentRoundNumber];
    localStorage.setItem('roundProgressData', JSON.stringify(roundProgressData));
    
    // Set flag that user is coming from question screen for animation
    sessionStorage.setItem('fromQuestionScreen', 'true');
    
    // Navigate back to study path
    window.location.href = '../html/study-plan.html';
}

// Update progress bar and counter
function updateProgress(forceFullProgress = false) {
    // Calculate round progress for display
    // Show progress based on questions completed, not questions viewed
    let roundProgress;
    
    if (forceFullProgress && currentQuestionIndex === questionsInRound.length - 1) {
        // After answering the last question, show 100%
        roundProgress = 100;
    } else {
        // Show progress based on completed questions (currentQuestionIndex represents completed questions)
        roundProgress = (currentQuestionIndex / questionsInRound.length) * 100;
    }
    
    const progressBar = document.querySelector('.progress-bar');
    const progressCounter = document.getElementById('progressCounter');
    
    // Handle zero state (first question)
    if (roundProgress === 0) {
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
            progressFill.style.width = `${roundProgress}%`;
        }
        if (progressCounter) {
            progressCounter.style.left = `${roundProgress}%`;
        }
    }
    
    currentQuestionEl.textContent = currentQuestionIndex + 1;
    
    // Save progress to localStorage
    saveRoundProgress();
}

// End study session
function endStudySession() {
    // Calculate results
    const totalCorrect = questions.reduce((sum, q) => sum + q.correct, 0);
    const totalAttempts = questions.reduce((sum, q) => sum + q.attempts, 0);
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    
    // Calculate current round based on questions completed
    const currentRound = Math.floor(currentQuestionIndex / questionsPerRound) + 1;
    
    // Update study path data
    if (window.StudyPath) {
        window.StudyPath.markRoundCompleted(currentRound);
        window.StudyPath.updateRoundProgress(questionsPerRound);
    }
    
    // Save final progress and update studyPathData
    saveRoundProgress();
    updateStudyPathData();
    
    // Save accuracy to localStorage
    localStorage.setItem('studyAccuracy', accuracy);
    
    // Set flag that user is coming from question screen for animation
    sessionStorage.setItem('fromQuestionScreen', 'true');
    
    // Navigate to study path screen
    window.location.href = '../html/study-plan.html';
}

// Setup event listeners
function setupEventListeners() {
    // Multiple choice and true/false buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('option-btn') && !isAnswered) {
            handleAnswerSelect(e.target.dataset.answer);
        }
    });
    
    // Save progress when user leaves the page
    window.addEventListener('beforeunload', () => {
        saveRoundProgress();
    });
    
    // Save progress when page becomes hidden (mobile apps, tab switching)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            saveRoundProgress();
        }
    });
    
    // Handle icon loading
    handleIconLoading();
    
    // Flashcard interaction
    flashcardElement.addEventListener('click', () => {
        if (currentQuestion.currentFormat === 'flashcard' && !isAnswered && !flashcardElement.classList.contains('flipped')) {
            flashcardElement.classList.add('flipped');
            // Show buttons after card is flipped
            setTimeout(() => {
                gotItBtn.style.display = 'block';
                studyAgainBtn.style.display = 'block';
            }, 300); // Delay to sync with flip animation
        }
    });
    
    // Flashcard buttons
    gotItBtn.addEventListener('click', () => {
        if (currentQuestion.currentFormat === 'flashcard') {
            selectedAnswer = currentQuestion.correctAnswer;
            isAnswered = true;
            checkAnswer();
        }
    });
    
    studyAgainBtn.addEventListener('click', () => {
        if (currentQuestion.currentFormat === 'flashcard') {
            selectedAnswer = 'study_again';
            isAnswered = true;
            checkAnswer();
        }
    });
    
    // Text input submit
    submitBtn.addEventListener('click', () => {
        if (!isAnswered && textAnswer.value.trim()) {
            handleAnswerSelect(textAnswer.value.trim());
        }
    });
    
    // Text input enter key
    textAnswer.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !isAnswered && textAnswer.value.trim()) {
            handleAnswerSelect(textAnswer.value.trim());
        }
    });
    
    // Text input change - show/hide submit button based on content
    textAnswer.addEventListener('input', (e) => {
        if (currentQuestion && currentQuestion.currentFormat === 'written') {
            if (e.target.value.trim().length > 0) {
                submitBtn.classList.add('show');
            } else {
                submitBtn.classList.remove('show');
            }
        }
    });
    
    // Matching submit button removed - we auto-advance now
    
    // Navigation is now handled by AppHeader component
}

// Handle Material Icons loading
function handleIconLoading() {
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
        }, 100);
    }
}

// Reset questions array to initial state
function resetQuestionsArray() {
    questions.forEach(question => {
        question.attempts = 0;
        question.correct = 0;
        question.currentFormat = question.difficulty || 'multiple_choice';
    });
}

// Make reset function available globally
window.resetQuestionsArray = resetQuestionsArray;

// Initialize when DOM is loaded
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

document.addEventListener('DOMContentLoaded', initStudySession); 