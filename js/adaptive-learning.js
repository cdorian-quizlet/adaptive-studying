// Adaptive Learning System
// Integrates ChatGPT adaptive logic with existing study system

// =============================================================================
// TYPES AND CONSTANTS
// =============================================================================

// Knowledge depth levels
const KNOWLEDGE_DEPTHS = ["Recall", "Understanding", "Application"];

// Response modes - mapped to existing question formats
const RESPONSE_MODES = {
    "Flashcard": "flashcard",
    "Matching": "matching", 
    "MCQ": "multiple_choice",
    "Free-Form": "written"
};

// Reverse mapping for internal use
const INTERNAL_TO_RESPONSE = {
    "flashcard": "Flashcard",
    "matching": "Matching",
    "multiple_choice": "MCQ", 
    "written": "Free-Form"
};

// Difficulty levels
const DIFFICULTIES = ["easy", "medium", "hard"];

// User types (from goal type selection)
const USER_TYPES = ["Cram", "StudyPlan", "Memorize"];

// Readiness levels
const READINESS_LEVELS = ["NotAtAll", "Somewhat", "Very", "Unknown"];

// Mode progression order (easiest to hardest)
const MODE_ORDER = ["Flashcard", "Matching", "MCQ", "Free-Form"];

// Allowed response modes by knowledge depth
const ALLOWED_BY_DEPTH = {
    "Recall": ["Flashcard", "Matching", "MCQ", "Free-Form"],
    "Understanding": ["Flashcard", "Matching", "MCQ", "Free-Form"], 
    "Application": ["MCQ", "Free-Form"] // NO Flashcard/Matching at Application
};

// =============================================================================
// CORE ADAPTIVE LOGIC
// =============================================================================

class QType {
    constructor(depth, mode, difficulty) {
        this.depth = depth;
        this.mode = mode;
        this.difficulty = difficulty;
    }
    
    toKey() {
        return `${this.depth}-${this.mode}-${this.difficulty}`;
    }
    
    // Convert to internal question format
    toInternalFormat() {
        return RESPONSE_MODES[this.mode];
    }
}

class TermState {
    constructor(current, consecutiveCorrect = 0, totalAttempts = 0, totalCorrect = 0) {
        this.current = current;
        this.consecutiveCorrect = consecutiveCorrect;
        this.totalAttempts = totalAttempts;
        this.totalCorrect = totalCorrect;
    }
}

// Normalize QType to ensure mode is valid for depth
function normalize(qtype) {
    const allowed = ALLOWED_BY_DEPTH[qtype.depth];
    if (allowed.includes(qtype.mode)) {
        return qtype;
    }
    
    // Find nearest harder allowed mode
    for (const mode of MODE_ORDER) {
        if (allowed.includes(mode) && MODE_ORDER.indexOf(mode) >= MODE_ORDER.indexOf(qtype.mode)) {
            return new QType(qtype.depth, mode, qtype.difficulty);
        }
    }
    
    // Fallback to first allowed mode
    return new QType(qtype.depth, allowed[0], qtype.difficulty);
}

// Escalate difficulty/complexity
function escalate(qtype, steps = 1, axis = ["depth", "mode", "difficulty"]) {
    let next = new QType(qtype.depth, qtype.mode, qtype.difficulty);
    
    for (let i = 0; i < steps; i++) {
        for (const a of axis) {
            if (a === "depth") {
                const idx = KNOWLEDGE_DEPTHS.indexOf(next.depth);
                if (idx < KNOWLEDGE_DEPTHS.length - 1) {
                    next.depth = KNOWLEDGE_DEPTHS[idx + 1];
                    next = normalize(next);
                    continue;
                }
            }
            if (a === "mode") {
                const idx = MODE_ORDER.indexOf(next.mode);
                if (idx < MODE_ORDER.length - 1) {
                    next.mode = MODE_ORDER[idx + 1];
                    next = normalize(next);
                    continue;
                }
            }
            if (a === "difficulty") {
                const idx = DIFFICULTIES.indexOf(next.difficulty);
                if (idx < DIFFICULTIES.length - 1) {
                    next.difficulty = DIFFICULTIES[idx + 1];
                    continue;
                }
            }
        }
    }
    
    return normalize(next);
}

