import AppError from './AppError.js';

/**
 * Validation middleware for sign-up
 */
export const validateSignUp = (req, res, next) => {
    const { first_name, last_name, email, password, phone } = req.body;
    const errors = [];

    // Validate first_name
    if (!first_name) {
        errors.push('First name is required');
    } else if (typeof first_name !== 'string' || first_name.trim().length < 2) {
        errors.push('First name must be at least 2 characters long');
    }

    // Validate last_name
    if (!last_name) {
        errors.push('Last name is required');
    } else if (typeof last_name !== 'string' || last_name.trim().length < 2) {
        errors.push('Last name must be at least 2 characters long');
    }

    // Validate email
    if (!email) {
        errors.push('Email is required');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            errors.push('Please provide a valid email address');
        }
    }

    // Validate password
    if (!password) {
        errors.push('Password is required');
    } else if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    } else if (password.length > 128) {
        errors.push('Password must be less than 128 characters');
    }

    // Validate phone (optional)
    if (phone && typeof phone !== 'string') {
        errors.push('Phone must be a string');
    }

    if (errors.length > 0) {
        throw new AppError(errors.join(', '), 400);
    }

    // Sanitize and trim inputs
    req.body.first_name = first_name.trim();
    req.body.last_name = last_name.trim();
    req.body.email = email.trim().toLowerCase();
    if (phone) {
        req.body.phone = phone.trim();
    }

    next();
};

/**
 * Validation middleware for sign-in
 */
export const validateSignIn = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    // Validate email
    if (!email) {
        errors.push('Email is required');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            errors.push('Please provide a valid email address');
        }
    }

    // Validate password
    if (!password) {
        errors.push('Password is required');
    }

    if (errors.length > 0) {
        throw new AppError(errors.join(', '), 400);
    }

    // Sanitize email
    req.body.email = email.trim().toLowerCase();

    next();
};

/**
 * Validation middleware for user update
 */
export const validateUserUpdate = (req, res, next) => {
    const { first_name, last_name, phone } = req.body;
    const errors = [];

    // Validate first_name (optional for update)
    if (first_name !== undefined) {
        if (!first_name || typeof first_name !== 'string' || first_name.trim().length < 2) {
            errors.push('First name must be at least 2 characters long');
        }
    }

    // Validate last_name (optional for update)
    if (last_name !== undefined) {
        if (!last_name || typeof last_name !== 'string' || last_name.trim().length < 2) {
            errors.push('Last name must be at least 2 characters long');
        }
    }

    // Validate phone (optional)
    if (phone !== undefined && phone !== null && typeof phone !== 'string') {
        errors.push('Phone must be a string');
    }

    if (errors.length > 0) {
        throw new AppError(errors.join(', '), 400);
    }

    // Sanitize inputs
    if (first_name !== undefined) {
        req.body.first_name = first_name.trim();
    }
    if (last_name !== undefined) {
        req.body.last_name = last_name.trim();
    }
    if (phone !== undefined) {
        req.body.phone = phone ? phone.trim() : null;
    }

    next();
};

/**
 * Validation middleware for order creation
 */
export const validateOrder = (req, res, next) => {
    const { full_name, phone, address, city, payment_method, items } = req.body;
    const errors = [];

    if (!full_name) errors.push('Full name is required');
    if (!phone) errors.push('Phone is required');
    if (!address) errors.push('Address is required');
    if (!city) errors.push('City is required');
    
    // Validate payment method
    if (!payment_method) {
        errors.push('Payment method is required');
    } else {
        const validPaymentMethods = ['cash_on_delivery', 'card'];
        if (!validPaymentMethods.includes(payment_method)) {
            errors.push(`Payment method must be one of: ${validPaymentMethods.join(', ')}`);
        }
    }

    // Items can be provided in body or will be taken from session cart in controller
    // So we only validate if items are provided
    if (items !== undefined) {
        if (!Array.isArray(items) || items.length === 0) {
            errors.push('Items must be a non-empty array');
        } else {
            for (const item of items) {
                if (!item.variant_id || typeof item.variant_id !== 'number') {
                    errors.push('Each item must have a valid variant_id');
                }
                if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
                    errors.push('Each item must have a valid quantity greater than 0');
                }
            }
        }
    }

    if (errors.length > 0) {
        throw new AppError(errors.join(', '), 400);
    }

    // Sanitize inputs
    req.body.full_name = full_name.trim();
    req.body.phone = phone.trim();
    req.body.address = address.trim();
    req.body.city = city.trim();
    // Normalize payment_method to match enum (lowercase, trimmed)
    req.body.payment_method = payment_method.trim().toLowerCase();
    if (req.body.note) {
        req.body.note = req.body.note.trim();
    }

    next();
};

/**
 * Validation middleware for order status update
 */
export const validateOrderStatusUpdate = (req, res, next) => {
    const { status } = req.body;
    const errors = [];

    if (!status) {
        errors.push('Status is required');
    } else {
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status.toLowerCase())) {
            errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
        }
    }
    
    // Normalize status to match enum (lowercase)
    if (status) {
        req.body.status = status.toLowerCase();
    }

    if (errors.length > 0) {
        throw new AppError(errors.join(', '), 400);
    }

    next();
};

/**
 * Validation middleware for discount creation/update
 */
export const validateDiscount = (req, res, next) => {
    const { name, type, value, start_date, end_date } = req.body;
    const errors = [];

    // For create, all fields are required
    if (req.method === 'POST') {
        if (!name) errors.push('Name is required');
        if (!type) errors.push('Type is required');
        if (value === undefined || value === null) errors.push('Value is required');
        if (!start_date) errors.push('Start date is required');
        if (!end_date) errors.push('End date is required');
    }

    // Validate type if provided
    if (type !== undefined) {
        const validTypes = ['percentage', 'fixed'];
        if (!validTypes.includes(type.toLowerCase())) {
            errors.push(`Type must be one of: ${validTypes.join(', ')}`);
        }
    }

    // Validate value if provided
    if (value !== undefined && value !== null) {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) {
            errors.push('Value must be a positive number');
        }
        if (type && type.toLowerCase() === 'percentage' && numValue > 100) {
            errors.push('Percentage value cannot exceed 100');
        }
    }

    // Validate dates if provided
    if (start_date) {
        const start = new Date(start_date);
        if (isNaN(start.getTime())) {
            errors.push('Start date must be a valid date');
        }
    }

    if (end_date) {
        const end = new Date(end_date);
        if (isNaN(end.getTime())) {
            errors.push('End date must be a valid date');
        }
    }

    // Validate date range if both dates are provided
    if (start_date && end_date) {
        const start = new Date(start_date);
        const end = new Date(end_date);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end < start) {
            errors.push('End date must be after start date');
        }
    }

    if (errors.length > 0) {
        throw new AppError(errors.join(', '), 400);
    }

    // Sanitize and normalize inputs
    if (name !== undefined) {
        req.body.name = name.trim();
    }
    if (type !== undefined) {
        req.body.type = type.toLowerCase(); // Normalize to match enum
    }
    if (value !== undefined && value !== null) {
        req.body.value = parseFloat(value);
    }

    next();
};

