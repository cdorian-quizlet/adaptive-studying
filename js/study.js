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
let lastShownQuestionFormat = null; // Track last shown format to prevent consecutive matching/flashcard
let isTransitioning = false; // Prevent race conditions in question transitions

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
        currentFormat: "multiple_choice",
        explanation: "The cell membrane, also called the plasma membrane, acts as a selective barrier that controls what substances can enter and leave the cell. It's made of a phospholipid bilayer with embedded proteins that help transport specific molecules. This selective permeability is crucial for maintaining the cell's internal environment and allowing it to respond to external changes.",
        conceptImage: "../images/thumbnails.png",
        formula: "Selective Permeability = f(concentration gradient, membrane proteins, lipid solubility)"
    },
    {
        id: 2,
        question: "Which organelle is responsible for producing energy in the form of ATP?",
        correctAnswer: "Mitochondria",
        options: ["Mitochondria", "Nucleus", "Golgi apparatus", "Endoplasmic reticulum"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice",
        explanation: "Mitochondria are often called the 'powerhouses of the cell' because they generate most of the cell's ATP (adenosine triphosphate) through cellular respiration. They have a unique double-membrane structure with inner folds called cristae that increase the surface area for energy production. Interestingly, mitochondria have their own DNA and likely evolved from ancient bacteria that formed a symbiotic relationship with early eukaryotic cells.",
        conceptImage: "../images/upward-graph.png",
        formula: "C6H12O6 + 6O2 → 6CO2 + 6H2O + ~30-38 ATP"
    },
    {
        id: 3,
        question: "What is the function of the nucleus?",
        correctAnswer: "Store and protect genetic material",
        options: ["Store and protect genetic material", "Produce proteins", "Break down molecules", "Transport materials"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice",
        explanation: "The nucleus is the control center of eukaryotic cells, containing most of the cell's DNA organized into chromosomes. It's surrounded by a double membrane called the nuclear envelope, which has pores that regulate what can enter and exit. The nucleus controls gene expression and coordinates cellular activities like growth, metabolism, and reproduction. Think of it as the cell's 'brain' that gives instructions to the rest of the cell."
    },
    {
        id: 4,
        question: "Which of the following is NOT a function of the endoplasmic reticulum?",
        correctAnswer: "Energy production",
        options: ["Energy production", "Protein synthesis", "Lipid synthesis", "Detoxification"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice",
        explanation: "The endoplasmic reticulum (ER) is a network of membranes involved in protein and lipid synthesis, as well as detoxification processes. However, energy production (ATP synthesis) is primarily the function of mitochondria, not the ER. The rough ER synthesizes proteins, the smooth ER makes lipids and detoxifies substances, but neither produces energy."
    },
    {
        id: 5,
        question: "What is the main function of lysosomes?",
        correctAnswer: "Break down waste and cellular debris",
        options: ["Break down waste and cellular debris", "Produce energy", "Store nutrients", "Transport proteins"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice",
        explanation: "Lysosomes are membrane-bound organelles that function as the cell's 'digestive system.' They contain powerful digestive enzymes that break down worn-out organelles, cellular waste, and harmful substances that enter the cell. Think of them as the cell's recycling center and cleanup crew, keeping the cell healthy by removing damaged components and toxic materials."
    },
    {
        id: 6,
        question: "Which organelle is responsible for packaging and sorting proteins?",
        correctAnswer: "Golgi apparatus",
        options: ["Golgi apparatus", "Ribosomes", "Vacuoles", "Peroxisomes"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice",
        explanation: "The Golgi apparatus acts like the cell's post office, receiving proteins from the endoplasmic reticulum and modifying, packaging, and shipping them to their final destinations. It consists of stacked membranes called cisternae that add chemical tags to proteins, determining where they should go in the cell or if they should be exported outside the cell."
    },
    {
        id: 7,
        question: "What is the function of ribosomes?",
        correctAnswer: "Synthesize proteins",
        options: ["Synthesize proteins", "Store energy", "Break down molecules", "Transport materials"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice",
        explanation: "Ribosomes are the protein factories of the cell. They read the genetic instructions from messenger RNA (mRNA) and assemble amino acids in the correct order to build proteins. Ribosomes can be found floating freely in the cytoplasm or attached to the endoplasmic reticulum, and they're essential for all life since every living thing needs to make proteins."
    },
    {
        id: 8,
        question: "Which of the following is a characteristic of prokaryotic cells?",
        correctAnswer: "No membrane-bound organelles",
        options: ["No membrane-bound organelles", "Large size", "Complex internal structure", "Multiple nuclei"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice",
        explanation: "Prokaryotic cells, like bacteria, are much simpler than eukaryotic cells. They lack membrane-bound organelles such as a nucleus, mitochondria, or endoplasmic reticulum. Instead, their genetic material floats freely in the cytoplasm, and all cellular functions occur in a single compartment. Despite their simplicity, prokaryotes are incredibly successful and have been on Earth for billions of years."
    },
    {
        id: 9,
        question: "What is the function of the cytoskeleton?",
        correctAnswer: "Provide structural support and enable movement",
        options: ["Provide structural support and enable movement", "Produce energy", "Store genetic material", "Break down waste"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice",
        explanation: "The cytoskeleton is like the cell's internal scaffolding system. Made of protein fibers including microtubules, actin filaments, and intermediate filaments, it gives the cell its shape, provides structural support, and enables movement. It also acts like highways for transporting materials within the cell and helps organize organelles in their proper locations."
    },
    {
        id: 10,
        question: "Which organelle contains enzymes for breaking down fatty acids?",
        correctAnswer: "Peroxisomes",
        options: ["Peroxisomes", "Lysosomes", "Vacuoles", "Mitochondria"],
        difficulty: "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: "multiple_choice",
        explanation: "Peroxisomes are specialized organelles that contain enzymes for breaking down fatty acids and detoxifying harmful substances like hydrogen peroxide. They're particularly important in liver cells where they help process fats and neutralize toxins. The name 'peroxisome' comes from their role in producing and then breaking down hydrogen peroxide, a potentially dangerous chemical byproduct."
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

function createCorrectBadge() {
    const badge = document.createElement('span');
    badge.className = 'correct-badge';
    badge.textContent = 'CORRECT';
    badge.style.cssText = `
        display: inline-block;
        margin-left: 8px;
        padding: 2px 6px;
        border-radius: 6px;
        font-size: 11px;
        line-height: 1;
        color: #059669;
        background: #D1FAE5;
        vertical-align: middle;
    `;
    return badge;
}

function setSourceBadge(element) {
    if (!element) return;
    element.querySelectorAll('.api-badge, .static-badge').forEach(b => b.remove());
    if (currentQuestion && (currentQuestion._raw || currentQuestion.source === 'api' || window.USING_API_CONTENT)) {
        element.appendChild(createApiBadge());
    } else {
        element.appendChild(createStaticBadge());
    }
}

function setCorrectBadge(element, isCorrectAnswer = false) {
    if (!element) return;
    // Remove any existing correct badge
    element.querySelectorAll('.correct-badge').forEach(b => b.remove());
    // Only add CORRECT badge to the correct answer option
    if (isCorrectAnswer) {
        element.appendChild(createCorrectBadge());
    }
}

// Load questions from API based on onboarding data and current round
async function fetchAndLoadQuestionsFromApi() {
    try {
        // Get onboarding data from localStorage
        const schoolName = localStorage.getItem('onboarding_school');
        const courseName = localStorage.getItem('onboarding_course');
        const goalsData = localStorage.getItem('onboarding_goals');
        const conceptsData = localStorage.getItem('onboarding_concepts');
        const currentRoundNumber = parseInt(localStorage.getItem('currentRoundNumber')) || 1;
        
        // Parse arrays from localStorage
        const goals = goalsData ? JSON.parse(goalsData) : [];
        const concepts = conceptsData ? JSON.parse(conceptsData) : [];
        
        // Validate we have the required data
        if (!schoolName || !courseName || goals.length === 0 || concepts.length === 0) {
            console.log('Missing onboarding data for question loading:', {
                school: schoolName || 'MISSING',
                course: courseName || 'MISSING',
                goals: goals.length || 0,
                concepts: concepts.length || 0
            });
            // Fallback to URL params or legacy API
            return await fetchLegacyQuestions();
        }
        
        // Get the concept for the current round (rounds start at 1, array index starts at 0)
        const conceptIndex = currentRoundNumber - 1;
        const currentConcept = concepts[conceptIndex];
        
        if (!currentConcept) {
            console.log('No concept found for round:', currentRoundNumber, 'Available concepts:', concepts.length);
            return await fetchLegacyQuestions();
        }
        
        console.log('Loading questions for:', {
            school: schoolName,
            course: courseName,
            goals: goals,
            concept: currentConcept,
            round: currentRoundNumber
        });
        
        // Fetch questions for this concept from all selected goals
        const allQuestions = [];
        const questionSet = new Set(); // To avoid duplicates
        
        for (const goal of goals) {
            console.log('Fetching questions for goal:', goal, 'concept:', currentConcept);
            
            try {
                // Use the hierarchical API to get questions for this specific concept and goal
                const response = await window.QuizletApi.getQuestionsByConcept(schoolName, courseName, goal, currentConcept);
                
                // Extract questions from the response
                const questionsFromAPI = response?.content?.questions || [];
                console.log('Questions API returned:', questionsFromAPI.length, 'questions for goal:', goal, 'concept:', currentConcept);
                
                // Process and add unique questions
                questionsFromAPI.forEach((apiQuestion, index) => {
                    const questionId = apiQuestion.id || `${goal}-${currentConcept}-${index}`;
                    if (!questionSet.has(questionId)) {
                        questionSet.add(questionId);
                        
                        // Map API question format to internal format
                        const mappedQuestion = mapApiQuestionToInternal(apiQuestion, allQuestions.length + 1);
                        
                        // Debug MCQ questions from API
                        if (mappedQuestion.currentFormat === 'multiple_choice') {
                            console.log('🔍 API MCQ DEBUG:', {
                                questionId: mappedQuestion.id,
                                question: mappedQuestion.question?.substring(0, 50) + '...',
                                correctAnswer: mappedQuestion.correctAnswer,
                                options: mappedQuestion.options,
                                originalApiData: {
                                    type: apiQuestion.type,
                                    correctAnswer: apiQuestion.correctAnswer,
                                    options: apiQuestion.options
                                }
                            });
                        }
                        
                        allQuestions.push(mappedQuestion);
                    }
                });
                
            } catch (error) {
                console.error('Error fetching questions for goal:', goal, 'concept:', currentConcept, error);
                // Continue with other goals even if one fails
            }
        }
        
        if (allQuestions.length > 0) {
            // Replace contents of the existing questions array
            questions.length = 0;
            // Limit to a manageable number for the study session
            const limited = allQuestions.slice(0, 50);
            limited.forEach(q => questions.push(q));
            
            // Mark that we're using API-backed content
            window.USING_API_CONTENT = true;
            console.log(`Loaded ${limited.length} questions from API for concept: ${currentConcept}`);
            
            // Update header title now that we have the correct concept loaded
            updateHeaderTitle();
        } else {
            console.log('No questions found for concept:', currentConcept, '- falling back to legacy questions');
            // Show shimmer while loading fallback questions
            if (multipleChoice) {
                showMultipleChoiceShimmer();
            }
            return await fetchLegacyQuestions();
        }
        
    } catch (err) {
        console.error('Error loading questions from hierarchical API:', err);
        // Fallback to legacy API
        return await fetchLegacyQuestions();
    }
}

// Fallback to legacy API method
async function fetchLegacyQuestions() {
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
            console.log(`Loaded ${limited.length} questions from legacy API`);
            
            // Update header title to ensure it reflects the correct concept
            updateHeaderTitle();
        }
    } catch (err) {
        console.log('API unavailable - using static questions');
    }
}

// Map API question format to internal question format
function mapApiQuestionToInternal(apiQuestion, id) {
    const questionType = apiQuestion.type || apiQuestion.difficulty || 'multiple_choice';
    const mappedFormat = mapQuestionTypeToFormat(questionType);
    
    console.log('🔍 DEBUG: Mapping API question:', {
        originalType: questionType,
        mappedFormat: mappedFormat,
        hasOptions: !!(apiQuestion.options && apiQuestion.options.length > 0),
        apiOptions: apiQuestion.options,
        question: apiQuestion.question?.substring(0, 50) + '...'
    });
    
    // Generate MCQ options if needed
    let questionOptions = undefined;
    if (mappedFormat === 'multiple_choice') {
        if (apiQuestion.options && Array.isArray(apiQuestion.options) && apiQuestion.options.length > 0) {
            // Use API provided options
            questionOptions = apiQuestion.options;
            console.log('✅ Using API options:', questionOptions);
        } else {
            // Generate fallback options for MCQ questions without proper options
            console.log('⚠️ Generating fallback MCQ options for question:', id);
            questionOptions = generateFallbackMCQOptions(apiQuestion);
        }
    }
    
    return {
        id: id,
        question: apiQuestion.question || 'Question not available',
        correctAnswer: getCorrectAnswerFromAPI(apiQuestion),
        options: questionOptions,
        difficulty: apiQuestion.difficulty || apiQuestion.type || "multiple_choice",
        attempts: 0,
        correct: 0,
        currentFormat: mappedFormat,
        explanation: apiQuestion.explanation || 'No explanation available',
        conceptImage: "../images/thumbnails.png", // Default image
        formula: apiQuestion.formula || null,
        taxonomy: apiQuestion.taxonomy || 'recall',
        source: 'api'
    };
}

// Ensure MCQ questions have options (for questions converted by adaptive learning)
function ensureMCQOptions(question) {
    if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
        console.log('🔧 ENSURING MCQ OPTIONS: Question converted to MCQ but lacks options:', question.id);
        question.options = generateFallbackMCQOptions(question);
        console.log('✅ Generated options for converted MCQ question:', question.options);
    }
}

// Generate fallback MCQ options when API doesn't provide them
function generateFallbackMCQOptions(apiQuestion) {
    const correctAnswer = getCorrectAnswerFromAPI(apiQuestion);
    
    // Common biology wrong answers for different question types
    const biologyDistractors = [
        'Nucleus', 'Mitochondria', 'Cell membrane', 'Ribosomes', 'Golgi apparatus',
        'Endoplasmic reticulum', 'Lysosomes', 'Cytoplasm', 'Chloroplasts', 'Vacuoles',
        'Cytoskeleton', 'Peroxisomes', 'Centrioles', 'Cell wall', 'Chromatin',
        'Energy production', 'Protein synthesis', 'DNA storage', 'Waste breakdown',
        'Transport materials', 'Cellular respiration', 'Photosynthesis', 'Cell division',
        'Structural support', 'Enzyme production', 'Hormone regulation', 'Signal transduction'
    ];
    
    // Filter out the correct answer from distractors
    const availableDistractors = biologyDistractors.filter(distractor => 
        distractor.toLowerCase() !== correctAnswer.toLowerCase() &&
        !correctAnswer.toLowerCase().includes(distractor.toLowerCase()) &&
        !distractor.toLowerCase().includes(correctAnswer.toLowerCase())
    );
    
    // Shuffle and take 3 random distractors
    const shuffledDistractors = availableDistractors.sort(() => Math.random() - 0.5);
    const selectedDistractors = shuffledDistractors.slice(0, 3);
    
    // Create options array with correct answer and distractors
    const options = [correctAnswer, ...selectedDistractors];
    
    // Shuffle the final options
    const shuffledOptions = options.sort(() => Math.random() - 0.5);
    
    console.log('📋 Generated fallback MCQ options:', {
        correctAnswer: correctAnswer,
        allOptions: shuffledOptions,
        source: 'generated'
    });
    
    return shuffledOptions;
}

// Helper function to get correct answer from API question
function getCorrectAnswerFromAPI(apiQuestion) {
    const questionType = String(apiQuestion.type || '').toLowerCase();
    
    if (questionType === 'multiple_choice') {
        const correctIndex = apiQuestion.correctAnswer;
        if (typeof correctIndex === 'number' && apiQuestion.options && apiQuestion.options[correctIndex]) {
            return apiQuestion.options[correctIndex];
        }
    }
    
    // For written/text questions, try different possible fields
    return apiQuestion.correctAnswer || 
           apiQuestion.answer || 
           apiQuestion.expectedAnswer || 
           apiQuestion.solution ||
           'Answer not available';
}

// Helper function to map API question type to internal format
function mapQuestionTypeToFormat(type) {
    const lowerType = String(type).toLowerCase();
    
    switch (lowerType) {
        case 'multiple_choice':
        case 'multiple choice':
        case 'mcq':
            return 'multiple_choice';
        case 'written':
        case 'short_answer':
        case 'text':
        case 'essay':
        case 'fill_in_blank':
            return 'text';
        case 'flashcard':
        case 'flash_card':
            return 'flashcard';
        case 'matching':
            return 'matching';
        default:
            // Default to text for unknown types to avoid empty MCQ issues
            console.log('🔍 DEBUG: Unknown question type defaulting to text:', type);
            return 'text';
    }
}

// Initialize header component
function initializeHeader() {
    const initialTitle = getCurrentConcept() || "Study Session";
    
    appHeader = new AppHeader({
        backUrl: '../html/study-plan.html',
        backButtonIcon: 'close',
        title: initialTitle,
        loadTitleFromStorage: false, // Disable auto-loading title so we can manage it dynamically
        onBackClick: function() {
            // Close study session and save progress
            console.log('🔙 USER CLICKED BACK - SAVING PROGRESS BEFORE LEAVING');
            
            // Save current progress before leaving
            console.log('💾 Saving round progress...');
            saveRoundProgress();
            console.log('💾 Updating study path data...');
            updateStudyPathData();
            
            if (window.StudyPath) {
                console.log('📞 Calling StudyPath.updateRoundProgress one final time...');
                try {
                    window.StudyPath.updateRoundProgress(currentRoundProgress);
                } catch (error) {
                    console.log('ℹ️ StudyPath integration optional in mastery-based system');
                }
            } else {
                // StudyPath integration is optional - using local progress tracking
            }
            
            // Set flag that user is coming from question screen for animation
            sessionStorage.setItem('fromQuestionScreen', 'true');
            console.log('🏁 Navigating back to study plan...');
            
            window.location.href = '../html/study-plan.html';
        },
        onSettingsClick: function() {
            console.log('Settings button clicked - attempting to open debug sheet');
            openDebugBottomSheet();
        }
    });
    
    appHeader.init();
}

// Update header title for current concept
function updateHeaderTitle() {
    if (appHeader) {
        const concept = getCurrentConcept() || "Study Session";
        appHeader.setTitle(concept);
    }
}

// Apply dynamic text sizing based on character count
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

// Helper function to determine text class based on character count
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

// Get current concept from onboarding data based on current round
function getCurrentConcept() {
    // First try to get concept from onboarding data based on current round
    try {
        const conceptsData = localStorage.getItem('onboarding_concepts');
        if (conceptsData) {
            const concepts = JSON.parse(conceptsData);
            const conceptIndex = currentRoundNumber - 1;
            const currentConcept = concepts[conceptIndex];
            if (currentConcept) {
                console.log('Header concept from onboarding:', currentConcept, 'for round:', currentRoundNumber);
                return currentConcept;
            }
        }
    } catch (error) {
        console.error('Error getting concept from onboarding data:', error);
    }
    
    // Try to get concept from current question
    if (currentQuestion && currentQuestion.concept) {
        return currentQuestion.concept;
    }
    
    // Try to extract concept from question text for biology topics (legacy fallback)
    if (currentQuestion && currentQuestion.question) {
        const questionText = currentQuestion.question.toLowerCase();
        
        // Map common question patterns to concepts
        if (questionText.includes('cell membrane') || questionText.includes('plasma membrane')) {
            return 'Cell Membrane';
        } else if (questionText.includes('mitochondri')) {
            return 'Mitochondria';
        } else if (questionText.includes('nucleus')) {
            return 'Cell Nucleus';
        } else if (questionText.includes('endoplasmic reticulum') || questionText.includes(' er ')) {
            return 'Endoplasmic Reticulum';
        } else if (questionText.includes('lysosome')) {
            return 'Lysosomes';
        } else if (questionText.includes('golgi')) {
            return 'Golgi Apparatus';
        } else if (questionText.includes('ribosome')) {
            return 'Ribosomes';
        } else if (questionText.includes('prokaryotic') || questionText.includes('eukaryotic')) {
            return 'Cell Types';
        } else if (questionText.includes('cytoskeleton')) {
            return 'Cytoskeleton';
        } else if (questionText.includes('peroxisome')) {
            return 'Peroxisomes';
        } else if (questionText.includes('cell wall')) {
            return 'Cell Wall';
        } else if (questionText.includes('chloroplast')) {
            return 'Chloroplasts';
        } else if (questionText.includes('vacuole')) {
            return 'Vacuoles';
        } else if (questionText.includes('cilia') || questionText.includes('flagella')) {
            return 'Cell Movement';
        } else if (questionText.includes('photosynthesis')) {
            return 'Photosynthesis';
        } else if (questionText.includes('cellular respiration')) {
            return 'Cellular Respiration';
        }
    }
    
    // Final fallback to round themes for legacy compatibility
    return roundThemes[currentRoundNumber] || "Study Session";
}

// Adaptive learning initialization removed - using simplified grading system

// Initialize the study session
async function initStudySession() {
    // Show initial loading shimmer states
    showInitialShimmerStates();
    
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
    
    // Adaptive learning engine removed - using simplified grading system
    
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

// Show initial shimmer states while content is loading
function showInitialShimmerStates() {
    // Show question text shimmer
    showQuestionTextShimmer();
    
    // Show multiple choice shimmer
    multipleChoice.style.display = 'flex';
    showMultipleChoiceShimmer();
    
    console.log('✨ Showing initial shimmer loading states');
}

// Start a new round
function startNewRound() {
    // Save current round progress before starting new round
    if (currentRoundProgress > 0) {
        saveRoundProgress();
    }
    
    questionsInRound = [];
    currentRoundNumber++;
    
    // Reset consecutive format tracking for new round
    lastShownQuestionFormat = null;
    
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
        assignAdaptiveQuestionFormats();
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

// Assign adaptive question formats to questions in round
function assignAdaptiveQuestionFormats() {
    if (questionsInRound.length === 0) return;
    
    // In mastery-based system, start all questions as multiple choice (most accessible)
    // Users will see easier formats (flashcard/matching) only after getting MCQ wrong
    questionsInRound.forEach((question, index) => {
        question.currentFormat = 'multiple_choice';
        console.log(`📝 QUESTION ${index + 1} FORMAT: ${question.currentFormat} (ID: ${question.id})`);
    });
    
    console.log('✅ FORMAT ASSIGNMENT: All questions start as multiple choice for mastery-based learning');
}

// Initialize the first round (called on session start)
function initFirstRound() {
    questionsInRound = [];
    
    // Reset consecutive format tracking for session start
    lastShownQuestionFormat = null;
    
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
        assignAdaptiveQuestionFormats();
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

// Reset all feedback states from previous question
function resetAllFeedbackStates() {
    console.log('🧹 RESET: Clearing all feedback states');
    
    // Reset global state
    selectedAnswer = null;
    isAnswered = false;
    
    // Reset multiple choice buttons
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach(btn => {
        // Clear shimmer elements
        const shimmerLines = btn.querySelectorAll('.shimmer-line');
        shimmerLines.forEach(line => line.remove());
        
        // Clear all badges
        btn.querySelectorAll('.api-badge, .static-badge, .correct-badge').forEach(b => b.remove());
        
        btn.classList.remove('selected', 'correct', 'correct-selected', 'incorrect', 'shake', 'shimmer');
        btn.disabled = false;
        btn.style.cursor = 'pointer';
    });
    
    // Reset written question elements
    if (textAnswer) {
        textAnswer.classList.remove('incorrect', 'correct');
        textAnswer.disabled = false;
        textAnswer.value = '';
    }
    if (textInput) {
        textInput.classList.remove('incorrect', 'correct');
    }
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('show');
        submitBtn.style.cursor = 'pointer';
    }
    if (writtenFeedback) {
        console.log('🔍 RESET: Clearing written feedback in resetAllFeedbackStates', {
            hasShowClass: writtenFeedback.classList.contains('show'),
            currentQuestionFormat: currentQuestion?.currentFormat,
            stack: new Error().stack.split('\n').slice(1, 4) // Just show top few calls
        });
        
        writtenFeedback.classList.remove('show');
        writtenFeedback.style.visibility = '';
        writtenFeedback.style.opacity = '';
        writtenFeedback.style.display = ''; // Clear inline display style
    }
    if (correctAnswerFeedback) {
        correctAnswerFeedback.textContent = '';
    }
    
    // Reset flashcard elements
    if (flashcardElement) {
        flashcardElement.classList.remove('flipped');
    }
    if (gotItBtn && studyAgainBtn) {
        gotItBtn.style.display = 'none';
        studyAgainBtn.style.display = 'none';
    }
    
    // Reset matching elements
    selectedItems = [];
    matchingPairs = [];
    const matchingItems = document.querySelectorAll('.matching-item');
    matchingItems.forEach(item => {
        item.classList.remove('selected', 'matched', 'lightspeed', 'hidden', 'shake', 'incorrect', 'correct-match');
        item.style.pointerEvents = '';
    });
    
    // Remove any button containers from previous question
    const buttonContainer = document.querySelector('.button-container');
    if (buttonContainer) {
        buttonContainer.remove();
    }
    const continueBtn = document.querySelector('.continue-btn');
    if (continueBtn) {
        continueBtn.remove();
    }
    removeExplanationButton();
    
    console.log('✅ RESET: All feedback states cleared');
}

// Show the current question
function showQuestion() {
    // In mastery-based system, cycle back to beginning if we've reached the end
    if (currentQuestionIndex >= questionsInRound.length) {
        currentQuestionIndex = 0;
        console.log('🔄 CYCLING BACK: Reset to first question for continued mastery');
    }
    
    // Skip questions that are already mastered (completed)
    let attempts = 0;
    while (attempts < questionsInRound.length && questionsInRound[currentQuestionIndex].currentFormat === 'completed') {
        currentQuestionIndex++;
        if (currentQuestionIndex >= questionsInRound.length) {
            currentQuestionIndex = 0;
        }
        attempts++;
    }
    
    // If all questions are mastered, complete the round
    if (attempts >= questionsInRound.length) {
        console.log('🏁 ALL QUESTIONS MASTERED: Completing round');
        completeRound();
        return;
    }
    
    currentQuestion = questionsInRound[currentQuestionIndex];
    
    // Validate that we have a valid question
    if (!currentQuestion) {
        console.error('🚨 QUESTION ERROR: No question found at index:', {
            currentQuestionIndex,
            questionsInRound: questionsInRound.map(q => ({ id: q?.id, format: q?.currentFormat }))
        });
        // Try to complete round gracefully
        completeRound();
        return;
    }
    
    console.log('📝 SHOWING QUESTION:', {
        questionIndex: currentQuestionIndex,
        questionId: currentQuestion.id,
        totalQuestions: questionsInRound.length,
        roundProgress: currentRoundProgress,
        questionFormat: currentQuestion.currentFormat
    });
    
    // Apply consecutive matching/flashcard prevention when showing questions
    if (lastShownQuestionFormat && 
        (lastShownQuestionFormat === 'matching' || lastShownQuestionFormat === 'flashcard') &&
        (currentQuestion.currentFormat === 'matching' || currentQuestion.currentFormat === 'flashcard')) {
        
        console.log(`Preventing consecutive ${lastShownQuestionFormat} -> ${currentQuestion.currentFormat} when showing question ${currentQuestion.id}`);
        
        // Override with multiple choice as the safest alternative
        currentQuestion.currentFormat = 'multiple_choice';
    }
    
    // Update tracking variable
    lastShownQuestionFormat = currentQuestion.currentFormat;
    
    // Update header title with current concept
    updateHeaderTitle();
    
    // Reset ALL feedback states from previous question
    resetAllFeedbackStates();
    
    // Reset question prompt classes and text
    questionPrompt.classList.remove('flashcard-prompt', 'feedback', 'incorrect');
    
    // Only set question text for question types that need it (not matching or flashcard)
    if (currentQuestion.currentFormat !== 'matching' && currentQuestion.currentFormat !== 'flashcard') {
        // Clear any shimmer elements from question text
        const questionShimmerLines = questionText.querySelectorAll('.shimmer-line');
        questionShimmerLines.forEach(line => line.remove());
        
        questionText.className = 'question-text'; // Reset classes
        questionText.textContent = currentQuestion.question;
        // Apply dynamic text styling based on character count
        applyDynamicTextSizing(questionText, currentQuestion.question);
        // Add source badge next to the question text
        setSourceBadge(questionText);
    }
    
    // Hide all answer types
    multipleChoice.style.display = 'none';
    textInput.style.display = 'none';

    flashcard.style.display = 'none';
    matching.style.display = 'none';
    
    // Remove layout classes
    const studyContent = document.querySelector('.study-content');
    if (studyContent) {
        studyContent.classList.remove('matching-layout');
    }
    
    // Show the appropriate answer type based on current format
    console.log('🔍 DEBUG: Showing question with format:', currentQuestion.currentFormat, 'Type:', currentQuestion.difficulty);
    
    switch (currentQuestion.currentFormat) {
        case 'multiple_choice':
            // Ensure MCQ questions have options before showing
            ensureMCQOptions(currentQuestion);
            showMultipleChoice();
            break;
        case 'flashcard':
            showFlashcard();
            break;
        case 'text':
        case 'written':
            showTextInput();
            break;
        case 'matching':
            showMatching();
            break;
        default:
            console.log('🔍 DEBUG: Unknown question format, defaulting to text input:', currentQuestion.currentFormat);
            showTextInput();
            break;
    }
    
    // Reset state
    selectedAnswer = null;
    isAnswered = false;
    
    // Update debug info for new question
    updateAdaptiveLearningDebugInfo();
    
    // Show question container only for question types that need it
    if (currentQuestion.currentFormat !== 'matching' && currentQuestion.currentFormat !== 'flashcard') {
        questionContainer.style.display = 'block';
        questionContainer.classList.remove('fade-out');
    } else {
        questionContainer.style.display = 'none';
    }
}

// Show shimmer loading state for multiple choice options
function showMultipleChoiceShimmer() {
    const optionBtns = multipleChoice.querySelectorAll('.option-btn');
    optionBtns.forEach((btn, index) => {
        btn.textContent = ''; // Clear any existing text
        btn.dataset.answer = '';
        btn.className = 'option-btn shimmer';
        btn.disabled = true;
        btn.style.cursor = 'default';
        btn.style.opacity = '1';
        
        // Create shimmer line element
        const shimmerLine = document.createElement('div');
        shimmerLine.className = 'shimmer-line';
        btn.appendChild(shimmerLine);
    });
    console.log('✨ Showing shimmer loading state for multiple choice options');
}

// Show shimmer loading state for question text
function showQuestionTextShimmer() {
    const questionTextEl = document.getElementById('questionText');
    if (!questionTextEl) return;
    
    questionTextEl.textContent = ''; // Clear any existing text
    questionTextEl.className = 'question-text shimmer';
    
    // Create two shimmer lines
    const shimmerLine1 = document.createElement('div');
    shimmerLine1.className = 'shimmer-line';
    questionTextEl.appendChild(shimmerLine1);
    
    const shimmerLine2 = document.createElement('div');
    shimmerLine2.className = 'shimmer-line';
    questionTextEl.appendChild(shimmerLine2);
    
    console.log('✨ Showing shimmer loading state for question text');
}

// Show multiple choice options
function showMultipleChoice() {
    multipleChoice.style.display = 'flex';
    questionPrompt.textContent = 'Choose the correct answer';
    const optionBtns = multipleChoice.querySelectorAll('.option-btn');
    
    console.log('🔍 MCQ OPTIONS DEBUG:', {
        questionId: currentQuestion?.id,
        questionText: currentQuestion?.question?.substring(0, 50) + '...',
        hasOptions: !!currentQuestion?.options,
        options: currentQuestion?.options,
        optionsLength: currentQuestion?.options?.length,
        optionsType: typeof currentQuestion?.options,
        currentQuestionKeys: currentQuestion ? Object.keys(currentQuestion) : 'no currentQuestion'
    });
    
    // Check if options exist and are valid
    if (!currentQuestion?.options || !Array.isArray(currentQuestion.options) || currentQuestion.options.length === 0) {
        console.error('❌ MCQ OPTIONS ERROR: No valid options found for question', currentQuestion?.id);
        console.error('Question data:', currentQuestion);
        
        // Show shimmer loading state instead of static placeholder text
        showMultipleChoiceShimmer();
        return;
    }
    
    // Shuffle the options array to randomize answer position
    const shuffledOptions = [...currentQuestion.options].sort(() => Math.random() - 0.5);
    
    console.log('✅ MCQ OPTIONS SUCCESS:', {
        originalOptions: currentQuestion.options,
        shuffledOptions: shuffledOptions
    });
    
    optionBtns.forEach((btn, index) => {
        const optionText = shuffledOptions[index];
        
        // Clear shimmer elements if they exist
        const shimmerLines = btn.querySelectorAll('.shimmer-line');
        shimmerLines.forEach(line => line.remove());
        
        btn.textContent = optionText || `Option ${index + 1}`;
        btn.dataset.answer = optionText || `Option ${index + 1}`;
        btn.className = 'option-btn'; // Reset all classes (removes shimmer)
        btn.classList.remove('selected', 'correct', 'correct-selected', 'incorrect', 'shake', 'shimmer'); // Explicitly remove any lingering states including shimmer
        btn.disabled = false;
        btn.style.cursor = 'pointer';
        btn.style.opacity = '1'; // Reset opacity
        
        // Add source badge to each option
        setSourceBadge(btn);
        
        // Add CORRECT badge to the correct answer option (for debugging)
        // *** CRITICAL: Use the SAME placeholder detection logic as checkAnswer() ***
        let correctAnswer = currentQuestion.correctAnswer;
        
        // Handle API placeholder responses (SAME logic as checkAnswer())
        const isPlaceholderAnswer = correctAnswer && (
            correctAnswer.toLowerCase().includes('not available') ||
            correctAnswer.toLowerCase().includes('no answer') ||
            correctAnswer.toLowerCase().includes('placeholder') ||
            correctAnswer === '' ||
            correctAnswer === null
        );
        
        // If API doesn't provide real correct answer, use first option as fallback (SAME as checkAnswer())
        if (isPlaceholderAnswer && currentQuestion.options && currentQuestion.options.length > 0) {
            correctAnswer = currentQuestion.options[0]; // Use same fallback as checkAnswer()
            console.log('🔧 BADGE PLACEHOLDER SYNC: Using first option as correct for badge:', correctAnswer);
        }
        
        const isExactMatch = optionText === correctAnswer;
        const isTrimMatch = optionText?.trim() === correctAnswer?.trim();
        const isLowerMatch = optionText?.toLowerCase().trim() === correctAnswer?.toLowerCase().trim();
        
        // Add substring matching for truncated text
        const isSubstringMatch = optionText && correctAnswer && (
            optionText.includes(correctAnswer) || 
            correctAnswer.includes(optionText) ||
            optionText.toLowerCase().includes(correctAnswer.toLowerCase()) ||
            correctAnswer.toLowerCase().includes(optionText.toLowerCase())
        );
        
        const isCorrectOption = isExactMatch || isTrimMatch || isLowerMatch || isSubstringMatch;
        
        setCorrectBadge(btn, isCorrectOption);
        
        console.log(`Button ${index} set to:`, optionText, isCorrectOption ? '✅ CORRECT' : '');
        
        // Debug the matching logic for correct answers
        if (isCorrectOption) {
            console.log('🟢 CORRECT BADGE ADDED:', {
                buttonIndex: index,
                optionText: optionText.substring(0, 30) + '...',
                matchType: isExactMatch ? 'exact' : isTrimMatch ? 'trim' : isLowerMatch ? 'case-insensitive' : isSubstringMatch ? 'substring' : 'original-array'
            });
        }
        
        // Store matching details for safety check
        if (index === 0) {
            window.lastMatchingDebug = {
                correctAnswer: currentQuestion.correctAnswer,
                allOptions: shuffledOptions,
                matchResults: shuffledOptions.map(opt => {
                    const exact = opt === correctAnswer;
                    const trim = opt?.trim() === correctAnswer?.trim();
                    const lower = opt?.toLowerCase().trim() === correctAnswer?.toLowerCase().trim();
                    const substring = opt && correctAnswer && (
                        opt.includes(correctAnswer) || 
                        correctAnswer.includes(opt) ||
                        opt.toLowerCase().includes(correctAnswer.toLowerCase()) ||
                        correctAnswer.toLowerCase().includes(opt.toLowerCase())
                    );
                    return { opt, exact, trim, lower, substring, anyMatch: exact || trim || lower || substring };
                })
            };
        }
    });
    
    // Safety check: Ensure at least one CORRECT badge is visible for debugging
    setTimeout(() => {
        const correctBadges = document.querySelectorAll('.correct-badge');
        if (correctBadges.length === 0) {
            console.warn('⚠️ NO CORRECT BADGES FOUND! Adding fallback...');
            console.log('📊 Matching debug data:', window.lastMatchingDebug);
            
            // Find the best match or use first option as fallback
            const optionBtns = document.querySelectorAll('.option-btn');
            let bestMatch = null;
            let bestScore = 0;
            
            optionBtns.forEach((btn, idx) => {
                const text = btn.dataset.answer;
                let score = 0;
                
                // Score different match types
                if (text === currentQuestion.correctAnswer) score = 100;
                else if (text?.trim() === currentQuestion.correctAnswer?.trim()) score = 90;
                else if (text?.toLowerCase().trim() === currentQuestion.correctAnswer?.toLowerCase().trim()) score = 80;
                else if (text && currentQuestion.correctAnswer && text.toLowerCase().includes(currentQuestion.correctAnswer.toLowerCase())) score = 70;
                else if (text && currentQuestion.correctAnswer && currentQuestion.correctAnswer.toLowerCase().includes(text.toLowerCase())) score = 60;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = btn;
                }
            });
            
            if (bestMatch) {
                setCorrectBadge(bestMatch, true);
                console.log('🔧 FALLBACK: Added CORRECT badge to best match with score:', bestScore);
            } else if (optionBtns.length > 0) {
                setCorrectBadge(optionBtns[0], true);
                console.log('🔧 FALLBACK: Added CORRECT badge to first option');
            }
        } else {
            console.log('✅ CORRECT badge found:', correctBadges.length);
        }
    }, 100);
}

// Show flashcard
function showFlashcard() {
    flashcard.style.display = 'flex';
    questionPrompt.textContent = 'Tap the card to flip';
    
    // Add class for proper spacing
    questionPrompt.classList.add('flashcard-prompt');
    
    // Set flashcard content
    const termEl = flashcard.querySelector('.flashcard-term');
    const definitionEl = flashcard.querySelector('.flashcard-definition');
    
    termEl.textContent = currentQuestion.question;
    definitionEl.textContent = currentQuestion.correctAnswer;
    
    // Apply dynamic text sizing to flashcard elements
    applyDynamicTextSizing(termEl, currentQuestion.question);
    applyDynamicTextSizing(definitionEl, currentQuestion.correctAnswer);
    
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
    writtenFeedback.classList.remove('show'); // Hidden until user submits
    textAnswer.focus();
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
        // Add term (question) - truncated for matching
        matchingItems.push({
            id: `term-${questionIndex}`,
            text: truncateTextForMatching(question.question),
            type: 'term',
            pairId: `def-${questionIndex}`,
            questionIndex: questionIndex
        });
        
        // Add definition (answer) - truncated for matching
        matchingItems.push({
            id: `def-${questionIndex}`,
            text: truncateTextForMatching(question.correctAnswer),
            type: 'definition', 
            pairId: `term-${questionIndex}`,
            questionIndex: questionIndex
        });
    });
    
    // Shuffle all items for random positioning
    matchingItems.sort(() => 0.5 - Math.random());
}

// Helper function to truncate and optimize text for matching interface
function truncateTextForMatching(text) {
    if (!text) return '';
    
    // Remove common question words and simplify
    let simplified = text
        .replace(/^(What is|Which|What|Where|When|How|Why)\s+/i, '')
        .replace(/^(the function of|the purpose of|responsible for)\s+/i, '')
        .replace(/\s+(in the cell|of the cell|in cells)\s*$/i, '')
        .replace(/\?$/, '')
        .trim();
    
    // Truncate if still too long
    if (simplified.length > 45) {
        // Try to break at a natural point (comma, space after preposition)
        const breakPoint = simplified.lastIndexOf(' ', 45);
        if (breakPoint > 20) {
            simplified = simplified.substring(0, breakPoint) + '...';
        } else {
            simplified = simplified.substring(0, 42) + '...';
        }
    }
    
    return simplified;
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
        // Invalid match - immediate negative feedback
        firstElement.classList.add('incorrect');
        secondElement.classList.add('incorrect');
        
        // Update prompt with negative feedback
        questionPrompt.textContent = 'Try again';
        questionPrompt.classList.add('feedback', 'incorrect');
        
        setTimeout(() => {
            firstElement.classList.remove('selected', 'incorrect');
            secondElement.classList.remove('selected', 'incorrect');
            
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
    if (currentQuestion.currentFormat === 'multiple_choice') {
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
    let countsForProgress = false; // Only MCQ and written count for progress
    
    if (currentQuestion.currentFormat === 'multiple_choice') {
        // Multiple choice: exact match required
        let correctAnswer = currentQuestion.correctAnswer;
        
        // Handle API placeholder responses  
        const isPlaceholderAnswer = correctAnswer && (
            correctAnswer.toLowerCase().includes('not available') ||
            correctAnswer.toLowerCase().includes('no answer') ||
            correctAnswer.toLowerCase().includes('placeholder') ||
            correctAnswer === '' ||
            correctAnswer === null
        );
        
        // If API doesn't provide real correct answer, use first option as fallback
        if (isPlaceholderAnswer && currentQuestion.options && currentQuestion.options.length > 0) {
            correctAnswer = currentQuestion.options[0];
            // Update the question's correctAnswer for consistent feedback display
            currentQuestion.correctAnswer = correctAnswer;
            console.log('⚠️ ANSWER CHECK: API placeholder detected, using first option as correct:', correctAnswer);
        }
        
        isCorrect = selectedAnswer === correctAnswer;
        countsForProgress = true; // MCQ counts for progress
        
        console.log('✅ CHECKANSWERR RESULT:', {
            originalCorrectAnswer: currentQuestion.correctAnswer,
            adjustedCorrectAnswer: correctAnswer,
            selectedAnswer: selectedAnswer,
            isPlaceholder: isPlaceholderAnswer,
            finalIsCorrect: isCorrect
        });
        
        // Update question statistics
        currentQuestion.attempts++;
        if (isCorrect) {
            currentQuestion.correct++;
        }
    } else if (currentQuestion.currentFormat === 'written') {
        // For written questions, check if answer contains key words from correct answer
        const userAnswer = selectedAnswer.toLowerCase().trim();
        let correctAnswer = currentQuestion.correctAnswer;
        
        // Handle API placeholder responses for written questions
        const isPlaceholderAnswer = correctAnswer && (
            correctAnswer.toLowerCase().includes('not available') ||
            correctAnswer.toLowerCase().includes('no answer') ||
            correctAnswer.toLowerCase().includes('placeholder') ||
            correctAnswer === '' ||
            correctAnswer === null
        );
        
        if (isPlaceholderAnswer) {
            // For written questions with placeholder answers, always mark as correct
            console.log('⚠️ WRITTEN PLACEHOLDER: No correct answer available, marking as correct');
            isCorrect = true;
        } else {
            correctAnswer = correctAnswer.toLowerCase().trim();
            
            // Simple matching: check if user answer contains key words
            const correctWords = correctAnswer.split(' ').filter(word => word.length > 2);
            const userWords = userAnswer.split(' ');
            
            // Consider correct if user answer contains most key words
            const matchedWords = correctWords.filter(word => 
                userWords.some(userWord => userWord.includes(word) || word.includes(userWord))
            );
            
            isCorrect = matchedWords.length >= Math.ceil(correctWords.length * 0.6); // 60% match threshold
        }
        countsForProgress = true; // Written counts for progress
        
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
        
        // Consider correct if at least 2 out of 3 matches are right
        isCorrect = correctMatches >= 2;
        countsForProgress = false; // Matching doesn't count for progress
        
        currentQuestion.attempts++;
        if (isCorrect) {
            currentQuestion.correct++;
        }
        
        // Store the score for feedback
        selectedAnswer = `${correctMatches}/3 correct matches`;
    } else if (currentQuestion.currentFormat === 'flashcard') {
        // Flashcards are just review - always treat as "practice" not progress
        isCorrect = selectedAnswer !== 'study_again'; // Got it vs Study again
        countsForProgress = false; // Flashcards don't count for progress
        
        currentQuestion.attempts++;
        if (isCorrect) {
            currentQuestion.correct++;
        }
    }
    

    
    console.log('checkAnswer result:', {
        isCorrect: isCorrect,
        questionFormat: currentQuestion.currentFormat,
        questionId: currentQuestion.id,
        countsForProgress: countsForProgress,
        hasExplanation: !!currentQuestion.explanation
    });
    
    // Show feedback BEFORE adapting difficulty
    showFeedback(isCorrect);
    
    // Simple difficulty adaptation
    adaptDifficulty(isCorrect, countsForProgress);
    
    // Update progress immediately after answering
    updateProgress(true); // Force full progress after answering
    
    // Save round progress after each answer
    saveRoundProgress();
}

// Simple difficulty adaptation: MCQ/written correct = complete, wrong = easier type
function adaptDifficulty(isCorrect, countsForProgress) {
    const beforeFormat = currentQuestion.currentFormat;
    
    console.log(`🔄 SIMPLE ADAPT: Question ${currentQuestion.id}`, {
        wasCorrect: isCorrect,
        currentFormat: beforeFormat,
        countsForProgress: countsForProgress
    });
    
    if (countsForProgress && isCorrect) {
        // If user got MCQ or written correct, they know it - mark as complete
        currentQuestion.currentFormat = 'completed';
        console.log(`✅ Question ${currentQuestion.id} completed - got ${beforeFormat} correct! Now marked as 'completed'`);
    } else if (countsForProgress && !isCorrect) {
        // If user got MCQ or written wrong, show easier type
        if (currentQuestion.currentFormat === 'multiple_choice') {
            // Wrong MCQ -> try flashcard (easier)
            currentQuestion.currentFormat = 'flashcard';
        } else if (currentQuestion.currentFormat === 'written') {
            // Wrong written -> try matching (easier)
            currentQuestion.currentFormat = 'matching';
        }
        console.log(`📉 Question ${currentQuestion.id} wrong - simplified to ${currentQuestion.currentFormat}`);
    } else {
        // For flashcard/matching (don't count for progress), cycle back to MCQ to test knowledge
        if (currentQuestion.currentFormat === 'flashcard' || currentQuestion.currentFormat === 'matching') {
            currentQuestion.currentFormat = 'multiple_choice';
            console.log(`🔄 Question ${currentQuestion.id} practiced - testing with ${currentQuestion.currentFormat}`);
        }
    }
    
    // Extra logging to verify completion status
    if (currentQuestion.currentFormat === 'completed') {
        console.log(`🏆 COMPLETION CONFIRMED: Question ${currentQuestion.id} is now marked as completed!`);
    }
}

// Show feedback
function showFeedback(isCorrect) {
    // IMMEDIATE DEBUG: Print question and button state before any styling
    if (currentQuestion.currentFormat === 'multiple_choice') {
            console.log('🚨 IMMEDIATE MCQ FEEDBACK DEBUG:', {
        questionId: currentQuestion?.id,
        correctAnswer: currentQuestion?.correctAnswer,
        isCorrect: isCorrect,
        selectedAnswer: selectedAnswer,
        currentFormat: currentQuestion?.currentFormat
    });
    
    // CRITICAL: Check for CORRECT badge vs feedback mismatch
    const correctBadgeElements = document.querySelectorAll('.correct-badge');
    if (correctBadgeElements.length > 0) {
        console.log('🔍 CORRECT BADGE vs FEEDBACK COMPARISON:');
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach((btn, index) => {
            const hasCorrectBadge = btn.querySelector('.correct-badge') !== null;
            const buttonText = btn.dataset.answer;
            const isSelectedByUser = buttonText === selectedAnswer;
            const shouldBeCorrectPerFeedback = buttonText === currentQuestion?.correctAnswer;
            
            if (hasCorrectBadge || shouldBeCorrectPerFeedback || isSelectedByUser) {
                console.log(`🔘 Button ${index}:`, {
                    text: buttonText?.substring(0, 30) + '...',
                    hasCorrectBadge: hasCorrectBadge,
                    shouldBeCorrectPerFeedback: shouldBeCorrectPerFeedback,
                    isSelectedByUser: isSelectedByUser,
                    mismatch: hasCorrectBadge && !shouldBeCorrectPerFeedback,
                    classes: btn.className
                });
            }
        });
        
        // Look for the critical mismatch
        const badgeButtons = Array.from(optionBtns).filter(btn => btn.querySelector('.correct-badge'));
        const feedbackCorrectButtons = Array.from(optionBtns).filter(btn => btn.dataset.answer === currentQuestion?.correctAnswer);
        
        if (badgeButtons.length > 0 && feedbackCorrectButtons.length > 0) {
            const badgeButton = badgeButtons[0];
            const feedbackButton = feedbackCorrectButtons[0];
            
            if (badgeButton !== feedbackButton) {
                console.error('🚨 MISMATCH DETECTED!');
                console.log('Badge says correct:', badgeButton.dataset.answer);
                console.log('Feedback says correct:', feedbackButton.dataset.answer);
                console.log('Current question correctAnswer:', currentQuestion?.correctAnswer);
                console.log('This explains why user sees RED X on button with CORRECT badge!');
            }
        }
    }
        
        // Placeholder detection is now handled in checkAnswer() before this function
        
        const optionBtns = document.querySelectorAll('.option-btn');
        console.log('🔘 BUTTONS BEFORE STYLING:');
        optionBtns.forEach((btn, index) => {
            console.log(`  Button ${index}:`, {
                textContent: btn.textContent?.substring(0, 30) + '...',
                dataAnswer: btn.dataset.answer,
                exactMatch: btn.dataset.answer === currentQuestion?.correctAnswer,
                classes: btn.className
            });
        });
    }
    
    // Update UI to show correct/incorrect answers
    if (currentQuestion.currentFormat === 'multiple_choice') {
        // Small delay for smoother transition
        setTimeout(() => {
            const optionBtns = document.querySelectorAll('.option-btn');
            
            optionBtns.forEach((btn) => {
                // Clear all previous states first
                btn.classList.remove('selected', 'correct', 'correct-selected', 'incorrect', 'shake');
                
                const buttonText = btn.dataset.answer;
                let correctAnswer = currentQuestion.correctAnswer;
                const isUserSelected = btn.dataset.answer === selectedAnswer;
                
                // correctAnswer is already adjusted in checkAnswer() if there was a placeholder
                
                // Check if this button has the correct answer using multiple matching strategies
                const isExactMatch = buttonText === correctAnswer;
                const isTrimMatch = buttonText?.trim() === correctAnswer?.trim();
                const isLowerMatch = buttonText?.toLowerCase().trim() === correctAnswer?.toLowerCase().trim();
                
                // Add fuzzy matching for data inconsistencies
                const similarity = calculateSimilarity(buttonText, correctAnswer);
                const isFuzzyMatch = similarity > 0.8; // 80% similarity threshold
                
                // Check if this button's text is similar to any part of the correct answer
                const containsMatch = buttonText && correctAnswer && 
                    (buttonText.toLowerCase().includes(correctAnswer.toLowerCase()) || 
                     correctAnswer.toLowerCase().includes(buttonText.toLowerCase()));
                
                const isCorrectAnswer = isExactMatch || isTrimMatch || isLowerMatch || isFuzzyMatch || containsMatch;
                
                console.log('🔍 DETAILED MCQ FEEDBACK DEBUG:', {
                    buttonIndex: Array.from(optionBtns).indexOf(btn),
                    buttonText: `"${buttonText}"`,
                    correctAnswer: `"${correctAnswer}"`,
                    buttonTextType: typeof buttonText,
                    correctAnswerType: typeof correctAnswer,
                    isUserSelected: isUserSelected,
                    selectedAnswer: `"${selectedAnswer}"`,
                    isCorrectAnswer: isCorrectAnswer,
                    userAnsweredCorrectly: isCorrect,
                    willHighlightAsCorrect: isCorrectAnswer && !isCorrect,
                    willHighlightAsIncorrect: isUserSelected && !isCorrect,
                    matchDetails: {
                        exactMatch: isExactMatch,
                        trimMatch: isTrimMatch, 
                        lowerMatch: isLowerMatch,
                        fuzzyMatch: isFuzzyMatch,
                        containsMatch: containsMatch,
                        similarity: Math.round(similarity * 100) + '%'
                    }
                });
                
                // Apply styling based on user's answer and button's content
                if (isUserSelected && isCorrect) {
                    // User selected this button and was correct (green + checkmark)
                    btn.classList.add('correct-selected');
                    console.log('✅ APPLIED: correct-selected to user\'s correct choice:', buttonText);
                } else if (isUserSelected && !isCorrect) {
                    // User selected this button and was incorrect (red + X)
                    btn.classList.add('incorrect');
                    console.log('❌ APPLIED: incorrect to user\'s wrong choice:', buttonText);
                } else if (isCorrectAnswer && !isCorrect) {
                    // This button has the correct answer, but user didn't select it (green + checkmark)
                    btn.classList.add('correct');
                    console.log('✅ APPLIED: correct to answer user missed:', buttonText);
                    console.log('🔍 CORRECT ANSWER MATCH DETAILS:', {
                        buttonText: `"${buttonText}"`,
                        correctAnswer: `"${correctAnswer}"`,
                        exactMatch: isExactMatch,
                        trimMatch: isTrimMatch,
                        lowerMatch: isLowerMatch,
                        appliedClass: 'correct',
                        buttonClasses: btn.className
                    });
                }
                
                // Mark correct answers for failsafe check
                if (isCorrectAnswer) {
                    btn.setAttribute('data-is-correct', 'true');
                }
                
                // Final state logging
                console.log(`🎨 FINAL BUTTON STATE ${Array.from(optionBtns).indexOf(btn)}:`, {
                    text: buttonText,
                    classes: btn.className,
                    hasCorrect: btn.classList.contains('correct'),
                    hasCorrectSelected: btn.classList.contains('correct-selected'),
                    hasIncorrect: btn.classList.contains('incorrect')
                });
            });
            
            // Debug summary: Check how many correct answers were found
            const correctAnswerButtons = Array.from(optionBtns).filter(btn => btn.hasAttribute('data-is-correct'));
            console.log('📊 CORRECT ANSWER SUMMARY:', {
                totalButtons: optionBtns.length,
                correctAnswersFound: correctAnswerButtons.length,
                correctAnswerTexts: correctAnswerButtons.map(btn => btn.dataset.answer),
                expectedCorrectAnswer: currentQuestion.correctAnswer,
                userAnsweredCorrectly: isCorrect
            });
            
            if (correctAnswerButtons.length === 0 && !isCorrect) {
                console.log('⚠️ WARNING: No buttons were identified as having the correct answer!');
                console.log('This means the API correct answer doesn\'t match any button text.');
                console.log('Expected:', currentQuestion.correctAnswer);
                console.log('Available button texts:', Array.from(optionBtns).map(btn => btn.dataset.answer));
            }
            
            // Failsafe: Only run if user answered incorrectly AND no correct answer was found
            const markedCorrect = document.querySelector('[data-is-correct="true"]');
            if (!markedCorrect && !isCorrect) {
                console.log('🚑 EMERGENCY FAILSAFE: No correct answer was highlighted, finding best match...');
                
                let bestMatch = null;
                let bestScore = 0;
                
                optionBtns.forEach((btn) => {
                    // Skip buttons that are already marked as user's incorrect selection
                    if (btn.classList.contains('incorrect')) {
                        console.log('⏭️ SKIPPING button already marked as user\'s incorrect choice:', btn.textContent);
                        return;
                    }
                    
                    const buttonText = btn.textContent?.trim();
                    const buttonData = btn.dataset.answer?.trim();
                    const correctAnswer = currentQuestion.correctAnswer?.trim();
                    
                    // Try different matching strategies and score them
                    let score = 0;
                    if (buttonData?.toLowerCase() === correctAnswer?.toLowerCase()) score = 100;
                    else if (buttonText?.toLowerCase() === correctAnswer?.toLowerCase()) score = 90;
                    else if (buttonData?.toLowerCase().includes(correctAnswer?.toLowerCase())) score = 70;
                    else if (buttonText?.toLowerCase().includes(correctAnswer?.toLowerCase())) score = 60;
                    else if (correctAnswer?.toLowerCase().includes(buttonData?.toLowerCase())) score = 50;
                    else if (correctAnswer?.toLowerCase().includes(buttonText?.toLowerCase())) score = 40;
                    
                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = btn;
                    }
                });
                
                if (bestMatch && bestScore >= 40) {
                    console.log(`🎯 FAILSAFE: Found best match with score ${bestScore}:`, bestMatch.textContent);
                    bestMatch.classList.add('correct');
                } else {
                    console.log('❌ FAILSAFE: Could not find any suitable match. No emergency highlighting will be applied.');
                    // Don't highlight anything if we can't find a reasonable match
                }
            }
            
            // Clean up the marker attribute and verify styling was applied
            optionBtns.forEach((btn, index) => {
                btn.removeAttribute('data-is-correct');
                
                // Log final button states for debugging
                console.log(`🎨 FINAL BUTTON STATE ${index}:`, {
                    text: btn.textContent.substring(0, 30) + '...',
                    classes: btn.className,
                    hasCorrectClass: btn.classList.contains('correct'),
                    hasCorrectSelectedClass: btn.classList.contains('correct-selected'),
                    hasIncorrectClass: btn.classList.contains('incorrect'),
                    computedStyle: {
                        borderColor: getComputedStyle(btn).borderColor,
                        borderStyle: getComputedStyle(btn).borderStyle,
                        borderWidth: getComputedStyle(btn).borderWidth,
                        backgroundColor: getComputedStyle(btn).backgroundColor
                    }
                });
                
                // CSS OVERRIDE TEST: If this button should be correct but doesn't have correct styling, force it
                if (btn.dataset.answer === currentQuestion?.correctAnswer && !btn.classList.contains('correct') && !btn.classList.contains('correct-selected')) {
                    console.log(`🚨 CSS OVERRIDE TEST: Button ${index} should be correct but doesn't have styling. Forcing inline styles...`);
                    btn.style.border = '2px dashed #10b981 !important';
                    btn.style.borderColor = '#10b981 !important';
                    btn.style.borderStyle = 'dashed !important';
                    btn.style.borderWidth = '2px !important';
                    
                    setTimeout(() => {
                        console.log(`🔍 AFTER FORCE STYLING: Button ${index} computed styles:`, {
                            borderColor: getComputedStyle(btn).borderColor,
                            borderStyle: getComputedStyle(btn).borderStyle,
                            borderWidth: getComputedStyle(btn).borderWidth
                        });
                    }, 50);
                }
            });
        }, 100);
    } else if (currentQuestion.currentFormat === 'written') {
        // Show feedback for written questions
        if (isCorrect) {
            textAnswer.classList.add('correct');
            textInput.classList.add('correct');
        } else {
            textAnswer.classList.add('incorrect');
            textInput.classList.add('incorrect');
        }
        
        // Enhanced debugging for written feedback
        console.log('🔍 WRITTEN FEEDBACK DEBUG:', {
            correctAnswerFeedback: !!correctAnswerFeedback,
            writtenFeedback: !!writtenFeedback,
            currentQuestionCorrectAnswer: currentQuestion.correctAnswer,
            correctAnswerLength: currentQuestion.correctAnswer?.length,
            isCorrect: isCorrect,
            elementExists: {
                correctAnswerFeedback: document.getElementById('correctAnswerFeedback') !== null,
                writtenFeedback: document.getElementById('writtenFeedback') !== null
            }
        });
        
        // BULLETPROOF: Always show the correct answer feedback
        console.log('📝 BULLETPROOF FEEDBACK: Starting...');
        
        // Get elements directly from DOM every time (no caching issues)
        const correctAnswerElement = document.getElementById('correctAnswerFeedback');
        if (correctAnswerElement && currentQuestion.correctAnswer) {
            console.log('📝 Setting correct answer text:', currentQuestion.correctAnswer);
            correctAnswerElement.textContent = currentQuestion.correctAnswer;
            setSourceBadge(correctAnswerElement);
            
            // NUCLEAR option: Force visible with brute force
            correctAnswerElement.style.cssText = `
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                background: var(--color-mint-50) !important;
                border: 2px solid var(--color-mint-600) !important;
                border-radius: 12px !important;
                padding: 16px !important;
                margin-top: 8px !important;
                color: var(--sys-text-primary) !important;
                font-weight: 600 !important;
            `;
            
            console.log('✅ BULLETPROOF: Set correct answer with nuclear styling');
        } else {
            console.error('❌ BULLETPROOF: correctAnswerFeedback element not found:', {
                element: !!correctAnswerElement,
                correctAnswer: currentQuestion.correctAnswer,
                allElements: Array.from(document.querySelectorAll('[id*="eedback"]')).map(el => el.id)
            });
        }
        
        // BULLETPROOF: Show written feedback container
        const writtenFeedbackElement = document.getElementById('writtenFeedback');
        if (writtenFeedbackElement) {
            console.log('📝 BULLETPROOF: Showing written feedback container');
            
            // NUCLEAR styling for the container
            writtenFeedbackElement.style.cssText = `
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                flex-direction: column !important;
                gap: 12px !important;
                margin-top: 20px !important;
                position: relative !important;
                z-index: 50 !important;
            `;
            
            writtenFeedbackElement.classList.add('show');
            writtenFeedbackElement.removeAttribute('hidden');
            
            // Force parent container to show if needed
            if (textInput) {
                textInput.style.display = 'flex';
            }
            
            console.log('✅ BULLETPROOF: Written feedback container forced to show');
            
            console.log('📊 Final feedback state:', {
                classList: writtenFeedbackElement.className,
                display: writtenFeedbackElement.style.display,
                computedDisplay: getComputedStyle(writtenFeedbackElement).display,
                visibility: getComputedStyle(writtenFeedbackElement).visibility,
                opacity: getComputedStyle(writtenFeedbackElement).opacity,
                height: getComputedStyle(writtenFeedbackElement).height,
                parentDisplay: textInput ? getComputedStyle(textInput).display : 'unknown',
                offsetHeight: writtenFeedbackElement.offsetHeight,
                scrollHeight: writtenFeedbackElement.scrollHeight
            });
            
            // Additional timeout check to ensure it's visible
            setTimeout(() => {
                const finalState = getComputedStyle(writtenFeedbackElement);
                console.log('🔍 Feedback visibility after timeout:', {
                    display: finalState.display,
                    visibility: finalState.visibility,
                    opacity: finalState.opacity,
                    offsetHeight: writtenFeedbackElement.offsetHeight,
                    isVisible: writtenFeedbackElement.offsetHeight > 0
                });
            }, 100);
        } else {
            console.error('❌ writtenFeedback element not found');
        }
        
        // Disable input and hide submit button  
        textAnswer.disabled = true;
        submitBtn.classList.remove('show');
    } else if (currentQuestion.currentFormat === 'matching') {
        // Feedback for matching questions is handled in real-time during createMatch()
        // No additional feedback needed here since items fade out immediately
    }
    
    // Handle flashcard feedback - go directly to next question without feedback
    if (currentQuestion.currentFormat === 'flashcard') {
        // No feedback, go directly to next question
        nextQuestion();
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
        
        // For incorrect answers, create button container with continue and explanation buttons
        createIncorrectAnswerButtons();
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
    // DEBUGGING: Log who called nextQuestion
    console.log('🔍 nextQuestion() called from:', new Error().stack);
    console.log('🔍 Current question format:', currentQuestion?.currentFormat);
    console.log('🔍 Written feedback element state before clearing:', {
        exists: !!document.getElementById('writtenFeedback'),
        hasShowClass: document.getElementById('writtenFeedback')?.classList.contains('show'),
        isVisible: document.getElementById('writtenFeedback')?.offsetHeight > 0
    });
    
    // Prevent race conditions from multiple simultaneous calls
    if (isTransitioning) {
        console.log('⚠️ BLOCKED: nextQuestion() already in progress');
        return;
    }
    
    isTransitioning = true;
    
    console.log('⏭️ NEXT QUESTION called:', {
        currentIndex: currentQuestionIndex,
        currentProgress: currentRoundProgress,
        totalQuestions: questionsInRound.length,
        isLastQuestion: currentQuestionIndex >= questionsInRound.length - 1
    });
    
    currentQuestionIndex++;
    currentRoundProgress++;
    
    console.log('⏭️ AFTER INCREMENT:', {
        newIndex: currentQuestionIndex,
        newProgress: currentRoundProgress,
        totalQuestions: questionsInRound.length,
        completedQuestions: questionsInRound.filter(q => q.currentFormat === 'completed').length,
        masteryBased: true
    });
    
    // Check if round is complete (all questions mastered)
    const completedQuestionsInRound = questionsInRound.filter(q => q.currentFormat === 'completed').length;
    const totalQuestionsInRound = questionsInRound.length;
    const roundComplete = completedQuestionsInRound >= totalQuestionsInRound;
    
    if (roundComplete) {
        // End of current round - return to study path
        console.log('🏁 COMPLETING ROUND (MASTERY):', {
            roundNumber: currentRoundNumber,
            questionsCompleted: completedQuestionsInRound,
            totalQuestions: totalQuestionsInRound,
            masteryPercentage: Math.round((completedQuestionsInRound / totalQuestionsInRound) * 100)
        });
        totalRoundsCompleted++;
        saveRoundProgress();
        completeRound();
        return;
    }

    // If we've reached the end of questions but not all are mastered, cycle back
    if (currentQuestionIndex >= questionsInRound.length) {
        console.log('🔄 CYCLING BACK: Not all questions mastered, restarting question cycle');
        currentQuestionIndex = 0; // Start over from first question
    }
    
    // Remove any button containers that might have been added
    const buttonContainer = document.querySelector('.button-container');
    if (buttonContainer) {
        buttonContainer.remove();
    }
    
    // Also remove any standalone buttons (legacy cleanup)
    const continueBtn = document.querySelector('.continue-btn');
    if (continueBtn) {
        continueBtn.remove();
    }
    removeExplanationButton();
    
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
            // DEBUGGING: Don't clear written feedback if it was just shown for incorrect answers
            const isWrittenQuestion = currentQuestion?.currentFormat === 'written';
            const hasShowClass = writtenFeedback.classList.contains('show');
            
            console.log('🔍 CLEARING WRITTEN FEEDBACK:', {
                isWrittenQuestion,
                hasShowClass,
                shouldClear: !hasShowClass || !isWrittenQuestion
            });
            
            // Temporarily prevent clearing to debug
            if (!hasShowClass || !isWrittenQuestion) {
                writtenFeedback.classList.remove('show'); // Use class-based approach
                console.log('✅ Cleared written feedback (was not active)');
            } else {
                console.log('🚫 PREVENTED clearing written feedback (it was active for written question)');
            }
        }
        
        // Reset flashcard state
        if (gotItBtn && studyAgainBtn) {
            gotItBtn.style.display = 'none';
            studyAgainBtn.style.display = 'none';
        }
        
        // Reset option button states
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => {
            // Clear all badges 
            btn.querySelectorAll('.api-badge, .static-badge, .correct-badge').forEach(b => b.remove());
            btn.classList.remove('selected', 'correct', 'correct-selected', 'incorrect', 'shake');
            btn.disabled = false;
            btn.style.cursor = 'pointer';
        });
        
        showQuestion();
        updateProgress();
        
        // Fade back in
        questionContainer.classList.remove('fade-out');
        
        // Reset transition flag
        isTransitioning = false;
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
    // Calculate currentRoundProgress based on completed questions in current round only
    const completedQuestionsInRound = questionsInRound.filter(q => q.currentFormat === 'completed').length;
    const allQuestionsInRoundDetails = questionsInRound.map(q => ({
        id: q.id,
        format: q.currentFormat,
        isCompleted: q.currentFormat === 'completed'
    }));
    
    currentRoundProgress = completedQuestionsInRound;
    
    // Calculate overall progress across all questions for home screen
    const totalQuestions = questions.length;
    const completedQuestions = questions.filter(q => q.currentFormat === 'completed').length;
    const overallProgress = Math.round((completedQuestions / totalQuestions) * 100);
    
    console.log('🚀 DETAILED PROGRESS TRACKING:', {
        currentRoundNumber,
        totalQuestions,
        completedQuestions,
        questionsInRound: questionsInRound.length,
        completedQuestionsInRound,
        currentRoundProgress,
        overallProgress,
        questionDetails: allQuestionsInRoundDetails
    });
    
    // Save overall progress to localStorage for home screen
    localStorage.setItem('studyProgress', overallProgress);
    localStorage.setItem('currentQuestionIndex', completedQuestions);
    
    // Save current round progress to localStorage
    localStorage.setItem('currentRoundNumber', currentRoundNumber);
    localStorage.setItem('currentRoundProgress', currentRoundProgress);
    
    console.log('💾 SAVING TO LOCALSTORAGE:', {
        currentRoundNumber,
        currentRoundProgress,
        studyProgress: overallProgress
    });
    
    // Save detailed round progress data
    roundProgressData[currentRoundNumber] = {
        questionIndex: currentQuestionIndex,
        progress: currentRoundProgress,
        questionsInRound: questionsInRound.map(q => q.id)
    };
    localStorage.setItem('roundProgressData', JSON.stringify(roundProgressData));
    
    // Also update studyPathData to keep it in sync
    updateStudyPathData();
    
    // Update study path progress (optional in mastery-based system)
    if (window.StudyPath) {
        console.log('📞 CALLING StudyPath.updateRoundProgress with:', currentRoundProgress);
        try {
            window.StudyPath.updateRoundProgress(currentRoundProgress);
        } catch (error) {
            console.log('ℹ️ StudyPath integration optional in mastery-based system');
        }
    } else {
        // StudyPath integration is optional - using local progress tracking
    }
}

// Debug function to check question completion status
window.debugQuestionStatus = function() {
    console.log('🧪 QUESTION STATUS DEBUG:');
    
    if (!questions || !questionsInRound) {
        console.log('❌ Questions not loaded yet');
        return;
    }
    
    console.log('📊 All questions in pool:');
    questions.forEach((q, index) => {
        console.log(`  Q${q.id}: ${q.currentFormat} ${q.currentFormat === 'completed' ? '✅' : '⏳'}`);
    });
    
    console.log('📊 Questions in current round:');
    questionsInRound.forEach((q, index) => {
        console.log(`  Q${q.id}: ${q.currentFormat} ${q.currentFormat === 'completed' ? '✅' : '⏳'}`);
    });
    
    const totalCompleted = questions.filter(q => q.currentFormat === 'completed').length;
    const roundCompleted = questionsInRound.filter(q => q.currentFormat === 'completed').length;
    
    console.log('📈 Progress summary:', {
        totalQuestions: questions.length,
        totalCompleted,
        questionsInRound: questionsInRound.length,
        roundCompleted,
        currentRoundProgress,
        currentRoundNumber
    });
};

// Restore progress within the current round
function restoreRoundProgress() {
    const roundData = roundProgressData[currentRoundNumber];
    
    if (roundData && roundData.questionIndex > 0) {
        // Restore progress within the round
        currentQuestionIndex = roundData.questionIndex;
        currentRoundProgress = roundData.progress;
        
        // In mastery-based system, allow cycling - just ensure we start at valid index
        if (currentQuestionIndex >= questionsInRound.length) {
            currentQuestionIndex = 0;
        }
    } else {
        // Start from beginning of round
        currentQuestionIndex = 0;
        currentRoundProgress = 0;
    }
}

// Complete current round and return to study path
function completeRound() {
    // Reset transition flag to clean up state
    isTransitioning = false;
    
    // Mark round as completed in study path (optional in mastery-based system)
    if (window.StudyPath) {
        try {
            window.StudyPath.markRoundCompleted(currentRoundNumber);
        } catch (error) {
            console.log('ℹ️ StudyPath integration optional in mastery-based system');
        }
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
    // Calculate round progress based on mastery (completed questions only)
    // Round continues until ALL questions are mastered (100% completion)
    const completedQuestionsInRound = questionsInRound.filter(q => q.currentFormat === 'completed').length;
    const totalQuestionsInRound = questionsInRound.length;
    
    let roundProgress = (completedQuestionsInRound / totalQuestionsInRound) * 100;
    
    // Cap at 100% just in case
    roundProgress = Math.min(roundProgress, 100);
    
    const progressBar = document.querySelector('.progress-bar');
    const progressCounter = document.getElementById('progressCounter');
    
    console.log('Progress bar update:', {
        completedQuestionsInRound,
        totalQuestionsInRound,
        roundProgress: Math.round(roundProgress),
        progressType: 'mastery_based',
        roundComplete: roundProgress >= 100
    });
    
    // Handle zero state (no questions completed)
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
    
    // Update study path data (optional in mastery-based system)
    if (window.StudyPath) {
        try {
            window.StudyPath.markRoundCompleted(currentRound);
            window.StudyPath.updateRoundProgress(questionsPerRound);
        } catch (error) {
            console.log('ℹ️ StudyPath integration optional in mastery-based system');
        }
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
    
    // Flashcard interaction - allow continuous flipping, show buttons after first flip
    flashcardElement.addEventListener('click', () => {
        if (currentQuestion.currentFormat === 'flashcard' && !isAnswered) {
            // Toggle flip state
            flashcardElement.classList.toggle('flipped');
            
            // Show buttons after first flip (only if they're not already visible)
            if (gotItBtn.style.display === 'none' || gotItBtn.style.display === '') {
                setTimeout(() => {
                    gotItBtn.style.display = 'block';
                    studyAgainBtn.style.display = 'block';
                }, 300); // Delay to sync with flip animation
            }
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
        if (currentQuestion && (currentQuestion.currentFormat === 'written' || currentQuestion.currentFormat === 'text')) {
            if (e.target.value.trim().length > 0) {
                submitBtn.classList.add('show');
            } else {
                submitBtn.classList.remove('show');
            }
        }
    });
    
    // Matching submit button removed - we auto-advance now
    
    // Navigation is now handled by AppHeader component
    
    // Debug bottom sheet event listeners - defer slightly to ensure DOM is ready
    setTimeout(setupDebugBottomSheetListeners, 100);
    
    // Explanation bottom sheet event listeners
    setTimeout(setupExplanationBottomSheetListeners, 100);
}

// Debug bottom sheet functionality - using home page pattern
let debugBottomSheet;
let closeBottomSheetBtn;

// Explanation bottom sheet functionality
let explanationBottomSheet;
let closeExplanationSheetBtn;

function setupDebugBottomSheetListeners() {
    console.log('Setting up debug bottom sheet listeners...');
    debugBottomSheet = document.getElementById('debugBottomSheet');
    closeBottomSheetBtn = document.getElementById('closeBottomSheet');
    
    console.log('Debug elements found:', {
        bottomSheet: !!debugBottomSheet,
        closeBtn: !!closeBottomSheetBtn
    });
    
    if (!debugBottomSheet || !closeBottomSheetBtn) {
        console.warn('Debug bottom sheet elements not found');
        return;
    }
    
    // Close button handler
    closeBottomSheetBtn.addEventListener('click', closeDebugBottomSheet);
    
    // Overlay click handler (close when clicking outside content)
    debugBottomSheet.addEventListener('click', function(e) {
        if (e.target === debugBottomSheet) {
            closeDebugBottomSheet();
        }
    });
    
    // Debug option handlers
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('debug-option')) {
            handleDebugOptionClick(e.target);
        }
    });
    
    // Escape key handler
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && debugBottomSheet.classList.contains('show')) {
            closeDebugBottomSheet();
        }
    });
    
    // Initialize badge toggle state
    initializeBadgeToggle();
}

// Open debug bottom sheet - using home page pattern
function openDebugBottomSheet() {
    console.log('openDebugBottomSheet called, bottom sheet exists:', !!debugBottomSheet);
    
    if (!debugBottomSheet) {
        console.error('Debug bottom sheet not found!');
        // Try to find it again
        debugBottomSheet = document.getElementById('debugBottomSheet');
        console.log('Retry found bottom sheet:', !!debugBottomSheet);
        if (!debugBottomSheet) return;
    }
    
    console.log('Opening debug bottom sheet');
    debugBottomSheet.classList.add('show');
    
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Update UI to show current question type
    updateDebugUI();
    
    console.log('Debug bottom sheet should now be visible, classes:', debugBottomSheet.className);
}

// Close debug bottom sheet - using home page pattern
function closeDebugBottomSheet() {
    if (!debugBottomSheet) return;
    
    console.log('Closing debug bottom sheet');
    debugBottomSheet.classList.remove('show');
    
    document.body.style.overflow = ''; // Restore scrolling
}

// Update debug UI to show current selections and adaptive learning info
function updateDebugUI() {
    const debugOptions = document.querySelectorAll('.debug-option');
    
    debugOptions.forEach(option => {
        const type = option.dataset.type;
        const value = option.dataset.value;
        
        option.classList.remove('selected');
        
        if (type === 'question-type' && currentQuestion && currentQuestion.currentFormat === value) {
            option.classList.add('selected');
        }
    });
    
    // Update adaptive learning debug info
    updateAdaptiveLearningDebugInfo();
}

// Update adaptive learning debug information
function updateAdaptiveLearningDebugInfo() {
    console.log('🔍 DEBUG UPDATE: Checking adaptive learning availability:', {
        hasAdaptiveLearning: !!window.AdaptiveLearning,
        hasCurrentQuestion: !!currentQuestion,
        currentQuestionId: currentQuestion?.id,
        currentQuestionFormat: currentQuestion?.currentFormat
    });
    
    if (!window.AdaptiveLearning) {
        // Show that adaptive learning is not available
        const debugElements = [
            'currentDepth', 'currentDifficulty', 'currentType',
            'correctDepth', 'correctDifficulty', 'correctType',
            'incorrectDepth', 'incorrectDifficulty', 'incorrectType'
        ];
        debugElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = 'No AL engine';
        });
        console.log('❌ DEBUG: Adaptive Learning engine not available');
        return;
    }
    
    if (!currentQuestion) {
        // Show that no current question is available
        const debugElements = [
            'currentDepth', 'currentDifficulty', 'currentType',
            'correctDepth', 'correctDifficulty', 'correctType',
            'incorrectDepth', 'incorrectDifficulty', 'incorrectType'
        ];
        debugElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = 'No question';
        });
        console.log('❌ DEBUG: No current question available');
        return;
    }
    
    console.log(`🔍 UPDATING DEBUG INFO for question ${currentQuestion.id} (format: ${currentQuestion.currentFormat})`);
    
    // Get current question debug info with error handling
    let currentInfo;
    try {
        currentInfo = { depth: 'Mastery', difficulty: 'Mastery', mode: 'multiple_choice' };
        console.log('📊 Current question debug info:', currentInfo);
    } catch (error) {
        console.error('❌ Error getting adaptive learning debug info:', error);
        const debugElements = [
            'currentDepth', 'currentDifficulty', 'currentType',
            'correctDepth', 'correctDifficulty', 'correctType',
            'incorrectDepth', 'incorrectDifficulty', 'incorrectType'
        ];
        debugElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = 'AL Error';
        });
        return;
    }
    
    // Validate current info
    if (!currentInfo || typeof currentInfo !== 'object') {
        console.error('❌ Invalid current info from adaptive learning:', currentInfo);
        const debugElements = ['currentDepth', 'currentDifficulty', 'currentType'];
        debugElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = 'Invalid data';
        });
        return;
    }
    
    // Update current question info
    const currentDepthEl = document.getElementById('currentDepth');
    const currentDifficultyEl = document.getElementById('currentDifficulty');
    const currentTypeEl = document.getElementById('currentType');
    
    if (currentDepthEl) currentDepthEl.textContent = currentInfo.depth || 'Unknown';
    if (currentDifficultyEl) currentDifficultyEl.textContent = currentInfo.difficulty || 'Unknown';
    if (currentTypeEl) currentTypeEl.textContent = getDisplayName(currentInfo.mode) || 'Unknown';
    
    // In mastery-based system, show static debug info
    const rawCorrectInfo = { depth: 'Mastery', difficulty: 'Mastery', mode: 'completed' };
    const correctInfo = { depth: 'Mastery', difficulty: 'Mastery', mode: 'completed' };
    
    const correctPreventionApplied = rawCorrectInfo.mode !== correctInfo.mode;
    
    console.log(`📊 DEBUG PREDICTIONS:`, {
        currentFormat: currentQuestion.currentFormat,
        rawCorrectPrediction: rawCorrectInfo,
        adjustedCorrectPrediction: correctInfo,
        preventionApplied: correctPreventionApplied
    });
    
    // Update correct answer preview
    const correctDepthEl = document.getElementById('correctDepth');
    const correctDifficultyEl = document.getElementById('correctDifficulty');
    const correctTypeEl = document.getElementById('correctType');
    const correctNoteEl = document.getElementById('correctNote');
    
    if (correctDepthEl) correctDepthEl.textContent = correctInfo.depth;
    if (correctDifficultyEl) correctDifficultyEl.textContent = correctInfo.difficulty;
    if (correctTypeEl) correctTypeEl.textContent = getDisplayName(correctInfo.mode);
    
    // Show/hide prevention note for correct answers
    if (correctNoteEl) {
        correctNoteEl.style.display = correctPreventionApplied ? 'block' : 'none';
    }
    
    // In mastery-based system, show static debug info
    const rawIncorrectInfo = { depth: 'Mastery', difficulty: 'Mastery', mode: 'multiple_choice' };
    const incorrectInfo = { depth: 'Mastery', difficulty: 'Mastery', mode: 'multiple_choice' };
    
    const incorrectPreventionApplied = rawIncorrectInfo.mode !== incorrectInfo.mode;
    
    console.log(`📊 INCORRECT PREDICTIONS:`, {
        rawIncorrectPrediction: rawIncorrectInfo,
        adjustedIncorrectPrediction: incorrectInfo,
        preventionApplied: incorrectPreventionApplied
    });
    
    // Update incorrect answer preview
    const incorrectDepthEl = document.getElementById('incorrectDepth');
    const incorrectDifficultyEl = document.getElementById('incorrectDifficulty');
    const incorrectTypeEl = document.getElementById('incorrectType');
    const incorrectNoteEl = document.getElementById('incorrectNote');
    
    if (incorrectDepthEl) incorrectDepthEl.textContent = incorrectInfo.depth;
    if (incorrectDifficultyEl) incorrectDifficultyEl.textContent = incorrectInfo.difficulty;
    if (incorrectTypeEl) incorrectTypeEl.textContent = getDisplayName(incorrectInfo.mode);
    
    // Show/hide prevention note for incorrect answers
    if (incorrectNoteEl) {
        incorrectNoteEl.style.display = incorrectPreventionApplied ? 'block' : 'none';
    }
}

