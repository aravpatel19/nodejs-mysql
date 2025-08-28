// DOM elements
const tableBody = document.querySelector("#data-table tbody");
const addUserForm = document.getElementById("add-user-form");

// Function to fetch and display users
async function fetchAndDisplayUsers() {
  try {
    const response = await fetch("/users"); // Fetch the data from the server
    const data = await response.json(); // Await the JSON parsing

    // Clear existing table content
    tableBody.innerHTML = "";

    data.forEach((row) => {
      const tableRow = document.createElement("tr");
      tableRow.innerHTML = `
            <td>${row.id}</td>
            <td>${row.name}</td>
            <td>${row.email}</td>
            <td>
                <button class="delete-btn" onclick="deleteUser(${row.id})">Delete</button>
            </td>
        `;
      tableBody.appendChild(tableRow);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    showMessage("Error fetching users", "error");
  }
}

// Function to add a new user
async function addUser(name, email) {
  try {
    const response = await fetch("/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email }),
    });

    const result = await response.json();

    if (response.ok) {
      showMessage("User added successfully!", "success");
      addUserForm.reset(); // Clear the form
      fetchAndDisplayUsers(); // Refresh the table
    } else {
      showMessage(result.error || "Failed to add user", "error");
    }
  } catch (error) {
    console.error("Error adding user:", error);
    showMessage("Error adding user", "error");
  }
}

// Function to delete a user
async function deleteUser(userId) {
  if (!confirm("Are you sure you want to delete this user?")) {
    return;
  }

  try {
    const response = await fetch(`/users/${userId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (response.ok) {
      showMessage("User deleted successfully!", "success");
      fetchAndDisplayUsers(); // Refresh the table
    } else {
      showMessage(result.error || "Failed to delete user", "error");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    showMessage("Error deleting user", "error");
  }
}

// Function to show messages to the user
function showMessage(message, type) {
  // Remove existing message if any
  const existingMessage = document.querySelector(".message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create new message element
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;

  // Insert message at the top of the page
  const logo = document.querySelector(".logo");
  logo.insertAdjacentElement("afterend", messageDiv);

  // Remove message after 3 seconds
  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}

// Event listener for form submission
addUserForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  if (name && email) {
    addUser(name, email);
  } else {
    showMessage("Please fill in all fields", "error");
  }
});

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  fetchAndDisplayUsers();
});
