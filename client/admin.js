/* admin.js — login-first, dark modern admin */

const STORAGE_KEY = "cz_admin_mock_v2";

const defaultState = {
  admin: { email: "admin@comfort.zone", name: "Admin", password: "adminpass" },
  users: [
    { id: "u1", name: "Ria Sharma", email: "ria@example.com" },
    { id: "u2", name: "Amit Roy", email: "amit@example.com" },
  ],
  hotels: [
    { id: "h1", name: "Grand Plaza", location: "New York", price: 299 },
    { id: "h2", name: "Ocean View", location: "Miami", price: 399 },
  ],
  bookings: [
    {
      id: "b1",
      name: "Ria Sharma",
      email: "ria@example.com",
      room: "Suite",
      amount: 6000,
      status: "Paid",
      date: new Date().toLocaleString(),
    },
  ],
  contacts: [
    {
      id: "c1",
      name: "Visitor",
      email: "visit@example.com",
      message: "Hello admin",
      date: new Date().toLocaleString(),
    },
  ],
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return JSON.parse(JSON.stringify(defaultState));
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return JSON.parse(JSON.stringify(defaultState));
  }
}
function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function showToast(msg, t = 2200) {
  const c = document.getElementById("toasts");
  if (!c) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => el.remove(), t);
}

let state = loadState();

/* AUTH helpers */
function isLoggedIn() {
  return !!localStorage.getItem("cz_admin_token_v2");
}
function setLoggedIn() {
  localStorage.setItem("cz_admin_token_v2", "mock-token");
}
function logout() {
  localStorage.removeItem("cz_admin_token_v2");
}

/* DOM ready */
document.addEventListener("DOMContentLoaded", () => {
  const authScreen = document.getElementById("authScreen");
  const dashboardApp = document.getElementById("dashboardApp");
  const authForm = document.getElementById("authForm");
  const adminNameEl = document.getElementById("adminName");
  const adminEmailInput = document.getElementById("adminEmail");
  const adminPassInput = document.getElementById("adminPassword");

  // show login or dashboard
  if (isLoggedIn()) {
    authScreen.classList.add("hide");
    dashboardApp.classList.remove("hide");
    adminNameEl.textContent = state.admin.name;
    refreshAll();
  } else {
    dashboardApp.classList.add("hide");
    authScreen.classList.remove("hide");
    // clear inputs to force typing (fix for prefilled password)
    adminEmailInput.value = "";
    adminPassInput.value = "";
  }

  // auth submit
  authForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = adminEmailInput.value.trim();
    const pass = adminPassInput.value;
    if (email === state.admin.email && pass === state.admin.password) {
      setLoggedIn();
      showToast("Signed in");
      authScreen.classList.add("hide");
      dashboardApp.classList.remove("hide");
      adminNameEl.textContent = state.admin.name;
      refreshAll();
    } else {
      showToast("Invalid credentials");
    }
  });

  // logout
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    logout();
    showToast("Signed out");
    setTimeout(() => location.reload(), 450);
  });

  // nav switching
  document.querySelectorAll(".side-nav .nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".side-nav .nav-item")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const page = btn.dataset.page;
      document
        .querySelectorAll(".page")
        .forEach((p) => p.classList.remove("active-page"));
      document.getElementById(page).classList.add("active-page");
      document.getElementById("pageTitle").textContent = btn.textContent;
    });
  });

  // quick actions
  document.getElementById("seedMock")?.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    state = loadState();
    showToast("Demo data seeded");
    refreshAll();
  });
  document.getElementById("resetMock")?.addEventListener("click", () => {
    if (!confirm("Reset demo data?")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = loadState();
    showToast("Reset done");
    refreshAll();
  });

  document
    .getElementById("openUsers")
    ?.addEventListener("click", () =>
      document.querySelector('[data-page="users"]').click()
    );
  document
    .getElementById("openHotels")
    ?.addEventListener("click", () =>
      document.querySelector('[data-page="hotels"]').click()
    );

  // CRUD and exports binding
  document
    .getElementById("addUserBtn")
    ?.addEventListener("click", () => openCrud("users", "add"));
  document
    .getElementById("addHotelBtn")
    ?.addEventListener("click", () => openCrud("hotels", "add"));
  document.getElementById("clearContacts")?.addEventListener("click", () => {
    if (confirm("Clear all messages?")) {
      state.contacts = [];
      saveState(state);
      refreshContacts();
      showToast("Contacts cleared");
    }
  });

  document
    .getElementById("exportBookings")
    ?.addEventListener("click", () =>
      exportCSV(state.bookings, "bookings_recent")
    );
  document
    .getElementById("exportAllBookings")
    ?.addEventListener("click", () =>
      exportCSV(state.bookings, "bookings_all")
    );
  document
    .getElementById("exportUsers")
    ?.addEventListener("click", () => exportCSV(state.users, "users"));
  document
    .getElementById("exportHotels")
    ?.addEventListener("click", () => exportCSV(state.hotels, "hotels"));
  document
    .getElementById("exportContacts")
    ?.addEventListener("click", () => exportCSV(state.contacts, "contacts"));

  document.getElementById("bookingSearch")?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = state.bookings.filter(
      (b) =>
        (b.name || "").toLowerCase().includes(q) ||
        (b.email || "").toLowerCase().includes(q)
    );
    renderBookingsTable(filtered);
  });

  // CRUD modal wiring
  document
    .getElementById("crudCancel")
    ?.addEventListener("click", () => closeCrudModal());
  document.getElementById("crudSave")?.addEventListener("click", (e) => {
    e.preventDefault();
    handleCrudSave();
  });
});

