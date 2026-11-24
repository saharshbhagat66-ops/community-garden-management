// =========================================================
// GreenRoots — Application Logic & DOM Controllers
// =========================================================
let state = loadStore();

const sectionTitles = {
  dashboard: "Admin Dashboard",
  plots: "Garden & Plot Management",
  members: "Member Registration & Directory",
  tasks: "Task Scheduling",
  logs: "Watering & Maintenance Logs",
  harvest: "Harvest Records",
  volunteers: "Volunteer Hours Tracker",
  announcements: "Community Announcements"
};

// Navigation
function switchSection(sectionId) {
  document.querySelectorAll(".view-section").forEach(sec => sec.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));

  const target = document.getElementById(`section-${sectionId}`);
  const activeBtn = document.querySelector(`.nav-btn[data-section="${sectionId}"]`);
  if (target) target.classList.add("active");
  if (activeBtn) activeBtn.classList.add("active");

  document.getElementById("pageTitle").textContent = sectionTitles[sectionId] || "GreenRoots";
  document.getElementById("sidebar").classList.remove("open");
}

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => switchSection(btn.dataset.section));
});

document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

// Toast Helper
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

function nextId(arr) {
  return arr.length ? Math.max(...arr.map(i => i.id)) + 1 : 1;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// =========================================================
// RENDER ALL VIEWS
// =========================================================
function renderAll() {
  renderDashboard();
  renderPlots();
  renderMembers();
  renderTasks();
  renderLogs();
  renderHarvest();
  renderVolunteers();
  renderAnnouncements();
}

// 1. Dashboard
function renderDashboard() {
  const totalPlots = state.plots.length;
  const occupiedPlots = state.plots.filter(p => p.status === "Occupied").length;
  const occupancyPct = totalPlots ? Math.round((occupiedPlots / totalPlots) * 100) : 0;
  const pendingTasks = state.tasks.filter(t => t.status === "Pending").length;
  const totalHarvest = state.harvests.reduce((s, h) => s + Number(h.qty), 0).toFixed(1);
  const totalHours = state.volunteers.reduce((s, v) => s + Number(v.hours), 0).toFixed(1);

  document.getElementById("dashboardKpis").innerHTML = `
    <div class="kpi-card">
      <div class="kpi-label">Garden Plots</div>
      <div class="kpi-value">${occupiedPlots} / ${totalPlots}</div>
      <div class="kpi-sub">${occupancyPct}% Occupancy</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Registered Members</div>
      <div class="kpi-value">${state.members.length}</div>
      <div class="kpi-sub">Active Community</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Pending Tasks</div>
      <div class="kpi-value">${pendingTasks}</div>
      <div class="kpi-sub">${state.tasks.length} Total Scheduled</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Total Harvest</div>
      <div class="kpi-value">${totalHarvest} kg</div>
      <div class="kpi-sub">${state.harvests.length} Harvest Logs</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Volunteer Hours</div>
      <div class="kpi-value">${totalHours} hrs</div>
      <div class="kpi-sub">Community Contribution</div>
    </div>
  `;

  // Plot status chart
  const counts = {
    Occupied: state.plots.filter(p => p.status === "Occupied").length,
    Available: state.plots.filter(p => p.status === "Available").length,
    Maintenance: state.plots.filter(p => p.status === "Maintenance").length
  };
  document.getElementById("plotChart").innerHTML = Object.entries(counts).map(([label, val]) => {
    const pct = totalPlots ? Math.round((val / totalPlots) * 100) : 0;
    return `
      <div class="bar-row">
        <div class="bar-label"><span>${label}</span><strong>${val} (${pct}%)</strong></div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
      </div>
    `;
  }).join("");

  // Top volunteers leaderboard
  const byVol = {};
  state.volunteers.forEach(v => {
    byVol[v.name] = (byVol[v.name] || 0) + Number(v.hours);
  });
  const sortedVols = Object.entries(byVol).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxHrs = sortedVols.length ? sortedVols[0][1] : 1;
  document.getElementById("volunteerLeaderboard").innerHTML = sortedVols.length
    ? sortedVols.map(([name, hrs]) => `
        <div class="bar-row">
          <div class="bar-label"><span>${name}</span><strong>${hrs.toFixed(1)} hrs</strong></div>
          <div class="bar-track"><div class="bar-fill" style="width:${(hrs / maxHrs) * 100}%"></div></div>
        </div>
      `).join("")
    : "<p class='plot-meta'>No volunteer hours logged yet.</p>";

  // Upcoming tasks preview
  const upcoming = state.tasks.filter(t => t.status === "Pending").slice(0, 4);
  document.getElementById("dashboardTasks").innerHTML = upcoming.length
    ? upcoming.map(t => `
        <div class="mini-item">
          <div><strong>${t.title}</strong><br><small class="plot-meta">Plot ${t.plot} • ${t.assignee}</small></div>
          <span class="pill ${t.priority === "High" ? "pill-red" : t.priority === "Medium" ? "pill-amber" : "pill-blue"}">${t.due}</span>
        </div>
      `).join("")
    : "<p class='plot-meta'>All tasks completed!</p>";

  // Latest announcements preview
  document.getElementById("dashboardAnnouncements").innerHTML = state.announcements.slice(0, 3).map(a => `
    <div class="mini-item">
      <div><strong>${a.title}</strong><br><small class="plot-meta">${a.date} • ${a.author}</small></div>
      <span class="pill pill-green">${a.category}</span>
    </div>
  `).join("");
}

// 2. Plots
function renderPlots() {
  const filter = document.getElementById("plotStatusFilter").value;
  const list = filter === "All" ? state.plots : state.plots.filter(p => p.status === filter);
  const grid = document.getElementById("plotsGrid");

  grid.innerHTML = list.map(p => {
    const pillClass = p.status === "Occupied" ? "pill-green" : p.status === "Available" ? "pill-blue" : "pill-amber";
    return `
      <div class="plot-card">
        <div class="plot-top">
          <span class="plot-code">Plot ${p.code}</span>
          <span class="pill ${pillClass}">${p.status}</span>
        </div>
        <div><strong>Crop:</strong> ${p.crop}</div>
        <div class="plot-meta"><strong>Assignee:</strong> ${p.assignee}</div>
        <div class="plot-meta"><strong>Size:</strong> ${p.size}</div>
        <div class="plot-actions">
          <button class="btn-sm" onclick="cyclePlotStatus(${p.id})">Change Status</button>
          <button class="btn-sm del" onclick="deleteItem('plots', ${p.id})">Delete</button>
        </div>
      </div>
    `;
  }).join("");
}

window.cyclePlotStatus = function(id) {
  const order = ["Available", "Occupied", "Maintenance"];
  const plot = state.plots.find(p => p.id === id);
  if (!plot) return;
  plot.status = order[(order.indexOf(plot.status) + 1) % order.length];
  saveStore(state);
  renderAll();
  showToast(`Plot ${plot.code} marked as ${plot.status}`);
};

document.getElementById("plotStatusFilter").addEventListener("change", renderPlots);
document.getElementById("plotForm").addEventListener("submit", e => {
  e.preventDefault();
  state.plots.push({
    id: nextId(state.plots),
    code: document.getElementById("plotCode").value.trim().toUpperCase(),
    crop: document.getElementById("plotCrop").value.trim(),
    assignee: document.getElementById("plotAssignee").value.trim() || "Unassigned",
    status: document.getElementById("plotStatus").value,
    size: document.getElementById("plotSize").value.trim()
  });
  saveStore(state);
  e.target.reset();
  renderAll();
  showToast("Garden plot added successfully!");
});

// 3. Members
function renderMembers() {
  const q = document.getElementById("memberSearch").value.toLowerCase();
  const list = state.members.filter(m =>
    m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q) || m.plot.toLowerCase().includes(q)
  );
  document.getElementById("membersTableBody").innerHTML = list.map(m => `
    <tr>
      <td><strong>${m.name}</strong></td>
      <td><span class="pill pill-green">${m.role}</span></td>
      <td>${m.email}</td>
      <td>${m.phone}</td>
      <td>${m.plot}</td>
      <td>${m.joined}</td>
      <td><button class="btn-sm del" onclick="deleteItem('members', ${m.id})">Remove</button></td>
    </tr>
  `).join("");
}

