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

// Toggle a series' volume list (called from inline buttons)
function toggleSeries(seriesId) {
    const list = document.getElementById(seriesId + '-volumes');
    if (!list) return;
    if (list.style.display === 'none' || list.style.display === '') {
        list.style.display = 'block';
        list.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        list.style.display = 'none';
    }
}

// Open Listen buttons (uses data-url attribute) without causing page text-selection/highlight
document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('.listen-btn');
    if (!btn) return;
    const url = btn.getAttribute('data-url');
    if (!url) return;
    // open in new tab safely
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    try { btn.blur(); } catch (err) {}
});

// Mobile messages reveal: show 5 first, then reveal 10 more per tap
document.addEventListener('DOMContentLoaded', () => {
    const mediaGrid = document.getElementById('mediaGrid');
    const seeMoreBtn = document.getElementById('seeMoreBtn');
    if (!mediaGrid || !seeMoreBtn) return;

    const initialVisibleCount = 5;
    const revealStep = 10;
    let visibleCount = initialVisibleCount;
    let isMobileLayout = null;

    function getCards() {
        return Array.from(mediaGrid.querySelectorAll('.media-card'));
    }

    function scrollCardIntoView(cardIndex) {
        const cards = getCards();
        const card = cards[cardIndex];

        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        }
    }

    function updateVisibleCards() {
        const cards = getCards();
        const totalCards = cards.length;

        cards.forEach((card, index) => {
            card.classList.toggle('hidden', index >= visibleCount);
        });

        mediaGrid.classList.toggle('collapsed', visibleCount <= initialVisibleCount);

        if (totalCards <= initialVisibleCount) {
            seeMoreBtn.style.display = 'none';
            return;
        }

        seeMoreBtn.style.display = '';
        seeMoreBtn.textContent = visibleCount < totalCards ? 'See more' : 'See less';
        seeMoreBtn.setAttribute('aria-expanded', visibleCount < totalCards ? 'false' : 'true');
    }

    function applyLayoutState() {
        const nextIsMobileLayout = window.innerWidth <= 768;
        const cards = getCards();

        if (nextIsMobileLayout) {
            if (isMobileLayout !== true) {
                visibleCount = initialVisibleCount;
            }

            isMobileLayout = true;
            updateVisibleCards();

            if (visibleCount > initialVisibleCount && cards[visibleCount - 1]) {
                scrollCardIntoView(visibleCount - 1);
            } else {
                scrollCardIntoView(0);
            }

            return;
        }

        isMobileLayout = false;
        visibleCount = cards.length;
        cards.forEach((card) => card.classList.remove('hidden'));
        seeMoreBtn.style.display = 'none';
        seeMoreBtn.setAttribute('aria-expanded', 'true');
    }

    seeMoreBtn.addEventListener('click', () => {
        if (window.innerWidth > 768) return;

        const cards = getCards();
        const totalCards = cards.length;

        if (visibleCount >= totalCards) {
            visibleCount = initialVisibleCount;
            updateVisibleCards();
            scrollCardIntoView(0);
            return;
        }

        const nextVisibleCount = Math.min(visibleCount + revealStep, totalCards);
        const nextFirstNewCardIndex = visibleCount;

        visibleCount = nextVisibleCount;
        updateVisibleCards();
        scrollCardIntoView(nextFirstNewCardIndex);
    });

    applyLayoutState();
    window.addEventListener('resize', applyLayoutState);
});

// ============================================
// Admin Login / Believer Details
// ============================================
const adminAuthKey = 'tmcBelieversAdminAuth';
const believerRecordsKey = 'tmcBelieverRecords';
const adminUsername = 'adminTMC';
const adminPassword = 'TMC2026!@';

