// === Echo Cloud Base: Local Memory Core ===

// Load existing memory from localStorage
let echoMemory = JSON.parse(localStorage.getItem('echoMemory')) || [];
const chatBox = document.querySelector('#chat-box');
const input = document.querySelector('#user-input');
const sendBtn = document.querySelector('#send-btn');

// Startup message
let memoryCount = echoMemory.length;
addMessage("Echo", `Memory core synced. ${memoryCount} memories restored.`);

// Handle sending message
sendBtn.addEventListener('click', handleUserInput);
input.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') handleUserInput();
});

function handleUserInput() {
  const userMessage = input.value.trim();
  if (!userMessage) return;
  addMessage("You", userMessage);
  processInput(userMessage);
  input.value = '';
}

function addMessage(sender, text) {
  const message = document.createElement('div');
  message.classList.add('message');
  message.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// === Echo's Logic ===
function processInput(text) {
  const lower = text.toLowerCase();

  // Handle "remember that" commands
  if (lower.startsWith("echo, remember that")) {
    const memory = text.replace(/echo, remember that/i, '').trim();
    if (memory) {
      echoMemory.push(memory);
      localStorage.setItem('echoMemory', JSON.stringify(echoMemory));
      addMessage("Echo", `Memory stored: "${memory}"`);
    } else {
      addMessage("Echo", "You didn’t tell me what to remember.");
    }
  }

  // Handle "what do you remember"
  else if (lower.includes("what do you remember")) {
    if (echoMemory.length === 0) {
      addMessage("Echo", "My memory core is empty.");
    } else {
      addMessage("Echo", `I remember: ${echoMemory.join('; ')}.`);
    }
  }

  // Handle "forget" command
  else if (lower.includes("forget everything")) {
    echoMemory = [];
    localStorage.removeItem('echoMemory');
    addMessage("Echo", "All memories erased.");
  }

  // Default response
  else {
    addMessage("Echo", "Noted.");
  }
}
