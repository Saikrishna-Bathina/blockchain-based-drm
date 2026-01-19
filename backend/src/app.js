const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Route files
const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/asset');
const licenseRoutes = require('./routes/license');

const app = express();

// Enable CORS first
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Body parser
app.use(express.json());

// Set security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "frame-ancestors": ["'self'", "http://localhost:5173"],
        },
    },
}));

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
// app.use('/api/v1/upload', uploadRoutes); // Use the new upload route file
app.use('/api/v1/licenses', licenseRoutes);

module.exports = app;
