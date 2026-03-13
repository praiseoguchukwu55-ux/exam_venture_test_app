/**
 * UI & VIEW CONTROLS
 */
function toggleSidebar() {
    const menu = document.getElementById("side-menu");
    const overlay = document.getElementById("overlay");
    if (menu) menu.classList.toggle("active");
    if (overlay) overlay.style.display = menu.classList.contains("active") ? "block" : "none";
}

function switchView(viewId) {
    // 1. Hide all views and show the target one
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    const targetView = document.getElementById(viewId);
    if (targetView) targetView.classList.add('active');

    // 2. Update Navigation Highlight
    // Select ONLY nav-items inside the <nav> element to avoid the profile header
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-item');
    navLinks.forEach(item => item.classList.remove('active'));
    
    // Map view IDs to the correct link index in the sidebar-nav
    const navIndices = { 
        'view-dashboard': 0, 
        'view-calc': 1, 
        'view-target': 2,
        'view-profile': 3,
    };
    
    const activeIndex = navIndices[viewId];
    if (activeIndex !== undefined && navLinks[activeIndex]) {
        navLinks[activeIndex].classList.add('active');
    }
    
    // 3. Close sidebar
    const menu = document.getElementById("side-menu");
    if (menu && menu.classList.contains("active")) toggleSidebar();
    if (viewId === 'view-target') {
        updateRemainingUnitsDisplay();
        }
}
/**
 * SEMESTER & COURSE ROW LOGIC (4.0 Scale Version)
 */
function renderCourseRow(code = '', unit = '', grade = '4') { // Default grade changed to '4'
    const container = document.getElementById('course-container');
    const row = document.createElement('div');
    row.className = 'course-row';
    row.style.opacity = '0';
    row.style.transform = 'translateY(15px)';
    row.style.transition = 'all 0.3s ease-out';
    
    // Updated points and options for 4.0 scale
    row.innerHTML = `
        <input type="text" placeholder="Course" class="inp-code" value="${code}">
        <input type="number" placeholder="Unit" class="inp-unit" value="${unit}">
        <select class="inp-grade">
            <option value="4" ${grade == '4' ? 'selected' : ''}>A</option>
            <option value="3" ${grade == '3' ? 'selected' : ''}>B</option>
            <option value="2" ${grade == '2' ? 'selected' : ''}>C</option>
            <option value="1" ${grade == '1' ? 'selected' : ''}>D</option>
            <option value="0" ${grade == '0' ? 'selected' : ''}>F</option>
        </select>
        <button class="btn-remove" onclick="removeRow(this)">×</button>
    `;
    
    container.appendChild(row);
    requestAnimationFrame(() => {
        row.style.opacity = '1';
        row.style.transform = 'translateY(0)';
    });
}
function addCourseRow() {
    renderCourseRow();
}

function removeRow(btn) {
    const row = btn.parentElement;
    row.style.opacity = '0';
    row.style.transform = 'translateX(20px)';
    setTimeout(() => row.remove(), 200);
}
function populateSemesters() {
    const select = document.getElementById('sem-select');
    if (!select) return;
    const levels = [100, 200, 300, 400, 500, 600];
    const sessions = ["First Semester", "Second Semester"];
    
    select.innerHTML = ''; 
    levels.forEach(level => {
        sessions.forEach(session => {
            const option = document.createElement('option');
            option.value = `${level}-${session.split(' ')[0]}`;
            option.textContent = `${level} Level - ${session}`;
            select.appendChild(option);
        });
    });

    // Handle semester change
    select.addEventListener('change', (e) => loadSemesterData(e.target.value));
}

/**
 * DATA PERSISTENCE (SAVE & LOAD)
 */
function loadSemesterData(semesterKey) {
    const container = document.getElementById('course-container');
    container.innerHTML = ''; 
    
    // CHANGE: Added '4' to the key prefix
    const savedData = localStorage.getItem(`data4-${semesterKey}`);
    if (savedData) {
        JSON.parse(savedData).forEach(c => renderCourseRow(c.code, c.unit, c.grade));
    } else {
        for(let i=0; i<5; i++) renderCourseRow();
    }
}

