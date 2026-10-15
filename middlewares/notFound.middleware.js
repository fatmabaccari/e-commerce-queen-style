import AppError from './AppError.js';

/**
 * 404 Not Found Middleware
 * Handles requests to routes that don't exist
 * Must be placed after all routes but before error middleware
 */
const notFoundMiddleware = (req, res, next) => {
    const error = new AppError(
        `Route ${req.originalUrl} not found`,
        404
    );
    next(error);
};

export default notFoundMiddleware;

