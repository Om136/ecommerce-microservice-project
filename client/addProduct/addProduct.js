document
  .getElementById("addProductForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent traditional form submission

    // Get data from form
    const productName = document.getElementById("productName").value;
    const productPrice = document.getElementById("productPrice").value;
    const productImage = document.getElementById("productImage").files[0]; // File data
    const productQuantity = document.getElementById("productQuantity").value;
    const productDescription =
      document.getElementById("productDescription").value;
    const productCategory = document.getElementById("productCategory").value;

    // Create FormData object to send both text and file data
    const formData = new FormData();
    formData.append("name", productName);
    formData.append("price", productPrice);
    formData.append("image", productImage); // Image file
    formData.append("quantity", productQuantity);
    formData.append("description", productDescription);
    formData.append("category_id", productCategory);

    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    // Get token from cookie
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="));
    const Token = token ? token.split("=")[1] : "";

    try {
      // Send POST request to API
      const response = await fetch("http://localhost:3010/api/product", {
        method: "POST",
        body: formData, // Send FormData
        headers: {
          Authorization: `Bearer ${Token}`, // Use token from cookie
        },
      });

      if (response.ok) {
        const result = await response.json();
        alert("Product added successfully");
        window.location.href = "../product/product.html";
        // Handle navigation or UI update if needed
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("An error occurred while adding the product");
    }
  });
