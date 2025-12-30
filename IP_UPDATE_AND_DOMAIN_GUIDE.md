# EC2 IP Update & Stable Domain Setup Guide

## 📋 Summary of Changes

**Old IP**: 13.233.133.240  
**New IP**: 65.1.94.87  
**Current Domain**: olympose.65-1-94-87.sslip.io

### Files Updated ✅
- ✅ `.env` - NEXTAUTH_URL, NEXT_PUBLIC_AI_SERVICE_URL
- ✅ `Caddyfile` - Domain and email configuration
- ✅ `GITHUB_ACTIONS_SETUP.md` - EC2_HOST secret value
- ✅ `JENKINS_SETUP.md` - SSH and Jenkins URLs
- ✅ `PROJECT_OVERVIEW.md` - All IP references
- ✅ `scripts/install-jenkins.sh` - Jenkins URLs

---

## 🔧 External Changes Required (CRITICAL)

### 1. **GitHub Actions Secrets Update** ⭐ MUST DO
The GitHub Actions workflow needs the new IP to SSH into your EC2.

**Steps**:
1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Find or create secret `EC2_HOST`
3. Update value to: `65.1.94.87`
4. Click **Update secret**

**Why**: GitHub Actions uses this IP to SSH and deploy your containers.

---

### 2. **Google OAuth Redirect URI** ⭐ MUST DO
Google Cloud Console needs to know the new domain for OAuth redirects.

**Steps**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project → **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID
4. Click on it to edit
5. Under **Authorized redirect URIs**, add:
   ```
   https://olympose.65-1-94-87.sslip.io/api/auth/callback/google
   ```
6. Remove the old URI: `https://olympose.13-233-133-240.sslip.io/api/auth/callback/google`
7. Click **Save**

**Why**: Without this, Google OAuth will reject logins with "redirect_uri_mismatch" error.

---

### 3. **Caddy HTTPS Certificate (Auto)**
No action needed! Caddy automatically:
- Detects the new domain
- Requests new Let's Encrypt certificate
- Renews automatically every 90 days

**Verification** (after deployment):
```bash
curl -I https://olympose.65-1-94-87.sslip.io
# Should show: HTTP/2 200 with valid SSL certificate
```

---

## 🌐 Getting a Stable Domain for Your Resume

### Problem
Your IP (65.1.94.87) can change when you stop/start the EC2 instance. This is bad for a resume link.

### Solution Options

#### **Option 1: AWS Elastic IP** ⭐ RECOMMENDED (Easiest)
**Elastic IP** = Fixed IP that doesn't change even if instance restarts

**Steps**:
1. Go to AWS Console → **EC2** → **Elastic IPs** (left sidebar)
2. Click **Allocate Elastic IP address**
3. Select region: **ap-south-1** (Mumbai)
4. Click **Allocate**
5. Select the new Elastic IP → **Actions** → **Associate Elastic IP address**
6. Select instance: **olym-pose-app**
7. Click **Associate**

**Result**: Your IP becomes permanent until you release it. Cost: $0 if always associated with running instance.

**Update in files**: Keep same IP (65.1.94.87)

---

#### **Option 2: Custom Domain + Route53** ⭐ MOST PROFESSIONAL
**Domains like**: `olymppose.com` or `olympose.app`  
Better for resume, easier to remember, professional appearance.

**Steps**:
1. **Buy domain** (Route53, GoDaddy, Namecheap, etc.)
   - Recommended: Get cheap domain like `olympose.tech` (~$12/year)
   - Or use free: `olympose.github.io` (GitHub Pages)

2. **If using Route53**:
   - AWS Console → **Route53**
   - Create hosted zone for your domain
   - Create A record pointing to your Elastic IP (65.1.94.87)
   - Takes 24-48 hours to propagate

3. **If using external registrar** (GoDaddy, Namecheap):
   - Point nameservers to Route53
   - Create A record in Route53
   - Update Caddyfile:
     ```caddy
     olympose.tech {
       # ... your config ...
     }
     ```

**Result**: Domain like `https://olympose.tech` → Always points to your IP

**Resume**: `olympose.tech` looks much more professional!

---

#### **Option 3: Free Domain + DuckDNS** ⭐ GOOD FOR TESTING
**DuckDNS** = Free dynamic DNS service, updates automatically