// Demote difficulty/complexity
function demote(qtype, axis = ["difficulty", "mode", "depth"]) {
    let next = new QType(qtype.depth, qtype.mode, qtype.difficulty);
    
    for (const a of axis) {
        if (a === "difficulty") {
            const idx = DIFFICULTIES.indexOf(next.difficulty);
            if (idx > 0) {
                next.difficulty = DIFFICULTIES[idx - 1];
                return normalize(next);
            }
        }
        if (a === "mode") {
            const idx = MODE_ORDER.indexOf(next.mode);
            if (idx > 0) {
                next.mode = MODE_ORDER[idx - 1];
                return normalize(next);
            }
        }
        if (a === "depth") {
            const idx = KNOWLEDGE_DEPTHS.indexOf(next.depth);
            if (idx > 0) {
                next.depth = KNOWLEDGE_DEPTHS[idx - 1];
                return normalize(next);
            }
        }
    }
    
    return normalize(next);
}

// =============================================================================
// PRESETS
// =============================================================================

// Helper functions for creating QTypes
const fcard = (d) => new QType("Recall", "Flashcard", d);
const match = (d) => new QType("Recall", "Matching", d);
const rm = (d) => new QType("Recall", "MCQ", d);
const rf = (d) => new QType("Recall", "Free-Form", d);
const um = (d) => new QType("Understanding", "MCQ", d);
const uf = (d) => new QType("Understanding", "Free-Form", d);
const am = (d) => new QType("Application", "MCQ", d);
const af = (d) => new QType("Application", "Free-Form", d);

// Completion rule helper
const completeAt = (target) => (termState) => 
    termState.current.depth === target.depth &&
    termState.current.mode === target.mode &&
    DIFFICULTIES.indexOf(termState.current.difficulty) >= DIFFICULTIES.indexOf(target.difficulty) &&
    termState.consecutiveCorrect >= 1;

// User type and readiness presets
const PRESETS = {
    Cram: {
        NotAtAll: {
            startType: fcard("easy"),
            promotionGate: 2,
            demotionGate: 1,
            retryBudget: 2,
            fastTrack: "none",
            allowSkipAfter: undefined,
            resurfaceWindow: 4,
            completionRule: completeAt(am("medium")),
        },
        Somewhat: {
            startType: match("medium"),
            promotionGate: 1,
            demotionGate: 1,
            retryBudget: 1,
            fastTrack: "jump_one",
            allowSkipAfter: (s) => s.current.depth !== "Recall" && s.consecutiveCorrect >= 1,
            resurfaceWindow: 5,
            completionRule: completeAt(am("medium")),
        },
        Very: {
            startType: uf("medium"),
            promotionGate: 1,
            demotionGate: 1,
            retryBudget: 0,
            fastTrack: "jump_two",
            allowSkipAfter: (s) => s.current.depth === "Application" && s.current.mode === "MCQ" && s.consecutiveCorrect >= 1,
            resurfaceWindow: 5,
            completionRule: completeAt(am("medium")),
        },
    },
    StudyPlan: {
        NotAtAll: {
            startType: fcard("easy"),
            promotionGate: 2,
            demotionGate: 2,
            retryBudget: 2,
            fastTrack: "none",
            allowSkipAfter: undefined,
            resurfaceWindow: 3,
            completionRule: (s) => (s.current.depth === "Application" || s.current.depth === "Understanding") && 
                                   s.current.mode === "Free-Form" && s.current.difficulty === "hard" && s.consecutiveCorrect >= 1
        },
        Somewhat: {
            startType: match("medium"),
            promotionGate: 1,
            demotionGate: 1,
            retryBudget: 1,
            fastTrack: "none",
            allowSkipAfter: undefined,
            resurfaceWindow: 4,
            completionRule: completeAt(am("medium")),
        },
        Very: {
            startType: rf("medium"),
            promotionGate: 1,
            demotionGate: 1,
            retryBudget: 1,
            fastTrack: "jump_one",
            allowSkipAfter: (s) => s.current.depth === "Application" && s.current.mode === "MCQ" && s.consecutiveCorrect >= 1,
            resurfaceWindow: 4,
            completionRule: (s) => s.current.depth === "Application" && s.current.mode === "Free-Form" && s.consecutiveCorrect >= 1,
        },
    },
    Memorize: {
        NotAtAll: {
            startType: fcard("easy"),
            promotionGate: 2,
            demotionGate: 1,
            retryBudget: 2,
            fastTrack: "none",
            allowSkipAfter: undefined,
            resurfaceWindow: 3,
            completionRule: completeAt(af("hard")),
        },
        Somewhat: {
            startType: rf("medium"),
            promotionGate: 1,
            demotionGate: 2,
            retryBudget: 1,
            fastTrack: "none",
            allowSkipAfter: undefined,
            resurfaceWindow: 4,
            completionRule: completeAt(af("hard")),
        },
        Very: {
            startType: uf("medium"),
            promotionGate: 1,
            demotionGate: 1,
            retryBudget: 0,
            fastTrack: "jump_one",
            allowSkipAfter: undefined,
            resurfaceWindow: 4,
            completionRule: completeAt(af("hard")),
        },
    }
};

