# GitHub Student Developer Pack - Free Domain Guide

## 🎓 What is GitHub Student Developer Pack?

**GitHub Student Developer Pack** is a collection of free developer tools for students, including:
- ✅ **Free domain for 1 year** (via Namecheap)
- ✅ GitHub Pro (normally $7/month)
- ✅ $100 AWS credits
- ✅ 50+ other free tools

**Best part**: The domain is **FREE for 1 year** + you can renew at a discount!

---

## 📋 Step-by-Step Guide

### Step 1: Verify You're a Student (5 minutes)

**Requirements**:
- GitHub account (you already have this! ✅)
- Valid school email OR student ID
- Academic proof (if needed)

**Process**:
1. Go to: https://education.github.com/pack
2. Click **"Get student benefits"** (blue button)
3. Sign in with your GitHub account
4. Verify your student status:
   - **Option A**: Use school email (e.g., `name@university.edu`)
   - **Option B**: Upload student ID
5. GitHub will verify (usually instant or within 24 hours)

**If you don't have school email**:
- Upload student ID, report card, or transcript
- Takes 24-48 hours for verification

---

### Step 2: Claim Free Domain via Namecheap (10 minutes)

Once verified as student:

1. Go back to: https://education.github.com/pack
2. Scroll down to **Namecheap** section
3. Click **"Get free domain"** link
4. You'll be redirected to Namecheap
5. Log in or create Namecheap account
6. Claim your **free .tech domain** (1 year)
   - Example: `olympose.tech`
   - Other free options: `.me`, `.xyz`, `.online`, `.site`
7. Add to cart → Checkout
   - Price should show: **$0.00**
   - Verify coupon is applied (GitHub Student Pack code)
8. Complete purchase

**Domain is now yours for 1 year FREE!** ✅

---

### Step 3: Point Domain to Your EC2 IP

**Option A: Use Route53 (AWS)**
```
1. AWS Console → Route53
2. Create hosted zone for olympose.tech
3. Create A record:
   - Name: olympose.tech
   - Type: A
   - Value: 65.1.94.87
4. Update nameservers in Namecheap to Route53 nameservers
5. Wait 24-48 hours for DNS propagation
```

**Option B: Use Namecheap's Built-in DNS** (Simpler)
```
1. Namecheap → Domain List → olympose.tech
2. Manage → Advanced DNS
3. Add A Record:
   - Host: @
   - Value: 65.1.94.87
   - TTL: 3600
4. Save
5. DNS updates within minutes
```

**I recommend Option B** - Simpler and faster!

---

### Step 4: Update Your Application

Once domain is set up and resolving to your IP:

#### Update `.env`:
```env
# Before
NEXTAUTH_URL=https://olympose.65-1-94-87.sslip.io

# After (if using custom domain)
NEXTAUTH_URL=https://olympose.tech
NEXT_PUBLIC_AI_SERVICE_URL=https://olympose.tech/api
```

#### Update `Caddyfile`:
```caddy
# Before
olympose.65-1-94-87.sslip.io {
  email admin@olympose.65-1-94-87.sslip.io
}

# After
olympose.tech {
  email admin@olympose.tech
}
```

#### Update Google OAuth:
```
Google Cloud Console → OAuth Credentials
Authorized redirect URIs:
https://olympose.tech/api/auth/callback/google
```

---

## 🚀 Complete Timeline

```
Now (5 min)
   ↓
Verify Student Status
   ↓
GitHub Verification (instant or 24h)
   ↓
Claim Free Domain (5 min)
   ↓
Namecheap Account Setup (2 min)
   ↓
Get Domain (instant) ✅
   ↓
Point to IP via Route53/Namecheap (5 min)
   ↓
DNS Propagation (5 min - 48 hours)
   ↓
Update .env, Caddyfile, Google OAuth (5 min)
   ↓
Deploy via GitHub Actions (10 min)
   ↓
Your domain is LIVE! 🎉
   
Total: 30-60 minutes + waiting for DNS
```

---

## 📊 Comparison: Your Options

| Method | Cost | Domain | Setup Time | Professional |
|--------|------|--------|-----------|---|
| **GitHub Student Pack (Recommended)** | FREE 1yr | olympose.tech | 30 min | ⭐⭐⭐⭐⭐ |
| Elastic IP + sslip.io | $0 | olympose.65-1-94-87.sslip.io | 5 min | ⭐⭐⭐ |
| Route53 + Domain | $1-3/yr | olympose.tech | 30 min | ⭐⭐⭐⭐⭐ |
| DuckDNS | FREE | olympose.duckdns.org | 10 min | ⭐⭐⭐ |

**Student Pack is BEST**: Free domain + professional looks + great for resume!

---

## ✅ Step-by-Step with Screenshots

### 1. Go to GitHub Education
```
URL: https://education.github.com/pack
Click: "Get student benefits" button
```

### 2. Verify Student Status
```
Sign in with GitHub
Choose verification method:
  - School email (instant)
  - Student ID (24-48 hours)
Click: Verify
Wait for: Confirmation email
```

