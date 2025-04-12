# Simple Blog Platform

A lightweight blog platform built with Node.js, TypeScript, Express, Sequelize, and MySQL. 
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

## Installation and Setup
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd simple-blog-platform
2. **Install dependencies**:
   ```bash
    npm install
3. **Set up environment variables**
    - Create a .env file in the root directory based on .env.example.<br>
    SERVER_PORT=3000.<br>
    DB_NAME=your_db_name.<br>
    DB_USER=your_db_user.<br>
    DB_PASSWORD=your_db_password.<br> 
    DB_HOST=localhost.<br>
    JWT_ACCESS_TOKEN_KEY=your-secret-key.<br>
    JWT_PAYLOAD_KEY=your-payload-key.<br>
    JWT_REFRESH_TOKEN_KEY=your-refreshs-key.<br>
    ENCRYPTED_ACCESS_TOKEN_KEY=your-encrypted-access-key.<br>
    ENCRYPTED_REFRESH_TOKEN_KEY=your-encrypted-refresh-key.<br>
    DEFAULTKEY=your-default-key
4. **Set up MySQL database**
    - Option 1: Local MySQL: Create a database in MySQL
        ```bash
        sql: CREATE DATABASE your_db_name;
    - Option 2: Docker: Run MySQL using Docker
        ```bash
        docker command: docker run -d -p 3306:3306 --name mysql -e MYSQL_ROOT_PASSWORD=your_db_password -e MYSQL_DATABASE=your_db_name mysql:8
5. **Run the project**
    ```bash 
    npm start
    The server will run at http://localhost:3000 by default.
    Sequelize will automatically sync the database schema on startup.

## Code Architecture
The project follows a modular MVC-like structure with TypeScript and CommonJS:
    - src/controllers: Handles business logic for authentication, posts, and comments.
    - src/models: Sequelize models for users, posts, and comments, with associations and soft deletes (is_deleted).
    - src/routes: Express routes for /auth, /posts, and /comments, using middleware for validation and JWT authentication.
    - src/middleware: Custom middleware for JWT verification (verifyAccessToken) and input validation (validate.ts using Joi).
    - src/utils: Utilities for logging, JWT handling, and helper functions.
    - src/config: Configuration files (e.g., database settings).

Key Features:
- JWT Authentication: Secure user login with access and refresh tokens.
- Input Validation: Joi-based validation for all API inputs to ensure data integrity.
- Rate Limiting: Prevents abuse using express-rate-limit (100 requests per 15 minutes per IP).
- Soft Deletes: Uses is_deleted flag to mark deleted records without removing them from the database.
- TypeScript: Ensures type safety and better developer experience.

## Testing Guide
1. **Start server**
    npm start
2. **Sign up a user**
    ```bash
    curl -X POST http://localhost:3000/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "password": "123456"}'
    Expected: 200 OK with { "User registered successfully" }
3. **Log in**
    ```bash
    curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "password": "123456"}'
    Expected: 200 OK with { "token": "<jwt-token>", "refreshToken": "<refresh-token>" }
4. **Create a post**
    ```bash
    curl -X POST http://localhost:3000/posts \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <jwt-token>" \
    -d '{"title": "Test Post", "content": "Hello World"}'
    Expected: 201 CREATED with { "id": 3, "title": "Hello", "content": "World", "user_id": 1 }.
5. **Update a post**
    ```bash
    curl -X PUT http://localhost:3000/posts/1 \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <jwt-token>" \
    -d '{"title": "Real Post", "content": "Hello World again"}'
    Expected: 200 OK with { "id": 3, "title": "Eyyy", "content": "What do you do in your free time?", "user_id": 1 }
6. **Get all posts**
    ```bash
    curl -X GET http://localhost:3000/posts
    Expected: 200 OK with a list of posts ([{"id": 2, "title": "hello", "content": "Hello world", "user_id": 1, "email": "abc@gmail.com"}, {...}])
7. **Comment on a post**
    ```bash
    curl -X POST http://localhost:3000/post/1/comments \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <jwt-token>" \
    -d '{"content": "Great post!"}'
    Expected: 200 OK with { "message": "Comment created" }
8. **Delete a post**
    ```bash
    curl -X DELETE http://localhost:3000/posts/1 \
    -H "Authorization: Bearer <jwt-token>"
    Expected: 200 OK with { "message": "Post and related comments deleted" }

    Error case (post not owned by user):
    curl -X DELETE http://localhost:3000/posts/999 \
    -H "Authorization: Bearer <jwt-token>" ```
    Expected: 404 Not Found or 403 Forbidden with { "message": "Post not found" } or { "message": "Forbidden: You can only delete your own posts" }
9. **Refresh token**
    ```bash
    curl -X POST http://localhost:3000/auth/refresh \
    -H "Content-Type: application/json" \
    -d '{"refreshToken": "<refresh-token>"}'
    Expected: 200 OK with { "accessToken": "<new-jwt-token>"}

    Error case (invalid token)
    curl -X POST http://localhost:3000/auth/refresh \
    -H "Content-Type: application/json" \
    -d '{"refreshToken": "invalid-token"}' ```
    Expected: 401 Unauthorized with { "message": "Invalid refresh token" }.
10. **Test validation errors**
    ```bash
    curl -X POST http://localhost:3000/posts \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <jwt-token>" \
    -d '{"title": "", "content": "Hello"}'
11. **Test rate limiting**
    Send >100 requests to any endpoint within 15 minutes.
    Expected: 429 Too Many Requests with { "message": "Too many requests from this IP, please try again later" }