document.getElementById("memberSearch").addEventListener("input", renderMembers);
document.getElementById("memberForm").addEventListener("submit", e => {
  e.preventDefault();
  state.members.push({
    id: nextId(state.members),
    name: document.getElementById("memberName").value.trim(),
    email: document.getElementById("memberEmail").value.trim(),
    phone: document.getElementById("memberPhone").value.trim(),
    role: document.getElementById("memberRole").value,
    plot: document.getElementById("memberPlot").value.trim() || "None",
    joined: todayStr()
  });
  saveStore(state);
  e.target.reset();
  renderAll();
  showToast("New member registered!");
});

// 4. Tasks
function renderTasks() {
  const filter = document.getElementById("taskFilter").value;
  const list = filter === "All" ? state.tasks : state.tasks.filter(t => t.status === filter);
  document.getElementById("tasksTableBody").innerHTML = list.map(t => `
    <tr>
      <td><strong>${t.title}</strong></td>
      <td>${t.plot}</td>
      <td>${t.assignee}</td>
      <td>${t.due}</td>
      <td><span class="pill ${t.priority === "High" ? "pill-red" : t.priority === "Medium" ? "pill-amber" : "pill-blue"}">${t.priority}</span></td>
      <td><span class="pill ${t.status === "Completed" ? "pill-green" : "pill-amber"}">${t.status}</span></td>
      <td>
        <button class="btn-sm" onclick="toggleTask(${t.id})">${t.status === "Completed" ? "Reopen" : "Complete"}</button>
        <button class="btn-sm del" onclick="deleteItem('tasks', ${t.id})">Delete</button>
      </td>
    </tr>
  `).join("");
}

