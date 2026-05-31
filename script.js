const checklistData = [
  {
    id: "utme-1",
    group: "utme",
    exam: "UTME / JAMB",
    title: "Add Use of English as compulsory",
    detail: "Every candidate must take English plus three other subjects.",
  },
  {
    id: "utme-2",
    group: "utme",
    exam: "UTME / JAMB",
    title: "Support 4-subject selection",
    detail: "Let users choose the subject combination before starting.",
  },
  {
    id: "utme-3",
    group: "utme",
    exam: "UTME / JAMB",
    title: "Set 180 questions total",
    detail: "60 English questions and 40 each for the other three subjects.",
  },
  {
    id: "utme-4",
    group: "utme",
    exam: "UTME / JAMB",
    title: "Use a 120-minute timer",
    detail: "Run one unified timer for all subjects.",
  },
  {
    id: "olevel-1",
    group: "olevel",
    exam: "WAEC / NECO / GCE",
    title: "Focus on objective Paper 1",
    detail: "Build the CBT engine around multiple-choice questions only.",
  },
  {
    id: "olevel-2",
    group: "olevel",
    exam: "WAEC / NECO / GCE",
    title: "Support subject-by-subject practice",
    detail: "Keep O'Level exams separated by subject.",
  },
  {
    id: "olevel-3",
    group: "olevel",
    exam: "WAEC / NECO / GCE",
    title: "Allow 40 to 60 questions per subject",
    detail: "Different subjects may have different objective loads.",
  },
  {
    id: "olevel-4",
    group: "olevel",
    exam: "WAEC / NECO / GCE",
    title: "Use 60 to 90 minute timers",
    detail: "Timer length should depend on the subject type.",
  },
  {
    id: "post-1",
    group: "post-utme",
    exam: "Post-UTME",
    title: "Support institution-specific setup",
    detail: "Different schools may use different papers and timing.",
  },
  {
    id: "post-2",
    group: "post-utme",
    exam: "Post-UTME",
    title: "Include general paper items",
    detail: "Add current affairs, verbal reasoning, and numerical reasoning.",
  },
  {
    id: "post-3",
    group: "post-utme",
    exam: "Post-UTME",
    title: "Keep 25 to 50 questions",
    detail: "Use a fast-paced paper structure.",
  },
  {
    id: "post-4",
    group: "post-utme",
    exam: "Post-UTME",
    title: "Use a 30 to 60 minute timer",
    detail: "Time should match the institution’s exam style.",
  },
  {
    id: "sat-1",
    group: "sat",
    exam: "SAT",
    title: "Split into Reading and Writing",
    detail: "Create the digital structure around the two SAT sections.",
  },
  {
    id: "sat-2",
    group: "sat",
    exam: "SAT",
    title: "Split into Math modules",
    detail: "Support adaptive digital module flow.",
  },
  {
    id: "sat-3",
    group: "sat",
    exam: "SAT",
    title: "Track 98 total questions",
    detail: "54 for Reading/Writing and 44 for Math.",
  },
  {
    id: "sat-4",
    group: "sat",
    exam: "SAT",
    title: "Use a 134-minute total duration",
    detail: "Apply the official digital test timing.",
  },
  {
    id: "level100-1",
    group: "100level",
    exam: "100 Level Exams",
    title: "Support course-by-course tests",
    detail: "Organize exams by course code.",
  },
  {
    id: "level100-2",
    group: "100level",
    exam: "100 Level Exams",
    title: "Include CHM, PHY, MAT, BIO, GES and GNS",
    detail: "Cover common first-year science and engineering courses.",
  },
  {
    id: "level100-3",
    group: "100level",
    exam: "100 Level Exams",
    title: "Allow 40 to 50 questions per course",
    detail: "Support both objective and fill-in-the-blank modes.",
  },
  {
    id: "level100-4",
    group: "100level",
    exam: "100 Level Exams",
    title: "Use a 45 to 60 minute timer",
    detail: "Match standard university CBT exam duration.",
  },
  {
    id: "platform-1",
    group: "platform",
    exam: "Platform Features",
    title: "Store questions by exam type and subject",
    detail: "Keep content organized for filtering and reuse.",
  },
  {
    id: "platform-2",
    group: "platform",
    exam: "Platform Features",
    title: "Save progress locally",
    detail: "Remember checked items with localStorage.",
  },
  {
    id: "platform-3",
    group: "platform",
    exam: "Platform Features",
    title: "Show a live timer and auto-submit",
    detail: "Support timed tests and automatic submission.",
  },
  {
    id: "platform-4",
    group: "platform",
    exam: "Platform Features",
    title: "Support practice and review modes",
    detail: "Allow users to study past questions and practice tests.",
  },
];