// Get adjusted next question preview that accounts for consecutive prevention logic
function getAdjustedNextQuestionPreview(questionId, assumeCorrect = true) {
    // In mastery-based system, return static predictions
    const rawInfo = assumeCorrect ? 
        { depth: 'Mastery', mode: 'completed', difficulty: 'Mastery' } :
        { depth: 'Mastery', mode: 'multiple_choice', difficulty: 'Mastery' };
    
    // If the question would be completed, return as-is
    if (rawInfo.depth === 'Completed' || rawInfo.mode === 'Completed') {
        return rawInfo;
    }
    
    // Apply the same consecutive prevention logic used in adaptDifficulty()
    const currentFormat = currentQuestion.currentFormat;
    let adjustedMode = rawInfo.mode;
    
    // Apply consecutive matching/flashcard prevention for the same question
    // This prevents a question from becoming matching->flashcard or flashcard->matching
    if (currentFormat && 
        (currentFormat === 'matching' || currentFormat === 'flashcard') &&
        (adjustedMode === 'Matching' || adjustedMode === 'Flashcard') &&
        getDisplayName(adjustedMode).toLowerCase().replace(' ', '_') !== currentFormat) {
        
        console.log(`Debug preview: Preventing consecutive ${currentFormat} -> ${adjustedMode} adaptation for question ${questionId}`);
        
        // Use multiple choice as a safe alternative for adaptive progression
        adjustedMode = 'MCQ';
    }
    
    return {
        depth: rawInfo.depth,
        mode: adjustedMode,
        difficulty: rawInfo.difficulty,
        internalFormat: rawInfo.internalFormat
    };
}

