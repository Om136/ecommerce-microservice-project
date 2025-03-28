// Function to get the value of a cookie by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

// Check token when the page loads
window.onload = function () {
  const token = getCookie("token"); // Get the cookie named 'token'

  if (!token) {
    // Redirect to the login page if there is no token
    window.location.href = "../login/login.html";
  }
};
