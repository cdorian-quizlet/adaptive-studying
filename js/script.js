// DOM Elements
const searchInput = document.querySelector('.search-input');
const jumpBackCard = document.querySelector('.jump-back-card');
const continueButton = document.querySelector('.continue-button');
const moreOptionsBtn = document.querySelector('.more-options');
const recentItems = document.querySelectorAll('.recent-item');
const navItems = document.querySelectorAll('.nav-item');
const profileAvatar = document.querySelector('.profile-avatar');
const bottomSheet = document.getElementById('bottomSheet');
const closeBottomSheet = document.getElementById('closeBottomSheet');
const resetProgressBtn = document.getElementById('resetProgress');

// Chat Elements
const chatOverlay = document.getElementById('chatOverlay');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendMessageBtn = document.getElementById('sendMessage');
const closeChatBtn = document.getElementById('closeChat');

// Configuration
let PROGRESS_VALUE = 0; // Dynamic progress value

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadStudyProgress();
    setupEventListeners();
    setupHapticFeedback();
    setupAccessibility();
});

// Also refresh progress when page becomes visible (e.g., returning from diagnostic test)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        loadStudyProgress();
    }
});

// Event Listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', function(e) {
        // Debounced live preview could go here; keep quiet to avoid spam toasts
    });

    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query) {
                // Navigate to study page using search API
                window.location.href = `html/study.html?search=${encodeURIComponent(query)}`;
            }
        }
    });

    // Jump back card interactions
    jumpBackCard.addEventListener('click', function(e) {
        if (e.target !== continueButton && e.target !== moreOptionsBtn) {
            navigateToStudyScreen();
        }
    });

    // Continue button
    continueButton.addEventListener('click', function(e) {
        e.stopPropagation();
        navigateToStudyScreen();
    });

    // More options button
    moreOptionsBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showBottomSheet();
    });

    // Recent items
    recentItems.forEach(item => {
        item.addEventListener('click', function() {
            const title = this.querySelector('.item-title').textContent;
            showToast(`Opening ${title}`);
        });
    });

    // Study options
    const studyOptions = document.querySelectorAll('.study-option');
    studyOptions.forEach(option => {
        option.addEventListener('click', function() {
            const action = this.textContent;
            openChatWithSelection(action);
        });
    });

    // Navigation items
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            
            const label = this.querySelector('span').textContent;
            showToast(`Navigating to ${label}`);
        });
    });

    // Profile avatar
    profileAvatar.addEventListener('click', function() {
        showToast('Profile menu opened');
    });

    // Bottom sheet functionality
    closeBottomSheet.addEventListener('click', function() {
        hideBottomSheet();
    });

    resetProgressBtn.addEventListener('click', function() {
        resetStudyProgress();
        hideBottomSheet();
    });

    // Close bottom sheet on backdrop click
    bottomSheet.addEventListener('click', function(e) {
        if (e.target === bottomSheet) {
            hideBottomSheet();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'Escape':
                if (searchInput === document.activeElement) {
                    searchInput.blur();
                }
                break;
            case 'Enter':
                if (document.activeElement === jumpBackCard) {
                    navigateToStudyScreen();
                }
                break;
        }
    });

    // Touch gestures
    setupTouchGestures();
}