const typeData = [
  {
    title: "UTME / JAMB",
    description: "Unified 4-subject CBT with one timer.",
    points: ["180 questions", "120 minutes", "English plus 3 subjects"],
  },
  {
    title: "WAEC / NECO / GCE",
    description: "Subject-by-subject O'Level practice.",
    points: ["Paper 1 objectives", "40-60 questions", "60-90 minutes"],
  },
  {
    title: "Post-UTME",
    description: "Fast-paced school-specific screening.",
    points: ["25-50 questions", "30-60 minutes", "General paper support"],
  },
  {
    title: "SAT",
    description: "Two adaptive digital modules.",
    points: ["98 questions", "134 minutes", "Reading/Writing + Math"],
  },
  {
    title: "100 Level Exams",
    description: "Course-based CBT for first-year classes.",
    points: ["40-50 questions", "45-60 minutes", "Objective and fill-in"],
  },
];

const subjectData = [
  {
    tag: "UTME / JAMB",
    title: "Core UTME subject list",
    note: "Use of English is compulsory. Candidates take 4 subjects in total and 180 questions in 120 minutes.",
    subjects: [
      "Use of English",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "Economics",
      "Government",
      "Literature-in-English",
      "Principles of Accounts",
      "Commerce",
      "Christian Religious Studies (CRS)",
      "Islamic Religious Studies (IRS)",
    ],
  },
  {
    tag: "WAEC / NECO / GCE",
    title: "Core O'Level subject list",
    note: "These are the common subjects to support for objective Paper 1 practice.",
    subjects: [
      "General Mathematics",
      "English Language",
      "Civic Education",
      "Physics",
      "Chemistry",
      "Biology",
      "Further Mathematics",
      "Agricultural Science",
      "Economics",
      "Government",
      "Literature-in-English",
      "Commerce / Financial Accounting",
    ],
  },
  {
    tag: "Post-UTME",
    title: "Subject blocks for screening",
    note: "Institution-specific, but these are the most common blocks to include.",
    subjects: [
      "English",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "Economics",
      "Government",
      "Literature",
      "General Paper",
      "General Knowledge",
      "Current Affairs",
      "Verbal / Numerical Reasoning",
    ],
  },
  {
    tag: "SAT",
    title: "SAT digital module areas",
    note: "The SAT is split into adaptive reading/writing and math modules.",
    subjects: [
      "Reading and Writing",
      "Math",
      "Reading and Writing Module 1",
      "Reading and Writing Module 2",
      "Math Module 1",
      "Math Module 2",
    ],
  },
  {
    tag: "100 Level Exams",
    title: "Common 100-level course list",
    note: "Introductory university courses used in first-year CBT tests.",
    subjects: [
      "CHM 101",
      "CHM 102",
      "PHY 101",
      "PHY 102",
      "PHY 103",
      "MAT 111",
      "MAT 121",
      "MAT 141",
      "BIO 101",
      "BIO 102",
      "GES 101",
      "GNS 101",
    ],
  },
];

