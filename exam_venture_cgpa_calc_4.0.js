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
        if (AdEngine.isAdVisible) {
        AdEngine.pushAd();
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

// REPLACE your old saveSemester() with this:
function saveSemesterData() {
    const selectedSem = document.getElementById('sem-select').value;
    const rows = document.querySelectorAll('.course-row');
    const semesterData = [];

    // Correctly loops through your modern div layout
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

    if (semesterData.length === 0) {
        alert("Please add at least one course before saving.");
        return;
    }

    // Unifies the storage key to strictly 'data4-'
    localStorage.setItem(`data4-${selectedSem}`, JSON.stringify(semesterData));
    
    updateDashboard(); 
    getRemainingUnits(); 
    switchView('view-dashboard');
    
    alert("Semester saved successfully to 4.0 database!");
    triggerAdRefresh();
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

    // --- STEP 1: DEEP AUDIT OF THE JOURNEY (Strictly 4.0 Isolation) ---
    // Fetch profile from 4.0 specific key
    const savedProfile = JSON.parse(localStorage.getItem('student-profile-4') || '{}');
    
    let currentPoints = 0;
    let currentUnits = 0;
    let asCount = 0;
    let bsCount = 0;

    // Filter only for 4.0 data keys
    Object.keys(localStorage).filter(k => k.startsWith("data4-")).sort().forEach(key => {
        const semesterData = JSON.parse(localStorage.getItem(key) || '[]');
        
        semesterData.forEach(c => {
            const u = parseFloat(c.unit || c.units || 0);
            const g = parseFloat(c.grade || 0);
            if (u > 0) {
                currentUnits += u;
                currentPoints += (u * g);
                if(g === 4) asCount++; // A on a 4.0 scale
                if(g === 3) bsCount++; // B on a 4.0 scale
            }
        });
    });

    // --- STEP 2: THE 4.0 MATH ENGINE ---
    const remainingUnits = parseFloat(remainingUnitsInput.value);
    const totalUnitsFinal = currentUnits + remainingUnits;
    const currentCGPA = currentUnits > 0 ? (currentPoints / currentUnits).toFixed(2) : "0.00";
    
    // Core Calculations
    const totalPointsNeeded = goal * totalUnitsFinal;
    const pointsToEarn = totalPointsNeeded - currentPoints;
    const requiredGPA = (pointsToEarn / remainingUnits).toFixed(2);
    
    // Reality Check Calculations (Max is 4.0)
    const maxPossiblePoints = currentPoints + (remainingUnits * 4); 
    const maxPossibleCGPA = (maxPossiblePoints / totalUnitsFinal).toFixed(2);

    resultDiv.style.display = "block";
    
    // --- STEP 3: CONVERSATIONAL ENGINE & UI ---
    
    let greeting = "Hello Champ! 👋";
    if (currentCGPA >= 3.5) greeting = "First Class Scholar in the building! 🚀";
    else if (currentCGPA >= 3.0) greeting = "Solid work so far! Let's push higher. 🙌";

    let html = `<h2 style="color:var(--accent); font-size:1.2rem; margin-bottom:10px;">${greeting}</h2>`;
    html += `<p style="font-size:0.85rem; line-height:1.5; color:#e6edf3;">
                I've audited your <b>${currentUnits} units</b> of history. 
                With <b>${asCount} As</b> and <b>${bsCount} Bs</b> secured, here is your strategic roadmap to a <b>${goal} CGPA</b>.
             </p>`;

    // Difficulty & Status Card Logic (4.0 Scale)
    let statusTheme = { label: "MODERATE", color: "#34d399", msg: "Very achievable with a structured study plan." };
    if (requiredGPA > 4.0) statusTheme = { label: "IMPOSSIBLE", color: "#ff4444", msg: "Mathematically, this specific target is out of reach." };
    else if (requiredGPA > 3.7) statusTheme = { label: "ELITE MODE", color: "#fbbf24", msg: "Zero margin for error. Maximum focus required." };
    else if (requiredGPA > 3.0) statusTheme = { label: "HARD MODE", color: "#60a5fa", msg: "Consistent high performance is mandatory." };

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
    if (requiredGPA > 4.0) {
        html += `
            <div style="background:rgba(255,68,68,0.05); padding:15px; border-radius:10px; border-left:4px solid #ff4444; margin-bottom: 15px;">
                <p style="font-weight:bold; color:#ff4444; margin-bottom:8px; font-size: 0.9rem;">System Reality Check</p>
                <p style="font-size:0.8rem; line-height:1.5; color:#e6edf3;">
                    To reach a ${goal}, you'd need to average a <b>${requiredGPA} GPA</b>. Since the max is 4.0, this target is not possible.
                </p>
            </div>
            
            <div style="background:#1c2128; padding:15px; border-radius:10px; border:1px solid var(--accent);">
                <p style="font-size:0.8rem; font-weight:bold; color:var(--accent); margin-bottom:5px;">Your New Max Potential</p>
                <p style="font-size:0.85rem; line-height:1.4;">
                    If you secure a perfect 4.0 in every remaining course, you will graduate with a <b>${maxPossibleCGPA} CGPA</b>.
                </p>
            </div>`;
    } else {
        // Grade Mix Optimizer for 4.0 Scale
        let minUnitsA = Math.ceil(pointsToEarn - (3 * remainingUnits));
        if (minUnitsA < 0) minUnitsA = 0; 
        if (minUnitsA > remainingUnits) minUnitsA = remainingUnits;

        let maxUnitsB = Math.floor(remainingUnits - minUnitsA);

        html += `
            <h3 style="font-size:1rem; margin-bottom:12px; color:var(--accent); border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">The Strategy 🎮</h3>
            <p style="font-size:0.85rem; margin-bottom:15px;">
                You must maintain an average of <b>${requiredGPA} GPA</b> across your remaining <b>${remainingUnits} units</b>.
            </p>

            <div style="background:#161b22; padding:15px; border-radius:12px; border:1px solid #30363d; margin-bottom:20px;">
                <p style="font-size:0.8rem; font-weight:bold; margin-bottom:15px; color:#e6edf3;">🎯 Required Grade Mix</p>
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
                    <b>💡 Tip:</b> Focus on 3-unit and 4-unit courses. Dropping below a 'B' in a high-unit course will damage this roadmap!
                </p>
            </div>
        `;
    }

    html += `
        <div style="margin-top:25px; border-top:1px solid #30363d; padding-top:15px; text-align:center;">
            <button onclick="document.getElementById('goal-input').focus();" 
                    style="background:transparent; border:1px solid var(--accent); color:var(--accent); padding:8px 20px; border-radius:8px; font-size:0.8rem; font-weight:600; cursor:pointer;">
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

    const profile = JSON.parse(localStorage.getItem('student-profile-4') || '{}');

    // UI/EEE Theme Colors (Navy & Gold)
    const NAVY = [11, 14, 20];
    const GOLD = [251, 191, 36];

    const getLetterGrade = (val) => {
        const mapping = { "4": "A", "3": "B", "2": "C", "1": "D", "0": "F" };
        return mapping[val.toString()] || "F";
    };

    doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFont("helvetica", "bold");
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setFontSize(22);
    doc.text("EXAM VENTURE (4.0)", 20, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("OFFICIAL ACADEMIC PERFORMANCE REPORT", 20, 30);
    doc.text(`Student: ${profile.name || '---'}`, 130, 20);
    doc.text(`Dept: ${profile.dept || '---'}`, 130, 28);

    let cgpa = document.getElementById('display-cgpa').innerText;
    let units = document.getElementById('display-units').innerText;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`Cumulative CGPA (4.0): ${cgpa}`, 20, 50);
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

    // FIXED: Changed "data-4-" to "data4-" to match your save logic perfectly
    Object.keys(localStorage)
        .filter(k => k.startsWith("data4-")) 
        .sort().forEach(key => {
            if (y > 240) { doc.addPage(); y = 30; }
            
            // FIXED: Changed "data-4-" to "data4-" here as well
            const semTitle = key.replace('data4-', '').replace('-', ' Level - ');
            y = drawTableHeader(y, semTitle);
            
            const semesterData = JSON.parse(localStorage.getItem(key)) || [];
            
            doc.setFont("helvetica", "normal");
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
    
    doc.setDrawColor(230, 230, 230);
    doc.line(20, pageHeight - 30, 190, pageHeight - 30);

    doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.rect(20, pageHeight - 25, 45, 15, 'F'); 
    
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setFontSize(7);
    doc.text("VERIFIED BY", 25, pageHeight - 19);
    doc.setFontSize(9);
    doc.text("EXAM VENTURE", 25, pageHeight - 14);

    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    const date = new Date().toLocaleDateString();
    doc.text(`Authentic 4.0 Scale Record: ${date}`, 70, pageHeight - 14);

    doc.save(`Transcript_4.0_${profile.name || 'Student'}.pdf`);
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
// Replace your existing saveProfile function with this:
function saveProfile() {
    // 1. Capture ALL data from the setup/profile fields
    // Ensure these IDs (setup-name, setup-uni, etc.) match your 4.0 HTML exactly
    const profileData = {
        name: document.getElementById('setup-name')?.value || "Scholar",
        uni: document.getElementById('setup-uni')?.value || "",
        faculty: document.getElementById('setup-faculty')?.value || "",
        dept: document.getElementById('setup-dept')?.value || "",
        level: document.getElementById('setup-level')?.value || "",
        // CRITICAL: Capturing the units for the 4.0 scale
        totalUnits: document.getElementById('prof-total-units').value 
    };

    if (!profileData.totalUnits) {
        alert("Please enter your Total Degree Units to enable the Target Tracker! 😊");
        return;
    }

    // 2. Save to 4.0 isolated storage
    // We use 'student-profile-4' so it never resets or conflicts with the 5.0 app
    localStorage.setItem('student-profile-4', JSON.stringify(profileData));
    
    // 3. Update the UI and Dashboard Math
    // We call these now so the homepage reflects changes without a manual refresh
    if (typeof applyProfile === "function") applyProfile(); 
    
    // This updates the "Units Remaining" and "Current CGPA" on the dashboard
    updateDashboard(); 
    updateRemainingUnitsDisplay(); 
    
    // 4. Feedback and Redirect
    alert("4.0 Profile & Target Tracker Updated Successfully! 🚀");
    
    // Switch to the homepage (Dashboard)
    switchView('view-dashboard');
}
// Update your loadProfile function to look for the new key:
function loadProfile() {
    const saved = localStorage.getItem('student-profile-4');
    if (saved) {
        const profile = JSON.parse(saved);
        document.getElementById('prof-name').value = profile.name || "";
        document.getElementById('prof-dept').value = profile.dept || "";
        document.getElementById('prof-level').value = profile.level || "";
        document.getElementById('prof-total-units').value = profile.totalUnits || "";
    }
}

// 2. APPLY PROFILE DATA TO UI (The "Everywhere" logic)
// 2. APPLY PROFILE DATA TO UI (The "Everywhere" logic)
function applyProfile() {
    const savedProfile = localStorage.getItem('student-profile-4');
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

// --- UPDATED RENDER FUNCTION ---
function renderAcademicHistory() {
    const listContainer = document.getElementById('dynamic-sem-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    // Strictly filter for the unified "data4-" key
    const keys = Object.keys(localStorage)
        .filter(k => k.startsWith("data4-")) 
        .sort().reverse();

    if (keys.length === 0) {
        listContainer.innerHTML = `<p style="text-align:center; padding:20px; color:var(--text-dim);">No 4.0 data found.</p>`;
        return;
    }

    keys.forEach(key => {
        const semesterData = JSON.parse(localStorage.getItem(key));
        let sPoints = 0, sUnits = 0;

        semesterData.forEach(c => {
            const u = parseInt(c.unit) || 0;
            sUnits += u;
            const gradeVal = Math.min(parseInt(c.grade) || 0, 4); // Force 4.0 max
            sPoints += (u * gradeVal);
        });

        const sGpa = sUnits > 0 ? (sPoints / sUnits).toFixed(2) : "0.00";
        
        // Correctly cleans 'data4-' out of the title
        const title = key.replace('data4-', '').replace('-', ' Level - ');

        const card = document.createElement('div');
        card.className = 'stats-card clickable-history'; 
        
        
        // Makes the card click to edit
        card.onclick = () => switchView('view-calc');
        card.style.cursor = 'pointer';
        card.style.padding = '18px 20px';
        card.style.marginBottom = '12px';
        card.style.textAlign = 'left';

        // Re-adding the Edit Pen and Trash Bin to the UI
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div style="flex: 1; min-width: 0;">
                    <strong style="color: var(--accent); display: block; margin-bottom: 2px;">${title}</strong>
                    <p style="font-size: 0.75rem; color: var(--text-dim)">${sUnits} Units</p>
                </div>
                <div style="display: flex; align-items: center; gap: 20px;">
                    <span style="color: var(--accent); font-size: 0.9rem; opacity: 0.7;">✎</span>
                    <span class="badge" style="background: ${sGpa >= 3.5 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(251, 191, 36, 0.1)'}; 
                                               color: ${sGpa >= 3.5 ? '#4caf50' : 'var(--accent)'}; font-weight: bold;">
                        ${sGpa} GPA
                    </span>
                    <button onclick="event.stopPropagation(); deleteSemester('${key}')" 
                            style="background:none; border:none; cursor:pointer; color:#ff4444; font-size: 1.2rem; padding: 5px; transition: transform 0.2s;">
                        🗑️
                    </button>
                </div>
            </div>`;
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
    const remainingUnitsElement = document.getElementById('remaining-units');
    if (!remainingUnitsElement) return;

    // FIX: Must use 'student-profile-4'
    const savedProfile = JSON.parse(localStorage.getItem('student-profile-4') || '{}');
    const totalUnitsToGraduate = parseInt(savedProfile.totalUnits) || 120; 

    let earnedUnits = 0;
    Object.keys(localStorage).filter(k => k.startsWith("data4-")).forEach(key => {
        const semesterData = JSON.parse(localStorage.getItem(key) || '[]');
        semesterData.forEach(course => {
            earnedUnits += (parseInt(course.unit) || 0);
        });
    });

    const remaining = totalUnitsToGraduate - earnedUnits;
    remainingUnitsElement.value = remaining > 0 ? remaining : 0;
}

function toggleBulkInput() {
    const area = document.getElementById('bulk-input-area');
    if (area) {
        area.style.display = area.style.display === 'none' ? 'block' : 'none';
    }
}

function copyPrompt() {
    const textElement = document.getElementById('ai-prompt-text');
    const btn = document.querySelector('.btn-copy');
    if (!textElement) return;

    const textToCopy = textElement.innerText;

    // Reliable copy method for mobile and desktop
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            updateCopyBtnStatus(btn);
        }).catch(() => fallbackCopyText(textToCopy, btn));
    } else {
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
        console.error('Copy failed', err);
    }
    document.body.removeChild(textArea);
}

