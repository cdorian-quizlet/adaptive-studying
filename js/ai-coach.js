/**
 * AI Coach Screen
 * Handles the AI-powered study coaching experience
 * 
 * Features:
 * - Action buttons prefill the input with predefined prompts
 * - Chat interface powered by custom GPT on the backend
 * - Custom GPT ID: g-68ffcaf103708191a8bf9be92609f4d9-quizlet-ai-coach
 */

// Configuration
const API_BASE_URL = 'http://localhost:3000'; // Change this to your backend URL

// State management
let chatHistory = [];
let isWaitingForResponse = false;

document.addEventListener('DOMContentLoaded', function() {
    initializeAiCoach();
});

function initializeAiCoach() {
    // Get DOM elements
    const menuButton = document.getElementById('menuButton');
    const dropdownButton = document.getElementById('dropdownButton');
    const studyOptions = document.querySelectorAll('.ai-coach-option');
    const studyQuestionInput = document.getElementById('studyQuestionInput');
    const submitButton = document.getElementById('submitButton');
    const addButton = document.getElementById('addButton');

    // Menu button handler
    if (menuButton) {
        menuButton.addEventListener('click', handleMenuClick);
    }

    // Dropdown button handler
    if (dropdownButton) {
        dropdownButton.addEventListener('click', handleDropdownClick);
    }

    // Study option buttons
    studyOptions.forEach(option => {
        option.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            handleStudyOptionClick(action);
        });
    });

    // Submit button handler
    if (submitButton) {
        submitButton.addEventListener('click', handleSubmitQuestion);
    }

    // Add button handler
    if (addButton) {
        addButton.addEventListener('click', handleAddClick);
    }

    // Input enter key handler
    if (studyQuestionInput) {
        studyQuestionInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim()) {
                handleSubmitQuestion();
            }
        });

        // Update submit button state based on input value
        studyQuestionInput.addEventListener('input', function() {
            const submitBtn = document.getElementById('submitButton');
            if (submitBtn) {
                if (this.value.trim()) {
                    submitBtn.classList.add('has-text');
                } else {
                    submitBtn.classList.remove('has-text');
                }
            }
        });
    }
}

/**
 * Handle menu button click
 */
function handleMenuClick() {
    console.log('Menu clicked');
    
    const chatView = document.getElementById('chatView');
    const initialView = document.getElementById('initialView');
    
    // If we're in chat view, go back to initial view
    if (chatView && chatView.style.display !== 'none') {
        // Show confirmation if there's chat history
        if (chatHistory.length > 0) {
            if (confirm('Are you sure you want to end this conversation?')) {
                resetToInitialView();
            }
        } else {
            resetToInitialView();
        }
    } else {
        // Otherwise go back in browser history
        window.history.back();
    }
}

/**
 * Reset to initial view
 */
function resetToInitialView() {
    const chatView = document.getElementById('chatView');
    const initialView = document.getElementById('initialView');
    const chatMessages = document.getElementById('chatMessages');
    const input = document.getElementById('studyQuestionInput');
    
    if (chatView && initialView) {
        chatView.style.display = 'none';
        initialView.style.display = 'flex';
    }
    
    // Clear chat history
    chatHistory = [];
    if (chatMessages) {
        chatMessages.innerHTML = '';
    }
    
    // Clear input
    if (input) {
        input.value = '';
        input.placeholder = 'Type your study question';
    }
}

/**
 * Handle dropdown button click
 */
function handleDropdownClick() {
    console.log('Dropdown clicked');
    // Show dropdown menu for selecting study set or context
    // This could open a modal or sheet with study set options
}

/**
 * Handle study option button clicks
 */
function handleStudyOptionClick(action) {
    console.log('Study option clicked:', action);
    
    if (isWaitingForResponse) {
        return;
    }
    
    let promptText = '';
    
    switch(action) {
        case 'cram':
            promptText = 'Help me cram';
            break;
        case 'quiz':
            promptText = 'Quiz me';
            break;
        case 'exam':
            promptText = 'Prep for an exam';
            break;
        default:
            console.warn('Unknown action:', action);
            return;
    }
    
    // Directly submit the question
    console.log('Submitting question to AI Coach:', promptText);
    
    // Switch to chat view
    switchToChatView();
    
    // Add user message to chat
    addMessageToChat('user', promptText);
    
    // Send to AI and get response
    sendMessageToAI(promptText);
}

/**
 * Handle submit question
 */
