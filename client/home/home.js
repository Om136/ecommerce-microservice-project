import { API_URL } from "../config.js";

document.getElementById("reset-sort").addEventListener("click", function () {
  console.log("Reset sort");
  location.reload(true);
});

// Global variable to store the product list
let productList = [];
let currentPage = 1; // Current page
const productsPerPage = 12; // Number of products per page

// Call fetchProducts function when the page loads
window.onload = function () {
  console.log("Window onload event fired"); // Add this log
  fetchProducts();
};

// Function to fetch product data from API
function fetchProducts() {
  console.log("Fetching products from API..."); // Add this log
  fetch(`${API_URL}/api/product`, {
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(
            `Network response was not ok: ${response.status} - ${text}`
          );
        });
      }
      return response.json();
    })
    .then((data) => {
      productList = data; // Save all products to the array
      renderProducts(productList); // Display initial products
      setupPagination(productList);
    })
    .catch((error) => {
      console.error("Error calling API:", error);
    });
}

// Function to render products
function renderProducts(products) {
  const productsContainer = document.querySelector(".products-container");
  productsContainer.innerHTML = ""; // Clear current content

  // Calculate start and end index of products on the current page
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  currentProducts.forEach((product) => {
    if (product.active === 1) {
      // Create a new column for each product
      const productCol = document.createElement("div");
      productCol.className = "col-md-3 col-sm-6 col-6 mb-3";

      const productItem = document.createElement("div");
      productItem.classList.add("product-item");

      const productImage = document.createElement("img");
      productImage.src = `${API_URL}/${product.image}`;
      productImage.alt = product.name;

      const productName = document.createElement("div");
      productName.classList.add("product-name");
      productName.textContent = product.name;

      const productPrice = document.createElement("div");
      productPrice.classList.add("product-price");
      productPrice.textContent = `${product.price.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
      })}`;

      // Add click event to redirect
      productItem.addEventListener("click", function () {
        window.location.href = `../viewProduct/viewProduct.html?id=${product.id}`;
      });

      productItem.appendChild(productImage);
      productItem.appendChild(productName);
      productItem.appendChild(productPrice);

      // Add productItem to the column
      productCol.appendChild(productItem);

      // Add column to productsContainer
      productsContainer.appendChild(productCol);
    }
  });
}

// Function to setup pagination
function setupPagination(products) {
  const totalPages = Math.ceil(products.length / productsPerPage);
  const paginationUl = document.getElementById("pagination");
  paginationUl.innerHTML = ""; // Clear old pagination buttons

  // Create "Previous" button
  const previousLi = document.createElement("li");
  previousLi.classList.add("page-item");
  const previousLink = document.createElement("a");
  previousLink.classList.add("page-link");
  previousLink.href = "#";
  previousLink.textContent = "Previous";
  previousLink.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderProducts(products);
      updateActivePageButton();
    }
  });
  previousLi.appendChild(previousLink);
  paginationUl.appendChild(previousLi);

  // Create page number buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageLi = document.createElement("li");
    pageLi.classList.add("page-item");
    const pageLink = document.createElement("a");
    pageLink.classList.add("page-link");
    pageLink.href = "#";
    pageLink.textContent = i;
    pageLink.addEventListener("click", () => {
      currentPage = i;
      renderProducts(products);
      updateActivePageButton();
    });
    pageLi.appendChild(pageLink);
    paginationUl.appendChild(pageLi);
  }

  // Create "Next" button
  const nextLi = document.createElement("li");
  nextLi.classList.add("page-item");
  const nextLink = document.createElement("a");
  nextLink.classList.add("page-link");
  nextLink.href = "#";
  nextLink.textContent = "Next";
  nextLink.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderProducts(products);
      updateActivePageButton();
    }
  });
  nextLi.appendChild(nextLink);
  paginationUl.appendChild(nextLi);

  updateActivePageButton();
}

