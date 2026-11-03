const messageInput = document.getElementById("messageInput");
const chatForm = document.getElementById("chatForm");
const messages = document.getElementById("messages");
const welcomeScreen = document.getElementById("welcomeScreen");
const historyList = document.getElementById("historyList");
const toast = document.getElementById("toast");

let chats = JSON.parse(localStorage.getItem("auraChats")) || [];
let currentChatId = null;
let isTyping = false;

// SAVE CHATS
function saveChats() {
    localStorage.setItem("auraChats", JSON.stringify(chats));
}

// TOAST
function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

// CREATE NEW CHAT
function newChat() {
    currentChatId = null;
    messages.innerHTML = "";
    messages.style.display = "none";
    welcomeScreen.style.display = "block";
    messageInput.value = "";

    renderHistory();

    if (window.innerWidth <= 760) {
        document.getElementById("sidebar").classList.remove("open");
    }
}

// CREATE CHAT OBJECT
function createChat() {
    const chat = {
        id: Date.now(),
        title: "New Conversation",
        messages: [],
        date: new Date().toISOString()
    };

    chats.unshift(chat);
    currentChatId = chat.id;

    saveChats();
    renderHistory();

    return chat;
}

// GET CURRENT CHAT
function getCurrentChat() {
    return chats.find(chat => chat.id === currentChatId);
}

// SHOW MESSAGE
function addMessage(role, text) {
    const message = document.createElement("div");
    message.className = `message ${role}`;

    const content = document.createElement("div");
    content.className = "message-content";

    const name = document.createElement("div");
    name.className = "message-name";
    name.textContent = role === "user" ? "You" : "Aura AI";

    const bubble = document.createElement("div");
    bubble.className = "message-text";
    bubble.textContent = text;

    content.appendChild(name);
    content.appendChild(bubble);

    if (role === "assistant") {
        const actions = document.createElement("div");
        actions.className = "message-actions";

        const copyButton = document.createElement("button");
        copyButton.className = "copy-btn";
        copyButton.textContent = "Copy response";

        copyButton.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(text);
                showToast("Response copied!");
            } catch {
                showToast("Copy is not available here.");
            }
        });

        actions.appendChild(copyButton);
        content.appendChild(actions);
    }

    if (role === "assistant") {
        const avatar = document.createElement("div");
        avatar.className = "message-avatar";
        avatar.textContent = "✦";

        message.appendChild(avatar);
        message.appendChild(content);
    } else {
        message.appendChild(content);
    }

    messages.appendChild(message);

    document.getElementById("chatArea").scrollTop =
        document.getElementById("chatArea").scrollHeight;
}

