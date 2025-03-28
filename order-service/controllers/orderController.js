const { json } = require("express");
const orderModel = require("../models/orderModel");
const axios = require("axios");
const CryptoJS = require("crypto-js");

exports.createOrder = async (req, res) => {
  const user_id = req.userId;
  const { phone_number, address } = req.body;
  const status = "pending";

  try {
    // Get cart from Cart Service
    const cartResponse = await axios.get(`http://localhost:3004/api/cart`, {
      headers: { Authorization: req.headers.authorization }, // Forward token from client
    });
    const cartItems = cartResponse.data;

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Check stock for each product from Product Service
    for (const item of cartItems) {
      const productResponse = await axios.get(
        `http://localhost:3003/api/product/${item.product_id}`
      );
      const product = productResponse.data;

      if (product.quantity < item.quantity) {
        return res
          .status(400)
          .json({
            message: `Not enough stock for product ID ${item.product_id}`,
          });
      }
    }

    // Update stock
    for (const item of cartItems) {
      await axios.put(
        `http://localhost:3003/api/product/quantity/${item.product_id}`,
        {
          quantity: -item.quantity, // Subtract quantity from stock
        },
        {
          headers: { Authorization: req.headers.authorization }, // Forward token from client
        }
      );
    }

    // Calculate total amount
    const total_amount = cartItems.reduce(
      (sum, item) => sum + item.total_money,
      0
    );

    // Create order
    orderModel.createOrder(
      user_id,
      total_amount,
      status,
      phone_number,
      address,
      async (err, orderResult) => {
        if (err)
          return res.status(500).json({ message: "Error creating order" });

        const order_id = orderResult.insertId; // Get ID of the newly created order

        try {
          for (const item of cartItems) {
            await new Promise((resolve, reject) => {
              orderModel.addOrderItems(
                order_id,
                item.product_id,
                item.quantity,
                item.total_money,
                (err) => {
                  if (err) {
                    console.error(
                      `Failed to add item: ${item.product_id}`,
                      err
                    );
                    return reject(err);
                  }
                  resolve();
                }
              );
            });
          }

          // Clear cart
          await axios.delete(`http://localhost:3004/api/cart/clear`, {
            headers: { Authorization: req.headers.authorization },
          });
          console.log("Cart cleared successfully");
          res
            .status(201)
            .json({ message: "Order created successfully", order_id });
        } catch (error) {
          console.error("Error processing order:", error);
          res.status(500).json({ message: "Error processing order" });
        }
      }
    );
  } catch (error) {
    console.error("Error create order:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Internal server error",
    });
  }
};

exports.getUserOrders = async (req, res) => {
  const user_id = req.userId;

  try {
    // Get list of orders by user_id
    orderModel.getOrdersByUserId(user_id, async (err, orders) => {
      if (err)
        return res.status(500).json({ message: "Error fetching orders" });

      // Check if user exists via User Service
      const userResponse = await axios.get(
        `http://localhost:3002/api/user/getUser/${user_id}`,
        {
          headers: { Authorization: req.headers.authorization }, // Forward token from client
        }
      );

      if (userResponse.status !== 200) {
        return res.status(404).json({ message: "User not found" });
      }

      for (const item of orders) {
        item.username = userResponse.data[0].username;
      }

      res.status(200).json(orders);
    });
  } catch (error) {
    console.error(
      "Error getting user order:",
      error.response?.data || error.message
    );
    return res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Internal server error",
    });
  }
};

exports.getAllOrderItemsByOrderId = (req, res) => {
  const order_id = req.params.id;

  orderModel.getAllOrderItemsByOrderId(order_id, async (err, orderItems) => {
    if (err)
      return res.status(500).json({ message: "Error fetching order items" });
    if (orderItems.length === 0)
      return res.status(404).json({ message: "No order items found" });

    try {
      // Send sequential requests to product service
      for (const item of orderItems) {
        const productResponse = await axios.get(
          `http://localhost:3003/api/product/${item.product_id}`
        );
        item.product_name = productResponse.data
          ? productResponse.data.name
          : "Unknown";
      }

      res.status(200).json(orderItems);
    } catch (error) {
      console.error(
        "Error getting all order items:",
        error.response?.data || error.message
      );
      return res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || "Internal server error",
      });
    }
  });
};

exports.getOrderById = (req, res) => {
  const id = req.params.id;

  try {
    orderModel.getOrderById(id, async (err, order) => {
      if (err) return res.status(500).json({ message: "Cannot get order" });

      order = order[0];
      const user_id = order.user_id;

      // Check if user exists via User Service
      const userResponse = await axios.get(
        `http://localhost:3002/api/user/getUser/${user_id}`,
        {
          headers: { Authorization: req.headers.authorization }, // Forward token from client
        }
      );

      if (userResponse.status !== 200) {
        return res.status(404).json({ message: "User not found" });
      }

      order.username = userResponse.data
        ? userResponse.data[0].username
        : "Unknown";

      res.status(200).json(order);
    });
  } catch (error) {
    console.error(
      "Error getting order:",
      error.response?.data || error.message
    );
    return res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Internal server error",
    });
  }
};