// Function to update the current page button
function updateActivePageButton() {
  const pageItems = document.querySelectorAll(".pagination .page-item");
  pageItems.forEach((item, index) => {
    const pageNum = index;
    if (pageNum === currentPage) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
  // Disable "Previous" button on the first page
  const previousLi = document.querySelector(
    ".pagination .page-item:first-child"
  );
  if (currentPage === 1) {
    previousLi.classList.add("disabled");
  } else {
    previousLi.classList.remove("disabled");
  }
  // Disable "Next" button on the last page
  const nextLi = document.querySelector(".pagination .page-item:last-child");
  if (currentPage === Math.ceil(productList.length / productsPerPage)) {
    nextLi.classList.add("disabled");
  } else {
    nextLi.classList.remove("disabled");
  }
}

// Add click event to .category-card elements
document.querySelectorAll(".category-card").forEach((card) => {
  card.addEventListener("click", function () {
    const categoryId = card.getAttribute("data-category-id"); // Get category ID

    // Call API to get products by category
    fetch(`${API_URL}/api/category/${categoryId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        productList = data; // Update product list
        renderProducts(productList); // Display products by category
        currentPage = 1;
        setupPagination(productList);
      })
      .catch((error) => {
        console.error("Error calling API:", error);
      });
  });
});

// Function to search products
function searchProducts(term) {
  console.log("Sending search term to API:", term); // Log the search term
  fetch(`${API_URL}/api/product/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ term }),
  })
    .then((response) => {
      if (!response.ok) {
        alert("No products found");
        fetchProducts();
      }
      return response.json();
    })
    .then((data) => {
      productList = data; // Update product list
      renderProducts(productList); // Display found products
      currentPage = 1;
      setupPagination(productList);
    })
    .catch((error) => {
      console.error("Error calling search API:", error);
    });
}

// Get input and search button elements
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

// Add click event to search button
searchButton.addEventListener("click", function () {
  const searchTerm = searchInput.value.trim(); // Get value from input and trim whitespace
  if (searchTerm) {
    // Check if search term is not empty
    searchProducts(searchTerm); // Call search function with search term
  } else {
    console.log("Please enter a search term.");
  }
});

function sortProducts(order) {
  console.log("Sorting products:", order);
  const sortedProducts = [...productList].sort((a, b) => {
    if (order === "highToLow") {
      return b.price - a.price;
    } else {
      return a.price - b.price;
    }
  });
  renderProducts(sortedProducts);
  currentPage = 1;
  setupPagination(sortedProducts);
}

function setSelectedButton(button) {
  document
    .querySelectorAll(".sort-high-to-low, .sort-low-to-high")
    .forEach((btn) => {
      btn.classList.remove("selected-button");
    });
  button.classList.add("selected-button");
}

document
  .getElementById("sort-high-to-low")
  .addEventListener("click", function () {
    sortProducts("highToLow");
    setSelectedButton(this);
  });

document
  .getElementById("sort-low-to-high")
  .addEventListener("click", function () {
    sortProducts("lowToHigh");
    setSelectedButton(this);
  });

// Get select box element
const filterPriceSelect = document.getElementById("filter-price");

// Add change event to select box
filterPriceSelect.addEventListener("change", function () {
  const selectedValue = this.value;
  currentPage = 1; // Reset to page 1 when filtering
  if (selectedValue === "") {
    renderProducts(productList);
    setupPagination(productList);
  } else if (selectedValue.includes("-")) {
    const [minPrice, maxPrice] = selectedValue.split("-").map(Number);
    filterProductsByPrice(minPrice, maxPrice);
  } else {
    const minPrice = Number(selectedValue);
    filterProductsByPrice(minPrice, Infinity);
  }
});

// Function to filter products by price
function filterProductsByPrice(minPrice, maxPrice) {
  const filteredProducts = productList.filter((product) => {
    return (
      product.price >= minPrice &&
      (maxPrice === null || product.price <= maxPrice)
    );
  });
  renderProducts(filteredProducts);
  setupPagination(filteredProducts);
}
