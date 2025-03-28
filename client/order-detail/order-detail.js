// Get id from URL
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

document.addEventListener("DOMContentLoaded", function () {
  const orderId = window.location.pathname.split("/").pop(); // Get order ID from URL
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    .split("=")[1];

  const userRole = localStorage.getItem("userRole");

  function checkUserRole() {
    const statusSelect = document.getElementById("orderStatus");
    const updateStatusBtn = document.getElementById("updateStatusBtn");

    if (userRole !== "1") {
      // If userRole is not admin (not 1), hide select and update button
      statusSelect.style.display = "none";
      updateStatusBtn.style.display = "none";
    } else {
      // If admin (userRole = 1), show select and update button
      statusSelect.style.display = "inline-block";
      updateStatusBtn.style.display = "inline-block";
    }
  }

  // Check if there is an orderId
  if (!orderId) {
    console.error("Order ID not found in URL");
    return;
  }

  // Function to call API to get order details
  function fetchOrderDetails() {
    fetch(`http://localhost:3000/api/order/items/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to fetch product data from order");
        }
        return response.json();
      })
      .then((products) => {
        renderProductTable(products); // Display products in table
      })
      .catch((error) => {
        console.error("Error fetching product data:", error);
      });
  }

  // Function to render product data into table
  function renderProductTable(products) {
    const productTableBody = document.getElementById("productTableBody");
    productTableBody.innerHTML = ""; // Clear old content in table

    products.forEach((product) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td>${product.product_name}</td>
                <td>${product.quantity}</td>
                <td>${product.price.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                })}</td>
            `;
      productTableBody.appendChild(tr);
    });
  }

  function updateOrderStatus() {
    const selectedStatus = document.getElementById("orderStatus").value;

    fetch(`http://localhost:3000/api/order/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: selectedStatus }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to update order status");
        }
        return response.json();
      })
      .then((data) => {
        alert("Update successful"); // Show success message
        fetchOrderInfo(); // Refresh order info on page
        window.location.href = "../order/order.html";
      })
      .catch((error) => {
        console.error("Error updating order status:", error);
        alert("An error occurred while updating order status");
      });
  }

  // Attach event to update button
  document
    .getElementById("updateStatusBtn")
    .addEventListener("click", updateOrderStatus);

  function fetchOrderInfo() {
    fetch(`http://localhost:3000/api/order/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to fetch order info");
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          renderOrderInfo(data);
        } else {
          throw new Error("Order info not found");
        }
      })
      .catch((error) => {
        console.error("Error fetching order info:", error);
      });
  }

  function renderOrderInfo(orderData) {
    const orderDetailsContainer = document.getElementById(
      "order-details-container"
    );

    // Format the date
    const orderDate = new Date(orderData.created_at).toLocaleDateString(
      "vi-VN"
    );

    // Create the HTML content
    const orderInfoHTML = `
            <div class="order-info">
                <p><strong>Order ID:</strong> ${orderData.id}</p>
                <p><strong>Order Date:</strong> ${orderDate}</p>
                <p><strong>Customer:</strong> ${orderData.username}</p>
                <p><strong>Phone Number:</strong> ${orderData.phone_number}</p>
                <p><strong>Shipping Address:</strong> ${orderData.address}</p>
                <p><strong>Status:</strong> ${renderOrderStatus(
                  orderData.status
                )}</p>
                <p><strong>Total Amount:</strong> ${orderData.total_amount.toLocaleString(
                  "en-IN",
                  { style: "currency", currency: "INR" }
                )}</p>
            </div>
        `;

    // Set content for container
    orderDetailsContainer.innerHTML = orderInfoHTML;

    // Update status
    const statusSelect = document.getElementById("orderStatus");
    statusSelect.value = orderData.status;
  }

  // Function to handle order status
  function renderOrderStatus(status) {
    switch (
      status.toLowerCase() // Convert status to lowercase
    ) {
      case "pending":
        return "Pending";
      case "shipping":
        return "Shipping";
      case "paid":
        return "Paid";
      case "completed":
        return "Completed";
      case "canceled":
        return "Canceled";
      default:
        return "Unknown";
    }
  }

  // Call API to get order details when page loads
  fetchOrderDetails();
  fetchOrderInfo();

  checkUserRole();

  // Handle event when user clicks update status button
  document
    .getElementById("updateStatusBtn")
    .addEventListener("click", updateOrderStatus);
});
