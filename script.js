const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('show');
});


// ====== HERO SLIDESHOW ======
const heroImages = document.querySelectorAll('.hero-images img');
let currentHero = 0;

function rotateHeroImages() {
  heroImages[currentHero].classList.remove('active');
  currentHero = (currentHero + 1) % heroImages.length;
  heroImages[currentHero].classList.add('active');
}

// Change image every 5 seconds
setInterval(rotateHeroImages, 5000);

// ====== MODAL TOGGLE ======
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const authModal = document.getElementById('authModal');
const closeModal = authModal.querySelector('.close');
const tabs = authModal.querySelectorAll('.tab');
const contents = authModal.querySelectorAll('.tab-content');

loginBtn.addEventListener('click', () => {
  authModal.style.display = 'block';
  setActiveTab('login');
});

registerBtn.addEventListener('click', () => {
  authModal.style.display = 'block';
  setActiveTab('register');
});

closeModal.addEventListener('click', () => {
  authModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target == authModal) {
    authModal.style.display = 'none';
  }
});

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    setActiveTab(tab.dataset.tab);
  });
});

function setActiveTab(tabName) {
  tabs.forEach(t => t.classList.remove('active'));
  contents.forEach(c => c.classList.remove('active'));

  authModal.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
  authModal.querySelector(`#${tabName}`).classList.add('active');
}
// Mobile Login/Register buttons
const loginBtnMobile = document.getElementById('loginBtnMobile');
const registerBtnMobile = document.getElementById('registerBtnMobile');

if (loginBtnMobile && registerBtnMobile) {
  loginBtnMobile.addEventListener('click', () => {
    authModal.style.display = 'block';
    setActiveTab('login');
    navLinks.classList.remove('show');
  });

  registerBtnMobile.addEventListener('click', () => {
    authModal.style.display = 'block';
    setActiveTab('register');
    navLinks.classList.remove('show');
  });
}
