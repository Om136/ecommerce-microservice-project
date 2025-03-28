const db = require("../config/db");

// Get all products
const getAllProducts = (callback) => {
  db.query("SELECT * FROM products", callback);
};

const getProductById = (product_id, callback) => {
  db.query(
    "SELECT * FROM products WHERE id = ?",
    [product_id],
    (err, results) => {
      if (err) return callback(err);
      callback(null, results.length > 0 ? results[0] : null);
    }
  );
};

const getProductsByCategory = (category_id, callback) => {
  db.query(
    "SELECT * FROM products WHERE category_id = ?",
    [category_id],
    callback
  );
};

// Add a new product
const createProduct = (
  name,
  price,
  image,
  description,
  category_id,
  quantity,
  active,
  callback
) => {
  db.query(
    "INSERT INTO products (name, price, image, description, category_id, quantity, active) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, price, image, description, category_id, quantity, active],
    callback
  );
};

// Update a product
const updateProduct = (
  id,
  name,
  price,
  image,
  description,
  category_id,
  quantity,
  callback
) => {
  db.query(
    "UPDATE products SET name = ?, price = ?, image = ?, description = ?, category_id = ?, quantity = ? WHERE id = ?",
    [name, price, image, description, category_id, quantity, id],
    callback
  );
};

const updateProductWithoutImage = (
  id,
  name,
  price,
  description,
  category_id,
  quantity,
  callback
) => {
  db.query(
    "UPDATE products SET name = ?, price = ?, description = ?, category_id = ?, quantity = ? WHERE id = ?",
    [name, price, description, category_id, quantity, id],
    callback
  );
};

// Delete a product
const deleteProduct = (id, callback) => {
  db.query("UPDATE products SET active = 0 WHERE id = ?", [id], callback);
};

// Search for products
const searchProducts = (searchTerm, callback) => {
  const sql = `SELECT * FROM products WHERE name LIKE ? OR description LIKE ?`;
  const params = [`%${searchTerm}%`, `%${searchTerm}%`];

  db.query(sql, params, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// Check and update product quantity
const updateProductQuantity = (product_id, quantity, callback) => {
  db.query(
    "UPDATE products SET quantity = ? WHERE id = ?",
    [quantity, product_id],
    callback
  );
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  updateProductQuantity,
  updateProductWithoutImage,
};
