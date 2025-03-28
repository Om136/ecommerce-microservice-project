const express = require('express');
const cors = require('cors');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

app.use(cors({
    origin: true, 
    credentials: true 
}));

app.use(express.json());

app.use('/api/cart', cartRoutes);

app.listen(3004, () => {
    console.log('Cart Service running on http://localhost:3004');
});