const yearData = [
  {
    tag: "UTME / JAMB",
    title: "Target range: 1983 - 2025",
    note: "Use this wide archive for historical depth, but prioritize modern CBT-era content.",
    facts: [
      "Why this range: old questions still recycle core concepts in Math, Physics, and Chemistry.",
      "Golden block: 2015 - 2025 should be the flawless modern CBT set.",
    ],
    checks: [
      "Collect 1983 - 2014 as historical reference content.",
      "Validate 2015 - 2025 as the main CBT database block.",
      "Tag each question by year for filtering and revision.",
    ],
  },
  {
    tag: "WAEC / NECO / GCE",
    title: "Target range: 2000 - 2025",
    note: "Focus on objective Paper 1 across the 25-year window.",
    facts: [
      "Why this range: syllabus updates make very old questions less relevant.",
      "Focus: collect objective questions only for simulator accuracy.",
    ],
    checks: [
      "Collect 2000 - 2025 objective questions only.",
      "Separate by subject and exam body where needed.",
      "Tag questions with paper type and year.",
    ],
  },
  {
    tag: "Post-UTME",
    title: "Target range: 2010 - 2025",
    note: "Use recent school screening papers from the last 15 years.",
    facts: [
      "Why this range: structured Post-UTME papers became more consistent from 2010 onward.",
      "Focus: prioritize top-tier schools like UI, UNILAG, OAU, and similar institutions.",
    ],
    checks: [
      "Collect 2010 - 2025 institution papers.",
      "Prioritize school-specific variations and question style.",
      "Tag by school name, year, and subject block.",
    ],
  },
  {
    tag: "SAT",
    title: "Target range: 2023 - 2025",
    note: "Use only the Digital SAT era so the experience matches the current exam.",
    facts: [
      "Why this range: the paper SAT was retired and replaced with the digital format.",
      "Focus: use modern dSAT layout and official practice modules only.",
    ],
    checks: [
      "Collect 2023 - 2025 Digital SAT materials only.",
      "Exclude older paper-based SAT questions.",
      "Model adaptive modules and calculator-on Math.",
    ],
  },
  {
    tag: "100 Level Exams",
    title: "Target range: 2015 - 2025",
    note: "First-year CBT questions are stable enough to build a solid decade-long archive.",
    facts: [
      "Why this range: common 100-level syllabi stay stable across a decade.",
      "Focus: sample from major university hubs and course codes like PHY 101 and MAT 111.",
    ],
    checks: [
      "Collect 2015 - 2025 for each course code.",
      "Group by course, department, and session.",
      "Tag all items by year for revision and analytics.",
    ],
  },
];

const utmeBlueprint = {
  tag: "UTME / JAMB",
  title: "Unified 4-subject exam structure",
  note: "Every candidate takes Use of English plus 3 subjects based on the intended course of study.",
  facts: [
    "Structure: 4 subjects total, with Use of English compulsory.",
    "Total questions: 180 questions, split as 60 English and 40 each for the other 3 subjects.",
    "Duration: 2 hours (120 minutes) with one unified timer.",
    "Implementation: let users pick their 4-subject combination before starting the exam.",
  ],
  subjects: [
    "Use of English (Compulsory)",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Economics",
    "Government",
    "Literature-in-English",
    "Principles of Accounts",
    "Commerce",
    "Christian Religious Studies (CRS)",
    "Islamic Religious Studies (IRS)",
  ],
};

const storageKey = "exam-planner-progress";
const subjectStorageKey = "exam-subject-progress";
const yearStorageKey = "exam-year-progress";
const checklistGrid = document.getElementById("checklistGrid");
const typeGrid = document.getElementById("typeGrid");
const subjectGrid = document.getElementById("subjectGrid");
const yearGrid = document.getElementById("yearGrid");
const utmeGrid = document.getElementById("utmeGrid");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const resetButton = document.getElementById("resetButton");
const completionValue = document.getElementById("completionValue");
const progressFill = document.getElementById("progressFill");
const doneCount = document.getElementById("doneCount");
const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");

