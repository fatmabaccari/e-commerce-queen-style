import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { PORT, NODE_ENV, SESSION_SECRET } from './config/env.js';
import heroSlideRoutes from './routes/heroSlide.routes.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import userAddressRouter from './routes/userAddress.routes.js';
import productRouter from './routes/product.routes.js';
import categoryRouter from './routes/category.routes.js';
import productVariantRouter from './routes/productVariant.routes.js';
import productVariantImageRouter from './routes/productVariantImage.routes.js';
import orderRouter from './routes/order.routes.js';
import discountRouter from './routes/discount.routes.js';
import stockMovementRouter from './routes/stockMovement.routes.js';
import cartRouter from './routes/cart.routes.js';
import contactRoutes from './routes/contact.routes.js';
import heroSectionRoutes from './routes/heroSection.routes.js';

import prisma from './database/prisma-client.js';
import errorMiddleware from './middlewares/error.middleware.js';
import notFoundMiddleware from './middlewares/notFound.middleware.js';

const app = express();

// CORS middleware - allow requests from frontend
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // In production, use FRONTEND_URL env variable
        if (process.env.FRONTEND_URL) {
            const allowedOrigins = process.env.FRONTEND_URL.split(',').map(url => url.trim());
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            // Log for debugging (remove in production if too verbose)
            if (process.env.NODE_ENV !== 'production') {
                console.log(`CORS: Origin ${origin} not in allowed list:`, allowedOrigins);
            }
        } else if (process.env.NODE_ENV === 'production') {
            // In production, FRONTEND_URL should be set
            console.warn('WARNING: FRONTEND_URL not set in production. CORS may fail.');
        }
        
        // In development, allow any localhost port
        if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:')) {
            return callback(null, true);
        }
        
        callback(new Error(`Not allowed by CORS. Origin: ${origin}, Allowed: ${process.env.FRONTEND_URL || 'none'}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Session middleware for shopping cart
app.use(session({
    secret: SESSION_SECRET || 'queen-style-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
}));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Queen Style API', status: 'running' });
});

// Health check endpoint for Docker
app.get('/health', async (req, res) => {
    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ 
            status: 'healthy', 
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({ 
            status: 'unhealthy', 
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Authentication routes
app.use('/api/v1/auth', authRouter);

// User routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/user-addresses', userAddressRouter);
// Hero slide routes
app.use('/api/v1', heroSlideRoutes);
//contact routes
app.use('/api/v1/contacts', contactRoutes);
// Hero Section  routes
app.use('/api/v1', heroSectionRoutes);

// Product routes
app.use('/api/v1/products', productRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/product-variants', productVariantRouter);
app.use('/api/v1/product-variants', productVariantImageRouter);

// Order routes
app.use('/api/v1/orders', orderRouter);

// Shopping cart routes (session-based)
app.use('/api/v1/cart', cartRouter);

// Discount routes
app.use('/api/v1/discounts', discountRouter);

// Stock movement routes (admin only)
app.use('/api/v1/stock-movements', stockMovementRouter);

// 404 handler (must be after all routes)
app.use(notFoundMiddleware);

// Error handler (must be last)
app.use(errorMiddleware);

app.listen(PORT, async () => {
    console.log(`app API is running on http://localhost:${PORT}`);

    // Test Prisma DB connection
    try {
        await prisma.$connect();
        console.log(`Prisma connected successfully in ${NODE_ENV} mode.`);
    } catch (err) {
        console.error('Prisma failed to connect to the database:', err);
        process.exit(1);
    }
});

export default app;