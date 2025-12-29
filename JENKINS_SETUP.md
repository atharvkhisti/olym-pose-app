# Jenkins CI/CD Setup Guide

## 📋 Prerequisites

- EC2 instance running Ubuntu 24.04
- Docker already installed
- GitHub repository with code
- GitHub Personal Access Token (for Container Registry)

## 🔧 Step 1: Install Jenkins on EC2

### 1.1 Update AWS Security Group

Add inbound rule in AWS Console:
- Go to EC2 → Security Groups
- Find your instance's security group
- Add inbound rule:
  - Type: Custom TCP
  - Port: 8080
  - Source: Your IP (or 0.0.0.0/0 for public access)

### 1.2 Run Installation Script

SSH into EC2 and run:

```bash
cd ~/olym-pose-app
chmod +x scripts/install-jenkins.sh
./scripts/install-jenkins.sh
```

### 1.3 Initial Jenkins Setup

1. Access Jenkins at: `http://13.233.133.240:8080`
2. Copy the initial admin password shown in terminal
3. Paste password to unlock Jenkins
4. Click "Install suggested plugins"
5. Create admin user (save credentials!)
6. Set Jenkins URL: `http://13.233.133.240:8080`
7. Click "Start using Jenkins"

## 🔑 Step 2: Configure Credentials

### 2.1 GitHub Container Registry Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with scopes:
   - `write:packages`
   - `read:packages`
   - `delete:packages`
3. Copy the token

### 2.2 Add Credentials to Jenkins

1. Jenkins Dashboard → Manage Jenkins → Credentials
2. Click "(global)" → "Add Credentials"
3. Fill in:
   - Kind: Username with password
   - Username: `atharvkhisti`
   - Password: [Your GitHub Personal Access Token]
   - ID: `github-container-registry`
   - Description: GitHub Container Registry
4. Click "Create"

## 🔌 Step 3: Install Required Plugins

1. Manage Jenkins → Plugins → Available plugins
2. Search and install:
   - Docker Pipeline
   - GitHub Integration
   - Pipeline
3. Restart Jenkins when prompted

## 📦 Step 4: Create Jenkins Pipeline Job

### 4.1 Create New Item

1. Dashboard → New Item
2. Enter name: `olym-pose-deployment`
3. Select "Pipeline"
4. Click OK

### 4.2 Configure Pipeline

**General:**
- ✅ GitHub project
- Project URL: `https://github.com/atharvkhisti/olym-pose-app/`

**Build Triggers:**
- ✅ GitHub hook trigger for GITScm polling

**Pipeline:**
- Definition: Pipeline script from SCM
- SCM: Git
- Repository URL: `https://github.com/atharvkhisti/olym-pose-app.git`
- Branch: `*/main`
- Script Path: `Jenkinsfile`

Click "Save"

## 🪝 Step 5: Setup GitHub Webhook

### 5.1 Configure Webhook

1. Go to GitHub repository: `atharvkhisti/olym-pose-app`
2. Settings → Webhooks → Add webhook
3. Fill in:
   - Payload URL: `http://13.233.133.240:8080/github-webhook/`
   - Content type: `application/json`
   - Events: Just the push event
   - ✅ Active
4. Click "Add webhook"

### 5.2 Test Webhook

1. Go to webhook page
2. Click "Recent Deliveries"
3. Should see a ping with green checkmark

## 🐳 Step 6: Configure Docker Permissions

Jenkins needs permission to run Docker commands:

```bash
# SSH to EC2
ssh -i key.pem ubuntu@13.233.133.240

# Add jenkins user to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins
sudo systemctl restart jenkins

# Verify
sudo -u jenkins docker ps
```

## ✅ Step 7: Test the Pipeline

### 7.1 Manual Test

1. Jenkins Dashboard → olym-pose-deployment
2. Click "Build Now"
3. Watch the build progress (click on build #1 → Console Output)

### 7.2 Automatic Test

1. Make a small change in your code
2. Commit and push to main branch:
   ```bash
   git add .
   git commit -m "test: trigger Jenkins pipeline"
   git push origin main
   ```
3. Jenkins should automatically start building

## 📊 Pipeline Stages Explained

1. **Checkout**: Pull latest code from GitHub
2. **Build Web Image**: Build Next.js frontend Docker image
3. **Build AI Image**: Build FastAPI backend Docker image
4. **Push Images**: Push both images to ghcr.io
5. **Deploy**: Pull and restart containers on EC2
6. **Health Check**: Verify services are running
7. **Cleanup**: Remove old unused images

## 🔧 Troubleshooting

### Issue: Build fails with "permission denied"
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Issue: Cannot connect to Docker daemon
```bash
sudo systemctl status docker
sudo systemctl start docker
```

### Issue: GitHub webhook not triggering
- Check Security Group allows port 8080
- Verify webhook URL is correct
- Check Jenkins GitHub plugin is installed

### View Jenkins Logs
```bash
sudo journalctl -u jenkins -f
```

## 🎉 Success Criteria

When everything works:
1. Push code to GitHub main branch
2. Jenkins automatically starts building
3. Docker images are built and pushed
4. Containers restart on EC2
5. Application is live with new changes
6. No manual SSH or docker commands needed!

## 🔒 Security Recommendations

1. **Change Jenkins admin password** (Manage Jenkins → Security)
2. **Enable CSRF protection** (already enabled by default)
3. **Restrict Jenkins access** (use VPN or IP whitelist)
4. **Use GitHub webhook secret** (add in webhook settings)
5. **Rotate GitHub tokens** regularly

## 📈 Next Steps

- Add automated tests to pipeline
- Set up email/Slack notifications
- Add rollback capability
- Implement blue-green deployment
- Add staging environment