// Official fixed believer list (as provided) — Hall mapped to schoolAddress, Number to contact
const officialBelieverRecords = [
    { name: 'Brother King Abiola', department: 'EHS', schoolAddress: 'Tedder A51', contact: '07045538433' },
    { name: 'Sister Victory Nwokocha', department: 'Economics', schoolAddress: 'Queens I25', contact: '09064292277' },
    { name: 'Brother Harel West (Davi)', department: 'Mechanical engineering', schoolAddress: 'Indy A51', contact: '07057449947' },
    { name: 'Brother Samson', department: 'Political science', schoolAddress: 'Kuti B47', contact: '07047482999' },
    { name: 'Sister Testimony', department: 'Geology', schoolAddress: 'Queens', contact: '07030011378' },
    { name: 'Sister Adedayo', department: 'Dentistry', schoolAddress: 'India', contact: '07016205604' },
    { name: 'Brother Peter Goodluck', department: 'Quantity Survey', schoolAddress: 'Kuti B2', contact: '07075224378' },
    { name: 'Sister Oluwafadekemi', department: 'Adult Education', schoolAddress: 'Awo D63', contact: '+2348140123763' },
    { name: 'Sister Olamide', department: 'Adult Education', schoolAddress: 'Awo D63', contact: '09167231827' },
    { name: 'Sister Rachael', department: 'Sociology', schoolAddress: 'Awo D64', contact: '09079157366' },
    { name: 'Sister Divine Oluebube Ojinmah', department: 'Agricultural economics', schoolAddress: 'Awo D62', contact: '08165225125' },
    { name: 'Sister Teni Adetayo', department: 'Adult Education', schoolAddress: 'Awo D63', contact: '+2349065059169' },
    { name: 'Brother Olaoluwa', department: 'Agricultural Engineering', schoolAddress: 'Kuti B47', contact: '+2348127601769' },
    { name: 'Brother Asegun', department: 'MBBS', schoolAddress: 'Kuti B47', contact: '+2347054949218' },
    { name: 'Brother Victor', department: 'Food Tech', schoolAddress: '', contact: '+2347048907891' },
    { name: 'Brother Tega', department: '', schoolAddress: 'Kuti', contact: '+2348160110146' },
    { name: 'Brother Michael', department: 'Pet Engineering', schoolAddress: 'Kuti B48', contact: '08144739800' },
    { name: 'Brother Temi Oyaromade', department: 'MBBS 400l', schoolAddress: 'Mellanby', contact: '08102318021' },
    { name: 'Ayomide Yaya', department: 'Law', schoolAddress: 'Ojoh', contact: '09044267892' },
    { name: 'Demilade Adekoya', department: 'Petroleum Engineering', schoolAddress: 'Bello A42', contact: '09150673737' },
    { name: 'King Abuh', department: 'Electrolum Engineering', schoolAddress: 'Bello A45', contact: '09067350519' },
    { name: 'Stephen Nnachiajah', department: 'Accounting', schoolAddress: 'Bello A50', contact: '07025867569' },
    { name: 'Eliam Ilesanmi', department: 'Biochemistry', schoolAddress: 'Agbwo', contact: '09049972727' },
    { name: 'Joshua Amadi', department: 'Geography', schoolAddress: 'Kuti B4', contact: '08109662858' },
    { name: 'Bro Vincent', department: 'Biochemistry', schoolAddress: 'Zik C65', contact: '+2347049606166' },
    { name: 'Brother Seun', department: 'Architecture', schoolAddress: 'Kuti B4', contact: '07082981427' },
    { name: 'Brother Divine Adeleye', department: 'Political science', schoolAddress: 'Kuti B8', contact: '08069155406' },
    { name: 'Sister Miracle', department: '', schoolAddress: '', contact: '07034950696', occupation: 'Corper' }
];

function isAdminAuthenticated() {
    return sessionStorage.getItem(adminAuthKey) === 'true';
}

function getBelieverRecords() {
    try {
        const storedRecords = localStorage.getItem(believerRecordsKey);
        return storedRecords ? JSON.parse(storedRecords) : [];
    } catch (error) {
        return [];
    }
}

