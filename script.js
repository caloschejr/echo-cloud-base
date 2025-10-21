// === ECHO CLOUD INTELLIGENCE v1.1 (CORS-safe) ===

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");

let memory = JSON.parse(localStorage.getItem("echoMemory")) || [];

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = sender;
  msg.innerText = `${sender === "echo" ? "Echo" : "You"}: ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

appendMessage("echo", `Memory core synced. ${memory.length} memories restored.`);

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
    if (result.generated_text) return result.generated_text;
    if (Array.isArray(result) && result[0]?.generated_text)
      return result[0].generated_text;
    return "Echo: ...";
  } catch (err) {
    console.error(err);
    return "Echo: Connection interference detected. Try again.";
  }
}

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

  const reply = await queryLLM(text);
  appendMessage("echo", reply);
}

sendBtn.onclick = handleUserInput;
userInput.addEventListener("keypress", e => e.key === "Enter" && handleUserInput());
