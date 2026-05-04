// ============================================
// Mobile Menu Toggle
// ============================================
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const themeStorageKey = 'tmcTheme';

function getPreferredTheme() {
    const savedTheme = localStorage.getItem(themeStorageKey);
    if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
    }

    return 'light';
}

function applyTheme(theme) {
    document.body.dataset.theme = theme;
    const toggleButton = document.getElementById('themeToggle');
    if (toggleButton) {
        toggleButton.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        toggleButton.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }
}

function toggleTheme() {
    const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(themeStorageKey, nextTheme);
    applyTheme(nextTheme);
}

function injectThemeToggle() {
    if (document.getElementById('themeToggle')) {
        return;
    }

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.id = 'themeToggle';
    toggleButton.className = 'theme-toggle theme-toggle-fab';
    toggleButton.addEventListener('click', toggleTheme);
    document.body.appendChild(toggleButton);
    applyTheme(document.body.dataset.theme || getPreferredTheme());
}

applyTheme(getPreferredTheme());
document.addEventListener('DOMContentLoaded', injectThemeToggle);

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
}

// Close menu when a link is clicked
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu && navToggle) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });
});

// ============================================
// Dropdown Menu Toggle (Mobile)
// ============================================
const dropdownItems = document.querySelectorAll('.dropdown');
dropdownItems.forEach(item => {
    const link = item.querySelector('.nav-link');
    if (link) {
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                item.classList.toggle('active');
            }
        });
    }
});

// ============================================
// Radio Player Controls
// ============================================
const playBtn = document.getElementById('playBtn');
const volumeControl = document.getElementById('volumeControl');

let isPlaying = false;

if (playBtn) {
    playBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        if (isPlaying) {
            playBtn.textContent = '⏸ Pause';
            playBtn.style.background = '#666';
        } else {
            playBtn.textContent = '▶ Play';
            playBtn.style.background = 'var(--primary-color)';
        }
    });
}

if (volumeControl) {
    volumeControl.addEventListener('input', (e) => {
        console.log('Volume: ' + e.target.value + '%');
    });
}

// ============================================
// Smooth Scrolling for Navigation Links
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// Contact Form Submission
// ============================================
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = contactForm.querySelector('input[type="text"]').value;
        const email = contactForm.querySelector('input[type="email"]').value;
        const message = contactForm.querySelector('textarea').value;
        
        // Simple validation
        if (name && email && message) {
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        } else {
            alert('Please fill in all fields.');
        }
    });
}

// ============================================
// Responsive Navigation Adjustments
// ============================================
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navMenu && navToggle) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    }
});

// ============================================
// Scroll Animations (Optional - for future enhancement)
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe media cards for fade-in effect
document.querySelectorAll('.media-card, .video-card, .ebook-card, .song-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ============================================
// Search Functionality
// ============================================
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

if (searchInput && searchBtn) {
    const performSearch = () => {
        const query = searchInput.value.toLowerCase().trim();
        
        // Get all searchable items on the page
        const mediaCards = document.querySelectorAll('.media-card');
        const videoCards = document.querySelectorAll('.video-card');
        const songItems = document.querySelectorAll('.song-item');
        const ebookCards = document.querySelectorAll('.ebook-card');
        const radioPlayer = document.querySelector('.radio-player');
        const linksContent = document.querySelector('.links-content');
        
        let hasResults = false;
        
        // Search in media cards (Messages page)
        mediaCards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const matches = query === '' || text.includes(query);
            card.style.display = matches ? 'block' : 'none';
            if (matches) hasResults = true;
        });
        
        // Search in video cards
        videoCards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const matches = query === '' || text.includes(query);
            card.style.display = matches ? 'block' : 'none';
            if (matches) hasResults = true;
        });
        
        // Search in song items
        songItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            const matches = query === '' || text.includes(query);
            item.style.display = matches ? 'block' : 'none';
            if (matches) hasResults = true;
        });
        
        // Search in ebook cards
        ebookCards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const matches = query === '' || text.includes(query);
            card.style.display = matches ? 'block' : 'none';
            if (matches) hasResults = true;
        });
        
        // For radio and links pages
        if (radioPlayer) {
            const text = radioPlayer.textContent.toLowerCase();
            const matches = query === '' || text.includes(query);
            radioPlayer.style.display = matches ? 'block' : 'none';
            if (matches) hasResults = true;
        }
        
        if (linksContent) {
            const text = linksContent.textContent.toLowerCase();
            const matches = query === '' || text.includes(query);
            linksContent.style.display = matches ? 'block' : 'none';
            if (matches) hasResults = true;
        }
        
        // Show/hide no results message
        let noResultsMsg = document.querySelector('.no-results');
        if (query !== '' && !hasResults) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'no-results';
                noResultsMsg.textContent = 'No results found for "' + query + '"';
                const section = document.querySelector('.section');
                if (section) {
                    section.insertAdjacentElement('afterbegin', noResultsMsg);
                }
            }
            noResultsMsg.style.display = 'block';
        } else if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
    };
    
    // Search on button click
    searchBtn.addEventListener('click', performSearch);
    
    // Search on Enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Real-time search as user types
    searchInput.addEventListener('input', performSearch);
}

console.log('Church website loaded successfully!');