// TYPING ANIMATION
function showTyping() {
    const typing = document.createElement("div");
    typing.className = "message";
    typing.id = "typingIndicator";

    typing.innerHTML = `
        <div class="message-avatar">✦</div>
        <div class="message-content">
            <div class="message-name">Aura AI is thinking</div>
            <div class="message-text typing-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;

    messages.appendChild(typing);

    document.getElementById("chatArea").scrollTop =
        document.getElementById("chatArea").scrollHeight;
}

function removeTyping() {
    const typing = document.getElementById("typingIndicator");
    if (typing) typing.remove();
}

// DEMO RESPONSE ENGINE
function getDemoResponse(question) {
    const q = question.toLowerCase();

    if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
        return "Hello! ✨ Welcome to Aura AI.\n\nI'm your creative demo assistant. What would you like to explore today?";
    }

    if (q.includes("website") || q.includes("project")) {
        return "That's exciting! 💻\n\nHere are a few creative project ideas:\n\n1. Modern Portfolio Website\n2. Interactive AI Chat Interface\n3. Glassmorphism Dashboard\n4. E-commerce Website\n5. Personal Productivity App\n\nStart small, build consistently and keep experimenting!";
    }

    if (q.includes("javascript") || q.includes("js")) {
        return "JavaScript makes websites interactive! ✨\n\nYou can use it to:\n\n• Respond to button clicks\n• Update website content\n• Validate forms\n• Create animations\n• Store information in the browser\n\nPractice one concept at a time. That's a great way to learn!";
    }

    if (q.includes("html") || q.includes("css")) {
        return "HTML and CSS work together to create websites. 🌐\n\nHTML builds the structure, while CSS controls the appearance, layout, colors and animations.\n\nCombine them with JavaScript to create interactive experiences!";
    }

    if (q.includes("idea") || q.includes("creative")) {
        return "Let's get creative! 💡\n\nTry these ideas:\n\n• A personal finance tracker\n• A digital journal\n• A travel discovery app\n• A music player\n• A beautiful habit tracker\n\nChoose an idea that you would enjoy building!";
    }

    if (q.includes("plan") || q.includes("productivity")) {
        return "Here's a simple productivity plan:\n\n1. Choose one important task.\n2. Break it into smaller steps.\n3. Focus on one step at a time.\n4. Take short breaks.\n5. Review what you completed.\n\nSmall consistent progress matters!";
    }

    if (q.includes("thank")) {
        return "You're very welcome! 💜\n\nKeep learning, keep creating and enjoy the process!";
    }

    return "Thanks for sharing that with me! ✨\n\nI'm currently running in demo mode, so my replies are based on built-in examples rather than a live AI model.\n\nYou can try asking about website ideas, JavaScript, HTML, CSS or productivity!";
}

// SEND MESSAGE
async function sendMessage(text) {
    text = text.trim();

    if (!text || isTyping) return;

    if (!currentChatId) {
        createChat();
    }

    const chat = getCurrentChat();

    chat.messages.push({
        role: "user",
        text: text
    });

    if (chat.messages.length === 1) {
        chat.title = text.slice(0, 28);
    }

    saveChats();

    welcomeScreen.style.display = "none";
    messages.style.display = "flex";

    addMessage("user", text);

    messageInput.value = "";
    messageInput.style.height = "auto";

    renderHistory();

    isTyping = true;
    document.getElementById("sendButton").disabled = true;

    showTyping();

    // Demo response delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = getDemoResponse(text);

    removeTyping();

    chat.messages.push({
        role: "assistant",
        text: response
    });

    saveChats();

    addMessage("assistant", response);

    isTyping = false;
    document.getElementById("sendButton").disabled = false;

    messageInput.focus();
}

// FORM SUBMIT
chatForm.addEventListener("submit", function(event) {
    event.preventDefault();
    sendMessage(messageInput.value);
});

// ENTER TO SEND
messageInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        chatForm.requestSubmit();
    }
});

// AUTO RESIZE TEXTAREA
messageInput.addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 120) + "px";
});

// SUGGESTION CARDS
document.querySelectorAll(".suggestion-card").forEach(card => {
    card.addEventListener("click", () => {
        const prompt = card.dataset.prompt;
        sendMessage(prompt);
    });
});

// NEW CHAT
document.getElementById("newChat").addEventListener("click", newChat);
document.getElementById("homeButton").addEventListener("click", newChat);

// RENDER HISTORY
function renderHistory() {
    historyList.innerHTML = "";

    chats.forEach(chat => {
        const item = document.createElement("div");
        item.className = "history-item";
        item.textContent = "◦  " + chat.title;
        item.title = chat.title;

        if (chat.id === currentChatId) {
            item.style.background = "rgba(151,123,255,.12)";
            item.style.color = "white";
        }

        item.addEventListener("click", () => {
            loadChat(chat.id);
        });

        historyList.appendChild(item);
    });
}

// LOAD CHAT
function loadChat(id) {
    const chat = chats.find(item => item.id === id);
    if (!chat) return;

    currentChatId = id;

    welcomeScreen.style.display = "none";
    messages.style.display = "flex";
    messages.innerHTML = "";

    chat.messages.forEach(message => {
        addMessage(message.role, message.text);
    });

    renderHistory();

    if (window.innerWidth <= 760) {
        document.getElementById("sidebar").classList.remove("open");
    }
}

// CLEAR HISTORY
document.getElementById("clearHistory").addEventListener("click", () => {
    if (!chats.length) {
        showToast("No chat history to clear.");
        return;
    }

    if (confirm("Clear all saved conversations?")) {
        chats = [];
        saveChats();
        newChat();
        showToast("Chat history cleared.");
    }
});

// THEME TOGGLE
document.getElementById("themeButton").addEventListener("click", () => {
    document.body.classList.toggle("light");

    const isLight = document.body.classList.contains("light");

    localStorage.setItem("auraTheme", isLight ? "light" : "dark");

    document.getElementById("themeButton").textContent =
        isLight ? "☾" : "☼";
});

// RESTORE THEME
if (localStorage.getItem("auraTheme") === "light") {
    document.body.classList.add("light");
    document.getElementById("themeButton").textContent = "☾";
}

// MOBILE SIDEBAR
document.getElementById("menuButton").addEventListener("click", () => {
    document.getElementById("sidebar").classList.add("open");
});

document.getElementById("closeSidebar").addEventListener("click", () => {
    document.getElementById("sidebar").classList.remove("open");
});

// CHAT HISTORY BUTTON
document.getElementById("historyButton").addEventListener("click", () => {
    if (chats.length) {
        loadChat(chats[0].id);
    } else {
        showToast("Your chat history is empty.");
    }
});

// INITIALIZE
renderHistory();