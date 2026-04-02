# Finance Data Processing & Access Control Dashboard API

A production-quality REST API built with **Node.js**, **Express**, **MongoDB**, and **JWT** for managing financial transactions with role-based access control.

---

## Table of Contents

- [Stack](#stack)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Role Permissions](#role-permissions)
- [Error Handling](#error-handling)
- [Additional Features](#additional-features)
- [Assumptions](#assumptions)

---

## Stack

| Layer          | Technology                    |
|----------------|-------------------------------|
| Runtime        | Node.js 18+ (ESM)             |
| Framework      | Express 4                     |
| Database       | MongoDB via Mongoose 8        |
| Auth           | JWT (jsonwebtoken)            |
| Validation     | Joi                           |
| Security       | Helmet, CORS, express-rate-limit |
| Documentation  | Swagger (swagger-jsdoc + swagger-ui-express) |

---

## Project Structure

```
src/
├── config/
│   ├── db.js            # MongoDB connection
│   └── swagger.js       # Swagger/OpenAPI config
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── transactionController.js
│   └── dashboardController.js
├── middleware/
│   ├── authenticate.js  # JWT verification
│   ├── authorize.js     # Role-based access control
│   ├── validate.js      # Joi input validation
│   ├── errorHandler.js  # Centralised error handler
│   └── rateLimiter.js   # Rate limiting (general + auth)
├── models/
│   ├── User.js
│   └── Transaction.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── transactionRoutes.js
│   └── dashboardRoutes.js
├── services/
│   ├── authService.js
│   ├── userService.js
│   ├── transactionService.js
│   └── dashboardService.js
├── utils/
│   ├── AppError.js      # Custom operational error
│   ├── catchAsync.js    # Async error wrapper
│   ├── response.js      # Standard response helper
│   └── validators.js    # All Joi schemas
├── app.js               # Express app (middleware + routes)
└── server.js            # Entry point (DB connect + listen)
```

---

## Setup

### Prerequisites

- Node.js 18 or later
- MongoDB 6 or later (local or Atlas)

### Installation

```bash
# 1. Clone and enter the directory
git clone <repo-url>
cd finance-dashboard

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
# Edit .env with your values

# 4. Start in development mode
npm run dev

# 5. Start in production
npm start
```

The API will be available at `http://localhost:5000`.  
Swagger UI is at `http://localhost:5000/api-docs`.

---

## Environment Variables

| Variable               | Description                              | Default         |
|------------------------|------------------------------------------|-----------------|
| `PORT`                 | HTTP server port                         | `5000`          |
| `NODE_ENV`             | Environment (`development`/`production`) | `development`   |
| `MONGO_URI`            | MongoDB connection string                | —               |
| `JWT_SECRET`           | JWT signing secret (min 32 chars)        | —               |
| `JWT_EXPIRES_IN`       | Token expiry duration                    | `7d`            |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms                  | `900000` (15m)  |
| `RATE_LIMIT_MAX`       | Max requests per window                  | `100`           |

---

## API Endpoints

All routes are prefixed with `/api/v1`.

### Auth

| Method | Endpoint         | Access  | Description              |
|--------|-----------------|---------|--------------------------|
| POST   | /auth/register   | Public  | Register a new user      |
| POST   | /auth/login      | Public  | Log in, receive JWT      |
| GET    | /auth/me         | Any     | Get current user profile |

### Users

| Method | Endpoint              | Access | Description               |
|--------|-----------------------|--------|---------------------------|
| GET    | /users                | Any*   | List users                |
| GET    | /users/:id            | Any*   | Get user by ID            |
| PATCH  | /users/:id/role       | Admin  | Change user role          |
| PATCH  | /users/:id/status     | Admin  | Activate/deactivate user  |
| DELETE | /users/:id            | Admin  | Soft-delete user          |

\* Non-admins can only see their own data.

### Transactions

| Method | Endpoint           | Access          | Description                           |
|--------|--------------------|-----------------|---------------------------------------|
| GET    | /transactions      | Viewer+         | List with filter, search, pagination  |
| POST   | /transactions      | Admin           | Create transaction                    |
| PATCH  | /transactions/:id  | Admin           | Update transaction                    |
| DELETE | /transactions/:id  | Admin           | Soft-delete transaction               |

#### Query parameters for GET /transactions

| Param     | Type   | Description                              |
|-----------|--------|------------------------------------------|
| type      | string | `income` or `expense`                    |
| category  | string | Partial match (case-insensitive)         |
| startDate | date   | ISO 8601 date                            |
| endDate   | date   | ISO 8601 date                            |
| search    | string | Search in category and notes             |
| page      | int    | Page number (default: 1)                 |
| limit     | int    | Items per page (default: 20, max: 100)   |
| sortBy    | string | `date`, `amount`, or `createdAt`         |
| sortOrder | string | `asc` or `desc`                          |

### Dashboard

| Method | Endpoint            | Access    | Description                             |
|--------|---------------------|-----------|-----------------------------------------|
| GET    | /dashboard/summary  | Analyst+  | Income, expenses, trends, categories    |

---

## Role Permissions

| Endpoint type       | viewer | analyst | admin |
|---------------------|--------|---------|-------|
| GET transactions    | ✅     | ✅      | ✅    |
| POST transaction    | ❌     | ❌      | ✅    |
| PATCH transaction   | ❌     | ❌      | ✅    |
| DELETE transaction  | ❌     | ❌      | ✅    |
| Dashboard summary   | ❌     | ✅      | ✅    |
| Manage users        | ❌     | ❌      | ✅    |
| View own profile    | ✅     | ✅      | ✅    |

---

## Error Handling

All errors follow a consistent JSON structure:

```json
{
  "status": "fail",
  "message": "Human-readable error description"
}
```

In development mode, the response also includes `stack` and `error` fields.

### HTTP Status Codes

| Code | Meaning                        |
|------|--------------------------------|
| 200  | OK                             |
| 201  | Created                        |
| 400  | Bad Request / Validation error |
| 401  | Unauthorized                   |
| 403  | Forbidden (role mismatch)      |
| 404  | Not Found                      |
| 409  | Conflict (duplicate key)       |
| 429  | Too Many Requests              |
| 500  | Internal Server Error          |

---

## Additional Features

### 1. Soft Delete
Both `User` and `Transaction` models support soft deletion via a `deletedAt` field.  
A Mongoose pre-query hook automatically excludes soft-deleted records from all queries and aggregations — no changes needed in application code.

### 2. Rate Limiting
- **General API**: 100 requests per 15 minutes per IP.
- **Auth endpoints**: 10 requests per 15 minutes per IP, to slow brute-force attempts.

### 3. Search Functionality
`GET /transactions?search=<term>` performs a case-insensitive regex search across the `category` and `notes` fields.

### 4. Swagger API Documentation
Interactive docs at `http://localhost:5000/api-docs`. All endpoints include request/response schemas and can be tested directly in the browser.

### 5. Pagination
All list endpoints return a `meta` object:
```json
{
  "total": 150,
  "page": 2,
  "limit": 20,
  "totalPages": 8,
  "hasNextPage": true,
  "hasPrevPage": true
}
```

---

## Assumptions

1. **Transaction ownership**: Regular users can only read and modify their own transactions. Admins can operate on all.
2. **Admin bootstrap**: The first admin user must be created via `POST /auth/register` with `"role": "admin"`. After that, role assignment is admin-only.
3. **Soft delete is permanent from the user's view**: Soft-deleted records are invisible to all queries. There is no restore endpoint (can be added).
4. **Dashboard scope**: Analysts see only their own transactions in the dashboard; admins see all users' data.
5. **Password hashing**: bcrypt with salt rounds = 12 (balances security and performance).
6. **No refresh tokens**: JWTs are stateless with a configurable expiry. Refresh token rotation can be added if required.

