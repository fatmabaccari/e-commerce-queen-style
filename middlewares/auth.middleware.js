import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import AppError from './AppError.js';
import prisma from '../database/prisma-client.js';
import AdminModel from '../models/admin.model.js';

/**
 * ============================================================================
 * AUTHENTICATION vs AUTHORIZATION
 * ============================================================================
 * 
 * AUTHENTICATE (WHO you are):
 *   - Verifies identity (checks if token is valid)
 *   - Answers: "Are you who you say you are?"
 *   - Returns 401 Unauthorized if token is invalid/missing
 *   - Use for: Protecting routes that require login
 * 
 * AUTHORIZE (WHAT you can do):
 *   - Verifies permissions (checks roles/permissions)
 *   - Answers: "Are you allowed to do this?"
 *   - Returns 403 Forbidden if user lacks permissions
 *   - Use for: Admin routes, role-based access, permission checks
 * 
 * BEST PRACTICE:
 *   - Use BOTH: authenticate first, then authorize
 *   - Example: router.get('/admin/users', authenticate, authorize(['admin']), getUsers)
 * ============================================================================
 */

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user info to request
 * 
 * Use this for routes that require a logged-in user
 * Returns 401 if token is missing or invalid
 */
export const authenticate = (req, res, next) => {
     console.log('=== AUTHENTICATE MIDDLEWARE STARTED ===');
    console.log(`Request Method: ${req.method}`);
    console.log(`Request URL: ${req.originalUrl}`);
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
         console.log(`Authorization Header Present: ${!!authHeader}`);
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
               console.log('ERROR: No Bearer token found in Authorization header');
            throw new AppError('Authentication required. Please provide a valid token.', 401);
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        if (!token) {
            console.log('ERROR: Token is empty after removing Bearer prefix');
            throw new AppError('Authentication required. Please provide a valid token.', 401);
        }

        // Verify token
         console.log('Verifying JWT token...');
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Token verified successfully');
        console.log(`Decoded Token: ${JSON.stringify(decoded, null, 2)}`);

        // Attach user info to request
        req.user = {
            userId: decoded.userId,
        };
console.log(`User ID attached to request: ${req.user.userId}`);
        console.log('=== AUTHENTICATE MIDDLEWARE COMPLETED ===\n');
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            next(new AppError('Invalid token. Please log in again.', 401));
        } else if (error.name === 'TokenExpiredError') {
            next(new AppError('Your token has expired. Please log in again.', 401));
        } else {
            next(error);
        }
    }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 */
export const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = {
                userId: decoded.userId,
            };
        }
        
        next();
    } catch (error) {
        // If token is invalid, just continue without user info
        next();
    }
};

/**
 * Authorization Middleware
 * Checks if the authenticated user has permission to perform an action
 * 
 * Usage:
 *   // Check for specific roles
 *   router.get('/admin/users', authenticate, authorize(['admin', 'super_admin']), getUsers);
 * 
 *   // Check for specific permissions
 *   router.delete('/admin/users/:id', authenticate, authorize([], ['delete_users']), deleteUser);
 *//*
export const authorize = (allowedRoles = [], requiredPermissions = []) => {

    return async (req, res, next) => {
         console.log('=== AUTHORIZE MIDDLEWARE CREATED ===');
    console.log(`Allowed Roles: ${JSON.stringify(allowedRoles)}`);
    console.log(`Required Permissions: ${JSON.stringify(requiredPermissions)}`);
        try {
            // User must be authenticated first (authenticate middleware should run before this)
            if (!req.user || !req.user.userId) {
                throw new AppError('Authentication required', 401);
            }

            // Check if user is an admin (for admin routes)
            if (allowedRoles.length > 0 || requiredPermissions.length > 0) {
                const admin = await AdminModel.findById(req.user.userId);
                
                if (!admin) {
                    throw new AppError('Access denied. Admin privileges required.', 403);
                }

                // Load role with permissions
                const role = await prisma.roles.findUnique({
                    where: { id: admin.role_id },
                });

                if (!role) {
                    throw new AppError('User role not found', 403);
                }

                // Check roles
                if (allowedRoles.length > 0 && !allowedRoles.includes(role.name)) {
                    throw new AppError('Access denied. Insufficient role privileges.', 403);
                }

                // Check permissions
                if (requiredPermissions.length > 0) {
                    let permissions = [];
                    try {
                        permissions = JSON.parse(role.permissions);
                    } catch {
                        permissions = role.permissions.split(',').map(p => p.trim());
                    }

                    const hasAllPermissions = requiredPermissions.every(permission =>
                        permissions.includes(permission)
                    );

                    if (!hasAllPermissions) {
                        throw new AppError('Access denied. Insufficient permissions.', 403);
                    }
                }

                // Attach admin and role info to request
                req.user.admin = admin;
                req.user.role = role;
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
*/
/**
 * Authorization Middleware
 * Checks if the authenticated user has permission to perform an action
 * 
 * Usage:
 *   // Check for specific roles
 *   router.get('/admin/users', authenticate, authorize(['admin', 'super_admin']), getUsers);
 * 
 *   // Check for specific permissions
 *   router.delete('/admin/users/:id', authenticate, authorize([], ['delete_users']), deleteUser);
 */