exports.updateOrderStatus = (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  orderModel.updateOrderStatus(orderId, status, (err, result) => {
    if (err)
      return res.status(500).json({ message: "Error updating order status" });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order status updated successfully" });
  });
};

exports.getAllOrders = (req, res) => {
  orderModel.getAllOrders(async (err, orders) => {
    if (err) {
      console.error("Error fetching all orders:", err);
      return res.status(500).json({ message: "Error fetching orders" });
    }

    // Check if users exist via User Service
    const userResponse = await axios.get(
      `http://localhost:3002/api/user/allUser`,
      {
        headers: { Authorization: req.headers.authorization }, // Forward token from client
      }
    );

    if (userResponse.status !== 200) {
      return res.status(404).json({ message: "Users not found" });
    }

    const users = userResponse.data;

    const ordersWithUsernames = orders.map((order) => {
      // Find the user corresponding to the user_id of the order
      const user = users.find((u) => u.id === order.user_id);

      // Create a new object with all fields of the order and add the username field
      const orderWithUsername = {
        id: order.id,
        user_id: order.user_id,
        phone_number: order.phone_number,
        address: order.address,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at,
        username: user ? user.username : "Unknown",
      };

      return orderWithUsername;
    });

    res.status(200).json(ordersWithUsernames);
  });
};

exports.cancelOrder = (req, res) => {
  const order_id = req.params.order_id;
  console.log(order_id);
  // Check the status of the order before deleting
  orderModel.getOrderById(order_id, (err, orderResult) => {
    if (err) return res.status(500).json({ message: "Error fetching order" });
    if (!orderResult)
      return res.status(404).json({ message: "Order not found" });

    const order = orderResult[0];
    console.log(order.status);
    // Check the status of the order
    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending orders can be deleted" });
    }

    // If the status is pending, proceed to delete
    orderModel.cancelOrder(order_id, (err) => {
      if (err) return res.status(500).json({ message: "Error deleting order" });

      res.status(200).json({ message: "Order canceled successfully" });
    });
  });
};

// exports.payOrder = async (req, res) => {
//   const { order_id, platform } = req.body;

//   try {
//     orderModel.getOrderById(order_id, async (err, order) => {
//       if (err) return res.status(500).json({ message: "Cannot get order" });

//       order = order[0];

//       let redirect_url;
//       const appRedirectUrl = "mobile-app://"; // Replace with the URL scheme of the mobile app

//       if (platform === "web") {
//         redirect_url = `http://localhost:5500/client/order/order.html`;
//       } else if (platform === "android" || platform === "ios") {
//         redirect_url = `${appRedirectUrl}order/${order.id}`;
//       } else {
//         return res.status(400).json({ message: "Invalid platform" });
//       }

//       // Add redirect_url to embed_data
//       const embed_data = {
//         order_id: order.id,
//         redirecturl: redirect_url, // URL to return to web/app
//       };

//       // Payment logic (ZaloPay API)
//       const paymentResponse = await axios.post(
//         "http://localhost:3006/api/payment",
//         {
//           order_id: order.id,
//           amount: order.total_amount,
//           embed_data: JSON.stringify(embed_data),
//         }
//       );

//       return res.json({
//         message: "Payment initialized successfully",
//         payment_link: paymentResponse.data.order_url,
//         order,
//       });
//     });
//   } catch (error) {
//     console.error("Error in payment process:", error.message || error);
//     return res
//       .status(error.status || 500)
//       .json({ message: error.message || "Internal server error" });
//   }
// };

// const config = {
//   key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf", // Callback only needs key2
// };

// exports.payOrderCallback = async (req, res) => {
//   console.log("payOrderCallback called:", req.body);
//   try {
//     const dataStr = req.body.data;
//     console.log("dataStr:", dataStr);
//     const reqMac = req.body.mac;
//     const status = "paid";

//     const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

//     // Check if callback is valid
//     if (reqMac !== mac) {
//       return res.json({ return_code: -1, return_message: "mac not equal" });
//     }

//     const dataJson = JSON.parse(dataStr);
//     console.log("dataJson:", dataJson);
//     const { order_id } = JSON.parse(dataJson.embed_data);

//     // Update order status
//     orderModel.updateOrderStatus(order_id, status, (err, result) => {
//       if (err) {
//         console.error("Error updating order status:", err);
//         return res.json({
//           return_code: 0,
//           return_message: "Error updating order status",
//         });
//       }
//       if (result.affectedRows === 0) {
//         console.error("Order not found:", order_id);
//         return res.json({ return_code: 0, return_message: "Order not found" });
//       }
//       console.log(`Order ${order_id} status updated to paid`);
//       return res.json({ return_code: 1, return_message: "success" });
//     });
//   } catch (error) {
//     console.error("Error in payment callback:", error);
//     return res.json({ return_code: 0, return_message: error.message });
//   }
// };