const savedProgress = JSON.parse(localStorage.getItem(storageKey) || "{}");
const savedSubjectProgress = JSON.parse(localStorage.getItem(subjectStorageKey) || "{}");
const savedYearProgress = JSON.parse(localStorage.getItem(yearStorageKey) || "{}");

function renderTypes() {
  const template = document.getElementById("typeTemplate");
  typeGrid.innerHTML = "";

  typeData.forEach((item) => {
    const node = template.content.cloneNode(true);
    node.querySelector("h3").textContent = item.title;
    node.querySelector("p").textContent = item.description;
    const list = node.querySelector("ul");

    item.points.forEach((point) => {
      const li = document.createElement("li");
      li.textContent = point;
      list.appendChild(li);
    });

    typeGrid.appendChild(node);
  });
}

function renderSubjects() {
  const template = document.getElementById("subjectTemplate");
  subjectGrid.innerHTML = "";

  subjectData.forEach((item, sectionIndex) => {
    const node = template.content.cloneNode(true);
    node.querySelector(".subject-tag").textContent = item.tag;
    node.querySelector("h3").textContent = item.title;
    node.querySelector(".subject-note").textContent = item.note;
    const list = node.querySelector(".subject-list");

    item.subjects.forEach((subject, subjectIndex) => {
      const li = document.createElement("li");
      li.className = `subject-item ${savedSubjectProgress[`${sectionIndex}-${subjectIndex}`] ? "done" : ""}`;

      const checkbox = document.createElement("input");
      const checkboxId = `subject-${sectionIndex}-${subjectIndex}`;
      checkbox.type = "checkbox";
      checkbox.id = checkboxId;
      checkbox.checked = Boolean(savedSubjectProgress[`${sectionIndex}-${subjectIndex}`]);
      checkbox.addEventListener("change", () => {
        savedSubjectProgress[`${sectionIndex}-${subjectIndex}`] = checkbox.checked;
        localStorage.setItem(subjectStorageKey, JSON.stringify(savedSubjectProgress));
        li.classList.toggle("done", checkbox.checked);
      });

      const label = document.createElement("label");
      label.htmlFor = checkboxId;

      const text = document.createElement("span");
      text.textContent = subject;

      label.append(checkbox, text);
      li.appendChild(label);
      list.appendChild(li);
    });

    subjectGrid.appendChild(node);
  });
}

function renderYearRanges() {
  const template = document.getElementById("yearTemplate");
  yearGrid.innerHTML = "";

  yearData.forEach((item, sectionIndex) => {
    const node = template.content.cloneNode(true);
    node.querySelector(".year-tag").textContent = item.tag;
    node.querySelector("h3").textContent = item.title;
    node.querySelector(".year-note").textContent = item.note;

    const factsList = node.querySelector(".year-facts");
    item.facts.forEach((fact) => {
      const li = document.createElement("li");
      li.textContent = fact;
      factsList.appendChild(li);
    });

    const checksList = node.querySelector(".year-checks");
    item.checks.forEach((check, checkIndex) => {
      const li = document.createElement("li");
      const key = `${sectionIndex}-${checkIndex}`;
      li.className = savedYearProgress[key] ? "done" : "";

      const checkbox = document.createElement("input");
      const checkboxId = `year-${sectionIndex}-${checkIndex}`;
      checkbox.type = "checkbox";
      checkbox.id = checkboxId;
      checkbox.checked = Boolean(savedYearProgress[key]);
      checkbox.addEventListener("change", () => {
        savedYearProgress[key] = checkbox.checked;
        localStorage.setItem(yearStorageKey, JSON.stringify(savedYearProgress));
        li.classList.toggle("done", checkbox.checked);
      });

      const label = document.createElement("label");
      label.htmlFor = checkboxId;

      const text = document.createElement("span");
      text.textContent = check;

      label.append(checkbox, text);
      li.appendChild(label);
      checksList.appendChild(li);
    });

    yearGrid.appendChild(node);
  });
}

