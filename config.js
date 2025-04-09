const config = {
    huggingFaceToken: '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' // Füge deinen Hugging Face API-Key hier ein
};

// Überprüfe, ob ein API-Key vorhanden ist
if (!config.huggingFaceToken) {
    console.error('Bitte füge deinen Hugging Face API-Key in der config.js Datei ein!');
    document.addEventListener('DOMContentLoaded', () => {
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.innerHTML = `
                <div class="message assistant-message" style="color: red;">
                    Bitte füge deinen Hugging Face API-Key in der config.js Datei ein!<br>
                    1. Gehe zu <a href="https://huggingface.co/settings/tokens" target="_blank" class="text-blue-500 hover:underline">Hugging Face Tokens</a><br>
                    2. Erstelle einen neuen Token<br>
                    3. Kopiere den Token und füge ihn in die config.js Datei ein
                </div>
            `;
        }
    });
} 