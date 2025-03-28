const express = require('express');
const cors = require('cors');
const orderRoutes = require('./routes/orderRoutes');
const statisticalRoutes = require('./routes/statisticalRoutes');

const app = express();

app.use(cors({
    origin: true, 
    credentials: true 
}));

app.use(express.json());

app.use('/api/order', orderRoutes);
app.use('/api/statistical', statisticalRoutes);

app.listen(3005, () => {
    console.log('Order Service running on http://localhost:3005');
});