/* Refreshers and renderers (same as before) */
function refreshAll() {
  refreshKPIs();
  refreshHotels();
  refreshBookings();
  refreshUsers();
  refreshContacts();
}
function refreshKPIs() {
  document.getElementById("kpiUsers").textContent = state.users.length;
  document.getElementById("kpiBookings").textContent = state.bookings.length;
  const revenue = state.bookings.reduce(
    (s, b) => s + (Number(b.amount) || 0),
    0
  );
  document.getElementById("kpiRevenue").textContent = "₹" + revenue;
  document.getElementById("kpiMessages").textContent = state.contacts.length;
}
function tableFromColumns(data, columns, actionsRenderer) {
  const tbl = document.createElement("table");
  tbl.className = "table";
  const thead = document.createElement("thead");
  const thr = document.createElement("tr");
  columns.forEach((c) => {
    const th = document.createElement("th");
    th.textContent = c.label;
    thr.appendChild(th);
  });
  const thAct = document.createElement("th");
  thAct.textContent = "Actions";
  thr.appendChild(thAct);
  thead.appendChild(thr);
  tbl.appendChild(thead);
  const tbody = document.createElement("tbody");
  data.forEach((row) => {
    const tr = document.createElement("tr");
    columns.forEach((c) => {
      const td = document.createElement("td");
      td.textContent =
        typeof c.key === "function" ? c.key(row) : row[c.key] ?? "";
      tr.appendChild(td);
    });
    const tdAct = document.createElement("td");
    tdAct.className = "row-actions";
    tdAct.appendChild(actionsRenderer(row));
    tr.appendChild(tdAct);
    tbody.appendChild(tr);
  });
  tbl.appendChild(tbody);
  return tbl;
}
function refreshHotels() {
  const wrap = document.getElementById("hotelsTable");
  if (!wrap) return;
  wrap.innerHTML = "";
  const cols = [
    { label: "Name", key: "name" },
    { label: "Location", key: "location" },
    { label: "Price (₹)", key: (r) => r.price },
  ];
  const tbl = tableFromColumns(state.hotels, cols, (row) => {
    const wrap = document.createElement("div");
    const edit = document.createElement("button");
    edit.className = "btn ghost";
    edit.textContent = "Edit";
    edit.addEventListener("click", () => openCrud("hotels", "edit", row));
    const del = document.createElement("button");
    del.className = "btn danger";
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      if (confirm("Delete hotel?")) {
        state.hotels = state.hotels.filter((h) => h.id !== row.id);
        saveState(state);
        refreshHotels();
        showToast("Hotel deleted");
      }
    });
    wrap.appendChild(edit);
    wrap.appendChild(del);
    return wrap;
  });
  wrap.appendChild(tbl);
}
function refreshBookings() {
  const wrap = document.getElementById("bookingsTable");
  if (!wrap) return;
  wrap.innerHTML = "";
  const cols = [
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Room", key: "room" },
    { label: "Amount", key: (r) => "₹" + (r.amount || 0) },
    { label: "Status", key: "status" },
    { label: "Date", key: "date" },
  ];
  const tbl = tableFromColumns(state.bookings, cols, (row) => {
    const wrap = document.createElement("div");
    const conf = document.createElement("button");
    conf.className = "btn primary";
    conf.textContent = "Confirm";
    conf.addEventListener("click", () => {
      row.status = "Paid";
      saveState(state);
      refreshBookings();
      showToast("Payment marked Paid");
    });
    const del = document.createElement("button");
    del.className = "btn danger";
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      if (confirm("Delete booking?")) {
        state.bookings = state.bookings.filter((b) => b.id !== row.id);
        saveState(state);
        refreshBookings();
        showToast("Booking deleted");
      }
    });
    wrap.appendChild(conf);
    wrap.appendChild(del);
    return wrap;
  });
  wrap.appendChild(tbl);
  const recentWrap = document.getElementById("recentBookingsWrap");
  if (recentWrap) {
    recentWrap.innerHTML = "";
    const recent = state.bookings.slice(-6).reverse();
    const cols2 = [
      { label: "Guest", key: "name" },
      { label: "Room", key: "room" },
      { label: "Amount", key: (r) => "₹" + r.amount },
      { label: "Status", key: "status" },
    ];
    recentWrap.appendChild(
      tableFromColumns(recent, cols2, () => document.createElement("div"))
    );
  }
}
function refreshUsers() {
  const wrap = document.getElementById("usersTable");
  if (!wrap) return;
  wrap.innerHTML = "";
  const cols = [
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
  ];
  const tbl = tableFromColumns(state.users, cols, (row) => {
    const wrap = document.createElement("div");
    const edit = document.createElement("button");
    edit.className = "btn ghost";
    edit.textContent = "Edit";
    edit.addEventListener("click", () => openCrud("users", "edit", row));
    const del = document.createElement("button");
    del.className = "btn danger";
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      if (confirm("Delete user?")) {
        state.users = state.users.filter((u) => u.id !== row.id);
        saveState(state);
        refreshUsers();
        showToast("User deleted");
      }
    });
    wrap.appendChild(edit);
    wrap.appendChild(del);
    return wrap;
  });
  wrap.appendChild(tbl);
}
function refreshContacts() {
  const wrap = document.getElementById("contactsTable");
  if (!wrap) return;
  wrap.innerHTML = "";
  const cols = [
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Message", key: "message" },
    { label: "Date", key: "date" },
  ];
  const tbl = tableFromColumns(state.contacts, cols, (row) => {
    const wrap = document.createElement("div");
    const del = document.createElement("button");
    del.className = "btn danger";
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      if (confirm("Delete message?")) {
        state.contacts = state.contacts.filter((c) => c.id !== row.id);
        saveState(state);
        refreshContacts();
        showToast("Message deleted");
      }
    });
    wrap.appendChild(del);
    return wrap;
  });
  wrap.appendChild(tbl);
}

