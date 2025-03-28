const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors({
    origin: true, 
    credentials: true 
}));

app.use(express.json());

app.use('/api/user', userRoutes);

app.listen(3002, () => {
    console.log('User Service running on http://localhost:3002');
});