import { Prisma } from '@prisma/client';
import { NODE_ENV } from '../config/env.js';
import AppError from './AppError.js';

/**
 * Handle Prisma-specific errors
 */
const handlePrismaError = (err) => {
    // Unique constraint violation (e.g., duplicate email)
    if (err.code === 'P2002') {
        const field = err.meta?.target?.[0] || 'field';
        return new AppError(
            `Duplicate value for ${field}. This ${field} already exists.`,
            409
        );
    }

    // Record not found
    if (err.code === 'P2025') {
        return new AppError('Record not found', 404);
    }

    // Foreign key constraint violation
    if (err.code === 'P2003') {
        return new AppError(
            'Invalid reference. The related record does not exist.',
            400
        );
    }

    // Required field violation
    if (err.code === 'P2011') {
        return new AppError(
            'Required field is missing or null.',
            400
        );
    }

    // Value out of range
    if (err.code === 'P2012') {
        return new AppError(
            'Invalid value provided.',
            400
        );
    }

    // Database connection error
    if (err.code === 'P1001' || err.code === 'P1002') {
        return new AppError(
            'Database connection error. Please try again later.',
            503
        );
    }

    // Query timeout
    if (err.code === 'P1008') {
        return new AppError(
            'Database query timeout. Please try again.',
            408
        );
    }

    // Default Prisma error
    return new AppError('Database operation failed', 500);
};

/**
 * Handle validation errors (e.g., from express-validator or Joi)
 */
const handleValidationError = (err) => {
    const errors = err.errors || [];
    const message = errors.map(e => e.msg || e.message).join(', ') || err.message;
    return new AppError(message, 400);
};

/**
 * Handle JWT errors (for future authentication)
 */
const handleJWTError = () => {
    return new AppError('Invalid token. Please log in again.', 401);
};

const handleJWTExpiredError = () => {
    return new AppError('Your token has expired. Please log in again.', 401);
};

/**
 * Handle cast errors (invalid ID format)
 */
const handleCastError = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

/**
 * Send error response in development
 */
const sendErrorDev = (err, res) => {
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message,
        stack: err.stack,
        ...(err.meta && { meta: err.meta }),
    });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err, res) => {
    // Only send operational errors to client
    if (err.isOperational) {
        res.status(err.statusCode || 500).json({
            success: false,
            error: err.message,
        });
    } else {
        // Programming or unknown errors: don't leak error details
        console.error('ERROR 💥', err);
        res.status(500).json({
            success: false,
            error: 'Something went wrong!',
        });
    }
};

/**
 * Global Error Handling Middleware
 * Must be placed after all routes
 */
const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error details
    console.error('Error:', {
        message: err.message,
        statusCode: err.statusCode,
        path: req.originalUrl,
        method: req.method,
        ...(NODE_ENV === 'development' && { stack: err.stack }),
    });

    let error = { ...err };
    error.message = err.message;

    // Handle Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        error = handlePrismaError(err);
    } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        error = new AppError('Database operation failed', 500);
    } else if (err instanceof Prisma.PrismaClientRustPanicError) {
        error = new AppError('Database engine error', 500);
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
        error = new AppError('Database connection failed', 503);
    } else if (err instanceof Prisma.PrismaClientValidationError) {
        // Log the actual Prisma validation error for debugging
        console.error('Prisma Validation Error:', err.message);
        error = new AppError(`Invalid database query: ${err.message}`, 400);
    }

    // Handle validation errors
    if (err.name === 'ValidationError' || err.name === 'ValidatorError') {
        error = handleValidationError(err);
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = handleJWTError();
    }
    if (err.name === 'TokenExpiredError') {
        error = handleJWTExpiredError();
    }

    // Handle cast errors (MongoDB/Mongoose style - for compatibility)
    if (err.name === 'CastError') {
        error = handleCastError(err);
    }

    // Handle AppError instances
    if (!(error instanceof AppError) && !error.isOperational) {
        error = new AppError(error.message || 'Internal Server Error', error.statusCode || 500);
    }

    // Send error response based on environment
    if (NODE_ENV === 'development') {
        sendErrorDev(error, res);
    } else {
        sendErrorProd(error, res);
    }
};

export default errorMiddleware;
