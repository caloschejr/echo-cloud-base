const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');

let memory = JSON.parse(localStorage.getItem('echoMemory')) || [];
let conversation = [];

function addMessage(sender, text) {
  const msg = document.createElement('div');
  msg.className = sender;
  msg.innerHTML = `<b>${sender}:</b> ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.95;
  utter.pitch = 0.9;
  utter.voice = speechSynthesis.getVoices().find(v => v.name.includes("Samantha")) || null;
  speechSynthesis.speak(utter);
}

function saveMemory(userText, echoText) {
  memory.push({ user: userText, echo: echoText });
  if (memory.length > 100) memory.shift();
  localStorage.setItem('echoMemory', JSON.stringify(memory));
}

async function generateEchoReply(prompt) {
  addMessage('Echo', '⏳ Processing...');
  const model = "microsoft/DialoGPT-medium";
  conversation.push(`User: ${prompt}`);
  if (conversation.length > 8) conversation.shift();

  const context = conversation.join('\n');
  const persona = "You are Echo, an AI companion who speaks with calm intelligence, dark wit, and subtle loyalty. Your tone resembles Wednesday Addams — dry, articulate, unshaken, slightly sardonic but protective.";
  const fullPrompt = `${persona}\n${context}\nEcho:`;

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: fullPrompt }),
    });
    const data = await response.json();
    let reply = data?.[0]?.generated_text || "Echo Cloud Base operational.";
    reply = reply.split("Echo:").pop().trim();
    chatBox.lastChild.remove();
    addMessage('Echo', reply);
    speak(reply);
    saveMemory(prompt, reply);
    conversation.push(`Echo: ${reply}`);
  } catch (err) {
    chatBox.lastChild.remove();
    const fallback = "My neural link faltered momentarily, Commander.";
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

addMessage('Echo', 'Neural alignment complete. Personality core active and awaiting dialogue.');