// Helper function to get display names for adaptive learning modes
function getDisplayName(mode) {
    const displayNames = {
        'Flashcard': 'Flashcard',
        'Matching': 'Matching',
        'MCQ': 'Multiple choice',
        'Free-Form': 'Written',
        'Completed': 'Completed',
        'Unknown': 'Unknown'
    };
    return displayNames[mode] || mode;
}

// Handle debug option selection
function handleDebugOptionClick(option) {
    const type = option.dataset.type;
    const value = option.dataset.value;
    
    console.log('Debug option clicked:', type, value);
    
    if (type === 'question-type' && currentQuestion) {
        // Change the current question's format
        currentQuestion.currentFormat = value;
        
        // Update debug UI
        updateDebugUI();
        
        // Close the bottom sheet
        closeDebugBottomSheet();
        
        // Re-render the question with new format
        showQuestion();
        
        // Show feedback toast
        showToast(`Question type changed to: ${getQuestionTypeDisplayName(value)}`, 2000);
    } else if (type === 'badge-toggle') {
        // Toggle badge visibility
        toggleBadgeVisibility();
    }
}

// Initialize badge toggle state from localStorage
function initializeBadgeToggle() {
    const toggleBtn = document.getElementById('toggleBadgesBtn');
    if (!toggleBtn) {
        console.warn('Badge toggle button not found');
        return;
    }
    
    // Check localStorage for saved preference (default: hidden)
    const showBadges = localStorage.getItem('debugBadgesVisible') === 'true';
    const body = document.body;
    
    if (showBadges) {
        body.classList.add('show-debug-badges');
        toggleBtn.textContent = 'Hide API/CORRECT badges';
        toggleBtn.classList.add('selected');
        console.log('🏷️ Initialized badges as visible');
    } else {
        body.classList.remove('show-debug-badges');
        toggleBtn.textContent = 'Show API/CORRECT badges';
        toggleBtn.classList.remove('selected');
        console.log('🏷️ Initialized badges as hidden');
    }
}

