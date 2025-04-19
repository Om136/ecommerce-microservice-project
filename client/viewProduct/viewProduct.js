// Get ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id"); // Example URL is ?id=123 then get id = 123

// Function to call API and display category details
async function fetchCategoryDetails(categoryId) {
  try {
    const response = await fetch(
      `http://localhost:3010/api/category/category/${categoryId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch category");
    }
    const category = await response.json();
    console.log(category);

    // Update HTML content with data from API
    document.querySelector(
      ".product-category"
    ).textContent = `Category: ${category.name}`;
  } catch (error) {
    console.error("Error fetching category details:", error);
    // Display error message (if any)
  }
}

// Function to call API and display product details
async function fetchProductDetails() {
  try {
    const response = await fetch(
      `http://localhost:3010/api/product/${productId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch product");
    }
    const product = await response.json();
    console.log(product);

    // Update HTML content with data from API
    document.querySelector(".product-name").textContent = `${product.name}`;
    document.querySelector(
      ".product-price"
    ).textContent = `Price: ${product.price.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    })}`;
    document.querySelector(
      ".product-description"
    ).textContent = `Description: ${product.description}`;
    document.querySelector(
      ".product-quantity"
    ).textContent = `Quantity in stock: ${product.quantity}`;

    // Call function to get category details
    fetchCategoryDetails(product.category_id).then((category) => {
      if (category) {
        document.querySelector(
          ".product-category"
        ).textContent = `Category: ${category.name}`;
      }
    });

    // Update image if available
    const productImage = document.querySelector(".product-image");
    productImage.src = `http://localhost:3010/${product.image}`;
    productImage.alt = product.name;

    // Add event listeners for quantity increment/decrement and Add to Cart button
    const quantityInput = document.querySelector(".quantity-input");
    const decrementButton = document.querySelector(".quantity-decrement");
    const incrementButton = document.querySelector(".quantity-increment");
    const addToCartButton = document.querySelector(".add-to-cart");

    decrementButton.addEventListener("click", () => {
      const currentValue = parseInt(quantityInput.value);
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
      }
    });

    incrementButton.addEventListener("click", () => {
      const currentValue = parseInt(quantityInput.value);
      quantityInput.value = currentValue + 1;
    });

    addToCartButton.addEventListener("click", () => {
      const quantity = parseInt(quantityInput.value, 10);

      if (isNaN(quantity) || quantity <= 0) {
        alert("Please enter a valid quantity.");
        return;
      }

      createCart(product.id, quantity);
    });

    // Call function to fetch and display related products
    fetchRelatedProducts(product.category_id);
  } catch (error) {
    console.error("Error fetching product details:", error);
  }
}

// Function to call API to get related products
async function fetchRelatedProducts(categoryId) {
  try {
    const response = await fetch(
      `http://localhost:3010/api/product/category?category_id=${categoryId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch related products");
    }
    const products = await response.json();
    renderRelatedProducts(products);
  } catch (error) {
    console.error("Error fetching related products:", error);
  }
}

// Function to display related products
function renderRelatedProducts(products) {
  const relatedProductsList = document.querySelector(".related-products-list");
  relatedProductsList.innerHTML = "";
  let currentIndex = 0;
  const productsPerView = 5; // Number of products displayed each time

  products.forEach((product) => {
    if (product.id == productId) return;
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
            <a href="viewProduct.html?id=${product.id}" class="d-block">
                <img src="http://localhost:3010/${
                  product.image
                }" class="card-img-top" alt="${product.name}">
            </a>
            <div class="card-body">
                <a href="viewProduct.html?id=${
                  product.id
                }"><h6 class="card-title">${product.name}</h6></a>
                <p class="card-text text-danger fw-bold">${product.price.toLocaleString(
                  "en-IN",
                  { style: "currency", currency: "INR" }
                )}</p>
            </div>
        `;
    relatedProductsList.appendChild(card);
  });

  const updateSlider = () => {
    const firstCard = relatedProductsList.querySelector(".card");
    if (!firstCard) {
      console.error("No cards found in the related products list.");
      return;
    }

    let cardWidth =
      firstCard.offsetWidth + parseInt(getComputedStyle(firstCard).marginRight);
    const translateX = -currentIndex * cardWidth;
    relatedProductsList.style.transform = `translateX(${translateX}px)`;
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex >= products.length - productsPerView;
  };

  const prevButton = document.querySelector(".prev-related-products");
  const nextButton = document.querySelector(".next-related-products");

  prevButton.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateSlider();
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentIndex < products.length - productsPerView) {
      currentIndex++;
      updateSlider();
    }
  });

  updateSlider();
  window.addEventListener("resize", updateSlider);
}

// Get token from cookie
const token = document.cookie
  .split("; ")
  .find((row) => row.startsWith("token="));
const Token = token ? token.split("=")[1] : "";

async function createCart(product_id, quantity) {
  const data = {
    product_id: product_id,
    quantity: quantity,
  };

  try {
    const response = await fetch("http://localhost:3010/api/cart", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Token}`,
      },
    });

    if (response.ok) {
      const cart = await response.json();
      alert("Added to cart");
    } else {
      const errorData = await response.json();
      alert(`Please log in to add to cart!`);
    }
  } catch (error) {
    console.log("Error adding to cart", error);
    alert("An error occurred while adding to cart");
  }
}

// Call function to get product details when the page is loaded
if (productId) {
  fetchProductDetails();
} else {
  console.error("No product ID found in the URL");
}
