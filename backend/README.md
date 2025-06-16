# NestJS Posts Management Backend

A robust NestJS backend application demonstrating dependency injection, JWT authentication, and CRUD operations for posts management.

## Features

- **JWT Authentication**: Secure user registration and login
- **Posts Management**: Full CRUD operations for posts
- **TypeORM Integration**: SQLite database with TypeORM
- **Dependency Injection**: Proper service and repository patterns
- **Validation**: Request validation with class-validator
- **Error Handling**: Global exception filters
- **TypeScript**: Fully typed implementation

## Tech Stack

- NestJS Framework
- TypeORM with SQLite
- JWT Authentication
- bcryptjs for password hashing
- class-validator for validation
- TypeScript

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
DATABASE_URL=./database.sqlite
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

The API will be available at `http://localhost:3000/api`

## API Documentation

### Authentication Endpoints

#### Register User
- **POST** `/api/auth/signup`
- **Description**: Register a new user
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```
- **Response**:
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Login User
- **POST** `/api/auth/login`
- **Description**: Login an existing user
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response**:
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Posts Endpoints

All posts endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer your_jwt_token_here
```

#### Create Post
- **POST** `/api/posts`
- **Description**: Create a new post
- **Request Body**:
```json
{
  "title": "My First Post",
  "content": "This is the content of my first post.",
  "published": true
}
```
- **Response**:
```json
{
  "id": 1,
  "title": "My First Post",
  "content": "This is the content of my first post.",
  "published": true,
  "createdAt": "2025-06-16T10:00:00.000Z",
  "updatedAt": "2025-06-16T10:00:00.000Z",
  "authorId": 1,
  "author": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Get All Posts
- **GET** `/api/posts`
- **Description**: Retrieve all posts from all users
- **Response**:
```json
[
  {
    "id": 1,
    "title": "My First Post",
    "content": "This is the content of my first post.",
    "published": true,
    "createdAt": "2025-06-16T10:00:00.000Z",
    "updatedAt": "2025-06-16T10:00:00.000Z",
    "authorId": 1,
    "author": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
]
```

#### Get My Posts
- **GET** `/api/posts/my-posts`
- **Description**: Retrieve posts created by the authenticated user
- **Response**: Same as "Get All Posts" but filtered by current user

#### Get Post by ID
- **GET** `/api/posts/:id`
- **Description**: Retrieve a specific post by ID
- **Parameters**: 
  - `id` (number) - Post ID
- **Response**: Same as single post object from "Create Post"

#### Update Post
- **PATCH** `/api/posts/:id`
- **Description**: Update a post (only the author can update their own posts)
- **Parameters**: 
  - `id` (number) - Post ID
- **Request Body** (all fields optional):
```json
{
  "title": "Updated Post Title",
  "content": "Updated content.",
  "published": false
}
```
- **Response**: Updated post object

#### Delete Post
- **DELETE** `/api/posts/:id`
- **Description**: Delete a post (only the author can delete their own posts)
- **Parameters**: 
  - `id` (number) - Post ID
- **Response**: `204 No Content`

## Data Models

### User Entity
```typescript
{
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
  posts: Post[];
}
```

### Post Entity
```typescript
{
  id: number;
  title: string;
  content: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: User;
  authorId: number;
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "statusCode": 400,
  "timestamp": "2025-06-16T10:00:00.000Z",
  "path": "/api/posts",
  "method": "POST",
  "message": "Validation failed"
}
```



## Architecture

### Dependency Injection Flow

```
Controller → Service → Repository → Database
```

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and orchestrate operations
- **Repositories**: Handle direct database interactions
- **Guards**: Protect routes with JWT authentication
- **Pipes**: Validate and transform request data
- **Filters**: Handle exceptions globally

### Key Design Patterns

1. **Repository Pattern**: Separates data access logic
2. **Service Layer**: Encapsulates business logic
3. **Dependency Injection**: Manages component dependencies
4. **Custom Decorators**: Simplify common operations (e.g., @CurrentUser)
5. **Global Exception Handling**: Consistent error responses

## Project Structure

```
src/
├── auth/                   # Authentication module
│   ├── dto/               # Data Transfer Objects
│   ├── auth.controller.ts # Auth endpoints
│   ├── auth.service.ts    # Auth business logic
│   ├── auth.module.ts     # Auth module configuration
│   ├── jwt.strategy.ts    # JWT authentication strategy
│   └── user.repository.ts # User data access
├── posts/                 # Posts module
│   ├── dto/              # Data Transfer Objects
│   ├── posts.controller.ts
│   ├── posts.service.ts
│   ├── posts.module.ts
│   └── post.repository.ts
├── database/
│   └── entities/         # TypeORM entities
├── common/               # Shared components
│   ├── decorators/       # Custom decorators
│   ├── guards/          # Route guards
│   └── filters/         # Exception filters
└── app.module.ts        # Root module
```

## Testing the API

You can test the API using curl, Postman, or any HTTP client:

### 1. Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Create a post (use token from login response)
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My First Post",
    "content": "This is my first post content",
    "published": true
  }'
```

### 4. Get all posts
```bash
curl -X GET http://localhost:3000/api/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Development

### Building the project
```bash
npm run build
```

### Running tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Code formatting
```bash
npm run format
```

### Linting
```bash
npm run lint
```