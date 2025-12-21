# Olym Pose - Production Deployment Guide

## Prerequisites

- Ubuntu 24.04 LTS server (tested on AWS EC2 t3.micro)
- Docker and Docker Compose installed
- Domain name or use sslip.io for testing
- GitHub account with access to GHCR

## Quick Start

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Clone Repository

```bash
cd ~
git clone https://github.com/atharvkhisti/olym-pose-app.git
cd olym-pose-app

# Pull LFS files (important for model files)
git lfs install
git lfs pull
```

### 3. Configure Environment

```bash
# Create .env file from example
cp .env.example .env

# Edit .env with your values
nano .env
```

Required environment variables:
```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generate-random-secret>
GOOGLE_CLIENT_ID=<your-google-oauth-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-secret>
MONGODB_URI=<your-mongodb-connection-string>
NEXT_PUBLIC_AI_SERVICE_URL=https://your-domain.com/api
APP_ENV=production
NEXT_PUBLIC_APP_NAME=Olym Pose
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### 4. Update Caddyfile

Edit the Caddyfile to use your domain:
```bash
nano Caddyfile
```

Replace `olympose.103-110-252-184.sslip.io` with your actual domain.

For sslip.io testing, use: `your-app.YOUR-IP.sslip.io`

### 5. Login to GitHub Container Registry

```bash
# Create GitHub Personal Access Token with read:packages permission
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### 6. Deploy

```bash
# Pull latest images
docker compose -f docker-compose.prod.yml -f docker-compose.prod.proxy.yml pull

# Start services
docker compose -f docker-compose.prod.yml -f docker-compose.prod.proxy.yml up -d

# Check status
docker compose -f docker-compose.prod.yml -f docker-compose.prod.proxy.yml ps

# View logs
docker compose -f docker-compose.prod.yml -f docker-compose.prod.proxy.yml logs -f
```

## Architecture

```
Internet → Caddy (Port 80/443)
    ↓
    ├─→ /api/* → AI Backend (Port 8001)
    └─→ /* → Next.js Frontend (Port 3000)
```

### Services

1. **Caddy** - Reverse proxy with automatic HTTPS
   - Handles SSL/TLS certificates via Let's Encrypt
   - Routes `/api/*` to AI backend
   - Routes everything else to frontend
   - Enables gzip/zstd compression

2. **Next.js Frontend (web)** - Port 3000
   - Server-side rendered React application
   - NextAuth for authentication
   - MongoDB for user data
   - Communicates with AI service through Caddy

3. **FastAPI Backend (ai)** - Port 8001
   - Exercise classification ML models
   - Rep counting logic
   - Health check endpoint

## Troubleshooting

### Check Container Status
```bash
docker compose -f docker-compose.prod.yml -f docker-compose.prod.proxy.yml ps
```

### View Logs
```bash
# All services
docker compose -f docker-compose.prod.yml -f docker-compose.prod.proxy.yml logs -f

# Specific service
docker logs olym-pose-caddy -f
docker logs olym-pose-web -f
docker logs olym-pose-ai -f
```

### Restart Services
```bash
docker compose -f docker-compose.prod.yml -f docker-compose.prod.proxy.yml restart

# Or restart specific service
docker compose -f docker-compose.prod.yml -f docker-compose.prod.proxy.yml restart web
```

### Test Endpoints
```bash
# Frontend health check
curl -I https://your-domain.com/api/health

# Backend health check (direct)
curl http://localhost:8001/health

# Frontend health check (direct)
curl http://localhost:3000/api/health
```

### Common Issues

#### 1. Caddy Fails to Start
- Check Caddyfile syntax: Look for errors in logs
- Ensure ports 80 and 443 are open in firewall/security group
- Verify domain DNS is pointing to your server

#### 2. AI Service Keeps Restarting
- Check model files are present: `ls -lh backend/ai/models/`
- Ensure Git LFS files were pulled correctly
- View logs: `docker logs olym-pose-ai`

#### 3. Frontend Can't Reach AI Service
- Verify `NEXT_PUBLIC_AI_SERVICE_URL` in .env points to your domain with `/api`
- Check Caddy is routing `/api/*` correctly
- Test direct backend: `curl http://localhost:8001/health`

#### 4. 502 Bad Gateway
- Check if upstream services are running
- Verify container networking
- Check service health: `docker compose ps`

## Updates

### Pull Latest Changes
```bash
cd ~/olym-pose-app
git pull
git lfs pull

# Pull new images
docker compose -f docker-compose.prod.yml -f docker-compose.prod.proxy.yml pull

# Recreate containers
docker compose -f docker-compose.prod.yml -f docker-compose.prod.proxy.yml up -d
```

### Rebuild Images Locally
If you need to rebuild from source:
```bash
# Build and push AI service
docker build -t ghcr.io/atharvkhisti/olym-pose-ai:latest -f docker/ai.Dockerfile .
docker push ghcr.io/atharvkhisti/olym-pose-ai:latest

# Build and push web service
docker build -t ghcr.io/atharvkhisti/olym-pose-web:latest -f docker/web.Dockerfile .
docker push ghcr.io/atharvkhisti/olym-pose-web:latest
```

## Security Considerations

1. **Environment Variables**: Never commit .env to version control
2. **Secrets**: Use strong, random secrets for NEXTAUTH_SECRET
3. **OAuth**: Configure authorized redirect URIs in Google Cloud Console
4. **MongoDB**: Use strong passwords and enable IP whitelisting
5. **Firewall**: Only open ports 80, 443, and 22 (SSH)
6. **Updates**: Regularly update system packages and Docker images

## Monitoring

### Check Resource Usage
```bash
docker stats
```

### View System Resources
```bash
free -h
df -h
top
```

### Enable Auto-restart
All services have `restart: unless-stopped` configured, so they'll restart automatically on failure or reboot.

## Backup

### Backup Data Volumes
```bash
# Backup Caddy certificates
docker run --rm -v olym-pose-app_caddy_data:/data -v $(pwd):/backup alpine tar czf /backup/caddy-data-backup.tar.gz -C /data .
```

### Backup MongoDB
Use MongoDB's native backup tools or MongoDB Atlas automated backups.

## Development

For local development, use the standard docker-compose:
```bash
docker compose up -d
```

This builds images locally and doesn't require GHCR login.

## Support

For issues, check:
- GitHub Issues: https://github.com/atharvkhisti/olym-pose-app/issues
- Logs: `docker compose logs -f`
- Documentation: This README and code comments
