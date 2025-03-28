const cartModel = require("../models/cartModel");
const axios = require("axios");

// Add to cart
exports.createCart = async (req, res) => {
  const user_id = req.userId;
  const { product_id, quantity } = req.body;

  if (!user_id || !product_id || !quantity) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
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

    // Check if product exists via Product Service
    const productResponse = await axios.get(
      `http://localhost:3003/api/product/${product_id}`
    );
    if (productResponse.status !== 200) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = productResponse.data;
    const total_money = product.price * quantity;

    cartModel.createCart(
      user_id,
      product_id,
      quantity,
      total_money,
      (err, result) => {
        if (err)
          return res.status(500).json({ message: "Error creating cart" });
        res.status(201).json({
          id: result.insertId,
          user_id,
          product_id,
          quantity,
          total_money,
        });
      }
    );
  } catch (error) {
    console.error(
      "Error creating cart:",
      error.response?.data || error.message
    );
    return res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Internal server error",
    });
  }
};

// Delete a product from the cart
exports.deleteCart = async (req, res) => {
  const user_id = req.userId;
  const id = req.params.id || req.params[1];

  try {
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

    cartModel.getCartById(id, (err, cart) => {
      if (err) return res.status(500).json({ message: "Error fetching cart" });
      if (!cart) return res.status(404).json({ message: "Cart not found" });

      // If cart is an array, take the first element
      const cartData = Array.isArray(cart) ? cart[0] : cart;

      // Ensure the cart belongs to the correct user
      if (parseInt(cartData.user_id) !== parseInt(user_id)) {
        return res
          .status(403)
          .json({ message: "You do not have permission to delete this cart" });
      }

      cartModel.deleteCart(id, user_id, (err, result) => {
        if (err)
          return res.status(500).json({ message: "Error deleting from cart" });
        res.status(200).json({ message: `Delete cart with id: ${id}` });
      });
    });
  } catch (error) {
    console.error(
      "Error deleting cart:",
      error.response?.data || error.message
    );
    return res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Internal server error",
    });
  }
};

// Get all carts by user id
exports.getCart = async (req, res) => {
  const user_id = req.userId;

  try {
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

    cartModel.getCartByUserId(user_id, (err, cartItems) => {
      if (err) return res.status(500).json({ message: "Error fetching cart" });
      res.status(200).json(cartItems);
    });
  } catch (error) {
    console.error("Error getting cart:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Internal server error",
    });
  }
};

// Update cart
exports.updateCart = async (req, res) => {
  const id = req.params.id;
  const { quantity } = req.body;

  if (!id || quantity === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (quantity < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1" });
  }

  try {
    // Get product price information to recalculate total_money
    cartModel.getCartById(id, async (err, cart) => {
      if (err) return res.status(500).json({ message: "Error fetching cart" });
      if (!cart) return res.status(404).json({ message: "Cart not found" });

      const product_id = cart[0].product_id;

      const productResponse = await axios.get(
        `http://localhost:3003/api/product/${product_id}`
      );
      if (productResponse.status !== 200) {
        return res.status(404).json({ message: "Product not found" });
      }

      const product = productResponse.data;
      const newTotalMoney = product.price * quantity;

      cartModel.updateCart(id, quantity, newTotalMoney, (err, result) => {
        if (err)
          return res.status(500).json({ message: "Failed to update cart" });
        res.status(200).json({
          message: "Cart updated successfully",
          id: parseInt(id),
          updatedFields: {
            quantity,
            total_money: newTotalMoney,
          },
        });
      });
    });
  } catch (error) {
    console.error("Error updating cart:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  const user_id = req.userId;

  try {
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

    cartModel.clearCart(user_id, (err, result) => {
      if (err) return res.status(500).json({ message: "Error clearing carts" });
      res.status(200).json({ message: "Clear cart successfully" });
    });
  } catch (error) {
    console.error("Error clearing cart:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