function handleSubmitQuestion() {
    const input = document.getElementById('studyQuestionInput');
    const question = input.value.trim();
    
    if (!question || isWaitingForResponse) {
        return;
    }
    
    console.log('Submitting question to AI Coach:', question);
    
    // Clear the input immediately
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Switch to chat view if not already there
    switchToChatView();
    
    // Add user message to chat
    addMessageToChat('user', question);
    
    // Send to AI and get response
    sendMessageToAI(question);
}

/**
 * Switch from initial view to chat view
 */
function switchToChatView() {
    const initialView = document.getElementById('initialView');
    const chatView = document.getElementById('chatView');
    const input = document.getElementById('studyQuestionInput');
    
    if (initialView && chatView) {
        initialView.style.display = 'none';
        chatView.style.display = 'flex';
    }
    
    // Update placeholder for follow-up messages
    if (input) {
        input.placeholder = 'Ask a follow-up question...';
    }
}

/**
 * Add a message to the chat interface
 */
function addMessageToChat(role, content) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    
    // Format the content for assistant messages
    if (role === 'assistant') {
        bubbleDiv.innerHTML = formatMessageContent(content);
    } else {
        bubbleDiv.className = 'message-bubble subheading-3';
        bubbleDiv.textContent = content;
    }
    
    messageDiv.appendChild(bubbleDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Store in history
    chatHistory.push({ role, content });
}

/**
 * Format message content with markdown-like syntax
 */
function formatMessageContent(text) {
    // Escape HTML first
    text = text.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');
    
    // Convert **bold** to <span class="semibold-3">
    text = text.replace(/\*\*(.+?)\*\*/g, '<span class="semibold-3">$1</span>');
    
    // Convert *italic* to <em>
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Split by double newlines for paragraphs
    const paragraphs = text.split('\n\n');
    
    const formattedParagraphs = paragraphs.map(para => {
        // Check if paragraph contains bullet points or numbered lists
        const lines = para.split('\n');
        
        // Check for study set results pattern
        if (lines.some(line => /\[Set Results UI.*?\]/.test(line) || /\[Preview button\]/.test(line))) {
            return generateStudySetCards();
        }
        
        // Check for bullet points (-, *, •)
        if (lines.some(line => /^[\s]*[-*•]\s/.test(line))) {
            const listItems = lines
                .filter(line => /^[\s]*[-*•]\s/.test(line))
                .map(line => {
                    const content = line.replace(/^[\s]*[-*•]\s+/, '');
                    return `<li class="body-3">${content}</li>`;
                })
                .join('');
            return `<ul>${listItems}</ul>`;
        }
        
        // Check for numbered lists (1., 2., etc.)
        if (lines.some(line => /^[\s]*\d+\.\s/.test(line))) {
            const listItems = lines
                .filter(line => /^[\s]*\d+\.\s/.test(line))
                .map(line => {
                    const content = line.replace(/^[\s]*\d+\.\s+/, '');
                    return `<li class="body-3">${content}</li>`;
                })
                .join('');
            return `<ol>${listItems}</ol>`;
        }
        
        // Regular paragraph - convert single newlines to <br>
        return `<p class="body-3">${para.replace(/\n/g, '<br>')}</p>`;
    });
    
    return formattedParagraphs.join('');
}

/**
 * Generate study set cards with fake data
 */
