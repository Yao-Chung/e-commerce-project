# E-commerce API Documentation

This directory contains the OpenAPI documentation for the E-commerce API.

## Files

- `openapi.yaml` - Complete OpenAPI 3.0.3 specification
- `README.md` - This documentation guide

## Viewing the Documentation

### Option 1: Swagger UI Online

1. Go to [Swagger Editor](https://editor.swagger.io/)
2. Copy and paste the content of `openapi.yaml`
3. View the interactive documentation

### Option 2: VS Code Extension

1. Install the "OpenAPI (Swagger) Editor" extension in VS Code
2. Open `openapi.yaml` in VS Code
3. Use the preview feature to view the documentation

### Option 3: Local Swagger UI

```bash
# Install swagger-ui-serve globally
npm install -g swagger-ui-serve

# Serve the documentation (run from this directory)
swagger-ui-serve openapi.yaml
```

### Option 4: Redoc

```bash
# Install redoc-cli globally
npm install -g redoc-cli

# Generate static HTML documentation
redoc-cli build openapi.yaml --output api-docs.html

# Or serve it locally
redoc-cli serve openapi.yaml
```

## API Overview

The E-commerce API provides the following functionality:

### Authentication & Authorization

- **POST** `/api/auth/register` - User registration
- **POST** `/api/auth/login` - User login
- **GET** `/api/auth/profile` - Get user profile
- **POST** `/api/auth/logout` - User logout
- **GET** `/api/auth/verify` - Verify JWT token
- **GET** `/api/auth/google` - Google OAuth login
- **GET** `/api/auth/google/callback` - Google OAuth callback

### Products

- **GET** `/api/products` - Get all products (with pagination and filtering)
- **POST** `/api/products` - Create product (Admin only)
- **GET** `/api/products/{id}` - Get product by ID
- **PUT** `/api/products/{id}` - Update product (Admin only)
- **DELETE** `/api/products/{id}` - Delete product (Admin only)
- **GET** `/api/products/search` - Search products
- **GET** `/api/products/categories` - Get all categories
- **GET** `/api/products/category/{category}` - Get products by category
- **PATCH** `/api/products/{id}/stock` - Update product stock (Admin only)

### Health & Info

- **GET** `/health` - API health check
- **GET** `/api` - API information and endpoints
- **GET** `/api/auth/health` - Auth service health

## Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Getting a Token

1. Register a new user:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

2. Login to get a token:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Admin Access

Some endpoints require admin privileges. Use these test credentials from the seed data:

- **Email**: `admin@example.com`
- **Password**: `password123`

## Example API Calls

### Get All Products

```bash
curl http://localhost:3000/api/products
```

### Get Product by ID

```bash
curl http://localhost:3000/api/products/ae4e1ea8-cef8-4a47-97ec-b6424f9e2c62
```

### Search Products

```bash
curl "http://localhost:3000/api/products/search?q=headphones"
```

### Create Product (Admin)

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -d '{
    "name": "New Product",
    "description": "Product description",
    "price": 99.99,
    "category": "Electronics",
    "stock": 100
  }'
```

## Error Handling

The API uses standard HTTP status codes and returns errors in this format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

For validation errors:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "too_small",
      "minimum": 2,
      "type": "string",
      "inclusive": true,
      "message": "Name must be at least 2 characters",
      "path": ["name"]
    }
  ]
}
```

## Development

To update this documentation:

1. Modify the `openapi.yaml` file
2. Validate the YAML syntax
3. Test the endpoints to ensure accuracy
4. Update this README if needed

## Validation Tools

- [Swagger Editor](https://editor.swagger.io/) - Online validation
- [OpenAPI Generator](https://openapi-generator.tech/) - Generate client SDKs
- [Spectral](https://stoplight.io/open-source/spectral) - OpenAPI linting
