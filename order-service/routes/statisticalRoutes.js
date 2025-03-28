const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const statisticalController = require('../controllers/statisticalController');

router.post('/', authMiddleware(['1']), statisticalController.getTotalAmountByYear);

module.exports = router;