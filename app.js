const GEMINI_API_KEY = 'AIzaSyByNXWHWyC2w5kZFsKGdCYstrhQXxgthxY';

// DOM Elements
const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const chatLog = document.getElementById('chat-log');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

// Gemini API Integration
async function askGemini(prompt) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await res.json();
    try {
        return data.candidates[0].content.parts[0].text.trim();
    } catch {
        return "I can only open any new tabs like google,youtube and so onn.";
    }
}

// Speech Synthesis
function speak(text) {
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.volume = 1;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
}

// Print to Chat Log
function appendToLog(role, msg) {
    let label = (role === 'Jarvis' || role === 'Chitty') ? 'Chitty' : 'You';
    let color = (label === 'Chitty') ? '#0ff' : '#7df';
    chatLog.innerHTML += `<div><strong style="color:${color}">${label}:</strong> ${msg}</div>`;
    chatLog.scrollTop = chatLog.scrollHeight;
}

// Greeting on Load
function wishMe() {
    let h = new Date().getHours();
    if (h < 12) speak("Good morning! How can I help you?");
    else if (h < 18) speak("Good afternoon! How can I help you?");
    else speak("Good evening! How can I help you?");
}

window.addEventListener('load', () => {
    appendToLog('Chitty', "Hi! I'm your personal assistant. Click the mic or type below!");
    wishMe();
});

// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'en-US';

// Main Command Handler
async function takeCommand(msg) {
    if (!msg || !msg.trim()) return;
    appendToLog('You', msg);

    // Open any website command
    const openRegex = /^open (.+)$/i;
    const match = msg.match(openRegex);
    if (match) {
        let site = match[1].replace(/ /g, '').toLowerCase();
        let url = site.match(/^https?:\/\//) ? site : `https://${site.includes('.') ? site : site+'.com'}`;
        speak("Opening " + site);
        appendToLog('Chitty', "Opening " + url);
        window.open(url, '_blank');
        return;
    }

    // Default: Query Gemini
    content.textContent = "Thinking...";
    let reply = await askGemini(msg);
    speak(reply);
    content.textContent = "Click the mic & speak!";
    appendToLog('Chitty', reply);
}

// Voice input
btn.addEventListener('click', () => {
    content.textContent = "Listening...";
    recognition.start();
});
recognition.onresult = function(event) {
    let transcript = event.results[0][0].transcript.trim();
    content.textContent = transcript;
    takeCommand(transcript.toLowerCase());
};
recognition.onerror = function() {
    content.textContent = "Click the mic & speak!";
};

// Text/chat input
chatForm.addEventListener('submit', function(e) {
    e.preventDefault();
    let msg = chatInput.value.trim();
    if (msg) {
        takeCommand(msg);
        chatInput.value = '';
    }
});

// Optional: Press spacebar to start listening
document.body.onkeyup = function(e){
    if(e.code === "Space") btn.click();
};