// =============================================================================
// CALIBRATION
// =============================================================================

function selectCalibrationItems() {
    // 6-item probe (easiest → harder)
    return [
        new QType("Recall", "Flashcard", "easy"),
        new QType("Recall", "Matching", "medium"),
        new QType("Recall", "Free-Form", "medium"),
        new QType("Understanding", "MCQ", "medium"),
        new QType("Understanding", "Free-Form", "medium"),
        new QType("Application", "MCQ", "easy"),
    ];
}

// =============================================================================
// SCORING AND ADAPTATION
// =============================================================================

function calculateScore(termState, outcome) {
    const depthWeight = { "Recall": 1, "Understanding": 2, "Application": 3 }[termState.current.depth];
    
    const modeWeight = 
        termState.current.mode === "Flashcard" ? 0.5 :
        termState.current.mode === "Matching" ? 0.75 :
        termState.current.mode === "MCQ" ? 1 :
        1.5; // Free-Form
    
    const delta = outcome === "Correct" ? 6 * depthWeight * modeWeight : -3;
    return delta;
}

function applyOutcome(termState, outcome, profile) {
    // Update stats
    termState.totalAttempts++;
    if (outcome === "Correct") {
        termState.consecutiveCorrect++;
        termState.totalCorrect++;
    } else {
        termState.consecutiveCorrect = 0;
    }
    
    // Check for promotion/demotion
    if (outcome === "Correct" && termState.consecutiveCorrect >= profile.promotionGate) {
        // Promote
        let steps = 1;
        if (profile.fastTrack === "jump_one") steps = 1;
        else if (profile.fastTrack === "jump_two") steps = 2;
        
        termState.current = escalate(termState.current, steps);
        termState.consecutiveCorrect = 0; // Reset after promotion
    } else if (outcome === "Incorrect" && termState.consecutiveCorrect === 0) {
        // Check if we should demote (after accumulating wrong answers)
        // For simplicity, demote after first wrong answer if demotion gate is 1
        if (profile.demotionGate === 1) {
            termState.current = demote(termState.current);
        }
    }
    
    return termState;
}

// =============================================================================
// INTEGRATION WITH EXISTING STUDY SYSTEM
// =============================================================================

class AdaptiveLearningEngine {
    constructor() {
        this.termStates = new Map(); // questionId -> TermState
        this.profile = null;
        this.userType = null;
        this.readiness = null;
    }
    
    // Initialize with user type and readiness from onboarding
    initialize(userType, readiness) {
        this.userType = userType || "StudyPlan";
        this.readiness = readiness || "Unknown";
        this.profile = PRESETS[this.userType]?.[this.readiness] || PRESETS.StudyPlan.Somewhat;
        
        console.log(`Adaptive Learning Engine initialized:`, {
            userType: this.userType,
            readiness: this.readiness,
            startType: this.profile.startType.toKey()
        });
    }
    
    // Get question format for a specific question
    getQuestionFormat(questionId) {
        let termState = this.termStates.get(questionId);
        
        if (!termState) {
            // First time seeing this question - use starting type
            termState = new TermState(this.profile.startType);
            this.termStates.set(questionId, termState);
        }
        
        // Normalize the current type to ensure it's valid
        termState.current = normalize(termState.current);
        
        return termState.current.toInternalFormat();
    }
    
    // Process answer outcome and adapt
    processAnswer(questionId, isCorrect) {
        const termState = this.termStates.get(questionId);
        if (!termState) {
            console.warn(`No term state found for question ${questionId}`);
            return;
        }
        
        const outcome = isCorrect ? "Correct" : "Incorrect";
        applyOutcome(termState, outcome, this.profile);
        
        console.log(`Question ${questionId} outcome: ${outcome}`, {
            newType: termState.current.toKey(),
            consecutiveCorrect: termState.consecutiveCorrect,
            totalCorrect: termState.totalCorrect,
            totalAttempts: termState.totalAttempts
        });
    }
    
    // Check if question is completed according to profile rules
    isQuestionCompleted(questionId) {
        const termState = this.termStates.get(questionId);
        if (!termState) return false;
        
        return this.profile.completionRule(termState);
    }
    
