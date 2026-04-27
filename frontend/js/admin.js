let restaurantsList = [];

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    window.location.href = "login.html";
    return;
  }

  if (user.role !== "super_admin" && user.role !== "admin") {
    M.toast({ html: "Access denied" });
    window.location.href = "login.html";
    return;
  }

  const modals = document.querySelectorAll(".modal");
  M.Modal.init(modals);

  const dropdowns = document.querySelectorAll(".dropdown-trigger");
  M.Dropdown.init(dropdowns, {
    constrainWidth: false,
    coverTrigger: false,
    closeOnClick: true,
    alignment: "left"
  });

  const adminWelcome = document.getElementById("adminWelcome");
  if (adminWelcome) {
    adminWelcome.textContent = `Welcome, ${user.name || user.email}`;
  }

  const logoutBtn = document.getElementById("logoutBtn");
  const logoutDropdownBtn = document.getElementById("logoutDropdownBtn");

  function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  }

  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
  if (logoutDropdownBtn) logoutDropdownBtn.addEventListener("click", handleLogout);

  if (document.getElementById("pendingOwnersTable")) {
    loadPendingOwners();
  }

  if (document.getElementById("restaurantsTable")) {
    loadRestaurants();
  }
  if (document.getElementById("ownersTable")) {
    loadOwners();
  }
  const saveTablesBtn = document.getElementById("saveTablesBtn");
  if (saveTablesBtn) {
    saveTablesBtn.addEventListener("click", saveTables);
  }
});