window.toggleTask = function(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  task.status = task.status === "Completed" ? "Pending" : "Completed";
  saveStore(state);
  renderAll();
  showToast(`Task marked ${task.status}`);
};

document.getElementById("taskFilter").addEventListener("change", renderTasks);
document.getElementById("taskForm").addEventListener("submit", e => {
  e.preventDefault();
  state.tasks.unshift({
    id: nextId(state.tasks),
    title: document.getElementById("taskTitle").value.trim(),
    plot: document.getElementById("taskPlot").value.trim(),
    assignee: document.getElementById("taskAssignee").value.trim(),
    due: document.getElementById("taskDue").value,
    priority: document.getElementById("taskPriority").value,
    status: "Pending"
  });
  saveStore(state);
  e.target.reset();
  renderAll();
  showToast("Task scheduled!");
});

// 5. Watering & Maintenance Logs
function renderLogs() {
  document.getElementById("logsTableBody").innerHTML = state.logs.map(l => `
    <tr>
      <td>${l.date}</td>
      <td><span class="pill pill-blue">${l.type}</span></td>
      <td>${l.plot}</td>
      <td>${l.member}</td>
      <td>${l.notes}</td>
      <td><button class="btn-sm del" onclick="deleteItem('logs', ${l.id})">Delete</button></td>
    </tr>
  `).join("");
}

document.getElementById("logForm").addEventListener("submit", e => {
  e.preventDefault();
  state.logs.unshift({
    id: nextId(state.logs),
    type: document.getElementById("logType").value,
    plot: document.getElementById("logPlot").value.trim().toUpperCase(),
    member: document.getElementById("logMember").value.trim(),
    date: document.getElementById("logDate").value,
    notes: document.getElementById("logNotes").value.trim()
  });
  saveStore(state);
  e.target.reset();
  renderAll();
  showToast("Maintenance log recorded!");
});

// 6. Harvest Records
function renderHarvest() {
  const total = state.harvests.reduce((s, h) => s + Number(h.qty), 0).toFixed(1);
  document.getElementById("totalHarvestPill").textContent = `Total: ${total} kg`;
  document.getElementById("harvestTableBody").innerHTML = state.harvests.map(h => `
    <tr>
      <td>${h.date}</td>
      <td><strong>${h.crop}</strong></td>
      <td>${Number(h.qty).toFixed(1)} kg</td>
      <td>${h.plot}</td>
      <td>${h.by}</td>
      <td><span class="pill pill-green">${h.dest}</span></td>
      <td><button class="btn-sm del" onclick="deleteItem('harvests', ${h.id})">Delete</button></td>
    </tr>
  `).join("");
}

