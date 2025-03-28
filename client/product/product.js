// product.js
document.addEventListener("DOMContentLoaded", function () {
  let products = []; // Array to store all products
  const itemsPerPage = 5; // Number of products displayed per page
  let currentPage = 1; // Current page
  let isLoading = true; // Loading state
  let selectedProductId = null; // ID of the selected product
  const deleteButton = document.getElementById("deleteButton");
  const productTableBody = document.getElementById("productTableBody");
  const paginationContainer = document.getElementById("pagination");

  // Check the existence of important DOM elements
  if (!deleteButton || !productTableBody || !paginationContainer) {
    console.error("One or more important DOM elements do not exist");
    return;
  }

  // Get token from cookie
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="));
  const Token = token ? token.split("=")[1] : "";

  // Function to map category ID to name
  function getCategoryName(categoryId) {
    switch (categoryId) {
      case 1:
        return "Pan";
      case 2:
        return "Pot";
      case 3:
        return "Vacuum Cleaner";
      case 4:
        return "Stove";
      case 5:
        return "Blender";
      default:
        return "Undefined";
    }
  }

  // Function to fetch product data from API
  function fetchProducts() {
    fetch("http://localhost:3000/api/product")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        products = data;
        isLoading = false;
        renderTable();
        renderPagination();
      })
      .catch((error) => {
        console.error("Error calling API:", error);
        isLoading = false;
        renderTable(); // Still render table to display error message
      });
  }

  // Function to render product table
  function renderTable() {
    productTableBody.innerHTML = "";

    if (isLoading) {
      productTableBody.innerHTML =
        '<tr><td colspan="7">Loading data...</td></tr>';
      return;
    }

    if (products.length === 0) {
      productTableBody.innerHTML =
        '<tr><td colspan="7">No products available.</td></tr>';
      return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const productsToShow = products.slice(start, end);

    productsToShow.forEach((product) => {
      if (product.active === 1) {
        const row = productTableBody.insertRow();
        const radioCell = row.insertCell();
        const editCell = row.insertCell();
        const nameCell = row.insertCell();
        const priceCell = row.insertCell();
        const categoryCell = row.insertCell();
        const quantityCell = row.insertCell();
        const descriptionCell = row.insertCell();

        radioCell.className = "select-product";
        editCell.className = "actions-btn";
        radioCell.innerHTML = `<input type="radio" name="selectProduct" class="select-item" value="${product.id}">`;
        editCell.innerHTML = `<a href="../editProduct/editProduct.html?id=${product.id}" class="edit-btn btn btn-primary btn-sm"><i class="fas fa-edit"></i></a>`;
        nameCell.textContent = product.name;
        priceCell.textContent = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(product.price);
        categoryCell.textContent = getCategoryName(product.category_id);
        quantityCell.textContent = product.quantity;
        descriptionCell.textContent = product.description;
      }
    });

    // Add event listener for radio buttons
    const radioButtons = document.querySelectorAll(".select-item");
    radioButtons.forEach((radio) => {
      radio.addEventListener("change", function () {
        if (this.checked) {
          // Deselect all other radio buttons
          radioButtons.forEach((otherRadio) => {
            if (otherRadio !== this) {
              otherRadio.checked = false;
            }
          });

          // Update selected product ID
          selectedProductId = this.value;
          console.log("Selected Product ID:", selectedProductId);
          deleteButton.disabled = false;
        } else {
          // If this radio button is deselected, disable the delete button
          selectedProductId = null;
          deleteButton.disabled = true;
        }
      });
    });
  }

  // Function to render pagination
  function renderPagination() {
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(products.length / itemsPerPage);

    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement("button");
      pageButton.textContent = i;
      pageButton.classList.add("page-btn", "btn", "btn-light");
      if (i === currentPage) {
        pageButton.classList.add("active");
      }
      pageButton.addEventListener("click", () => {
        currentPage = i;
        renderTable();
        updateActivePagination();
      });
      paginationContainer.appendChild(pageButton);
    }
  }

  // Function to update active state for pagination buttons
  function updateActivePagination() {
    const pageButtons = document.querySelectorAll(".page-btn");
    pageButtons.forEach((button, index) => {
      button.classList.remove("active");
      if (index + 1 === currentPage) {
        button.classList.add("active");
      }
    });
  }

  // Function to delete product
  function deleteProduct(id) {
    if (!id) {
      console.error("No product ID provided for deletion");
      alert("An error occurred: No product ID to delete.");
      return;
    }

    fetch(`http://localhost:3000/api/product/delete/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(
              `HTTP error! status: ${response.status}, message: ${text}`
            );
          });
        } else {
          fetchProducts();
        }
        return response.json();
      })
      .then((data) => {
        console.log("Successfully deleted:", data);
        products = products.filter((product) => product.id !== id);
        selectedProductId = null;
        deleteButton.disabled = true;
        renderTable();
        renderPagination();
        alert("Product has been successfully deleted.");
      })
      .catch((error) => {
        console.error("Error details:", error);
      });
  }

  // Event listener for delete button
  deleteButton.addEventListener("click", function () {
    if (selectedProductId) {
      if (confirm("Are you sure you want to delete this product?")) {
        deleteProduct(selectedProductId);
      }
    } else {
      alert("Please select a product to delete.");
    }
  });

  // Initialize initial data
  fetchProducts();
});