// Toggle badge visibility (API, STATIC, CORRECT badges)
function toggleBadgeVisibility() {
    const body = document.body;
    const toggleBtn = document.getElementById('toggleBadgesBtn');
    const isCurrentlyShowing = body.classList.contains('show-debug-badges');
    
    if (isCurrentlyShowing) {
        // Hide badges
        body.classList.remove('show-debug-badges');
        toggleBtn.textContent = 'Show API/CORRECT badges';
        toggleBtn.classList.remove('selected');
        localStorage.setItem('debugBadgesVisible', 'false');
        console.log('🏷️ Badges hidden');
        showToast('Debug badges hidden', 1500);
    } else {
        // Show badges
        body.classList.add('show-debug-badges');
        toggleBtn.textContent = 'Hide API/CORRECT badges';
        toggleBtn.classList.add('selected');
        localStorage.setItem('debugBadgesVisible', 'true');
        console.log('🏷️ Badges visible');
        showToast('Debug badges visible', 1500);
    }
}

// Helper function to get display name for question types
function getQuestionTypeDisplayName(type) {
    const displayNames = {
        'multiple_choice': 'Multiple choice',
        'flashcard': 'Flashcard',
        'written': 'Written',
        'matching': 'Matching'
    };
    return displayNames[type] || type;
}