function updateCopyBtnStatus(btn) {
    const originalText = btn.innerText;
    btn.innerText = "Copied!";
    btn.style.background = "#4caf50"; 
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = "var(--accent)";
    }, 2000);
}

function processBulkJSON() {
    const rawData = document.getElementById('json-paste-area').value.trim();
    
    try {
        const courses = JSON.parse(rawData);
        if (!Array.isArray(courses)) throw new Error("Invalid Format");

        courses.forEach(course => {
            // Uses the 4.0 version's existing row rendering function
            renderCourseRow(course.code, course.unit, course.grade);
        });

        alert(`Successfully imported ${courses.length} courses to your 4.0 list!`);
        document.getElementById('json-paste-area').value = '';
        toggleBulkInput(); 
    } catch (e) {
        alert("Please paste a valid JSON list from the AI (starting with [ and ending with ]).");
    }
}

/**
 * ADMOB & REFRESH CONFIGURATION
 */
const ADMOB_ID = 'ca-app-pub-3940256099942544/6300978111'; // TEST ID - Replace later
let adRefreshCount = 0;
const MAX_REFRESHES = 15;

async function triggerAdRefresh() {
    if (adRefreshCount < MAX_REFRESHES && navigator.onLine) {
        try {
            // Using Capacitor AdMob Plugin syntax
            await window.Capacitor.Plugins.AdMob.showBanner({
                adId: ADMOB_ID,
                position: "TOP_CENTER",
                margin: 0
            });
            adRefreshCount++;
            console.log(`AdMob Refreshed: ${adRefreshCount}/15`);
        } catch (e) {
            console.log("AdMob not initialized yet or not running in APK");
        }
    }
}

