# KustomKoats Backend API

Backend API server for KustomKoats E-commerce platform. This server acts as a secure middleware layer between the frontend and Supabase, handling authentication, validation, and business logic.

## Architecture

```
Frontend (React) → Backend API (Express) → Supabase (Database + Auth)
```

## Features

- ✅ Secure authentication with JWT tokens
- ✅ Request validation and sanitization
- ✅ Role-based access control (Admin/User/Wholesaler)
- ✅ Protection against XSS and common attacks
- ✅ Centralized error handling
- ✅ Rate limiting ready
- ✅ CORS configuration
- ✅ Environment-based configuration

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT)
- **Validation**: express-validator
- **Security**: Helmet, CORS

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Configure the following variables:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Shiprocket Configuration (optional)
SHIPROCKET_EMAIL=your_email
SHIPROCKET_PASSWORD=your_password
```

**Important**: 
- Use the **SERVICE_ROLE_KEY** (not the anon key) for the backend
- Never commit the `.env` file to version control
- The service role key bypasses RLS, so keep it secure

### 3. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| POST | `/logout` | Logout user | Yes |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password | Yes |

### Products (`/api/products`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all products | No |
| GET | `/:id` | Get product by ID | No |
| POST | `/` | Create product | Admin |
| PUT | `/:id` | Update product | Admin |
| DELETE | `/:id` | Delete product | Admin |

### Orders (`/api/orders`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/my-orders` | Get user's orders | Yes |
| GET | `/` | Get all orders | Admin |
| GET | `/:id` | Get order by ID | Yes |
| POST | `/` | Create new order | Yes |
| PATCH | `/:id/status` | Update order status | Admin |

### Promo Codes (`/api/promo`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/validate` | Validate promo code | No |
| GET | `/` | Get all promo codes | Admin |
| POST | `/` | Create promo code | Admin |
| PUT | `/:id` | Update promo code | Admin |
| DELETE | `/:id` | Delete promo code | Admin |

### Wholesale (`/api/wholesale`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/apply` | Submit application | No |
| GET | `/applications` | Get all applications | Admin |
| PATCH | `/applications/:id` | Update application | Admin |
| GET | `/customers` | Get wholesale customers | Admin |

### Storage (`/api/storage`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/upload-url` | Get signed upload URL | Yes |
| POST | `/download-url` | Get signed download URL | No |
| POST | `/public-url` | Get public URL | No |
| DELETE | `/` | Delete files | Admin |
| GET | `/:bucket` | List files in bucket | Admin |

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```javascript
Authorization: Bearer <your-jwt-token>
```

The token is obtained from Supabase Auth on the frontend and automatically included by the API client.

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "details": [] // Optional validation errors
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

### 1. JWT Token Validation
- All protected routes verify JWT tokens with Supabase
- Expired tokens are automatically rejected
- Token refresh is handled on the frontend

### 2. Input Validation
- Request body validation using express-validator
- SQL injection prevention
- XSS attack prevention through input sanitization

### 3. Role-Based Access Control
- Admin-only endpoints check user role in database
- User can only access their own data
- Proper authorization checks on all endpoints

### 4. Security Headers
- Helmet middleware adds security headers
- CORS properly configured
- Content Security Policy ready

### 5. Rate Limiting (Recommended)
Consider adding rate limiting for production:

```bash
npm install express-rate-limit
```

## Frontend Integration

The frontend uses the API client in `src/lib/apiClient.js`:

```javascript
import { productsAPI, authAPI } from '@/lib/apiClient';

// Get products
const products = await productsAPI.getAll({ category: 'neon' });

// Login
const { data } = await authAPI.login(email, password);
```

### Update Frontend .env

Add to your frontend `.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

For production:
```env
VITE_API_URL=https://your-backend-domain.com/api
```

## Development Workflow

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend
```bash
cd ..
npm run dev
```

### 3. Test API
Use tools like:
- **Postman** or **Insomnia** for API testing
- **Thunder Client** (VS Code extension)
- **curl** command line

Example curl request:
```bash
curl http://localhost:3001/api/products
```

## Deployment

### Option 1: Deploy to Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and deploy:
```bash
railway login
railway init
railway up
```

3. Add environment variables in Railway dashboard

### Option 2: Deploy to Render

1. Create a new Web Service
2. Connect your GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables

### Option 3: Deploy to Vercel (Serverless)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### Option 4: Deploy to VPS (DigitalOcean, AWS, etc.)

1. Install Node.js on server
2. Clone repository
3. Install dependencies
4. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start backend/server.js
pm2 startup
pm2 save
```

## Monitoring

### Health Check

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "KustomKoats Backend API"
}
```

### Logs

Development logs are printed to console. For production:

```bash
pm2 logs
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
npx kill-port 3001
```

### CORS Errors
- Verify `FRONTEND_URL` in `.env` matches your frontend URL
- Check that frontend is sending requests to correct API URL

### Authentication Errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check that token is being sent in Authorization header
- Ensure Supabase project is accessible

### Database Errors
- Verify RLS policies allow access via service role
- Check table names and column names match schema
- Ensure foreign key relationships are correct

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - KustomKoats