export const authorize = (allowedRoles = [], requiredPermissions = []) => {
    console.log('=== AUTHORIZE MIDDLEWARE CREATED ===');
    console.log(`Allowed Roles: ${JSON.stringify(allowedRoles)}`);
    console.log(`Required Permissions: ${JSON.stringify(requiredPermissions)}`);
    
    return async (req, res, next) => {
        console.log('=== AUTHORIZE MIDDLEWARE EXECUTING ===');
        console.log(`Request URL: ${req.originalUrl}`);
        
        try {
            // User must be authenticated first (authenticate middleware should run before this)
            console.log(`req.user exists: ${!!req.user}`);
            console.log(`req.user.userId: ${req.user?.userId}`);
            
            if (!req.user || !req.user.userId) {
                console.error('ERROR: User not authenticated. authorize() must be used after authenticate()');
                throw new AppError('Authentication required', 401);
            }

            console.log(`Checking authorization for user ID: ${req.user.userId}`);

            // Check if user is an admin (for admin routes)
            if (allowedRoles.length > 0 || requiredPermissions.length > 0) {
                console.log('Admin/role check required');
                
                console.log('Fetching admin data from AdminModel...');
                const admin = await AdminModel.findById(req.user.userId);
                console.log(`Admin found: ${!!admin}`);
                
                if (!admin) {
                    console.error('ERROR: User is not an admin');
                    throw new AppError('Access denied. Admin privileges required.', 403);
                }

                console.log(`Admin ID: ${admin.id}, Role ID: ${admin.role_id}`);

                // Load role with permissions
                console.log('Fetching role information...');
                const role = await prisma.roles.findUnique({
                    where: { id: admin.role_id },
                });

                console.log(`Role found: ${!!role}`);
                console.log(`Role Name: ${role?.name}`);
                console.log(`Role Permissions: ${role?.permissions}`);

                if (!role) {
                    console.error('ERROR: Role not found for admin');
                    throw new AppError('User role not found', 403);
                }

                // Check roles
                if (allowedRoles.length > 0) {
                    console.log(`Checking if role '${role.name}' is in allowed roles: ${JSON.stringify(allowedRoles)}`);
                    const hasRole = allowedRoles.includes(role.name);
                    console.log(`Has required role: ${hasRole}`);
                    
                    if (!hasRole) {
                        console.error(`ERROR: Role '${role.name}' not in allowed roles`);
                        throw new AppError('Access denied. Insufficient role privileges.', 403);
                    }
                }

                // Check permissions
                if (requiredPermissions.length > 0) {
                    console.log(`Checking required permissions: ${JSON.stringify(requiredPermissions)}`);
                    
                    let permissions = [];
                    try {
                        permissions = JSON.parse(role.permissions);
                        console.log('Permissions parsed as JSON');
                    } catch {
                        permissions = role.permissions.split(',').map(p => p.trim());
                        console.log('Permissions parsed as comma-separated string');
                    }
                    
                    console.log(`Available permissions: ${JSON.stringify(permissions)}`);
                    
                    const hasAllPermissions = requiredPermissions.every(permission =>
                        permissions.includes(permission)
                    );
                    
                    console.log(`Has all required permissions: ${hasAllPermissions}`);
                    
                    if (!hasAllPermissions) {
                        console.error(`ERROR: Missing permissions. Required: ${JSON.stringify(requiredPermissions)}`);
                        throw new AppError('Access denied. Insufficient permissions.', 403);
                    }
                }

                // Attach admin and role info to request
                req.user.admin = admin;
                req.user.role = role;
                console.log('Admin and role info attached to request.user');
            } else {
                console.log('No roles or permissions required, authorization check passed');
            }

            console.log('=== AUTHORIZE MIDDLEWARE COMPLETED ===\n');
            next();
        } catch (error) {
            console.error('AUTHORIZE MIDDLEWARE ERROR:');
            console.error('Error Name:', error.name);
            console.error('Error Message:', error.message);
            console.error('Stack Trace:', error.stack);
            next(error);
        }
    };
};
/**
 * Resource Ownership Middleware
 * Checks if the user owns the resource they're trying to access
 * 
 * Usage:
 *   router.put('/users/:id', authenticate, checkOwnership('users'), updateUser);
 */
