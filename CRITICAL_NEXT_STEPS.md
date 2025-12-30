# 🚀 CRITICAL: Do These Now!

## ⚠️ MUST DO TODAY (5 minutes each)

### 1️⃣ Update GitHub Actions Secret
**What**: Tell GitHub Actions the new EC2 IP  
**Time**: 2 minutes

```
Go to: https://github.com/atharvkhisti/olym-pose-app/settings/secrets/actions
Find: EC2_HOST
Change value to: 65.1.94.87
Click: Update secret
```

### 2️⃣ Update Google OAuth
**What**: Tell Google the new domain for OAuth logins  
**Time**: 3 minutes

```
Go to: https://console.cloud.google.com/apis/credentials
Find: Your OAuth 2.0 Client ID
Add this Authorized Redirect URI:
  https://olympose.65-1-94-87.sslip.io/api/auth/callback/google

Remove old one:
  https://olympose.13-233-133-240.sslip.io/api/auth/callback/google

Click: Save
```

### 3️⃣ Test Deployment
**What**: Verify GitHub Actions can deploy to the new IP  
**Time**: 10 minutes

```
1. Push a test commit:
   git add .
   git commit -m "Test deployment with new IP"
   git push origin main

2. Go to: https://github.com/atharvkhisti/olym-pose-app/actions
   
3. Wait for workflow to complete (should take ~10 mins)
   
4. If successful:
   ✅ Docker images built
   ✅ Pushed to ghcr.io
   ✅ Deployed to EC2 (65.1.94.87)
   ✅ Health checks passed
```

---

## ⭐ DO THIS WEEK (For Stable Domain + Resume)

### Option A: Allocate Elastic IP (Recommended - $0/month)
```
AWS Console → EC2 → Elastic IPs
Click: Allocate Elastic IP address
Region: ap-south-1
Associate to instance: olym-pose-app

Then: Same IP even if you stop/start instance ✅
```

### Option B: Buy Custom Domain ($1-15/year)
```
Route53 / GoDaddy / Namecheap
Search: olympose.tech (or your preferred name)
Buy it
Point to IP: 65.1.94.87 via Route53 A record

Then: Use olympose.tech on your resume ✅
```

---

## 📋 Testing Checklist

After everything is set up:

```bash
# 1. Test HTTPS works with new IP
curl -I https://olympose.65-1-94-87.sslip.io
# Should show: HTTP/2 200

# 2. Test application is running
curl https://olympose.65-1-94-87.sslip.io
# Should show HTML content

# 3. Test health check endpoint
curl https://olympose.65-1-94-87.sslip.io/api/health
# Should show: {"status": "ok"}

# 4. SSH to instance (test connectivity)
ssh -i olym-pose-app.pem ubuntu@65.1.94.87
# Should connect successfully

# 5. Check Docker containers
docker compose -f docker-compose.prod.yml ps
# Should show: web, ai, caddy all running
```

---

## 🎯 Current Status

| Item | Status | Action |
|------|--------|--------|
| Files updated with new IP | ✅ Done | None |
| GitHub Actions secret | ⏳ Pending | Update EC2_HOST |
| Google OAuth config | ⏳ Pending | Add new redirect URI |
| Test deployment | ⏳ Pending | Push code & monitor Actions |
| Elastic IP | ⏳ Optional | Allocate in AWS |
| Custom domain | ⏳ Optional | Buy & configure |

---

## 📞 If Something Goes Wrong

### SSH Connection Fails
```bash
# Check instance is running
aws ec2 describe-instances --instance-ids i-08b7752e48c70edcd --region ap-south-1

# Check security group allows port 22
aws ec2 describe-security-groups --region ap-south-1

# Or try restarting instance in AWS Console
```

### Google OAuth Still Shows Redirect URI Mismatch
```
1. Clear browser cookies
2. Wait 5 minutes for Google to update
3. Try again
4. Check exact domain matches (no http://, must be https://)
```

### GitHub Actions SSH Fails
```
1. Verify EC2_HOST secret is exactly: 65.1.94.87
2. Verify EC2_SSH_KEY secret has full private key (-----BEGIN...)
3. Check instance is running
4. Try manual SSH: ssh -i key.pem ubuntu@65.1.94.87
```

---

## 💾 Files Updated
- ✅ `.env`
- ✅ `Caddyfile`
- ✅ `GITHUB_ACTIONS_SETUP.md`
- ✅ `JENKINS_SETUP.md`
- ✅ `PROJECT_OVERVIEW.md`
- ✅ `scripts/install-jenkins.sh`
- ✅ `IP_UPDATE_AND_DOMAIN_GUIDE.md` (new)

All committed to main branch ✅

---

## 🎓 What You'll Have on Resume

After setting up custom domain:

> **Portfolio**: olympose.tech
> - Next.js + FastAPI full-stack application
> - AI-powered pose detection using MediaPipe
> - Dual authentication: Google OAuth + Email/Password with bcrypt
> - CI/CD automation using GitHub Actions
> - Docker containerized, deployed on AWS EC2
> - Automated HTTPS via Caddy and Let's Encrypt
> - MongoDB Atlas for data persistence

This is production-quality infrastructure! 🚀

---

**Start with the 3 MUST DO items above. Total time: ~15 minutes.**
