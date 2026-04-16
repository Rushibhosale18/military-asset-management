require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const assetsRoutes = require('./routes/assets');
const transfersRoutes = require('./routes/transfers');
const assignmentsRoutes = require('./routes/assignments');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/transfers', transfersRoutes);
app.use('/api/assignments', assignmentsRoutes);

app.get('/', (req, res) => {
    res.send('Military Asset Management API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
