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

function setSourceBadge(element) {
    if (!element) return;
    element.querySelectorAll('.api-badge, .static-badge').forEach(b => b.remove());
    if (currentQuestion && (currentQuestion._raw || currentQuestion.source === 'api' || window.USING_API_CONTENT)) {
        element.appendChild(createApiBadge());
    } else {
        element.appendChild(createStaticBadge());
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
        question: apiQuestion.question?.substring(0, 50) + '...'
    });
    
    return {
        id: id,
        question: apiQuestion.question || 'Question not available',
        correctAnswer: getCorrectAnswerFromAPI(apiQuestion),
        options: (mappedFormat === 'multiple_choice' && apiQuestion.options) ? apiQuestion.options : undefined,
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

// Initialize adaptive learning engine
function initializeAdaptiveLearning() {
    if (!window.AdaptiveLearning) {
        console.warn('Adaptive learning engine not available');
        return;
    }
    
    // Get user type from goal type (stored during onboarding)
    const goalType = localStorage.getItem('onboarding_goal_type') || 'study-plan';
    const userType = window.AdaptiveLearning.constructor.getUserTypeFromGoal(goalType);
    
    // Get readiness from knowledge level (stored during onboarding)
    const knowledgeLevel = localStorage.getItem('onboarding_knowledge_pill') || 'Somewhat confident';
    const readiness = window.AdaptiveLearning.constructor.getReadinessFromKnowledge(knowledgeLevel);
    
    // Load any existing state first
    window.AdaptiveLearning.loadState();
    
    // Initialize with user type and readiness
    window.AdaptiveLearning.initialize(userType, readiness);
    
    console.log('Adaptive learning initialized:', {
        goalType,
        userType,
        knowledgeLevel,
        readiness
    });
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
    
    // Initialize adaptive learning engine
    initializeAdaptiveLearning();
    
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
    
    let previousFormat = null;
    
    // Use adaptive learning engine to assign formats with consecutive matching/flashcard prevention
    questionsInRound.forEach((question, index) => {
        if (window.AdaptiveLearning) {
            let recommendedFormat = window.AdaptiveLearning.getQuestionFormat(question.id);
            
            // Check if we need to avoid consecutive matching/flashcard questions
            if (index > 0 && previousFormat && 
                (previousFormat === 'matching' || previousFormat === 'flashcard') &&
                (recommendedFormat === 'matching' || recommendedFormat === 'flashcard')) {
                
                console.log(`Preventing consecutive ${previousFormat} -> ${recommendedFormat} for question ${question.id}`);
                
                // Try to get an alternative format that's not matching or flashcard
                const alternatives = ['multiple_choice', 'written'];
                let alternativeFound = false;
                
                // Simulate processing a correct answer to see what the next format would be
                const currentState = window.AdaptiveLearning.getDebugInfo(question.id);
                
                // Try multiple choice first as it's usually the most accessible format
                for (const altFormat of alternatives) {
                    // Check if this alternative makes sense for the current adaptive state
                    // For now, use multiple choice as the safest fallback
                    recommendedFormat = 'multiple_choice';
                    alternativeFound = true;
                    break;
                }
                
                if (!alternativeFound) {
                    // If no alternative found, keep the original but log it
                    console.log(`No alternative found for question ${question.id}, keeping ${recommendedFormat}`);
                }
            }
            
            question.currentFormat = recommendedFormat;
            previousFormat = recommendedFormat;
        } else {
            // Fallback to multiple choice if adaptive learning not available
            question.currentFormat = 'multiple_choice';
            previousFormat = 'multiple_choice';
        }
    });
    
    console.log('Assigned adaptive question formats with consecutive prevention:', questionsInRound.map(q => ({ 
        id: q.id, 
        format: q.currentFormat 
    })));
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

// Show the current question
function showQuestion() {
    currentQuestion = questionsInRound[currentQuestionIndex];
    
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
    
    // Reset question prompt classes
    questionPrompt.classList.remove('flashcard-prompt');
    
    // Only set question text for question types that need it (not matching or flashcard)
    if (currentQuestion.currentFormat !== 'matching' && currentQuestion.currentFormat !== 'flashcard') {
        questionText.textContent = currentQuestion.question;
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
    
    // Add class for proper spacing
    questionPrompt.classList.add('flashcard-prompt');
    
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
    

    
    console.log('checkAnswer result:', {
        isCorrect: isCorrect,
        questionFormat: currentQuestion.currentFormat,
        questionId: currentQuestion.id,
        hasExplanation: !!currentQuestion.explanation
    });
    
    // Show feedback BEFORE adapting difficulty
    showFeedback(isCorrect);
    
    // Adapt difficulty for next time in this round
    adaptDifficulty(isCorrect);
    
    // Update progress immediately after answering
    updateProgress(true); // Force full progress after answering
    
    // Save round progress after each answer
    saveRoundProgress();
}

// Adapt question difficulty based on performance using adaptive learning engine
function adaptDifficulty(isCorrect) {
    if (window.AdaptiveLearning && currentQuestion) {
        // Store the current format to check for consecutive prevention
        const previousFormat = currentQuestion.currentFormat;
        
        console.log(`🔄 ADAPT DIFFICULTY: Question ${currentQuestion.id}`, {
            wasCorrect: isCorrect,
            currentFormat: previousFormat,
            beforeProcessing: window.AdaptiveLearning.getDebugInfo(currentQuestion.id)
        });
        
        // Use adaptive learning engine to process answer
        window.AdaptiveLearning.processAnswer(currentQuestion.id, isCorrect);
        
        // Check if question is completed
        if (window.AdaptiveLearning.isQuestionCompleted(currentQuestion.id)) {
            currentQuestion.currentFormat = 'completed';
            console.log(`✅ Question ${currentQuestion.id} completed!`);
        } else {
            // Get updated format for next time
            let newFormat = window.AdaptiveLearning.getQuestionFormat(currentQuestion.id);
            const rawNewFormat = newFormat; // Store original recommendation
            
            // Apply consecutive matching/flashcard prevention for the same question
            // This prevents a question from becoming matching->flashcard or flashcard->matching
            if (previousFormat && 
                (previousFormat === 'matching' || previousFormat === 'flashcard') &&
                (newFormat === 'matching' || newFormat === 'flashcard') &&
                previousFormat !== newFormat) {
                
                console.log(`🚫 PREVENTION: Consecutive ${previousFormat} -> ${newFormat} adaptation for question ${currentQuestion.id}`);
                
                // Use multiple choice as a safe alternative for adaptive progression
                newFormat = 'multiple_choice';
                console.log(`🔀 OVERRIDE: Changed to ${newFormat} instead`);
            }
            
            currentQuestion.currentFormat = newFormat;
            
            console.log(`🎯 ADAPTATION RESULT:`, {
                questionId: currentQuestion.id,
                wasCorrect: isCorrect,
                previousFormat: previousFormat,
                rawRecommendation: rawNewFormat,
                finalFormat: newFormat,
                wasOverridden: rawNewFormat !== newFormat,
                afterProcessing: window.AdaptiveLearning.getDebugInfo(currentQuestion.id)
            });
        }
        
        // Save adaptive learning state
        window.AdaptiveLearning.saveState();
        
        // Update debug info after adaptation
        updateAdaptiveLearningDebugInfo();
        
    } else {
        // Fallback to simple logic if adaptive learning not available
        console.log(`⚠️ FALLBACK: Adaptive learning not available, using simple logic`);
        if (isCorrect) {
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
            }
        } else {
            switch (currentQuestion.currentFormat) {
                case 'written':
                    currentQuestion.currentFormat = 'multiple_choice';
                    break;
                case 'matching':
                    currentQuestion.currentFormat = 'written';
                    break;
                case 'flashcard':
                    currentQuestion.currentFormat = 'matching';
                    break;
                // multiple_choice stays the same
            }
        }
    }
}

// Show feedback
function showFeedback(isCorrect) {
    // Update UI to show correct/incorrect answers
    if (currentQuestion.currentFormat === 'multiple_choice') {
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
    currentQuestionIndex++;
    currentRoundProgress++;
    
    if (currentQuestionIndex >= questionsInRound.length) {
        // End of current round - return to study path
        totalRoundsCompleted++;
        saveRoundProgress();
        completeRound();
        return;
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
    if (!window.AdaptiveLearning || !currentQuestion) {
        // Clear debug info if no adaptive learning or question
        const debugElements = [
            'currentDepth', 'currentDifficulty', 'currentType',
            'correctDepth', 'correctDifficulty', 'correctType',
            'incorrectDepth', 'incorrectDifficulty', 'incorrectType'
        ];
        debugElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = '-';
        });
        return;
    }
    
    console.log(`🔍 UPDATING DEBUG INFO for question ${currentQuestion.id} (format: ${currentQuestion.currentFormat})`);
    
    // Get current question debug info
    const currentInfo = window.AdaptiveLearning.getDebugInfo(currentQuestion.id);
    
    // Update current question info
    const currentDepthEl = document.getElementById('currentDepth');
    const currentDifficultyEl = document.getElementById('currentDifficulty');
    const currentTypeEl = document.getElementById('currentType');
    
    if (currentDepthEl) currentDepthEl.textContent = currentInfo.depth;
    if (currentDifficultyEl) currentDifficultyEl.textContent = currentInfo.difficulty;
    if (currentTypeEl) currentTypeEl.textContent = getDisplayName(currentInfo.mode);
    
    // Get correct answer preview with consecutive prevention applied
    const rawCorrectInfo = window.AdaptiveLearning.getNextQuestionPreview(currentQuestion.id, true);
    const correctInfo = getAdjustedNextQuestionPreview(currentQuestion.id, true);
    
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
    
    // Get incorrect answer preview with consecutive prevention applied
    const rawIncorrectInfo = window.AdaptiveLearning.getNextQuestionPreview(currentQuestion.id, false);
    const incorrectInfo = getAdjustedNextQuestionPreview(currentQuestion.id, false);
    
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
    if (!window.AdaptiveLearning) {
        return { depth: 'Unknown', mode: 'Unknown', difficulty: 'Unknown' };
    }
    
    // Get the raw prediction from adaptive learning
    const rawInfo = window.AdaptiveLearning.getNextQuestionPreview(questionId, assumeCorrect);
    
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
    
    // Done button handler
    const doneButton = document.getElementById('doneButton');
    if (doneButton) {
        doneButton.addEventListener('click', closeExplanationBottomSheet);
    }
    
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
    const explanationText = document.getElementById('explanationText');
    const explanationImage = document.getElementById('explanationImage');
    const formulaSection = document.getElementById('formulaSection');
    const formulaText = document.getElementById('formulaText');
    
    if (explanationText && currentQuestion && currentQuestion.explanation) {
        explanationText.textContent = currentQuestion.explanation;
        
        // Add concept image if available
        if (explanationImage && currentQuestion.conceptImage) {
            explanationImage.innerHTML = `<img src="${currentQuestion.conceptImage}" alt="Concept illustration" />`;
        } else if (explanationImage) {
            // Default placeholder for concepts without images
            explanationImage.innerHTML = `
                <div style="padding: 40px; text-align: center; color: var(--color-gray-500);">
                    <span class="material-icons-round" style="font-size: 48px; margin-bottom: 8px;">science</span>
                    <p style="margin: 0; font-size: 14px;">Visual explanation coming soon</p>
                </div>
            `;
        }
        
        // Add formula if available
        if (formulaSection && formulaText && currentQuestion.formula) {
            formulaText.textContent = currentQuestion.formula;
            formulaSection.style.display = 'block';
        } else if (formulaSection) {
            formulaSection.style.display = 'none';
        }
        
    } else if (explanationText) {
        explanationText.textContent = 'No detailed explanation is available for this question.';
        if (explanationImage) {
            explanationImage.innerHTML = '';
        }
        if (formulaSection) {
            formulaSection.style.display = 'none';
        }
    }
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

// Test the new button container approach
window.testIncorrectButtons = function() {
    console.log('Testing incorrect answer buttons...');
    createIncorrectAnswerButtons();
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

// Test adaptive learning debug info
window.testAdaptiveDebug = function() {
    console.log('Testing adaptive learning debug info...');
    
    if (!window.AdaptiveLearning) {
        console.log('Adaptive learning engine not available');
        return;
    }
    
    // Create a test question if none exists
    if (!currentQuestion) {
        currentQuestion = {
            id: 999,
            question: "Test question for adaptive debug",
            currentFormat: "multiple_choice"
        };
    }
    
    // Make sure the question is tracked by adaptive learning
    window.AdaptiveLearning.getQuestionFormat(currentQuestion.id);
    
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
    
    if (!window.AdaptiveLearning || !currentQuestion) {
        console.log('❌ No adaptive learning or current question available');
        return;
    }
    
    const questionId = currentQuestion.id;
    const currentFormat = currentQuestion.currentFormat;
    
    console.log(`🔎 Testing question ${questionId} (current format: ${currentFormat})`);
    
    // Get raw predictions
    const rawCorrect = window.AdaptiveLearning.getNextQuestionPreview(questionId, true);
    const rawIncorrect = window.AdaptiveLearning.getNextQuestionPreview(questionId, false);
    
    // Get adjusted predictions
    const adjustedCorrect = getAdjustedNextQuestionPreview(questionId, true);
    const adjustedIncorrect = getAdjustedNextQuestionPreview(questionId, false);
    
    console.log(`📊 RAW vs ADJUSTED PREDICTIONS:`);
    console.log(`  Correct: ${rawCorrect.mode} → ${adjustedCorrect.mode} (${rawCorrect.mode !== adjustedCorrect.mode ? 'MODIFIED' : 'UNCHANGED'})`);
    console.log(`  Incorrect: ${rawIncorrect.mode} → ${adjustedIncorrect.mode} (${rawIncorrect.mode !== adjustedIncorrect.mode ? 'MODIFIED' : 'UNCHANGED'})`);
    
    // Simulate what would actually happen if user answered correctly
    console.log(`🎯 SIMULATING CORRECT ANSWER...`);
    const beforeState = JSON.parse(JSON.stringify(window.AdaptiveLearning.getDebugInfo(questionId)));
    
    // Process the answer and see what actually happens
    window.AdaptiveLearning.processAnswer(questionId, true);
    let actualFormat = window.AdaptiveLearning.getQuestionFormat(questionId);
    
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
    
    // Restore the original state (undo the simulation)
    window.AdaptiveLearning.loadState();
    
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