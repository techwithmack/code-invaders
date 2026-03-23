# Deployment Guide - Publishing Code Invaders Live 🚀

This guide covers multiple ways to publish your game online for free.

---

## Option 1: GitHub Pages (EASIEST - Recommended!)

**Best for:** Simple, free, and works great for static sites

### Step-by-Step:

#### 1. Create a GitHub Repository

```bash
cd /Users/mackenzie/Repositories/code-invaders

# Initialize git if not already done
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Code Invaders game"
```

#### 2. Create GitHub Repository Online

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon (top right) → **New repository**
3. Repository name: `code-invaders` (or any name you want)
4. Make it **Public**
5. **DO NOT** initialize with README (we already have files)
6. Click **Create repository**

#### 3. Push Your Code to GitHub

```bash
# Replace YOUR-USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR-USERNAME/code-invaders.git
git branch -M main
git push -u origin main
```

#### 4. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** (in left sidebar)
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**

#### 5. Wait and Access Your Live Game!

- GitHub will build your site (takes 1-2 minutes)
- Your game will be live at: `https://YOUR-USERNAME.github.io/code-invaders/`
- Visit the URL and play!

**Note:** If you see 404, wait a few more minutes and refresh.

---

## Option 2: Netlify (VERY EASY - Drag & Drop!)

**Best for:** Instant deployment with great features

### Step-by-Step:

#### 1. Build Your Game

```bash
cd /Users/mackenzie/Repositories/code-invaders
npm run build
```

#### 2. Create Deployment Folder

Your game needs these files:
- `index.html`
- `styles.css`
- `snippets.json`
- `dist/main.js`

They're already in your project root!

#### 3. Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign up (free) with GitHub/email
3. Click **Add new site** → **Deploy manually**
4. **Drag and drop** your `code-invaders` folder onto the page
5. Wait 30 seconds...
6. Done! You'll get a live URL like `https://random-name-12345.netlify.app`

#### 4. (Optional) Custom Domain

1. In Netlify dashboard, click **Domain settings**
2. Click **Options** → **Edit site name**
3. Change to something like: `code-invaders-game`
4. Your URL becomes: `https://code-invaders-game.netlify.app`

**Advantages:**
- Instant deployment
- Automatic HTTPS
- Free custom subdomains
- Easy to update (just drag & drop again)

---

## Option 3: Vercel (EASY - Auto-Deploy)

**Best for:** Professional deployment with CI/CD

### Step-by-Step:

#### 1. Push to GitHub First

Follow steps 1-3 from GitHub Pages option above.

#### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub account
3. Click **Add New** → **Project**
4. **Import** your `code-invaders` repository
5. Configure:
   - Framework Preset: **Other**
   - Build Command: `npm run build`
   - Output Directory: `.` (current directory)
6. Click **Deploy**
7. Wait ~1 minute for deployment

#### 3. Access Your Live Game

- You'll get a URL like: `https://code-invaders.vercel.app`
- Every time you push to GitHub, Vercel auto-deploys!

**Advantages:**
- Auto-deployment on git push
- Preview deployments
- Great analytics
- Free SSL

---

## Option 4: Cloudflare Pages (FAST & FREE)

**Best for:** Ultra-fast global CDN

### Step-by-Step:

#### 1. Push to GitHub (if not already)

Follow GitHub steps from Option 1.

#### 2. Deploy to Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Sign up (free)
3. Click **Create a project**
4. Connect your GitHub account
5. Select your `code-invaders` repository
6. Configure:
   - Build command: `npm run build`
   - Build output directory: `.`
7. Click **Save and Deploy**

#### 3. Access Your Game

- Live at: `https://code-invaders.pages.dev`
- Auto-deploys on every git push

---

## Option 5: Self-Hosting (Advanced)

### Requirements:
- Your own server or VPS (DigitalOcean, AWS, etc.)
- Domain name (optional)

### Quick Setup with Nginx:

