/* app.js - jQuery-based */

/* NOTE: This file uses jQuery (loaded before this script).
   Make sure index.html includes:
     <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
   before this file. 
*/

/* GLOBAL: arrays & state
   - skills: stores current skill strings
   - projects: stores project objects (title, desc, deadline, imageURL, modalId)
   - sortAscending: toggles project sort order
*/
let skills = []; 
let projects = []; 
let sortAscending = true; 

/* HW9 STEP 2: Render navigation menu dynamically
   - navItems array stores labels and anchors
   - renderNav() uses jQuery to append li > a elements
   - smooth scrolling implemented with jQuery.animate()
*/
const navItems = [
  { label: "Skills", anchor: "#skills" },
  { label: "Projects", anchor: "#projects" },
  { label: "Education", anchor: "#education" },
  { label: "Experience", anchor: "#experience" },
  { label: "Customize", anchor: "#customizationPanel" },
  { label: "Contact", anchor: "#contact" }
];

// render navigation items and attach smooth-scroll behavior
function renderNav() {
  const $navList = $("#navList");
  $navList.empty(); 
  navItems.forEach(item => {
    const $li = $(`<li class="nav-item"><a class="nav-link" href="${item.anchor}">${item.label}</a></li>`);
    $navList.append($li);
  });

  // Smooth scrolling using jQuery animate for any nav link
  $navList.find("a.nav-link").on("click", function (e) {
    e.preventDefault();
    const target = $(this).attr("href");
    const offset = $(target).offset().top - 70; 
    $("html, body").animate({ scrollTop: offset }, 600);
    $(".navbar-collapse").collapse("hide");
  });
}

/* initialize projects array (HW9 Step 3)
   - two real projects 
   - deadline stored as Date object
*/
function initProjects() {
  projects = [
    {
      title: "Ransomware Trends Dashboard",
      description: "Built an R dashboard to visualize ransomware attack patterns using EDA and visualization libraries.",
      deadline: new Date("2024-05-01"), 
      imageURL: "Ransomware_trends.png",
      modalId: "#project1Modal"
    },
    {
      title: "Battleship Game in C",
      description: "A console Battleship game in C with grid logic, ship placement, and scoring.",
      deadline: new Date("2023-12-01"), 
      imageURL: "Battleship_code.png",
      modalId: "#project2Modal"
    }
  ];
}

/* RENDER PROJECTS & SORT FEATURE
   - displayProjects() builds the card layout from projects array
   - sortProjects() sorts by deadline and re-renders
   - comparator used with Array.sort()
*/
function displayProjects() {
  const $container = $("#projectContainer");
  $container.empty();
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const now = new Date();
    const status = p.deadline < now ? "Completed" : "Ongoing";

    // format date
    const dStr = p.deadline.toLocaleDateString();

    // build card markup
    const $col = $(`
      <div class="col-md-6">
        <div class="card shadow-sm h-100">
          <img src="${p.imageURL}" class="card-img-top" alt="${p.title}">
          <div class="card-body">
            <h5 class="card-title">${p.title}</h5>
            <p class="card-text">${p.description}</p>
            <p><strong>Deadline:</strong> ${dStr} &nbsp; <strong>Status:</strong> ${status}</p>
            <button class="btn btn-outline-primary learn-more" data-modal="${p.modalId}">Learn More</button>
          </div>
        </div>
      </div>
    `);
    $container.append($col.hide().fadeIn(400));
  }

  // attach learn-more button event (open corresponding modal)
  $(".learn-more").off("click").on("click", function () {
    const modalId = $(this).data("modal");
    $(modalId).modal("show");
  });
}

function sortProjects() {
  projects.sort((a, b) => {
    if (sortAscending) {
      return a.deadline - b.deadline;
    } else {
      return b.deadline - a.deadline;
    }
  });
  displayProjects();
}

/*
   HW9 STEP 1: Skills array management + DOM sync
   - use jQuery for DOM updates and animations
   - addSkill, editSkill, removeSkill functions use callbacks/higher-order functions
*/

/* Initialize skills array from the prepopulated DOM */
function initSkillsFromDOM() {
  skills = [];
  $("#skillsRow .skill-card .card-body").each(function () {
    const txt = $(this).text().trim();
    if (txt) skills.push(txt);
  });
}

/* renderSkills(callback) - clears DOM and repopulates from skills[] */
function renderSkills(callback) {
  const $row = $("#skillsRow");
  $row.empty();
  skills.forEach((skill, index) => {
    // create card with edit & delete actions
    const $col = $(`
      <div class="col-md-3 col-6 skill-col" data-index="${index}">
        <div class="card skill-card text-center p-3">
          <div class="card-body fw-bold skill-text">${skill}</div>
          <div class="skill-actions mt-2">
            <button class="btn btn-sm btn-light edit-skill">Edit</button>
            <button class="btn btn-sm btn-outline-danger delete-skill">Delete</button>
          </div>
        </div>
      </div>
    `);
    // append with animation
    $row.append($col.hide().fadeIn(300));
  });

  // NOTE: Edit/Delete Handlers are now attached via delegation in $(document).ready
  
  if (typeof callback === "function") callback(); 
}