function saveSemesterData() {
    const selectedSem = document.getElementById('sem-select').value;
    const rows = document.querySelectorAll('.course-row');
    const semesterData = [];

    // 1. Collect data using the exact classes from your HTML/JS
    rows.forEach(row => {
        const code = row.querySelector('.inp-code').value;
        const unit = row.querySelector('.inp-unit').value;
        const grade = row.querySelector('.inp-grade').value;

        if (code || unit > 0) {
            semesterData.push({ 
                code: code, 
                unit: parseInt(unit) || 0, 
                grade: grade 
            });
        }
    });

    // Validation
    if (semesterData.length === 0) {
        alert("Please add at least one course before saving.");
        return;
    }

    // 2. Commit to LocalStorage
    localStorage.setItem(`data4-${selectedSem}`, JSON.stringify(semesterData));

    // 3. Update all Dashboard numbers (CGPA, Class, Units)
    updateDashboard(); 
    
    // 4. Update Remaining Units for the Target Tracker
    getRemainingUnits(); 

    // 5. THE REDIRECT: Jump to the Homepage (Dashboard)
    switchView('view-dashboard');

    console.log(`Successfully saved and redirected for ${selectedSem}`);
}

/**
 * DASHBOARD & ANALYSIS (4.0 Scale Version)
 */
function updateDashboard() {
    let totalPoints = 0, totalUnits = 0;

    // 1. CHANGE: filter only for data4- keys to isolate from 5.0 data
    Object.keys(localStorage).filter(k => k.startsWith("data4-")).forEach(key => {
        JSON.parse(localStorage.getItem(key)).forEach(course => {
            const units = parseInt(course.unit) || 0;
            totalUnits += units;
            // The grade here will already be 0-4 because of our earlier renderCourseRow fix
            totalPoints += (units * (parseInt(course.grade) || 0));
        });
    });

    const cgpa = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : "0.00";
    
    document.getElementById('display-cgpa').innerText = cgpa;
    document.getElementById('display-units').innerText = totalUnits;

    // 2. CHANGE: Updated boundaries for the 4.0 Scale
    let degreeClass = "Pass";
    let nextBoundary = 4.0;
    let boundaryName = "Perfect 4.0";

    if (cgpa >= 3.5) {
        degreeClass = "First Class";
        nextBoundary = 4.0;
        boundaryName = "Max GPA";
    } else if (cgpa >= 3.0) {
        degreeClass = "2nd Class Upper";
        nextBoundary = 3.5;
        boundaryName = "First Class";
    } else if (cgpa >= 2.0) {
        degreeClass = "2nd Class Lower";
        nextBoundary = 3.0;
        boundaryName = "2nd Class Upper";
    } else if (cgpa >= 1.0) {
        degreeClass = "Third Class";
        nextBoundary = 2.0;
        boundaryName = "2nd Class Lower";
    }

    document.getElementById('display-class').innerText = degreeClass;

    // 3. CHANGE: Math updated for 4.0 scale
    const gap = (nextBoundary - parseFloat(cgpa)).toFixed(2);
    const progressPercent = (parseFloat(cgpa) / 4) * 100; // Divided by 4 instead of 5

    const predictorDiv = document.getElementById('class-predictor');
    if (predictorDiv) {
        predictorDiv.innerHTML = `
            <div class="progress-container">
                <div class="progress-bar" style="width: ${progressPercent}%"></div>
            </div>
            <small style="color: var(--text-dim)">
                ${gap > 0 ? `<b>${gap}</b> points away from <b>${boundaryName}</b>` : "Top Tier Reached"}
            </small>
        `;
    }

    renderAcademicHistory(); 
}
function getRemainingUnits() {
    const TOTAL_DEGREE_UNITS = 120; // 4.0 systems often use 120 (adjust as needed)
    let earnedUnits = 0;
    
    // CHANGE: Filter for data4-
    Object.keys(localStorage).filter(k => k.startsWith("data4-")).forEach(key => {
        JSON.parse(localStorage.getItem(key)).forEach(c => earnedUnits += (parseInt(c.unit) || 0));
    });
    
    const remainingInput = document.getElementById('remaining-units');
    if (remainingInput) remainingInput.value = Math.max(0, TOTAL_DEGREE_UNITS - earnedUnits);
}