```bash
# On your server
sudo apt update
sudo apt install nginx

# Copy your files to web root
sudo cp -r /path/to/code-invaders /var/www/html/

# Configure Nginx
sudo nano /etc/nginx/sites-available/code-invaders

# Add this configuration:
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/html/code-invaders;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/code-invaders /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Visit: `http://your-server-ip` or `http://your-domain.com`

---

## Comparison Table

| Platform | Difficulty | Cost | Auto-Deploy | Custom Domain | Speed |
|----------|-----------|------|-------------|---------------|-------|
| **GitHub Pages** | ⭐ Easy | Free | On Push | Yes (paid) | Fast |
| **Netlify** | ⭐ Easiest | Free | Drag & Drop | Yes (free subdomain) | Very Fast |
| **Vercel** | ⭐⭐ Easy | Free | On Push | Yes (free) | Very Fast |
| **Cloudflare** | ⭐⭐ Easy | Free | On Push | Yes (free) | Ultra Fast |
| **Self-Host** | ⭐⭐⭐ Advanced | Varies | Manual | Yes | Depends |

---

## Recommended: Start with Netlify!

**Why?** It's the fastest way to get live:

1. Run `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Drag your folder
4. Get instant live URL!

No git needed, no configuration, just works!

---

## Updating Your Live Game

### For GitHub Pages, Vercel, or Cloudflare:
```bash
# Make changes to your code
npm run build

# Commit and push
git add .
git commit -m "Update game"
git push

# Auto-deploys in 1-2 minutes!
```

### For Netlify (Manual):
1. Make changes
2. Run `npm run build`
3. Drag folder to Netlify again
4. Live in 30 seconds!

---

## Troubleshooting

### Game not loading?
- Check browser console (F12) for errors
- Make sure `dist/main.js` exists
- Verify `snippets.json` is in the root folder

### 404 errors?
- Wait 2-3 minutes after deployment
- Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)
- Check file paths are correct

### Snippets not loading?
- Ensure `snippets.json` is deployed
- Check browser console for fetch errors
- Verify file is in the same directory as `index.html`

---

## Custom Domain (Optional)

### With Netlify:
1. Buy domain from Namecheap, GoDaddy, etc.
2. In Netlify: **Domain settings** → **Add custom domain**
3. Update DNS records (Netlify shows you exactly what to do)
4. Wait for DNS propagation (up to 48 hours)

### With GitHub Pages:
1. Create file `CNAME` in project root with your domain:
   ```
   yourdomain.com
   ```
2. Commit and push
3. In GitHub Settings → Pages, add custom domain
4. Update DNS at your registrar

---

## Security & Performance

### Enable HTTPS:
- **GitHub Pages**: Automatic (may take a few hours)
- **Netlify/Vercel/Cloudflare**: Automatic and instant!

### Optimize for Speed:
Your game is already optimized! But you can:
- Minify `main.js` (already done by TypeScript)
- Enable gzip compression (automatic on all platforms)
- Use CDN (Netlify/Vercel/Cloudflare do this automatically)

---

## Cost Breakdown

### FREE Tier Limits:
- **GitHub Pages**: 100GB bandwidth/month, 1 build per hour
- **Netlify**: 100GB bandwidth/month, 300 build minutes/month
- **Vercel**: 100GB bandwidth/month, unlimited builds
- **Cloudflare**: Unlimited bandwidth, 500 builds/month

**For this game:** All free tiers are MORE than enough!

---

## 🎉 Quick Start (Fastest Way):

```bash
# 1. Build
npm run build

# 2. Go to netlify.com
# 3. Drag your 'code-invaders' folder
# 4. Done! You're live!
```

**Your game will be online in under 2 minutes!** 🚀

---

## Need Help?

- GitHub Pages Docs: https://pages.github.com
- Netlify Docs: https://docs.netlify.com
- Vercel Docs: https://vercel.com/docs
- Cloudflare Pages: https://developers.cloudflare.com/pages

---

**Congratulations!** Your game is now live on the internet! 🎮🌍
