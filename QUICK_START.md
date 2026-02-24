# 🚀 Tasker - Quick Start Guide

## One-Line Deploy

```bash
docker-compose up --build
```

That's it! Your application is now running at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

---

## System Requirements

- Docker Desktop (Windows/Mac) or Docker + Docker Compose (Linux)
- 2GB RAM available
- Ports 3000 and 5000 free
- Stable internet connection (for MongoDB Atlas)

---

## 5-Minute Setup

### 1. Download/Extract Project
```bash
cd "Project 1Micro"
```

### 2. Create Environment File
Copy `.env.example` to `.env`:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Linux/macOS (Terminal):**
```bash
cp .env.example .env
```

### 3. Update .env (Optional)
Edit `.env` if you have custom MongoDB or email settings. Default values work for testing.

### 4. Start Everything
```bash
docker-compose up --build
```

### 5. Test Application
Open browser and go to: http://localhost:3000

---

## Default Test Credentials

**Email:** test@example.com  
**Password:** Test123!

Or create a new account by clicking "Register".

---

## What's Running?

When you see this in terminal, everything is working ✅

```
backend_1   | Server running on port 5000
frontend_1  | Compiled successfully!
```

---

## Common Tasks

### Stop Everything
Press `Ctrl+C` in terminal, or use:
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### View Only Backend Logs
```bash
docker-compose logs -f backend
```

### View Only Frontend Logs
```bash
docker-compose logs -f frontend
```

### Restart Services
```bash
docker-compose restart
```

---

## Using the Docker Manager Script (Windows)

**Easier alternative to command line:**

```bash
docker-manager.bat
```

A menu will appear with these options:
1. **Start with rebuild** - Full fresh start
2. **Start without rebuild** - Quick start (services run in background)
3. **Stop services** - Clean shutdown
4. **View logs** - Monitor what's happening
5. **Other utilities** - Cleanup, rebuild, etc.

---

## Using the Docker Manager Script (Linux/macOS)

```bash
chmod +x docker-manager.sh
./docker-manager.sh
```

Same menu as Windows batch script with interactive options.

---

## Features Available After Startup

✅ **User Management**
- Register new account
- Login with email/password
- View profile

✅ **Task Management**
- Create new tasks
- Mark tasks complete
- Delete tasks
- Filter by status (All/Pending/Completed)

✅ **Chatbot Assistant**
- Click the chat bubble (bottom right)
- Ask "help" for commands
- Examples:
  - "show my tasks"
  - "create a task"
  - "task summary"
  - "hello"

✅ **Email Notifications** (if configured)
- Welcome email on signup
- Task notifications
- Password reset emails

---

## Troubleshooting

### "Cannot connect to Docker daemon"
**Problem:** Docker Desktop isn't running  
**Solution:** Open Docker Desktop application

### "Port 3000/5000 already in use"
**Problem:** Another application using the port  
**Solution:** Kill the process using the port

**Windows (find & kill):**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Linux/macOS (find & kill):**
```bash
lsof -i :3000
kill -9 <PID>
```

### "Connection refused to database"
**Problem:** MongoDB Atlas credentials invalid  
**Solution:** Update .env with correct connection string

### "Frontend shows blank page"
**Problem:** Frontend didn't compile  
**Solution:** Check logs with `docker-compose logs frontend`

### "Tasks not saving"
**Problem:** Backend connection issue  
**Solution:** Check logs with `docker-compose logs backend`

---

## Performance Tips

### Run Services in Background
```bash
docker-compose up -d
```

Check status anytime with:
```bash
docker-compose ps
```

### Reduce Memory Usage
Edit `docker-compose.yml` and add resource limits:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
  frontend:
    deploy:
      resources:
        limits:
          memory: 256M
```

### Clear Old Containers (free disk space)
```bash
docker-compose down -v
```

---

## Next Steps

1. ✅ **Get running**: `docker-compose up --build`
2. ✅ **Test features**: Register, create tasks, try chatbot
3. ✅ **Explore logs**: Monitor what's happening
4. ✅ **Scale up**: Deploy to cloud (see DOCKER_GUIDE.md)

---

## File Structure

```
Project 1Micro/
├── docker-compose.yml (orchestration config)
├── .env.example (template)
├── docker-manager.bat (Windows menu)
├── docker-manager.sh (Linux/macOS menu)
├── DOCKER_GUIDE.md (detailed guide)
├── DOCKER_CHECKLIST.md (complete checklist)
├── tasker/ (backend)
│   ├── Dockerfile
│   ├── package.json
│   └── src/
└── tasker-frontend/ (frontend)
    ├── Dockerfile
    ├── package.json
    └── src/
```

---

## Documentation References

| Document | Purpose |
|----------|---------|
| DOCKER_GUIDE.md | Complete Docker documentation |
| DOCKER_CHECKLIST.md | Step-by-step setup checklist |
| DOCKER_QUICK_REFERENCE.md | Command cheat sheet |
| DOCKER_SETUP_SUMMARY.md | Architecture overview |
| SETUP_GUIDE.md | Original setup documentation |
| EMAIL_SETUP.md | Email configuration guide |
| CHATBOT_GUIDE.md | Chatbot features and examples |

---

## Cloud Deployment

Ready to deploy to the cloud? See **DOCKER_GUIDE.md** for:
- Docker Hub deployment
- AWS ECS setup
- Heroku deployment
- DigitalOcean App Platform
- Azure Container Instances
- And more!

---

## Support

If something doesn't work:

1. **Check logs:** `docker-compose logs -f`
2. **Verify .env:** Make sure `.env` file exists and has values
3. **Check ports:** Ensure 3000 and 5000 are free
4. **Restart:** `docker-compose down` then `docker-compose up --build`
5. **See detailed docs:** DOCKER_CHECKLIST.md has full troubleshooting

---

## That's It! 🎉

Your Tasker application is now running with Docker!

**Happy tasking!** ✨

---

_Created with docker-compose. Production-ready. Fully documented._
