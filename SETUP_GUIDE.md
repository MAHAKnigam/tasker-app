# Complete Tasker Setup & Deployment Guide

This guide covers everything needed to run both the **Backend API** and **React Frontend** for the Tasker application.

## 📁 Project Structure

```
Project 1Micro/
├── tasker/                 # Backend (Node.js/Express API)
│   ├── src/
│   ├── package.json
│   ├── .env
│   └── README.md
└── tasker-frontend/        # Frontend (React)
    ├── src/
    ├── public/
    ├── package.json
    └── README.md
```

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js v14+
- npm or yarn
- MongoDB Atlas account (we're using cloud)
- Email account for notifications (Gmail recommended)

### Terminal 1: Start Backend

```powershell
cd 'c:\Users\Lenovo\Desktop\Project 1Micro\tasker'
npm install
npm start
```

Expected output:
```
MongoDB Connected: cluster03.nm2ebgb.mongodb.net
Server running on port 5000
Environment: development
```

### Terminal 2: Start Frontend

```powershell
cd 'c:\Users\Lenovo\Desktop\Project 1Micro\tasker-frontend'
npm install
npm start
```

Expected output:
```
Compiled successfully!
Local: http://localhost:3000
```

**✅ Application is now running!**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: Cloud (Atlas)

---

## 📝 Configuration

### Backend Setup (`.env` file)

Navigate to `tasker/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://tasker_user:3J4aDyhKmPL2Rf@cluster03.nm2ebgb.mongodb.net/tasker?retryWrites=true&w=majority&appName=Cluster03
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development

# Email Configuration (Gmail Example)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

**Get Gmail App Password:**
1. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select Mail and Windows Computer
3. Generate password and copy it
4. Paste in `.env` as EMAIL_PASSWORD

---

## 🎯 Testing the Application

### 1. Register a User

**Frontend:**
1. Open http://localhost:3000
2. Click "Register here"
3. Fill in: Name, Email, Password
4. Click "Register"
5. You're logged in! ✅
6. Check email for Welcome message

**Backend (PowerShell):**
```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" `
  -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
```

### 2. Create a Task

**Frontend:**
1. Click "+ New Task"
2. Enter title, description, priority, due date
3. Click "Create Task"
4. Task appears in dashboard
5. Check email for Task Created notification

### 3. Filter Tasks

**Frontend:**
- Click "Pending" to show incomplete tasks
- Click "Completed" to show done tasks
- Click "All Tasks" to show everything

### 4. Complete a Task

**Frontend:**
1. Click "✓ Complete" on any task
2. Task moves to completed
3. Check email for Completion notification

### 5. Delete a Task

**Frontend:**
1. Click "🗑 Delete" on any task
2. Task is removed
3. Check email for Deletion notification

---

## 🔧 Troubleshooting

### Frontend won't start
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
Remove-Item -Recurse node_modules
npm install

# Try again
npm start
```

### Backend won't connect to MongoDB
- Check MongoDB Atlas connection string in `.env`
- Verify IP address is whitelisted in Network Access
- Test connection with: `Test Connection` button on Atlas

### Emails not sending
- Verify Gmail App Password (not regular password)
- Check EMAIL_USER and EMAIL_PASSWORD in `.env`
- Look for error in backend console
- Check spam/junk folder
- See EMAIL_SETUP.md for detailed instructions

### Port already in use
```powershell
# Find process using port 5000 (backend)
netstat -ano | findstr :5000

# Find process using port 3000 (frontend)
netstat -ano | findstr :3000

# Kill process (replace PID with process ID)
taskkill /PID <PID> /F
```

### Clear frontend cache
```powershell
# Delete build folder
Remove-Item -Recurse build

# Clear browser cache
# Or use: Ctrl+Shift+Delete in Chrome
```

---

## 📊 API Endpoints Reference

All protected endpoints require:
```
Authorization: Bearer <your_jwt_token>
```

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Change password

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks?status=pending` - Filter by status
- `GET /api/tasks?priority=high` - Filter by priority
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/complete` - Mark complete

### Users
- `GET /api/users/profile` - Get your profile
- `PUT /api/users/:id` - Update profile
- `GET /api/users` - Get all users (admin)

---

## 📱 Frontend Features

✨ **User Authentication**
- Register with validation
- Login with JWT
- Auto-logout on token expiry
- Secure token storage

📋 **Task Management**
- Create tasks with metadata
- View tasks in card layout
- Filter by status
- Complete tasks
- Delete tasks
- Real-time updates

📱 **Responsive Design**
- Mobile-friendly
- Tablet friendly
- Desktop optimized
- Smooth animations

---

## 🔒 Backend Features

🛡️ **Security**
- Password hashing with bcryptjs
- JWT authentication
- Input validation
- CORS enabled
- Environment variable configuration

📧 **Email Notifications**
- Welcome emails
- Task notifications
- Password reset emails
- Daily summaries

📊 **Database**
- MongoDB Atlas (Cloud)
- User authentication
- Task management
- Timestamps

---

## 🚢 Deployment

### Deploy Backend to Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create tasker-api`
4. Set environment variables:
   ```
   heroku config:set MONGODB_URI=<your_uri>
   heroku config:set JWT_SECRET=<your_secret>
   heroku config:set EMAIL_USER=<your_email>
   heroku config:set EMAIL_PASSWORD=<your_app_password>
   ```
5. Deploy:
   ```
   git push heroku main
   ```

### Deploy Frontend to Netlify

1. Build: `npm run build`
2. Drag `build` folder to [netlify.com](https://netlify.com)
3. Or use Netlify CLI:
   ```
   npm install -g netlify-cli
   netlify deploy --prod --dir=build
   ```

---

## 📚 Documentation

- [Backend README](tasker/README.md) - API documentation
- [Frontend README](tasker-frontend/README.md) - React app details
- [Email Setup Guide](tasker/EMAIL_SETUP.md) - Email configuration

---

## 🎓 Learning Resources

- **Node.js/Express**: https://expressjs.com/
- **React**: https://react.dev/
- **MongoDB**: https://docs.mongodb.com/
- **JWT**: https://jwt.io/
- **Nodemailer**: https://nodemailer.com/

---

## 🤝 Support

**Having issues?**

1. Check error messages in console
2. Review troubleshooting section above
3. Check documentation files
4. Verify all services are running:
   - Backend on port 5000
   - Frontend on port 3000
   - MongoDB Atlas connected
   - Email service configured

---

## ✅ Checklist

Before going to production:

- [ ] Backend running and responding to requests
- [ ] Frontend loading at localhost:3000
- [ ] Register/Login working
- [ ] Can create tasks
- [ ] Can complete tasks
- [ ] Can delete tasks
- [ ] Emails being sent (check email)
- [ ] Filters working correctly
- [ ] Profile page loading
- [ ] Logout working
- [ ] All error messages displaying

---

**🎉 You're all set! Start creating tasks!**

---

## Quick Commands

```powershell
# Backend
cd 'c:\Users\Lenovo\Desktop\Project 1Micro\tasker'
npm start                    # Start server
npm run dev                  # Start with auto-reload (nodemon)
npm install                  # Install dependencies

# Frontend
cd 'c:\Users\Lenovo\Desktop\Project 1Micro\tasker-frontend'
npm start                    # Start dev server
npm run build               # Build for production
npm install                 # Install dependencies

# Testing
npm test                     # Run tests
npm run build               # Create production build
```

---

**Last Updated:** February 23, 2026

Version: 1.0.0
