const db = require("../config/db");

const createOrder = (
  user_id,
  total_amount,
  status,
  phone_number,
  address,
  callback
) => {
  db.query(
    "INSERT INTO orders (user_id, total_amount, status, phone_number, address) VALUES (?, ?, ?, ?, ?)",
    [user_id, total_amount, status, phone_number, address],
    callback
  );
};

// Function to add products to order_items
const addOrderItems = (order_id, product_id, quantity, price, callback) => {
  db.query(
    "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
    [order_id, product_id, quantity, price],
    callback
  );
};

// Get all orders of a user
const getOrdersByUserId = (user_id, callback) => {
  const sql = `
        SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`;
  db.query(sql, [user_id], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

const getAllOrderItemsByOrderId = (order_id, callback) => {
  const query = `
        SELECT * 
        FROM order_items  
        WHERE order_id = ?`;

  db.query(query, [order_id], callback);
};

const getOrderById = (id, callback) => {
  const sql = `
        SELECT * 
        FROM orders
        WHERE id = ?
    `;
  db.query(sql, [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

const updateOrderStatus = (orderId, status, callback) => {
  const sql = "UPDATE orders SET status = ? WHERE id = ?";
  db.query(sql, [status, orderId], callback);
};

// Get all orders
const getAllOrders = (callback) => {
  const sql = `SELECT * FROM orders`;
  db.query(sql, callback);
};

const cancelOrder = (order_id, callback) => {
  db.query(
    'UPDATE orders SET status = "canceled" WHERE id = ?',
    [order_id],
    callback
  );
};

module.exports = {
  createOrder,
  addOrderItems,
  getOrdersByUserId,
  getAllOrderItemsByOrderId,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  cancelOrder,
};