function calculateTarget() {
    const goal = parseFloat(document.getElementById('goal-input').value);
    const remainingUnitsInput = document.getElementById('remaining-units');
    const resultDiv = document.getElementById('target-result');

    if (!goal || !remainingUnitsInput.value) {
        alert("Wait! I need your target CGPA and remaining units to start the audit. 😊");
        return;
    }

    let currentPoints = 0;
    let currentUnits = 0;
    let historyAudit = [];
    let asCount = 0;
    let bsCount = 0;

    // --- FIXED STEP 1: Using the correct 'data4-' prefix ---
    Object.keys(localStorage).filter(k => k.startsWith("data4-")).sort().forEach(key => {
        const semesterData = JSON.parse(localStorage.getItem(key));
        const semLabel = key.replace('data4-', '').replace('-', ' Level ');
        
        semesterData.forEach(c => {
            const u = parseFloat(c.unit || c.units || 0);
            const g = parseFloat(c.grade || 0);
            if (u > 0) {
                currentUnits += u;
                currentPoints += (u * g);
                if(g === 4) asCount++; 
                if(g === 3) bsCount++; 
                historyAudit.push({ 
                    code: c.code || 'Course', 
                    unit: u, 
                    grade: g, 
                    sem: semLabel 
                });
            }
        });
    });

    // --- STEP 2: THE 4.0 MATH ENGINE ---
    const remainingUnits = parseFloat(remainingUnitsInput.value);
    const totalUnitsFinal = currentUnits + remainingUnits;
    const currentCGPA = currentUnits > 0 ? (currentPoints / currentUnits).toFixed(2) : "0.00";
    const totalPointsNeeded = goal * totalUnitsFinal;
    const pointsToEarn = totalPointsNeeded - currentPoints;
    const requiredGPA = (pointsToEarn / remainingUnits).toFixed(2);
    
    const maxPossible = ((currentPoints + (remainingUnits * 4)) / totalUnitsFinal).toFixed(2);

    resultDiv.style.display = "block";
    
    // --- STEP 3: OUTPUT ---
    let greeting = "Hey Champ! 👋";
    if (currentCGPA >= 3.5) greeting = "Wow, a First Class Scholar! 🚀"; 
    else if (currentCGPA >= 3.0) greeting = "Solid work so far! 🙌";

    let html = `<h2 style="color:var(--accent); font-size:1.2rem; margin-bottom:10px;">${greeting}</h2>`;
    html += `<p style="font-size:0.85rem; line-height:1.5; color:#e6edf3;">
                I've audited your <b>${currentUnits} units</b> of academic history. 
                You've bagged <b>${asCount} As</b> and <b>${bsCount} Bs</b>. 
                Here is your roadmap to a <b>${goal} CGPA</b>.
             </p>`;

    // Difficulty Logic
    let statusTheme = { label: "MODERATE", color: "#34d399", msg: "This is very doable with a good study plan!" };
    if (requiredGPA > 4.0) statusTheme = { label: "IMPOSSIBLE", color: "#ff4444", msg: "Mathematically, we can't hit this goal anymore." };
    else if (requiredGPA > 3.7) statusTheme = { label: "ELITE MODE", color: "#fbbf24", msg: "This requires absolute focus!" };

    html += `
        <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; margin:20px 0; border:1px solid #30363d;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <small style="color:var(--text-dim); font-size:0.7rem; text-transform:uppercase;">Current Standing</small>
                    <p style="font-size:2.2rem; font-weight:bold; margin:0;">${currentCGPA}</p>
                </div>
                <span style="background:${statusTheme.color}; color:#000; padding:4px 10px; border-radius:6px; font-size:0.65rem; font-weight:bold;">${statusTheme.label}</span>
            </div>
            <p style="font-size:0.75rem; margin-top:10px; color:${statusTheme.color};"><i>"${statusTheme.msg}"</i></p>
        </div>
    `;

    if (requiredGPA <= 4.0) {
        let unitsA = Math.max(0, Math.ceil(pointsToEarn - (3 * remainingUnits)));
        let unitsB = Math.max(0, remainingUnits - unitsA);

        html += `
            <div style="background:#21262d; padding:15px; border-radius:12px; border:1px solid #30363d;">
                <p style="font-size:0.8rem; font-weight:bold; margin-bottom:12px;">🎯 Target: ${requiredGPA} GPA</p>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <div style="background:rgba(52, 211, 153, 0.1); padding:10px; border-radius:8px; border:1px solid rgba(52, 211, 153, 0.2);">
                        <small style="color:#34d399; display:block;">Must be 'A'</small>
                        <b style="font-size:1.1rem;">${unitsA} Units</b>
                    </div>
                    <div style="background:rgba(255, 255, 255, 0.05); padding:10px; border-radius:8px; border:1px solid #30363d;">
                        <small style="color:var(--text-dim); display:block;">Can be 'B'</small>
                        <b style="font-size:1.1rem;">${unitsB} Units</b>
                    </div>
                </div>
            </div>`;
    }

    resultDiv.innerHTML = html;
}
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // 1. Fetch Profile Data (Move this here!)
    const profile = JSON.parse(localStorage.getItem('student-profile') || '{}');

    // UI/EEE Theme Colors
    const NAVY = [11, 14, 20];
    const GOLD = [251, 191, 36];

    const getLetterGrade = (val) => {
        const mapping = { "5": "A", "4": "B", "3": "C", "2": "D", "1": "E", "0": "F" };
        return mapping[val] || "N/A";
    };

    // Header Branding
    doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFont("helvetica", "bold");
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setFontSize(22);
    doc.text("EXAM VENTURE", 20, 22);
    
    // 2. Add Student Info to Header (Now doc is defined)
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("OFFICIAL ACADEMIC PERFORMANCE REPORT", 20, 30);
    doc.text(`Student: ${profile.name || '---'}`, 140, 20);
    doc.text(`Dept: ${profile.dept || '---'}`, 140, 28);

    // Summary Stats
    let cgpa = document.getElementById('display-cgpa').innerText;
    let units = document.getElementById('display-units').innerText;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`Cumulative CGPA: ${cgpa}`, 20, 50);
    doc.text(`Total Units Earned: ${units}`, 120, 50);

    let y = 65;

    const drawTableHeader = (posY, title) => {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.text(title.toUpperCase(), 20, posY - 5);
        doc.setFillColor(240, 240, 240);
        doc.rect(20, posY, 170, 8, 'F');
        doc.setFontSize(9);
        doc.text("COURSE CODE", 25, posY + 5);
        doc.text("UNITS", 100, posY + 5);
        doc.text("GRADE", 160, posY + 5);
        return posY + 8;
    };

    Object.keys(localStorage).filter(k => k.startsWith("data-")).sort().reverse().forEach(key => {
        if (y > 240) { doc.addPage(); y = 30; }
        const semTitle = key.replace('data-', '').replace('-', ' Level - ');
        y = drawTableHeader(y, semTitle);
        const semesterData = JSON.parse(localStorage.getItem(key));
        semesterData.forEach((c, index) => {
            if (index % 2 === 0) {
                doc.setFillColor(250, 250, 250);
                doc.rect(20, y, 170, 7, 'F');
            }
            doc.text(c.code.toUpperCase(), 25, y + 5);
            doc.text(c.unit.toString(), 105, y + 5);
            doc.text(getLetterGrade(c.grade), 165, y + 5);
            y += 7;
        });
        y += 15;
    });

    doc.save(`Transcript_${profile.name || 'Student'}.pdf`);
}
function clearAllData() {
    if (confirm("⚠️ DANGER: Delete ALL 4.0 records? (Your 5.0 Engineering data will be safe)")) {
        // CHANGE: Targeted wipe of data4- only
        Object.keys(localStorage).forEach(k => {
            if (k.startsWith("data4-")) {
                localStorage.removeItem(k);
            }
        });
        
        updateDashboard();
        getRemainingUnits();
        
        const semSelect = document.getElementById('sem-select');
        if (semSelect) loadSemesterData(semSelect.value);
        
        alert("4.0 Data Wiped.");
        switchView('view-dashboard');
    }
}
// 1. SAVE PROFILE DATA
// 1. SAVE PROFILE DATA
// 1. SAVE PROFILE DATA
function saveProfile() {
    // Capture ALL data, including the total units
    const profileData = {
        name: document.getElementById('setup-name').value,
        uni: document.getElementById('setup-uni').value,
        faculty: document.getElementById('setup-faculty').value,
        dept: document.getElementById('setup-dept').value,
        level: document.getElementById('setup-level').value,
        totalUnits: document.getElementById('prof-total-units').value // <-- FIXED: Now it saves this!
    };

    // Save to permanent browser storage
    localStorage.setItem('student-profile', JSON.stringify(profileData));
    
    // Update the UI immediately everywhere
    applyProfile(); 
    
    // Force the subtraction math to run instantly
    updateRemainingUnitsDisplay(); 
    
    alert("Profile & Target Tracker Updated Successfully!");
    switchView('view-dashboard');
}