async function apiRequest(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("token");

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

async function loadPendingOwners() {
  const tableBody = document.getElementById("pendingOwnersTable");
  const pendingCount = document.getElementById("pendingCount");

  if (!tableBody) return;

  try {
    const owners = await apiRequest("/admin/owners/pending");

    if (pendingCount) {
      pendingCount.textContent = owners.length;
    }

    console.log("Loaded pending owners:", owners);

    if (!owners.length) {
      if (pendingCount) {
        pendingCount.textContent = 0;
      }

      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="center-align">No pending owner requests</td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = owners.map(owner => `
      <tr>
        <td>${owner.name || "-"}</td>
        <td>${owner.email || "-"}</td>
        <td><span class="badge-status badge-pending">${owner.status || "pending"}</span></td>
        <td>
          <button class="btn-small green action-btn" onclick="approveOwner('${owner._id}')">Approve</button>
          <button class="btn-small orange action-btn" onclick="rejectOwner('${owner._id}')">Reject</button>
          <button class="btn-small red action-btn" onclick="disableOwner('${owner._id}')">Disable</button>
        </td>
      </tr>
    `).join("");

  } catch (error) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="center-align red-text">${error.message}</td>
      </tr>
    `;
  }
}

async function loadRestaurants() {
  const tableBody = document.getElementById("restaurantsTable");
  const restaurantCount = document.getElementById("restaurantCount");

  if (!tableBody) return;

  try {
    const restaurants = await apiRequest("/admin/restaurants");
    restaurantsList = restaurants.restaurants || [];

    if (restaurantCount) {
      restaurantCount.textContent = restaurantsList.length;
    }

    console.log("Loaded restaurants:", restaurantsList);

    if (!restaurantsList.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="center-align">No restaurants found</td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = restaurantsList.map(restaurant => `
      <tr>
        <td>${restaurant.name || "-"}</td>
        <td>${restaurant.address || "-"}</td>
        <td>${restaurant.isActive ? "Yes" : "No"}</td>
        <td>${restaurant.totalTables || 0}</td>
        <td>
          <button 
            class="btn-small teal action-btn"
            onclick="openMenuModal('${restaurant._id}', '${escapeQuotes(restaurant.name)}')"
          >
            View Menu
          </button>
        </td>
      </tr>
    `).join("");

  } catch (error) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="center-align red-text">${error.message}</td>
      </tr>
    `;
  }
}

async function loadOwners() {
  const tableBody = document.getElementById("ownersTable");

  if (!tableBody) return;

  try {
    const response = await apiRequest("/admin/owners");
    console.log("Loaded owners:", response);
    const owners = response.owners || response.data || response || [];

    if (!owners.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="center-align">No owners found</td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = owners.map(owner => `
      <tr>
        <td>${owner.name || "-"}</td>
        <td>${owner.email || "-"}</td>
        <td>
          <span class="badge-status ${
            owner.status === "approved" ? "badge-approved" :
            owner.status === "disabled" ? "badge-disabled" :
            owner.status === "rejected" ? "badge-rejected" :
            "badge-pending"
          }">
            ${owner.status || "-"}
          </span>
        </td>
        <td>${owner.restaurantName || owner.restaurant?.name || "-"}</td>
        <td>
          <button
            class="btn-small red action-btn"
            onclick="removeOwnerAccess('${owner._id}')"
          >
            Remove Access
          </button>
        </td>
      </tr>
    `).join("");

  } catch (error) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="center-align red-text">${error.message}</td>
      </tr>
    `;
  }
}

async function approveOwner(ownerId) {
  try {
    await apiRequest(`/admin/owners/${ownerId}/approve`, "PATCH");
    M.toast({ html: "Owner approved successfully" });

    if (document.getElementById("pendingOwnersTable")) {
      loadPendingOwners();
    }

    if (document.getElementById("restaurantsTable")) {
      loadRestaurants();
    }
  } catch (error) {
    M.toast({ html: error.message });
  }
}

async function rejectOwner(ownerId) {
  try {
    await apiRequest(`/admin/owners/${ownerId}/reject`, "PATCH");
    M.toast({ html: "Owner rejected successfully" });

    if (document.getElementById("pendingOwnersTable")) {
      loadPendingOwners();
    }
  } catch (error) {
    M.toast({ html: error.message });
  }
}

async function disableOwner(ownerId) {
  try {
    await apiRequest(`/admin/owners/${ownerId}/disable`, "PATCH");
    M.toast({ html: "Owner disabled successfully" });

    if (document.getElementById("pendingOwnersTable")) {
      loadPendingOwners();
    }
  } catch (error) {
    M.toast({ html: error.message });
  }
}

async function openMenuModal(restaurantId, restaurantName) {
  const modalElement = document.getElementById("menuModal");
  const modalTitle = document.getElementById("menuModalTitle");
  const modalBody = document.getElementById("menuModalBody");
  const modalSubtitle = document.getElementById("menuModalSubtitle");

  if (!modalElement || !modalTitle || !modalBody) return;

  if (modalTitle) {
    modalTitle.textContent = `${restaurantName} Menu`;
  }

  if (modalSubtitle) {
    modalSubtitle.textContent = "Loading menu...";
  }

  modalBody.innerHTML = `<p>Loading menu...</p>`;

  const modal = M.Modal.getInstance(modalElement);
  if (modal) {
    modal.open();
  }

  try {
    const res = await apiRequest(`/menu/${restaurantId}`, "GET");
    const items = res.menu || res.data || res || [];

    if (!items.length) {
      modalBody.innerHTML = `<p>No menu items found</p>`;
      return;
    }

    modalBody.innerHTML = `
      <table class="striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.name || "-"}</td>
              <td>${item.category || "-"}</td>
              <td>$${item.price ?? "-"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } catch (error) {
    modalBody.innerHTML = `<p class="red-text">${error.message}</p>`;
  }
}

function openTablesModal(restaurantId, restaurantName) {
  const selectedRestaurantId = document.getElementById("selectedRestaurantId");
  const selectedRestaurantName = document.getElementById("selectedRestaurantName");
  const totalTablesInput = document.getElementById("totalTablesInput");
  const tablesModalElement = document.getElementById("tablesModal");

  if (!selectedRestaurantId || !selectedRestaurantName || !totalTablesInput || !tablesModalElement) {
    return;
  }

  selectedRestaurantId.value = restaurantId;
  selectedRestaurantName.textContent = restaurantName;
  totalTablesInput.value = "";
  M.updateTextFields();

  const modal = M.Modal.getInstance(tablesModalElement);
  if (modal) {
    modal.open();
  }
}

async function saveTables() {
  const selectedRestaurantId = document.getElementById("selectedRestaurantId");
  const totalTablesInput = document.getElementById("totalTablesInput");
  const tablesModalElement = document.getElementById("tablesModal");

  if (!selectedRestaurantId || !totalTablesInput || !tablesModalElement) {
    return;
  }

  const restaurantId = selectedRestaurantId.value;
  const totalTables = parseInt(totalTablesInput.value, 10);

  if (!restaurantId || !totalTables || totalTables < 1) {
    M.toast({ html: "Enter a valid number of tables" });
    return;
  }

  try {
    await apiRequest(`/admin/restaurants/${restaurantId}/tables`, "POST", {
      totalTables
    });

    M.toast({ html: "Tables set successfully" });

    const modal = M.Modal.getInstance(tablesModalElement);
    if (modal) {
      modal.close();
    }

    if (document.getElementById("restaurantsTable")) {
      loadRestaurants();
    }
  } catch (error) {
    M.toast({ html: error.message });
  }
}

function escapeQuotes(text) {
  return String(text).replace(/'/g, "\\'");
}