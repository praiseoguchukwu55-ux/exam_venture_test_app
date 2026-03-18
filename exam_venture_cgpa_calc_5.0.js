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
    if (AdEngine.isAdVisible) {
        AdEngine.pushAd();
    }
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
    triggerAdRefresh();
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
    let asCount = 0;
    let bsCount = 0;

    // --- STEP 1: DEEP AUDIT OF THE JOURNEY ---
    Object.keys(localStorage).filter(k => k.startsWith("data-")).sort().forEach(key => {
        const semesterData = JSON.parse(localStorage.getItem(key));
        
        semesterData.forEach(c => {
            const u = parseFloat(c.unit || c.units || 0);
            const g = parseFloat(c.grade || 0);
            if (u > 0) {
                currentUnits += u;
                currentPoints += (u * g);
                if(g === 5) asCount++;
                if(g === 4) bsCount++;
            }
        });
    });

    // --- STEP 2: THE MATH ENGINE ---
    const remainingUnits = parseFloat(remainingUnitsInput.value);
    const totalUnitsFinal = currentUnits + remainingUnits;
    const currentCGPA = currentUnits > 0 ? (currentPoints / currentUnits).toFixed(2) : "0.00";
    
    // Core Calculations
    const totalPointsNeeded = goal * totalUnitsFinal;
    const pointsToEarn = totalPointsNeeded - currentPoints;
    const requiredGPA = (pointsToEarn / remainingUnits).toFixed(2);
    
    // Reality Check Calculations
    const maxPossiblePoints = currentPoints + (remainingUnits * 5); // Assuming straight As
    const maxPossibleCGPA = (maxPossiblePoints / totalUnitsFinal).toFixed(2);

    resultDiv.style.display = "block";
    
    // --- STEP 3: CONVERSATIONAL ENGINE & UI ---
    
    // Dynamic Greeting
    let greeting = "Hello Champ! 👋";
    if (currentCGPA >= 4.5) greeting = "First Class Scholar in the building! 🚀";
    else if (currentCGPA >= 3.5) greeting = "Solid work so far! Let's push higher. 🙌";

    let html = `<h2 style="color:var(--accent); font-size:1.2rem; margin-bottom:10px;">${greeting}</h2>`;
    html += `<p style="font-size:0.85rem; line-height:1.5; color:#e6edf3;">
                I've audited your <b>${currentUnits} units</b> of history. 
                With <b>${asCount} As</b> and <b>${bsCount} Bs</b> secured, here is your strategic roadmap to a <b>${goal} CGPA</b>.
             </p>`;

    // Difficulty & Status Card Logic
    let statusTheme = { label: "MODERATE", color: "#34d399", msg: "Very achievable with a structured study plan." };
    if (requiredGPA > 5.0) statusTheme = { label: "IMPOSSIBLE", color: "#ff4444", msg: "Mathematically, this specific target is out of reach." };
    else if (requiredGPA > 4.5) statusTheme = { label: "ELITE MODE", color: "#fbbf24", msg: "Zero margin for error. Maximum focus required." };
    else if (requiredGPA > 4.0) statusTheme = { label: "HARD MODE", color: "#60a5fa", msg: "Consistent high performance is mandatory." };

    // The Current Standing Visual
    html += `
        <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; margin:20px 0; border:1px solid rgba(255,255,255,0.1); position:relative; overflow:hidden;">
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

    // --- STEP 4: THE STRATEGY SPLIT (Impossible vs. Possible) ---
    if (requiredGPA > 5.0) {
        // The Reality Check Warning
        html += `
            <div style="background:rgba(255,68,68,0.05); padding:15px; border-radius:10px; border-left:4px solid #ff4444; margin-bottom: 15px;">
                <p style="font-weight:bold; color:#ff4444; margin-bottom:8px; font-size: 0.9rem;">System Reality Check</p>
                <p style="font-size:0.8rem; line-height:1.5; color:#e6edf3;">
                    To reach a ${goal}, you'd need to average a <b>${requiredGPA} GPA</b> across your remaining units. Since the maximum GPA is 5.0, this exact target isn't mathematically possible anymore.
                </p>
            </div>
            
            <div style="background:#1c2128; padding:15px; border-radius:10px; border:1px solid var(--accent);">
                <p style="font-size:0.8rem; font-weight:bold; color:var(--accent); margin-bottom:5px;">Your New Max Potential</p>
                <p style="font-size:0.85rem; line-height:1.4;">
                    If you secure a perfect 5.0 in every single remaining course, you will graduate with a <b>${maxPossibleCGPA} CGPA</b>. Should we set that as the new target?
                </p>
            </div>`;
    } else {
        // The Grade Mix Optimizer (Actionable Strategy)
        // Logic: 5A + 4B = pointsToEarn
        // A + B = remainingUnits
        // Therefore: A = pointsToEarn - 4*remainingUnits
        let minUnitsA = Math.ceil(pointsToEarn - (4 * remainingUnits));
        
        // Handle cases where the required GPA is so low they don't *need* As
        if (minUnitsA < 0) minUnitsA = 0; 
        
        // If the formula requires more As than total remaining units, they need 100% As
        if (minUnitsA > remainingUnits) minUnitsA = remainingUnits;

        let maxUnitsB = Math.floor(remainingUnits - minUnitsA);

        html += `
            <h3 style="font-size:1rem; margin-bottom:12px; color:var(--accent); border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">The Strategy 🎮</h3>
            <p style="font-size:0.85rem; margin-bottom:15px;">
                To graduate with your target, you must maintain an average of <b>${requiredGPA} GPA</b> across your remaining <b>${remainingUnits} units</b>.
            </p>

            <div style="background:#161b22; padding:15px; border-radius:12px; border:1px solid #30363d; margin-bottom:20px;">
                <p style="font-size:0.8rem; font-weight:bold; margin-bottom:15px; color:#e6edf3;">
                    🎯 The Required Grade Mix
                </p>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                    <div style="background:rgba(52, 211, 153, 0.05); padding:12px; border-radius:8px; border:1px solid rgba(52, 211, 153, 0.3);">
                        <small style="color:#34d399; display:block; margin-bottom:4px; font-weight:600;">Minimum 'A' Units</small>
                        <b style="font-size:1.3rem; color:#fff;">${minUnitsA}</b>
                    </div>
                    
                    <div style="background:rgba(255, 255, 255, 0.02); padding:12px; border-radius:8px; border:1px solid #30363d;">
                        <small style="color:var(--text-dim); display:block; margin-bottom:4px; font-weight:600;">Maximum 'B' Units</small>
                        <b style="font-size:1.3rem; color:#fff;">${maxUnitsB}</b>
                    </div>
                </div>
            </div>

            <div style="background:rgba(96, 165, 250, 0.05); padding:12px; border-radius:8px; border-left:3px solid #60a5fa;">
                <p style="font-size:0.75rem; color:#e6edf3; line-height:1.4; margin:0;">
                    <b>💡 Academic Consultant Tip:</b> Focus your "A" effort on 3-unit and 4-unit courses. Dropping to a 'B' or 'C' in a high-unit core course will severely damage this roadmap!
                </p>
            </div>
        `;
    }

    // --- STEP 5: INTERACTIVE "WHAT IF" FOOTER ---
    html += `
        <div style="margin-top:25px; border-top:1px solid #30363d; padding-top:15px; text-align:center;">
            <p style="font-size:0.75rem; color:var(--text-dim); margin-bottom:12px;">Let's explore other possibilities.</p>
            <button onclick="document.getElementById('goal-input').focus();" 
                    style="background:transparent; border:1px solid var(--accent); color:var(--accent); padding:8px 20px; border-radius:8px; font-size:0.8rem; font-weight:600; cursor:pointer; transition:0.2s;">
                Adjust Target CGPA
            </button>
        </div>
    `;

    resultDiv.innerHTML = html;
    triggerAdRefresh();
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

const pageHeight = doc.internal.pageSize.height;
    
    // 1. Decorative line at the bottom
    doc.setDrawColor(230, 230, 230);
    doc.line(20, pageHeight - 30, 190, pageHeight - 30);

    // 2. The Verification Box (Bottom Left)
    // x = 20 (Left margin), y = pageHeight - 25
    doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.rect(20, pageHeight - 25, 45, 15, 'F'); 
    
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("VERIFIED BY", 25, pageHeight - 19);
    doc.setFontSize(9);
    doc.text("EXAM VENTURE", 25, pageHeight - 14);

    // 3. Timestamp (Right aligned to the seal)
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    const date = new Date().toLocaleDateString();
    doc.text(`Authentic Digital Record: ${date}`, 70, pageHeight - 14);

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
        card.className = 'stats-card clickable-history'; 
        card.onclick = () => switchView('view-calc');
        
        // Inline styles for the card layout
        card.style.textAlign = 'left';
        card.style.padding = '18px 20px';
        card.style.marginBottom = '12px';
        card.style.cursor = 'pointer';
        card.style.display = 'block';
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div style="flex: 1; min-width: 0;">
                    <strong style="font-size: 0.95rem; display: block; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${title}
                    </strong>
                    <p style="font-size: 0.75rem; color: var(--text-dim)">${sUnits} Total Units</p>
                </div>

                <div style="display: flex; align-items: center; gap: 20px; margin-left: 15px;">
                    
                    <span style="color: var(--accent); font-size: 0.9rem; opacity: 0.7; display: flex; align-items: center;">✎</span>

                    <span class="badge" style="
                        background: ${sGpa >= 4.5 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(251, 191, 36, 0.1)'}; 
                        color: ${sGpa >= 4.5 ? '#4caf50' : 'var(--accent)'};
                        padding: 5px 10px;
                        border-radius: 6px;
                        font-weight: bold;
                        font-size: 0.85rem;
                        white-space: nowrap;
                    ">
                        ${sGpa} GPA
                    </span>

                    <button onclick="event.stopPropagation(); deleteSemester('${key}')" 
                            style="background:none; border:none; cursor:pointer; color:#ff4444; font-size: 1.2rem; padding: 5px; display: flex; align-items: center; transition: transform 0.2s;">
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

// 1. Toggle the bulk drawer
function toggleBulkInput() {
    const area = document.getElementById('bulk-input-area');
    if (area) {
        area.style.display = area.style.display === 'none' ? 'block' : 'none';
    }
}

// 2. The Elite Copy Function with Mobile Fallback
function copyPrompt() {
    const textElement = document.getElementById('ai-prompt-text');
    const btn = document.querySelector('.btn-copy');
    if (!textElement) return;

    const textToCopy = textElement.innerText;

    // Try modern API first
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            updateCopyBtnStatus(btn);
        }).catch(err => {
            fallbackCopyText(textToCopy, btn);
        });
    } else {
        // Use fallback for non-HTTPS or older browsers
        fallbackCopyText(textToCopy, btn);
    }
}

function fallbackCopyText(text, btn) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        updateCopyBtnStatus(btn);
    } catch (err) {
        console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
}

function updateCopyBtnStatus(btn) {
    const originalText = btn.innerText;
    btn.innerText = "Copied!";
    btn.style.background = "#4caf50"; // Turn green temporarily
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = "var(--accent)";
    }, 2000);
}

// 3. Process the AI JSON result
function processBulkJSON() {
    const rawData = document.getElementById('json-paste-area').value.trim();
    
    try {
        const courses = JSON.parse(rawData);
        if (!Array.isArray(courses)) throw new Error("Format is not a list");

        courses.forEach(course => {
            // This calls your existing row generator
            // Ensure these property names (code, unit, grade) match the AI prompt
            renderCourseRow(course.code, course.unit, course.grade);
        });

        alert(`Successfully imported ${courses.length} courses!`);
        document.getElementById('json-paste-area').value = '';
        toggleBulkInput(); // Close drawer
    } catch (e) {
        alert("Invalid format. Please make sure you copied the entire [...] list from the AI.");
    }
}
/**
 * 5-HOUR INTERNET LEASE (5.0 VERSION)
 */
function enforceInternetPolicy() {
    const LEASE_DURATION = 5 * 60 * 60 * 1000;
    const STORAGE_KEY = 'ev-lease-expiry-5'; // Specific to 5.0
    const pill = document.getElementById('sync-pill');
    const pillTimer = document.getElementById('pill-timer');

    const updateLease = () => {
        localStorage.setItem(STORAGE_KEY, (Date.now() + LEASE_DURATION).toString());
        if (pill) pill.classList.remove('active');
        
        const lock = document.getElementById('internet-lock-screen');
        if (lock) lock.remove();
    };

    setInterval(() => {
        const expiry = parseInt(localStorage.getItem(STORAGE_KEY) || "0");
        const now = Date.now();
        const timeLeft = expiry - now;

        if (navigator.onLine) {
            updateLease();
        } else {
            if (pill) pill.classList.add('active');
            
            if (timeLeft <= 0) {
                showLockScreen();
            } else if (pillTimer) {
                const h = Math.floor(timeLeft / 3600000);
                const m = Math.floor((timeLeft % 3600000) / 60000);
                const s = Math.floor((timeLeft % 60000) / 1000);
                pillTimer.innerText = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
            }
        }
    }, 1000);

    if (navigator.onLine) updateLease();

    function showLockScreen() {
        if (document.getElementById('internet-lock-screen')) return;
        const lock = document.createElement('div');
        lock.id = 'internet-lock-screen';
        lock.innerHTML = `
            <div style="background: #0d1117; padding: 30px; border-radius: 12px; border: 1px solid #fbbf24; text-align: center; width: 300px;">
                <h2 style="color: #fbbf24;">5.0 Session Expired</h2>
                <p style="color: #c9d1d9; margin: 15px 0; font-size: 0.85rem;">For security, please connect to the internet to resume your 5.0 session.</p>
                <div style="font-size: 0.7rem; color: #8b949e; border-top: 1px solid #30363d; padding-top: 10px;">EXAM VENTURE CLOUD SYNC</div>
            </div>`;
        Object.assign(lock.style, {
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(1, 4, 9, 0.98)', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', zIndex: '20000'
        });
        document.body.appendChild(lock);
    }
}

// Add to your DOMContentLoaded block at the very bottom of the file:
// enforceInternetPolicy();
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
    enforceInternetPolicy();
});

/**
 * EXAM VENTURE AD ENGINE
 * Only refreshes when the ad is visible to the user.
 */
const AdEngine = {
    timer: null,
    refreshInterval: 90000, // 1.5 Minutes
    isAdVisible: false,

    init() {
        const adWrapper = document.getElementById('dynamic-ad-wrapper');
        if (!adWrapper) return;

        // 1. Setup the "Eyes": Intersection Observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isAdVisible = entry.isIntersecting;
                if (this.isAdVisible) {
                    console.log("Ad visible: Timer Resumed");
                    this.startTimer();
                } else {
                    console.log("Ad hidden: Timer Paused");
                    this.stopTimer();
                }
            });
        }, { threshold: 0.5 }); // Must be 50% visible to count

        observer.observe(adWrapper);

        // 2. Initial Push
        this.pushAd();
    },

    pushAd() {
        if (window.adsbygoogle && navigator.onLine) {
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
                console.log("Ad Refreshed Successfully");
            } catch (e) {
                console.error("AdSense Push Error:", e);
            }
        }
    },

    startTimer() {
        if (this.timer) return; 
        this.timer = setInterval(() => {
            if (this.isAdVisible && !document.hidden) {
                this.pushAd();
            }
        }, this.refreshInterval);
    },

    stopTimer() {
        clearInterval(this.timer);
        this.timer = null;
    }
};

// Start the engine when the page loads
window.addEventListener('DOMContentLoaded', () => {
    AdEngine.init();
});