/**
 * Resource Ownership Middleware
 * Checks if the user owns the resource they're trying to access
 * 
 * Usage:
 *   router.put('/users/:id', authenticate, checkOwnership('users'), updateUser);
 * 
 * @param {string} resourceModel - Prisma model name (must be a valid model)
 * @param {string} userIdField - Field name that contains user_id (default: 'user_id')
 */
export const checkOwnership = (resourceModel, userIdField = 'user_id') => {
    // Whitelist of allowed Prisma models for security
    const allowedModels = ['users', 'user_addresses', 'orders'];
    
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.userId) {
                throw new AppError('Authentication required', 401);
            }

            // Validate model name to prevent injection
            if (!allowedModels.includes(resourceModel)) {
                throw new AppError(`Invalid resource model: ${resourceModel}`, 400);
            }

            const resourceId = parseInt(req.params.id);
            const userId = req.user.userId;

            if (isNaN(resourceId)) {
                throw new AppError('Invalid resource ID', 400);
            }

            // Check if user owns the resource
            const resource = await prisma[resourceModel].findUnique({
                where: { id: resourceId },
            });

            if (!resource) {
                throw new AppError(`${resourceModel} not found`, 404);
            }

            // Check ownership
            // For users model, compare id directly (users don't have user_id field)
            // For other models, use the specified userIdField
            const ownershipField = resourceModel === 'users' ? 'id' : userIdField;
            if (resource[ownershipField] !== userId) {
                throw new AppError('Access denied. You can only access your own resources.', 403);
            }

            // Attach resource to request for use in controller
            req.resource = resource;

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Resource Ownership or Admin Middleware
 * Checks if the user owns the resource OR is an admin
 * Allows admins to bypass ownership checks
 * 
 * Usage:
 *   router.put('/users/:id', authenticate, checkOwnershipOrAdmin('users'), updateUser);
 */
export const checkOwnershipOrAdmin = (resourceModel, userIdField = 'user_id') => {
    // Whitelist of allowed Prisma models for security
    const allowedModels = ['users', 'user_addresses', 'orders'];
    
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.userId) {
                throw new AppError('Authentication required', 401);
            }

            // Check if user is an admin
            const admin = await AdminModel.findById(req.user.userId);
            if (admin) {
                // Admin can access any resource, skip ownership check
                // Still validate the resource exists
                const resourceId = parseInt(req.params.id);
                if (isNaN(resourceId)) {
                    throw new AppError('Invalid resource ID', 400);
                }

                // Validate model name to prevent injection
                if (!allowedModels.includes(resourceModel)) {
                    throw new AppError(`Invalid resource model: ${resourceModel}`, 400);
                }

                const resource = await prisma[resourceModel].findUnique({
                    where: { id: resourceId },
                });

                if (!resource) {
                    throw new AppError(`${resourceModel} not found`, 404);
                }

                req.resource = resource;
                req.user.admin = admin;
                return next();
            }

            // Not an admin, check ownership using the original checkOwnership logic
            // Validate model name to prevent injection
            if (!allowedModels.includes(resourceModel)) {
                throw new AppError(`Invalid resource model: ${resourceModel}`, 400);
            }

            const resourceId = parseInt(req.params.id);
            const userId = req.user.userId;

            if (isNaN(resourceId)) {
                throw new AppError('Invalid resource ID', 400);
            }

            // Check if user owns the resource
            const resource = await prisma[resourceModel].findUnique({
                where: { id: resourceId },
            });

            if (!resource) {
                throw new AppError(`${resourceModel} not found`, 404);
            }

            // Check ownership
            // For users model, compare id directly (users don't have user_id field)
            // For other models, use the specified userIdField
            const ownershipField = resourceModel === 'users' ? 'id' : userIdField;
            if (resource[ownershipField] !== userId) {
                throw new AppError('Access denied. You can only access your own resources.', 403);
            }

            // Attach resource to request for use in controller
            req.resource = resource;

            next();
        } catch (error) {
            next(error);
        }
    };
    
};