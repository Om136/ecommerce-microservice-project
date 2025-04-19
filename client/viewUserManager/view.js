document.addEventListener("DOMContentLoaded", function () {
  let products = []; // Array to store all products
  const itemsPerPage = 5; // Number of products displayed per page
  let currentPage = 1; // Current page
  let isLoading = true; // Loading state
  let selectedProductId = null; // ID of the selected product
  const deleteButton = document.getElementById("deleteButton");
  const productTableBody = document.getElementById("productTableBody");
  const paginationContainer = document.getElementById("pagination");

  if (!deleteButton || !productTableBody || !paginationContainer) {
    console.error("One or more important DOM elements do not exist");
    return;
  }

  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    .split("=")[1];

  function fetchProducts() {
    fetch("http://localhost:3010/api/user/allUser", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        products = data;
        isLoading = false;
        renderTable();
        renderPagination();
      })
      .catch((error) => {
        console.error("Error calling API:", error);
        isLoading = false;
        renderTable();
      });
  }

  function renderTable() {
    productTableBody.innerHTML = "";

    if (isLoading) {
      productTableBody.innerHTML =
        '<tr><td colspan="6">Loading data...</td></tr>';
      return;
    }

    if (products.length === 0) {
      productTableBody.innerHTML =
        '<tr><td colspan="6">No products available.</td></tr>';
      return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const productsToShow = products.slice(start, end);

    productsToShow.forEach((user) => {
      const row = document.createElement("tr");
      const formattedBirthday = user.birthday
        ? new Date(user.birthday).toLocaleDateString("en-GB")
        : "Unknown";
      row.innerHTML = `
            <td class="select-product">
                <input type="radio" name="selectProduct" class="select-item" value="${
                  user.id
                }">
            </td>
            <td>${user.username || "Unknown"}</td>
            <td>${user.role || "Unknown"}</td>
            <td>${user.email || "Unknown"}</td>
            <td>${formattedBirthday}</td>
            `;
      productTableBody.appendChild(row);
    });

    const radioButtons = document.querySelectorAll(".select-item");
    radioButtons.forEach((radio) => {
      radio.addEventListener("change", function () {
        selectedProductId = this.value;
        deleteButton.disabled = false;
      });
    });
  }

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

  function updateActivePagination() {
    const pageButtons = document.querySelectorAll(".page-btn");
    pageButtons.forEach((button, index) => {
      button.classList.remove("active");
      if (index + 1 === currentPage) {
        button.classList.add("active");
      }
    });
  }

  function deleteProduct(id) {
    fetch(`http://localhost:3010/api/user/delete/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        alert("User deleted successfully");
        fetchProducts();
      })
      .catch((error) => {
        console.error("Error deleting product:", error);
      });
  }

  deleteButton.addEventListener("click", function () {
    if (selectedProductId) {
      deleteProduct(selectedProductId);
    }
  });

  fetchProducts();
});