/* CRUD modal support (same as before) */
let currentCrud = null;
function openCrud(collection, mode, row = null) {
  if (!isLoggedIn()) {
    showToast("Sign in first");
    return;
  }
  currentCrud = { collection, mode, row };
  const modal = document.getElementById("crudModal");
  modal.classList.add("active");
  document.getElementById("crudTitle").textContent =
    (mode === "add" ? "Add " : "Edit ") + collection.slice(0, -1).toUpperCase();
  const form = document.getElementById("crudForm");
  form.innerHTML = "";
  if (collection === "users") {
    form.appendChild(labelInput("Name", "name", row?.name || ""));
    form.appendChild(labelInput("Email", "email", row?.email || ""));
  } else if (collection === "hotels") {
    form.appendChild(labelInput("Hotel name", "name", row?.name || ""));
    form.appendChild(labelInput("Location", "location", row?.location || ""));
    form.appendChild(labelInput("Price (₹)", "price", row?.price || ""));
  }
}
function labelInput(labelText, name, value = "") {
  const wrap = document.createElement("div");
  wrap.className = "stack";
  const lbl = document.createElement("label");
  lbl.textContent = labelText;
  const inp = document.createElement("input");
  inp.name = name;
  inp.value = value;
  inp.style.padding = "8px";
  wrap.appendChild(lbl);
  wrap.appendChild(inp);
  return wrap;
}
function closeCrudModal() {
  currentCrud = null;
  document.getElementById("crudModal").classList.remove("active");
}
function handleCrudSave() {
  const form = document.getElementById("crudForm");
  const values = {};
  form
    .querySelectorAll("input")
    .forEach((i) => (values[i.name] = i.value.trim()));
  if (!currentCrud) return;
  if (currentCrud.collection === "users") {
    if (currentCrud.mode === "add") {
      const id = "u" + Date.now();
      state.users.push({
        id,
        name: values.name || "No name",
        email: values.email || "",
      });
      showToast("User added");
    } else if (currentCrud.mode === "edit") {
      const idx = state.users.findIndex((u) => u.id === currentCrud.row.id);
      if (idx > -1) {
        state.users[idx].name = values.name;
        state.users[idx].email = values.email;
        showToast("User updated");
      }
    }
    saveState(state);
    refreshUsers();
    refreshKPIs();
    closeCrudModal();
  } else if (currentCrud.collection === "hotels") {
    if (currentCrud.mode === "add") {
      const id = "h" + Date.now();
      state.hotels.push({
        id,
        name: values.name || "Hotel",
        location: values.location || "",
        price: Number(values.price) || 0,
      });
      showToast("Hotel added");
    } else if (currentCrud.mode === "edit") {
      const idx = state.hotels.findIndex((h) => h.id === currentCrud.row.id);
      if (idx > -1) {
        state.hotels[idx].name = values.name;
        state.hotels[idx].location = values.location;
        state.hotels[idx].price = Number(values.price) || 0;
        showToast("Hotel updated");
      }
    }
    saveState(state);
    refreshHotels();
    closeCrudModal();
  }
}

/* CSV export */
function exportCSV(arr, name = "export") {
  if (!arr || !arr.length) {
    showToast("Nothing to export");
    return;
  }
  const keys = Object.keys(arr[0]);
  const csv = [keys.join(",")]
    .concat(
      arr.map((r) => keys.map((k) => JSON.stringify(r[k] ?? "")).join(","))
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Export started");
}