### 3. Claim Namecheap Domain
```
After verification, scroll to "Namecheap" in the pack
Click: "Get free domain"
Redirected to Namecheap
Search domain: olympose.tech
Click: "Get it for free with your student pack"
```

### 4. Complete Purchase
```
Add to cart
Checkout
You should see: $0.00 (GitHub Student Pack applied)
Complete order
Domain is yours!
```

---

## 🎯 For Your Resume

After setting up:

```
Portfolio: https://olympose.tech

AI-Powered Fitness Application
- Full-stack: Next.js, FastAPI, Python
- Authentication: Google OAuth + Email/Password (bcrypt)
- AI: Pose detection with MediaPipe
- Infrastructure: Docker, AWS EC2, MongoDB Atlas
- CI/CD: GitHub Actions automated deployment
- HTTPS via Caddy and Let's Encrypt
- Obtained custom domain via GitHub Student Developer Pack
```

**This looks PROFESSIONAL!** 🚀

---

## 📝 Important: After 1 Year

**When domain expires (1 year from claim)**:

### Option 1: Renew at Student Discount
- Namecheap offers student renewal discounts
- Usually 50-70% off for years 2+
- Still much cheaper than retail

### Option 2: Keep Using sslip.io
- Falls back to: `olympose.65-1-94-87.sslip.io`
- Works forever, free
- Less professional

### Option 3: Buy New Student Domain
- GitHub pack refreshes every academic year
- Claim another free domain
- Transfer DNS records

**Recommendation**: Renew with student discount (usually $5-8/year)

---

## ⚠️ Important Notes

1. **Verify Email**: You MUST verify your email after claiming domain
2. **DNS Propagation**: Takes 5 minutes to 48 hours (usually 30 min)
3. **HTTPS Certificate**: Caddy automatically gets Let's Encrypt cert (no action needed)
4. **Nameserver Update**: If using Route53, update Namecheap nameservers
5. **Google OAuth**: Update redirect URI immediately after domain is live

---

## 🔧 DNS Verification

After pointing domain to your IP, verify it works:

```bash
# Check DNS resolves to your IP
nslookup olympose.tech
# Should show: 65.1.94.87

# Check HTTPS works
curl -I https://olympose.tech
# Should show: HTTP/2 200 with valid certificate

# Check application responds
curl https://olympose.tech/api/health
# Should show: {"status": "ok"}
```

---

## 📞 Other Free Tools in Student Pack

While you're at it, these are also free:

- **GitHub Pro** (normally $7/month) - Free for students
- **AWS** - $100 credits (great for AWS services)
- **DigitalOcean** - Free credits
- **Figma** - Professional tier free
- **JetBrains IDEs** - Free professional licenses
- **LinkedIn Learning** - Free courses
- **DataCamp** - Free premium access

[Full list here](https://education.github.com/pack)

---

## ⏱️ Quick Action Checklist

- [ ] Go to https://education.github.com/pack
- [ ] Click "Get student benefits"
- [ ] Verify with school email or student ID
- [ ] Wait for verification (instant or 24h)
- [ ] Claim free domain via Namecheap
- [ ] Set domain to point to: 65.1.94.87
- [ ] Update `.env` with new domain
- [ ] Update `Caddyfile` with new domain
- [ ] Update Google OAuth redirect URI
- [ ] Push changes to GitHub
- [ ] Wait for GitHub Actions deployment
- [ ] Test: curl https://olympose.tech
- [ ] Add to resume! 🎓

---

## 💡 Pro Tips

1. **Use .tech domain**: More memorable than .me or .xyz for a tech portfolio
2. **Get email**: Set up admin@olympose.tech via Namecheap
3. **Subdomain**: Can later use api.olympose.tech, admin.olympose.tech, etc.
4. **Screenshot proof**: Save your GitHub Student Pack verification for records
5. **Domain privacy**: Namecheap usually includes free WHOIS privacy with student pack

---

## 🎉 Final Result

After completing setup:

✅ Professional domain: `olympose.tech`  
✅ FREE for 1 year via GitHub Student Pack  
✅ Automatic HTTPS with Caddy  
✅ Custom email: `admin@olympose.tech`  
✅ Perfect for resume and portfolio  
✅ Impresses potential employers  

**Total cost**: $0 (for first year!)  
**Total time**: 30-60 minutes + DNS propagation  
**Value**: PRICELESS for your portfolio! 🚀

---

## 📚 Related Files Already Updated

All your files are ready for domain update:
- ✅ `.env` (ready for domain change)
- ✅ `Caddyfile` (ready for domain change)
- ✅ `GITHUB_ACTIONS_SETUP.md` (IP documented)
- ✅ `PROJECT_OVERVIEW.md` (updated)

Just update the domain name and redeploy!

---

**Next Step**: Start the verification process now at https://education.github.com/pack

This is one of the best developer benefits available - use it! 🎓