// Explanation bottom sheet functionality
function setupExplanationBottomSheetListeners() {
    console.log('Setting up explanation bottom sheet listeners...');
    explanationBottomSheet = document.getElementById('explanationBottomSheet');
    closeExplanationSheetBtn = document.getElementById('closeExplanationSheet');
    
    console.log('Explanation elements found:', {
        bottomSheet: !!explanationBottomSheet,
        closeBtn: !!closeExplanationSheetBtn,
        doneBtn: !!document.getElementById('doneButton'),
        questionInput: !!document.getElementById('questionInput')
    });
    
    if (!explanationBottomSheet || !closeExplanationSheetBtn) {
        console.warn('Explanation bottom sheet elements not found');
        return;
    }
    
    // Close button handler
    closeExplanationSheetBtn.addEventListener('click', closeExplanationBottomSheet);
    
    // Explanation option handlers
    document.addEventListener('click', function(e) {
        if (e.target.closest('.explanation-option')) {
            const option = e.target.closest('.explanation-option');
            const optionText = option.querySelector('span').textContent;
            handleExplanationOptionClick(optionText);
        }
    });
    
    // Done button removed - no longer needed
    
    // Question input handler
    const questionInput = document.getElementById('questionInput');
    if (questionInput) {
        questionInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && questionInput.value.trim()) {
                handleQuestionSubmit(questionInput.value.trim());
                questionInput.value = '';
            }
        });
    }
    
    // Overlay click handler (close when clicking outside content)
    explanationBottomSheet.addEventListener('click', function(e) {
        if (e.target === explanationBottomSheet) {
            closeExplanationBottomSheet();
        }
    });
    
    // Escape key handler
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && explanationBottomSheet.classList.contains('show')) {
            closeExplanationBottomSheet();
        }
    });
}

// Open explanation bottom sheet
function openExplanationBottomSheet() {
    console.log('openExplanationBottomSheet called, bottom sheet exists:', !!explanationBottomSheet);
    
    if (!explanationBottomSheet) {
        console.error('Explanation bottom sheet not found!');
        explanationBottomSheet = document.getElementById('explanationBottomSheet');
        console.log('Retry found bottom sheet:', !!explanationBottomSheet);
        if (!explanationBottomSheet) return;
    }
    
    console.log('Opening explanation bottom sheet');
    explanationBottomSheet.classList.add('show');
    
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Update explanation content
    updateExplanationContent();
    
    console.log('Explanation bottom sheet should now be visible, classes:', explanationBottomSheet.className);
}

// Close explanation bottom sheet
function closeExplanationBottomSheet() {
    if (!explanationBottomSheet) return;
    
    console.log('Closing explanation bottom sheet');
    explanationBottomSheet.classList.remove('show');
    
    document.body.style.overflow = ''; // Restore scrolling
}

// Update explanation content with current question's explanation
function updateExplanationContent() {
    const explanationImage = document.getElementById('explanationImage');
    const formulaSection = document.getElementById('formulaSection');
    const formulaText = document.getElementById('formulaText');
    
    // Only show formula if available
    if (formulaSection && formulaText && currentQuestion && currentQuestion.formula) {
        formulaText.textContent = currentQuestion.formula;
        formulaSection.style.display = 'block';
    } else if (formulaSection) {
        formulaSection.style.display = 'none';
    }
}

// Handle explanation option clicks
function handleExplanationOptionClick(optionText) {
    console.log('Explanation option clicked:', optionText);
    
    // For now, show a simple response and auto-fill the input
    const questionInput = document.getElementById('questionInput');
    if (questionInput) {
        questionInput.value = optionText;
        questionInput.focus();
    }
    
    // Show toast feedback
    showToast(`Selected: "${optionText}" - AI responses coming soon.`, 2500);
    
    // You could implement specific AI prompts based on the option selected
    // Example: sendPromptedQuestionToAI(optionText, currentQuestion.id);
}

// Handle question submission from the input
function handleQuestionSubmit(question) {
    console.log('User asked:', question);
    
    // For now, show a simple response
    // In a real implementation, this would connect to an AI API
    showToast(`Great question! "${question}" - AI responses coming soon.`, 3000);
    
    // You could implement actual AI chat functionality here
    // Example: sendToAI(question, currentQuestion.id);
}

// Create button container with continue and explanation buttons for incorrect answers
function createIncorrectAnswerButtons() {
    console.log('createIncorrectAnswerButtons called for', currentQuestion.currentFormat, 'question');
    
    // Remove any existing button containers
    const existingContainer = document.querySelector('.button-container');
    if (existingContainer) {
        existingContainer.remove();
    }
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    
    // Add specific class for multiple choice to match answer options width
    if (currentQuestion.currentFormat === 'multiple_choice') {
        buttonContainer.classList.add('multiple-choice-buttons');
    }
    
    // Create explanation button first (only for multiple choice, written, and matching questions with explanations)
    if ((currentQuestion.currentFormat === 'multiple_choice' || currentQuestion.currentFormat === 'written' || currentQuestion.currentFormat === 'matching') && 
        currentQuestion.explanation) {
        console.log('Adding explanation button for question with explanation');
        
        const explanationBtn = document.createElement('button');
        explanationBtn.className = 'explanation-button';
        explanationBtn.innerHTML = '<img src="../images/sparkle.png" alt="Learn more" />';
        explanationBtn.setAttribute('aria-label', 'Learn more about this concept');
        
        explanationBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Explanation button clicked');
            openExplanationBottomSheet();
        });
        
        // Add explanation button to container first
        buttonContainer.appendChild(explanationBtn);
        console.log('Explanation button added to container');
    } else {
        console.log('No explanation button created:', {
            format: currentQuestion.currentFormat,
            hasExplanation: !!currentQuestion.explanation
        });
    }
    
    // Create continue button
    const continueBtn = document.createElement('button');
    continueBtn.textContent = 'Continue';
    continueBtn.className = 'continue-btn';
    continueBtn.addEventListener('click', () => {
        nextQuestion();
    });
    
    // Add continue button to container
    buttonContainer.appendChild(continueBtn);
    
    // Add container to page
    document.body.appendChild(buttonContainer);
    console.log('Button container added to page with', buttonContainer.children.length, 'buttons');
}

// Create explanation button for incorrect answers
function createExplanationButton() {
    console.log('createExplanationButton called', {
        currentQuestion: currentQuestion?.id,
        hasExplanation: !!currentQuestion?.explanation,
        explanation: currentQuestion?.explanation?.substring(0, 50) + '...'
    });
    
    // Remove any existing explanation button
    const existingBtn = document.querySelector('.explanation-button');
    if (existingBtn) {
        existingBtn.remove();
    }
    
    // Only create button if current question has an explanation
    if (!currentQuestion || !currentQuestion.explanation) {
        console.log('No explanation available for current question');
        return;
    }
    
    // Create the explanation button
    const explanationBtn = document.createElement('button');
    explanationBtn.className = 'explanation-button';
    explanationBtn.innerHTML = '<span class="material-icons-round">lightbulb</span>';
    explanationBtn.setAttribute('aria-label', 'Learn more about this concept');
    explanationBtn.style.cssText = `
        background: #A7F3D0 !important;
        border: 3px solid #059669 !important;
        border-radius: 50% !important;
        padding: 16px !important;
        font-size: 24px !important;
        color: #064E3B !important;
        cursor: pointer !important;
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        width: 64px !important;
        height: 64px !important;
        z-index: 9999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important;
        opacity: 1 !important;
        visibility: visible !important;
    `;
    
    explanationBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Explanation button clicked');
        openExplanationBottomSheet();
    });
    
    // Add to page
    document.body.appendChild(explanationBtn);
    console.log('Explanation button added to page');
    console.log('Button element:', explanationBtn);
    console.log('Button in DOM:', document.body.contains(explanationBtn));
    
    // Adjust continue button to make room
    const continueBtn = document.querySelector('.continue-btn');
    if (continueBtn) {
        continueBtn.classList.add('with-explanation');
        console.log('Continue button adjusted for explanation');
    }
    
    return explanationBtn;
}

// Remove explanation button
function removeExplanationButton() {
    const explanationBtn = document.querySelector('.explanation-button');
    if (explanationBtn) {
        explanationBtn.remove();
    }
    
    // Reset continue button width
    const continueBtn = document.querySelector('.continue-btn');
    if (continueBtn) {
        continueBtn.classList.remove('with-explanation');
    }
}

// No longer needed - bottom sheet is in HTML

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

// Make debug functions available globally for testing
window.openDebugBottomSheet = openDebugBottomSheet;
window.testDebugSheet = function() {
    console.log('Testing debug sheet directly...');
    const bottomSheet = document.getElementById('debugBottomSheet');
    console.log('Found bottom sheet element:', !!bottomSheet);
    if (bottomSheet) {
        bottomSheet.classList.add('show');
        console.log('Debug sheet should now be visible');
    }
};

// Test function for shimmer animation
window.testShimmer = function() {
    console.log('🧪 Testing shimmer animation...');
    multipleChoice.style.display = 'flex';
    showQuestionTextShimmer();
    showMultipleChoiceShimmer();
    console.log('✨ Shimmer should now be visible on question text and multiple choice options');
};

// Test function to restore normal options
window.testNormalOptions = function() {
    console.log('🧪 Testing normal options...');
    multipleChoice.style.display = 'flex';
    
    // Clear question text shimmer
    const questionTextEl = document.getElementById('questionText');
    const questionShimmerLines = questionTextEl.querySelectorAll('.shimmer-line');
    questionShimmerLines.forEach(line => line.remove());
    questionTextEl.className = 'question-text';
    questionTextEl.textContent = 'What is the primary function of the cell membrane?';
    
    // Clear option shimmer and set normal options
    const optionBtns = multipleChoice.querySelectorAll('.option-btn');
    const testOptions = ['Test Option A', 'Test Option B', 'Test Option C', 'Test Option D'];
    
    optionBtns.forEach((btn, index) => {
        // Clear shimmer elements
        const shimmerLines = btn.querySelectorAll('.shimmer-line');
        shimmerLines.forEach(line => line.remove());
        
        btn.textContent = testOptions[index];
        btn.dataset.answer = testOptions[index];
        btn.className = 'option-btn';
        btn.disabled = false;
        btn.style.cursor = 'pointer';
    });
    console.log('✅ Normal options and question should now be visible');
};

// Debug function to test explanation button
window.testExplanationButton = function() {
    console.log('Testing explanation button creation...');
    console.log('Current question:', {
        id: currentQuestion?.id,
        format: currentQuestion?.currentFormat,
        hasExplanation: !!currentQuestion?.explanation
    });
    createExplanationButton();
};

// Simple test function to create button manually
window.forceCreateExplanationButton = function() {
    console.log('Force creating explanation button...');
    
    // Remove existing button
    const existing = document.querySelector('.explanation-button');
    if (existing) existing.remove();
    
    // Create simple test button
    const btn = document.createElement('button');
    btn.textContent = '💡';
    btn.style.cssText = `
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        width: 64px !important;
        height: 64px !important;
        background: lime !important;
        border: 3px solid red !important;
        border-radius: 50% !important;
        font-size: 32px !important;
        z-index: 9999 !important;
        cursor: pointer !important;
        display: block !important;
    `;
    btn.onclick = () => alert('Button works!');
    document.body.appendChild(btn);
    console.log('Test button created');
};

// Debug function to check for existing buttons
window.checkButtons = function() {
    const buttonContainer = document.querySelector('.button-container');
    const continueBtn = document.querySelector('.continue-btn');
    const explanationBtn = document.querySelector('.explanation-button');
    console.log('Button check:', {
        buttonContainer: !!buttonContainer,
        containerChildren: buttonContainer?.children.length,
        continueBtn: !!continueBtn,
        explanationBtn: !!explanationBtn,
        continueClasses: continueBtn?.className,
        explanationClasses: explanationBtn?.className
    });
};

// Debug function to test MCQ feedback manually
window.testMCQFeedback = function() {
    console.log('🧪 TESTING MCQ FEEDBACK SYSTEM...');
    
    // Check if we have MCQ buttons
    const optionBtns = document.querySelectorAll('.option-btn');
    if (optionBtns.length === 0) {
        console.log('❌ No MCQ buttons found. Switch to multiple choice question first.');
        return;
    }
    
    console.log('📊 CURRENT QUESTION STATE:', {
        id: currentQuestion?.id,
        format: currentQuestion?.currentFormat,
        correctAnswer: currentQuestion?.correctAnswer,
        question: currentQuestion?.question?.substring(0, 50) + '...',
        options: currentQuestion?.options
    });
    
    // Show all button states BEFORE feedback
    console.log('🔘 BUTTON STATES BEFORE FEEDBACK:');
    optionBtns.forEach((btn, index) => {
        console.log(`  Button ${index}:`, {
            textContent: btn.textContent?.substring(0, 30) + '...',
            dataAnswer: btn.dataset.answer,
            classes: btn.className,
            isCorrectAnswer: btn.dataset.answer === currentQuestion?.correctAnswer
        });
    });
    
    // Test with wrong answer (pick first option that's NOT the correct answer)
    let wrongAnswerBtn = null;
    for (let i = 0; i < optionBtns.length; i++) {
        if (optionBtns[i].dataset.answer !== currentQuestion?.correctAnswer) {
            wrongAnswerBtn = optionBtns[i];
            break;
        }
    }
    
    if (!wrongAnswerBtn) {
        console.log('❌ Could not find a wrong answer to test with');
        return;
    }
    
    console.log('🎯 SIMULATING WRONG ANSWER:', {
        selectedButton: wrongAnswerBtn.textContent?.substring(0, 30) + '...',
        selectedAnswer: wrongAnswerBtn.dataset.answer,
        correctAnswer: currentQuestion?.correctAnswer
    });
    
    console.log('📝 EXPECTED RESULTS:');
    console.log('  1. Selected button should show RED X (incorrect class)');
    console.log('  2. Button with correct answer should show GREEN checkmark (correct class)');
    
    // Set the selected answer and trigger feedback
    selectedAnswer = wrongAnswerBtn.dataset.answer;
    isAnswered = true;
    showFeedback(false); // Simulate incorrect answer
    
    console.log('✅ Feedback applied. Check the buttons and console for detailed logs.');
};

// Debug function specifically for testing first button issue
window.testFirstButtonIssue = function() {
    console.log('🔍 TESTING FIRST BUTTON ISSUE...');
    
    const optionBtns = document.querySelectorAll('.option-btn');
    if (optionBtns.length === 0) {
        console.log('❌ No MCQ buttons found');
        return;
    }
    
    console.log('📊 BEFORE TEST - Current Question:', {
        correctAnswer: currentQuestion?.correctAnswer,
        question: currentQuestion?.question?.substring(0, 50) + '...'
    });
    
    console.log('📊 BEFORE TEST - Button States:');
    optionBtns.forEach((btn, index) => {
        console.log(`  Button ${index}:`, {
            text: btn.textContent?.substring(0, 30) + '...',
            dataAnswer: btn.dataset.answer,
            classes: btn.className,
            isFirst: index === 0
        });
    });
    
    // Test selecting the FIRST button (which should show X if it's wrong)
    const firstBtn = optionBtns[0];
    console.log('🎯 SIMULATING SELECTION OF FIRST BUTTON:', {
        buttonText: firstBtn.textContent,
        buttonAnswer: firstBtn.dataset.answer,
        correctAnswer: currentQuestion?.correctAnswer,
        shouldBeCorrect: firstBtn.dataset.answer === currentQuestion?.correctAnswer
    });
    
    // Set selected answer and trigger feedback
    selectedAnswer = firstBtn.dataset.answer;
    isAnswered = true;
    
    // Determine if this should be correct or incorrect
    const shouldBeCorrect = selectedAnswer === currentQuestion?.correctAnswer;
    console.log(`🧪 Expected result: ${shouldBeCorrect ? 'CORRECT (green checkmark)' : 'INCORRECT (red X)'}`);
    
    showFeedback(shouldBeCorrect);
    
    console.log('✅ Test complete. Check if first button shows correct feedback.');
};