function generateStudySetCards() {
    // Fake study set data
    const studySets = [
        {
            id: 'set-1',
            title: 'BIO 110: Cell Structure & Function',
            termCount: 38,
            isTopPick: false
        },
        {
            id: 'set-2',
            title: 'BIO 110: Exam 1 Review Guide',
            termCount: 42,
            isTopPick: true
        },
        {
            id: 'set-3',
            title: 'BIO 110 — Exam 1 Concepts',
            termCount: 25,
            isTopPick: true,
            expanded: true
        }
    ];
    
    // Mock flashcard data for expanded preview
    const flashcards = [
        { term: 'Cell membrane', definition: 'The semipermeable barrier that surrounds and protects the cell' },
        { term: 'Mitochondria', definition: 'The powerhouse of the cell that produces ATP through cellular respiration' },
        { term: 'Nucleus', definition: 'Contains genetic material (DNA) and controls all cell activities' },
        { term: 'Ribosomes', definition: 'Sites of protein synthesis in the cell' },
        { term: 'Endoplasmic Reticulum', definition: 'Network of membranes for protein and lipid synthesis' }
    ];
    
    let html = '<div class="study-set-cards">';
    
    studySets.forEach((set, index) => {
        const isExpanded = set.expanded || false;
        
        html += `
            <div class="study-set-card ${isExpanded ? 'expanded' : ''}" data-set-id="${set.id}">
                <div class="study-set-header">
                    <div class="study-set-pills-header">
                        <span class="study-set-pill body-3">Option ${index + 1}</span>
                        ${set.isTopPick ? '<span class="study-set-pill top-pick body-3">Top pick</span>' : ''}
                    </div>
                    <div class="study-set-info">
                        <h3 class="study-set-title ${isExpanded ? 'subheading-2' : 'subheading-3'}">${set.title}</h3>
                        <p class="study-set-meta body-3">${set.termCount} terms</p>
                    </div>
                </div>
                
                ${isExpanded ? `
                    <div class="flashcard-preview">
                        <div class="flashcard-stack">
                            ${flashcards.map((card, cardIndex) => `
                                <div class="flashcard ${cardIndex === 0 ? 'active' : ''}" data-card-index="${cardIndex}">
                                    <div class="flashcard-inner">
                                        <div class="flashcard-front">
                                            <span class="heading-3">${card.term}</span>
                                        </div>
                                        <div class="flashcard-back">
                                            <span class="body-3">${card.definition}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="flashcard-dots">
                            ${flashcards.map((_, dotIndex) => `
                                <span class="flashcard-dot ${dotIndex === 0 ? 'active' : ''}" data-dot-index="${dotIndex}"></span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="study-set-preview-actions">
                        <button class="preview-action-btn primary body-3" data-action="launch">
                            <span>Launch flashcards</span>
                            <span class="material-icons-round">arrow_downward</span>
                        </button>
                        <button class="preview-action-btn secondary body-3" data-action="other-sets">
                            <span>Show me other sets</span>
                            <span class="material-icons-round">refresh</span>
                        </button>
                    </div>
                ` : `
                    <div class="study-set-actions">
                        <button class="study-set-preview-btn body-3" data-set-id="${set.id}">
                            Preview
                        </button>
                    </div>
                `}
            </div>
        `;
    });
    
    html += '</div>';
    
    // Add event listeners after rendering
    setTimeout(() => {
        attachStudySetListeners();
        initializeFlashcards();
    }, 100);
    
    return html;
}

/**
 * Attach event listeners to study set cards
 */
function attachStudySetListeners() {
    // Preview buttons
    const previewButtons = document.querySelectorAll('.study-set-preview-btn');
    previewButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click
            const setId = this.getAttribute('data-set-id');
            handleStudySetPreview(setId);
        });
    });
}

/**
 * Handle study set preview
 */
