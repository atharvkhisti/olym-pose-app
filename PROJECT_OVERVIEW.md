# Olym Pose - Project Overview & DevOps Implementation

## 📋 Project Description

**Olym Pose** is a fitness application that uses AI-powered pose detection to help users track their workout form and progress. The project combines:
- **Frontend**: Next.js web application with user authentication
- **Backend**: FastAPI-based AI service for pose detection
- **Infrastructure**: Docker containerized, deployed on AWS EC2
- **DevOps**: GitHub Actions CI/CD pipeline for automated deployment

---

## 🏗️ Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    User's Browser                            │
│                                                               │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS
                   ▼
┌──────────────────────────────────────────────────────────────┐
│           AWS EC2 Instance (t3.micro)                        │
│           IP: 65.1.94.87                                   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Caddy Reverse Proxy (Port 443/80)                     │ │
│  │  - HTTPS with auto Let's Encrypt                       │ │
│  │  - Domain: olympose.13-233-133-240.sslip.io           │ │
│  │  - Routes traffic to services                          │ │
│  └────────────────────────────────────────────────────────┘ │
│         ▲              ▲                                     │
│         │ /           │ /api                                │
│         │             │                                     │
│  ┌──────┴─────────┐  ┌───────────────────┐               │
│  │  Web Service   │  │   AI Service      │               │
│  │  (Next.js)     │  │  (FastAPI)        │               │
│  │  Port 3000     │  │  Port 8001        │               │
│  │                │  │                   │               │
│  │ ├─ Auth pages  │  │ ├─ /health        │               │
│  │ ├─ Dashboard   │  │ ├─ /pose-detect   │               │
│  │ ├─ Workout UI  │  │ └─ /models        │               │
│  │ └─ API routes  │  │                   │               │
│  └────────────────┘  └───────────────────┘               │
│         ▲                     ▲                            │
│         │                     │                            │
│  ┌──────┴─────────────────────┴──────────────────────┐   │
│  │      MongoDB Atlas (Cloud)                        │   │
│  │ - User accounts                                   │   │
│  │ - Workout history                                 │   │
│  │ - Authentication tokens                           │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘

                GitHub ↔ GitHub Actions (CI/CD)
                (automated builds & deploys)
```

---

## 🔐 Authentication System

### Overview
Implemented **dual authentication** system using NextAuth v5:

#### 1. **Google OAuth**
- **Flow**: User clicks "Sign in with Google" → Redirected to Google → Returns with auth token
- **Auto-User Creation**: First-time Google login automatically creates user in MongoDB
- **Implementation**: 
  - Google provider in `lib/auth.edge.ts`
  - `signIn` callback creates user if doesn't exist
  - Located in `lib/auth.config.ts` (Node.js runtime)

#### 2. **Email/Password Credentials**
- **Registration**: Users create account at `/register` with name, email, password
- **Password Security**: Hashed with bcrypt (12 salt rounds)
- **Storage**: User data stored in MongoDB Atlas
- **Implementation**:
  - Credentials provider in `lib/auth.config.ts`
  - Registration API at `app/api/register/route.ts`
  - LoginForm and RegisterForm components

### Authentication Flow

```
User visits /login
        ▼
┌─────────────────────────────────┐
│  Choose authentication method    │
│                                 │
│  [Email/Password] [Google OAuth]│
└──────────┬──────────┬───────────┘
           │          │
      Form │          │ OAuth Flow
           ▼          ▼
    POST /api/        Google
    register          Servers
           │          │
           ├─ Validate ├─ Redirect
           │ Create     │ Get Token
           │ User       │
           └───┬────────┘
               │
          NextAuth JWT
               │
               ▼
          Set Session Cookie
               │
               ▼
          Redirect to /dashboard
```

### Key Files
- **Auth Configuration**: `lib/auth.edge.ts` (Edge Runtime - Google only)
- **Full Auth Config**: `lib/auth.config.ts` (Node.js Runtime - both methods)
- **Registration API**: `app/api/register/route.ts`
- **Login Form**: `components/auth/LoginForm.tsx`
- **Register Form**: `components/auth/RegisterForm.tsx`
- **Database Model**: `models/User.ts` (Mongoose schema)

---

## 📦 Docker Setup

### Multi-Container Architecture

Three services running in Docker:

#### 1. **Web Service** (Next.js Frontend)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY frontend/web .
RUN npm ci
RUN npm run build
CMD ["npm", "start"]
PORT: 3000
```

**What it does:**
- Serves Next.js application
- Handles user authentication
- Provides API routes for registration, health checks
- Uses NextAuth for session management