document.getElementById("harvestForm").addEventListener("submit", e => {
  e.preventDefault();
  state.harvests.unshift({
    id: nextId(state.harvests),
    crop: document.getElementById("harvestCrop").value.trim(),
    qty: parseFloat(document.getElementById("harvestQty").value),
    plot: document.getElementById("harvestPlot").value.trim().toUpperCase(),
    by: document.getElementById("harvestBy").value.trim(),
    dest: document.getElementById("harvestDest").value,
    date: document.getElementById("harvestDate").value
  });
  saveStore(state);
  e.target.reset();
  renderAll();
  showToast("Harvest record added!");
});

// 7. Volunteer Hours
function renderVolunteers() {
  const total = state.volunteers.reduce((s, v) => s + Number(v.hours), 0).toFixed(1);
  document.getElementById("totalVolunteerPill").textContent = `Total: ${total} hrs`;
  document.getElementById("volunteerTableBody").innerHTML = state.volunteers.map(v => `
    <tr>
      <td>${v.date}</td>
      <td><strong>${v.name}</strong></td>
      <td>${v.activity}</td>
      <td>${Number(v.hours).toFixed(1)} hrs</td>
      <td><button class="btn-sm del" onclick="deleteItem('volunteers', ${v.id})">Delete</button></td>
    </tr>
  `).join("");
}

document.getElementById("volunteerForm").addEventListener("submit", e => {
  e.preventDefault();
  state.volunteers.unshift({
    id: nextId(state.volunteers),
    name: document.getElementById("volName").value.trim(),
    activity: document.getElementById("volActivity").value.trim(),
    hours: parseFloat(document.getElementById("volHours").value),
    date: document.getElementById("volDate").value
  });
  saveStore(state);
  e.target.reset();
  renderAll();
  showToast("Volunteer hours logged!");
});

// 8. Announcements
function renderAnnouncements() {
  document.getElementById("announcementsList").innerHTML = state.announcements.map(a => `
    <div class="ann-card">
      <div class="ann-header">
        <h4>${a.title}</h4>
        <div>
          <span class="pill ${a.category === "Alert" ? "pill-red" : a.category === "Maintenance" ? "pill-amber" : "pill-green"}">${a.category}</span>
          <button class="btn-sm del" onclick="deleteItem('announcements', ${a.id})">Delete</button>
        </div>
      </div>
      <p>${a.body}</p>
      <div class="ann-meta">Posted by <strong>${a.author}</strong> on ${a.date}</div>
    </div>
  `).join("");
}

document.getElementById("announcementForm").addEventListener("submit", e => {
  e.preventDefault();
  state.announcements.unshift({
    id: nextId(state.announcements),
    title: document.getElementById("annTitle").value.trim(),
    category: document.getElementById("annCategory").value,
    author: document.getElementById("annAuthor").value.trim(),
    body: document.getElementById("annBody").value.trim(),
    date: todayStr()
  });
  saveStore(state);
  e.target.reset();
  renderAll();
  showToast("Announcement posted!");
});

// Generic Delete
window.deleteItem = function(collection, id) {
  state[collection] = state[collection].filter(item => item.id !== id);
  saveStore(state);
  renderAll();
  showToast("Record removed");
};

// Export & Reset
document.getElementById("exportDataBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "greenroots-backup.json";
  a.click();
  URL.revokeObjectURL(url);
  showToast("Data exported as JSON");
});

document.getElementById("resetDataBtn").addEventListener("click", () => {
  if (confirm("Reset all records back to demo data?")) {
    state = JSON.parse(JSON.stringify(DEFAULT_DATA));
    saveStore(state);
    renderAll();
    showToast("Demo data restored");
  }
});

// Set default date inputs to today
["taskDue", "logDate", "harvestDate", "volDate"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.value = todayStr();
});

// Initial Render
renderAll();
