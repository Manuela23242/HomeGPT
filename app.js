// Language configurations
const translations = {
    en: {
        welcome: "Hello! I'm your AI assistant. How can I help you?",
        placeholder: "Type your message...",
        sendButton: "Send",
        subtitle: "Your Intelligent Assistant",
        errorMessage: "Sorry, there was an error generating the response. Please make sure you have a stable internet connection and the API key is correct.",
        modelLoading: "The model is loading. Please try again in a few seconds.",
        noResponse: "Sorry, I couldn't generate an appropriate response."
    },
    de: {
        welcome: "Hallo! Ich bin dein KI-Assistent. Wie kann ich dir helfen?",
        placeholder: "Schreibe deine Nachricht...",
        sendButton: "Senden",
        subtitle: "Dein intelligenter Assistent",
        errorMessage: "Entschuldigung, es gab einen Fehler bei der Generierung der Antwort. Bitte stelle sicher, dass du eine stabile Internetverbindung hast und der API-Key korrekt ist.",
        modelLoading: "Das Modell wird gerade geladen. Bitte versuche es in ein paar Sekunden noch einmal.",
        noResponse: "Entschuldigung, ich konnte keine passende Antwort generieren."
    }
};

let currentLanguage = 'en';

// Language selection function
function selectLanguage(lang) {
    currentLanguage = lang;
    document.getElementById('language-overlay').style.display = 'none';
    
    // Update UI elements
    document.getElementById('user-input').placeholder = translations[lang].placeholder;
    document.getElementById('send-button').textContent = translations[lang].sendButton;
    document.getElementById('header-subtitle').textContent = translations[lang].subtitle;
    
    // Add welcome message
    addMessage('assistant', translations[lang].welcome);
}

document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Handle send button click
    sendButton.addEventListener('click', handleSendMessage);
    
    // Handle Enter key press
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Improved scroll handling
    function scrollToBottom(smooth = true) {
        const scrollOptions = {
            top: chatContainer.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto'
        };
        chatContainer.scrollTo(scrollOptions);
    }

    // Scroll to bottom when window is resized
    window.addEventListener('resize', () => scrollToBottom(false));

    // Auto-scroll to bottom when new messages are added
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                scrollToBottom();
            }
        });
    });

    observer.observe(chatContainer, { childList: true, subtree: true });

    async function handleSendMessage() {
        const message = userInput.value.trim();
        if (message) {
            // Disable input and button while processing
            userInput.disabled = true;
            sendButton.disabled = true;
            
            // Add user message to chat
            addMessage('user', message);
            userInput.value = '';

            // Show typing indicator
            showTypingIndicator();

            try {
                // Generate response using free model
                const response = await generateResponse(message);
                removeTypingIndicator();
                addMessage('assistant', response);
            } catch (error) {
                removeTypingIndicator();
                addMessage('assistant', translations[currentLanguage].errorMessage);
                console.error('Error:', error);
            } finally {
                // Re-enable input and button
                userInput.disabled = false;
                sendButton.disabled = false;
                userInput.focus();
            }
        }
    }

    function addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        // Convert URLs to clickable links and format code blocks
        const formattedContent = content
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-500 hover:underline">$1</a>')
            .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded">$1</code>');
        
        messageDiv.innerHTML = formattedContent;
        
        // Add message with fade-in animation
        messageDiv.style.opacity = '0';
        chatContainer.appendChild(messageDiv);
        
        // Trigger reflow for animation
        messageDiv.offsetHeight;
        messageDiv.style.opacity = '1';
        messageDiv.style.transition = 'opacity 0.3s ease-in-out';
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        chatContainer.appendChild(typingDiv);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    async function generateResponse(message) {
        try {
            // Verwende ein besseres Modell für Chatantworten
            const response = await fetch(
                "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${config.huggingFaceToken}`
                },
                body: JSON.stringify({
                    inputs: `<s>[INST] ${message} [/INST] ${currentLanguage === 'de' ? 'Antworte auf Deutsch' : 'Reply in English'}, freundlich und hilfreich.</s>`,
                    parameters: {
                        max_new_tokens: 250,
                        temperature: 0.7,
                        top_p: 0.95,
                        do_sample: true,
                        return_full_text: false
                    }
                })
            });

            if (!response.ok) {
                if (response.status === 503) {
                    return translations[currentLanguage].modelLoading;
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP Error: ${response.status}`);
            }

            const data = await response.json();
            
            if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
                // Entferne eventuelle Systemaufforderungen aus der Antwort
                let answer = data[0].generated_text
                    .replace(/\[INST\].*?\[\/INST\]/g, '')
                    .replace(/<s>|<\/s>/g, '')
                    .trim();
                
                return answer || translations[currentLanguage].noResponse;
            } else {
                return translations[currentLanguage].noResponse;
            }
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }
}); 