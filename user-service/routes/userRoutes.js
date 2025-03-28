const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', userController.register);

router.post('/login', userController.login);

router.get('/role/:id', userController.getRoleIdByUserId);

router.get('/allUser', authMiddleware(['1']), userController.getAllUsers);

router.delete('/delete/:id', authMiddleware(['1']), userController.deleteUser);

router.put('/update/:id', authMiddleware(['1','2']), userController.updateUser);

router.get('/getUser/:id', authMiddleware(['1','2']), userController.getUserById);

module.exports = router;