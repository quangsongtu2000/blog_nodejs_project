# Simple Blog Nodejs Project

A lightweight blog project built with Node.js, TypeScript, Express, Sequelize, and MySQL. 
Users can register, log in, create/edit/delete posts, view public posts, and comment on posts. 
The project uses JWT for authentication and soft deletes for data management.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Code Architecture](#code-architecture)
- [Testing Guide](#testing-guide)

## Prerequisites
- **Node.js**: v16 or higher
- **MySQL**: v8 or higher
- **npm**: v8 or higher
- **Git**: For cloning the repository

## Tech Stack
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **TypeScript**: For type safety
- **Sequelize**: ORM for database operations
- **Jest**: Testing framework
- **Joi**: Schema validation
- **bcryptjs**: Password hashing

## Installation and Setup
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd blog-nodejs-project
2. **Install dependencies**:
   ```bash
    npm install
3. **Set up environment variables**
    - Create a .env file in the root directory base on .env.example file<br>
    ```bash
        SERVER_PORT=
        DB_NAME=
        DB_USER=
        DB_PASSWORD= 
        DB_HOST=
        JWT_ACCESS_TOKEN_KEY=
        JWT_PAYLOAD_KEY=
        JWT_REFRESH_TOKEN_KEY=
        ENCRYPTED_ACCESS_TOKEN_KEY=
        ENCRYPTED_REFRESH_TOKEN_KEY=
        DEFAULT_KEY=
        MYSQL_ROOT_PASSWORD=
        MYSQL_DATABASE=
4. **Set up MySQL database**
    - Option 1: Local MySQL: Create a database in MySQL
        ```bash
        sql: CREATE DATABASE your_db_name;
    - Option 2: Docker: Run MySQL using Docker
        ```bash
        docker command: docker run -d -p 3306:3306 --name mysql -e MYSQL_ROOT_PASSWORD=your_db_password -e MYSQL_DATABASE=your_db_name mysql:8
5. **Run the project**
    - Option 1: Normal start app
    ```bash 
    npm start
    The server will run at http://localhost:3000 by default.
    Sequelize will automatically sync the database schema on startup.

    Option 2: Using docker tool
    docker-compose up -d
## Code Architecture
The project follows a modular MVC-like structure with TypeScript and CommonJS:<br>
    - src/controllers: Handles business logic for authentication, posts, and comments.<br>
    - src/models: Sequelize models for users, posts, and comments, with associations and soft deletes (is_deleted).<br>
    - src/routes: Express routes for /auth, /posts, and /comments, using middleware for validation and JWT authentication.<br>
    - src/middleware: Custom middleware for JWT verification (verifyAccessToken) and input validation (validate.ts using Joi).<br>
    - src/utils: Utilities for logging, JWT handling, and helper functions.<br>
    - src/config: Configuration files (e.g., database settings).<br>
    - src/tests: Unit test for functions and api.<br>

Key Features:
- JWT Authentication: Secure user login with access and refresh tokens.
- Input Validation: Joi-based validation for all API inputs to ensure data integrity.
- Rate Limiting: Prevents abuse using express-rate-limit (100 requests per 15 minutes per IP).
- Soft Deletes: Uses is_deleted flag to mark deleted records without removing them from the database.
- TypeScript: Ensures type safety and better developer experience.

## Testing Guide
1. **Start server**<br>
    npm start
2. **Sign up a user**
    ```bash
    curl -X POST http://localhost:3000/api/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "password": "123456"}'
    Expected: 200 OK with { "User registered successfully" }
3. **Log in**
    ```bash
    curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "password": "123456"}'
    Expected: 200 OK with { "token": "<jwt-token>", "refreshToken": "<refresh-token>" }
4. **Create a post**
    ```bash
    curl -X POST http://localhost:3000/api/posts \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <jwt-token>" \
    -d '{"title": "Test Post", "content": "Hello World"}'
    Expected: 201 CREATED with { "id": 9, "title": "Hi Girl", "content": "a dangerous tower, bro","user_id": 2, "created_at": "2025-04-13T11:11:58.791Z"}.
5. **Update a post**
    ```bash
    curl -X PUT http://localhost:3000/api/posts/1 \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <jwt-token>" \
    -d '{"title": "Real Post", "content": "Hello World again"}'
    Expected: 200 OK with { "id": 3, "title": "Eyyy", "content": "What do you do in your free time?", "user_id": 1 }
6. **Get all posts**
    ```bash
    curl -X GET http://localhost:3000/api/posts
    Expected: 200 OK with a list of posts ([{"id": 2, "title": "hello", "content": "Hello world", "user_id": 1, "email": "abc@gmail.com", "created_at": "2025-04-12T04:24:01.000Z", "updated_at": "2025-04-13T11:15:40.000Z"}, {...}], "pagination": {"pageSize": 10, "pageNum": 1, "totalPosts": 7, "totalPages": 1})
7. **Get one post**
    ```bash
    curl -X GET http://localhost:3000/api/posts/11
    Expected: 200 OK with a list of posts ({"id": 11, "title": "hello", "content": "Hello world", "user_id": 1, "email": "abc@gmail.com", "created_at": "2025-04-12T04:24:01.000Z"}, "updated_at": "2025-04-13T11:15:40.000Z")
8. **Comment on a post (TBU update/get/delete for commet API later)**
    ```bash
    curl -X POST http://localhost:3000/api/post/1/comments \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <jwt-token>" \
    -d '{"content": "Great post!"}'
    Expected: 200 OK with {"id": 4, "content": "a dangerous tower, bro", "user_id": 2,"post_id": 3, "created_at": "2025-04-13T11:09:06.419Z"}
9. **Delete a post**
    ```bash
    curl -X DELETE http://localhost:3000/api/posts/1 \
    -H "Authorization: Bearer <jwt-token>"
    Expected: 200 OK with { "message": "Post and related comments deleted" }

    Error case (post not owned by user):
    curl -X DELETE http://localhost:3000/api/posts/999 \
    -H "Authorization: Bearer <jwt-token>" ```
    Expected: 404 Not Found or 403 Forbidden with { "message": "Post not found" } or { "message": "Forbidden: You can only delete your own posts" }
10. **Refresh token**
    ```bash
    curl -X POST http://localhost:3000/api/auth/refresh \
    -H "Content-Type: application/json" \
    -d '{"refreshToken": "<refresh-token>"}'
    Expected: 200 OK with { "accessToken": "<new-jwt-token>"}

    Error case (invalid token)
    curl -X POST http://localhost:3000/api/auth/refresh \
    -H "Content-Type: application/json" \
    -d '{"refreshToken": "invalid-token"}' ```
    Expected: 401 Unauthorized with { "message": "Invalid refresh token" }.
11. **Test validation errors**
    ```bash
    curl -X POST http://localhost:3000/api/posts \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <jwt-token>" \
    -d '{"title": "", "content": "Hello"}'
12. **Test rate limiting**
    Send >100 requests to any endpoint within 15 minutes.
    Expected: 429 Too Many Requests with { "message": "Too many requests from this IP, please try again later" }

## Using Swagger UI
1. **Access Swagger UI**
    Open http://localhost:3000/api-docs in your browser.<br>
    Endpoints are grouped into:
    - Auth: User registration and login.
    - Posts: Manage blog posts.
    - Comments: Manage comments for posts.
2. **Test Endpoints**.<br>
    Sign up a user<br>
    Endpoint: POST /auth/signup<br>
    Click "Try it out", enter<br>
    ```bash
    {
        "email": "test@example.com",
        "password": "123456"
    }
    Execute to get: {"message": "User registered"}
    Same for the remaining api