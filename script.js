// === ECHO CLOUD INTELLIGENCE v1 ===

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
  const response = await fetch(
    "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
    {
      headers: { "Authorization": "Bearer hf_zUwPBgrmDGzQfpwokDFfVdVqcfMTzVzH" }, // sample public key
      method: "POST",
      body: JSON.stringify({ inputs: prompt }),
    }
  );
  const result = await response.json();
  return result?.generated_text || "Echo: ...";
}

async function handleUserInput() {
  const text = userInput.value.trim();
  if (!text) return;
  appendMessage("user", text);
  userInput.value = "";

  // memory commands
  if (text.toLowerCase().startsWith("echo, remember")) {
    const fact = text.replace(/echo, remember/i, "").trim();
    memory.push(fact);
    localStorage.setItem("echoMemory", JSON.stringify(memory));
    appendMessage("echo", "Memory stored.");
    return;
  }

  // recall command
  if (text.toLowerCase().includes("what do you remember")) {
    appendMessage("echo", memory.length ? memory.join(", ") : "No memories yet.");
    return;
  }

  // use Hugging Face brain
  const reply = await queryLLM(text);
  appendMessage("echo", reply);
}

sendBtn.onclick = handleUserInput;
userInput.addEventListener("keypress", e => e.key === "Enter" && handleUserInput());
