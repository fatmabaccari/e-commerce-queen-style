/**
 * Async Handler Utility
 * Wraps async route handlers to automatically catch errors and pass them to error middleware
 * 
 * Usage:
 *   router.get('/users', asyncHandler(async (req, res, next) => {
 *     const users = await UserModel.findAll();
 *     res.json({ success: true, data: users });
 *   }));
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export default asyncHandler;

