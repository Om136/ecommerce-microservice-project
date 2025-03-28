const express = require('express');
const cors = require('cors');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const path = require('path');

const app = express();

app.use(cors({
    origin: true, 
    credentials: true 
}));

app.use(express.json());

// Configure image uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/category', categoryRoutes);
app.use('/api/product', productRoutes);

app.listen(3003, () => {
    console.log('Product Service running on http://localhost:3003');
});