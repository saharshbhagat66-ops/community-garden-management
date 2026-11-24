// =========================================================
// Initial Seed Data for GreenRoots Community Garden Platform
// Stored in browser localStorage for full CRUD persistence
// =========================================================
const STORAGE_KEY = "greenroots_garden_data_v1";

const DEFAULT_DATA = {
  plots: [
    { id: 1, code: "A1", crop: "Roma Tomatoes & Basil", assignee: "Rahul", status: "Occupied", size: "4x8 ft" },
    { id: 2, code: "A2", crop: "Spinach & Lettuce", assignee: "Saharsh Bhagat", status: "Occupied", size: "4x8 ft" },
    { id: 3, code: "A3", crop: "Bell Peppers", assignee: "Ananya Verma", status: "Occupied", size: "4x6 ft" },
    { id: 4, code: "B1", crop: "Unassigned", assignee: "Unassigned", status: "Available", size: "4x8 ft" },
    { id: 5, code: "B2", crop: "Soil Composting", assignee: "Maintenance Crew", status: "Maintenance", size: "4x8 ft" },
    { id: 6, code: "B3", crop: "Carrots & Radish", assignee: "Kabir Singh", status: "Occupied", size: "4x6 ft" }
  ],
  members: [
    { id: 1, name: "Rahul", role: "Coordinator", email: "rahul@greenroots.org", phone: "9876543210", plot: "A1", joined: "2026-08-15" },
    { id: 2, name: "Saharsh Bhagat", role: "Gardener", email: "saharsh@greenroots.org", phone: "9876501234", plot: "A2", joined: "2026-08-18" },
    { id: 3, name: "Ananya Verma", role: "Gardener", email: "ananya@greenroots.org", phone: "9811223344", plot: "A3", joined: "2026-09-02" },
    { id: 4, name: "Kabir Singh", role: "Volunteer", email: "kabir@greenroots.org", phone: "9899887766", plot: "B3", joined: "2026-09-12" }
  ],
  tasks: [
    { id: 1, title: "Repair drip irrigation valve on Plot B2", plot: "B2", assignee: "Rahul", due: "2026-11-26", priority: "High", status: "Pending" },
    { id: 2, title: "Apply organic mulch around tomato beds", plot: "A1", assignee: "Saharsh Bhagat", due: "2026-11-27", priority: "Medium", status: "Pending" },
    { id: 3, title: "Turn main compost bin #2", plot: "General", assignee: "Kabir Singh", due: "2026-11-28", priority: "Low", status: "Completed" },
    { id: 4, title: "Weed pathways between Section A and B", plot: "General", assignee: "Ananya Verma", due: "2026-11-29", priority: "Medium", status: "Pending" }
  ],
  logs: [
    { id: 1, date: "2026-11-23", type: "Watering", plot: "A1", member: "Rahul", notes: "Morning drip cycle — 20 minutes" },
    { id: 2, date: "2026-11-22", type: "Composting", plot: "B2", member: "Saharsh Bhagat", notes: "Mixed 15kg green waste + dry leaves" },
    { id: 3, date: "2026-11-21", type: "Pest Control", plot: "A3", member: "Ananya Verma", notes: "Applied neem oil spray for aphids" }
  ],
  harvests: [
    { id: 1, date: "2026-11-20", crop: "Roma Tomatoes", qty: 8.5, plot: "A1", by: "Rahul", dest: "Shared with Members" },
    { id: 2, date: "2026-11-18", crop: "Fresh Spinach", qty: 5.2, plot: "A2", by: "Saharsh Bhagat", dest: "Local Food Bank" },
    { id: 3, date: "2026-11-15", crop: "Carrots", qty: 6.8, plot: "B3", by: "Kabir Singh", dest: "Community Market" }
  ],
  volunteers: [
    { id: 1, date: "2026-11-22", name: "Rahul", activity: "Irrigation Setup & Inspection", hours: 4.5 },
    { id: 2, date: "2026-11-21", name: "Saharsh Bhagat", activity: "Compost & Bed Preparation", hours: 5.0 },
    { id: 3, date: "2026-11-19", name: "Ananya Verma", activity: "Tool Shed Organization", hours: 3.0 },
    { id: 4, date: "2026-11-18", name: "Kabir Singh", activity: "Pathway Weeding", hours: 3.5 }
  ],
  announcements: [
    { id: 1, title: "Weekend Community Harvest & Potluck", category: "Event", author: "Rahul", date: "2026-11-24", body: "Join us this Saturday at 9:00 AM for the seasonal harvest sharing and compost workshop." },
    { id: 2, title: "Water Supply Maintenance on Plot B2", category: "Maintenance", author: "Saharsh Bhagat", date: "2026-11-23", body: "Line B will be shut off between 2:00 PM and 4:00 PM on Thursday for valve replacement." },
    { id: 3, title: "Plot B1 Now Open for Adoption", category: "General", author: "Admin", date: "2026-11-20", body: "Plot B1 (4x8 ft) is freshly tilled and available for new registered members." }
  ]
};

function loadStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

function saveStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
