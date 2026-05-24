# The Nut Bowl — Premium Snacks for the Bold

A clean, aesthetic Gen Z-style landing page for **The Nut Bowl** food/snack brand.

**Live URL:** https://yashmodi.github.io/thenutsbowl

---

## 🚀 Deploying to GitHub Pages

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: The Nut Bowl landing page"
git branch -M main
git remote add origin https://github.com/yashmodi/thenutsbowl.git
git push -u origin main
```

### Step 2 — Enable GitHub Pages
1. Go to your repo: `github.com/yashmodi/thenutsbowl`
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select **Deploy from a branch**
4. Branch: `main` | Folder: `/ (root)`
5. Click **Save**

Your site will be live at: `https://yashmodi.github.io/thenutsbowl`
(Takes 1-2 minutes to propagate)

---

## 🌐 Custom Domain Setup (Later)

1. Edit the `CNAME` file and add your domain (e.g., `thenutsbowl.com`)
2. In your domain registrar's DNS settings, add:
   - `A` records pointing to GitHub's IPs:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - Or a `CNAME` record: `www` → `yashmodi.github.io`
3. In GitHub Pages settings, add your custom domain and enable **Enforce HTTPS**

---

## 🍇 Adding Your Logo

1. Place your logo file at: `assets/logo.png`
   - Recommended: PNG with transparent background
   - Ideal size: 200×60px or similar horizontal format
2. The page will automatically use it in the navbar and footer

---

## 📁 File Structure

```
thenutsbowl/
├── index.html          ← Main landing page
├── css/style.css       ← All styles
├── js/main.js          ← Interactions & animations
├── assets/
│   ├── logo.png        ← Your logo (replace this!)
│   └── images/         ← Product images (optional)
├── CNAME               ← Custom domain (add domain here)
└── README.md           ← This file
```

---

## 🎨 Customizing Colors

Edit `css/style.css` — find the `:root` block at the top:

```css
:root {
  --accent: #c96a2e;   /* Main brand color — change this */
  --cream:  #fdf8f3;   /* Background */
  /* ... */
}
```

---

Made with 🍇 by The Nut Bowl
