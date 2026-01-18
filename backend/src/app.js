const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Route files
const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/asset');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Set security headers
app.use(helmet());

// Logger
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount routers
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/assets', assetRoutes);

module.exports = app;