// 2. APPLY PROFILE DATA TO UI (The "Everywhere" logic)
// 2. APPLY PROFILE DATA TO UI (The "Everywhere" logic)
function applyProfile() {
    const savedProfile = localStorage.getItem('student-profile');
    if (!savedProfile) return;

    const data = JSON.parse(savedProfile);
    
    // Crash-Proof Department Abbreviation (Limits to 3 letters safely)
    const safeDept = data.dept ? data.dept.substring(0, 3).toUpperCase() : 'DPT';
    
    // Update Dashboard (Main Screen)
    if(document.getElementById('prof-name')) document.getElementById('prof-name').innerText = data.name || 'Student Name';
    if(document.getElementById('prof-level')) document.getElementById('prof-level').innerText = data.level || '---';
    if(document.getElementById('prof-uni')) document.getElementById('prof-uni').innerText = data.uni || '---';
    if(document.getElementById('prof-dept-short')) document.getElementById('prof-dept-short').innerText = safeDept;

    // Update Sidebar (Menu)
    if(document.getElementById('prof-name-side')) document.getElementById('prof-name-side').innerText = data.name || 'Student Name';
    if(document.getElementById('prof-level-side')) document.getElementById('prof-level-side').innerText = data.level || '---';
    if(document.getElementById('prof-uni-side')) document.getElementById('prof-uni-side').innerText = data.uni || '---';
    if(document.getElementById('prof-dept-short-side')) document.getElementById('prof-dept-short-side').innerText = safeDept;

    // Keep form inputs synced when they return to the Profile page
    if(document.getElementById('setup-name')) document.getElementById('setup-name').value = data.name || '';
    if(document.getElementById('setup-uni')) document.getElementById('setup-uni').value = data.uni || '';
    if(document.getElementById('setup-faculty')) document.getElementById('setup-faculty').value = data.faculty || '';
    if(document.getElementById('setup-dept')) document.getElementById('setup-dept').value = data.dept || '';
    if(document.getElementById('setup-level')) document.getElementById('setup-level').value = data.level || '100 Level';
    if(document.getElementById('prof-total-units')) document.getElementById('prof-total-units').value = data.totalUnits || '';
}