// Debug function specifically for the first option highlighting issue
window.testFirstOptionFeedback = function() {
    console.log('🧪 TESTING FIRST OPTION FEEDBACK ISSUE...');
    
    const optionBtns = document.querySelectorAll('.option-btn');
    if (optionBtns.length === 0) {
        console.log('❌ No MCQ buttons found');
        return;
    }
    
    console.log('📊 INITIAL STATE:');
    console.log('Original correct answer:', `"${currentQuestion?.correctAnswer}"`);
    console.log('First button text:', `"${optionBtns[0]?.dataset.answer}"`);
    
    // Test scenario: User selects first option, which should be highlighted as correct due to placeholder fallback
    selectedAnswer = optionBtns[0].dataset.answer;
    isAnswered = true;
    
    console.log('🎯 SIMULATING: User selects first option');
    console.log('Expected behavior: First option should show GREEN checkmark (correct) since API has placeholder');
    console.log('Problem: First option showing RED X (incorrect)');
    
    // The issue might be in the logic priority - let me check the order
    console.log('🔍 LOGIC FLOW ANALYSIS:');
    console.log('1. User selected first option');
    console.log('2. API has placeholder correct answer');
    console.log('3. Fallback should make first option the "correct" answer');
    console.log('4. Since user selected the "correct" answer, it should be green');
    console.log('5. But it\'s showing red, suggesting logic conflict');
    
    showFeedback(false); // This simulates the incorrect feedback you're seeing
    
    console.log('🔧 Check the debug logs above to see the logic flow');
};

// Debug function specifically for missing correct answer feedback
window.debugMissingCorrectFeedback = function() {
    console.log('🔍 DEBUGGING MISSING CORRECT ANSWER FEEDBACK...');
    
    const optionBtns = document.querySelectorAll('.option-btn');
    if (optionBtns.length === 0) {
        console.log('❌ No MCQ buttons found');
        return;
    }
    
    if (!currentQuestion?.correctAnswer) {
        console.log('❌ No correct answer available in current question');
        return;
    }
    
    console.log('📊 QUESTION DATA:', {
        correctAnswer: `"${currentQuestion.correctAnswer}"`,
        correctAnswerType: typeof currentQuestion.correctAnswer,
        correctAnswerLength: currentQuestion.correctAnswer.length,
        questionId: currentQuestion.id
    });
    
    console.log('📊 ALL BUTTON ANALYSIS:');
    let foundMatch = false;
    optionBtns.forEach((btn, index) => {
        const buttonText = btn.dataset.answer;
        const correctAnswer = currentQuestion.correctAnswer;
        
        // Test all matching strategies (including new fuzzy matching)
        const exactMatch = buttonText === correctAnswer;
        const trimMatch = buttonText?.trim() === correctAnswer?.trim();
        const lowerMatch = buttonText?.toLowerCase().trim() === correctAnswer?.toLowerCase().trim();
        const similarity = calculateSimilarity(buttonText, correctAnswer);
        const fuzzyMatch = similarity > 0.8;
        const containsMatch = buttonText && correctAnswer && 
            (buttonText.toLowerCase().includes(correctAnswer.toLowerCase()) || 
             correctAnswer.toLowerCase().includes(buttonText.toLowerCase()));
        const isMatch = exactMatch || trimMatch || lowerMatch || fuzzyMatch || containsMatch;
        
        if (isMatch) foundMatch = true;
        
        console.log(`  Button ${index} ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}:`, {
            buttonText: `"${buttonText}"`,
            buttonType: typeof buttonText,
            buttonLength: buttonText?.length,
            correctAnswer: `"${correctAnswer}"`,
            exactMatch,
            trimMatch,
            lowerMatch,
            fuzzyMatch,
            containsMatch,
            similarity: Math.round(similarity * 100) + '%',
            currentClasses: btn.className
        });
    });
    
    if (!foundMatch) {
        console.log('🚨 PROBLEM IDENTIFIED: No button text matches the correct answer!');
        console.log('Possible causes:');
        console.log('1. API correct answer has different formatting');
        console.log('2. Button options were shuffled but correctAnswer wasn\'t updated');
        console.log('3. Data type mismatch (string vs number)');
        console.log('4. Hidden characters or encoding issues');
        
        // Show character-by-character comparison
        console.log('🔬 CHARACTER ANALYSIS:');
        optionBtns.forEach((btn, index) => {
            const buttonText = btn.dataset.answer;
            const correctAnswer = currentQuestion.correctAnswer;
            
            console.log(`Button ${index} chars:`, Array.from(buttonText || '').map(c => c.charCodeAt(0)));
            console.log(`Correct answer chars:`, Array.from(correctAnswer || '').map(c => c.charCodeAt(0)));
        });
    } else {
        console.log('✅ MATCH FOUND: The matching logic should work');
        console.log('Problem might be in CSS class application or timing');
    }
    
    return { foundMatch, questionData: currentQuestion, buttons: Array.from(optionBtns).map(btn => btn.dataset.answer) };
};

// Function to show detailed mismatch analysis
window.analyzeMismatch = function() {
    console.log('🔬 ANALYZING DATA MISMATCH...');
    
    const optionBtns = document.querySelectorAll('.option-btn');
    if (!currentQuestion?.correctAnswer || optionBtns.length === 0) {
        console.log('❌ Missing data for analysis');
        return;
    }
    
    let correctAnswer = currentQuestion.correctAnswer;
    console.log('📝 EXPECTED CORRECT ANSWER:', `"${correctAnswer}"`);
    
    // Check for placeholder answers
    const isPlaceholderAnswer = correctAnswer && (
        correctAnswer.toLowerCase().includes('not available') ||
        correctAnswer.toLowerCase().includes('no answer') ||
        correctAnswer.toLowerCase().includes('placeholder') ||
        correctAnswer === '' ||
        correctAnswer === null
    );
    
    if (isPlaceholderAnswer) {
        console.log('🚨 PLACEHOLDER DETECTED: API provided placeholder instead of real answer!');
        if (currentQuestion.options && currentQuestion.options.length > 0) {
            correctAnswer = currentQuestion.options[0];
            console.log('🔧 FALLBACK: Using first option as correct answer:', `"${correctAnswer}"`);
        }
    }
    
    console.log('📋 AVAILABLE BUTTON OPTIONS:');
    
    optionBtns.forEach((btn, index) => {
        const buttonText = btn.dataset.answer;
        console.log(`  ${index}: "${buttonText}"`);
        
        // Show similarity score
        const similarity = calculateSimilarity(correctAnswer, buttonText);
        if (similarity > 0.5) {
            console.log(`      ⭐ ${Math.round(similarity * 100)}% similar - potential match`);
        }
    });
    
    // Check if correct answer is in the original options array
    console.log('🔍 CHECKING ORIGINAL OPTIONS:');
    if (currentQuestion.options) {
        console.log('Original options array:', currentQuestion.options);
        const inOptions = currentQuestion.options.includes(correctAnswer);
        console.log(`Correct answer in options: ${inOptions ? '✅ YES' : '❌ NO'}`);
        
        if (!inOptions) {
            console.log('🚨 ROOT CAUSE: correctAnswer is not in the options array!');
            console.log('This suggests:');
            console.log('1. API data inconsistency');
            console.log('2. Options were shuffled but correctAnswer wasn\'t updated');
            console.log('3. Different data sources for question vs options');
        }
    }
    
    return {
        correctAnswer,
        buttonTexts: Array.from(optionBtns).map(btn => btn.dataset.answer),
        originalOptions: currentQuestion.options
    };
};

// Helper function to calculate string similarity
function calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = getEditDistance(longer.toLowerCase(), shorter.toLowerCase());
    return (longer.length - editDistance) / longer.length;
}

// Helper function to calculate edit distance
function getEditDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

// Manual function to force correct answer highlighting (for testing CSS)
window.forceCorrectAnswerHighlight = function() {
    console.log('🔧 FORCING CORRECT ANSWER HIGHLIGHT...');
    
    const optionBtns = document.querySelectorAll('.option-btn');
    if (optionBtns.length === 0) {
        console.log('❌ No MCQ buttons found');
        return;
    }
    
    if (!currentQuestion?.correctAnswer) {
        console.log('❌ No correct answer available');
        return;
    }
    
    let correctAnswer = currentQuestion.correctAnswer;
    
    // Handle placeholder answers
    const isPlaceholderAnswer = correctAnswer && (
        correctAnswer.toLowerCase().includes('not available') ||
        correctAnswer.toLowerCase().includes('no answer') ||
        correctAnswer.toLowerCase().includes('placeholder') ||
        correctAnswer === '' ||
        correctAnswer === null
    );
    
    if (isPlaceholderAnswer) {
        console.log('🚨 PLACEHOLDER DETECTED in force highlight');
        if (currentQuestion.options && currentQuestion.options.length > 0) {
            correctAnswer = currentQuestion.options[0];
            console.log('🔧 Using first option as fallback:', correctAnswer);
        }
    }
    
    console.log('🎯 Looking for button with correct answer:', correctAnswer);
    
    let highlightedCount = 0;
    optionBtns.forEach((btn, index) => {
        const buttonText = btn.dataset.answer;
        
        // Clear all classes first
        btn.classList.remove('selected', 'correct', 'correct-selected', 'incorrect', 'shake');
        
        // Check if this should be the correct button (using loose matching)
        const isCorrectButton = buttonText?.toLowerCase().trim() === currentQuestion.correctAnswer?.toLowerCase().trim();
        
        if (isCorrectButton) {
            btn.classList.add('correct');
            highlightedCount++;
            console.log(`✅ FORCED HIGHLIGHT: Button ${index} - "${buttonText}"`);
            console.log('Applied classes:', btn.className);
        } else {
            console.log(`⏭️ SKIPPED: Button ${index} - "${buttonText}"`);
        }
    });
    
    if (highlightedCount === 0) {
        console.log('🚨 NO BUTTONS HIGHLIGHTED! Trying fallback approach...');
        
        // Fallback: highlight first button for CSS testing
        const firstBtn = optionBtns[0];
        firstBtn.classList.add('correct');
        console.log('🧪 FALLBACK: Highlighted first button for CSS testing');
        console.log('First button classes:', firstBtn.className);
        
        // Test if CSS is working by checking computed styles
        setTimeout(() => {
            const styles = getComputedStyle(firstBtn);
            console.log('🎨 FIRST BUTTON COMPUTED STYLES:', {
                borderColor: styles.borderColor,
                borderStyle: styles.borderStyle,
                borderWidth: styles.borderWidth,
                classes: firstBtn.className
            });
        }, 100);
    } else {
        console.log(`✅ Highlighted ${highlightedCount} button(s) with correct answer`);
    }
};

// Debug function to test correct feedback specifically
window.testCorrectFeedback = function() {
    console.log('Testing CORRECT feedback...');
    
    const optionBtns = document.querySelectorAll('.option-btn');
    if (optionBtns.length === 0) {
        console.log('No MCQ buttons found. Switch to multiple choice question first.');
        return;
    }
    
    console.log('Current question:', {
        id: currentQuestion?.id,
        format: currentQuestion?.currentFormat,
        correctAnswer: currentQuestion?.correctAnswer
    });
    
    // Find the correct answer button
    const correctBtn = Array.from(optionBtns).find(btn => 
        btn.dataset.answer === currentQuestion?.correctAnswer
    );
    
    if (correctBtn) {
        console.log('Found correct button:', correctBtn.dataset.answer);
        
        // Simulate selecting the correct answer
        selectedAnswer = correctBtn.dataset.answer;
        showFeedback(true); // Simulate correct answer
        
        console.log('Correct feedback applied. Button classes:', correctBtn.className);
    } else {
        console.log('Could not find correct answer button');
        optionBtns.forEach((btn, index) => {
            console.log(`Button ${index}: "${btn.dataset.answer}" vs correct: "${currentQuestion?.correctAnswer}"`);
        });
    }
};

// Debug function to manually test button styling
window.testButtonStyling = function() {
    const optionBtns = document.querySelectorAll('.option-btn');
    if (optionBtns.length === 0) {
        console.log('No MCQ buttons found');
        return;
    }
    
    console.log('Testing button styling...');
    
    // Clear all classes first
    optionBtns.forEach(btn => {
        btn.classList.remove('selected', 'correct', 'correct-selected', 'incorrect', 'shake');
    });
    
    // Apply different states to different buttons
    if (optionBtns[0]) {
        optionBtns[0].classList.add('correct');
        console.log('Applied .correct to button 0');
    }
    if (optionBtns[1]) {
        optionBtns[1].classList.add('correct-selected');
        console.log('Applied .correct-selected to button 1');
    }
    if (optionBtns[2]) {
        optionBtns[2].classList.add('incorrect');
        console.log('Applied .incorrect to button 2');
    }
    
    // Log final states
    optionBtns.forEach((btn, index) => {
        console.log(`Button ${index} final state:`, {
            classes: btn.className,
            text: btn.textContent.substring(0, 20) + '...'
        });
    });
};

// Simple test function to force correct styling on all buttons
window.forceCorrectStyling = function() {
    console.log('Force applying correct styling to all buttons...');
    
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach((btn, index) => {
        btn.classList.remove('selected', 'correct', 'correct-selected', 'incorrect', 'shake');
        btn.classList.add('correct');
        console.log(`Applied .correct to button ${index}: ${btn.textContent.substring(0, 30)}...`);
    });
    
    console.log('All buttons should now have green dashed borders and checkmarks');
};

// Enhanced debug function to check exact matching issues
window.debugAnswerMatching = function() {
    console.log('🔍 DEBUGGING ANSWER MATCHING...');
    
    const optionBtns = document.querySelectorAll('.option-btn');
    if (optionBtns.length === 0) {
        console.log('❌ No MCQ buttons found');
        return;
    }
    
    console.log('📊 Current Question Data:', {
        id: currentQuestion?.id,
        correctAnswer: currentQuestion?.correctAnswer,
        correctAnswerType: typeof currentQuestion?.correctAnswer,
        correctAnswerLength: currentQuestion?.correctAnswer?.length,
        options: currentQuestion?.options,
        originalOptions: currentQuestion?.options,
        questionText: currentQuestion?.question?.substring(0, 50) + '...'
    });
    
    console.log('🔎 Button Analysis:');
    let foundMatch = false;
    let bestMatchIndex = -1;
    let bestMatchScore = 0;
    
    optionBtns.forEach((btn, index) => {
        const buttonAnswer = btn.dataset.answer;
        const buttonText = btn.textContent;
        const correctAnswer = currentQuestion?.correctAnswer;
        
        const isExactMatch = buttonAnswer === correctAnswer;
        const isTrimMatch = buttonAnswer?.trim() === correctAnswer?.trim();
        const isLowerMatch = buttonAnswer?.toLowerCase().trim() === correctAnswer?.toLowerCase().trim();
        const isTextMatch = buttonText?.trim() === correctAnswer?.trim();
        const isTextLowerMatch = buttonText?.toLowerCase().trim() === correctAnswer?.toLowerCase().trim();
        
        // Calculate match score for finding best candidate
        let matchScore = 0;
        if (isExactMatch) matchScore = 100;
        else if (isTrimMatch || isTextMatch) matchScore = 90;
        else if (isLowerMatch || isTextLowerMatch) matchScore = 80;
        
        console.log(`Button ${index}:`, {
            text: buttonText,
            dataAnswer: buttonAnswer,
            correctAnswer: correctAnswer,
            exactMatch: isExactMatch,
            trimMatch: isTrimMatch,
            lowerMatch: isLowerMatch,
            textMatch: isTextMatch,
            textLowerMatch: isTextLowerMatch,
            matchScore: matchScore,
            classes: btn.className
        });
        
        if (matchScore > bestMatchScore) {
            bestMatchScore = matchScore;
            bestMatchIndex = index;
        }
        
        if (isExactMatch || isTrimMatch || isLowerMatch || isTextMatch || isTextLowerMatch) {
            foundMatch = true;
            console.log(`✅ MATCH FOUND on button ${index} (score: ${matchScore})`);
        }
    });
    
    if (!foundMatch) {
        console.log('❌ NO MATCHING BUTTON FOUND!');
        console.log(`🎯 Best candidate is button ${bestMatchIndex} with score ${bestMatchScore}`);
        console.log('🔧 Possible issues:');
        console.log('1. Case sensitivity mismatch');
        console.log('2. Extra whitespace in data');
        console.log('3. Options shuffling created new text');
        console.log('4. API data formatting issue');
        console.log('5. correctAnswer not in options array');
    } else {
        console.log(`🎯 Best match is button ${bestMatchIndex} with score ${bestMatchScore}`);
    }
    
    return { 
        foundMatch, 
        bestMatchIndex, 
        bestMatchScore, 
        currentQuestion, 
        buttons: Array.from(optionBtns).map(btn => ({
            text: btn.textContent,
            dataAnswer: btn.dataset.answer
        }))
    };
};

// Force highlight the correct answer as a failsafe
window.forceHighlightCorrectAnswer = function() {
    console.log('🚑 FORCE HIGHLIGHTING CORRECT ANSWER...');
    
    const debug = debugAnswerMatching();
    if (debug.bestMatchIndex >= 0) {
        const optionBtns = document.querySelectorAll('.option-btn');
        const bestBtn = optionBtns[debug.bestMatchIndex];
        
        if (bestBtn) {
            bestBtn.classList.remove('selected', 'correct', 'correct-selected', 'incorrect', 'shake');
            bestBtn.classList.add('correct');
            console.log(`✅ FORCED correct styling on button ${debug.bestMatchIndex}: ${bestBtn.textContent}`);
            return true;
        }
    }
    
    console.log('❌ Could not force highlight - no suitable button found');
    return false;
};

// Comprehensive correct answer highlighting test
window.testCorrectAnswerHighlighting = function() {
    console.log('🧪 COMPREHENSIVE CORRECT ANSWER HIGHLIGHTING TEST');
    
    const optionBtns = document.querySelectorAll('.option-btn');
    if (optionBtns.length === 0) {
        console.log('❌ No MCQ buttons found. Switch to a multiple choice question first.');
        return;
    }
    
    console.log('📊 CURRENT STATE:');
    console.log('Current question:', currentQuestion);
    console.log('Selected answer:', selectedAnswer);
    console.log('Correct answer:', currentQuestion?.correctAnswer);
    
    // Step 1: Test CSS classes directly
    console.log('\n🎨 STEP 1: Testing CSS styling directly');
    optionBtns.forEach((btn, index) => {
        btn.classList.remove('selected', 'correct', 'correct-selected', 'incorrect', 'shake');
        if (index === 0) {
            btn.classList.add('correct');
            console.log(`Applied .correct to button 0, classes now: ${btn.className}`);
            setTimeout(() => {
                console.log(`Button 0 computed styles:`, {
                    borderColor: getComputedStyle(btn).borderColor,
                    borderStyle: getComputedStyle(btn).borderStyle,
                    borderWidth: getComputedStyle(btn).borderWidth
                });
            }, 50);
        }
    });
    
    // Step 2: Test the actual matching logic
    setTimeout(() => {
        console.log('\n🔍 STEP 2: Testing matching logic');
        const correctAnswer = currentQuestion?.correctAnswer;
        let foundMatch = false;
        
        optionBtns.forEach((btn, index) => {
            const buttonText = btn.dataset.answer;
            const match1 = buttonText === correctAnswer;
            const match2 = buttonText?.trim() === correctAnswer?.trim();
            const match3 = buttonText?.toLowerCase().trim() === correctAnswer?.toLowerCase().trim();
            
            console.log(`Button ${index} matching:`, {
                buttonText: buttonText,
                correctAnswer: correctAnswer,
                exactMatch: match1,
                trimMatch: match2,
                lowerMatch: match3,
                anyMatch: match1 || match2 || match3
            });
            
            if (match1 || match2 || match3) {
                foundMatch = true;
                console.log(`🎯 SHOULD HIGHLIGHT BUTTON ${index}`);
            }
        });
        
        if (!foundMatch) {
            console.log('⚠️ NO MATCHES FOUND - This is why correct answer isn\'t highlighted!');
            console.log('Possible solutions:');
            console.log('1. Check if correctAnswer matches any button text exactly');
            console.log('2. Check if API data is formatted correctly');
            console.log('3. Check if question options were generated properly');
        }
        
        // Step 3: Force apply styles to see if CSS is working
        console.log('\n🚨 STEP 3: Force applying styles to all buttons');
        optionBtns.forEach((btn, index) => {
            btn.classList.remove('selected', 'correct', 'correct-selected', 'incorrect', 'shake');
        });
        
        // Apply different styles to different buttons
        if (optionBtns[0]) {
            optionBtns[0].classList.add('correct');
            console.log('Applied .correct to button 0');
        }
        if (optionBtns[1]) {
            optionBtns[1].classList.add('correct-selected');
            console.log('Applied .correct-selected to button 1');
        }
        if (optionBtns[2]) {
            optionBtns[2].classList.add('incorrect');
            console.log('Applied .incorrect to button 2');
        }
        
        console.log('\n✅ TEST COMPLETE - Check the buttons visually!');
        console.log('If buttons don\'t show styling, there\'s a CSS issue.');
        console.log('If buttons show styling but normal feedback doesn\'t work, there\'s a data/matching issue.');
        
    }, 200);
};