#### 2. **AI Service** (FastAPI Backend)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/ai .
RUN pip install -r requirements.txt
CMD ["python", "main.py"]
PORT: 8001
```

**What it does:**
- Loads pose detection ML models
- Processes video frames for pose estimation
- Returns detected poses and rep counts
- Health check endpoint

#### 3. **Caddy Reverse Proxy**
```
Configuration: Caddyfile
Domains:
  - olympose.13-233-133-240.sslip.io (main site)
  - email.olympose.13-233-133-240.sslip.io (admin)

Features:
  - Automatic HTTPS (Let's Encrypt)
  - Load balancing between services
  - Reverse proxy routing
```

### Docker Compose

**Production Setup**: `docker-compose.prod.yml`

```yaml
Services:
  - web: Next.js application (port 3000)
  - ai: FastAPI service (port 8001)
  - caddy: Reverse proxy (ports 80, 443)

Networks:
  - olym-pose-network (internal communication)

Volumes:
  - Persistent storage for models
```

---

## 🚀 DevOps Implementation

### Before vs After

#### ❌ **Manual Deployment (Before)**
```
Developer Action Timeline:
1. Make code changes locally (1 min)
2. Commit and push to GitHub (1 min)
3. Build Docker images (15 min)
   - docker build -f docker/web.Dockerfile
   - docker build -f docker/ai.Dockerfile
4. Push to ghcr.io (5 min)
5. SSH to EC2 (manual)
6. Pull images (5 min)
7. Restart containers (2 min)

Total Time: ~30 minutes
Status: Manual, error-prone, ties up developer
```

#### ✅ **Automated Deployment (Now with GitHub Actions)**
```
Developer Action:
1. Make code changes locally
2. git push origin main

GitHub Actions Automation:
1. Checkout code (automatic)
2. Build Web image (parallel, 5 min)
3. Build AI image (parallel, 5 min)
4. Push both images to ghcr.io (2 min)
5. SSH to EC2 (automatic)
6. Pull and restart containers (3 min)
7. Run health checks (automatic)

Total Time: ~10 minutes (no developer action needed)
Status: Fully automated, consistent, transparent
```

### GitHub Actions Workflow

**File**: `.github/workflows/deploy.yml`

**Triggers**: 
- Automatic on push to `main` branch
- Manual via "Run workflow" button

**Steps**:

1. **Setup**
   - Check out code from GitHub
   - Set up Docker Buildx (efficient building)
   - Login to GitHub Container Registry

2. **Build Web Image**
   - Build Next.js application
   - Cache layers for faster rebuilds
   - Tag with commit hash and "latest"

3. **Build AI Image**
   - Build FastAPI application
   - Cache Python dependencies
   - Tag with commit hash and "latest"

4. **Push Images**
   - Upload to ghcr.io (GitHub Container Registry)
   - Makes images available for EC2 to pull

5. **Deploy to EC2**
   - SSH to EC2 using stored SSH key
   - Run `docker compose pull` (download new images)
   - Run `docker compose up -d` (restart containers)
   - Show running containers status

6. **Health Check**
   - Wait 15 seconds for services to start
   - Curl /api/health endpoints
   - Verify site is responsive

### GitHub Secrets Configuration

Required secrets stored in GitHub:

1. **`EC2_SSH_KEY`**
   - Private SSH key for EC2 authentication
   - Allows GitHub Actions to connect to EC2
   - Stored securely, never exposed

2. **`EC2_HOST`**
   - EC2 instance IP: `65.1.94.87`
   - Target for automated SSH deployment

### Benefits of GitHub Actions

✅ **No EC2 Resource Usage**: Builds run on GitHub servers (free for public repos)
✅ **Parallel Builds**: Web and AI images build simultaneously
✅ **Layer Caching**: Only rebuilds changed layers (fast iteration)
✅ **Transparent**: Full logs visible in GitHub UI
✅ **Automatic**: Triggers on every push, no manual intervention
✅ **Secure**: Secrets stored securely, never exposed in logs
✅ **History**: Complete deployment history in GitHub

---

## 📊 Complete Project Timeline & Changes

### Week 1: Production Issues & Fixes

#### Issue 1: EC2 Instance Became Unreachable
- **Problem**: Instance status checks failed after Dec 24 outage
- **Root Cause**: t3.micro instance froze or crashed
- **Solution**: Stop/Start instance in AWS Console
- **Side Effect**: Public IP changed from 43.204.228.125 to 13.233.133.240, then to 65.1.94.87

#### Changes Made:
1. **Caddyfile** - Updated domain and reverse proxy
2. **Environment Configuration** - Updated NEXTAUTH_URL to new IP
3. **Google OAuth** - Added new redirect URI to Google Cloud Console

### Week 2: Authentication Implementation

#### Issue 2: Google OAuth "redirect_uri_mismatch"
- **Root Cause**: Google Cloud Console had old IP in authorized URIs
- **Solution**: Added new IP to allowed redirect URIs

#### User Request: "Add direct sign-in with credentials"
- **Implementation**: Added email/password authentication alongside Google OAuth

#### Files Created:
1. **`lib/auth.edge.ts`** (Edge Runtime - Google OAuth only)
   - Google provider configuration
   - Session/JWT callbacks
   - Route authorization checks

2. **`lib/auth.config.ts`** (Node.js Runtime - Full Auth)
   - Added Credentials provider
   - MongoDB user lookup and password verification
   - Auto-create users for Google OAuth
   - Environment variable configuration

3. **`app/api/register/route.ts`** (Registration API)
   - POST endpoint for user registration
   - Email validation and duplicate checking
   - bcrypt password hashing (12 rounds)
   - Error handling and logging

4. **`components/auth/LoginForm.tsx`** (Updated)
   - Email/password form fields
   - Form submission handler
   - Google OAuth button as secondary option
   - Error messages and loading states

5. **`components/auth/RegisterForm.tsx`** (Updated)
   - Full name, email, password fields
   - Password confirmation validation
   - Auto sign-in after successful registration
   - Google OAuth signup option

#### Key Technical Decision: Edge Runtime vs Node.js Runtime
- **Problem**: Mongoose (MongoDB driver) incompatible with Edge Runtime
- **Solution**: 
  - `auth.edge.ts` - Edge Runtime (for middleware, Google only)
  - `auth.config.ts` - Node.js Runtime (for API routes, both methods)

### Week 3: Infrastructure & DevOps

#### Issue 3: EC2 Disk Space Problems
- **Root Cause**: t3.micro (8GB) too small for Docker builds + Jenkins
- **Symptoms**: 
  - "No space left on device" errors
  - Git LFS model files: 2GB+
  - Jenkins installation caused OOM kills
  - Instance became unresponsive

#### Failed Approach: Jenkins Installation
- Attempted to install Jenkins on EC2
- Jenkins needs 512MB-1GB RAM
- t3.micro only has 1GB total (already used by Docker + app)
- Installation timed out, instance hung repeatedly

#### Successful Solution: GitHub Actions
- **Advantages**:
  - Runs on GitHub servers (free, powerful)
  - Doesn't use EC2 resources
  - 2000 minutes/month free for private repos
  - Parallel builds (Web & AI simultaneously)
  - Built-in GitHub integration

#### Files Created:
1. **`.github/workflows/deploy.yml`** (CI/CD Pipeline)
   - Build both Docker images
   - Push to ghcr.io
   - SSH to EC2 and deploy
   - Health checks

2. **`GITHUB_ACTIONS_SETUP.md`** (Setup Instructions)
   - Step-by-step GitHub Secrets configuration
   - How to add SSH key and EC2 host
   - Troubleshooting guide

3. **`scripts/install-jenkins.sh`** (Abandoned)
   - Created but not used
   - Replaced by GitHub Actions (simpler, better)

### Week 4: Deployment Scripts & Documentation

#### Files Created:
1. **`scripts/deploy-ec2.sh`** (Manual Deployment Script)
   - Pull latest code from GitHub
   - Create/update .env file
   - Restart Docker containers

2. **`JENKINS_SETUP.md`** (Documentation)
   - Jenkins installation guide
   - Credentials configuration
   - Pipeline setup steps
   - NOTE: Superseded by GitHub Actions

3. **`Jenkinsfile`** (CI/CD Config)
   - Pipeline stages
   - Docker build and push
   - EC2 deployment
   - NOTE: Replaced by GitHub Actions

---

## 🔧 Infrastructure Details

### AWS EC2 Instance

**Specifications**:
- Instance Type: t3.micro (1GB RAM, 1 vCPU)
- OS: Ubuntu 24.04 LTS
- Storage: 8GB EBS volume
- Region: ap-south-1 (Mumbai)
- IP: 65.1.94.87 (elastic IP recommended)

**Security Group Rules**:
- Port 22 (SSH) - for deployments
- Port 80 (HTTP) - redirects to HTTPS
- Port 443 (HTTPS) - main application
- Port 3000 (internal) - Next.js
- Port 8001 (internal) - FastAPI

### Database: MongoDB Atlas

**Cloud Service**: MongoDB Atlas (fully managed)

**Collections**:
- `users` - User accounts with:
  - Email (indexed, unique)
  - Name
  - Password (hashed, bcrypt)
  - Created timestamp

**Access**: 
- Connection string in `.env`
- Database name: `olym-pose`
- Secure credentials stored in production `.env`

### Domain & HTTPS

**Domain**: olympose.13-233-133-240.sslip.io
- Uses sslip.io (automatic DNS for IP addresses)
- Format: `olympose.[IP with dashes].sslip.io`

**HTTPS Certificate**:
- Automatic via Let's Encrypt
- Managed by Caddy reverse proxy
- Auto-renewal (Caddy handles it)

**Email Admin Domain**: email.olympose.13-233-133-240.sslip.io

---

## 📁 Directory Structure

```
olym-pose-app/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions CI/CD pipeline
├── backend/
│   ├── ai/
│   │   ├── app/
│   │   │   ├── __init__.py
│   │   │   ├── main.py            # FastAPI app entry
│   │   │   ├── infer.py           # Pose detection
│   │   │   ├── preprocess.py      # Video processing
│   │   │   ├── rep_counter.py     # Rep counting logic
│   │   │   ├── router.py          # API routes
│   │   │   └── schemas.py         # Request/response models
│   │   └── models/                # ML models (stored via Git LFS)
├── frontend/
│   └── web/
│       ├── app/
│       │   ├── api/
│       │   │   ├── auth/[...nextauth]/route.ts
│       │   │   ├── register/route.ts
│       │   │   └── health/route.ts
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx
│       │   │   └── register/page.tsx
│       │   ├── dashboard/page.tsx
│       │   └── workout/page.tsx
│       ├── components/
│       │   └── auth/
│       │       ├── LoginForm.tsx
│       │       └── RegisterForm.tsx
│       ├── lib/
│       │   ├── auth.edge.ts       # Edge Runtime auth config
│       │   ├── auth.config.ts     # Node.js Runtime auth config
│       │   ├── db.ts              # MongoDB connection
│       │   └── validators/        # Zod schemas
│       ├── models/
│       │   └── User.ts            # Mongoose User schema
│       ├── middleware.ts          # NextAuth middleware
│       └── package.json
├── docker/
│   ├── web.Dockerfile            # Next.js build
│   ├── ai.Dockerfile             # FastAPI build
│   └── caddy.Dockerfile          # Reverse proxy
├── scripts/
│   ├── deploy-ec2.sh             # Manual deployment
│   └── install-jenkins.sh        # Jenkins install (unused)
├── .env                          # Production environment variables
├── .env.example                  # Template
├── .gitignore                    # Excludes sensitive files
├── Caddyfile                     # Reverse proxy config
├── docker-compose.yml            # Dev setup
├── docker-compose.prod.yml       # Production setup
├── Jenkinsfile                   # Jenkins pipeline (superseded)
├── JENKINS_SETUP.md              # Jenkins docs (superseded)
├── GITHUB_ACTIONS_SETUP.md       # GitHub Actions setup
├── DEPLOYMENT.md                 # Deployment guide
└── README.md                     # Project overview
```

---

## 🔄 Complete Deployment Flow (Current)

```
Developer on Local Machine
        ↓
    Make code changes
        ↓
    git add . && git commit && git push origin main
        ↓
        ▼
GitHub Repository
        ↓
GitHub Actions Webhook Triggered
        ↓
        ▼
GitHub Actions Runner (Cloud Server)
        ├─ Step 1: Checkout code (30 sec)
        ├─ Step 2: Build Web image (parallel, 5 min)
        │           └─ FROM node:20-alpine
        │           └─ Install deps (cached)
        │           └─ npm run build
        │           └─ Tag: ghcr.io/atharvkhisti/olym-pose-web:latest
        │
        ├─ Step 3: Build AI image (parallel, 5 min)
        │           └─ FROM python:3.11-slim
        │           └─ Install deps (cached)
        │           └─ Copy code
        │           └─ Tag: ghcr.io/atharvkhisti/olym-pose-ai:latest
        │
        ├─ Step 4: Push images to ghcr.io (2 min)
        │           └─ docker push ghcr.io/atharvkhisti/olym-pose-web:latest
        │           └─ docker push ghcr.io/atharvkhisti/olym-pose-ai:latest
        │
        └─ Step 5: Deploy to EC2 (5 min)
                    └─ SSH to ubuntu@65.1.94.87
                    └─ cd /home/ubuntu/olym-pose-app
                    └─ docker compose -f docker-compose.prod.yml pull
                    └─ docker compose -f docker-compose.prod.yml up -d
                    └─ Health check: curl /api/health
        ↓
        ▼
EC2 Instance
        ├─ Pull Web image from ghcr.io
        ├─ Pull AI image from ghcr.io
        ├─ Restart containers
        └─ Application is LIVE! ✅
        ↓
User Access
        └─ https://olympose.13-233-133-240.sslip.io
```

---

## 🎯 Key Achievements

### Authentication
✅ Dual authentication system (Google OAuth + Email/Password)
✅ Secure password hashing with bcrypt
✅ Automatic user creation for OAuth
✅ NextAuth v5 JWT-based sessions
✅ Edge Runtime & Node.js Runtime separation

### DevOps
✅ Containerized application (Docker)
✅ Automated CI/CD pipeline (GitHub Actions)
✅ Reverse proxy with HTTPS (Caddy)
✅ MongoDB Atlas cloud database
✅ Production-ready infrastructure

### Deployment
✅ Zero-downtime deployments
✅ Automated builds and pushes
✅ Health checks after deployment
✅ Full deployment history in GitHub
✅ No manual SSH commands needed

### Security
✅ HTTPS with Let's Encrypt
✅ GitHub Secrets for sensitive data
✅ SSH key-based EC2 authentication
✅ Password hashing with bcrypt
✅ Secure MongoDB Atlas access

---

## 📚 Technologies Used

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **NextAuth v5** - Authentication
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

### Backend
- **FastAPI** - Python web framework
- **TensorFlow/MediaPipe** - Pose detection
- **OpenCV** - Video processing

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Caddy** - Reverse proxy & HTTPS
- **MongoDB Atlas** - Cloud database
- **AWS EC2** - Compute instance
- **GitHub Actions** - CI/CD automation

### Development Tools
- **Git** - Version control
- **GitHub** - Repository hosting
- **bcryptjs** - Password hashing
- **Mongoose** - MongoDB ODM

---

## 🚨 Lessons Learned

### What Worked Well
✅ GitHub Actions (better than Jenkins for small projects)
✅ Docker multi-stage builds (efficient images)
✅ MongoDB Atlas (no database management needed)
✅ Caddy reverse proxy (auto HTTPS, simple config)
✅ NextAuth v5 (flexible auth system)

### What Was Challenging
❌ t3.micro (1GB) too small for Jenkins
❌ 8GB EBS volume not enough for Git LFS models
❌ EC2 IP changes (needed Elastic IP)
❌ Disk space management (cleaned up Git LFS)
❌ Initial OAuth configuration (multiple redirects)

### Recommendations for Scale
1. **Upgrade EC2**: t3.small (2GB) minimum for safety
2. **Separate storage**: Use S3 for large model files
3. **Elastic IP**: Prevent IP changes
4. **RDS**: Consider managed database
5. **CloudFront**: CDN for static assets
6. **Monitoring**: CloudWatch for logs and metrics

---

## 📞 Support & Maintenance

### Common Tasks

**Deploy New Changes**:
```bash
# Just push to GitHub
git push origin main
# GitHub Actions handles the rest!
```

**Check Deployment Status**:
- Visit: https://github.com/atharvkhisti/olym-pose-app/actions

**SSH to EC2** (if needed):
```bash
ssh -i olym-pose-app.pem ubuntu@65.1.94.87
```

**View Logs**:
```bash
docker compose -f docker-compose.prod.yml logs -f web
docker compose -f docker-compose.prod.yml logs -f ai
```

**Manual Restart**:
```bash
cd /home/ubuntu/olym-pose-app
docker compose -f docker-compose.prod.yml restart
```

---

## 🎉 Final Summary

This project demonstrates a **complete modern DevOps setup**:

1. **Source Control**: GitHub with main branch protection
2. **CI/CD**: GitHub Actions with automated testing & deployment
3. **Containerization**: Docker for reproducible environments
4. **Infrastructure**: AWS EC2 with Caddy reverse proxy
5. **Database**: MongoDB Atlas for data persistence
6. **Authentication**: Flexible dual-auth system
7. **Monitoring**: Health checks and logs
8. **Security**: HTTPS, SSH keys, encrypted credentials

The workflow is now **fully automated** - developers simply push code, and GitHub Actions handles building, testing, and deploying. No manual intervention needed! 🚀

