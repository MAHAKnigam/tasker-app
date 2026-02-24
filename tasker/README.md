# Tasker - Task Management Application

A comprehensive task management application built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: User registration and login with JWT tokens
- **User Management**: Create, read, update, and delete user profiles
- **Task Management**: Create tasks with priority levels, status tracking, and due dates
- **Task Filtering**: Filter tasks by status, priority, and completion status
- **Password Management**: Secure password change functionality
- **Role-based Access Control**: Admin and user roles

## Components

### 1. User Service
- Manage user profiles
- Get user information
- Update user details
- Delete users

### 2. Authentication Service
- User registration
- User login with JWT
- Password change
- Token verification

### 3. Task Service
- Create tasks
- Retrieve user tasks with filters
- Update tasks
- Delete tasks
- Mark tasks as complete
- Filter by status and priority

### 4. MongoDB Database
- User collection with authentication
- Task collection with relationships
- Proper indexing and validation

## Project Structure

```
tasker/
├── src/
│   ├── config/
│   │   └── database.js         # MongoDB connection configuration
│   ├── controllers/
│   │   ├── AuthController.js   # Authentication logic
│   │   ├── UserController.js   # User management logic
│   │   └── TaskController.js   # Task management logic
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── models/
│   │   ├── User.js             # User schema
│   │   └── Task.js             # Task schema
│   ├── routes/
│   │   ├── authRoutes.js       # Authentication endpoints
│   │   ├── userRoutes.js       # User management endpoints
│   │   └── taskRoutes.js       # Task management endpoints
│   ├── services/
│   │   ├── AuthenticationService.js  # Auth business logic
│   │   ├── UserService.js            # User business logic
│   │   └── TaskService.js            # Task business logic
│   ├── app.js                  # Express application setup
│   └── index.js                # Server entry point
├── .env                        # Environment variables
├── .gitignore                  # Git ignore rules
└── package.json               # Project dependencies
```

## Installation

1. **Clone or extract the project**
```bash
cd tasker
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup MongoDB**
   - Make sure MongoDB is running on your system
   - Update the `MONGODB_URI` in `.env` if needed (default: `mongodb://localhost:27017/tasker`)

4. **Configure environment variables**
   Edit the `.env` file and update:
   - `PORT`: Server port (default: 5000)
   - `MONGODB_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT (change in production)
   - `JWT_EXPIRE`: Token expiration time (default: 7d)

## Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/change-password` - Change password (requires authentication)

### User Endpoints (requires authentication)
- `GET /api/users` - Get all users
- `GET /api/users/profile` - Get current user profile
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user account

### Task Endpoints (requires authentication)
- `POST /api/tasks` - Create a new task
- `GET /api/tasks` - Get all tasks for current user
- `GET /api/tasks?status=pending` - Filter tasks by status
- `GET /api/tasks?priority=high` - Filter tasks by priority
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/complete` - Mark task as completed
- `GET /api/tasks/status/:status` - Get tasks by status
- `GET /api/tasks/priority/:priority` - Get tasks by priority

## Authentication

Use JWT tokens for protected endpoints:

```
Authorization: Bearer <your_jwt_token>
```

Add this header to all requests that require authentication.

## Example Usage

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project",
    "description": "Finish the tasker project",
    "priority": "high",
    "dueDate": "2026-03-15"
  }'
```

## Database Models

### User Model
- name (String, required)
- email (String, required, unique)
- password (String, required, hashed)
- phone (String, optional)
- role (String, enum: user/admin)
- isActive (Boolean, default: true)
- timestamps (createdAt, updatedAt)

### Task Model
- title (String, required)
- description (String, optional)
- status (String, enum: pending/in-progress/completed/cancelled)
- priority (String, enum: low/medium/high)
- dueDate (Date, optional)
- userId (ObjectId, reference to User)
- tags (Array of Strings)
- isCompleted (Boolean, default: false)
- timestamps (createdAt, updatedAt)

## Technologies Used

- **Node.js & Express.js**: Backend framework
- **MongoDB & Mongoose**: Database and ODM
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing
- **express-validator**: Input validation
- **dotenv**: Environment configuration

## Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Input validation and sanitization
- CORS enabled
- Environment variable configuration
- Role-based access control

## Future Enhancements

- Email notifications
- Task sharing and collaboration
- Task attachments
- User activity logging
- Advanced task filtering and search
- Task analytics and reports
- Reminder notifications
- Task categories/projects

## License

ISC

## Author

Your Name

---

For more information or issues, please check the project repository.
