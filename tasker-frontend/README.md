# Tasker Frontend - React Application

A modern, responsive React frontend for the Tasker task management application. Built with React 18, Axios, and React Router.

## Features

✨ **Authentication**
- User registration with validation
- User login with JWT tokens
- Secure token storage in localStorage
- Automatic redirect to login if unauthorized

📋 **Task Management**
- Create new tasks with title, description, priority, and due date
- View all tasks in a beautiful card layout
- Filter tasks by status (All, Pending, Completed)
- Mark tasks as completed
- Delete tasks
- Real-time task count badges

👤 **User Profile**
- Display user welcome message
- View user profile information
- Logout functionality

📱 **Responsive Design**
- Mobile-friendly layout
- Smooth animations and transitions
- Modern gradient background
- Clean and intuitive UI

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend server running on `http://localhost:5000`

### Setup

1. **Navigate to frontend directory:**
```bash
cd tasker-frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm start
```

The application will open at `http://localhost:3000` in your browser.

## Project Structure

```
tasker-frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── TaskList.js      # Display list of tasks
│   │   ├── TaskCard.js      # Individual task component
│   │   └── TaskForm.js      # Form to create new tasks
│   ├── pages/
│   │   ├── Login.js         # Login page
│   │   ├── Register.js      # Registration page
│   │   └── Dashboard.js     # Main task dashboard
│   ├── services/
│   │   └── api.js           # API client with axios
│   ├── styles/
│   │   ├── Auth.css         # Authentication pages styling
│   │   ├── Dashboard.css    # Dashboard styling
│   │   ├── TaskForm.css     # Task form styling
│   │   ├── TaskList.css     # Task list styling
│   │   └── TaskCard.css     # Task card styling
│   ├── App.js               # Main app component with routing
│   ├── App.css              # Global styles
│   └── index.js             # React entry point
├── package.json
└── README.md
```

## Usage

### Register a New Account

1. Click on the "Register here" link on the login page
2. Enter your full name, email, and password
3. Click "Register"
4. You'll be automatically logged in and directed to the dashboard

### Login

1. Enter your email and password
2. Click "Login"
3. You'll be directed to your task dashboard

### Create a Task

1. Click the "+ New Task" button on the dashboard
2. Fill in the task details:
   - **Title** (required): What needs to be done?
   - **Description** (optional): Add more details
   - **Priority**: Select Low, Medium, or High
   - **Due Date** (optional): Set a deadline
3. Click "Create Task"

### Manage Tasks

**Complete a Task:**
- Click the "✓ Complete" button on the task card

**Delete a Task:**
- Click the "🗑 Delete" button on the task card

**Filter Tasks:**
- Click filter buttons to view:
  - All Tasks: Show all your tasks
  - Pending: Show incomplete tasks
  - Completed: Show completed tasks

## API Integration

The frontend communicates with the backend API using Axios. All requests automatically include the JWT token in the Authorization header.

### Available API Endpoints

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

**Tasks:**
- `POST /api/tasks` - Create new task
- `GET /api/tasks` - Get all user tasks
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/complete` - Mark task complete

**Users:**
- `GET /api/users/profile` - Get current user profile

## Configuration

### API Base URL

The API base URL is configured in `src/services/api.js`:

```javascript
const API_URL = 'http://localhost:5000/api';
```

To change the backend URL, update this value.

## Styling

The application uses:
- **Gradient backgrounds**: Purple to violet gradient
- **Color scheme**:
  - Primary: #667eea (Purple)
  - Secondary: #764ba2 (Violet)
  - Success: #2ed573 (Green)
  - Error: #ff4757 (Red)
  - Warning: #ffa502 (Orange)

All styles are responsive and mobile-friendly.

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Environment Variables

Create a `.env` file if needed:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Troubleshooting

**Issue: "Route not found" errors**
- Ensure the backend server is running on `http://localhost:5000`
- Check that the API endpoints match the backend routes

**Issue: Cannot login**
- Verify credentials are correct
- Check backend is running and connected to MongoDB

**Issue: Tasks not loading**
- Check browser console for errors
- Verify token is stored in localStorage
- Ensure backend API is accessible

**Issue: Email is not being sent**
- Configure email settings in backend `.env` file
- Gmail requires App Password (not regular password)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Optimized component rendering with React hooks
- Efficient API calls with request/response handling
- Responsive images and lazy loading where applicable
- Minified CSS and JavaScript in production builds

## Security

- JWT tokens stored in localStorage
- CORS enabled for frontend-backend communication
- Input validation on forms
- Protected routes requiring authentication

## Technologies Used

- **React 18**: UI framework
- **React Router v6**: Client-side routing
- **Axios**: HTTP client for API calls
- **CSS3**: Styling and animations
- **JavaScript ES6+**: Modern JavaScript features

## Future Enhancements

- [ ] Dark mode toggle
- [ ] Drag-and-drop task organization
- [ ] Rich text editor for descriptions
- [ ] Task attachments
- [ ] Collaborative tasks/sharing
- [ ] Task categories/projects
- [ ] Advanced filtering and search
- [ ] Task analytics dashboard
- [ ] Offline support with service workers

## Contributing

Feel free to submit issues and enhancement requests!

## License

ISC

---

**Need Help?** Check the backend README or contact the development team!
