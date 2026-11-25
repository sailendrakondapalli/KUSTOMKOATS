/**
 * Simple logging utility
 */

export function logInfo(message, data = {}) {
  console.log(`ℹ️  [INFO] ${new Date().toISOString()} - ${message}`, data);
}

export function logError(message, error = {}) {
  console.error(`❌ [ERROR] ${new Date().toISOString()} - ${message}`, error);
}

export function logWarning(message, data = {}) {
  console.warn(`⚠️  [WARNING] ${new Date().toISOString()} - ${message}`, data);
}

export function logRequest(method, path) {
  console.log(`🔵 [REQUEST] ${new Date().toISOString()} - ${method} ${path}`);
}

export function logResponse(method, path, statusCode) {
  console.log(`🟢 [RESPONSE] ${method} ${path} - Status: ${statusCode}`);
}