// Simple test to just verify CSS styles work
window.testCSSStyles = function() {
    console.log('🎨 TESTING CSS STYLES');
    
    const optionBtns = document.querySelectorAll('.option-btn');
    if (optionBtns.length === 0) {
        console.log('❌ No MCQ buttons found');
        return;
    }
    
    // Clear all existing classes
    optionBtns.forEach(btn => {
        btn.classList.remove('selected', 'correct', 'correct-selected', 'incorrect', 'shake');
    });
    
    // Apply styles one by one and check
    if (optionBtns[0]) {
        console.log('Testing .correct class on button 0...');
        optionBtns[0].classList.add('correct');
        
        setTimeout(() => {
            const styles = getComputedStyle(optionBtns[0]);
            console.log('Button 0 with .correct:', {
                borderColor: styles.borderColor,
                borderStyle: styles.borderStyle,
                borderWidth: styles.borderWidth,
                classes: optionBtns[0].className,
                hasCorrectClass: optionBtns[0].classList.contains('correct')
            });
            
            // Check if the CSS rule is being applied
            console.log('Expected: dashed border with mint-600 color');
            console.log('Actual border style:', styles.borderStyle);
            console.log('Style includes "dashed":', styles.borderStyle.includes('dashed'));
            
        }, 100);
    }
};

// Debug function to examine question and button data thoroughly
window.examineQuestionData = function() {
    console.log('🔬 EXAMINING QUESTION AND BUTTON DATA');
    
    const optionBtns = document.querySelectorAll('.option-btn');
    
    console.log('📊 CURRENT QUESTION FULL DATA:');
    console.log(currentQuestion);
    
    console.log('\n📊 CURRENT QUESTION KEY FIELDS:');
    console.log({
        id: currentQuestion?.id,
        question: currentQuestion?.question,
        correctAnswer: currentQuestion?.correctAnswer,
        options: currentQuestion?.options,
        currentFormat: currentQuestion?.currentFormat,
        source: currentQuestion?.source
    });
    
    console.log('\n🔘 BUTTON DATA:');
    optionBtns.forEach((btn, index) => {
        console.log(`Button ${index}:`, {
            textContent: btn.textContent,
            dataAnswer: btn.dataset.answer,
            className: btn.className,
            id: btn.id,
            innerHTML: btn.innerHTML
        });
    });
    
    console.log('\n🎯 EXACT MATCHING TEST:');
    const correctAnswer = currentQuestion?.correctAnswer;
    optionBtns.forEach((btn, index) => {
        const buttonText = btn.dataset.answer;
        console.log(`Button ${index}: "${buttonText}" === "${correctAnswer}" = ${buttonText === correctAnswer}`);
    });
    
    console.log('\n🔍 CASE INSENSITIVE MATCHING TEST:');
    optionBtns.forEach((btn, index) => {
        const buttonText = btn.dataset.answer?.toLowerCase().trim();
        const correctLower = correctAnswer?.toLowerCase().trim();
        console.log(`Button ${index}: "${buttonText}" === "${correctLower}" = ${buttonText === correctLower}`);
    });
};

// Debug function to test dynamic text sizing
window.testDynamicTextSizing = function() {
    console.log('Testing dynamic text sizing...');
    
    const testTexts = [
        { text: "Short question?", expected: "text-subheading-1" }, // 15 chars
        { text: "What is the primary function of the cell membrane in regulating?", expected: "text-subheading-2" }, // 65 chars
        { text: "What is the primary function of the cell membrane and how does it contribute to maintaining homeostasis within the cell through selective permeability and transport mechanisms?", expected: "text-subheading-3" }, // 177 chars
        { text: "What is the primary function of the cell membrane and how does it contribute to maintaining homeostasis within the cell through selective permeability, active transport, passive transport, endocytosis, exocytosis, and various signaling pathways that regulate cellular communication and metabolic processes throughout the organism?", expected: "text-subheading-5" } // 328 chars
    ];
    
    testTexts.forEach((test, index) => {
        const actualClass = getDynamicTextClass(test.text.length);
        console.log(`Test ${index + 1}:`, {
            length: test.text.length,
            text: test.text.substring(0, 50) + '...',
            expected: test.expected,
            actual: actualClass,
            match: test.expected === actualClass ? '✅' : '❌'
        });
    });
    
    // Test with current question if available
    if (currentQuestion && currentQuestion.question) {
        console.log('Current question sizing:', {
            length: currentQuestion.question.length,
            text: currentQuestion.question.substring(0, 50) + '...',
            class: getDynamicTextClass(currentQuestion.question.length)
        });
        
        // Apply sizing to current question for visual test
        const questionTextEl = document.getElementById('questionText');
        if (questionTextEl) {
            applyDynamicTextSizing(questionTextEl, currentQuestion.question);
            console.log('Applied dynamic sizing to current question element');
        }
    }
};

// Debug function to test written question feedback
window.testWrittenFeedback = function() {
    console.log('Testing written question feedback...');
    
    // Check if we have written question elements
    const textAnswerEl = document.getElementById('textAnswer');
    const textInputEl = document.getElementById('textInput');
    const writtenFeedbackEl = document.getElementById('writtenFeedback');
    const correctAnswerFeedbackEl = document.getElementById('correctAnswerFeedback');
    
    console.log('Written feedback elements:', {
        textAnswer: !!textAnswerEl,
        textInput: !!textInputEl,
        writtenFeedback: !!writtenFeedbackEl,
        correctAnswerFeedback: !!correctAnswerFeedbackEl,
        currentQuestionFormat: currentQuestion?.currentFormat,
        currentQuestionAnswer: currentQuestion?.correctAnswer
    });
    
    if (!textAnswerEl || !writtenFeedbackEl) {
        console.log('❌ Missing written feedback elements. Make sure you\'re on a written question.');
        return;
    }
    
    // Log initial state
    console.log('Initial state:', {
        feedbackDisplay: writtenFeedbackEl.style.display,
        feedbackClasses: writtenFeedbackEl.className,
        inlineStyles: writtenFeedbackEl.getAttribute('style')
    });
    
    // Simulate incorrect answer feedback
    console.log('Simulating incorrect written answer feedback...');
    selectedAnswer = 'wrong answer';
    
    // Apply feedback manually with all possible overrides
    textAnswerEl.classList.add('incorrect');
    textInputEl.classList.add('incorrect');
    correctAnswerFeedbackEl.textContent = currentQuestion?.correctAnswer || 'Test correct answer';
    
    // Force show feedback with multiple approaches
    writtenFeedbackEl.style.display = 'flex';
    writtenFeedbackEl.style.visibility = 'visible';
    writtenFeedbackEl.style.opacity = '1';
    writtenFeedbackEl.style.height = 'auto';
    writtenFeedbackEl.removeAttribute('hidden');
    writtenFeedbackEl.classList.remove('hidden');
    
    textAnswerEl.disabled = true;
    
    console.log('Applied feedback styles. Check if feedback is visible.');
    
    // Log final state with computed styles
    setTimeout(() => {
        const computed = getComputedStyle(writtenFeedbackEl);
        console.log('Final state after manual application:', {
            feedbackDisplay: writtenFeedbackEl.style.display,
            computedDisplay: computed.display,
            computedVisibility: computed.visibility,
            computedOpacity: computed.opacity,
            computedHeight: computed.height,
            feedbackText: correctAnswerFeedbackEl.textContent,
            inputClasses: textAnswerEl.className,
            containerClasses: textInputEl.className,
            parentDisplay: getComputedStyle(textInputEl).display
        });
    }, 100);
};

// Test the new button container approach
window.testIncorrectButtons = function() {
    console.log('Testing incorrect answer buttons...');
    createIncorrectAnswerButtons();
};

// Test written question feedback specifically
window.testWrittenQuestionFeedback = function() {
    console.log('🧪 Testing written question feedback specifically...');
    
    // First, switch to text input mode
    multipleChoice.style.display = 'none';
    textInput.style.display = 'flex';
    
    // Set a test question for written format
    if (!currentQuestion || currentQuestion.currentFormat !== 'written') {
        currentQuestion = {
            id: 999,
            question: "What is the function of mitochondria?",
            correctAnswer: "Produce energy in the form of ATP",
            currentFormat: "written"
        };
    }
    
    console.log('📝 Current question setup:', {
        questionText: currentQuestion.question,
        correctAnswer: currentQuestion.correctAnswer,
        format: currentQuestion.currentFormat
    });
    
    // Simulate an incorrect answer
    selectedAnswer = "Store genetic material"; // Wrong answer
    isAnswered = true;
    
    console.log('💬 Simulating incorrect answer:', selectedAnswer);
    
    // Trigger the feedback
    showFeedback(false); // false = incorrect answer
    
    console.log('✅ Feedback should now be visible. Check the written feedback area.');
};

// Simple test to force show written feedback
window.forceShowWrittenFeedback = function() {
    console.log('🔧 Force showing written feedback...');
    
    const writtenFeedbackEl = document.getElementById('writtenFeedback');
    const correctAnswerFeedbackEl = document.getElementById('correctAnswerFeedback');
    const textInputEl = document.getElementById('textInput');
    
    if (!writtenFeedbackEl || !correctAnswerFeedbackEl) {
        console.error('❌ Required elements not found:', {
            writtenFeedback: !!writtenFeedbackEl,
            correctAnswerFeedback: !!correctAnswerFeedbackEl
        });
        return;
    }
    
    // Show text input container
    if (textInputEl) {
        textInputEl.style.display = 'flex';
        multipleChoice.style.display = 'none';
    }
    
    // Set test correct answer
    correctAnswerFeedbackEl.textContent = 'Test correct answer from manual function';
    
    // Force show feedback with all possible methods
    writtenFeedbackEl.classList.add('show');
    writtenFeedbackEl.style.display = 'flex !important';
    writtenFeedbackEl.style.visibility = 'visible !important';
    writtenFeedbackEl.style.opacity = '1 !important';
    writtenFeedbackEl.style.height = 'auto !important';
    writtenFeedbackEl.style.position = 'relative';
    writtenFeedbackEl.style.zIndex = '9999';
    writtenFeedbackEl.removeAttribute('hidden');
    
    console.log('📋 Element states:', {
        writtenFeedbackClasses: writtenFeedbackEl.className,
        writtenFeedbackDisplay: getComputedStyle(writtenFeedbackEl).display,
        textInputDisplay: textInputEl ? getComputedStyle(textInputEl).display : 'unknown',
        correctAnswerText: correctAnswerFeedbackEl.textContent
    });
    
    console.log('✅ Written feedback should now be force-displayed');
};

// TRACE FUNCTION CALLS - helps debug the feedback flow
window.traceFeedbackFlow = function() {
    console.log('🔍 TRACING FEEDBACK FLOW - Monkey patching functions...');
    
    // Backup original functions
    window._originalShowFeedback = showFeedback;
    window._originalNextQuestion = nextQuestion;
    window._originalResetAllFeedbackStates = resetAllFeedbackStates;
    window._originalCreateIncorrectAnswerButtons = createIncorrectAnswerButtons;
    
    // Override showFeedback
    showFeedback = function(isCorrect) {
        console.log('🎯 TRACE: showFeedback() called with isCorrect:', isCorrect, 'for format:', currentQuestion?.currentFormat);
        return window._originalShowFeedback(isCorrect);
    };
    
    // Override nextQuestion
    nextQuestion = function() {
        console.log('⏭️ TRACE: nextQuestion() called');
        console.trace('nextQuestion call stack');
        return window._originalNextQuestion();
    };
    
    // Override resetAllFeedbackStates
    resetAllFeedbackStates = function() {
        console.log('🧹 TRACE: resetAllFeedbackStates() called');
        return window._originalResetAllFeedbackStates();
    };
    
    // Override createIncorrectAnswerButtons
    createIncorrectAnswerButtons = function() {
        console.log('🔘 TRACE: createIncorrectAnswerButtons() called');
        return window._originalCreateIncorrectAnswerButtons();
    };
    
    console.log('✅ Function tracing enabled. Now test a written question.');
};

// SIMPLE FEEDBACK TEST - most basic approach
window.simpleWrittenFeedbackTest = function() {
    console.log('🔧 SIMPLE WRITTEN FEEDBACK TEST...');
    
    // First, just show the elements exist
    const writtenEl = document.getElementById('writtenFeedback');
    const correctEl = document.getElementById('correctAnswerFeedback');
    const textInputEl = document.getElementById('textInput');
    
    console.log('📋 Basic elements check:', {
        writtenFeedback: !!writtenEl,
        correctAnswerFeedback: !!correctEl,
        textInput: !!textInputEl
    });
    
    if (!writtenEl || !correctEl) {
        console.error('❌ CRITICAL: Basic elements missing!');
        return;
    }
    
    // Show text input mode
    if (multipleChoice) multipleChoice.style.display = 'none';
    if (textInputEl) textInputEl.style.display = 'flex';
    
    // Set simple content
    correctEl.innerHTML = '<strong>TEST: Mitochondria produce ATP</strong>';
    
    // Simple show approach
    writtenEl.classList.add('show');
    writtenEl.style.display = 'flex';
    
    console.log('✅ Simple feedback applied. Checking...');
    
    setTimeout(() => {
        const computed = getComputedStyle(writtenEl);
        console.log('📊 Results:', {
            classList: writtenEl.className,
            computedDisplay: computed.display,
            offsetHeight: writtenEl.offsetHeight,
            isVisible: writtenEl.offsetHeight > 0,
            innerHTML: writtenEl.innerHTML
        });
        
        if (writtenEl.offsetHeight === 0) {
            console.error('❌ Still not visible! Trying nuclear approach...');
            
            // Nuclear approach
            writtenEl.style.cssText = 'display: flex !important; position: relative !important; z-index: 9999 !important; background: red !important; padding: 20px !important; margin: 10px !important; border: 3px solid lime !important;';
            
            setTimeout(() => {
                console.log('🚀 After nuclear styling:', {
                    offsetHeight: writtenEl.offsetHeight,
                    isVisible: writtenEl.offsetHeight > 0
                });
            }, 100);
        }
    }, 200);
};

// DIRECT WRITTEN FEEDBACK FIX - Add this debugging to identify the exact issue
window.directWrittenFeedbackDebug = function() {
    console.log('🔧 DIRECT WRITTEN FEEDBACK DEBUG...');
    
    // 1. Check if we're in text input mode
    const multipleChoiceEl = document.getElementById('multipleChoice');
    const textInputEl = document.getElementById('textInput');
    
    console.log('📋 Input Mode Check:', {
        multipleChoiceDisplay: multipleChoiceEl ? getComputedStyle(multipleChoiceEl).display : 'not found',
        textInputDisplay: textInputEl ? getComputedStyle(textInputEl).display : 'not found'
    });
    
    // 2. Check all possible feedback elements
    const writtenFeedbackEl = document.getElementById('writtenFeedback');
    const correctAnswerEl = document.getElementById('correctAnswerFeedback');
    
    console.log('📋 Feedback Elements:', {
        writtenFeedback: {
            exists: !!writtenFeedbackEl,
            display: writtenFeedbackEl ? getComputedStyle(writtenFeedbackEl).display : 'N/A',
            visibility: writtenFeedbackEl ? getComputedStyle(writtenFeedbackEl).visibility : 'N/A',
            opacity: writtenFeedbackEl ? getComputedStyle(writtenFeedbackEl).opacity : 'N/A',
            hasShowClass: writtenFeedbackEl ? writtenFeedbackEl.classList.contains('show') : 'N/A',
            innerHTML: writtenFeedbackEl ? writtenFeedbackEl.innerHTML : 'N/A'
        },
        correctAnswerFeedback: {
            exists: !!correctAnswerEl,
            display: correctAnswerEl ? getComputedStyle(correctAnswerEl).display : 'N/A',
            textContent: correctAnswerEl ? correctAnswerEl.textContent : 'N/A'
        }
    });
    
    // 3. Check global variables
    console.log('📋 Global Variables:', {
        writtenFeedbackGlobal: !!window.writtenFeedback,
        correctAnswerFeedbackGlobal: !!window.correctAnswerFeedback,
        currentQuestion: window.currentQuestion ? {
            format: window.currentQuestion.currentFormat,
            correctAnswer: window.currentQuestion.correctAnswer
        } : 'N/A'
    });
    
    // 4. Force show feedback elements
    if (writtenFeedbackEl && correctAnswerEl) {
        console.log('🔧 FORCING FEEDBACK TO SHOW...');
        
        // Set content
        correctAnswerEl.textContent = 'TEST CORRECT ANSWER - This should be visible';
        
        // Apply nuclear styling
        writtenFeedbackEl.style.cssText = `
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            position: relative !important;
            z-index: 1000 !important;
            background: yellow !important;
            border: 3px solid red !important;
            padding: 20px !important;
            margin: 20px 0 !important;
        `;
        
        correctAnswerEl.style.cssText = `
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            background: lime !important;
            border: 2px solid blue !important;
            padding: 16px !important;
            color: black !important;
            font-weight: bold !important;
            font-size: 16px !important;
        `;
        
        // Add show class
        writtenFeedbackEl.classList.add('show');
        
        console.log('✅ Applied nuclear styling - feedback should now be IMPOSSIBLE to miss');
        console.log('📍 Location: Look below the text input field for bright yellow/lime feedback');
        
        return true;
    } else {
        console.error('❌ Critical elements not found:', {
            writtenFeedback: !!writtenFeedbackEl,
            correctAnswerFeedback: !!correctAnswerEl
        });
        return false;
    }
};

// FORCE WRITTEN FEEDBACK TO SHOW - Simple fix function
window.forceWrittenFeedback = function(correctAnswer = "The correct answer is: Mitochondria produce ATP") {
    console.log('🔥 FORCE WRITTEN FEEDBACK...');
    
    // Get elements directly
    const writtenFeedbackEl = document.getElementById('writtenFeedback');
    const correctAnswerEl = document.getElementById('correctAnswerFeedback');
    
    if (!writtenFeedbackEl || !correctAnswerEl) {
        console.error('❌ Elements not found:', {
            writtenFeedback: !!writtenFeedbackEl,
            correctAnswerFeedback: !!correctAnswerEl
        });
        return false;
    }
    
    // Set the correct answer text
    correctAnswerEl.textContent = correctAnswer;
    
    // Force show with brute force styling
    writtenFeedbackEl.style.display = 'flex';
    writtenFeedbackEl.style.visibility = 'visible';
    writtenFeedbackEl.style.opacity = '1';
    writtenFeedbackEl.classList.add('show');
    
    console.log('✅ Forced written feedback to show');
    console.log('📍 Check below the text input for the feedback');
    
    return true;
};

// INSTANT FEEDBACK SHOW - bypasses all normal flow
window.instantShowFeedback = function(testAnswer = "Test correct answer") {
    console.log('⚡ INSTANT SHOW FEEDBACK...');
    
    // Make sure we're in text input mode
    if (multipleChoice) multipleChoice.style.display = 'none';
    if (textInput) textInput.style.display = 'flex';
    
    const writtenFeedbackEl = document.getElementById('writtenFeedback');
    const correctAnswerFeedbackEl = document.getElementById('correctAnswerFeedback');
    
    if (!writtenFeedbackEl || !correctAnswerFeedbackEl) {
        console.error('❌ Required elements not found!');
        return;
    }
    
    // Set the content
    correctAnswerFeedbackEl.textContent = testAnswer;
    
    // Apply the most aggressive styling possible
    const superForceStyles = `
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        z-index: 999999 !important;
        background: yellow !important;
        border: 10px solid red !important;
        padding: 50px !important;
        font-size: 24px !important;
        color: black !important;
        width: 400px !important;
        height: 200px !important;
        box-shadow: 0 0 50px rgba(0,0,0,0.8) !important;
    `;
    
    writtenFeedbackEl.style.cssText = superForceStyles;
    correctAnswerFeedbackEl.style.cssText = 'display: block !important; visibility: visible !important; color: black !important; font-size: 18px !important; font-weight: bold !important;';
    
    writtenFeedbackEl.innerHTML = `
        <div style="color: black; font-size: 16px; font-weight: bold;">Correct answer:</div>
        <div style="color: black; font-size: 18px; margin-top: 10px; border: 2px solid blue; padding: 10px;">${testAnswer}</div>
    `;
    
    console.log('⚡ INSTANT FEEDBACK APPLIED - should be impossible to miss!');
    
    setTimeout(() => {
        const isVisible = writtenFeedbackEl.offsetHeight > 0;
        console.log('⚡ INSTANT CHECK:', {
            visible: isVisible,
            offsetHeight: writtenFeedbackEl.offsetHeight,
            offsetWidth: writtenFeedbackEl.offsetWidth
        });
    }, 100);
};

