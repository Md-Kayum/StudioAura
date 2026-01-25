/* =========================
   NAVBAR TOGGLE
========================= */
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger?.addEventListener('click', () => {
  navLinks.classList.toggle('show');
});

/* =========================
   AUTH ELEMENTS
========================= */
const authModal = document.getElementById("authModal");
const closeModal = document.querySelector(".close");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");

const loginBtnMobile = document.getElementById("loginBtnMobile");
const registerBtnMobile = document.getElementById("registerBtnMobile");
const logoutBtnMobile = document.getElementById("logoutBtnMobile");

/* =========================
   INPUT ELEMENTS
========================= */
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");

/* =========================
   CLEAR INPUTS (IMPORTANT)
========================= */
function clearAuthInputs() {
  if (loginEmail) loginEmail.value = "";
  if (loginPassword) loginPassword.value = "";

  if (registerName) registerName.value = "";
  if (registerEmail) registerEmail.value = "";
  if (registerPassword) registerPassword.value = "";
}

/* =========================
   OPEN / CLOSE MODAL
========================= */
function openAuthModal(tab = "login") {
  clearAuthInputs();          // ✅ clear when opening
  authModal.style.display = "block";
  switchTab(tab);
}

loginBtn?.addEventListener("click", () => openAuthModal("login"));
registerBtn?.addEventListener("click", () => openAuthModal("register"));

loginBtnMobile?.addEventListener("click", () => {
  openAuthModal("login");
  navLinks.classList.remove("show");
});

registerBtnMobile?.addEventListener("click", () => {
  openAuthModal("register");
  navLinks.classList.remove("show");
});

closeModal?.addEventListener("click", () => {
  authModal.style.display = "none";
  clearAuthInputs();          // ✅ clear when closing
});

window.addEventListener("click", e => {
  if (e.target === authModal) {
    authModal.style.display = "none";
    clearAuthInputs();        // ✅ clear on outside click
  }
});

/* =========================
   TAB SWITCHING
========================= */
function switchTab(tabName) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

  document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add("active");
  document.getElementById(tabName).classList.add("active");

  clearAuthInputs();          // ✅ clear on tab switch
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => switchTab(tab.dataset.tab));
});

/* =========================
   REGISTER
========================= */
document.getElementById("registerSubmit")?.addEventListener("click", async () => {
  const name = registerName.value.trim();
  const email = registerEmail.value.trim();
  const password = registerPassword.value;

  if (!name || !email || !password) {
    alert("All fields are required");
    return;
  }

  const res = await fetch("http://localhost:3000/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  alert(data.message);

  if (res.ok) {
    clearAuthInputs();        // ✅ clear after register
    switchTab("login");
  }
});

/* =========================
   LOGIN
========================= */
document.getElementById("loginSubmit")?.addEventListener("click", async () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  if (!email || !password) {
    alert("Email and password required");
    return;
  }

  const res = await fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("user", JSON.stringify(data.user));
    authModal.style.display = "none";
    clearAuthInputs();        // ✅ clear after login
    updateAuthUI();
    alert(`Welcome ${data.user.name}`);
  } else {
    alert(data.message);
  }
});

/* =========================
   LOGOUT
========================= */
logoutBtn?.addEventListener("click", logout);
logoutBtnMobile?.addEventListener("click", logout);

function logout() {
  localStorage.removeItem("user");
  clearAuthInputs();          // ✅ clear on logout
  updateAuthUI();
  alert("Logged out successfully");
}

/* =========================
   UPDATE AUTH UI
========================= */
function updateAuthUI() {
  const user = localStorage.getItem("user");

  if (user) {
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";

    loginBtnMobile.style.display = "none";
    registerBtnMobile.style.display = "none";
    logoutBtnMobile.style.display = "block";
  } else {
    loginBtn.style.display = "inline-block";
    registerBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";

    loginBtnMobile.style.display = "inline-block";
    registerBtnMobile.style.display = "inline-block";
    logoutBtnMobile.style.display = "none";
  }
}

/* =========================
   INIT
========================= */
updateAuthUI();
// ================= CONSULTATION MODAL =================

const openBtns = document.querySelectorAll(".open-consultation");
const modal = document.getElementById("consultationModal");
const closeBtn = document.querySelector(".consultation-close");

openBtns.forEach(btn => {
  btn.addEventListener("click", e => {
    e.preventDefault();
    modal.style.display = "flex";
  });
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", e => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Temporary submit behavior
document.getElementById("consultationForm")?.addEventListener("submit", e => {
  e.preventDefault();

  alert("Thank you! We will contact you shortly.");

  e.target.reset();           // ✅ CLEAR FORM
  modal.style.display = "none";
});
