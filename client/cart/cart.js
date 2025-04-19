// Get token from cookie
const token = document.cookie
  .split("; ")
  .find((row) => row.startsWith("token="));
const Token = token ? token.split("=")[1] : "";

// Get cart information from server
async function fetchCart() {
  if (!Token) {
    console.error("Token not found, please log in.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:3010/api/cart`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Token}`,
      },
    });

    console.log("Response:", response);

    if (!response.ok) {
      throw new Error("Unable to fetch cart information");
    }
    const cartData = await response.json();
    console.log("Cart Data:", cartData);

    return cartData;
  } catch (error) {
    console.error("Error fetching cart:", error);
  }
}

async function fetchProducts(productIds) {
  try {
    const response = await fetch(
      `http://localhost:3010/api/product?ids=${productIds.join(",")}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Unable to fetch product information");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return null;
  }
}

async function loadCartAndProducts() {
  const cartData = await fetchCart();

  // Get all product_id from cartData
  const productIds = cartData.map((item) => item.product_id);

  if (productIds.length >= 0) {
    // Call fetchProducts with the list of productIds
    const productData = await fetchProducts(productIds);
    renderCart(cartData, productData);
  } else {
    console.error("Cart is empty or has no products.");
  }
}

loadCartAndProducts();

// Display cart
function renderCart(cartData, productData) {
  const cartItemsContainer = document.querySelector(".cart-items");
  cartItemsContainer.innerHTML = "";

  if (Array.isArray(cartData)) {
    let total = 0;

    cartData.forEach((item) => {
      // Find product in `productData` array based on `product_id`
      const product = productData.find((p) => p.id === item.product_id);
      if (product) {
        if (product.active === 1) {
          const itemElement = createCartItemElement(item, product);
          cartItemsContainer.appendChild(itemElement);

          total += item.total_money;
        } else {
          removeItem(item.id);
        }
      } else {
        console.warn(`Product not found with ID: ${item.product_id}`);
      }
    });

    // Calculate total amount
    updateCartTotal(total);
  } else {
    console.error("Invalid cart data.");
  }
}

// Create HTML element for each product in the cart
function createCartItemElement(item, product) {
  const itemElement = document.createElement("div");
  itemElement.classList.add("cart-item");

  const productImage = document.createElement("img");
  productImage.src = `http://localhost:3010/${product.image}`; // Get image path

  itemElement.innerHTML = `
        <img src="${productImage.src}" alt="${
    product.name
  }" class="product-image">
        <div class="item-details">
            <h3 class="product-name">${product.name}</h3>
            <div class="quantity-controls">
                <button class="decrease-quantity" data-id="${
                  item.id
                }">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="increase-quantity" data-id="${
                  item.id
                }">+</button>
            </div>
            <p class="product-price">${formatCurrency(item.total_money)}</p>
            <button class="remove-item" data-id="${item.id}">Remove</button>
        </div>
    `;

  // Add event for increase quantity button
  itemElement
    .querySelector(".increase-quantity")
    .addEventListener("click", () => {
      updateCartItemQuantity(item.id, item.quantity + 1);
    });

  // Add event for decrease quantity button
  itemElement
    .querySelector(".decrease-quantity")
    .addEventListener("click", () => {
      if (item.quantity > 1) {
        updateCartItemQuantity(item.id, item.quantity - 1);
      }
    });

  return itemElement;
}

async function updateCartItemQuantity(cartId, newQuantity) {
  try {
    const response = await fetch(`http://localhost:3010/api/cart/${cartId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Token}`,
      },
      body: JSON.stringify({ quantity: newQuantity }),
    });

    if (!response.ok) {
      throw new Error("Failed to update cart item");
    }

    const updatedCartItem = await response.json();

    loadCartAndProducts(); // Update cart
  } catch (error) {
    console.error("Error updating cart item:", error);
    alert("Unable to update product quantity.");
  }
}

// Update total cart value
function updateCartTotal(total) {
  const totalElement = document.querySelector(".cart-total");
  if (totalElement) {
    totalElement.textContent = formatCurrency(total); // Or format as you want
  } else {
    console.error("Total element not found in the interface.");
  }
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

// Handle remove product event
async function removeItem(id) {
  try {
    const response = await fetch(`http://localhost:3010/api/cart/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Token}`,
      },
    });
    console.log(response);
    if (!response.ok) {
      throw new Error("Unable to remove product");
    } else {
      loadCartAndProducts(); // Update cart
    }
  } catch (error) {
    console.error("Error removing product:", error);
  }
}

// Add event for buttons in the cart
document.querySelector(".cart-items").addEventListener("click", (event) => {
  const target = event.target;
  const cartId = target.dataset.id;

  if (target.classList.contains("remove-item")) {
    removeItem(cartId);
  }
});

// Handle payment API call
// async function handlePayment(orderId) {
//   try {
//     const response = await fetch("http://localhost:3010/api/order/payment", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${Token}`,
//       },
//       body: JSON.stringify({
//         order_id: orderId,
//         platform: "web",
//       }), // Send order_id to API
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Payment failed");
//     }

//     const responseData = await response.json();
//     // Handle API response (e.g., payment link from ZaloPay)
//     if (responseData.payment_link) {
//       window.location.href = responseData.payment_link; // Redirect to payment link
//     } else {
//       alert("Payment successful!"); // Or handle as required
//     }
//   } catch (error) {
//     console.error("Payment error:", error.message);
//     alert("Payment failed: " + error.message);
//   }
// }

async function createOrder() {
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  const isZaloPay = document.getElementById("zalopay").checked; // Check if ZaloPay is selected

  if (!phone || !address) {
    alert("Please enter both phone number and address.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:3010/api/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Token}`,
      },
      body: JSON.stringify({
        phone_number: phone,
        address: address,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json(); // Assume API returns JSON with error info, including product_id

      // If there is a stock quantity error, continue to fetch product info by product_id
      if (errorData.message && errorData.message.includes("Not enough stock")) {
        const productId = errorData.message.match(/\d+/)[0]; // Extract product_id from message (number format)

        // Call API to get product info based on product_id
        const productResponse = await fetch(
          `http://localhost:3010/api/product/${productId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Token}`,
            },
          }
        );

        if (productResponse.ok) {
          const productData = await productResponse.json();
          console.log(productData);
          alert(
            `You have ordered more than the stock quantity of the product: ${productData.name}`
          );
        } else {
          alert("Error fetching product information");
        }
      } else {
        alert("Unknown error. Unable to create order.");
      }

      throw new Error("Unable to create order");
    }

    const orderData = await response.json(); // Receive order data, including order ID
    console.log(orderData.order_id);

    if (isZaloPay) {
      // Handle ZaloPay payment
      handlePayment(orderData.order_id); // Pass order ID to handlePayment function
    } else {
      alert("Order placed successfully!");
      window.location.href = "/client/order/order.html";
    }
  } catch (error) {
    console.log("Error creating order", error);
  }
}

// Attach event to order button
document.addEventListener("DOMContentLoaded", () => {
  const orderButton = document.getElementById("order-button");

  // Attach click event to "Place Order" button
  orderButton.addEventListener("click", () => {
    createOrder();
  });

  fetchCart();
});

// document.querySelector('.create-order').addEventListener('click', (event) => {
//     // Prevent default <a> tag behavior
//     event.preventDefault();
//     createOrder();
// })

// // Initialize cart when page loads
// document.addEventListener('DOMContentLoaded', fetchCart);