function renderAcademicHistory() {
    const listContainer = document.getElementById('dynamic-sem-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    // CHANGE: Filter for data4-
    const keys = Object.keys(localStorage)
        .filter(k => k.startsWith("data4-"))
        .sort().reverse();

    keys.forEach(key => {
        const semesterData = JSON.parse(localStorage.getItem(key));
        let sPoints = 0, sUnits = 0;

        semesterData.forEach(c => {
            const u = parseInt(c.unit) || 0;
            sUnits += u;
            sPoints += (u * (parseInt(c.grade) || 0));
        });

        const sGpa = sUnits > 0 ? (sPoints / sUnits).toFixed(2) : "0.00";
        // CHANGE: Remove data4- from the title
        const title = key.replace('data4-', '').replace('-', ' Level - ');

        const card = document.createElement('div');
        card.className = 'stats-card';
        card.style.textAlign = 'left';
        card.style.padding = '15px 20px';
        card.style.marginBottom = '10px';
        
        // CHANGE: GPA >= 3.5 is the new green threshold for 4.0 scale
        const isHighGPA = sGpa >= 3.5; 
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="font-size: 0.9rem;">${title}</strong>
                    <p style="font-size: 0.75rem; color: var(--text-dim)">${sUnits} Total Units</p>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="badge" style="background: ${isHighGPA ? 'rgba(76, 175, 80, 0.1)' : 'rgba(251, 191, 36, 0.1)'}; 
                                               color: ${isHighGPA ? '#4caf50' : 'var(--accent)'};">
                        ${sGpa} GPA
                    </span>
                    <button onclick="deleteSemester('${key}')" style="background:none; border:none; cursor:pointer; color:#ff4444; font-size: 1.1rem; padding: 0;">
                        🗑️
                    </button>
                </div>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

function deleteSemester(key) {
    // CHANGE: Use data4- for name cleaning
    const title = key.replace('data4-', '').replace('-', ' Level - ');
    if (confirm(`Delete ${title} history?`)) {
        localStorage.removeItem(key);
        updateDashboard(); 
    }
}
function checkLogin() {
    const enteredPin = document.getElementById('login-pin').value;
    // You can keep 'app-pin' the same for both versions, or change to 'app4-pin' if you want a different password for this version
    const storedPin = localStorage.getItem('app4-pin');

    if (!storedPin) {
        if (enteredPin.length < 4) return alert("Please set a 4-digit PIN");
        localStorage.setItem('app4-pin', enteredPin);
        alert("PIN Set Successfully!");
        unlockApp();
    } else {
        if (enteredPin === storedPin) {
            unlockApp();
        } else {
            alert("Incorrect PIN!");
            document.getElementById('login-pin').value = '';
        }
    }
}

// MERGED VERSION: Keeps both Top Bar and Ads logic
function unlockApp() {
    switchView('view-dashboard');
    const topBar = document.querySelector('.top-bar');
    if (topBar) topBar.style.display = 'flex';
    
    document.getElementById('login-pin').value = '';
    
    const adHouse = document.getElementById('ad-container-bottom');
    if (adHouse) adHouse.style.display = 'block';
}
// 3. CLEAN INITIALIZATION (Combined into ONE function)
window.onload = function() {
    populateSemesters();
    updateDashboard();
    getRemainingUnits();
    applyProfile(); // Now this will run correctly on startup
    
    const semSelect = document.getElementById('sem-select');
    if(semSelect) loadSemesterData(semSelect.value);
};
function handleReset() {
    const confirmReset = confirm("DANGER: This will delete ALL your 4.0 saved grades. Your 5.0 Engineering data will be safe. \n\nAre you sure?");

    if (confirmReset) {
        // Targeted wipe: Only remove 4.0 data and the PIN
        Object.keys(localStorage).forEach(k => {
            if (k.startsWith("data4-") || k === "app4-pin") {
                localStorage.removeItem(k);
            }
        });
        
        alert("4.0 App has been reset successfully.");
        location.reload();
    }
}

function updateRemainingUnitsDisplay() {
    // Fetch profile and target input box
    const savedProfile = JSON.parse(localStorage.getItem('student-profile'));
    const remainingInput = document.getElementById('remaining-units');
    
    // Stop if profile or total units aren't set yet
    if (!savedProfile || !savedProfile.totalUnits || !remainingInput) return;

    const totalRequired = parseFloat(savedProfile.totalUnits) || 0;
    let completedUnits = 0;

    // Deep scan of the 4.0 data to find completed units
    Object.keys(localStorage).filter(k => k.startsWith("data4-")).forEach(key => {
        const semester = JSON.parse(localStorage.getItem(key));
        semester.forEach(course => {
            // FIXED: Checking both 'unit' and 'units' to ensure math doesn't fail
            completedUnits += parseFloat(course.unit || course.units || 0);
        });
    });

    // The Subtraction
    const remaining = totalRequired - completedUnits;
    
    // Auto-fill the Target Tracker input box
    remainingInput.value = remaining > 0 ? remaining : 0;
}
// 3. Ensure Top Bar stays hidden on load (4.0 Version)
window.addEventListener('DOMContentLoaded', () => {
    // Hide UI elements if the login screen is the active view
    const loginView = document.getElementById('view-login');
    if (loginView && loginView.classList.contains('active')) {
        const topBar = document.querySelector('.top-bar');
        if (topBar) topBar.style.display = 'none';
        
        const adHouse = document.getElementById('ad-container-bottom');
        if (adHouse) adHouse.style.display = 'none';
    }
    
    // Check for 4.0 specific PIN (using app4-pin for isolation)
    if (localStorage.getItem('app4-pin')) {
        const instruction = document.getElementById('login-instruction');
        if (instruction) {
            instruction.innerText = "Enter your secret 4.0 PIN to continue";
        }
    }
});

// SMART LISTENER: Recalculates remaining units instantly as the user types in the profile
document.addEventListener('DOMContentLoaded', () => {
    const totalUnitsProfileInput = document.getElementById('prof-total-units');
    
    if (totalUnitsProfileInput) {
        // Run the subtraction math every time a number is typed or changed
        totalUnitsProfileInput.addEventListener('input', () => {
            // We temporarily save the profile object so the math function can catch it instantly
            const tempProfile = JSON.parse(localStorage.getItem('student-profile') || '{}');
            tempProfile.totalUnits = totalUnitsProfileInput.value;
            localStorage.setItem('student-profile', JSON.stringify(tempProfile));
            
            updateRemainingUnitsDisplay();
        });
    }
});