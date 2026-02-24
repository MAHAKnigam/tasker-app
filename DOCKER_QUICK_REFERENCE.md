# 🐳 Docker Quick Reference

## One-Command Setup

```bash
cd "c:\Users\Lenovo\Desktop\Project 1Micro"
docker-compose up --build
```

Then visit:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Essential Commands

| Command | Purpose |
|---------|---------|
| `docker-compose up --build` | Build and start all services |
| `docker-compose up -d` | Start in background |
| `docker-compose down` | Stop all services |
| `docker-compose logs -f` | View live logs |
| `docker-compose ps` | List running containers |
| `docker-compose logs backend` | View backend logs only |
| `docker-compose exec backend sh` | SSH into backend |

## Environment Variables (.env file)

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

## Troubleshooting

**Ports in use?**
```bash
docker-compose down
docker system prune -a
```

**Services not starting?**
```bash
docker-compose logs
```

**Rebuild everything?**
```bash
docker-compose down -v
docker-compose up --build
```

---

See `DOCKER_GUIDE.md` for complete documentation.
