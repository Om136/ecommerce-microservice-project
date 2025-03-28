// Get token from cookie
const token = document.cookie
  .split("; ")
  .find((row) => row.startsWith("token="));
const Token = token ? token.split("=")[1] : "";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("user-info-form");

  // Get userId from localStorage
  const userId = localStorage.getItem("userId");

  // Send request to get user information
  fetch(`http://localhost:3000/api/user/getUser/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      // Assume data returned is an array and get the first element
      const user = data[0];

      // Fill in the form fields with user information
      document.getElementById("username").value = user.username; // Username
      document.getElementById("role").value = user.role; // Role
      document.getElementById("email").value = user.email; // Email
      document.getElementById("birthday").value = user.birthday.split("T")[0]; // Birthday (Only take the date part)
    })
    .catch((error) => {
      console.error("Error fetching user:", error);
    });

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent the default form action

    const email = document.getElementById("email").value;
    const birthday = document.getElementById("birthday").value;

    // Send request to update user information
    fetch(`http://localhost:3000/api/user/update/${userId}`, {
      // Update API endpoint
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Token}`,
      },
      body: JSON.stringify({ email, birthday }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        alert(data.message); // Display success message
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        alert("An error occurred while updating the information.");
      });
  });
});