function handleStudySetPreview(setId) {
    console.log('Preview study set:', setId);
    
    // Find the card element
    const card = document.querySelector(`.study-set-card[data-set-id="${setId}"]`);
    if (!card) return;
    
    // Get card data
    const title = card.querySelector('.study-set-title').textContent;
    const termCount = card.querySelector('.study-set-meta').textContent;
    const pillsHeader = card.querySelector('.study-set-pills-header').cloneNode(true);
    
    // Mock flashcard data for expanded preview
    const flashcards = [
        { term: 'Cell membrane', definition: 'The semipermeable barrier that surrounds and protects the cell' },
        { term: 'Mitochondria', definition: 'The powerhouse of the cell that produces ATP through cellular respiration' },
        { term: 'Nucleus', definition: 'Contains genetic material (DNA) and controls all cell activities' },
        { term: 'Ribosomes', definition: 'Sites of protein synthesis in the cell' },
        { term: 'Endoplasmic Reticulum', definition: 'Network of membranes for protein and lipid synthesis' }
    ];
    
    // Build expanded card HTML
    const expandedHTML = `
        <div class="study-set-header">
            <div class="study-set-pills-header">
                ${pillsHeader.innerHTML}
            </div>
            <div class="study-set-info">
                <h3 class="study-set-title subheading-2">${title}</h3>
                <p class="study-set-meta body-3">${termCount}</p>
            </div>
        </div>
        
        <div class="flashcard-preview">
            <div class="flashcard-stack">
                ${flashcards.map((flashcard, cardIndex) => `
                    <div class="flashcard ${cardIndex === 0 ? 'active' : ''}" data-card-index="${cardIndex}">
                        <div class="flashcard-inner">
                            <div class="flashcard-front">
                                <span class="heading-3">${flashcard.term}</span>
                            </div>
                            <div class="flashcard-back">
                                <span class="body-3">${flashcard.definition}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="flashcard-dots">
                ${flashcards.map((_, dotIndex) => `
                    <span class="flashcard-dot ${dotIndex === 0 ? 'active' : ''}" data-dot-index="${dotIndex}"></span>
                `).join('')}
            </div>
        </div>
        
        <div class="study-set-preview-actions">
            <button class="preview-action-btn primary body-3" data-action="launch">
                <span>Launch flashcards</span>
                <span class="material-icons-round">arrow_downward</span>
            </button>
            <button class="preview-action-btn secondary body-3" data-action="other-sets">
                <span>Show me other sets</span>
                <span class="material-icons-round">refresh</span>
            </button>
        </div>
    `;
    
    // Replace card content
    card.innerHTML = expandedHTML;
    card.classList.add('expanded');
    
    // Re-initialize flashcard interactions for this card
    setTimeout(() => {
        initializeFlashcards();
    }, 100);
}

/**
 * Handle study set selection
 */
function handleStudySetSelect(setId) {
    console.log('Selected study set:', setId);
    // Card clicks no longer do anything by default
    // This function can be used for future functionality if needed
}

/**
 * Initialize flashcard interactions (swipe, flip, navigation)
 */
function initializeFlashcards() {
    const flashcardStacks = document.querySelectorAll('.flashcard-stack');
    
    flashcardStacks.forEach(stack => {
        const cards = stack.querySelectorAll('.flashcard');
        const dots = stack.parentElement.querySelectorAll('.flashcard-dot');
        let currentIndex = 0;
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let isDragging = false;
        let isFlipped = false;
        let isSwiping = false;
        
        if (cards.length === 0) return;
        
        let activeCard = cards[currentIndex];
        
        // Tap to flip
        function handleTap(e) {
            if (!isDragging && !isSwiping) {
                isFlipped = !isFlipped;
                activeCard.classList.toggle('flipped', isFlipped);
            }
        }
        
        activeCard.addEventListener('click', handleTap);
        
        // Touch events
        activeCard.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            currentX = startX;
            isDragging = false;
            isSwiping = false;
            activeCard.style.transition = 'none';
        });
        
        activeCard.addEventListener('touchmove', function(e) {
            currentX = e.touches[0].clientX;
            const deltaX = currentX - startX;
            const deltaY = e.touches[0].clientY - startY;
            
            if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
                isDragging = true;
            }
            
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
                isSwiping = true;
                e.preventDefault();
                
                // Apply drag transform
                const rotation = deltaX * 0.05; // Slight rotation
                const opacity = 1 - Math.abs(deltaX) / 400;
                activeCard.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
                activeCard.style.opacity = Math.max(opacity, 0.5);
            }
        });
        
        activeCard.addEventListener('touchend', function(e) {
            if (!isSwiping) {
                isDragging = false;
                return;
            }
            
            const deltaX = currentX - startX;
            const threshold = 100;
            
            if (Math.abs(deltaX) > threshold) {
                // Swipe detected - animate card away
                const direction = deltaX > 0 ? 1 : -1;
                animateCardAway(direction);
            } else {
                // Reset card position
                activeCard.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                activeCard.style.transform = '';
                activeCard.style.opacity = '';
            }
            
            setTimeout(() => {
                isDragging = false;
                isSwiping = false;
            }, 100);
        });
        
        // Mouse events for desktop
        activeCard.addEventListener('mousedown', function(e) {
            startX = e.clientX;
            startY = e.clientY;
            currentX = startX;
            isDragging = false;
            isSwiping = false;
            activeCard.style.transition = 'none';
            
            const handleMouseMove = function(e) {
                currentX = e.clientX;
                const deltaX = currentX - startX;
                const deltaY = e.clientY - startY;
                
                if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
                    isDragging = true;
                }
                
                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
                    isSwiping = true;
                    
                    // Apply drag transform
                    const rotation = deltaX * 0.05;
                    const opacity = 1 - Math.abs(deltaX) / 400;
                    activeCard.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
                    activeCard.style.opacity = Math.max(opacity, 0.5);
                }
            };
            
            const handleMouseUp = function(e) {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                
                if (!isSwiping) {
                    isDragging = false;
                    return;
                }
                
                const deltaX = currentX - startX;
                const threshold = 100;
                
                if (Math.abs(deltaX) > threshold) {
                    // Swipe detected - animate card away
                    const direction = deltaX > 0 ? 1 : -1;
                    animateCardAway(direction);
                } else {
                    // Reset card position
                    activeCard.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    activeCard.style.transform = '';
                    activeCard.style.opacity = '';
                }
                
                setTimeout(() => {
                    isDragging = false;
                    isSwiping = false;
                }, 100);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });
        
        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                navigateToCard(index);
            });
        });
        
        function animateCardAway(direction) {
            // Animate card off screen
            activeCard.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            activeCard.style.transform = `translateX(${direction * 800}px) translateY(100px) rotate(${direction * 30}deg)`;
            activeCard.style.opacity = '0';
            
            // Calculate next index
            let newIndex;
            if (direction < 0 && currentIndex < cards.length - 1) {
                // Swiped left - go to next
                newIndex = currentIndex + 1;
            } else if (direction > 0 && currentIndex > 0) {
                // Swiped right - go to previous
                newIndex = currentIndex - 1;
            } else {
                // Can't swipe in this direction, reset
                setTimeout(() => {
                    activeCard.style.transform = '';
                    activeCard.style.opacity = '';
                }, 400);
                return;
            }
            
            // After animation, reset and navigate
            setTimeout(() => {
                navigateToCard(newIndex);
                activeCard.style.transition = '';
                activeCard.style.transform = '';
                activeCard.style.opacity = '';
            }, 400);
        }
        
        function navigateToCard(newIndex) {
            // Remove active from current card
            cards[currentIndex].classList.remove('active', 'flipped');
            cards[currentIndex].removeEventListener('click', handleTap);
            dots[currentIndex].classList.remove('active');
            
            // Add active to new card
            currentIndex = newIndex;
            activeCard = cards[currentIndex];
            activeCard.classList.add('active');
            dots[currentIndex].classList.add('active');
            isFlipped = false;
            
            // Reset styles
            activeCard.style.transition = '';
            activeCard.style.transform = '';
            activeCard.style.opacity = '';
            
            // Re-attach click listener to new active card
            activeCard.addEventListener('click', handleTap);
        }
    });
    
    // Preview action buttons
    const actionButtons = document.querySelectorAll('.preview-action-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            handlePreviewAction(action);
        });
    });
}

/**
 * Handle preview action buttons
 */
function handlePreviewAction(action) {
    console.log('Preview action:', action);
    
    if (action === 'launch') {
        // Navigate to study page with flashcards-only mode
        window.location.href = '../html/study.html?mode=flashcards-only';
    } else if (action === 'other-sets') {
        addMessageToChat('user', 'Show me other sets');
        sendMessageToAI('Show me other study sets for this topic');
    }
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message assistant';
    typingDiv.id = 'typingIndicator';
    
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'typing-indicator';
    indicatorDiv.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    
    typingDiv.appendChild(indicatorDiv);
    chatMessages.appendChild(typingDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Remove typing indicator
 */
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

/**
 * Send message to AI and handle response
 */
async function sendMessageToAI(message) {
    isWaitingForResponse = true;
    showTypingIndicator();
    
    try {
        console.log('Sending message to AI:', message);
        console.log('API URL:', `${API_BASE_URL}/api/ai-coach`);
        
        // Call your backend API endpoint that connects to the custom GPT
        const response = await fetch(`${API_BASE_URL}/api/ai-coach`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                history: chatHistory.filter(item => item.role !== 'error') // Don't send error messages to API
            })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error:', errorData);
            throw new Error(errorData.error || `API returned status ${response.status}`);
        }
        
        const data = await response.json();
        console.log('AI Response received:', data);
        
        removeTypingIndicator();
        addMessageToChat('assistant', data.response);
        
    } catch (error) {
        console.error('Error communicating with AI Coach:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        removeTypingIndicator();
        
        // Show more helpful error message
        let errorMessage = 'Sorry, I encountered an error. ';
        
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            errorMessage += 'Make sure the backend server is running on ' + API_BASE_URL;
        } else {
            errorMessage += error.message || 'Please try again.';
        }
        
        addMessageToChat('assistant', errorMessage);
        
        // Mark this as an error message in history
        if (chatHistory.length > 0) {
            chatHistory[chatHistory.length - 1].role = 'error';
        }
    } finally {
        isWaitingForResponse = false;
    }
}

/**
 * Handle add button click (for adding attachments or additional context)
 */
function handleAddClick() {
    console.log('Add button clicked');
    // Could open file picker for uploading study materials
    // Or show options to add from library
}

/**
 * Utility function to show a temporary message
 */
function showMessage(message, duration = 3000) {
    // Create a toast or snackbar notification
    const messageEl = document.createElement('div');
    messageEl.className = 'toast-message';
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(40, 46, 62, 0.9);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 1000;
        animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(messageEl);
        }, 300);
    }, duration);
}

