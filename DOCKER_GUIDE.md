# 🐳 Docker Setup & Deployment Guide

This guide explains how to build and run the Tasker application using Docker and Docker Compose.

## Prerequisites

- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: [Install Docker Compose](https://docs.docker.com/compose/install/)
- **MongoDB Atlas Account**: For database (or use local MongoDB)

## 📁 Docker Structure

```
Project 1Micro/
├── docker-compose.yml          # Main orchestration file
├── tasker/                      # Backend service
│   ├── Dockerfile              # Backend image definition
│   └── .dockerignore           # Files to exclude from build
└── tasker-frontend/            # Frontend service
    ├── Dockerfile              # Frontend image definition
    └── .dockerignore           # Files to exclude from build
```

## 🚀 Quick Start (Recommended)

### Option 1: Build & Run with Docker Compose (Single Command)

```bash
# Navigate to project root
cd "c:\Users\Lenovo\Desktop\Project 1Micro"

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### Option 2: Run Existing Images

```bash
# Start services without rebuilding
docker-compose up

# Stop services
docker-compose down
```

### Option 3: Run in Background

```bash
# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🏗️ Building Individual Components

### Backend Service Only

```bash
cd tasker

# Build image
docker build -t tasker-backend:latest .

# Run container
docker run -it -p 5000:5000 \
  -e MONGODB_URI="mongodb+srv://tasker_user:3J4aDyhKmPL2Rf@cluster03.nm2ebgb.mongodb.net/tasker?retryWrites=true&w=majority&appName=Cluster03" \
  -e JWT_SECRET="your_secret_key" \
  tasker-backend:latest
```

### Frontend Service Only

```bash
cd tasker-frontend

# Build image
docker build -t tasker-frontend:latest .

# Run container
docker run -it -p 3000:3000 \
  -e REACT_APP_API_URL="http://localhost:5000" \
  tasker-frontend:latest
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root to customize settings:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://tasker_user:3J4aDyhKmPL2Rf@cluster03.nm2ebgb.mongodb.net/tasker?retryWrites=true&w=majority&appName=Cluster03

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Node Environment
NODE_ENV=production

# Port Configuration (optional)
PORT=5000
REACT_APP_API_URL=http://localhost:5000
```

## 📊 Docker Compose Services

### Backend Service (`tasker`)
- **Image**: Built from `tasker/Dockerfile`
- **Port**: 5000
- **Health Check**: Every 30 seconds
- **Restart Policy**: Unless stopped
- **Network**: tasker-network
- **Dependencies**: MongoDB Atlas (external)

### Frontend Service (`tasker-frontend`)
- **Image**: Built from `tasker-frontend/Dockerfile`
- **Port**: 3000
- **Health Check**: Every 30 seconds
- **Restart Policy**: Unless stopped
- **Network**: tasker-network
- **Depends On**: backend service

## 🔍 Useful Docker Commands

### View Running Containers
```bash
docker-compose ps
```

### View Container Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend

# Follow logs (real-time)
docker-compose logs -f
```

### Access Container Shell
```bash
# Backend container
docker-compose exec backend sh

# Frontend container
docker-compose exec frontend sh
```

### Rebuild Services
```bash
# Rebuild and restart all services
docker-compose up --build

# Rebuild specific service
docker-compose build backend
docker-compose up backend
```

### Clean Up
```bash
# Stop and remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Remove all Docker resources
docker system prune -a
```

## 📈 Image Optimization

Both Dockerfiles use **multi-stage builds** for minimal image sizes:

### Backend Optimization
- Uses `node:22-alpine` (small base image)
- Only installs production dependencies
- Non-root user for security
- Minimal final image size (~150-200MB)

### Frontend Optimization
- Builds React app in builder stage
- Serves optimized build artifacts
- Uses `serve` for production serving
- Minimal final image size (~200-250MB)

## 🔒 Security Best Practices Implemented

✅ **Non-root Users**: Containers run as non-root user
✅ **Health Checks**: Services verify health regularly
✅ **Signal Handling**: dumb-init properly handles signals
✅ **Environment Variables**: Sensitive data via env files
✅ **Image Layers**: Multi-stage builds minimize attack surface
✅ **Resource Limits**: Can be added to docker-compose.yml

## 🐛 Troubleshooting

### Port Already In Use
```bash
# Find process using port
netstat -ano | findstr ":5000"

# Kill process
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
```

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Verify MongoDB connection
# Ensure MONGODB_URI is correct in .env
```

### Frontend Can't Connect to Backend
```bash
# Ensure both services are on same network
# Services communicate as: http://backend:5000
# From host: http://localhost:5000
```

### Rebuild Everything from Scratch
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## 📦 Pushing to Docker Registry

### Push to Docker Hub
```bash
# Login
docker login

# Tag images
docker tag tasker-backend:latest your-username/tasker-backend:latest
docker tag tasker-frontend:latest your-username/tasker-frontend:latest

# Push
docker push your-username/tasker-backend:latest
docker push your-username/tasker-frontend:latest
```

### Using with Docker Compose
Update `docker-compose.yml`:
```yaml
services:
  backend:
    image: your-username/tasker-backend:latest
    
  frontend:
    image: your-username/tasker-frontend:latest
```

## 🚀 Production Deployment

### Using with Kubernetes
1. Build and push images to registry
2. Create Kubernetes manifests from docker-compose.yml
3. Deploy using `kubectl apply`

### Using with Heroku, AWS, or Azure
1. Push images to container registry
2. Deploy using platform-specific commands
3. Set environment variables in platform console

### Using with DigitalOcean App Platform
1. Connect GitHub repository
2. Create app spec from docker-compose.yml
3. Deploy directly

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://docs.docker.com/language/nodejs/)
- [React Docker Best Practices](https://react.dev/learn/deployment)

## ✅ Verification Checklist

After starting containers, verify:

- [ ] Backend health check: `curl http://localhost:5000/api/health`
- [ ] Frontend accessible: Visit `http://localhost:3000`
- [ ] Can register account
- [ ] Can create/view tasks
- [ ] Chatbot responds
- [ ] Both containers in `docker-compose ps`
- [ ] No errors in logs

## 🆘 Getting Help

If you encounter issues:

1. Check container logs: `docker-compose logs`
2. Verify environment variables: `docker-compose config`
3. Test individual services: Start backend, then frontend
4. Rebuild from scratch: `docker-compose down -v && docker-compose up --build`

---

**Happy containerizing!** 🐳✨
