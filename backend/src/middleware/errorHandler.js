/**
 * Global Express error handler.
 * Services throw errors with an optional .status property.
 * This translates them into clean JSON responses.
 */
export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (status >= 500) {
    console.error(`[${new Date().toISOString()}] ❌ ${req.method} ${req.path}`, err);
  }

  res.status(status).json({
    success: false,
    error: httpStatusText(status),
    message: process.env.NODE_ENV === 'production' && status >= 500
      ? 'Something went wrong'
      : message,
  });
}

function httpStatusText(code) {
  const map = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
  };
  return map[code] || 'Error';
}
