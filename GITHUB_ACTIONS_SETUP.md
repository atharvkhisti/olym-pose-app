# GitHub Actions CI/CD Setup

## ✨ Advantages Over Jenkins

- **No EC2 Resources Used**: Runs on GitHub's servers (free!)
- **No Installation**: No Jenkins to maintain
- **Free for Public Repos**: 2000 minutes/month for private repos
- **Faster**: Parallel builds, better caching
- **Better Integration**: Native GitHub integration

## 🚀 Setup Instructions

### Step 1: Add EC2 SSH Key to GitHub Secrets

1. On your **local machine**, get your SSH private key:
   ```powershell
   cat C:\Users\Atharv Khisti\Downloads\olym-pose-app.pem
   ```

2. Copy the **entire key** (including `-----BEGIN...` and `-----END...`)

3. Go to GitHub repository: `https://github.com/atharvkhisti/olym-pose-app/settings/secrets/actions`

4. Click **"New repository secret"**

5. Add these secrets:

   **Secret 1:**
   - Name: `EC2_SSH_KEY`
   - Value: [Paste the entire private key content]

   **Secret 2:**
   - Name: `EC2_HOST`
   - Value: `65.1.94.87`

6. Click **"Add secret"** for each

### Step 2: Commit and Push Workflow

Already done! The workflow file is at `.github/workflows/deploy.yml`

Just push to GitHub:

```powershell
cd C:\Users\Atharv Khisti\Desktop\olym-pose-app
git add .github/workflows/deploy.yml GITHUB_ACTIONS_SETUP.md
git commit -m "feat: Add GitHub Actions CI/CD workflow"
git push origin main
```

### Step 3: Watch It Deploy!

1. Go to: `https://github.com/atharvkhisti/olym-pose-app/actions`
2. You'll see the workflow running
3. Click on it to watch real-time logs
4. Should complete in 5-10 minutes

## 🎯 How It Works

```
You push code → GitHub Actions Triggered
                         ↓
          1. Build Docker images (parallel)
          2. Push to ghcr.io
          3. SSH to EC2
          4. Pull new images
          5. Restart containers
                         ↓
              Deployment Complete! ✅
```

## ⚡ Benefits

- **Automatic**: Every push to main triggers deployment
- **Fast**: Build caching makes subsequent builds faster
- **Reliable**: Consistent build environment
- **Free**: No cost for public repos
- **Logs**: Full build history in GitHub UI

## 🔧 Maintenance

**No maintenance needed!** Unlike Jenkins:
- ❌ No server to manage
- ❌ No plugins to update
- ❌ No memory issues
- ❌ No disk space problems
- ✅ Just works!

## 📊 Monitoring

View all deployments at:
`https://github.com/atharvkhisti/olym-pose-app/actions`

## 🆘 Troubleshooting

### Deployment fails with SSH error
- Check `EC2_SSH_KEY` secret is correct (entire key)
- Check `EC2_HOST` is `65.1.94.87`

### Build fails
- Check Docker build logs in Actions tab
- Ensure Docker files are correct

### Health check fails
- Normal if site takes time to start
- Check EC2 instance is running
- Verify containers: `docker compose ps`