/* validateSkill(skill, cb) - higher-order function: checks duplicates & emptiness */
function validateSkill(skill, cb) {
  const trimmed = skill.trim();
  if (!trimmed) {
    cb(false, "Skill cannot be empty.");
    return;
  }
  /* duplicate check (case-insensitive) */
  const exists = skills.some(s => s.toLowerCase() === trimmed.toLowerCase());
  if (exists) {
    cb(false, "Skill already exists.");
    return;
  }
  cb(true, "");
}

/* addSkill(skill, callback) - adds to array and re-renders using a callback */
function addSkill(skill, callback) {
  validateSkill(skill, (ok, msg) => {
    if (!ok) {
      $("#skillMessage").text(msg).css("color", "crimson").fadeIn(200).delay(1200).fadeOut(400);
      if (typeof callback === "function") callback(false, msg);
      return;
    }
    skills.push(skill.trim());
    renderSkills(() => {
      $("#skillMessage").text("Skill added ✔").css("color", "green").fadeIn(200).delay(900).fadeOut(400);
      if (typeof callback === "function") callback(true);
    });
  });
}

/* editSkill(index) - prompts user to enter new value, updates array, re-renders */
function editSkill(index) {
  const oldVal = skills[index];
  const newVal = prompt("Edit skill:", oldVal);
  if (newVal === null) return; // user cancelled
  const trimmed = newVal.trim();
  if (!trimmed) {
    alert("Skill cannot be empty.");
    return;
  }
  // check duplicate with different index allowed
  const duplicate = skills.some((s, i) => i !== index && s.toLowerCase() === trimmed.toLowerCase());
  if (duplicate) {
    alert("That skill already exists.");
    return;
  }
  skills[index] = trimmed;
  renderSkills(() => $("#skillMessage").text("Skill updated ✔").css("color", "green").fadeIn(200).delay(900).fadeOut(400));
}

/* removeSkill(index) - removes from array and animates removal */
function removeSkill(index) {
  // animate removal of the corresponding DOM element then update array
  const $col = $(`.skill-col[data-index="${index}"]`);
  $col.slideUp(300, function () {
    // remove from array
    skills.splice(index, 1);
    // re-render entire list (simpler to keep indexes correct)
    renderSkills();
  });
}

/* clearAllSkills() - convenience to clear list with confirmation */
function clearAllSkills() {
  if (!confirm("Clear all skills? This cannot be undone in this session.")) return;
  skills = [];
  renderSkills(() => $("#skillMessage").text("All skills cleared").css("color", "crimson").fadeIn(200).delay(900).fadeOut(400));
}

/* HW9 STEP 4: Keyboard events (Enter to add, Escape to clear)
   - bound to the #newSkill input using jQuery 
*/
function wireKeyboardEvents() {
  $("#newSkill").on("keydown", function (e) {
    if (e.key === "Enter") {
      // trigger add skill
      const value = $(this).val();
      addSkill(value, () => { $(this).val(""); });
    } else if (e.key === "Escape") {
      // clear inputs
      $(this).val("");
    }
  });

  // Escape also clears search field
  $("#skillSearch").on("keydown", function (e) {
    if (e.key === "Escape") $(this).val("");
  });
}

/* HW9 BONUS: Real-time skill search filter
   - filters skills using Array.filter and re-renders
   - uses input event and does case-insensitive matching
*/
function wireSkillSearch() {
  $("#skillSearch").on("input", function () {
    const q = $(this).val().trim().toLowerCase();
    if (!q) {
      // show all skills
      renderSkills();
      return;
    }
    // filter skills and render subset
    const filtered = skills.map((s, i) => ({ s, i })).filter(obj => obj.s.toLowerCase().includes(q));
    const $row = $("#skillsRow");
    $row.empty();
    filtered.forEach(obj => {
      const index = obj.i;
      const skill = obj.s;
      const $col = $(`
        <div class="col-md-3 col-6 skill-col" data-index="${index}">
          <div class="card skill-card text-center p-3">
            <div class="card-body fw-bold skill-text">${skill}</div>
            <div class="skill-actions mt-2">
              <button class="btn btn-sm btn-light edit-skill">Edit</button>
              <button class="btn btn-sm btn-outline-danger delete-skill">Delete</button>
            </div>
          </div>
        </div>
      `);
      $row.append($col.hide().fadeIn(200));
    });

    // NOTE: Handlers are attached via delegation in $(document).ready, no need to re-attach here.
  });
}

