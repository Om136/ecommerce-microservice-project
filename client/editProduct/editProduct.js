// Get id from URL
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

// Check if id exists
if (id) {
  // Call API to get product information
  fetch(`http://localhost:3010/api/product/${id}`)
    .then((response) => response.json())
    .then((data) => {
      // Update product information in the form
      document.getElementById("productName").value = data.name;
      document.getElementById("productPrice").value = data.price;
      document.getElementById("productQuantity").value = data.quantity;
      document.getElementById("productDescription").value = data.description;
      document.getElementById("productCategory").value = data.category_id;

      // Display image from the path
      const productImageInput = document.getElementById("productImage");
      productImageInput.value = "";
      const imagePreview = document.createElement("img");
      imagePreview.src = `../../product-service/${data.image}`;
      imagePreview.style.width = "100px";
      imagePreview.style.height = "100px";
      productImageInput.parentNode.appendChild(imagePreview);

      console.log(data.image);

      // If there is an image, add it to the image input
      if (data.image) {
        const reader = new FileReader();
        reader.onload = () => {
          const imageData = reader.result;
          productImageInput.value = imageData;
        };
        reader.readAsDataURL(data.image);
      }
    })
    .catch((error) =>
      console.error("Error fetching product information:", error)
    );
} else {
  console.error("No id found in URL");
}

document
  .getElementById("addProductForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent traditional form submission

    // Get data from the form
    const productName = document.getElementById("productName").value;
    const productPrice = document.getElementById("productPrice").value;
    const productImage = document.getElementById("productImage").files[0];
    const productQuantity = document.getElementById("productQuantity").value;
    const productDescription =
      document.getElementById("productDescription").value;
    const productCategory = document.getElementById("productCategory").value;

    // Create FormData object to send both text and file data
    const formData = new FormData();
    formData.append("name", productName);
    formData.append("price", productPrice);
    formData.append("quantity", productQuantity);
    formData.append("description", productDescription);
    formData.append("category_id", productCategory);

    console.log(productImage);

    // Only add the image field if there is an image
    if (productImage) {
      formData.append("image", productImage); // Image file
    }

    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    // Get token from cookie
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="));
    const Token = token ? token.split("=")[1] : "";

    try {
      // Send PATCH request to API
      const response = await fetch(`http://localhost:3010/api/product/${id}`, {
        method: "PUT",
        body: formData, // Send FormData
        headers: {
          Authorization: `Bearer ${Token}`, // Use token from cookie
        },
      });

      if (response.ok) {
        const result = await response.json();
        alert("Product updated successfully");
        window.location.href = "../product/product.html";
        // Handle navigation or UI update if needed
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("An error occurred while updating the product");
    }
  });
