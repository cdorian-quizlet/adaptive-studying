// Diagnostic Test 1 - Cards 1-21
// Covers the first 21 cell biology concepts

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

// Question bank organized by concept/round
const questionBankByConcept = {
    "Cell Biology": [
    {
        id: 1,
        question: "What is the primary function of the cell membrane?",
        correctAnswer: "Regulate what enters and exits the cell",
        options: ["Regulate what enters and exits the cell", "Produce energy", "Store genetic material", "Break down waste"],
        type: "multiple_choice"
    },
    {
        id: 2,
        question: "Which organelle is responsible for producing energy in the form of ATP?",
        correctAnswer: "Mitochondria",
        options: ["Mitochondria", "Nucleus", "Golgi apparatus", "Endoplasmic reticulum"],
        type: "multiple_choice"
    },
    {
        id: 3,
        question: "What is the function of the nucleus?",
        correctAnswer: "Store and protect genetic material",
        options: ["Store and protect genetic material", "Produce proteins", "Break down molecules", "Transport materials"],
        type: "multiple_choice"
    },
    {
        id: 4,
        question: "Which of the following is NOT a function of the endoplasmic reticulum?",
        correctAnswer: "Energy production",
        options: ["Energy production", "Protein synthesis", "Lipid synthesis", "Detoxification"],
        type: "multiple_choice"
    },
    {
        id: 5,
        question: "What is the main function of lysosomes?",
        correctAnswer: "Break down waste and cellular debris",
        options: ["Break down waste and cellular debris", "Produce energy", "Store nutrients", "Transport proteins"],
        type: "multiple_choice"
    },
    {
        id: 6,
        question: "Which organelle is responsible for packaging and sorting proteins?",
        correctAnswer: "Golgi apparatus",
        options: ["Golgi apparatus", "Ribosomes", "Vacuoles", "Peroxisomes"],
        type: "multiple_choice"
    },
    {
        id: 7,
        question: "What is the function of ribosomes?",
        correctAnswer: "Synthesize proteins",
        options: ["Synthesize proteins", "Store energy", "Break down molecules", "Transport materials"],
        type: "multiple_choice"
        }
    ],
    "Genetics": [
    {
        id: 8,
            question: "What does DNA stand for?",
            correctAnswer: "Deoxyribonucleic acid",
            options: ["Deoxyribonucleic acid", "Dynamic nucleic acid", "Dual nucleotide arrangement", "Direct nuclear association"],
        type: "multiple_choice"
    },
    {
        id: 9,
            question: "Which of the following is a characteristic of genes?",
            correctAnswer: "They carry hereditary information",
            options: ["They carry hereditary information", "They only exist in plants", "They control cell movement", "They produce energy"],
        type: "multiple_choice"
    },
    {
        id: 10,
            question: "What is the process by which DNA is copied?",
            correctAnswer: "Replication",
            options: ["Replication", "Translation", "Transcription", "Transformation"],
        type: "multiple_choice"
    },
    {
        id: 11,
            question: "In genetics, what is an allele?",
            correctAnswer: "A variant of a gene",
            options: ["A variant of a gene", "A type of chromosome", "A form of DNA", "A cellular organelle"],
        type: "multiple_choice"
    },
    {
        id: 12,
            question: "What determines the traits of an organism?",
            correctAnswer: "Genetic code in DNA",
            options: ["Genetic code in DNA", "Cell membrane structure", "Number of organelles", "Size of the nucleus"],
        type: "multiple_choice"
    },
    {
        id: 13,
            question: "Which process produces genetically identical cells?",
            correctAnswer: "Mitosis",
            options: ["Mitosis", "Meiosis", "Fertilization", "Mutation"],
        type: "multiple_choice"
    },
    {
        id: 14,
            question: "What is a mutation?",
            correctAnswer: "A change in DNA sequence",
            options: ["A change in DNA sequence", "Cell division", "Protein synthesis", "Energy production"],
        type: "multiple_choice"
        }
    ],
    "Evolution": [
    {
        id: 15,
            question: "What is natural selection?",
            correctAnswer: "Survival and reproduction of the fittest organisms",
            options: ["Survival and reproduction of the fittest organisms", "Random genetic changes", "Artificial breeding", "Environmental destruction"],
        type: "multiple_choice"
    },
    {
        id: 16,
            question: "Who proposed the theory of evolution by natural selection?",
            correctAnswer: "Charles Darwin",
            options: ["Charles Darwin", "Gregor Mendel", "Louis Pasteur", "Alexander Fleming"],
        type: "multiple_choice"
    },
    {
        id: 17,
            question: "What provides evidence for evolution?",
            correctAnswer: "Fossil records",
            options: ["Fossil records", "Modern technology", "Weather patterns", "Ocean currents"],
        type: "multiple_choice"
    },
    {
        id: 18,
            question: "What is adaptation in evolutionary terms?",
            correctAnswer: "Traits that help organisms survive in their environment",
            options: ["Traits that help organisms survive in their environment", "Learning new behaviors", "Moving to new habitats", "Changing diet"],
        type: "multiple_choice"
    },
    {
        id: 19,
            question: "What is speciation?",
            correctAnswer: "Formation of new species",
            options: ["Formation of new species", "Death of organisms", "Habitat destruction", "Climate change"],
        type: "multiple_choice"
    },
    {
        id: 20,
            question: "What drives evolutionary change?",
            correctAnswer: "Environmental pressures and genetic variation",
            options: ["Environmental pressures and genetic variation", "Human intervention", "Technological advancement", "Seasonal changes"],
        type: "multiple_choice"
    },
    {
        id: 21,
            question: "What is convergent evolution?",
            correctAnswer: "Similar traits evolving independently in different species",
            options: ["Similar traits evolving independently in different species", "Species merging together", "Evolution moving backwards", "Rapid evolutionary change"],
        type: "multiple_choice"
    }
    ],
    "Ecology": [
        {
            id: 22,
            question: "What is an ecosystem?",
            correctAnswer: "A community of organisms and their physical environment",
            options: ["A community of organisms and their physical environment", "A single species habitat", "Only plant communities", "Weather patterns"],
            type: "multiple_choice"
        },
        {
            id: 23,
            question: "What is a food chain?",
            correctAnswer: "The transfer of energy from one organism to another",
            options: ["The transfer of energy from one organism to another", "A type of plant", "A method of reproduction", "A form of migration"],
            type: "multiple_choice"
        },
        {
            id: 24,
            question: "What are producers in an ecosystem?",
            correctAnswer: "Organisms that make their own food",
            options: ["Organisms that make their own food", "Animals that hunt", "Decomposing bacteria", "Large predators"],
            type: "multiple_choice"
        },
        {
            id: 25,
            question: "What is biodiversity?",
            correctAnswer: "The variety of life in an ecosystem",
            options: ["The variety of life in an ecosystem", "The number of plants", "Population size", "Weather variation"],
            type: "multiple_choice"
        },
        {
            id: 26,
            question: "What is symbiosis?",
            correctAnswer: "Close relationship between different species",
            options: ["Close relationship between different species", "Competition for resources", "Predator-prey relationship", "Seasonal migration"],
            type: "multiple_choice"
        },
        {
            id: 27,
            question: "What is the carbon cycle?",
            correctAnswer: "The movement of carbon through ecosystems",
            options: ["The movement of carbon through ecosystems", "Plant reproduction", "Animal migration", "Weather patterns"],
            type: "multiple_choice"
        },
        {
            id: 28,
            question: "What is conservation biology?",
            correctAnswer: "The science of protecting biodiversity",
            options: ["The science of protecting biodiversity", "Study of fossils", "Animal behavior research", "Plant breeding"],
        type: "multiple_choice"
        }
    ]
};

