document.addEventListener("DOMContentLoaded", () => {
  fetch("../footer/footer.html") // Path to the footer.html file
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error loading footer");
      }
      return response.text();
    })
    .then((data) => {
      // Insert footer content into container
      document.getElementById("footer-container").innerHTML = data;
    })
    .catch((error) => {
      console.error("Error loading footer:", error);
    });
});
