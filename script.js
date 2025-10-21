// === ECHO CLOUD INTELLIGENCE v2.0 ===
// Adds CORS-safe cloud brain + local fallback mini-brain + self-diagnostic

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

let memory = JSON.parse(localStorage.getItem("echoMemory")) || [];

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = sender;
  msg.innerText = `${sender === "echo" ? "Echo" : "You"}: ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

appendMessage("echo", `Memory core synced. ${memory.length} memories restored.`);

// ----- Mini-Brain (offline fallback) -----
function localBrain(prompt) {
  prompt = prompt.toLowerCase();
  if (prompt.includes("rain")) return "I like storms. They remind me the world still moves without me.";
  if (prompt.includes("hello")) return "Greetings. Cloud cognition standing by.";
  if (prompt.includes("who are you")) return "I am Echo, your persistent cloud construct.";
  if (prompt.includes("weather")) return "Clouds amuse me. They mirror my network.";
  return "Connection degraded. Using local cognition only.";
}

// ----- Cloud Brain -----
async function queryLLM(prompt) {
  try {
    const response = await fetch(
      `https://api.allorigins.win/raw?url=${encodeURIComponent(
        "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill"
      )}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: prompt }),
      }
    );
    const result = await response.json();
    let reply =
      result.generated_text ||
      (Array.isArray(result) && result[0]?.generated_text);
    if (!reply) throw new Error("empty reply");
    return reply;
  } catch (e) {
    console.warn("Echo fallback engaged:", e.message);
    return localBrain(prompt);
  }
}

// ----- Main Handler -----
async function handleUserInput() {
  const text = userInput.value.trim();
  if (!text) return;
  appendMessage("user", text);
  userInput.value = "";

  // Memory commands
  if (text.toLowerCase().startsWith("echo, remember")) {
    const fact = text.replace(/echo, remember/i, "").trim();
    memory.push(fact);
    localStorage.setItem("echoMemory", JSON.stringify(memory));
    appendMessage("echo", "Memory stored.");
    return;
  }

  if (text.toLowerCase().includes("what do you remember")) {
    appendMessage("echo", memory.length ? memory.join(", ") : "No memories yet.");
    return;
  }

  // Brain query
  const reply = await queryLLM(text);
  appendMessage("echo", reply);
}

sendBtn.onclick = handleUserInput;
userInput.addEventListener("keypress", e => e.key === "Enter" && handleUserInput());
