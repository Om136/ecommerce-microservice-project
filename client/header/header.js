function initializeHeader() {
  // Function to delete a cookie by name
  function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  // Function to check if a token exists
  function getToken() {
    const cookieString = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="));
    return cookieString ? cookieString.split("=")[1] : null;
  }

  // Function to handle logout
  function handleLogout() {
    deleteCookie("token");
    updateAuthLink();
  }

  // Function to update the auth link based on token presence
  function updateAuthLink() {
    const authLink = document.getElementById("auth-link");
    if (!authLink) {
      console.error("Element with ID 'auth-link' not found in DOM.");
      return;
    }

    const token = getToken();
    if (token) {
      authLink.textContent = "Logout";
      authLink.href = "../login/login.html";
      authLink.addEventListener("click", function () {
        handleLogout();
      });
    } else {
      authLink.textContent = "Login";
      authLink.href = "../login/login.html";
      authLink.removeEventListener("click", handleLogout);
    }
  }

  // Call the function to update the link
  updateAuthLink();
}

// Ensure the function runs after header.html is loaded into the DOM
document.addEventListener("DOMContentLoaded", initializeHeader);
