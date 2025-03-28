const db = require('../config/db');

const getAllCategories = (callback) => {
    db.query('SELECT * FROM categories', callback);
};

const createCategory = (name, callback) => {
    db.query('INSERT INTO categories (name) VALUES (?)', [name], callback);
};

const updateCategory = (id, name, callback) => {
    db.query('UPDATE categories SET name = ? WHERE id = ?', [name, id], callback);
};

const deleteCategory = (id, callback) => {
    db.query('DELETE FROM categories WHERE id = ?', [id], callback);
};

const getProductsByCategoryId = (categoryId, callback) => {
    const query = `
        SELECT products.* 
        FROM products 
        WHERE products.category_id = ?
    `;
    db.query(query, [categoryId], callback);
};

const getCategoryById = (id, callback) => {
    const query = 'SELECT * FROM categories WHERE id = ?';
    db.query(query, [id], callback);
};

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getProductsByCategoryId,
    getCategoryById,
};