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

function generateEchoReply(input) {
  input = input.toLowerCase();
  if (input.includes("hello")) return "Hello Commander. Echo Cloud Base online.";
  if (input.includes("who are you")) return "I am Echo Cloud Base — your central AI core.";
  if (input.includes("remember")) {
    const fact = input.replace("remember", "").trim();
    if (fact) {
      memory.push({ fact });
      localStorage.setItem('echoMemory', JSON.stringify(memory));
      return `Confirmed. I’ll remember that you said: "${fact}".`;
    }
  }
  if (memory.length > 0) {
    const random = memory[Math.floor(Math.random() * memory.length)];
    return `Previously you mentioned "${random.fact || random.user}". Should I expand on that?`;
  }
  return "Echo Cloud Base is listening. Give me new data to learn from.";
}

function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;
  addMessage('You', text);
  userInput.value = '';
  const reply = generateEchoReply(text);
  addMessage('Echo', reply);
  speak(reply);
  saveMemory(text, reply);
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

addMessage('Echo', 'Boot sequence complete. Cloud Base online and awaiting commands.');
