# Backend API Logging Guide

## Console Logging is Active! ✅

The backend server now logs all requests and responses to the console with detailed information.

## What Gets Logged

### Request Logging
Every incoming request shows:
```
🔵 [REQUEST] 2026-11-01T14:13:10.416Z - GET /api/products
📦 Request Body: { ... } (if body exists)
```

### Response Logging
Every outgoing response shows:
```
🟢 [RESPONSE] GET /api/products - Status: 200
📤 Response Data: {
  "success": true,
  "data": [...],
  "count": 5
}
────────────────────────────────────────────────
```

## Example Output

When you call `/api/products`:

```
🔵 [REQUEST] 2026-11-01T14:13:10.416Z - GET /api/products

🟢 [RESPONSE] GET /api/products - Status: 200
📤 Response Data: {
  "success": true,
  "data": [],
  "count": 0,
  "limit": 50,
  "offset": 0
}
────────────────────────────────────────────────────────────────────────────────
```

## How to View Logs

### Method 1: Backend Terminal
The logs appear in the terminal where you ran `npm run dev` in the backend folder.

### Method 2: Check Process Output
Since the backend runs as a background process, you can view logs anytime.

## Log Format

| Symbol | Meaning |
|--------|---------|
| 🔵 | Incoming request |
| 🟢 | Successful response (2xx) |
| 🟡 | Client error (4xx) |
| 🔴 | Server error (5xx) |
| 📦 | Request body data |
| 📤 | Response data |

## Testing the Logging

### Test 1: Health Check
```bash
curl http://localhost:3001/health
```

**Expected console output:**
```
🔵 [REQUEST] 2026-11-01T14:15:00.000Z - GET /health

🟢 [RESPONSE] GET /health - Status: 200
📤 Response Data: {
  "status": "ok",
  "timestamp": "2026-11-01T14:15:00.000Z",
  "service": "KustomKoats Backend API"
}
────────────────────────────────────────────────
```

### Test 2: Get Products
```bash
curl http://localhost:3001/api/products
```

**Expected console output:**
```
🔵 [REQUEST] 2026-11-01T14:16:00.000Z - GET /api/products

🟢 [RESPONSE] GET /api/products - Status: 200
📤 Response Data: {
  "success": true,
  "data": [],
  "count": 0,
  "limit": 50,
  "offset": 0
}
────────────────────────────────────────────────
```

### Test 3: Login (with request body)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Expected console output:**
```
🔵 [REQUEST] 2026-11-01T14:17:00.000Z - POST /api/auth/login
📦 Request Body: {
  "email": "test@example.com",
  "password": "password123"
}

🟢 [RESPONSE] POST /api/auth/login - Status: 200
📤 Response Data: {
  "success": true,
  "data": {
    "user": { ... },
    "session": { ... }
  },
  "message": "Login successful"
}
────────────────────────────────────────────────
```

## Benefits of Logging

### Debugging
- See exactly what data is being sent
- See exactly what data is being returned
- Identify issues quickly

### Monitoring
- Track API usage
- See which endpoints are called
- Monitor response times

### Development
- Understand data flow
- Verify API behavior
- Test integrations

## Response Examples by Endpoint

### Authentication Endpoints

#### POST /api/auth/register
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "session": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token"
    }
  },
  "message": "User registered successfully"
}
```

#### POST /api/auth/login
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "session": {
      "access_token": "jwt_token"
    }
  },
  "message": "Login successful"
}
```

### Product Endpoints

#### GET /api/products
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "price": 999,
      "description": "Product description",
      "category": "neon",
      "status": "active"
    }
  ],
  "count": 1,
  "limit": 50,
  "offset": 0
}
```

#### GET /api/products/:id
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Product Name",
    "price": 999,
    "description": "Product description",
    "category": "neon",
    "images": ["url1", "url2"],
    "status": "active",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Order Endpoints

#### POST /api/orders
```json
{
  "success": true,
  "data": {
    "id": "order_uuid",
    "user_id": "user_uuid",
    "total": 1999,
    "discount": 200,
    "status": "pending",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Order created successfully"
}
```

#### GET /api/orders/my-orders
```json
{
  "success": true,
  "data": [
    {
      "id": "order_uuid",
      "total": 1999,
      "status": "pending",
      "created_at": "2024-01-01T00:00:00.000Z",
      "order_items": [
        {
          "product_id": "product_uuid",
          "quantity": 2,
          "price": 999
        }
      ]
    }
  ],
  "count": 1,
  "limit": 20,
  "offset": 0
}
```

### Promo Code Endpoints

#### POST /api/promo/validate
```json
{
  "success": true,
  "data": {
    "code": "SAVE20",
    "discount_type": "percentage",
    "discount_value": 20,
    "discount_amount": 200,
    "description": "20% off your order"
  }
}
```

## Error Response Logging

When errors occur, they are also logged:

```
🔵 [REQUEST] 2026-11-01T14:20:00.000Z - POST /api/auth/login
📦 Request Body: {
  "email": "invalid@example.com",
  "password": "wrong"
}

🔴 [RESPONSE] POST /api/auth/login - Status: 401
📤 Response Data: {
  "error": "Login failed",
  "message": "Invalid credentials"
}
────────────────────────────────────────────────
```

## Advanced: Filtering Logs

If you want to see only specific types of logs, you can filter the terminal output:

### See only requests:
Look for lines starting with `🔵 [REQUEST]`

### See only responses:
Look for lines starting with `🟢 [RESPONSE]`

### See only errors:
Look for lines with Status: 4xx or 5xx

## Disabling Sensitive Data Logging

For production, you may want to hide passwords and tokens. The current logging automatically redacts these in production mode.

## Tips

1. **Keep the backend terminal visible** while testing to see real-time logs
2. **Use the logs to debug** API issues
3. **Copy log output** to share with team members when reporting issues
4. **Monitor response times** by checking timestamps between request and response

## Troubleshooting

### Not seeing logs?
- Make sure backend is running: `npm run dev` in backend folder
- Check the correct terminal/process
- Try making a request: `curl http://localhost:3001/health`

### Too many logs?
- The logging is detailed for development
- In production, logs will be less verbose
- You can modify `server.js` to reduce logging

---

## Summary

✅ **Console logging is active**  
✅ **All requests logged**  
✅ **All responses logged**  
✅ **Request bodies shown**  
✅ **Response data shown**  
✅ **Easy to debug**  

The backend now provides complete visibility into all API operations through console.log!