function renderUtmeBlueprint() {
  const template = document.getElementById("utmeTemplate");
  utmeGrid.innerHTML = "";

  const node = template.content.cloneNode(true);
  node.querySelector(".utme-tag").textContent = utmeBlueprint.tag;
  node.querySelector("h3").textContent = utmeBlueprint.title;
  node.querySelector(".utme-note").textContent = utmeBlueprint.note;

  const factsList = node.querySelector(".utme-facts");
  utmeBlueprint.facts.forEach((fact) => {
    const li = document.createElement("li");
    const strong = document.createElement("strong");
    const text = document.createTextNode(fact.replace(/^.*?:\s*/, ""));

    if (fact.includes(":")) {
      strong.textContent = fact.split(":")[0] + ":";
      li.append(strong, document.createTextNode(" "), text);
    } else {
      li.textContent = fact;
    }

    factsList.appendChild(li);
  });

  const subjectsList = node.querySelector(".utme-subjects");
  utmeBlueprint.subjects.forEach((subject) => {
    const li = document.createElement("li");
    li.textContent = subject;
    subjectsList.appendChild(li);
  });

  utmeGrid.appendChild(node);
}

function renderChecklist() {
  const template = document.getElementById("sectionTemplate");
  const searchTerm = searchInput.value.trim().toLowerCase();
  const filter = filterSelect.value;

  const visibleItems = checklistData.filter((item) => {
    const matchesFilter = filter === "all" || item.group === filter;
    const haystack = `${item.exam} ${item.title} ${item.detail}`.toLowerCase();
    const matchesSearch = !searchTerm || haystack.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const grouped = visibleItems.reduce((accumulator, item) => {
    accumulator[item.exam] = accumulator[item.exam] || [];
    accumulator[item.exam].push(item);
    return accumulator;
  }, {});

  checklistGrid.innerHTML = "";

  if (visibleItems.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No checklist items match your search or filter.";
    checklistGrid.appendChild(empty);
    updateSummary();
    return;
  }

  Object.entries(grouped).forEach(([sectionName, items]) => {
    const node = template.content.cloneNode(true);
    node.querySelector(".exam-tag").textContent = sectionName;
    node.querySelector("h3").textContent = `${items.length} checklist item${items.length > 1 ? "s" : ""}`;
    node.querySelector(".exam-meta").textContent = "Tap the checkbox to mark progress for your website plan.";

    const list = node.querySelector(".item-list");

    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = `item ${savedProgress[item.id] ? "done" : ""}`;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = Boolean(savedProgress[item.id]);
      checkbox.id = item.id;
      checkbox.addEventListener("change", () => {
        savedProgress[item.id] = checkbox.checked;
        localStorage.setItem(storageKey, JSON.stringify(savedProgress));
        li.classList.toggle("done", checkbox.checked);
        updateSummary();
      });

      const content = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = item.title;
      const detail = document.createElement("small");
      detail.textContent = item.detail;
      content.append(title, detail);

      const label = document.createElement("label");
      label.htmlFor = item.id;
      label.append(checkbox, content);

      li.appendChild(label);
      list.appendChild(li);
    });

    checklistGrid.appendChild(node);
  });

  updateSummary();
}

function updateSummary() {
  const total = checklistData.length;
  const done = checklistData.filter((item) => savedProgress[item.id]).length;
  const pending = total - done;
  const percent = Math.round((done / total) * 100) || 0;

  completionValue.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;
  doneCount.textContent = done;
  totalCount.textContent = total;
  pendingCount.textContent = pending;
}

searchInput.addEventListener("input", renderChecklist);
filterSelect.addEventListener("change", renderChecklist);

resetButton.addEventListener("click", () => {
  Object.keys(savedProgress).forEach((key) => delete savedProgress[key]);
  localStorage.setItem(storageKey, JSON.stringify(savedProgress));
  renderChecklist();
});

renderTypes();
renderUtmeBlueprint();
renderSubjects();
renderYearRanges();
renderChecklist();