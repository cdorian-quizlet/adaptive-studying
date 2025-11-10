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
let currentAttachment = null; // Store current file attachment

document.addEventListener('DOMContentLoaded', function() {
    initializeAiCoach();
});

function initializeAiCoach() {
    // Get DOM elements
    const menuButton = document.getElementById('menuButton');
    const closeButton = document.getElementById('closeButton');
    const studyOptions = document.querySelectorAll('.ai-coach-option');
    const studyQuestionInput = document.getElementById('studyQuestionInput');
    const submitButton = document.getElementById('submitButton');
    const addButton = document.getElementById('addButton');
    const menuSheet = document.getElementById('menuSheet');
    const closeMenuSheet = document.getElementById('closeMenuSheet');
    const newConversationBtn = document.getElementById('newConversation');
    const clearHistoryBtn = document.getElementById('clearHistory');

    // Menu button handler - opens menu sheet
    if (menuButton) {
        menuButton.addEventListener('click', handleMenuClick);
    }

    // Close button handler - navigates back to home
    if (closeButton) {
        closeButton.addEventListener('click', handleCloseClick);
    }

    // Menu sheet handlers
    if (closeMenuSheet) {
        closeMenuSheet.addEventListener('click', hideMenuSheet);
    }

    if (newConversationBtn) {
        newConversationBtn.addEventListener('click', function() {
            if (chatHistory.length > 0) {
                if (confirm('Start a new conversation? Your current chat will be cleared.')) {
                    resetToInitialView();
                    hideMenuSheet();
                }
            } else {
                hideMenuSheet();
            }
        });
    }

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function() {
            if (chatHistory.length > 0) {
                if (confirm('Clear all chat history?')) {
                    resetToInitialView();
                    hideMenuSheet();
                    showMessage('Chat history cleared');
                }
            } else {
                hideMenuSheet();
                showMessage('No chat history to clear');
            }
        });
    }

    // Close menu sheet when clicking outside
    if (menuSheet) {
        menuSheet.addEventListener('click', function(e) {
            if (e.target === menuSheet) {
                hideMenuSheet();
            }
        });
    }
    
    // Report sheet handlers
    const reportSheet = document.getElementById('reportSheet');
    const closeReportSheet = document.getElementById('closeReportSheet');
    const submitReport = document.getElementById('submitReport');
    
    if (closeReportSheet) {
        closeReportSheet.addEventListener('click', hideReportSheet);
    }
    
    if (reportSheet) {
        reportSheet.addEventListener('click', function(e) {
            if (e.target === reportSheet) {
                hideReportSheet();
            }
        });
    }
    
    if (submitReport) {
        submitReport.addEventListener('click', handleSubmitReport);
    }
    
    // Enable/disable submit button based on selection
    const reportOptions = document.querySelectorAll('input[name="report-reason"]');
    reportOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (submitReport) {
                submitReport.disabled = false;
            }
        });
    });

    // Upload sheet handlers
    const uploadSheet = document.getElementById('uploadSheet');
    const closeUploadSheet = document.getElementById('closeUploadSheet');
    const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const photoInput = document.getElementById('photoInput');
    const fileInput = document.getElementById('fileInput');
    
    if (closeUploadSheet) {
        closeUploadSheet.addEventListener('click', hideUploadSheet);
    }
    
    if (uploadSheet) {
        uploadSheet.addEventListener('click', function(e) {
            if (e.target === uploadSheet) {
                hideUploadSheet();
            }
        });
    }
    
    if (uploadPhotoBtn) {
        uploadPhotoBtn.addEventListener('click', function() {
            photoInput.click();
            hideUploadSheet();
        });
    }
    
    if (selectFileBtn) {
        selectFileBtn.addEventListener('click', function() {
            fileInput.click();
            hideUploadSheet();
        });
    }
    
    if (photoInput) {
        photoInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                handleFileSelected(e.target.files[0], 'image');
            }
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                handleFileSelected(e.target.files[0], 'document');
            }
        });
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
        // Handle Enter key (submit) and Shift+Enter (new line)
        studyQuestionInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey && this.value.trim()) {
                e.preventDefault();
                handleSubmitQuestion();
            }
        });

        // Auto-resize textarea as user types
        studyQuestionInput.addEventListener('input', function() {
            autoResizeTextarea(this);
            
            // Update submit button state based on input value
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
 * Handle menu button click - opens menu sheet
 */
function handleMenuClick() {
    console.log('Menu clicked - opening menu sheet');
    showMenuSheet();
}

/**
 * Handle close button click - navigates back to home
 */
function handleCloseClick() {
    console.log('Close clicked - navigating back to home');
    
    // Add fade out animation before going back
    document.body.classList.add('page-fade-out');
    
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 250);
}

/**
 * Show menu sheet
 */
function showMenuSheet() {
    const menuSheet = document.getElementById('menuSheet');
    if (menuSheet) {
        menuSheet.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Hide menu sheet
 */
function hideMenuSheet() {
    const menuSheet = document.getElementById('menuSheet');
    if (menuSheet) {
        menuSheet.classList.remove('show');
        document.body.style.overflow = '';
    }
}

/**
 * Show report sheet
 */
function showReportSheet() {
    const reportSheet = document.getElementById('reportSheet');
    if (reportSheet) {
        reportSheet.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Reset form
        const reportOptions = document.querySelectorAll('input[name="report-reason"]');
        reportOptions.forEach(option => option.checked = false);
        
        const submitButton = document.getElementById('submitReport');
        if (submitButton) {
            submitButton.disabled = true;
        }
    }
}

/**
 * Hide report sheet
 */
function hideReportSheet() {
    const reportSheet = document.getElementById('reportSheet');
    if (reportSheet) {
        reportSheet.classList.remove('show');
        document.body.style.overflow = '';
    }
}

/**
 * Show upload sheet
 */
function showUploadSheet() {
    const uploadSheet = document.getElementById('uploadSheet');
    if (uploadSheet) {
        uploadSheet.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Hide upload sheet
 */
function hideUploadSheet() {
    const uploadSheet = document.getElementById('uploadSheet');
    if (uploadSheet) {
        uploadSheet.classList.remove('show');
        document.body.style.overflow = '';
    }
}

/**
 * Handle report submission
 */
function handleSubmitReport() {
    const selectedReason = document.querySelector('input[name="report-reason"]:checked');
    if (!selectedReason) return;
    
    const reason = selectedReason.value;
    console.log('Report submitted:', reason);
    
    // Show success message
    showMessage('Thank you for your feedback');
    
    // Close the report sheet
    hideReportSheet();
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
 * Auto-resize textarea based on content
 */
function autoResizeTextarea(textarea) {
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate new height
    const newHeight = Math.min(textarea.scrollHeight, 120); // max-height: 120px
    textarea.style.height = newHeight + 'px';
    
    // Add scrollable class if content exceeds max height
    if (textarea.scrollHeight > 120) {
        textarea.classList.add('scrollable');
    } else {
        textarea.classList.remove('scrollable');
    }
}

/**
 * Handle submit question
 */
function handleSubmitQuestion() {
    const input = document.getElementById('studyQuestionInput');
    const question = input.value.trim();
    
    // Allow submission if there's a question OR an attachment
    if ((!question && !currentAttachment) || isWaitingForResponse) {
        return;
    }
    
    console.log('Submitting to AI Coach:', question, currentAttachment ? `with ${currentAttachment.type}` : '');
    
    // Prepare message content
    let messageContent = question || '';
    let displayMessage = question || '';
    
    if (currentAttachment) {
        // If only file without message, use a default message for the API
        if (!messageContent) {
            messageContent = 'Create flashcards from my notes';
        }
        // For display, show just the filename
        displayMessage = displayMessage ? `${displayMessage}\n\n${currentAttachment.name}` : currentAttachment.name;
    }
    
    // Store the attachment for sending
    const attachmentToSend = currentAttachment;
    
    // Clear the input immediately and reset height
    input.value = '';
    input.style.height = 'auto';
    input.classList.remove('scrollable');
    
    // Clear attachment preview
    removeAttachment();
    
    // Update submit button state after clearing everything
    updateSubmitButtonState();
    
    // Switch to chat view if not already there
    switchToChatView();
    
    // Add user message to chat (use display message)
    addMessageToChat('user', displayMessage);
    
    // Send to AI and get response (use message content for API)
    sendMessageToAI(messageContent, attachmentToSend);
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
function addMessageToChat(role, content, reuseTypingIndicator = false, animate = false) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    let messageDiv;
    
    // For assistant messages, try to reuse the typing indicator
    if (role === 'assistant' && reuseTypingIndicator) {
        messageDiv = removeTypingIndicator(true);
    }
    
    // Create new message div if we didn't reuse typing indicator
    if (!messageDiv) {
        messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
        
        // Add sparkle icon for assistant messages
        if (role === 'assistant') {
            const iconDiv = document.createElement('div');
            iconDiv.className = 'message-icon';
            const iconImg = document.createElement('img');
            iconImg.src = '../images/brand-sparkle.png';
            iconImg.alt = '';
            iconImg.setAttribute('aria-hidden', 'true');
            iconDiv.appendChild(iconImg);
            messageDiv.appendChild(iconDiv);
        }
    }
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    
    // Format the content for assistant messages
    if (role === 'assistant') {
        if (animate) {
            // Apply typing animation for assistant messages
            const formattedContent = formatMessageContent(content);
            bubbleDiv.innerHTML = ''; // Start empty
            messageDiv.appendChild(bubbleDiv);
            
            // Only append if we created a new element (not reused)
            if (!reuseTypingIndicator) {
                chatMessages.appendChild(messageDiv);
            }
            
            // Animate the content
            animateMessageContent(bubbleDiv, formattedContent);
        } else {
        bubbleDiv.innerHTML = formatMessageContent(content);
            messageDiv.appendChild(bubbleDiv);
            
            // Only append if we created a new element (not reused)
            if (!reuseTypingIndicator) {
                chatMessages.appendChild(messageDiv);
            }
        }
        
        // Add feedback buttons for assistant messages
        const feedbackDiv = createFeedbackButtons();
        messageDiv.appendChild(feedbackDiv);
    } else {
        bubbleDiv.className = 'message-bubble subheading-3';
        bubbleDiv.textContent = content;
    messageDiv.appendChild(bubbleDiv);
        
        // Only append if we created a new element (not reused)
        if (!reuseTypingIndicator) {
    chatMessages.appendChild(messageDiv);
        }
    }
    
    // Scroll to bottom - use setTimeout to ensure DOM is updated
    setTimeout(() => {
        const chatContainer = document.getElementById('chatView');
        if (chatContainer && chatContainer.style.display !== 'none') {
    chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }, 50);
    
    // Store in history
    chatHistory.push({ role, content });
}

/**
 * Create feedback buttons for AI messages
 */
function createFeedbackButtons() {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'message-feedback';
    
    // Thumbs up button
    const thumbsUpBtn = document.createElement('button');
    thumbsUpBtn.className = 'feedback-button thumbs-up-btn';
    thumbsUpBtn.setAttribute('aria-label', 'Thumbs up');
    const thumbsUpImg = document.createElement('img');
    thumbsUpImg.src = '../images/thumb-up.png';
    thumbsUpImg.alt = '';
    thumbsUpImg.setAttribute('aria-hidden', 'true');
    thumbsUpBtn.appendChild(thumbsUpImg);
    thumbsUpBtn.addEventListener('click', function() {
        handleThumbsUp(this);
    });
    
    // Thumbs down button
    const thumbsDownBtn = document.createElement('button');
    thumbsDownBtn.className = 'feedback-button thumbs-down-btn';
    thumbsDownBtn.setAttribute('aria-label', 'Thumbs down');
    const thumbsDownImg = document.createElement('img');
    thumbsDownImg.src = '../images/thumb-down.png';
    thumbsDownImg.alt = '';
    thumbsDownImg.setAttribute('aria-hidden', 'true');
    thumbsDownBtn.appendChild(thumbsDownImg);
    thumbsDownBtn.addEventListener('click', function() {
        handleThumbsDown(this);
    });
    
    // Flag button
    const flagBtn = document.createElement('button');
    flagBtn.className = 'feedback-button flag-btn';
    flagBtn.setAttribute('aria-label', 'Report message');
    const flagImg = document.createElement('img');
    flagImg.src = '../images/flag.png';
    flagImg.alt = '';
    flagImg.setAttribute('aria-hidden', 'true');
    flagBtn.appendChild(flagImg);
    flagBtn.addEventListener('click', function() {
        handleFlag(this);
    });
    
    feedbackDiv.appendChild(thumbsUpBtn);
    feedbackDiv.appendChild(thumbsDownBtn);
    feedbackDiv.appendChild(flagBtn);
    
    return feedbackDiv;
}

/**
 * Handle thumbs up feedback
 */
function handleThumbsUp(button) {
    const img = button.querySelector('img');
    const isActive = button.classList.contains('active');
    
    // Get thumbs down button in the same feedback group
    const feedbackDiv = button.parentElement;
    const thumbsDownBtn = feedbackDiv.querySelector('.thumbs-down-btn');
    
    if (isActive) {
        // Toggle off
        button.classList.remove('active');
        img.src = '../images/thumb-up.png';
    } else {
        // Toggle on
        button.classList.add('active');
        img.src = '../images/thumb-up-filled.png';
        
        // Turn off thumbs down if it's active
        if (thumbsDownBtn && thumbsDownBtn.classList.contains('active')) {
            thumbsDownBtn.classList.remove('active');
            thumbsDownBtn.querySelector('img').src = '../images/thumb-down.png';
        }
    }
    
    console.log('Thumbs up:', !isActive);
}

/**
 * Handle thumbs down feedback
 */
function handleThumbsDown(button) {
    const img = button.querySelector('img');
    const isActive = button.classList.contains('active');
    
    // Get thumbs up button in the same feedback group
    const feedbackDiv = button.parentElement;
    const thumbsUpBtn = feedbackDiv.querySelector('.thumbs-up-btn');
    
    if (isActive) {
        // Toggle off
        button.classList.remove('active');
        img.src = '../images/thumb-down.png';
    } else {
        // Toggle on
        button.classList.add('active');
        img.src = '../images/thumb-down-filled.png';
        
        // Turn off thumbs up if it's active
        if (thumbsUpBtn && thumbsUpBtn.classList.contains('active')) {
            thumbsUpBtn.classList.remove('active');
            thumbsUpBtn.querySelector('img').src = '../images/thumb-up.png';
        }
    }
    
    console.log('Thumbs down:', !isActive);
}

/**
 * Handle flag/report feedback
 */
function handleFlag(button) {
    const img = button.querySelector('img');
    const isActive = button.classList.contains('active');
    
    if (isActive) {
        // Toggle off
        button.classList.remove('active');
        img.src = '../images/flag.png';
    } else {
        // Toggle on
        button.classList.add('active');
        img.src = '../images/flag-filled.png';
        
        // Open report sheet
        showReportSheet();
    }
    
    console.log('Flag toggled:', !isActive);
}

/**
 * Animate message content with typing effect
 */
function animateMessageContent(container, htmlContent) {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Start with empty container
    container.innerHTML = '';
    
    // Check if content contains large UI elements (study cards)
    const hasLargeUI = htmlContent.includes('study-set-cards-new') || 
                       htmlContent.includes('flashcard-draft-card');
    
    if (hasLargeUI) {
        // For large UI, show text first with typing, then fade in UI
        const textNodes = [];
        const uiNodes = [];
        
        Array.from(tempDiv.childNodes).forEach(node => {
            if (node.classList && (
                node.classList.contains('study-set-cards-new') ||
                node.classList.contains('study-set-cards')
            )) {
                uiNodes.push(node);
            } else {
                textNodes.push(node);
            }
        });
        
        // Type text content first
        if (textNodes.length > 0) {
            typeNodes(container, textNodes, 0, () => {
                // After text is done, fade in UI elements
                let completedNodes = 0;
                const totalNodes = uiNodes.length;
                
                uiNodes.forEach((node, index) => {
                    setTimeout(() => {
                        node.classList.add('ui-fade-in');
                        container.appendChild(node);
                        
                        // Scroll to show the new content
                        const chatMessages = document.getElementById('chatMessages');
                        if (chatMessages) {
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                        }
                        
                        // After all nodes are inserted, attach listeners
                        completedNodes++;
                        if (completedNodes === totalNodes) {
                            setTimeout(() => {
                                console.log('All UI nodes inserted, attaching listeners...');
                                attachStudySetListeners();
                                attachFlashcardDraftListeners();
                                initializeFlashcardsNew();
                                console.log('Listeners attached after animation');
                            }, 400); // Wait for animation to complete
                        }
                    }, index * 100);
                });
            });
        } else {
            // Just UI, fade it in
            let completedNodes = 0;
            const totalNodes = uiNodes.length;
            
            uiNodes.forEach((node, index) => {
                setTimeout(() => {
                    node.classList.add('ui-fade-in');
                    container.appendChild(node);
                    
                    // After all nodes are inserted, attach listeners
                    completedNodes++;
                    if (completedNodes === totalNodes) {
                        setTimeout(() => {
                            console.log('All UI nodes inserted, attaching listeners...');
                            attachStudySetListeners();
                            attachFlashcardDraftListeners();
                            initializeFlashcardsNew();
                            console.log('Listeners attached after animation');
                        }, 400); // Wait for animation to complete
                    }
                }, index * 100);
            });
        }
    } else {
        // Regular text content - type it all
        typeNodes(container, Array.from(tempDiv.childNodes), 0);
    }
}

/**
 * Type nodes character by character
 */
function typeNodes(container, nodes, nodeIndex, onComplete) {
    if (nodeIndex >= nodes.length) {
        if (onComplete) onComplete();
        return;
    }
    
    const node = nodes[nodeIndex];
    
    if (node.nodeType === Node.TEXT_NODE) {
        // Type text content
        const text = node.textContent;
        const textSpan = document.createTextNode('');
        container.appendChild(textSpan);
        
        typeText(textSpan, text, 0, () => {
            typeNodes(container, nodes, nodeIndex + 1, onComplete);
        });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Clone the element and append it
        const clonedNode = node.cloneNode(false);
        container.appendChild(clonedNode);
        
        // Type its children
        typeNodes(clonedNode, Array.from(node.childNodes), 0, () => {
            typeNodes(container, nodes, nodeIndex + 1, onComplete);
        });
    } else {
        // Other node types, just append
        container.appendChild(node.cloneNode(true));
        typeNodes(container, nodes, nodeIndex + 1, onComplete);
    }
}

/**
 * Type text character by character
 */
function typeText(textNode, text, charIndex, onComplete) {
    if (charIndex >= text.length) {
        if (onComplete) onComplete();
        return;
    }
    
    // Type 2-3 characters at a time for speed (like ChatGPT)
    const charsToAdd = Math.min(2 + Math.floor(Math.random()), text.length - charIndex);
    textNode.textContent = text.substring(0, charIndex + charsToAdd);
    
    // Scroll to keep the message visible
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Continue typing (very fast - 10ms delay)
    setTimeout(() => {
        typeText(textNode, text, charIndex + charsToAdd, onComplete);
    }, 10);
}

/**
 * Format message content with markdown-like syntax
 */
function formatMessageContent(text) {
    // Store the original text for study set data extraction
    const originalText = text;
    
    // Remove [STUDY_SETS_DATA] JSON blocks from display text
    text = text.replace(/\[STUDY_SETS_DATA\][\s\S]*?\[\/STUDY_SETS_DATA\]/g, '').trim();
    
    // Escape HTML first
    text = text.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');
    
    // Convert **bold** to <span class="semibold-3">
    text = text.replace(/\*\*(.+?)\*\*/g, '<span class="semibold-3">$1</span>');
    
    // Convert *italic* to <em>
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Check if we should generate study sets (only once per message)
    let studySetsGenerated = false;
    
    // Split by double newlines for paragraphs
    const paragraphs = text.split('\n\n');
    
    const formattedParagraphs = paragraphs.map(para => {
        // Check if paragraph contains bullet points or numbered lists
        const lines = para.split('\n');
        
        // Check for study set results pattern - either old format or new JSON format
        // Check in originalText for the JSON data marker
        // IMPORTANT: Only generate once per message
        if (!studySetsGenerated && (lines.some(line => /\[Set Results UI.*?\]/.test(line) || /\[Preview button\]/.test(line)) || 
            /\[STUDY_SETS_DATA\]/.test(originalText))) {
            studySetsGenerated = true; // Mark as generated to prevent duplicates
            
            // Detect if this is test/quiz mode by looking at the surrounding text
            const isTestMode = /quiz|test|practice|assess/i.test(originalText);
            
            // Try to extract JSON data if present (check originalText, not cleaned text)
            const jsonMatch = originalText.match(/\[STUDY_SETS_DATA\]([\s\S]*?)\[\/STUDY_SETS_DATA\]/);
            if (jsonMatch) {
                try {
                    const jsonData = JSON.parse(jsonMatch[1].trim());
                    console.log('Parsed study sets data:', jsonData.studySets.length, 'total sets');
                    
                    // Show first 3 sets, store all sets for pagination
                    return generateStudySetCards(isTestMode, jsonData.studySets, 0);
                } catch (e) {
                    console.error('Failed to parse study sets JSON:', e);
                    // Fall back to mock data
                    return generateStudySetCards(isTestMode);
                }
            }
            
            // If no JSON found, use mock data
            return generateStudySetCards(isTestMode);
        }
        
        // Check for flashcard set draft link pattern (e.g., "🔗 [Open Flashcard Set Draft...]")
        // Also check for plain text version without emoji
        if (/🔗\s*\[Open Flashcard Set Draft/i.test(para) || /\[Open Flashcard Set Draft.*?\]\(#\)/i.test(para)) {
            console.log('Detected flashcard draft pattern:', para);
            return generateFlashcardDraftCard(para);
        }
        
        // Check for Step headers (e.g., "Step 1: ...", "Step 2: ...")
        if (/^Step\s+\d+:/i.test(para.trim())) {
            return `<div class="step-header">${para.trim()}</div>`;
        }
        
        // Check for math equations (lines that look like equations)
        if (/^[\d\s+\-*/=().,×÷]+$/.test(para.trim()) && para.trim().length > 3) {
            return `<div class="math-block">${para.trim()}</div>`;
        }
        
        // Check for success text (starts with ✓ or "So!" or "Final answer")
        if (/^(✓|So!|Final [Aa]nswer)/i.test(para.trim())) {
            if (/^(✓\s*)?Final [Aa]nswer/i.test(para.trim())) {
                const content = para.replace(/^(✓\s*)?Final [Aa]nswer:?\s*/i, '');
                return `<div class="final-answer"><span class="final-answer-label">Final Answer</span>${content}</div>`;
            }
            return `<p class="success-text body-3">${para.replace(/^✓\s*/, '')}</p>`;
        }
        
        // Check for bullet points (-, *, •)
        if (lines.some(line => /^[\s]*[-*•]\s/.test(line))) {
            const listItems = lines
                .filter(line => /^[\s]*[-*•]\s/.test(line))
                .map(line => {
                    const content = line.replace(/^[\s]*[-*•]\s+/, '');
                    // Check if list item is a success indicator
                    if (/^(✓|So!)/i.test(content)) {
                        return `<li class="success-text body-3">${content.replace(/^✓\s*/, '')}</li>`;
                    }
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
        
        // Check if paragraph contains inline math (with multiplication, division, etc.)
        if (/[0-9]+\s*[×÷+\-*/]\s*[0-9]+/.test(para)) {
            return `<div class="math-block">${para.trim()}</div>`;
        }
        
        // Regular paragraph - convert single newlines to <br>
        return `<p class="body-3">${para.replace(/\n/g, '<br>')}</p>`;
    });
    
    return formattedParagraphs.join('');
}

/**
 * Generate a flashcard draft card for creation flow
 */
function generateFlashcardDraftCard(text) {
    // Extract the topic/title from the link text
    // Try multiple patterns to extract the topic
    let topic = 'Your Topic';
    
    // Pattern 1: [Open Flashcard Set Draft for Topic](#)
    let match = text.match(/\[Open Flashcard Set Draft\s+for\s+([^\]]+)\]/i);
    if (match) {
        topic = match[1].trim();
    } else {
        // Pattern 2: [Open Flashcard Set Draft - Topic](#)
        match = text.match(/\[Open Flashcard Set Draft\s*[-–]\s*([^\]]+)\]/i);
        if (match) {
            topic = match[1].trim();
        } else {
            // Pattern 3: Just [Open Flashcard Set Draft](#)
            match = text.match(/\[Open Flashcard Set Draft([^\]]*)\]/i);
            if (match && match[1].trim()) {
                topic = match[1].trim();
            }
        }
    }
    
    // Clean up the topic (remove any trailing (#) or whitespace)
    topic = topic.replace(/\(#\)\s*$/, '').trim();
    
    // Generate ONLY 1 draft card - expanded with flashcard preview
    const draftSets = [
        {
            id: 'draft-1',
            title: topic,
            termCount: 20,
            expanded: true
        }
    ];
    
    // Mock flashcard data for expanded preview
    const flashcards = [
        { term: 'Sample Term 1', definition: 'This is an example definition that would be generated from your study materials' },
        { term: 'Sample Term 2', definition: 'Another example definition showing how your flashcards will look' },
        { term: 'Sample Term 3', definition: 'A third example to demonstrate the flashcard format' },
        { term: 'Sample Term 4', definition: 'Additional example content for your study set' },
        { term: 'Sample Term 5', definition: 'Final example showing the flashcard structure' }
    ];
    
    let html = '<div class="study-set-cards-new">';
    
    draftSets.forEach((set, index) => {
        const isExpanded = set.expanded;
        
        html += `
            <div class="study-set-card-new flashcard-draft-card-new ${isExpanded ? 'expanded' : ''}" data-set-id="${set.id}">
                <div class="study-set-content">
                    <div class="study-set-top">
                        <div class="study-set-text">
                            <h3 class="study-set-title-new subheading-3">${set.title}</h3>
                            <div class="study-set-pills-new">
                                <span class="study-set-pill-new gray subheading-5">${set.termCount} cards</span>
                            </div>
                        </div>
                    </div>
                    
                    ${isExpanded ? `
                        <div class="flashcard-preview-new">
                            <div class="flashcard-stack-new">
                                ${flashcards.map((card, cardIndex) => `
                                    <div class="flashcard-new ${cardIndex === 0 ? 'active' : ''}" data-card-index="${cardIndex}">
                                        <div class="flashcard-inner-new">
                                            <div class="flashcard-front-new">
                                                <span class="subheading-3">${card.term}</span>
                                            </div>
                                            <div class="flashcard-back-new">
                                                <span class="body-3">${card.definition}</span>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="flashcard-dots-new">
                                ${flashcards.map((_, dotIndex) => `
                                    <span class="flashcard-dot-new ${dotIndex === 0 ? 'active' : ''}" data-dot-index="${dotIndex}"></span>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="study-set-actions-new">
                            <button class="action-btn-new primary subheading-4" data-action="create-flashcards" data-topic="${topic}">
                                Create flashcards
                            </button>
                            <button class="action-btn-new secondary subheading-4" data-action="customize">
                                Customize
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // Don't attach listeners here - they will be attached after DOM insertion
    // See animateMessageContent() for listener attachment
    
    return html;
}

/**
 * Attach event listeners to flashcard draft cards
 */
function attachFlashcardDraftListeners() {
    console.log('Attaching flashcard draft listeners...');
    
    // Create flashcards buttons
    const createButtons = document.querySelectorAll('[data-action="create-flashcards"]');
    console.log('Found create buttons:', createButtons.length);
    createButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const topic = this.getAttribute('data-topic');
            handleCreateFlashcards(topic);
        });
    });
    
    // Customize buttons
    const customizeButtons = document.querySelectorAll('[data-action="customize"]');
    console.log('Found customize buttons:', customizeButtons.length);
    customizeButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            showMessage('Customize flashcards');
        });
    });
    
    // Initialize flashcard interactions for new draft cards
    const draftCardStacks = document.querySelectorAll('.flashcard-draft-card-new .flashcard-stack-new');
    console.log('Found draft card stacks:', draftCardStacks.length);
    draftCardStacks.forEach(stack => {
        initializeFlashcardStackNew(stack);
    });
}

/**
 * Handle preview for flashcard draft cards
 */
function handleFlashcardDraftPreview(setId) {
    console.log('Preview flashcard draft:', setId);
    showMessage('Preview coming soon!');
}

/**
 * Handle create flashcards action
 */
function handleCreateFlashcards(topic) {
    console.log('Create flashcards for:', topic);
    // For now, show a message - in a real app, this would navigate to the creation flow
    showMessage(`Creating flashcards for ${topic}...`);
    
    // Could navigate to a creation page:
    // window.location.href = `../html/create-flashcards.html?topic=${encodeURIComponent(topic)}`;
}

/**
 * Generate study set cards with real or mock data
 * @param {boolean} isTestMode - Whether this is for test/quiz mode
 * @param {Array} realStudySets - Optional real study sets data from GPT
 * @param {number} startIndex - Starting index for pagination (default 0)
 */
function generateStudySetCards(isTestMode = false, realStudySets = null, startIndex = 0) {
    let allStudySets = [];
    let studySetsToDisplay = [];
    
    // Use real data if provided, otherwise use mock data
    if (realStudySets && Array.isArray(realStudySets) && realStudySets.length > 0) {
        console.log('Using real study sets data from GPT:', realStudySets.length, 'total sets');
        allStudySets = realStudySets.map((set, index) => ({
            id: `set-${index + 1}`,
            title: set.title || `Study Set ${index + 1}`,
            termCount: set.cardCount || set.flashcards?.length || 0,
            studiersToday: set.studiersToday || Math.floor(Math.random() * 20) + 10,
            isTopPick: false,
            flashcards: set.flashcards || []
        }));
        
        // Get 3 sets starting from startIndex
        studySetsToDisplay = allStudySets.slice(startIndex, startIndex + 3);
        console.log(`Displaying sets ${startIndex + 1}-${startIndex + studySetsToDisplay.length} of ${allStudySets.length}`);
        console.log('studySetsToDisplay:', studySetsToDisplay.length, 'sets');
    } else {
        console.log('Using mock study sets data');
        // Fake study set data - ALWAYS show exactly 3 sets (all collapsed by default)
        allStudySets = [
            {
                id: 'set-1',
                title: 'BIO 110: Cell Structure & Function',
                termCount: 62,
                studiersToday: 18,
                isTopPick: false,
                flashcards: [
                    { term: 'Phase before mitosis; growth of cell and preparation for division', definition: 'This is the definition side' },
                    { term: 'Cell membrane', definition: 'The semipermeable barrier that surrounds and protects the cell' },
                    { term: 'Mitochondria', definition: 'The powerhouse of the cell that produces ATP through cellular respiration' },
                    { term: 'Nucleus', definition: 'Contains genetic material (DNA) and controls all cell activities' },
                    { term: 'Ribosomes', definition: 'Sites of protein synthesis in the cell' }
                ]
            },
            {
                id: 'set-2',
                title: 'Bio110 Exam 1',
                termCount: 47,
                studiersToday: 18,
                isTopPick: false,
                flashcards: [
                    { term: 'Photosynthesis', definition: 'Process by which plants convert light energy into chemical energy' },
                    { term: 'Cellular respiration', definition: 'Process of breaking down glucose to produce ATP' },
                    { term: 'ATP', definition: 'Adenosine triphosphate, the energy currency of the cell' },
                    { term: 'Enzyme', definition: 'Protein that catalyzes biochemical reactions' },
                    { term: 'Chromosome', definition: 'Structure containing DNA and proteins in the nucleus' }
                ]
            },
            {
                id: 'set-3',
                title: 'BIO 110: Cell Structure & Function',
                termCount: 47,
                studiersToday: 18,
                isTopPick: false,
                flashcards: [
                    { term: 'Osmosis', definition: 'Movement of water across a semipermeable membrane' },
                    { term: 'Diffusion', definition: 'Movement of molecules from high to low concentration' },
                    { term: 'Active transport', definition: 'Movement of molecules against concentration gradient using ATP' },
                    { term: 'Passive transport', definition: 'Movement of molecules along concentration gradient without energy' },
                    { term: 'Cytoplasm', definition: 'Gel-like substance filling the cell containing organelles' }
                ]
            }
        ];
        
        // Get 3 sets starting from startIndex (for mock data pagination)
        studySetsToDisplay = allStudySets.slice(startIndex, startIndex + 3);
        console.log(`Mock data - Displaying sets ${startIndex + 1}-${startIndex + studySetsToDisplay.length} of ${allStudySets.length}`);
        console.log('studySetsToDisplay:', studySetsToDisplay.length, 'sets');
    }
    
    // Store all sets and current index for pagination
    let html = `<div class="study-set-cards-new" 
                     data-all-sets='${JSON.stringify(allStudySets).replace(/'/g, '&apos;')}' 
                     data-current-index="${startIndex + studySetsToDisplay.length}"
                     data-is-test-mode="${isTestMode}">`;
    
    studySetsToDisplay.forEach((set, index) => {
        const isExpanded = set.expanded || false;
        const setFlashcards = set.flashcards || [];
        
        html += `
            <div class="study-set-card-new ${isExpanded ? 'expanded' : ''}" 
                 data-set-id="${set.id}" 
                 data-flashcards='${JSON.stringify(setFlashcards).replace(/'/g, '&apos;')}'>
                <div class="study-set-content">
                    <div class="study-set-top">
                        <div class="study-set-text">
                            <h3 class="study-set-title-new subheading-3">${set.title}</h3>
                            <div class="study-set-pills-new">
                                <span class="study-set-pill-new gray subheading-5">${set.termCount} cards</span>
                                <span class="study-set-pill-new yellow subheading-5">
                                    <img src="../images/leftIcon.png" alt="" class="studiers-icon" aria-hidden="true">
                                    ${set.studiersToday} studiers today
                                </span>
                            </div>
                        </div>
                        ${!isExpanded ? `
                            <button class="study-set-preview-btn-new subheading-4" data-set-id="${set.id}">
                                Preview
                            </button>
                        ` : ''}
                    </div>
                    
                    ${isExpanded ? `
                        <div class="flashcard-preview-new">
                            <div class="flashcard-stack-new">
                                ${setFlashcards.slice(0, 5).map((card, cardIndex) => `
                                    <div class="flashcard-new ${cardIndex === 0 ? 'active' : ''}" data-card-index="${cardIndex}">
                                        <div class="flashcard-inner-new">
                                            <div class="flashcard-front-new">
                                                <span class="subheading-3">${card.term}</span>
                                            </div>
                                            <div class="flashcard-back-new">
                                                <span class="body-3">${card.definition}</span>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="flashcard-dots-new">
                                ${setFlashcards.slice(0, 5).map((_, dotIndex) => `
                                    <span class="flashcard-dot-new ${dotIndex === 0 ? 'active' : ''}" data-dot-index="${dotIndex}"></span>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="study-set-actions-new">
                            <button class="action-btn-new primary subheading-4" data-action="launch">
                                ${isTestMode ? 'Start test' : 'Study flashcards'}
                            </button>
                            <button class="action-btn-new secondary subheading-4" data-action="other-sets">
                                See more sets
                                <img src="../images/refresh.png" alt="" aria-hidden="true" style="width: 16px; height: 16px;">
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // Don't attach listeners here - they will be attached after DOM insertion
    // See animateMessageContent() for listener attachment
    
    return html;
}

/**
 * Attach event listeners to study set cards
 */
function attachStudySetListeners() {
    // Click on non-expanded cards to expand them
    const nonExpandedCards = document.querySelectorAll('.study-set-card-new:not(.expanded)');
    console.log('Found non-expanded cards:', nonExpandedCards.length);
    nonExpandedCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't expand if clicking the preview button (it will handle itself)
            if (e.target.closest('.study-set-preview-btn-new')) {
                console.log('Click was on preview button, letting button handler take over');
                return;
            }
            console.log('Card clicked (not on preview button)');
            expandStudySetCard(this);
        });
    });
    
    // Click on expanded cards to collapse them (but not on interactive elements)
    const expandedCards = document.querySelectorAll('.study-set-card-new.expanded');
    console.log('Found expanded cards:', expandedCards.length);
    expandedCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't collapse if clicking on interactive elements
            if (e.target.closest('.action-btn-new') || 
                e.target.closest('.flashcard-new') ||
                e.target.closest('.flashcard-dot-new')) {
                console.log('Click was on interactive element, not collapsing');
                return;
            }
            console.log('Expanded card background clicked, collapsing');
            collapseStudySetCard(this);
        });
    });
    
    // Preview buttons for new design
    const previewButtonsNew = document.querySelectorAll('.study-set-preview-btn-new');
    console.log('Found preview buttons:', previewButtonsNew.length);
    previewButtonsNew.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Preview button clicked');
            const card = this.closest('.study-set-card-new');
            if (card) {
                console.log('Found card to expand');
                expandStudySetCard(card);
            } else {
                console.error('Could not find parent card');
            }
        });
    });
    
    // Action buttons for new design
    const actionButtonsNew = document.querySelectorAll('.action-btn-new');
    actionButtonsNew.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const action = this.getAttribute('data-action');
            handleStudySetAction(action);
        });
    });
    
    // Legacy preview buttons (keep for backward compatibility)
    const previewButtons = document.querySelectorAll('.study-set-preview-btn');
    previewButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const setId = this.getAttribute('data-set-id');
            handleStudySetPreview(setId);
        });
    });
}