**Steps**:
1. Go to [DuckDNS](https://www.duckdns.org)
2. Sign in with GitHub
3. Create subdomain: `olympose` → gets `olympose.duckdns.org`
4. Update Caddyfile to use new domain
5. Keep Elastic IP to prevent IP changes

**Result**: Domain like `https://olympose.duckdns.org`

**Downside**: Not as professional looking for resume

---

#### **Option 4: sslip.io (Current Setup)** ⭐ NO COST BUT IP-DEPENDENT
**Current**: olympose.65-1-94-87.sslip.io

Pros:
- Free, automatic HTTPS
- No setup needed
- Works instantly

Cons:
- ❌ Tied to IP address
- ❌ Changes if you restart instance
- ❌ Not professional for resume

---

## 📝 Recommended Resume Solution

**Best combination**:
1. **Allocate Elastic IP** (5 minutes) - $0/month
2. **Get cheap custom domain** (1 minute) - $1/month
3. **Point domain to Elastic IP** via Route53 - $0.50/month

**Total cost**: ~$1.50/month

**Resume text**:
> **Portfolio**: [olympose.tech](https://olympose.tech)
> 
> AI-powered fitness application with user authentication (Google OAuth + Email/Password), automated CI/CD pipeline, and containerized architecture deployed on AWS.

---

## 🚀 Step-by-Step Setup (Recommended Path)

### Step 1: Allocate Elastic IP (5 mins)
```
AWS Console → EC2 → Elastic IPs → Allocate → Associate to olym-pose-app
```

### Step 2: Buy Domain (1 min)
```
Go to Route53 or GoDaddy → Search olympose.tech → Buy ($1-15/year)
```

### Step 3: Point Domain to IP via Route53 (5 mins)
```
Route53 → Create Hosted Zone → Add A Record → Type: 65.1.94.87
```

### Step 4: Update GitHub Actions Secret
```
Already done! EC2_HOST = 65.1.94.87
```

### Step 5: Update Google OAuth
```
Google Cloud Console → Authorized redirect URIs → 
https://olympose.tech/api/auth/callback/google
```

### Step 6: Update Caddyfile (if using custom domain)
```caddy
olympose.tech {
  email admin@olympose.tech
  # ... rest of config ...
}
```

### Step 7: Redeploy
```bash
git add .
git commit -m "Update to custom domain and elastic IP"
git push origin main
# Wait 10 mins for GitHub Actions deployment
```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] **Elastic IP allocated**: `aws ec2 describe-addresses --region ap-south-1`
- [ ] **Domain resolves to IP**: `nslookup olympose.tech` (shows 65.1.94.87)
- [ ] **HTTPS certificate valid**: `curl -I https://olympose.tech`
- [ ] **Google OAuth works**: Try logging in with Google
- [ ] **Email/password auth works**: Try registering and logging in
- [ ] **GitHub Actions deploys**: Push code and check Actions tab
- [ ] **Health checks pass**: `curl https://olympose.tech/api/health`

---

## 💾 Current Environment Values

```env
# .env (already updated)
NEXTAUTH_URL=https://olympose.65-1-94-87.sslip.io

# After custom domain:
NEXTAUTH_URL=https://olympose.tech

# Caddyfile (already updated)
olympose.65-1-94-87.sslip.io {
  email admin@olympose.65-1-94-87.sslip.io
}

# After custom domain:
olympose.tech {
  email admin@olympose.tech
}
```

---

## 🔗 Quick Links

- [AWS Route53](https://console.aws.amazon.com/route53)
- [Google Cloud Console - OAuth](https://console.cloud.google.com/apis/credentials)
- [GitHub Actions Secrets](https://github.com/atharvkhisti/olym-pose-app/settings/secrets/actions)
- [Elastic IPs Dashboard](https://console.aws.amazon.com/ec2/v2/home?region=ap-south-1#Addresses:)
- [DuckDNS (Free Alternative)](https://www.duckdns.org)
- [Route53 Pricing](https://aws.amazon.com/route53/pricing/)

---

## 📊 Cost Breakdown (Monthly)

| Item | Cost | Required |
|------|------|----------|
| EC2 t3.micro | ~$8 | ✅ Yes |
| Elastic IP (attached) | $0 | ✅ Recommended |
| Custom domain | $1-3 | ⭐ For resume |
| Route53 hosting | $0.50 | ⭐ For custom domain |
| **Total** | ~$9-12 | — |

---

## 🎯 For Your Resume

Use this format:

```
Portfolio Application: olympose.tech
- Next.js frontend with dual authentication (Google OAuth + Email/Password)
- FastAPI backend with AI pose detection
- Automated CI/CD pipeline via GitHub Actions
- Infrastructure: Docker, AWS EC2, MongoDB Atlas, Caddy reverse proxy
- Deployed on AWS with HTTPS via Let's Encrypt
```

---

## Next Steps

1. **Immediately**: Update GitHub Actions `EC2_HOST` secret to `65.1.94.87`
2. **Immediately**: Update Google OAuth redirect URIs with new domain
3. **Today**: Allocate Elastic IP to prevent future IP changes
4. **This week**: Buy custom domain and point to your IP
5. **This week**: Update Caddyfile and redeploy with custom domain

Good luck with your portfolio! 🚀
