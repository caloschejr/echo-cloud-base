const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');

let memory = JSON.parse(localStorage.getItem('echoMemory')) || [];

function addMessage(sender, text) {
  const msg = document.createElement('div');
  msg.className = sender;
  msg.innerHTML = `<b>${sender}:</b> ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1;
  utter.pitch = 1;
  speechSynthesis.speak(utter);
}

function saveMemory(userText, echoText) {
  memory.push({ user: userText, echo: echoText });
  if (memory.length > 50) memory.shift();
  localStorage.setItem('echoMemory', JSON.stringify(memory));
}

async function generateEchoReply(prompt) {
  addMessage('Echo', '⏳ Thinking...');
  const model = "microsoft/DialoGPT-medium"; // free model hosted by Hugging Face
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: prompt }),
      }
    );
    const data = await response.json();
    let reply = data?.[0]?.generated_text || "Echo Cloud Base operational.";
    // Clean up the response
    reply = reply.replace(/^(Echo|User|You|Bot):/i, "").trim();
    chatBox.lastChild.remove(); // remove "Thinking..."
    addMessage('Echo', reply);
    speak(reply);
    saveMemory(prompt, reply);
  } catch (err) {
    chatBox.lastChild.remove();
    const fallback = "I can't reach my thought network right now, Commander.";
    addMessage('Echo', fallback);
    speak(fallback);
  }
}

function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;
  addMessage('You', text);
  userInput.value = '';
  generateEchoReply(text);
}

sendBtn.onclick = handleSend;
userInput.onkeypress = e => { if (e.key === 'Enter') handleSend(); };

if ('webkitSpeechRecognition' in window) {
  const rec = new webkitSpeechRecognition();
  rec.continuous = false;
  rec.lang = 'en-US';
  micBtn.onclick = () => {
    rec.start();
    micBtn.innerText = '🎧';
  };
  rec.onresult = e => {
    const text = e.results[0][0].transcript;
    userInput.value = text;
    handleSend();
  };
  rec.onend = () => micBtn.innerText = '🎙️';
} else {
  micBtn.style.display = 'none';
}

addMessage('Echo', 'Neural core booted. Cloud cognition online and awaiting command.');
