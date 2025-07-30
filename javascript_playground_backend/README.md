# JavaScript Playground Backend API

A comprehensive Node.js/Express backend API for a JavaScript playground application that provides secure code execution, user authentication, snippet management, and sharing capabilities.

## Features

- **User Authentication**: JWT-based authentication with sign up, sign in, and sign out
- **Code Execution**: Secure JavaScript code execution using isolated-vm with timeout and memory limits
- **Snippet Management**: Full CRUD operations for code snippets
- **Sharing**: Shareable links for code snippets with unique tokens
- **Execution History**: Track and view code execution history per user
- **API Documentation**: Comprehensive Swagger/OpenAPI documentation

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL with mysql2 driver
- **Authentication**: JWT (jsonwebtoken) + bcryptjs for password hashing
- **Code Execution**: isolated-vm for secure JavaScript execution
- **Documentation**: Swagger UI with swagger-jsdoc
- **Development**: nodemon, ESLint

## Quick Start

### Prerequisites

- Node.js 18 or higher
- MySQL database
- npm or yarn

### Installation

1. Clone the repository and navigate to the backend directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Access the API documentation at: `http://localhost:3000/docs`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `HOST` | Server host | 0.0.0.0 |
| `NODE_ENV` | Environment | development |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 3306 |
| `DB_USER` | Database user | root |
| `DB_PASSWORD` | Database password | (empty) |
| `DB_NAME` | Database name | javascript_playground |
| `JWT_SECRET` | JWT signing secret | (required in production) |

## API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/profile` - Get user profile (authenticated)

### Code Execution (`/api/execute`)

- `POST /api/execute` - Execute JavaScript code
- `GET /api/execute/history` - Get execution history (authenticated)
- `GET /api/execute/history/:id` - Get specific execution entry (authenticated)
- `GET /api/execute/stats` - Get execution statistics (authenticated)

### Code Snippets (`/api/snippets`)

- `POST /api/snippets` - Create new snippet (authenticated)
- `GET /api/snippets` - Get user's snippets (authenticated)
- `GET /api/snippets/:id` - Get snippet by ID (authenticated)
- `PUT /api/snippets/:id` - Update snippet (authenticated)
- `DELETE /api/snippets/:id` - Delete snippet (authenticated)
- `GET /api/snippets/public` - Get public snippets
- `GET /api/snippets/share/:token` - Get snippet by share token

### Health Check

- `GET /` - Health check endpoint

## Database Schema

The application automatically creates the following tables:

### users
- `id` (INT, Primary Key, Auto Increment)
- `username` (VARCHAR(255), Unique)
- `email` (VARCHAR(255), Unique)
- `password_hash` (VARCHAR(255))
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### code_snippets
- `id` (INT, Primary Key, Auto Increment)
- `user_id` (INT, Foreign Key → users.id)
- `title` (VARCHAR(255))
- `code` (TEXT)
- `description` (TEXT)
- `share_token` (VARCHAR(255), Unique)
- `is_public` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### execution_history
- `id` (INT, Primary Key, Auto Increment)
- `user_id` (INT, Foreign Key → users.id)
- `snippet_id` (INT, Foreign Key → code_snippets.id, Nullable)
- `code` (TEXT)
- `output` (TEXT)
- `error` (TEXT)
- `execution_time` (FLOAT)
- `created_at` (TIMESTAMP)

## Security Features

### Code Execution Security
- **Isolated Environment**: Uses isolated-vm for complete isolation
- **Resource Limits**: 5-second timeout, 128MB memory limit
- **Code Validation**: Blocks dangerous patterns like file system access, process manipulation
- **No Network Access**: Executed code cannot make network requests

### Authentication Security
- **JWT Tokens**: Secure, stateless authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Token Expiration**: 24-hour token validity
- **Input Validation**: Comprehensive input sanitization

### API Security
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Request Size Limits**: Built-in Express JSON parser limits
- **Error Handling**: Secure error responses without sensitive information

## Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (Jest)
- `npm run lint` - Run ESLint

### Code Structure

```
src/
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/          # Database models
├── routes/          # API routes
└── services/        # Business logic services
```

### Adding New Features

1. Create model in `src/models/`
2. Add service logic in `src/services/`
3. Create controller in `src/controllers/`
4. Define routes in `src/routes/`
5. Add Swagger documentation
6. Update main routes in `src/routes/index.js`

## API Documentation

Complete API documentation is available at `/docs` when the server is running. The documentation includes:

- All endpoint specifications
- Request/response schemas
- Authentication requirements
- Example requests and responses
- Error codes and descriptions

## Error Handling

The API uses consistent error response format:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": ["Detailed error array if applicable"]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Contributing

1. Follow the existing code structure and naming conventions
2. Add comprehensive JSDoc comments for all public functions
3. Include Swagger documentation for all new endpoints
4. Ensure proper error handling and validation
5. Update this README for any new features

## License

This project is part of the JavaScript Playground application.