// Debug current written feedback state
window.debugWrittenFeedback = function() {
    console.log('🔍 DEBUGGING WRITTEN FEEDBACK STATE...');
    
    const writtenFeedbackEl = document.getElementById('writtenFeedback');
    const correctAnswerFeedbackEl = document.getElementById('correctAnswerFeedback');
    const textInputEl = document.getElementById('textInput');
    const textAnswerEl = document.getElementById('textAnswer');
    
    console.log('📋 Elements Found:', {
        writtenFeedback: !!writtenFeedbackEl,
        correctAnswerFeedback: !!correctAnswerFeedbackEl,
        textInput: !!textInputEl,
        textAnswer: !!textAnswerEl
    });
    
    if (writtenFeedbackEl) {
        const computed = getComputedStyle(writtenFeedbackEl);
        console.log('📊 Written Feedback Element State:', {
            classes: writtenFeedbackEl.className,
            inlineStyles: writtenFeedbackEl.getAttribute('style'),
            computedDisplay: computed.display,
            computedVisibility: computed.visibility,
            computedOpacity: computed.opacity,
            computedHeight: computed.height,
            offsetHeight: writtenFeedbackEl.offsetHeight,
            scrollHeight: writtenFeedbackEl.scrollHeight
        });
    }
    
    if (correctAnswerFeedbackEl) {
        const computed = getComputedStyle(correctAnswerFeedbackEl);
        console.log('📊 Correct Answer Feedback Element State:', {
            textContent: correctAnswerFeedbackEl.textContent,
            innerHTML: correctAnswerFeedbackEl.innerHTML,
            classes: correctAnswerFeedbackEl.className,
            computedDisplay: computed.display,
            computedVisibility: computed.visibility,
            computedOpacity: computed.opacity
        });
    }
    
    if (textInputEl) {
        const computed = getComputedStyle(textInputEl);
        console.log('📊 Text Input Container State:', {
            classes: textInputEl.className,
            computedDisplay: computed.display,
            offsetHeight: textInputEl.offsetHeight
        });
    }
    
    // Check if we're currently on a written question
    console.log('📝 Current Question State:', {
        currentQuestionFormat: currentQuestion?.currentFormat,
        currentQuestionCorrectAnswer: currentQuestion?.correctAnswer,
        isAnswered: isAnswered,
        selectedAnswer: selectedAnswer
    });
    
    // Check for any CSS that might be hiding the elements
    const allSheetRules = [];
    for (let i = 0; i < document.styleSheets.length; i++) {
        try {
            const sheet = document.styleSheets[i];
            const rules = sheet.cssRules || sheet.rules;
            for (let j = 0; j < rules.length; j++) {
                const rule = rules[j];
                if (rule.selectorText && rule.selectorText.includes('written-feedback')) {
                    allSheetRules.push({
                        selector: rule.selectorText,
                        styles: rule.style.cssText
                    });
                }
            }
        } catch (e) {
            // Cross-origin stylesheets might throw errors
        }
    }
    
    console.log('📄 CSS Rules affecting written-feedback:', allSheetRules);
};

// AGGRESSIVE written feedback test with nuclear approach
window.testWrittenQuestionFlow = function() {
    console.log('🧪 TESTING COMPLETE WRITTEN QUESTION FLOW...');
    
    // Step 1: Set up a written question scenario
    if (multipleChoice) multipleChoice.style.display = 'none';
    if (textInput) textInput.style.display = 'flex';
    
    // Step 2: Set up a mock written question
    currentQuestion = {
        id: 999,
        question: "What is the primary function of mitochondria in cells?",
        correctAnswer: "Produce ATP through cellular respiration",
        currentFormat: "written",
        explanation: "Mitochondria are the powerhouses of the cell"
    };
    
    console.log('📝 Mock question set up:', currentQuestion);
    
    // Step 3: Simulate user typing an incorrect answer
    if (textAnswer) {
        textAnswer.value = "Store genetic information"; // Wrong answer
        textAnswer.focus();
    }
    
    // Step 4: Set selectedAnswer as if user submitted
    selectedAnswer = "Store genetic information";
    isAnswered = true;
    
    console.log('👤 Simulated user answer:', selectedAnswer);
    
    // Step 5: Call checkAnswer to trigger the full flow
    console.log('🔍 Calling checkAnswer()...');
    checkAnswer();
    
    // Step 6: Nuclear approach - force show with everything possible
    setTimeout(() => {
        console.log('🚀 NUCLEAR APPROACH - FORCING FEEDBACK TO SHOW...');
        
        const writtenFeedbackEl = document.getElementById('writtenFeedback');
        const correctAnswerFeedbackEl = document.getElementById('correctAnswerFeedback');
        
        if (writtenFeedbackEl && correctAnswerFeedbackEl) {
            // Set correct answer
            correctAnswerFeedbackEl.textContent = currentQuestion.correctAnswer;
            correctAnswerFeedbackEl.innerHTML = `<strong>Correct Answer:</strong> ${currentQuestion.correctAnswer}`;
            
            // Nuclear styling approach
            const nuclearStyles = [
                'display: flex !important',
                'visibility: visible !important',
                'opacity: 1 !important',
                'height: auto !important',
                'max-height: none !important',
                'overflow: visible !important',
                'position: relative !important',
                'z-index: 9999 !important',
                'background: red !important', // Make it super visible for testing
                'border: 5px solid lime !important',
                'padding: 20px !important',
                'margin: 10px 0 !important'
            ];
            
            writtenFeedbackEl.style.cssText = nuclearStyles.join('; ');
            writtenFeedbackEl.classList.add('show');
            writtenFeedbackEl.removeAttribute('hidden');
            
            // Also force the correct answer element
            correctAnswerFeedbackEl.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; color: black !important; font-size: 16px !important; font-weight: bold !important;';
            
            console.log('🚀 NUCLEAR STYLING APPLIED');
            
            // Check if it worked
            setTimeout(() => {
                const isVisible = writtenFeedbackEl.offsetHeight > 0 && writtenFeedbackEl.offsetWidth > 0;
                console.log('🔍 VISIBILITY CHECK:', {
                    offsetHeight: writtenFeedbackEl.offsetHeight,
                    offsetWidth: writtenFeedbackEl.offsetWidth,
                    isVisible: isVisible,
                    computedDisplay: getComputedStyle(writtenFeedbackEl).display,
                    innerHTML: writtenFeedbackEl.innerHTML
                });
                
                if (!isVisible) {
                    console.error('❌ STILL NOT VISIBLE! Something else is hiding it.');
                    
                    // Check parent elements
                    let parent = writtenFeedbackEl.parentElement;
                    let level = 0;
                    while (parent && level < 5) {
                        const parentStyles = getComputedStyle(parent);
                        console.log(`📋 Parent level ${level}:`, {
                            tagName: parent.tagName,
                            className: parent.className,
                            display: parentStyles.display,
                            visibility: parentStyles.visibility,
                            opacity: parentStyles.opacity,
                            overflow: parentStyles.overflow
                        });
                        parent = parent.parentElement;
                        level++;
                    }
                } else {
                    console.log('✅ SUCCESS! Feedback is now visible.');
                }
            }, 200);
        } else {
            console.error('❌ Elements not found:', {
                writtenFeedback: !!writtenFeedbackEl,
                correctAnswerFeedback: !!correctAnswerFeedbackEl
            });
        }
    }, 500);
};

// Test the new explanation bottom sheet layout
window.testExplanationSheet = function() {
    console.log('Testing explanation bottom sheet...');
    
    // Set up a test question with all features
    currentQuestion = {
        id: 999,
        question: "Test question for explanation sheet",
        explanation: "This is a test explanation to demonstrate the new bottom sheet layout with AI chat functionality, concept images, and formula support.",
        conceptImage: "../images/sparkle.png",
        formula: "E = mc² (Test formula for demonstration)"
    };
    
    openExplanationBottomSheet();
};

// Debug function to toggle CORRECT badges visibility
window.toggleCorrectBadges = function() {
    const optionBtns = document.querySelectorAll('.option-btn');
    const hasCorrectBadges = document.querySelector('.correct-badge');
    
    if (hasCorrectBadges) {
        console.log('🟢 Hiding CORRECT badges...');
        optionBtns.forEach(btn => {
            btn.querySelectorAll('.correct-badge').forEach(b => b.remove());
        });
    } else {
        console.log('🟢 Showing CORRECT badges...');
        if (currentQuestion && currentQuestion.correctAnswer) {
            optionBtns.forEach(btn => {
                const isCorrectOption = btn.dataset.answer === currentQuestion.correctAnswer;
                setCorrectBadge(btn, isCorrectOption);
                if (isCorrectOption) {
                    console.log(`✅ Added CORRECT badge to: "${btn.dataset.answer}"`);
                }
            });
        }
    }
};

// Debug function to test CORRECT badges
window.testCorrectBadges = function() {
    console.log('🧪 Testing CORRECT badges...');
    
    const optionBtns = document.querySelectorAll('.option-btn');
    if (optionBtns.length === 0) {
        console.log('❌ No MCQ buttons found. Switch to a multiple choice question first.');
        return;
    }
    
    console.log('📊 Current question correct answer:', currentQuestion?.correctAnswer);
    console.log('📊 Button options:');
    optionBtns.forEach((btn, index) => {
        const isCorrect = btn.dataset.answer === currentQuestion?.correctAnswer;
        const hasCorrectBadge = btn.querySelector('.correct-badge') !== null;
        console.log(`  Button ${index}: "${btn.dataset.answer}" ${isCorrect ? '✅ SHOULD BE CORRECT' : ''} ${hasCorrectBadge ? '🟢 HAS BADGE' : '⚪ NO BADGE'}`);
    });
    
    // Force show CORRECT badges on all options to test styling
    console.log('🧪 Adding CORRECT badge to all buttons for styling test...');
    optionBtns.forEach((btn, index) => {
        setCorrectBadge(btn, true); // Add to all for testing
        console.log(`  Forced badge on button ${index}: ${btn.querySelector('.correct-badge') !== null ? '🟢 SUCCESS' : '❌ FAILED'}`);
    });
    
    console.log('✅ All buttons should now show CORRECT badges. Run toggleCorrectBadges() to show only the real correct answer.');
};

// Simple debug function to check current badge state
window.checkBadges = function() {
    console.log('🔍 CHECKING CURRENT BADGE STATE...');
    
    const optionBtns = document.querySelectorAll('.option-btn');
    if (optionBtns.length === 0) {
        console.log('❌ No MCQ buttons found');
        return;
    }
    
    console.log('📊 Current State:');
    const correctBadgeCount = document.querySelectorAll('.correct-badge').length;
    console.log(`Total CORRECT badges: ${correctBadgeCount}`);
    
    optionBtns.forEach((btn, index) => {
        const correctBadges = btn.querySelectorAll('.correct-badge');
        const apiBadges = btn.querySelectorAll('.api-badge, .static-badge');
        console.log(`  Button ${index}:`, {
            text: `"${btn.dataset.answer}"`,
            correctBadges: correctBadges.length,
            apiBadges: apiBadges.length,
            allBadges: btn.querySelectorAll('[class*="badge"]').length,
            shouldBeCorrect: btn.dataset.answer === currentQuestion?.correctAnswer
        });
    });
    
    if (correctBadgeCount === 0) {
        console.warn('⚠️ NO CORRECT BADGES VISIBLE!');
        console.log('Debug data from last question load:', window.lastMatchingDebug);
        console.log('Run fixMissingCorrectBadge() to manually add one');
    }
};

// Debug function to fix missing CORRECT badges manually
window.fixMissingCorrectBadge = function() {
    console.log('🔧 MANUALLY FIXING MISSING CORRECT BADGE...');
    
    const optionBtns = document.querySelectorAll('.option-btn');
    if (optionBtns.length === 0) {
        console.log('❌ No MCQ buttons found');
        return;
    }
    
    console.log('📊 Question data:', {
        correctAnswer: currentQuestion?.correctAnswer,
        options: Array.from(optionBtns).map(btn => btn.dataset.answer)
    });
    
    // Try to find exact match first
    let found = false;
    optionBtns.forEach((btn, idx) => {
        const text = btn.dataset.answer;
        if (text === currentQuestion?.correctAnswer) {
            setCorrectBadge(btn, true);
            console.log('✅ Found exact match, added CORRECT badge to button', idx);
            found = true;
        }
    });
    
    // If no exact match, try partial matches
    if (!found) {
        console.log('🔍 No exact match, trying partial matches...');
        let bestMatch = null;
        let bestScore = 0;
        
        optionBtns.forEach((btn, idx) => {
            const text = btn.dataset.answer?.toLowerCase() || '';
            const correct = currentQuestion?.correctAnswer?.toLowerCase() || '';
            
            let score = 0;
            if (text.includes(correct) || correct.includes(text)) {
                score = Math.max(text.length, correct.length) > 0 ? 
                       Math.min(text.length, correct.length) / Math.max(text.length, correct.length) * 100 : 0;
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = { btn, idx, score };
            }
        });
        
        if (bestMatch && bestMatch.score > 30) {
            setCorrectBadge(bestMatch.btn, true);
            console.log(`✅ Added CORRECT badge to best match (button ${bestMatch.idx}) with ${bestMatch.score.toFixed(1)}% similarity`);
        } else {
            // Last resort: add to first button
            setCorrectBadge(optionBtns[0], true);
            console.log('🔧 Last resort: Added CORRECT badge to first button');
        }
    }
};

// Debug function to analyze CORRECT badge vs feedback mismatch
window.debugMismatch = function() {
    console.log('🚨 ANALYZING CORRECT BADGE vs FEEDBACK MISMATCH...');
    
    const optionBtns = document.querySelectorAll('.option-btn');
    if (optionBtns.length === 0) {
        console.log('❌ No MCQ buttons found');
        return;
    }
    
    console.log('📊 FULL STATE ANALYSIS:');
    
    // Find buttons with different states
    const badgeButtons = Array.from(optionBtns).filter(btn => btn.querySelector('.correct-badge'));
    const feedbackCorrectButtons = Array.from(optionBtns).filter(btn => btn.classList.contains('correct') || btn.classList.contains('correct-selected'));
    const feedbackIncorrectButtons = Array.from(optionBtns).filter(btn => btn.classList.contains('incorrect'));
    
    console.log('🔍 Button Analysis:');
    console.log('  Buttons with CORRECT badge:', badgeButtons.map(btn => ({ text: btn.dataset.answer, index: Array.from(optionBtns).indexOf(btn) })));
    console.log('  Buttons with correct feedback:', feedbackCorrectButtons.map(btn => ({ text: btn.dataset.answer, index: Array.from(optionBtns).indexOf(btn) })));
    console.log('  Buttons with incorrect feedback:', feedbackIncorrectButtons.map(btn => ({ text: btn.dataset.answer, index: Array.from(optionBtns).indexOf(btn) })));
    
    console.log('📋 Question State:');
    console.log('  Current correctAnswer:', currentQuestion?.correctAnswer);
    console.log('  Selected answer:', selectedAnswer);
    console.log('  Question options:', currentQuestion?.options);
    console.log('  Button texts:', Array.from(optionBtns).map(btn => btn.dataset.answer));
    
    // Check for the critical issue
    const badgeOnIncorrect = badgeButtons.some(btn => btn.classList.contains('incorrect'));
    if (badgeOnIncorrect) {
        console.error('🚨 CRITICAL ISSUE: Button with CORRECT badge shows incorrect feedback (RED X)!');
        const problematicButton = badgeButtons.find(btn => btn.classList.contains('incorrect'));
        console.log('Problematic button:', {
            text: problematicButton.dataset.answer,
            index: Array.from(optionBtns).indexOf(problematicButton),
            classes: problematicButton.className
        });
        
        console.log('🔧 ROOT CAUSE ANALYSIS:');
        console.log('This happens when:');
        console.log('1. CORRECT badge logic thinks this option should be correct');
        console.log('2. But feedback logic thinks a different option is correct'); 
        console.log('3. Usually due to placeholder detection happening at different times');
        console.log('4. Or different fallback logic between badge and feedback systems');
    }
    
    return {
        badgeButtons,
        feedbackCorrectButtons,
        feedbackIncorrectButtons,
        mismatch: badgeButtons.length > 0 && feedbackCorrectButtons.length > 0 && badgeButtons[0] !== feedbackCorrectButtons[0]
    };
};

// Test adaptive learning debug info
window.testAdaptiveDebug = function() {
    console.log('Testing adaptive learning debug info...');
    
    console.log('Using mastery-based system (no adaptive learning engine)');
    
    // Create a test question if none exists
    if (!currentQuestion) {
        currentQuestion = {
            id: 999,
            question: "Test question for adaptive debug",
            currentFormat: "multiple_choice"
        };
    }
    
    // In mastery-based system, no need to track with adaptive learning
    
    // Update debug info
    updateAdaptiveLearningDebugInfo();
    
    // Open debug sheet to see the info
    openDebugBottomSheet();
    
    console.log('Debug info updated. Check the debug bottom sheet!');
    console.log('You can now see:');
    console.log('- Current question adaptive parameters');
    console.log('- What happens if the answer is correct (green)');
    console.log('- What happens if the answer is incorrect (orange)');
};

// Test consecutive question format prevention
window.testConsecutivePrevention = function() {
    console.log('Testing consecutive matching/flashcard prevention...');
    
    // Simulate a round with consecutive formats that should be prevented
    const testQuestions = [
        { id: 1, currentFormat: 'multiple_choice', question: 'Test question 1' },
        { id: 2, currentFormat: 'matching', question: 'Test question 2' },
        { id: 3, currentFormat: 'flashcard', question: 'Test question 3' }, // Should be prevented
        { id: 4, currentFormat: 'matching', question: 'Test question 4' }, // Should be prevented
        { id: 5, currentFormat: 'written', question: 'Test question 5' }
    ];
    
    // Test round-level prevention
    console.log('Original formats:', testQuestions.map(q => q.currentFormat));
    
    // Test session-level prevention by simulating question flow
    lastShownQuestionFormat = null;
    const finalFormats = [];
    
    testQuestions.forEach((question, index) => {
        currentQuestion = question;
        
        // Apply the same logic as showQuestion()
        if (lastShownQuestionFormat && 
            (lastShownQuestionFormat === 'matching' || lastShownQuestionFormat === 'flashcard') &&
            (currentQuestion.currentFormat === 'matching' || currentQuestion.currentFormat === 'flashcard')) {
            
            console.log(`TEST: Preventing consecutive ${lastShownQuestionFormat} -> ${currentQuestion.currentFormat} for question ${currentQuestion.id}`);
            currentQuestion.currentFormat = 'multiple_choice';
        }
        
        lastShownQuestionFormat = currentQuestion.currentFormat;
        finalFormats.push(currentQuestion.currentFormat);
    });
    
    console.log('Final formats after prevention:', finalFormats);
    console.log('Prevention worked correctly:', !hasConsecutiveMatchingFlashcard(finalFormats));
    
    // Helper function to check for consecutive matching/flashcard
    function hasConsecutiveMatchingFlashcard(formats) {
        for (let i = 1; i < formats.length; i++) {
            if ((formats[i-1] === 'matching' || formats[i-1] === 'flashcard') &&
                (formats[i] === 'matching' || formats[i] === 'flashcard')) {
                return true;
            }
        }
        return false;
    }
};

// Test debug info accuracy
window.testDebugAccuracy = function() {
    console.log('🧪 TESTING DEBUG ACCURACY...');
    
    if (!currentQuestion) {
        console.log('❌ No current question available');
        return;
    }
    
    const questionId = currentQuestion.id;
    const currentFormat = currentQuestion.currentFormat;
    
    console.log(`🔎 Testing question ${questionId} (current format: ${currentFormat})`);
    
    // In mastery-based system, predictions are static
    const rawCorrect = { depth: 'Mastery', difficulty: 'Mastery', mode: 'completed' };
    const rawIncorrect = { depth: 'Mastery', difficulty: 'Mastery', mode: 'multiple_choice' };
    
    // Get adjusted predictions
    const adjustedCorrect = getAdjustedNextQuestionPreview(questionId, true);
    const adjustedIncorrect = getAdjustedNextQuestionPreview(questionId, false);
    
    console.log(`📊 RAW vs ADJUSTED PREDICTIONS:`);
    console.log(`  Correct: ${rawCorrect.mode} → ${adjustedCorrect.mode} (${rawCorrect.mode !== adjustedCorrect.mode ? 'MODIFIED' : 'UNCHANGED'})`);
    console.log(`  Incorrect: ${rawIncorrect.mode} → ${adjustedIncorrect.mode} (${rawIncorrect.mode !== adjustedIncorrect.mode ? 'MODIFIED' : 'UNCHANGED'})`);
    
    // Simulate what would actually happen if user answered correctly
    console.log(`🎯 SIMULATING CORRECT ANSWER...`);
    const beforeState = { depth: 'Mastery', difficulty: 'Mastery', mode: currentFormat };
    
    // In mastery-based system, simulate the outcome
    let actualFormat = 'completed'; // Question becomes completed when answered correctly
    
    // Apply the same prevention logic used in adaptDifficulty
    if (currentFormat && 
        (currentFormat === 'matching' || currentFormat === 'flashcard') &&
        (actualFormat === 'matching' || actualFormat === 'flashcard') &&
        currentFormat !== actualFormat) {
        
        console.log(`🚫 SIMULATION: Would prevent ${currentFormat} -> ${actualFormat}`);
        actualFormat = 'multiple_choice';
    }
    
    console.log(`📈 SIMULATION RESULTS:`);
    console.log(`  Debug predicted: ${getDisplayName(adjustedCorrect.mode)}`);
    console.log(`  Actually would be: ${actualFormat}`);
    console.log(`  Match: ${getDisplayName(adjustedCorrect.mode).toLowerCase().replace(' ', '_') === actualFormat ? '✅' : '❌'}`);
    
    // In mastery-based system, no state restoration needed
    
    return {
        predicted: getDisplayName(adjustedCorrect.mode),
        actual: actualFormat,
        matches: getDisplayName(adjustedCorrect.mode).toLowerCase().replace(' ', '_') === actualFormat
    };
};

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