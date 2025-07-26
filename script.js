/**
 * SUBJECT HUB - OPTIMIZED JAVASCRIPT
 * Key Improvements:
 * 1. Non-blocking Firebase initialization
 * 2. Priority loading of UI components
 * 3. Lazy initialization of heavy features
 */

// ======================
// CORE FUNCTIONALITY
// ======================
document.addEventListener("DOMContentLoaded", () => {
    // 1. FIRST - Load critical UI components
    loadComponents();
    
    // 2. SECOND - Setup interactive elements
    setupVideoPlayer();
    setupSearch();
    
    // 3. LAST - Initialize Firebase ONLY if contact form exists
    if (document.getElementById('contactForm')) {
        initializeFirebase().then(() => {
            setupContactForm();
        });
    }
});

// ======================
// COMPONENT LOADING
// ======================
function loadComponents() {
    // Load header if not present
    if (!document.querySelector('header')) {
        fetch('header.html')
            .then(res => res.text())
            .then(html => {
                document.body.insertAdjacentHTML('afterbegin', html);
                // Setup search after header loads
                setupSearch();
            });
    }

    // Load footer if not present
    if (!document.querySelector('footer')) {
        fetch('footer.html')
            .then(res => res.text())
            .then(html => {
                document.body.insertAdjacentHTML('beforeend', html);
            });
    }
}

// ======================
// SEARCH FUNCTIONALITY
// ======================
function setupSearch() {
    const searchForm = document.querySelector('.search-bar');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
}

function handleSearch(event) {
    event.preventDefault();
    const input = event.target.search.value.toLowerCase().trim();
    
    const searchMap = {
        dsa: ["dsa", "data structures"],
        oop: ["oop", "object oriented"],
        toa: ["toa", "theory of automata"]
    };

    for (const [page, terms] of Object.entries(searchMap)) {
        if (terms.some(term => input.includes(term))) {
            window.location.href = `${page}.html`;
            return;
        }
    }
    
    alert("No matching subject found. Try 'DSA', 'OOP', or 'TOA'");
}

// ======================
// VIDEO PLAYER
// ======================
function setupVideoPlayer() {
    const videoItems = document.querySelectorAll('.video-list-item');
    if (!videoItems.length) return;

    const player = document.getElementById('mainVideoPlayer');
    const title = document.getElementById('videoTitle');

    const loadVideo = (videoId, videoTitle) => {
        player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        title.textContent = videoTitle;
        videoItems.forEach(item => {
            item.classList.toggle('active', item.dataset.videoId === videoId);
        });
    };

    videoItems.forEach(item => {
        item.addEventListener('click', () => {
            loadVideo(item.dataset.videoId, item.dataset.title);
        });
    });

    // Load first video
    if (videoItems[0]) {
        loadVideo(videoItems[0].dataset.videoId, videoItems[0].dataset.title);
    }
}

// ======================
// FIREBASE (LAZY LOADED)
// ======================
let contactFormDB;

async function initializeFirebase() {
    // Only load if not already initialized
    if (typeof firebase === 'undefined') {
        await loadScript('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
        await loadScript('https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js');
    }

    if (!firebase.apps.length) {
        firebase.initializeApp({
            apiKey: "AIzaSyB5-7zd6mb0pIDiwux3GiIjdSzMSD8kQj8",
            authDomain: "subjectwebsite-156bd.firebaseapp.com",
            databaseURL: "https://subjectwebsite-156bd-default-rtdb.firebaseio.com",
            projectId: "subjectwebsite-156bd",
            storageBucket: "subjectwebsite-156bd.firebasestorage.app",
            messagingSenderId: "239431444842",
            appId: "1:239431444842:web:00313a66185dcfa51b1d13"
        });
    }
    
    contactFormDB = firebase.database().ref("contactForm");
}

function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// ======================
// CONTACT FORM
// ======================
function setupContactForm() {
    document.getElementById('contactForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (validateContactForm(e.target)) {
            await submitContactForm(e.target);
        }
    });
}

function validateContactForm(form) {
    let isValid = true;
    clearErrors();

    const fields = [
        { id: 'firstName', error: 'First name is required' },
        { id: 'lastName', error: 'Last name is required' },
        { 
            id: 'email', 
            error: 'Valid email is required',
            validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
        }
    ];

    fields.forEach(({ id, error, validate }) => {
        const input = document.getElementById(id);
        const value = input.value.trim();
        
        if (!value || (validate && !validate(value))) {
            showError(input, error);
            isValid = false;
        }
    });

    return isValid;
}

async function submitContactForm(form) {
    try {
        await contactFormDB.push({
            firstName: getValue('firstName'),
            lastName: getValue('lastName'),
            email: getValue('email'),
            phone: getValue('phone') || 'N/A'
        });
        
        showSuccess();
        form.reset();
    } catch (error) {
        console.error("Submission error:", error);
        alert("Submission failed. Please try again.");
    }
}

// ======================
// UTILITIES
// ======================
function showError(input, message) {
    input.classList.add('error');
    const errorDiv = input.nextElementSibling?.classList.contains('error-message') 
        ? input.nextElementSibling
        : createErrorElement(input);
    errorDiv.textContent = message;
}

function createErrorElement(input) {
    const div = document.createElement('div');
    div.className = 'error-message';
    input.parentNode.insertBefore(div, input.nextSibling);
    return div;
}

function clearErrors() {
    document.querySelectorAll('.error').forEach(el => {
        el.classList.remove('error');
    });
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
}

function showSuccess() {
    const success = document.createElement('div');
    success.className = 'success-message';
    success.innerHTML = `<p>✓ Thank you for your message!</p>`;
    document.querySelector('.contact-form-container').appendChild(success);
    setTimeout(() => success.remove(), 5000);
}

function getValue(id) {
    return document.getElementById(id)?.value.trim() || '';
}