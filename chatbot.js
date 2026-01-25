(function () {
  const chatToggle = document.getElementById("chatToggle");
  const chatWidget = document.getElementById("chatWidget");
  const chatClose = document.getElementById("chatClose");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");

  // If this page doesn’t include the widget, do nothing
  if (
    !chatToggle ||
    !chatWidget ||
    !chatClose ||
    !chatForm ||
    !chatInput ||
    !chatMessages
  ) {
    return;
  }

  /* ================= CORE HELPERS ================= */

  function resetChat() {
    chatMessages.innerHTML = `
      <div class="chat-bubble bot">
        Hi! I’m StudioAura’s assistant. Ask me about interior design, crafts, or orders.
      </div>
    `;
  }

  function openChat() {
    chatWidget.style.display = "flex";
    chatWidget.setAttribute("aria-hidden", "false");
    setTimeout(() => chatInput.focus(), 50);
  }

  function closeChat() {
    chatWidget.style.display = "none";
    chatWidget.setAttribute("aria-hidden", "true");
    resetChat(); // 
  }

  function addBubble(text, who = "bot") {
    const div = document.createElement("div");
    div.className = `chat-bubble ${who}`;
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
  }

  async function sendToServer(message) {
    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    if (!res.ok) {
      let text = "Chat service error. Please try again.";
      try {
        const data = await res.json();
        if (data?.reply) text = data.reply;
      } catch {}
      throw new Error(text);
    }

    const data = await res.json();
    return data.reply || "Sorry, I couldn’t reply.";
  }

  /* ================= EVENT LISTENERS ================= */

  chatToggle.addEventListener("click", openChat);
  chatClose.addEventListener("click", closeChat);

  // Close when clicking outside the chat
  window.addEventListener("click", (e) => {
    if (chatWidget.style.display === "flex") {
      const clickedInside =
        chatWidget.contains(e.target) || chatToggle.contains(e.target);

      if (!clickedInside) {
        closeChat(); // resetChat() is already called inside
      }
    }
  });

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const msg = chatInput.value.trim();
    if (!msg) return;

    addBubble(msg, "user");
    chatInput.value = "";

    const typing = addBubble("Typing…", "meta");

    const sendBtn = chatForm.querySelector("button");
    if (sendBtn) sendBtn.disabled = true;

    try {
      const reply = await sendToServer(msg);
      typing.remove();
      addBubble(reply, "bot");
    } catch (err) {
      typing.remove();
      addBubble(err.message || "Something went wrong.", "bot");
    } finally {
      if (sendBtn) sendBtn.disabled = false;
    }
  });

  /* ================= INIT ================= */
  resetChat(); // ensure clean state on page load
})();