    // Get readiness level from knowledge level (for compatibility)
    static getReadinessFromKnowledge(knowledgeLevel) {
        switch (knowledgeLevel) {
            case "Not at all confident":
                return "NotAtAll";
            case "Somewhat confident":
                return "Somewhat";
            case "Very confident":
                return "Very";
            default:
                return "Unknown";
        }
    }
    
    // Get user type from goal type (for compatibility)
    static getUserTypeFromGoal(goalType) {
        switch (goalType) {
            case "cram":
                return "Cram";
            case "memorize":
                return "Memorize";
            default:
                return "StudyPlan";
        }
    }
    
    // Get debug information for current question
    getDebugInfo(questionId) {
        const termState = this.termStates.get(questionId);
        if (!termState) {
            return {
                depth: 'Unknown',
                mode: 'Unknown', 
                difficulty: 'Unknown',
                internalFormat: 'Unknown'
            };
        }
        
        return {
            depth: termState.current.depth,
            mode: termState.current.mode,
            difficulty: termState.current.difficulty,
            internalFormat: termState.current.toInternalFormat(),
            consecutiveCorrect: termState.consecutiveCorrect,
            totalCorrect: termState.totalCorrect,
            totalAttempts: termState.totalAttempts
        };
    }
    
    // Get what the next question type would be after a correct/incorrect answer
    getNextQuestionPreview(questionId, assumeCorrect = true) {
        const termState = this.termStates.get(questionId);
        if (!termState) {
            return {
                depth: 'Unknown',
                mode: 'Unknown',
                difficulty: 'Unknown', 
                internalFormat: 'Unknown'
            };
        }
        
        // Create a copy of the term state to simulate the outcome
        const simulatedState = new TermState(
            new QType(termState.current.depth, termState.current.mode, termState.current.difficulty),
            termState.consecutiveCorrect,
            termState.totalAttempts,
            termState.totalCorrect
        );
        
        // Simulate the outcome
        const outcome = assumeCorrect ? "Correct" : "Incorrect";
        applyOutcome(simulatedState, outcome, this.profile);
        
        // Check if it would be completed
        if (this.profile.completionRule(simulatedState)) {
            return {
                depth: 'Completed',
                mode: 'Completed',
                difficulty: 'Completed',
                internalFormat: 'completed'
            };
        }
        
        return {
            depth: simulatedState.current.depth,
            mode: simulatedState.current.mode,
            difficulty: simulatedState.current.difficulty,
            internalFormat: simulatedState.current.toInternalFormat()
        };
    }

    // Save state to localStorage
    saveState() {
        const state = {
            userType: this.userType,
            readiness: this.readiness,
            termStates: Array.from(this.termStates.entries()).map(([id, termState]) => [
                id,
                {
                    current: termState.current,
                    consecutiveCorrect: termState.consecutiveCorrect,
                    totalAttempts: termState.totalAttempts,
                    totalCorrect: termState.totalCorrect
                }
            ])
        };
        
        try {
            localStorage.setItem('adaptive_learning_state', JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save adaptive learning state:', e);
        }
    }
    
    // Load state from localStorage
    loadState() {
        try {
            const saved = localStorage.getItem('adaptive_learning_state');
            if (!saved) return;
            
            const state = JSON.parse(saved);
            this.userType = state.userType;
            this.readiness = state.readiness;
            this.profile = PRESETS[this.userType]?.[this.readiness] || PRESETS.StudyPlan.Somewhat;
            
            // Restore term states
            this.termStates.clear();
            if (state.termStates) {
                state.termStates.forEach(([id, termData]) => {
                    const qtype = new QType(termData.current.depth, termData.current.mode, termData.current.difficulty);
                    const termState = new TermState(
                        qtype,
                        termData.consecutiveCorrect,
                        termData.totalAttempts,
                        termData.totalCorrect
                    );
                    this.termStates.set(id, termState);
                });
            }
            
            console.log('Adaptive learning state loaded:', {
                userType: this.userType,
                readiness: this.readiness,
                questionsTracked: this.termStates.size
            });
        } catch (e) {
            console.warn('Failed to load adaptive learning state:', e);
        }
    }
}

// =============================================================================
// GLOBAL INSTANCE
// =============================================================================

// Create global instance for use in study.js
window.AdaptiveLearning = new AdaptiveLearningEngine();

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AdaptiveLearningEngine,
        QType,
        TermState,
        PRESETS,
        selectCalibrationItems
    };
}