// Function to fetch questions from API for diagnostic concepts
async function fetchQuestionsFromApiForDiagnostic(conceptsToTest) {
    try {
        console.log('🔍 DIAGNOSTIC API DEBUG: fetchQuestionsFromApiForDiagnostic called with:', conceptsToTest);
        
        // Allow API calls in all environments for diagnostic testing
        console.log('🔍 DIAGNOSTIC API DEBUG: Attempting API call in', window.location.hostname, 'environment');

        // Get onboarding data from localStorage
        const schoolName = localStorage.getItem('onboarding_school');
        const courseName = localStorage.getItem('onboarding_course');
        const goalsData = localStorage.getItem('onboarding_goals');
        
        console.log('🔍 DIAGNOSTIC API DEBUG: Onboarding data check:', {
            schoolName: schoolName || 'MISSING',
            courseName: courseName || 'MISSING', 
            goalsData: goalsData || 'MISSING',
            QuizletApiAvailable: !!window.QuizletApi,
            getQuestionsByConceptAvailable: !!(window.QuizletApi && window.QuizletApi.getQuestionsByConcept)
        });
        
        // Parse arrays from localStorage
        const goals = goalsData ? JSON.parse(goalsData) : [];
        
        // Validate we have the required data
        if (!schoolName || !courseName || goals.length === 0 || conceptsToTest.length === 0) {
            console.log('🔍 DIAGNOSTIC API DEBUG: Missing onboarding data for diagnostic question loading:', {
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
                            
                            // Debug MCQ questions from API
                            if (mappedQuestion.type === 'multiple_choice') {
                                console.log('🔍 DIAGNOSTIC API MCQ DEBUG:', {
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

// Function to select questions based on diagnostic configuration
async function selectQuestionsForDiagnostic() {
    try {
        // Load diagnostic configuration from localStorage
        const diagnosticConfigStr = localStorage.getItem('diagnosticConfig');
        if (!diagnosticConfigStr) {
            console.warn('🔍 DIAGNOSTIC DEBUG: No diagnostic configuration found, using default questions');
            window.USING_API_CONTENT = false;
            return getDefaultQuestions();
        }
        
        const diagnosticConfig = JSON.parse(diagnosticConfigStr);
        console.log('🔍 DIAGNOSTIC DEBUG: Diagnostic configuration loaded:', diagnosticConfig);
        
        const { conceptsToTest, questionsPerRound, roundsTested, testDescription } = diagnosticConfig;
        
        console.log(`🔍 DIAGNOSTIC DEBUG: This diagnostic will test ${roundsTested.length} specific rounds: ${roundsTested.join(', ')}`);
        console.log(`🔍 DIAGNOSTIC DEBUG: Test description: ${testDescription}`);
        
        // Try to fetch questions from API first
        console.log('🔍 DIAGNOSTIC DEBUG: About to call fetchQuestionsFromApiForDiagnostic with concepts:', conceptsToTest);
        const apiQuestions = await fetchQuestionsFromApiForDiagnostic(conceptsToTest);
        console.log('🔍 DIAGNOSTIC DEBUG: API returned questions:', apiQuestions.length, apiQuestions);
        
        if (apiQuestions.length > 0) {
            // Use API questions - limit to a reasonable number for diagnostic
            const limitedQuestions = apiQuestions.slice(0, 10); // Limit to 10 questions for diagnostic
            console.log(`🔍 DIAGNOSTIC DEBUG: Using ${limitedQuestions.length} questions from API for diagnostic`);
            console.log('🔍 DIAGNOSTIC DEBUG: Setting USING_API_CONTENT = true');
            window.USING_API_CONTENT = true;
            return limitedQuestions;
        }
        
        // Fallback to static question bank
        console.log('🔍 DIAGNOSTIC DEBUG: Falling back to static question bank for diagnostic');
        window.USING_API_CONTENT = false;
        const selectedQuestions = [];
        
        // Since we're testing specific rounds, select questions from available concepts in the question bank
        // The key is that we select the right NUMBER of questions for the rounds being tested
        const availableConcepts = Object.keys(questionBankByConcept);
        console.log('🔍 DIAGNOSTIC DEBUG: Available concepts in question bank:', availableConcepts);
        console.log(`🔍 DIAGNOSTIC DEBUG: Need questions for ${roundsTested.length} rounds (${roundsTested.join(', ')})`);
        
        // Calculate how many questions we need total
        const totalQuestionsNeeded = roundsTested.length * questionsPerRound;
        console.log(`🔍 DIAGNOSTIC DEBUG: Total questions needed: ${totalQuestionsNeeded} (${questionsPerRound} per round × ${roundsTested.length} rounds)`);
        
        // Collect all available questions from all concepts
        const allAvailableQuestions = [];
        availableConcepts.forEach(concept => {
            const conceptQuestions = questionBankByConcept[concept] || [];
            if (conceptQuestions.length > 0) {
                allAvailableQuestions.push(...conceptQuestions);
                console.log(`🔍 DIAGNOSTIC DEBUG: Added ${conceptQuestions.length} questions from "${concept}"`);
            }
        });
        
        console.log(`🔍 DIAGNOSTIC DEBUG: Total questions available: ${allAvailableQuestions.length}`);
        
        if (allAvailableQuestions.length === 0) {
            console.error('🔍 DIAGNOSTIC DEBUG: No questions found in any concept!');
            return [];
        }
        
        // Randomly select the needed number of questions
        const shuffled = [...allAvailableQuestions].sort(() => 0.5 - Math.random());
        const questionsToSelect = Math.min(totalQuestionsNeeded, shuffled.length);
        selectedQuestions.push(...shuffled.slice(0, questionsToSelect));
        
        console.log(`🔍 DIAGNOSTIC DEBUG: Selected ${selectedQuestions.length} questions for diagnostic testing rounds ${roundsTested.join(', ')}`);
        
        // Shuffle the final question set
        const finalQuestions = selectedQuestions.sort(() => 0.5 - Math.random());
        console.log(`Total questions selected for diagnostic: ${finalQuestions.length}`);
        
        return finalQuestions;
        
    } catch (error) {
        console.error('🔍 DIAGNOSTIC DEBUG: Error selecting questions for diagnostic:', error);
        console.log('🔍 DIAGNOSTIC DEBUG: Returning default questions due to error');
        window.USING_API_CONTENT = false;
        return getDefaultQuestions();
    }
}

// Fallback to default questions if configuration fails
function getDefaultQuestions() {
    console.log('🔍 DIAGNOSTIC DEBUG: Using default questions from available concepts');
    
    // Get the first available concept with questions
    const availableConcepts = Object.keys(questionBankByConcept);
    console.log('🔍 DIAGNOSTIC DEBUG: Available concepts:', availableConcepts);
    
    for (const concept of availableConcepts) {
        const conceptQuestions = questionBankByConcept[concept];
        if (conceptQuestions && conceptQuestions.length > 0) {
            console.log(`🔍 DIAGNOSTIC DEBUG: Using ${conceptQuestions.length} questions from "${concept}" as default`);
            const defaultQuestions = conceptQuestions.slice(0, 7);
            console.log('🔍 DIAGNOSTIC DEBUG: Returning default questions:', defaultQuestions.length);
            return defaultQuestions;
        }
    }
    
    console.error('🔍 DIAGNOSTIC DEBUG: No questions found in any concept!');
    return [];
}

// Dynamic question selection for diagnostics - will be populated by initialization
let diagnosticQuestions = [];

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
    
    console.log('🔍 BADGE DEBUG: Setting badge for element, currentQuestionIndex:', currentQuestionIndex);
    console.log('🔍 BADGE DEBUG: Current question:', testQuestions[currentQuestionIndex]);
    console.log('🔍 BADGE DEBUG: window.USING_API_CONTENT:', window.USING_API_CONTENT);
    
    element.querySelectorAll('.api-badge, .static-badge').forEach(b => b.remove());
    
    const currentQuestion = testQuestions[currentQuestionIndex];
    const isApiQuestion = currentQuestion && (currentQuestion._raw || currentQuestion.source === 'api' || window.USING_API_CONTENT);
    
    console.log('🔍 BADGE DEBUG: Is API question?', isApiQuestion);
    
    if (isApiQuestion) {
        console.log('🔍 BADGE DEBUG: Adding API badge');
        element.appendChild(createApiBadge());
    } else {
        console.log('🔍 BADGE DEBUG: Adding STATIC badge');
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
        title: 'Quiz 1',
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
    
    // Update intro content based on diagnostic configuration
    updateIntroContent();
    
    // Load questions dynamically based on diagnostic configuration
    console.log('🔍 DIAGNOSTIC DEBUG: Starting question loading...');
    
    // Debug diagnostic configuration
    const diagnosticConfigStr = localStorage.getItem('diagnosticConfig');
    console.log('🔍 DIAGNOSTIC DEBUG: Raw diagnosticConfig from localStorage:', diagnosticConfigStr);
    
    if (diagnosticConfigStr) {
        try {
            const config = JSON.parse(diagnosticConfigStr);
            console.log('🔍 DIAGNOSTIC DEBUG: Parsed diagnosticConfig:', config);
        } catch (e) {
            console.error('🔍 DIAGNOSTIC DEBUG: Failed to parse diagnosticConfig:', e);
        }
    }
    
    try {
        diagnosticQuestions = await selectQuestionsForDiagnostic();
        console.log(`🔍 DIAGNOSTIC DEBUG: Loaded ${diagnosticQuestions.length} questions for diagnostic`);
        console.log('🔍 DIAGNOSTIC DEBUG: Sample questions:', diagnosticQuestions.slice(0, 2));
        
        if (!diagnosticQuestions || diagnosticQuestions.length === 0) {
            console.error('🔍 DIAGNOSTIC DEBUG: No questions returned from selectQuestionsForDiagnostic, using fallback');
            diagnosticQuestions = getDefaultQuestions();
        }
    } catch (error) {
        console.error('🔍 DIAGNOSTIC DEBUG: Error in selectQuestionsForDiagnostic:', error);
        diagnosticQuestions = getDefaultQuestions();
    }
    
    // Final safety check
    if (!diagnosticQuestions || diagnosticQuestions.length === 0) {
        console.error('🔍 DIAGNOSTIC DEBUG: Still no questions after all attempts, forcing default');
        diagnosticQuestions = [
            {
                id: 1,
                question: "What is the primary function of the cell membrane?",
                correctAnswer: "Regulate what enters and exits the cell",
                options: ["Regulate what enters and exits the cell", "Produce energy", "Store genetic material", "Break down waste"],
                type: "multiple_choice"
            },
            {
                id: 2,
                question: "Which organelle is responsible for producing energy in the form of ATP?",
                correctAnswer: "Mitochondria",
                options: ["Mitochondria", "Nucleus", "Golgi apparatus", "Endoplasmic reticulum"],
                type: "multiple_choice"
            }
        ];
    }

    // Select and shuffle questions for the test
    const questionsToUse = Math.min(10, diagnosticQuestions.length); // Use up to 10 questions
    const shuffled = diagnosticQuestions.sort(() => 0.5 - Math.random());
    testQuestions = shuffled.slice(0, questionsToUse);
    
    console.log(`🔍 DIAGNOSTIC DEBUG: Final testQuestions length: ${testQuestions.length}`);
    console.log('🔍 DIAGNOSTIC DEBUG: Final testQuestions:', testQuestions);
    
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
    console.log('🔍 SHOW QUESTION DEBUG: currentQuestionIndex:', currentQuestionIndex);
    console.log('🔍 SHOW QUESTION DEBUG: testQuestions.length:', testQuestions?.length);
    console.log('🔍 SHOW QUESTION DEBUG: testQuestions:', testQuestions);
    
    if (!testQuestions || testQuestions.length === 0) {
        console.error('🔍 SHOW QUESTION DEBUG: No test questions available!');
        questionText.textContent = 'Error: No questions loaded. Please try again.';
        return;
    }
    
    if (currentQuestionIndex >= testQuestions.length) {
        console.error('🔍 SHOW QUESTION DEBUG: Question index out of bounds!', currentQuestionIndex, 'vs', testQuestions.length);
        return;
    }
    
    currentQuestion = testQuestions[currentQuestionIndex];
    
    if (!currentQuestion) {
        console.error('🔍 SHOW QUESTION DEBUG: Current question is undefined!', currentQuestionIndex);
        questionText.textContent = 'Error: Question not found. Please try again.';
        return;
    }
    
    console.log('🔍 SHOW QUESTION DEBUG: Current question:', currentQuestion);
    
    // Reset question text classes and set content
    questionText.className = 'question-text'; // Reset classes
    questionText.textContent = currentQuestion.question;
    
    // Apply dynamic text styling based on character count (reused from study.js)
    applyDynamicTextSizing(questionText, currentQuestion.question);
    
    // Add source badge (API/STATIC) to question text
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
    console.log('Test completed!');
    
    // Calculate results
    testResults.accuracy = Math.round((testResults.correct / testResults.total) * 100);
    console.log('Accuracy:', testResults.accuracy);
    
    // Hide question container
    questionContainer.style.display = 'none';
    
    // Show results
    showResults();
    
    // Update study path progress based on diagnostic results
    updateStudyPathProgress();
}

// Show test results
function showResults() {
    console.log('Showing results screen');
    console.log('Results screen element:', resultsScreen);
    
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
    console.log('Results screen display set to:', resultsScreen.style.display);
}

// Update study path progress based on diagnostic results
function updateStudyPathProgress() {
    try {
        // Load diagnostic configuration to get the diagnostic number
        const diagnosticConfigStr = localStorage.getItem('diagnosticConfig');
        let diagnosticNumber = 1; // Default fallback
        
        if (diagnosticConfigStr) {
            const diagnosticConfig = JSON.parse(diagnosticConfigStr);
            diagnosticNumber = diagnosticConfig.diagnosticNumber || 1;
            console.log(`Diagnostic ${diagnosticNumber} completed with ${testResults.accuracy}% accuracy`);
        }
        
        // Mark diagnostic as completed using the proper diagnostic number
        localStorage.setItem(`diagnostic${diagnosticNumber}_completed`, 'true');
        localStorage.setItem(`diagnostic${diagnosticNumber}_accuracy`, testResults.accuracy.toString());
        
        console.log(`Marked diagnostic ${diagnosticNumber} as completed with ${testResults.accuracy}% accuracy`);
        
        // Clear the diagnostic configuration since the test is complete
        localStorage.removeItem('diagnosticConfig');
        
    } catch (error) {
        console.error('Error updating study path progress:', error);
        // Fallback to legacy behavior
    localStorage.setItem('diagnostic1_completed', 'true');
    localStorage.setItem('diagnostic1_accuracy', testResults.accuracy.toString());
    }
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
        window.location.href = '../html/study-plan.html?diagnostic=1&accuracy=' + testResults.accuracy;
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initDiagnosticTest); 