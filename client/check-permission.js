// nav.js
const checkAndDisplayProductLink = () => {
  const roleId = localStorage.getItem("userRole"); // Get roleId from localStorage

  // If roleId is '1', display the admin function tabs
  if (roleId === "1") {
    document.getElementById("product-link").style.display = "block";
    document.getElementById("statistical-link").style.display = "block";
    document.getElementById("userManager-link").style.display = "block";
    document.getElementById("home-link").style.display = "none";
    document.getElementById("cart-link").style.display = "none";
  } else {
    document.getElementById("product-link").style.display = "none";
    document.getElementById("statistical-link").style.display = "none";
    document.getElementById("userManager-link").style.display = "none";
  }
};