/**
 * Expand a study set card to show flashcard preview
 */
function expandStudySetCard(card) {
    if (!card || card.classList.contains('expanded')) {
        return;
    }
    
    const setId = card.getAttribute('data-set-id');
    console.log('Expanding study set card:', setId);
    
    // Get card data
    const title = card.querySelector('.study-set-title-new').textContent;
    const pills = card.querySelector('.study-set-pills-new').outerHTML;
    
    // Get flashcard data from data attribute (use real data if available, otherwise use mock)
    let flashcards = [];
    try {
        const flashcardsData = card.getAttribute('data-flashcards');
        if (flashcardsData) {
            flashcards = JSON.parse(flashcardsData);
            console.log('Using real flashcard data:', flashcards.length, 'cards');
        }
    } catch (e) {
        console.error('Failed to parse flashcard data:', e);
    }
    
    // If no real data or parsing failed, use mock flashcard data
    if (flashcards.length === 0) {
        console.log('Using mock flashcard data');
        flashcards = [
            { term: 'Phase before mitosis; growth of cell and preparation for division', definition: 'This is the definition side' },
            { term: 'Cell membrane', definition: 'The semipermeable barrier that surrounds and protects the cell' },
            { term: 'Mitochondria', definition: 'The powerhouse of the cell that produces ATP through cellular respiration' },
            { term: 'Nucleus', definition: 'Contains genetic material (DNA) and controls all cell activities' },
            { term: 'Ribosomes', definition: 'Sites of protein synthesis in the cell' }
        ];
    }
    
    // Limit to first 5 cards for preview
    flashcards = flashcards.slice(0, 5);
    
    // Check if we're in test mode (look at the text in the message bubble)
    const isTestMode = card.closest('.message-bubble')?.textContent.match(/quiz|test|practice|assess/i);
    
    // Build expanded card HTML
    const expandedHTML = `
        <div class="study-set-content">
            <div class="study-set-top">
                <div class="study-set-text">
                    <h3 class="study-set-title-new subheading-3">${title}</h3>
                    ${pills}
                </div>
            </div>
            
            <div class="flashcard-preview-new">
                <div class="flashcard-stack-new">
                    ${flashcards.map((flashcard, cardIndex) => `
                        <div class="flashcard-new ${cardIndex === 0 ? 'active' : ''}" data-card-index="${cardIndex}">
                            <div class="flashcard-inner-new">
                                <div class="flashcard-front-new">
                                    <span class="subheading-3">${flashcard.term}</span>
                                </div>
                                <div class="flashcard-back-new">
                                    <span class="body-3">${flashcard.definition}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="flashcard-dots-new">
                    ${flashcards.map((_, dotIndex) => `
                        <span class="flashcard-dot-new ${dotIndex === 0 ? 'active' : ''}" data-dot-index="${dotIndex}"></span>
                    `).join('')}
                </div>
            </div>
            
            <div class="study-set-actions-new">
                <button class="action-btn-new primary subheading-4" data-action="launch">
                    ${isTestMode ? 'Start test' : 'Study flashcards'}
                </button>
                <button class="action-btn-new secondary subheading-4" data-action="other-sets">
                    See more sets
                    <img src="../images/refresh.png" alt="" aria-hidden="true" style="width: 16px; height: 16px;">
                </button>
            </div>
        </div>
    `;
    
    // Replace card content with animation
    card.style.transition = 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)';
    card.style.opacity = '0.5';
    card.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
        card.innerHTML = expandedHTML;
        card.classList.add('expanded');
        
        // Reset animation
        card.style.opacity = '';
        card.style.transform = '';
        
        // Only initialize interactions for THIS card, don't re-attach all listeners
        setTimeout(() => {
            // Attach collapse listener for this expanded card
            card.addEventListener('click', function(e) {
                // Don't collapse if clicking on interactive elements
                if (e.target.closest('.action-btn-new') || 
                    e.target.closest('.flashcard-new') ||
                    e.target.closest('.flashcard-dot-new')) {
                    console.log('Click was on interactive element, not collapsing');
                    return;
                }
                console.log('Expanded card background clicked, collapsing');
                collapseStudySetCard(this);
            });
            
            // Attach action button listeners only for this card
            const actionButtons = card.querySelectorAll('.action-btn-new');
            actionButtons.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const action = this.getAttribute('data-action');
                    handleStudySetAction(action);
                });
            });
            
            // Initialize flashcard interactions only for this card's stack
            const flashcardStack = card.querySelector('.flashcard-stack-new');
            if (flashcardStack) {
                initializeFlashcardStackNew(flashcardStack);
            }
        }, 100);
    }, 150);
}

/**
 * Collapse an expanded study set card back to preview state
 */
function collapseStudySetCard(card) {
    if (!card || !card.classList.contains('expanded')) {
        return;
    }
    
    const setId = card.getAttribute('data-set-id');
    console.log('Collapsing study set card:', setId);
    
    // Get card data
    const title = card.querySelector('.study-set-title-new').textContent;
    const pills = card.querySelector('.study-set-pills-new').outerHTML;
    
    // Build collapsed card HTML
    const collapsedHTML = `
        <div class="study-set-content">
            <div class="study-set-top">
                <div class="study-set-text">
                    <h3 class="study-set-title-new subheading-3">${title}</h3>
                    ${pills}
                </div>
                <button class="study-set-preview-btn-new subheading-4" data-set-id="${setId}">
                    Preview
                </button>
            </div>
        </div>
    `;
    
    // Replace card content with animation
    card.style.transition = 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)';
    card.style.opacity = '0.5';
    card.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
        card.innerHTML = collapsedHTML;
        card.classList.remove('expanded');
        
        // Reset animation
        card.style.opacity = '';
        card.style.transform = '';
        
        // Re-attach listeners
        setTimeout(() => {
            attachStudySetListeners();
        }, 100);
    }, 150);
}

/**
 * Handle study set action buttons
 */
function handleStudySetAction(action) {
    console.log('Study set action:', action);
    
    if (action === 'launch') {
        // Navigate to study page with flashcards-only mode
        window.location.href = '../html/study.html?mode=flashcards-only';
    } else if (action === 'other-sets') {
        // Find the study-set-cards-new container
        const cardsContainer = document.querySelector('.study-set-cards-new');
        if (!cardsContainer) return;
        
        // Get stored data
        const allSetsData = cardsContainer.getAttribute('data-all-sets');
        const currentIndex = parseInt(cardsContainer.getAttribute('data-current-index')) || 0;
        const isTestMode = cardsContainer.getAttribute('data-is-test-mode') === 'true';
        
        let allSets = [];
        try {
            if (allSetsData) {
                allSets = JSON.parse(allSetsData);
            }
        } catch (e) {
            console.error('Failed to parse stored study sets:', e);
        }
        
        console.log(`Current index: ${currentIndex}, Total sets: ${allSets.length}`);
        
        // Check if we have more sets to show
        if (allSets.length > 0 && currentIndex < allSets.length) {
            console.log('Showing next 3 sets from stored data');
            
            // Show shimmer loading state briefly for smooth transition
            showShimmerLoading(cardsContainer);
            
            // After brief delay, show next 3 sets
            setTimeout(() => {
                const newCardsHTML = generateStudySetCards(isTestMode, allSets, currentIndex);
                
                // Create a temporary container to parse the HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = newCardsHTML;
                const newCards = tempDiv.querySelector('.study-set-cards-new');
                
                // Replace the old cards with new ones
                cardsContainer.replaceWith(newCards);
                
                // Re-attach listeners
                setTimeout(() => {
                    attachStudySetListeners();
                    initializeFlashcardsNew();
                }, 100);
            }, 800); // Brief shimmer
            
            return; // Exit early, no need to fetch from API
        }
        
        // If we've shown all stored sets, fetch more from API
        console.log('No more stored sets, fetching from API');
        
        // Get the topic/context from the message bubble
        const messageBubble = cardsContainer.closest('.message-bubble');
        const messageText = messageBubble ? messageBubble.textContent : '';
        
        // Extract the course/exam context from the message
        // Look for patterns like "BIO 110 Exam 1" or "ART 1905 Final"
        let topic = 'this topic';
        const topicMatch = messageText.match(/(?:for|preparing for|practice)\s+(?:the\s+)?([A-Z]+\s+\d+(?:\s+(?:Exam\s+\d+|Midterm|Final|exam))?)/i);
        if (topicMatch) {
            topic = topicMatch[1].trim();
        }
        
        console.log('Requesting more sets from API for:', topic);
        
        // Show shimmer loading state
        showShimmerLoading(cardsContainer);
        
        // Send a request to the AI for more sets
        const requestMessage = `Show me 3 different study sets for ${topic}`;
        
        // Send message to AI
        fetch('http://localhost:3000/api/ai-coach', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: requestMessage,
                history: conversationHistory
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.response) {
                // Parse the response for study set data
                const jsonMatch = data.response.match(/\[STUDY_SETS_DATA\]([\s\S]*?)\[\/STUDY_SETS_DATA\]/);
                if (jsonMatch) {
                    try {
                        const jsonData = JSON.parse(jsonMatch[1].trim());
                        console.log('Received new study sets from API:', jsonData.studySets.length, 'sets');
                        
                        // Check if we're in test mode
                        const isTestMode = messageText.match(/quiz|test|practice|assess/i);
                        
                        // Generate new cards HTML with real data (starting from index 0)
                        const newCardsHTML = generateStudySetCards(isTestMode, jsonData.studySets, 0);
                        
                        // Create a temporary container to parse the HTML
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = newCardsHTML;
                        const newCards = tempDiv.querySelector('.study-set-cards-new');
                        
                        // Replace the old cards with new ones
                        cardsContainer.replaceWith(newCards);
                        
                        // Re-attach listeners
                        setTimeout(() => {
                            attachStudySetListeners();
                            initializeFlashcardsNew();
                        }, 100);
                        
                        // Add to conversation history (but don't display as a message)
                        conversationHistory.push({
                            role: 'user',
                            content: requestMessage
                        });
                        conversationHistory.push({
                            role: 'assistant',
                            content: data.response
                        });
                    } catch (e) {
                        console.error('Failed to parse new study sets:', e);
                        // Fall back to mock data
                        const isTestMode = messageText.match(/quiz|test|practice|assess/i);
                        const newCardsHTML = generateStudySetCards(isTestMode);
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = newCardsHTML;
                        const newCards = tempDiv.querySelector('.study-set-cards-new');
                        cardsContainer.replaceWith(newCards);
                        setTimeout(() => {
                            attachStudySetListeners();
                            initializeFlashcardsNew();
                        }, 100);
                    }
                } else {
                    // No JSON found, use mock data
                    const isTestMode = messageText.match(/quiz|test|practice|assess/i);
                    const newCardsHTML = generateStudySetCards(isTestMode);
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = newCardsHTML;
                    const newCards = tempDiv.querySelector('.study-set-cards-new');
                    cardsContainer.replaceWith(newCards);
                    setTimeout(() => {
                        attachStudySetListeners();
                        initializeFlashcardsNew();
                    }, 100);
                }
            }
        })
        .catch(error => {
            console.error('Error fetching new study sets:', error);
            // Fall back to mock data on error
            const isTestMode = messageText.match(/quiz|test|practice|assess/i);
            const newCardsHTML = generateStudySetCards(isTestMode);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = newCardsHTML;
            const newCards = tempDiv.querySelector('.study-set-cards-new');
            cardsContainer.replaceWith(newCards);
            setTimeout(() => {
                attachStudySetListeners();
                initializeFlashcardsNew();
            }, 100);
        });
    }
}

/**
 * Show shimmer loading state for cards
 */
function showShimmerLoading(container) {
    const shimmerHTML = `
        <div class="study-set-card-new shimmer-loading">
            <div class="shimmer-content">
                <div class="shimmer-line shimmer-title"></div>
                <div class="shimmer-line shimmer-meta"></div>
            </div>
        </div>
        <div class="study-set-card-new shimmer-loading">
            <div class="shimmer-content">
                <div class="shimmer-line shimmer-title"></div>
                <div class="shimmer-line shimmer-meta"></div>
            </div>
        </div>
        <div class="study-set-card-new shimmer-loading">
            <div class="shimmer-content">
                <div class="shimmer-line shimmer-title"></div>
                <div class="shimmer-line shimmer-meta"></div>
            </div>
        </div>
    `;
    
    container.innerHTML = shimmerHTML;
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
 * Initialize a single flashcard stack
 */
function initializeFlashcardStackNew(stack) {
    if (!stack) return;
    
    const cards = Array.from(stack.querySelectorAll('.flashcard-new'));
    const dots = stack.parentElement.querySelectorAll('.flashcard-dot-new');
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
    
    // Touch events for swipe
    function handleTouchStart(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        currentX = startX;
        isDragging = false;
        isSwiping = false;
        activeCard.style.transition = 'none';
    }
    
    function handleTouchMove(e) {
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
            const rotation = deltaX * 0.05;
            const opacity = 1 - Math.abs(deltaX) / 400;
            activeCard.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
            activeCard.style.opacity = Math.max(opacity, 0.5);
        }
    }
    
    function handleTouchEnd(e) {
        if (!isSwiping) {
            isDragging = false;
            return;
        }
        
        const deltaX = currentX - startX;
        const threshold = 80;
        
        if (Math.abs(deltaX) > threshold) {
            // Swipe detected - move card to bottom of stack
            moveCardToBottom();
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
    }
    
    // Mouse events for desktop
    function handleMouseDown(e) {
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
            const threshold = 80;
            
            if (Math.abs(deltaX) > threshold) {
                // Swipe detected - move card to bottom of stack
                moveCardToBottom();
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
    }
    
    // Move the current card to the bottom of the stack
    function moveCardToBottom() {
        // Animate card away
        const direction = currentX - startX > 0 ? 1 : -1;
        activeCard.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        activeCard.style.transform = `translateX(${direction * 400}px) rotate(${direction * 20}deg)`;
        activeCard.style.opacity = '0';
        
        setTimeout(() => {
            // Remove active and flipped state
            activeCard.classList.remove('active', 'flipped');
            activeCard.removeEventListener('click', handleTap);
            activeCard.removeEventListener('touchstart', handleTouchStart);
            activeCard.removeEventListener('touchmove', handleTouchMove);
            activeCard.removeEventListener('touchend', handleTouchEnd);
            activeCard.removeEventListener('mousedown', handleMouseDown);
            
            // Move to end of array
            const movedCard = cards.shift();
            cards.push(movedCard);
            
            // Reorder DOM elements
            stack.appendChild(movedCard);
            
            // Reset styles
            movedCard.style.transition = '';
            movedCard.style.transform = '';
            movedCard.style.opacity = '';
            isFlipped = false;
            
            // Update active card (now the first in array)
            currentIndex = 0;
            activeCard = cards[0];
            activeCard.classList.add('active');
            
            // Update dot - use the card's original index from data attribute
            const activeDotIndex = parseInt(activeCard.getAttribute('data-card-index'));
            console.log('Card swiped, updating dot to index:', activeDotIndex);
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === activeDotIndex);
            });
            
            // Attach listeners to new active card
            attachCardListeners();
        }, 400);
    }
    
    // Attach all event listeners to active card
    function attachCardListeners() {
        activeCard.addEventListener('click', handleTap);
        activeCard.addEventListener('touchstart', handleTouchStart);
        activeCard.addEventListener('touchmove', handleTouchMove);
        activeCard.addEventListener('touchend', handleTouchEnd);
        activeCard.addEventListener('mousedown', handleMouseDown);
    }
    
    // Initial attachment
    attachCardListeners();
    
    // Set initial dot state
    if (dots.length > 0) {
        dots[0].classList.add('active');
    }
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card tap from firing
            console.log('Dot clicked:', index);
            
            // Find the card with matching data-card-index
            const targetCard = cards.find(card => parseInt(card.getAttribute('data-card-index')) === index);
            
            if (!targetCard || targetCard === activeCard) {
                console.log('Already on this card or card not found');
                return;
            }
            
            console.log('Navigating to card with original index:', index);
            
            // Remove active from current card
            activeCard.classList.remove('active', 'flipped');
            activeCard.removeEventListener('click', handleTap);
            activeCard.removeEventListener('touchstart', handleTouchStart);
            activeCard.removeEventListener('touchmove', handleTouchMove);
            activeCard.removeEventListener('touchend', handleTouchEnd);
            activeCard.removeEventListener('mousedown', handleMouseDown);
            dots.forEach(d => d.classList.remove('active'));
            
            // Find the index in our cards array
            currentIndex = cards.indexOf(targetCard);
            activeCard = targetCard;
            activeCard.classList.add('active');
            dots[index].classList.add('active');
            isFlipped = false;
            
            // Re-attach listeners
            attachCardListeners();
            
            console.log('Now on card at position:', currentIndex, 'with original index:', index);
        });
    });
}

/**
 * Initialize flashcard interactions for new design
 */
function initializeFlashcardsNew() {
    const flashcardStacks = document.querySelectorAll('.flashcard-stack-new');
    
    flashcardStacks.forEach(stack => {
        initializeFlashcardStackNew(stack);
    });
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
    
    // Add animated sparkle icon for typing indicator
    const iconDiv = document.createElement('div');
    iconDiv.className = 'message-icon loading';
    const iconImg = document.createElement('img');
    iconImg.src = '../images/brand-sparkle.png';
    iconImg.alt = '';
    iconImg.setAttribute('aria-hidden', 'true');
    iconDiv.appendChild(iconImg);
    typingDiv.appendChild(iconDiv);
    
    chatMessages.appendChild(typingDiv);
    
    // Scroll to bottom - use setTimeout to ensure DOM is updated
    setTimeout(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 50);
}

/**
 * Remove typing indicator and convert to message
 */
function removeTypingIndicator(keepForMessage = false) {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        if (keepForMessage) {
            // Remove loading animation but keep the element
            const iconDiv = typingIndicator.querySelector('.message-icon');
            if (iconDiv) {
                iconDiv.classList.remove('loading');
            }
            // Remove the id so it becomes a regular message
            typingIndicator.removeAttribute('id');
            return typingIndicator;
        } else {
        typingIndicator.remove();
    }
    }
    return null;
}

/**
 * Send message to AI and handle response
 */
async function sendMessageToAI(message, attachment = null) {
    isWaitingForResponse = true;
    showTypingIndicator();
    
    try {
        console.log('Sending message to AI:', message);
        if (attachment) {
            console.log('With attachment:', attachment.name, attachment.type);
        }
        console.log('API URL:', `${API_BASE_URL}/api/ai-coach`);
        
        let requestBody;
        let headers = {};
        
        // If there's an attachment, use FormData
        if (attachment && attachment.file) {
            console.log('Creating FormData with message:', message);
            console.log('Message length:', message.length);
            console.log('Attachment file:', attachment.file.name);
            
            const formData = new FormData();
            formData.append('message', message);
            formData.append('history', JSON.stringify(chatHistory.filter(item => item.role !== 'error')));
            formData.append('file', attachment.file);
            formData.append('fileType', attachment.type);
            
            // Debug: log what's in FormData
            console.log('FormData entries:');
            for (let [key, value] of formData.entries()) {
                console.log(key, typeof value === 'object' ? value : value);
            }
            
            requestBody = formData;
            // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
        } else {
            // Regular JSON request
            headers['Content-Type'] = 'application/json';
            requestBody = JSON.stringify({
                message: message,
                history: chatHistory.filter(item => item.role !== 'error') // Don't send error messages to API
            });
        }
        
        // Call your backend API endpoint that connects to the custom GPT
        const response = await fetch(`${API_BASE_URL}/api/ai-coach`, {
            method: 'POST',
            headers: headers,
            body: requestBody
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error:', errorData);
            throw new Error(errorData.error || `API returned status ${response.status}`);
        }
        
        const data = await response.json();
        console.log('AI Response received:', data);
        
        // Reuse the typing indicator to avoid sparkle flicker, with animation
        addMessageToChat('assistant', data.response, true, true);
        
    } catch (error) {
        console.error('Error communicating with AI Coach:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // Show more helpful error message
        let errorMessage = 'Sorry, I encountered an error. ';
        
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            errorMessage += 'Make sure the backend server is running on ' + API_BASE_URL;
        } else {
            errorMessage += error.message || 'Please try again.';
        }
        
        // Reuse the typing indicator to avoid sparkle flicker, no animation for errors
        addMessageToChat('assistant', errorMessage, true, false);
        
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
    console.log('Add button clicked - opening upload sheet');
    showUploadSheet();
}

/**
 * Handle file selection
 */
function handleFileSelected(file, type) {
    console.log('File selected:', file.name, type);
    
    // Store the file
    currentAttachment = {
        file: file,
        type: type,
        name: file.name,
        size: formatFileSize(file.size)
    };
    
    // Display the attachment preview
    displayAttachmentPreview();
    
    // Clear the file input so the same file can be selected again if needed
    const photoInput = document.getElementById('photoInput');
    const fileInput = document.getElementById('fileInput');
    if (photoInput) photoInput.value = '';
    if (fileInput) fileInput.value = '';
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Display attachment preview in the input area
 */
function displayAttachmentPreview() {
    if (!currentAttachment) return;
    
    const attachmentsRow = document.getElementById('attachmentsRow');
    if (!attachmentsRow) return;
    
    // Clear any existing attachments
    attachmentsRow.innerHTML = '';
    
    // Create attachment preview card with loading state
    const previewDiv = document.createElement('div');
    previewDiv.className = 'attachment-preview loading';
    
    // Get file extension for file type badge
    const fileName = currentAttachment.name;
    const fileExtension = fileName.split('.').pop().toUpperCase();
    
    // Determine file type label
    let fileType = fileExtension;
    if (currentAttachment.type === 'image') {
        fileType = 'IMAGE';
    } else if (['PDF', 'DOC', 'DOCX'].includes(fileExtension)) {
        fileType = fileExtension;
    } else if (['TXT', 'MD'].includes(fileExtension)) {
        fileType = 'TEXT';
    }
    
    // Create loading spinner (shows initially)
    const spinnerDiv = document.createElement('div');
    spinnerDiv.className = 'attachment-loading-spinner';
    const spinnerImg = document.createElement('img');
    spinnerImg.src = '../images/spinner.png';
    spinnerImg.alt = 'Loading';
    spinnerDiv.appendChild(spinnerImg);
    
    // Create file type badge (top left) - subheading-4
    const fileTypeBadge = document.createElement('div');
    fileTypeBadge.className = 'attachment-file-type subheading-4';
    fileTypeBadge.textContent = fileType;
    
    // Create file name label (bottom left) - body-4, without extension
    const fileNameLabel = document.createElement('div');
    fileNameLabel.className = 'attachment-file-name body-4';
    // Remove file extension from display
    const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    fileNameLabel.textContent = fileNameWithoutExt;
    
    // Create remove button with clear.png icon (top right)
    const removeBtn = document.createElement('button');
    removeBtn.className = 'attachment-remove';
    removeBtn.setAttribute('aria-label', 'Remove attachment');
    const removeIcon = document.createElement('img');
    removeIcon.src = '../images/clear.png';
    removeIcon.alt = 'Remove';
    removeBtn.appendChild(removeIcon);
    removeBtn.addEventListener('click', removeAttachment);
    
    // Assemble preview card
    previewDiv.appendChild(spinnerDiv);
    previewDiv.appendChild(fileTypeBadge);
    previewDiv.appendChild(fileNameLabel);
    previewDiv.appendChild(removeBtn);
    
    // Add to attachments row
    attachmentsRow.appendChild(previewDiv);
    attachmentsRow.classList.add('has-attachments');
    
    // Show loading spinner for 800ms, then reveal file details
    setTimeout(() => {
        previewDiv.classList.remove('loading');
        previewDiv.classList.add('loaded');
        
        // Remove spinner after fade out animation completes
        setTimeout(() => {
            if (spinnerDiv.parentNode) {
                spinnerDiv.remove();
            }
        }, 300);
    }, 800);
    
    // Update submit button state - activate if file is attached
    updateSubmitButtonState();
}

/**
 * Remove attachment
 */
function removeAttachment() {
    console.log('Removing attachment');
    
    // Clear the attachment
    currentAttachment = null;
    
    // Hide the attachments row
    const attachmentsRow = document.getElementById('attachmentsRow');
    if (attachmentsRow) {
        attachmentsRow.innerHTML = '';
        attachmentsRow.classList.remove('has-attachments');
    }
    
    // Update submit button state
    updateSubmitButtonState();
}

/**
 * Update submit button state based on input and attachment
 */
function updateSubmitButtonState() {
    const input = document.getElementById('studyQuestionInput');
    const submitBtn = document.getElementById('submitButton');
    
    if (!submitBtn) return;
    
    // Activate button if there's text OR an attachment
    const hasText = input && input.value.trim().length > 0;
    const hasAttachment = currentAttachment !== null;
    
    if (hasText || hasAttachment) {
        submitBtn.classList.add('has-text');
    } else {
        submitBtn.classList.remove('has-text');
    }
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

