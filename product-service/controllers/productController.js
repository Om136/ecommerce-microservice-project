const productModel = require("../models/productModel");

// Get all products
exports.getProducts = (req, res) => {
  productModel.getAllProducts((err, results) => {
    if (err)
      return res.status(500).json({ message: "Error fetching products" });
    res.json(results);
  });
};

// Get a product by ID
exports.getProductById = (req, res) => {
  const { id } = req.params;
  productModel.getProductById(id, (err, results) => {
    if (err) return res.status(500).json({ message: "Error getting product" });
    res.json(results);
  });
};

exports.getProductsByCategory = (req, res) => {
  const category_id = req.query.category_id;
  productModel.getProductsByCategory(category_id, (err, products) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Error fetching products by category" });
    res.json(products);
  });
};

// Add a product
exports.createProduct = (req, res) => {
  const { name, price, description, category_id, quantity } = req.body;

  const image = req.files.image ? req.files.image[0] : null;
  const imagePath = image ? image.path : null;
  const active = 1;

  productModel.createProduct(
    name,
    price,
    imagePath,
    description,
    category_id,
    quantity,
    active,
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: err });
      }

      res.status(201).json({
        id: results.insertId,
        name,
        price,
        imagePath,
        description,
        category_id,
        quantity,
        active,
        message: "Product created successfully",
      });
    }
  );
};

// Update a product
exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, price, description, category_id, quantity } = req.body;

  // Check if an image file is uploaded
  const image = req.files && req.files.image ? req.files.image[0] : null;
  const imagePath = image ? image.path : null;

  // If no imagePath, update other fields only
  if (imagePath) {
    // If there is an image, update all fields
    productModel.updateProduct(
      id,
      name,
      price,
      imagePath,
      description,
      category_id,
      quantity,
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Error updating product" });
        }
        res.status(201).json({
          name,
          price,
          imagePath,
          description,
          category_id,
          quantity,
        });
      }
    );
  } else {
    // If no image, skip updating imagePath
    productModel.updateProductWithoutImage(
      id,
      name,
      price,
      description,
      category_id,
      quantity,
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Error updating product" });
        }
        res.status(201).json({
          name,
          price,
          description,
          category_id,
          quantity,
        });
      }
    );
  }
};

// Delete a product
exports.deleteProduct = (req, res) => {
  const { id } = req.params;

  productModel.deleteProduct(id, (err, results) => {
    if (err) return res.status(500).json({ message: "Error deleting product" });
    res.json({ message: "Product deleted successfully" });
  });
};

// Search products
exports.searchProducts = (req, res) => {
  const { term } = req.body; // Get term directly from req.body

  if (term) {
    // If there is a term, search products by name or description
    productModel.searchProducts(term, (err, products) => {
      if (err) {
        console.error("Error searching products:", err);
        return res.status(500).json({ message: "Error searching products" });
      }

      if (products.length === 0) {
        return res.status(404).json({ message: "No products found" });
      }

      return res.status(200).json(products);
    });
  } else {
    // If no term, return all products
    productModel.getAllProducts((err, products) => {
      if (err) {
        console.error("Error fetching products:", err);
        return res.status(500).json({ message: "Error fetching products" });
      }
      return res.status(200).json(products);
    });
  }
};

exports.updateProductQuantity = (req, res) => {
  const id = req.params.id;
  const { quantity } = req.body; // quantity can be a negative number to reduce stock

  try {
    productModel.getProductById(id, (err, product) => {
      if (err)
        return res.status(500).json({ message: "Error getting product" });

      // Calculate new quantity
      const newQuantity = product.quantity + quantity;
      if (newQuantity < 0) {
        return res.status(400).json({ message: "Not enough stock" });
      }

      productModel.updateProductQuantity(id, newQuantity, (err, results) => {
        if (err)
          return res.status(500).json({ message: "Cannot update quantity" });
        res
          .status(200)
          .json({
            message: "Product quantity updated successfully",
            newQuantity,
          });
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
