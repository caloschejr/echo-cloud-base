// === Echo Cloud Base : Stable Local Memory Core ===
// (Fully matched to your index.html IDs)

let echoMemory = JSON.parse(localStorage.getItem("echoMemory")) || [];

const chatBox = document.querySelector("#chatBox");
const input = document.querySelector("#userInput");
const sendBtn = document.querySelector("#sendBtn");

// === Boot sequence ===
addMessage("Echo", `Memory core synced. ${echoMemory.length} memories restored.`);

sendBtn.addEventListener("click", handleUserInput);
input.addEventListener("keypress", e => {
  if (e.key === "Enter") handleUserInput();
});

function handleUserInput() {
  const msg = input.value.trim();
  if (!msg) return;
  addMessage("You", msg);
  processInput(msg);
  input.value = "";
}

function addMessage(sender, text) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// === Core logic ===
function processInput(text) {
  const lower = text.toLowerCase();

  // Remember command
  if (lower.startsWith("echo, remember that")) {
    const memory = text.replace(/echo, remember that/i, "").trim();
    if (memory) {
      echoMemory.push(memory);
      localStorage.setItem("echoMemory", JSON.stringify(echoMemory));
      addMessage("Echo", `Memory stored: "${memory}".`);
    } else {
      addMessage("Echo", "You didn’t tell me what to remember.");
    }
    return;
  }

  // Recall memory
  if (lower.includes("what do you remember")) {
    if (!echoMemory.length) {
      addMessage("Echo", "My memory core is empty.");
    } else {
      addMessage("Echo", "I remember: " + echoMemory.join("; ") + ".");
    }
    return;
  }

  // Forget command
  if (lower.includes("forget everything")) {
    echoMemory = [];
    localStorage.removeItem("echoMemory");
    addMessage("Echo", "All memories erased.");
    return;
  }

  // Default fallback
  addMessage("Echo", "Noted.");
}