// 1-Minute Timed Refresh
setInterval(() => {
    triggerAdRefresh();
}, 60000);

function showWaitScreen(msg) {
    const loginView = document.getElementById('view-login');
    if (loginView) {
        loginView.innerHTML = `
            <div class="stats-card" style="text-align:center; border: 1px solid var(--accent); margin: 20px;">
                <h3 style="color:var(--accent)">Exam Venture</h3>
                <p style="margin: 15px 0; font-size: 0.9rem;">${msg}</p>
                <div style="width:30px; height:30px; border:3px solid #30363d; border-top:3px solid var(--accent); border-radius:50%; animation: spin 1s linear infinite; margin: 10px auto;"></div>
            </div>`;
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    if (!checkAppActivation()) return;

    // Initialize AdMob if in APK
    if (window.Capacitor) {
        try {
            await window.Capacitor.Plugins.AdMob.initialize();
            triggerAdRefresh();
        } catch (e) { console.log("AdMob init failed"); }
    }
    
    enforceInternetPolicy();
});

/**
 * 5-HOUR INTERNET LEASE (4.0 VERSION)
 */
function enforceInternetPolicy() {
    const LEASE_DURATION = 5 * 60 * 60 * 1000;
    const STORAGE_KEY = 'ev-lease-expiry-4'; // Specific to 4.0
    const pill = document.getElementById('sync-pill');
    const pillTimer = document.getElementById('pill-timer');

    const updateLease = () => {
        localStorage.setItem(STORAGE_KEY, (Date.now() + LEASE_DURATION).toString());
        if (pill) pill.classList.remove('active'); // Hide immediately when online
        
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
            if (pill) pill.classList.add('active'); // Show pill if offline
            
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
                <h2 style="color: #fbbf24;">4.0 Session Expired</h2>
                <p style="color: #c9d1d9; margin: 15px 0; font-size: 0.85rem;">For security, please connect to the internet to resume your 4.0 session.</p>
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

/**
 * AI PROMPT GENERATOR
 * Merged for 4.0 Scale results
 */
// 3. Ensure Top Bar stays hidden on load (4.0 Version)
// UNIFIED INITIALIZATION (UI, PIN, and Profile Loading)
window.addEventListener('DOMContentLoaded', () => {
    // 1. Hide UI elements if the login screen is active
    const loginView = document.getElementById('view-login');
    if (loginView && loginView.classList.contains('active')) {
        const topBar = document.querySelector('.top-bar');
        if (topBar) topBar.style.display = 'none';
        
        const adHouse = document.getElementById('ad-container-bottom');
        if (adHouse) adHouse.style.display = 'none';
    }
    
    // 2. Setup 4.0 PIN Instruction
    if (localStorage.getItem('app4-pin')) {
        const instruction = document.getElementById('login-instruction');
        if (instruction) {
            instruction.innerText = "Enter your secret 4.0 PIN to continue";
        }
    }

    // 3. Load 4.0 Profile Data into the input field
    const profileInput = document.getElementById('prof-total-units');
    if (profileInput) {
        // MUST use 'student-profile-4' for 4.0 isolation
        const savedProfile = JSON.parse(localStorage.getItem('student-profile-4') || '{}');
        if (savedProfile.totalUnits) {
            profileInput.value = savedProfile.totalUnits;
        }
    }
    
    // 4. Run initial dashboard math
    updateDashboard();
    updateRemainingUnitsDisplay();
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
