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
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-item');
    navLinks.forEach(item => item.classList.remove('active'));
    
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

    // --- NEW: AUTO-UPDATE MATH WHEN TABS CHANGE ---
    if (viewId === 'view-target' || viewId === 'view-dashboard') {
        updateRemainingUnitsDisplay();
    }
    
    // 3. Close sidebar
    const menu = document.getElementById("side-menu");
    if (menu && menu.classList.contains("active")) toggleSidebar();
}

/**
 * SEMESTER & COURSE ROW LOGIC
 */
function renderCourseRow(code = '', unit = '', grade = '5') {
    const container = document.getElementById('course-container');
    const row = document.createElement('div');
    row.className = 'course-row';
    row.style.opacity = '0';
    row.style.transform = 'translateY(15px)';
    row.style.transition = 'all 0.3s ease-out';
    row.innerHTML = `
        <input type="text" placeholder="Course" class="inp-code" value="${code}">
        <input type="number" placeholder="Unit" class="inp-unit" value="${unit}">
        <select class="inp-grade">
            <option value="5" ${grade == '5' ? 'selected' : ''}>A</option>
            <option value="4" ${grade == '4' ? 'selected' : ''}>B</option>
            <option value="3" ${grade == '3' ? 'selected' : ''}>C</option>
            <option value="2" ${grade == '2' ? 'selected' : ''}>D</option>
            <option value="1" ${grade == '1' ? 'selected' : ''}>E</option>
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
    container.innerHTML = ''; // Wipe current view
    
    const savedData = localStorage.getItem(`data-${semesterKey}`);
    if (savedData) {
        JSON.parse(savedData).forEach(c => renderCourseRow(c.code, c.unit, c.grade));
    } else {
        // Default clean template: 5 empty rows
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
    localStorage.setItem(`data-${selectedSem}`, JSON.stringify(semesterData));

    // 3. Update all Dashboard numbers (CGPA, Class, Units)
    updateDashboard(); 
    
    // 4. Update Remaining Units for the Target Tracker
    getRemainingUnits(); 

    // 5. THE REDIRECT: Jump to the Homepage (Dashboard)
    switchView('view-dashboard');

    console.log(`Successfully saved and redirected for ${selectedSem}`);
}

/**
 * DASHBOARD & ANALYSIS
 */
function updateDashboard() {
    let totalPoints = 0, totalUnits = 0;

    Object.keys(localStorage).filter(k => k.startsWith("data-")).forEach(key => {
        JSON.parse(localStorage.getItem(key)).forEach(course => {
            const units = parseInt(course.unit) || 0;
            totalUnits += units;
            totalPoints += (units * (parseInt(course.grade) || 0));
        });
    });

    const cgpa = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : "0.00";
    
    document.getElementById('display-cgpa').innerText = cgpa;
    document.getElementById('display-units').innerText = totalUnits;

    // --- ELITE LOGIC: Progress to Next Class ---
    let degreeClass = "Pass";
    let nextBoundary = 5.0;
    let boundaryName = "Perfect 5.0";

    if (cgpa >= 4.5) {
        degreeClass = "First Class";
        nextBoundary = 5.0;
        boundaryName = "Max GPA";
    } else if (cgpa >= 3.5) {
        degreeClass = "2nd Class Upper";
        nextBoundary = 4.5;
        boundaryName = "First Class";
    } else if (cgpa >= 2.49) {
        degreeClass = "2nd Class Lower";
        nextBoundary = 3.5;
        boundaryName = "2nd Class Upper";
    } else if (cgpa >= 1.5) {
        degreeClass = "Third Class";
        nextBoundary = 2.49;
        boundaryName = "2nd Class Lower";
    }

    document.getElementById('display-class').innerText = degreeClass;

    // Calculate gap
    const gap = (nextBoundary - parseFloat(cgpa)).toFixed(2);
    const progressPercent = (parseFloat(cgpa) / 5) * 100;

    // Update the UI with a progress insight
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

    renderAcademicHistory(); // Refresh the list with Semester GPAs
}

function getRemainingUnits() {
    const TOTAL_DEGREE_UNITS = 200; // Adjust for UI EEE Handbook
    let earnedUnits = 0;
    Object.keys(localStorage).filter(k => k.startsWith("data-")).forEach(key => {
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

    // --- STEP 1: DEEP AUDIT OF THE JOURNEY ---
    Object.keys(localStorage).filter(k => k.startsWith("data-")).sort().forEach(key => {
        const semesterData = JSON.parse(localStorage.getItem(key));
        const semLabel = key.replace('data-', '').replace('-', ' Level ');
        
        semesterData.forEach(c => {
            const u = parseFloat(c.unit || c.units || 0);
            const g = parseFloat(c.grade || 0);
            if (u > 0) {
                currentUnits += u;
                currentPoints += (u * g);
                if(g === 5) asCount++;
                if(g === 4) bsCount++;
                historyAudit.push({ 
                    code: c.code || 'Course', 
                    unit: u, 
                    grade: g, 
                    sem: semLabel 
                });
            }
        });
    });

    // --- STEP 2: THE MATH ENGINE ---
    const remainingUnits = parseFloat(remainingUnitsInput.value);
    const totalUnitsFinal = currentUnits + remainingUnits;
    const currentCGPA = currentUnits > 0 ? (currentPoints / currentUnits).toFixed(2) : "0.00";
    const totalPointsNeeded = goal * totalUnitsFinal;
    const pointsToEarn = totalPointsNeeded - currentPoints;
    const requiredGPA = (pointsToEarn / remainingUnits).toFixed(2);
    const maxPossible = ((currentPoints + (remainingUnits * 5)) / totalUnitsFinal).toFixed(2);

    resultDiv.style.display = "block";
    
    // --- STEP 3: CONVERSATIONAL ENGINE ---
    
    // Dynamic Greeting based on current performance
    let greeting = "Hey Champ! 👋";
    if (currentCGPA >= 4.5) greeting = "Wow, a First Class Scholar! 🚀";
    else if (currentCGPA >= 3.5) greeting = "Solid work so far! 🙌";

    let html = `<h2 style="color:var(--accent); font-size:1.2rem; margin-bottom:10px;">${greeting}</h2>`;
    html += `<p style="font-size:0.85rem; line-height:1.5; color:#e6edf3;">
                I've carefully audited your <b>${currentUnits} units</b> of academic history. 
                You've already bagged <b>${asCount} As</b> and <b>${bsCount} Bs</b>—that's a strong foundation! 
                Here is your personalized roadmap to a <b>${goal} CGPA</b>.
             </p>`;

    // Difficulty & Status Card
    let statusTheme = { label: "MODERATE", color: "#34d399", msg: "This is very doable with a good study plan!" };
    if (requiredGPA > 5.0) statusTheme = { label: "IMPOSSIBLE", color: "#ff4444", msg: "Mathematically, we can't hit this goal anymore." };
    else if (requiredGPA > 4.5) statusTheme = { label: "ELITE MODE", color: "#fbbf24", msg: "This requires absolute focus. No room for errors!" };
    else if (requiredGPA > 4.0) statusTheme = { label: "HARD MODE", color: "#60a5fa", msg: "You'll need to stay consistent and grab those As!" };

    html += `
        <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; margin:20px 0; border:1px solid #30363d; position:relative; overflow:hidden;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <small style="color:var(--text-dim); font-size:0.7rem; text-transform:uppercase; letter-spacing:1px;">Current Standing</small>
                    <p style="font-size:2.2rem; font-weight:bold; margin:0;">${currentCGPA}</p>
                </div>
                <span style="background:${statusTheme.color}; color:#000; padding:4px 10px; border-radius:6px; font-size:0.65rem; font-weight:bold;">${statusTheme.label}</span>
            </div>
            <p style="font-size:0.75rem; margin-top:10px; color:${statusTheme.color};"><i>"${statusTheme.msg}"</i></p>
        </div>
    `;

    if (requiredGPA > 5.0) {
        html += `
            <div style="background:rgba(255,68,68,0.1); padding:15px; border-radius:10px; border-left:4px solid #ff4444;">
                <p style="font-weight:bold; color:#ff4444; margin-bottom:5px;">Let's be real for a second...</p>
                <p style="font-size:0.8rem; line-height:1.4;">To reach ${goal}, you'd need a <b>${requiredGPA} GPA</b>, which isn't possible on a 5.0 scale. 
                However, if you get <b>Straight As</b> from now on, you can still finish with a <b>${maxPossible}</b>! Should we aim for that?</p>
            </div>`;
    } else {
        // Grade Mix Strategy
        let unitsA = Math.max(0, Math.ceil(pointsToEarn - (4 * remainingUnits)));
        let unitsB = Math.max(0, remainingUnits - unitsA);

        html += `
            <h3 style="font-size:1rem; margin-bottom:12px; color:var(--accent);">The Strategy 🎮</h3>
            <p style="font-size:0.85rem; margin-bottom:15px;">
                To graduate with your target, you need an average of <b>${requiredGPA} GPA</b> across your remaining <b>${remainingUnits} units</b>.
            </p>

            <div style="background:#21262d; padding:15px; border-radius:12px; border:1px solid #30363d; margin-bottom:20px;">
                <p style="font-size:0.8rem; font-weight:bold; margin-bottom:12px; display:flex; align-items:center; gap:5px;">
                    🎯 Your Grade "Budget"
                </p>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <div style="background:rgba(52, 211, 153, 0.1); padding:10px; border-radius:8px; border:1px solid rgba(52, 211, 153, 0.2);">
                        <small style="color:#34d399; display:block; margin-bottom:2px;">Must be 'A'</small>
                        <b style="font-size:1.1rem;">${unitsA} Units</b>
                    </div>
                    <div style="background:rgba(255, 255, 255, 0.05); padding:10px; border-radius:8px; border:1px solid #30363d;">
                        <small style="color:var(--text-dim); display:block; margin-bottom:2px;">Can be 'B'</small>
                        <b style="font-size:1.1rem;">${unitsB} Units</b>
                    </div>
                </div>
            </div>

            <p style="font-size:0.75rem; color:var(--text-dim); text-align:center; padding:0 10px;">
                <b>Pro Tip:</b> Focus your "A" energy on high-unit courses. Getting an A in a 4-unit course is worth more than two As in 1-unit courses!
            </p>
        `;
    }

    // --- STEP 4: ADD AN INTERACTIVE "WHAT IF" FOOTER (Increases Ad Time) ---
    html += `
        <div style="margin-top:25px; border-top:1px solid #30363d; padding-top:15px; text-align:center;">
            <p style="font-size:0.7rem; color:var(--text-dim); margin-bottom:10px;">Not satisfied with these numbers?</p>
            <button onclick="document.getElementById('goal-input').focus();" 
                    style="background:none; border:1px solid var(--accent); color:var(--accent); padding:5px 15px; border-radius:20px; font-size:0.7rem; cursor:pointer;">
                Try a different Target
            </button>
        </div>
    `;

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
    if (confirm("⚠️ DANGER: Delete ALL records?")) {
        Object.keys(localStorage).forEach(k => k.startsWith("data-") && localStorage.removeItem(k));
        updateDashboard();
        getRemainingUnits();
        loadSemesterData(document.getElementById('sem-select').value);
        alert("Wiped.");
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
        totalUnits: document.getElementById('prof-total-units').value // <-- Capturing the units!
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

    const keys = Object.keys(localStorage)
        .filter(k => k.startsWith("data-"))
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
        const title = key.replace('data-', '').replace('-', ' Level - ');

        const card = document.createElement('div');
        card.className = 'stats-card';
        card.style.textAlign = 'left';
        card.style.padding = '15px 20px';
        card.style.marginBottom = '10px';
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="font-size: 0.9rem;">${title}</strong>
                    <p style="font-size: 0.75rem; color: var(--text-dim)">${sUnits} Total Units</p>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="badge" style="background: ${sGpa >= 4.5 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(251, 191, 36, 0.1)'}; 
                                               color: ${sGpa >= 4.5 ? '#4caf50' : 'var(--accent)'};">
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

// Function to handle the actual deletion
function deleteSemester(key) {
    const title = key.replace('data-', '').replace('-', ' Level - ');
    if (confirm(`Delete ${title} history?`)) {
        localStorage.removeItem(key);
        updateDashboard(); // Refresh everything
    }
}
function checkLogin() {
    const enteredPin = document.getElementById('login-pin').value;
    const storedPin = localStorage.getItem('app-pin');

    if (!storedPin) {
        // FIRST TIME USER: Whatever they type now becomes their PIN
        if (enteredPin.length < 4) return alert("Please set a 4-digit PIN");
        localStorage.setItem('app-pin', enteredPin);
        alert("PIN Set Successfully!");
        unlockApp();
    } else {
        // RETURNING USER
        if (enteredPin === storedPin) {
            unlockApp();
        } else {
            alert("Incorrect PIN!");
            document.getElementById('login-pin').value = '';
        }
    }
}

function unlockApp() {
    switchView('view-dashboard');
    document.querySelector('.top-bar').style.display = 'flex';
    document.getElementById('login-pin').value = '';
    // Show ad house if it exists
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
    const confirmReset = confirm("DANGER: This will delete ALL your 5.0 saved grades and your PIN. Your 4.0 data will be safe. \n\nAre you sure?");

    if (confirmReset) {
        // Targeted wipe: Only remove 5.0 data and the PIN
        Object.keys(localStorage).forEach(k => {
            if (k.startsWith("data-") || k === "app-pin") {
                localStorage.removeItem(k);
            }
        });
        alert("5.0 App has been reset successfully.");
        location.reload();
    }
}
function updateRemainingUnitsDisplay() {
    const savedProfile = JSON.parse(localStorage.getItem('student-profile'));
    const remainingInput = document.getElementById('remaining-units');
    
    if (!savedProfile || !savedProfile.totalUnits || !remainingInput) return;

    const totalRequired = parseFloat(savedProfile.totalUnits) || 0;
    let completedUnits = 0;

    // Scan ONLY 5.0 scale data (keys starting with "data-")
    Object.keys(localStorage).filter(k => k.startsWith("data-") && !k.startsWith("data4-")).forEach(key => {
        const semester = JSON.parse(localStorage.getItem(key));
        if (Array.isArray(semester)) {
            semester.forEach(course => {
                completedUnits += parseFloat(course.unit || course.units || 0);
            });
        }
    });

    const remaining = totalRequired - completedUnits;
    remainingInput.value = remaining > 0 ? remaining : 0;
}

// 3. Ensure Top Bar stays hidden on load
// --- MERGED INITIALIZATION & SMART LISTENERS ---
window.addEventListener('DOMContentLoaded', () => {
    // 1. Run initialization math and profile display immediately on load
    applyProfile();
    updateRemainingUnitsDisplay();

    // 2. Login Screen UI Logic
    const loginView = document.getElementById('view-login');
    if (loginView && loginView.classList.contains('active')) {
        const topBar = document.querySelector('.top-bar');
        if (topBar) topBar.style.display = 'none';
        
        const adHouse = document.getElementById('ad-container-bottom');
        if (adHouse) adHouse.style.display = 'none';
    }
    
    // 3. PIN Instruction Logic (5.0 version uses 'app-pin')
    if (localStorage.getItem('app-pin')) {
        const instruction = document.getElementById('login-instruction');
        if (instruction) {
            instruction.innerText = "Enter your secret PIN to continue";
        }
    }

    // 4. LIVE SUBTRACTION LISTENER
    // This watches the "Total Units" box in the profile in real-time
    const totalUnitsProfileInput = document.getElementById('prof-total-units');
    if (totalUnitsProfileInput) {
        totalUnitsProfileInput.addEventListener('input', () => {
            // Get existing profile or create empty one
            const tempProfile = JSON.parse(localStorage.getItem('student-profile') || '{}');
            
            // Update only the totalUnits field
            tempProfile.totalUnits = totalUnitsProfileInput.value;
            
            // Save back to storage so updateRemainingUnitsDisplay() can see it
            localStorage.setItem('student-profile', JSON.stringify(tempProfile));
            
            // Run the subtraction math instantly
            updateRemainingUnitsDisplay();
        });
    }
});