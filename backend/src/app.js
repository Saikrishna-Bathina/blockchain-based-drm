const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Route files
const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/asset');
const licenseRoutes = require('./routes/license');

const app = express();

// Enable CORS
app.use(cors({
    origin: '*', // Allow all for production deployment
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
            "frame-ancestors": ["'self'"],
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
app.use('/api/v1/notifications', require('./routes/notification'));

module.exports = app;
