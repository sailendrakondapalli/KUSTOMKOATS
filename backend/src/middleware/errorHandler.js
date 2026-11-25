/**
 * Custom Application Error class
 */
export class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized error handling middleware
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  // Log error
  console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.path}`, {
    statusCode,
    message: err.message,
    errorCode: err.errorCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Send response
  res.status(statusCode).json({
    error: isOperational ? err.message : 'Internal Server Error',
    errorCode: err.errorCode,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
}

/**
 * Standard error codes
 */
export const ErrorCodes = {
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

  // Authorization
  FORBIDDEN: 'FORBIDDEN',
  ADMIN_REQUIRED: 'ADMIN_REQUIRED',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Business Logic
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  INVALID_PROMO_CODE: 'INVALID_PROMO_CODE',
  CART_EMPTY: 'CART_EMPTY',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR'
};
