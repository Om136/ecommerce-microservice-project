const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", categoryController.getCategories);

router.get("/:id", categoryController.getCategoryById);

router.get("/category/:id", categoryController.getCategoryName);

// id admin = 1 so authMiddleware(['1'])
router.post("/", authMiddleware(["1"]), categoryController.createCategory);

router.put("/:id", authMiddleware(["1"]), categoryController.updateCategory);

router.delete("/:id", authMiddleware(["1"]), categoryController.deleteCategory);

module.exports = router;
