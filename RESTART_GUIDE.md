# Application Restart Guide

This guide explains how to restart the Eburon AI chatbot application across different deployment methods.

## Quick Restart

The easiest way to restart the application is using the provided restart script:

```bash
# Using npm
npm run restart

# Or directly
bash scripts/restart-app.sh
```

This script automatically detects your deployment method and restarts accordingly.

---

## Restart Methods by Deployment Type

### 1. PM2 (Recommended for Production)

PM2 is the recommended process manager for production deployments.

**Start the application:**
```bash
pm2 start ecosystem.config.js
```

**Restart the application:**
```bash
# Restart specific app
pm2 restart eburon-ai

# Or use the automated script
npm run restart
```

**Other useful PM2 commands:**
```bash
# Stop the application
pm2 stop eburon-ai

# View logs
pm2 logs eburon-ai

# Monitor in real-time
pm2 monit

# Check status
pm2 status

# Reload with zero-downtime
pm2 reload eburon-ai

# Delete from PM2 list
pm2 delete eburon-ai
```

**Setup PM2 to start on system boot:**
```bash
pm2 startup systemd
pm2 save
```

---

### 2. Docker Compose

If you're using Docker Compose for deployment:

**Restart the application:**
```bash
# Restart specific service
docker-compose restart app

# Or restart all services
docker-compose restart

# Or use the automated script
npm run restart
```

**Other useful Docker Compose commands:**
```bash
# Stop the application
docker-compose stop app

# Start the application
docker-compose start app

# Stop and remove containers
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# View logs
docker-compose logs -f app
```

---

### 3. Docker (Direct)

If you're using Docker directly without Compose:

**Restart the application:**
```bash
# Find container name
docker ps

# Restart container
docker restart hyperfocus-app

# Or use the automated script
npm run restart
```

**Other useful Docker commands:**
```bash
# Stop container
docker stop hyperfocus-app

# Start container
docker start hyperfocus-app

# View logs
docker logs -f hyperfocus-app

# Remove and recreate
docker stop hyperfocus-app
docker rm hyperfocus-app
docker run -d --name hyperfocus-app -p 3000:3000 your-image-name
```

---

### 4. Direct Next.js (Development)

For development or direct Next.js deployment:

**Development mode:**
```bash
# Stop with Ctrl+C, then:
npm run dev
```

**Production mode:**
```bash
# Find and stop the process
pkill -f "next start"

# Start again
npm start

# Or use the automated script (if process is running)
npm run restart
```

---

## Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

```bash
# Find process using the port (e.g., 3000)
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or kill all Next.js processes
pkill -f "next"
```

### Application Won't Start

1. **Check if dependencies are installed:**
```bash
npm install
# or
pnpm install
```

2. **Check if the build is successful:**
```bash
npm run build
```

3. **Check environment variables:**
```bash
# Ensure .env or .env.local exists with required variables
cat .env.local
```

4. **Check logs:**
```bash
# PM2
pm2 logs eburon-ai

# Docker Compose
docker-compose logs -f app

# Docker
docker logs -f hyperfocus-app
```

### Database Connection Issues

```bash
# Test database connection
npx prisma db pull

# Generate Prisma client
npx prisma generate

# Check database migrations
npx prisma migrate status
```

### High Memory Usage

```bash
# With PM2, restart with memory limit
pm2 restart eburon-ai --max-memory-restart 2G

# With Docker, limit memory in docker-compose.yml
services:
  app:
    mem_limit: 2g
```

---

## Graceful Restart

For zero-downtime restarts (PM2 only):

```bash
pm2 reload eburon-ai
```

This performs a graceful restart where:
1. New instance is started
2. New instance becomes ready
3. Old instance receives termination signal
4. Old instance completes pending requests
5. Old instance shuts down

---

## Automated Restart on Code Changes

### Development (Hot Reload)
```bash
npm run dev
# Automatically restarts on file changes
```

### Production with PM2 (Watch Mode - Not Recommended)
```bash
pm2 start ecosystem.config.js --watch
# Restarts on file changes (only for testing)
```

---

## Health Check

After restarting, verify the application is running:

```bash
# Check health endpoint
curl http://localhost:3000/api/health

# Or with custom port
curl http://localhost:3399/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-19T23:35:00.000Z"
}
```

---

## Scheduled Restarts

To schedule automatic restarts (e.g., daily at 3 AM):

### Using Cron with PM2
```bash
# Edit crontab
crontab -e

# Add line for daily 3 AM restart
0 3 * * * pm2 restart eburon-ai
```

### Using Cron with Docker Compose
```bash
# Edit crontab
crontab -e

# Add line for daily 3 AM restart
0 3 * * * cd /opt/eburon-ai && docker-compose restart app
```

---

## Quick Reference

| Action | Command |
|--------|---------|
| Automated Restart | `npm run restart` |
| PM2 Restart | `pm2 restart eburon-ai` |
| Docker Compose Restart | `docker-compose restart app` |
| Docker Restart | `docker restart hyperfocus-app` |
| Next.js Dev | `npm run dev` |
| Next.js Prod | `npm start` |
| View Logs (PM2) | `pm2 logs eburon-ai` |
| View Logs (Docker) | `docker-compose logs -f app` |
| Health Check | `curl http://localhost:3000/api/health` |

---

## Support

For more information, see:
- [VPS Deployment Guide](./VPS_DEPLOYMENT_GUIDE.md)
- [Setup Instructions](./SETUP_INSTRUCTIONS.md)
- [README](./README.md)

If issues persist, check the GitHub repository for known issues or create a new issue.