// Load and display study progress
function loadStudyProgress() {
    let PROGRESS_VALUE = 0;
    
    // Check for diagnostic test progress
    const studyPathData = localStorage.getItem('studyPathData');
    if (studyPathData) {
        try {
            const pathData = JSON.parse(studyPathData);
            if (pathData.roundProgress) {
                const diagnosticProgress = Object.values(pathData.roundProgress).reduce((sum, progress) => sum + progress, 0);
                const diagnosticPercentage = Math.round((diagnosticProgress / 50) * 100);
                PROGRESS_VALUE = Math.max(PROGRESS_VALUE, diagnosticPercentage);
                console.log('Diagnostic Progress:', { diagnosticProgress, diagnosticPercentage, finalProgress: PROGRESS_VALUE });
            }
        } catch (error) {
            console.error('Error parsing study path data:', error);
        }
    }
    
    // Fallback to old progress system
    if (PROGRESS_VALUE === 0) {
        const savedProgress = localStorage.getItem('studyProgress');
        const currentQuestionIndex = localStorage.getItem('currentQuestionIndex') || 0;
        const totalQuestions = 50; // Total questions (all 50 state capitals)
        
        if (savedProgress) {
            PROGRESS_VALUE = parseInt(savedProgress);
        } else {
            // Calculate progress based on current question index
            PROGRESS_VALUE = Math.round((parseInt(currentQuestionIndex) / totalQuestions) * 100);
        }
    }
    
    // Update progress bar
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = `${PROGRESS_VALUE}%`;
    }
    
    // Update progress text
    const progressText = document.querySelector('.progress-text');
    if (progressText) {
        progressText.textContent = `${PROGRESS_VALUE}% complete`;
    }
    
    // Store the calculated progress for other screens
    localStorage.setItem('studyProgress', PROGRESS_VALUE.toString());
}

// Navigation Functions
function navigateToStudyScreen() {
    // Add loading state
    jumpBackCard.style.pointerEvents = 'none';
    continueButton.textContent = 'Loading...';
    continueButton.style.opacity = '0.7';
    
    // Simulate navigation delay
    setTimeout(() => {
        // Navigate to study path screen
        window.location.href = 'html/study-path.html';
    }, 1000);
}

// Bottom Sheet Functions
function showBottomSheet() {
    bottomSheet.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideBottomSheet() {
    bottomSheet.classList.remove('show');
    document.body.style.overflow = '';
}

function resetStudyProgress() {
    // Reset progress in localStorage
    localStorage.removeItem('studyProgress');
    localStorage.removeItem('currentQuestionIndex');
    localStorage.removeItem('questionAttempts');
    localStorage.removeItem('studyPathData');
    localStorage.removeItem('studyAccuracy');
    
    // Reset round progress data
    localStorage.removeItem('currentRoundNumber');
    localStorage.removeItem('currentRoundProgress');
    localStorage.removeItem('roundProgressData');
    localStorage.removeItem('targetRound');
    localStorage.removeItem('targetQuestionIndex');
    
    // Reset diagnostic test data
    localStorage.removeItem('diagnostic1_completed');
    localStorage.removeItem('diagnostic1_accuracy');
    localStorage.removeItem('diagnostic1_cards_learned');
    localStorage.removeItem('diagnostic2_completed');
    localStorage.removeItem('diagnostic2_accuracy');
    localStorage.removeItem('diagnostic2_cards_learned');
    localStorage.removeItem('diagnostic3_completed');
    localStorage.removeItem('diagnostic3_accuracy');
    localStorage.removeItem('diagnostic3_cards_learned');
    
    // Reset progress bar
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = '0%';
    }
    
    // Reset progress text
    const progressText = document.querySelector('.progress-text');
    if (progressText) {
        progressText.textContent = '0% complete';
    }
    
    // Update the global progress value
    PROGRESS_VALUE = 0;
    
    // Reset questions array if it exists in the global scope
    if (typeof window.resetQuestionsArray === 'function') {
        window.resetQuestionsArray();
    }
    
    showToast('Study progress and path data reset successfully');
}

// Haptic Feedback (for mobile devices)
function setupHapticFeedback() {
    if ('vibrate' in navigator) {
        // Add haptic feedback to interactive elements
        const interactiveElements = [
            jumpBackCard, continueButton, moreOptionsBtn,
            ...recentItems, ...navItems, profileAvatar
        ];
        
        interactiveElements.forEach(element => {
            element.addEventListener('click', function() {
                navigator.vibrate(10); // Short vibration
            });
        });
    }
}