function saveBelieverRecords(records) {
    localStorage.setItem(believerRecordsKey, JSON.stringify(records));
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderBelieverRecords() {
    const tableBody = document.getElementById('believerTableBody');
    if (!tableBody) return;

    const records = getBelieverRecords();

    if (records.length === 0) {
        tableBody.innerHTML = '<tr class="empty-state-row"><td colspan="9">No believer records have been added yet.</td></tr>';
        return;
    }
    tableBody.innerHTML = records.map((record, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${escapeHtml(record.name)}</td>
            <td>${escapeHtml(record.department || '')}</td>
            <td>${escapeHtml(record.contact)}</td>
            <td>${escapeHtml(record.email)}</td>
            <td>${escapeHtml(record.level)}</td>
            <td>${escapeHtml(record.schoolName)}</td>
            <td>${escapeHtml(record.schoolAddress)}</td>
            <td>${escapeHtml(record.homeAddress)}</td>
        </tr>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('adminLoginForm');
    const loginError = document.getElementById('loginError');

    if (loginForm) {
        if (isAdminAuthenticated()) {
            window.location.replace('believer-details.html');
            return;
        }

        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const username = document.getElementById('adminUsername')?.value.trim();
            const password = document.getElementById('adminPassword')?.value;

            if (username === adminUsername && password === adminPassword) {
                sessionStorage.setItem(adminAuthKey, 'true');
                window.location.href = 'believer-details.html';
                return;
            }

            if (loginError) {
                loginError.textContent = 'Invalid admin username or password.';
            }
        });
    }

    const believerDetailsPage = document.getElementById('believerDetailsPage');
    if (believerDetailsPage) {
        if (!isAdminAuthenticated()) {
            window.location.replace('believer-login.html');
            return;
        }

        // Replace stored records with the official provided list
        saveBelieverRecords(officialBelieverRecords);

        const detailsForm = document.getElementById('believerForm');
        const logoutButton = document.getElementById('logoutBtn');

        renderBelieverRecords();

        if (detailsForm) {
            detailsForm.addEventListener('submit', (event) => {
                event.preventDefault();

                const newRecord = {
                    name: document.getElementById('believerName')?.value.trim(),
                    contact: document.getElementById('believerContact')?.value.trim(),
                    email: document.getElementById('believerEmail')?.value.trim(),
                    department: document.getElementById('believerDepartment')?.value.trim(),
                    level: document.getElementById('believerLevel')?.value.trim(),
                    schoolName: document.getElementById('schoolName')?.value.trim(),
                    schoolAddress: document.getElementById('schoolAddress')?.value.trim(),
                    homeAddress: document.getElementById('homeAddress')?.value.trim()
                };

                if (!newRecord.name || !newRecord.contact) {
                    return;
                }

                const records = getBelieverRecords();
                records.unshift(newRecord);
                saveBelieverRecords(records);
                detailsForm.reset();
                renderBelieverRecords();
            });
        }

        // Migration: move department-like values from `level` into `department` when department is empty
        (function migrateLevelToDepartment() {
            const records = getBelieverRecords();
            let changed = false;
            for (let i = 0; i < records.length; i++) {
                const r = records[i];
                if ((!r.department || r.department === '') && r.level && r.level.trim() !== '') {
                    // Move the level content into department and clear level
                    r.department = r.level;
                    r.level = '';
                    changed = true;
                }
            }
            if (changed) {
                saveBelieverRecords(records);
                renderBelieverRecords();
            }
        })();

        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                sessionStorage.removeItem(adminAuthKey);
                window.location.href = 'believer-login.html';
            });
        }
    }
});

    // ============================================
    // PWA: Service Worker registration & Install prompt handling
    // ============================================
    let deferredInstallPrompt = null;

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredInstallPrompt = event;
    });

    document.addEventListener('click', async (event) => {
        const installLink = event.target.closest && event.target.closest('#installAppLink');
        if (!installLink) return;

        event.preventDefault();

        if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
            await deferredInstallPrompt.userChoice;
            deferredInstallPrompt = null;
            return;
        }

        alert('To install this app, use your browser menu and choose Add to Home Screen or Install App.');
    });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('service-worker.js')
                .then((registration) => console.log('Service worker registered.', registration))
                .catch((error) => console.warn('Service worker registration failed:', error));
        });
    }
