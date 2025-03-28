document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");

    errorMessage.textContent = "";

    const passwordRegex =
      /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{6,}$/;

    if (!passwordRegex.test(password)) {
      errorMessage.textContent =
        "Password must be at least 6 characters long and contain at least 1 special character.";
      return;
    }

    const payload = {
      username: username,
      password: password,
    };

    try {
      const response = await fetch("http://localhost:3000/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include", // Allow sending and receiving cookies
      });

      const data = await response.json();

      if (response.ok) {
        // Save token to cookie
        document.cookie = `token=${data.token}; path=/; SameSite=Lax; Secure; max-age=86400`;
        // max-age=86400 is the lifespan of the cookie (1 day)

        // Save user information to localStorage (if needed)
        localStorage.setItem("userId", data.id);
        localStorage.setItem("userRole", data.role);

        // Check cookie
        console.log("Cookies:", document.cookie);

        // Redirect
        if (data.role === 1) {
          window.location.href = "../product/product.html";
        } else {
          window.location.href = "../home/home.html";
        }
      } else {
        errorMessage.textContent =
          data.message || "An error occurred. Please try again.";
      }
    } catch (error) {
      console.error("Error:", error);
      errorMessage.textContent =
        "Failed to log in. Please check your connection and try again.";
    }
  });
