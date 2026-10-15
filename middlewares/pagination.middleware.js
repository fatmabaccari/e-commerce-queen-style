/**
 * Pagination middleware
 * Parses pagination query parameters and attaches to request
 */
export const pagination = (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate pagination params
    if (page < 1) {
        return res.status(400).json({
            success: false,
            error: 'Page must be greater than 0',
        });
    }

    if (limit < 1 || limit > 100) {
        return res.status(400).json({
            success: false,
            error: 'Limit must be between 1 and 100',
        });
    }

    req.pagination = {
        page,
        limit,
        skip,
    };

    next();
};

/**
 * Create pagination response
 */
export const createPaginationResponse = (data, total, pagination) => {
    const { page, limit } = pagination;
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
        success: true,
        data,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage,
            hasPrevPage,
        },
    };
};

