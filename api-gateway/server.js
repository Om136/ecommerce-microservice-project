const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: true, 
    credentials: true 
}));

app.use('/api/auth', createProxyMiddleware({ 
    target: 'http://localhost:3001/api/auth', 
    changeOrigin: true,
}));

app.use('/api/user', createProxyMiddleware({ 
    target: 'http://localhost:3002/api/user', 
    changeOrigin: true,
}));

app.use('/api/product', createProxyMiddleware({ 
    target: 'http://localhost:3003/api/product', 
    changeOrigin: true,
}));

app.use('/api/category', createProxyMiddleware({ 
    target: 'http://localhost:3003/api/category', 
    changeOrigin: true,
}));

app.use('/uploads', createProxyMiddleware({ 
    target: 'http://localhost:3003/uploads', 
    changeOrigin: true,
}));

app.use('/api/cart', createProxyMiddleware({ 
    target: 'http://localhost:3004/api/cart', 
    changeOrigin: true,
}));

app.use('/api/order', createProxyMiddleware({ 
    target: 'http://localhost:3005/api/order', 
    changeOrigin: true,
}));

app.use('/api/statistical', createProxyMiddleware({ 
    target: 'http://localhost:3005/api/statistical', 
    changeOrigin: true,
}));

app.listen(3000, () => {
    console.log('API Gateway running on http://localhost:3000');
});