/*
   HW9 STEP 5: Dynamic tables (Education & Experience)
   - uses jQuery to build table rows
*/
function buildTable($table, headers, rows) {
  const $thead = $("<thead>");
  const $trHead = $("<tr>");
  headers.forEach(h => $trHead.append(`<th>${h}</th>`));
  $thead.append($trHead);
  const $tbody = $("<tbody>");
  rows.forEach(row => {
    const $tr = $("<tr>");
    row.forEach(cell => $tr.append(`<td>${cell}</td>`));
    $tbody.append($tr);
  });
  $table.empty().append($thead).append($tbody);
}

/*
   HW8: Resume download counter (kept & wired)
*/
let downloadCount = 0;
function wireResumeDownload() {
  $("#downloadResume").on("click", function () {
    downloadCount++;
    $("#downloadCount").text(downloadCount);
    $(this).fadeTo(100, 0.7).fadeTo(100, 1.0);
  });
}

/* BONUS: customization panel wiring
   - font size & background color
*/
function wireCustomizationPanel() {
  $("#fontSizeRange").on("input", function () {
    const size = $(this).val();
    $("body").css("font-size", size + "px");
  });

  $("#bgColorPicker").on("input", function () {
    const c = $(this).val();
    $("body").css("background-color", c);
  });
}

/*
   HW8/HW9: Dark mode toggle (kept)
*/
function wireDarkModeToggle() {
  $("#darkModeToggle").on("click", function () {
    $("body").toggleClass("dark-mode");
    const isDark = $("body").hasClass("dark-mode");
    $(this).text(isDark ? "☀️ Light Mode" : "🌙 Dark Mode");
  });
}

/*
   INIT: run on document ready
   - render nav, init skills & projects, wire events
*/
$(document).ready(function () {
  renderNav();

  // Greeting 
  const greet = (function (name) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    return `${greeting}, my name is ${name}! Welcome to my portfolio!`;
  })("Holden Hrabak");
  $("#greetingMessage").text(greet);

  // Initialize skills array from DOM fallback (Step 1)
  initSkillsFromDOM();
  renderSkills();

  // Wire up the delegated handlers for Edit/Delete for ALL current AND FUTURE skill cards
  $("#skillsRow").on("click", ".edit-skill", function () {
    const $col = $(this).closest(".skill-col");
    const idx = parseInt($col.attr("data-index"), 10);
    editSkill(idx);
  });

  $("#skillsRow").on("click", ".delete-skill", function () {
    const $col = $(this).closest(".skill-col");
    const idx = parseInt($col.attr("data-index"), 10);
    removeSkill(idx);
  });

  // Wire skill search (bonus)
  wireSkillSearch();

  // Wire keyboard events for add/escape (Step 4)
  wireKeyboardEvents();

  // Wire add / clear buttons (Step 1)
  $("#addSkillBtn").on("click", function () {
    const val = $("#newSkill").val();
    addSkill(val, function (ok) {
      if (ok) $("#newSkill").val("");
    });
  });
  $("#clearSkillsBtn").on("click", function () {
    clearAllSkills();
  });

  // Initialize and render projects (Step 3)
  initProjects();
  sortProjects(); 

  // Wire sort toggle button
  $("#sortToggleBtn").on("click", function () {
    sortAscending = !sortAscending;
    $(this).text(sortAscending ? "Sort by Deadline: Oldest → Newest" : "Sort by Deadline: Newest → Oldest");
    sortProjects();
  });

  // Build dynamic tables (Step 5)
  buildTable($("#educationTable"),
    ["University", "Degree", "Duration"],
    [
      ["Northern Arizona University", "B.S. Software Engineering", "2023 - 2028"],
      ["Northern Arizona University", "B.S. Data Science", "2023 - 2028"],
      ["Northern Arizona University", "Minor in Cybersecurity", "2023 - 2028"],
      ["Northern Arizona Univeristy", "Minor in Mathematics", "2023 - 2028"]
    ]
  );

  buildTable($("#experienceTable"),
    ["Company", "Position", "Duration"],
    [
      ["NAU", "Resident Assistant", "2024 - Present"],
      ["Mountainside Fitness", "Front Desk Associate", "2022 - 2023"],
      ["Contemporary Allergy & Asthma", "Clerical Assistant", "2022 - Present"]
    ]
  );

  // Wire resume download counter
  wireResumeDownload();

  // Wire customization and dark mode
  wireCustomizationPanel();
  wireDarkModeToggle();

  // Fade-in observer for sections 
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) $(entry.target).addClass("is-visible");
    });
  }, { threshold: 0.15 });
  $(".fade-in-section").each(function () { observer.observe(this); });
});