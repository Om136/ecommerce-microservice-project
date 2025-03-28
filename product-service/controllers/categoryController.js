const categoryModel = require("../models/categoryModel");

// View all categories
exports.getCategories = (req, res) => {
  categoryModel.getAllCategories((err, results) => {
    if (err)
      return res.status(500).json({ message: "Error fetching categories" });
    res.json(results);
  });
};

// Get products by category ID
exports.getCategoryById = (req, res) => {
  const { id } = req.params;

  categoryModel.getProductsByCategoryId(id, (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Error fetching products for category" });
    res.json(results);
  });
};

// Get category details by ID
exports.getCategoryName = (req, res) => {
  const { id } = req.params; // Get id from URL

  categoryModel.getCategoryById(id, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching category details" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(result[0]); // Return category details
  });
};

// Add category
exports.createCategory = (req, res) => {
  const { name } = req.body;

  categoryModel.createCategory(name, (err, results) => {
    if (err)
      return res.status(500).json({ message: "Error creating category" });
    res.status(201).json({
      id: results.insertId,
      name: name,
      message: "Category created successfully",
    });
  });
};

// Update category
exports.updateCategory = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  categoryModel.updateCategory(id, name, (err, results) => {
    if (err)
      return res.status(500).json({ message: "Error updating category" });
    res.json({ message: "Category updated successfully" });
  });
};

// Delete category
exports.deleteCategory = (req, res) => {
  const { id } = req.params;

  categoryModel.deleteCategory(id, (err, results) => {
    if (err)
      return res.status(500).json({ message: "Error deleting category" });
    res.json({ message: "Category deleted successfully" });
  });
};