// Toast Notification System
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
    
    // Add toast styles
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
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

// Touch Gesture Support
function setupTouchGestures() {
    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    });

    document.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe up - could trigger refresh or new content
                showToast('Swipe up detected');
            } else {
                // Swipe down - could trigger back navigation
                showToast('Swipe down detected');
            }
        }
    }
}

// Performance Optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll performance
const optimizedScroll = debounce(function() {
    // Handle scroll-based animations or effects
}, 16); // ~60fps

window.addEventListener('scroll', optimizedScroll);

// Accessibility Enhancements
function setupAccessibility() {
    // Add ARIA labels
    searchInput.setAttribute('aria-label', 'Search study sets');
    continueButton.setAttribute('aria-label', 'Continue studying US Capitals');
    moreOptionsBtn.setAttribute('aria-label', 'More options');
    profileAvatar.setAttribute('aria-label', 'Profile menu');
    
    // Add role attributes
    jumpBackCard.setAttribute('role', 'button');
    jumpBackCard.setAttribute('tabindex', '0');
    
    recentItems.forEach(item => {
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
    });
    
    navItems.forEach(item => {
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
    });
}

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Chat Functions
function openChatWithSelection(selection) {
    showChat();
    addUserMessage(selection);
    
    // Generate AI response based on selection
    setTimeout(() => {
        const aiResponse = generateAIResponse(selection);
        addAssistantMessage(aiResponse);
    }, 1000);
}

function showChat() {
    chatOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    chatInput.focus();
}

function hideChat() {
    chatOverlay.classList.remove('show');
    document.body.style.overflow = '';
    chatInput.value = '';
}

function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
        <div class="message-avatar">U</div>
        <div class="message-content">${text}</div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function addAssistantMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    messageDiv.innerHTML = `
        <div class="message-avatar">AI</div>
        <div class="message-content">${text}</div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateAIResponse(selection) {
    const responses = {
        'Make a study plan': `Great choice! Let's create a personalized study plan for you. 

I can help you:
• Set specific learning goals
• Break down topics into manageable chunks
• Create a realistic timeline
• Suggest study techniques

What subject are you studying, and when is your target date?`,
        
        'Cram for a test': `I understand you need to study quickly! Let's make the most of your time.

For effective cramming, I recommend:
• Focus on key concepts and definitions
• Use active recall techniques
• Create quick flashcards
• Take practice tests

What subject is your test on, and how much time do you have?`,
        
        'Quickly review': `Perfect! Let's do a quick review to refresh your memory.

I can help you:
• Identify knowledge gaps
• Focus on weak areas
• Use spaced repetition
• Test your recall

What topic would you like to review?`,
        
        'Memorize terms': `Excellent! Memorization is a key study skill.

Let's use proven techniques:
• Mnemonics and memory tricks
• Flashcards with spaced repetition
• Association methods
• Active recall practice

What terms or concepts do you need to memorize?`
    };
    
    return responses[selection] || `I'd be happy to help you with "${selection}"! What specific topic or subject would you like to focus on?`;
}

function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
        addUserMessage(message);
        chatInput.value = '';
        
        // Simulate AI response
        setTimeout(() => {
            const aiResponse = `I understand you're asking about "${message}". Let me help you with that. Could you provide more specific details about what you'd like to learn or practice?`;
            addAssistantMessage(aiResponse);
        }, 1000);
    }
}

// Chat Event Listeners
closeChatBtn.addEventListener('click', hideChat);
sendMessageBtn.addEventListener('click', sendMessage);

chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

chatOverlay.addEventListener('click', function(e) {
    if (e.target === chatOverlay) {
        hideChat();
    }
});

// Export functions for potential external use
window.StudyApp = {
    navigateToStudyScreen,
    showToast,
    showOptionsMenu,
    updateProgress: function(newProgress) {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${newProgress}%`;
        }
    },
    openChat: openChatWithSelection
}; 