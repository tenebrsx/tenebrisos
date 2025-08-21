# Tenebris OS Deployment Guide

This guide covers multiple deployment options for Tenebris OS, from simple static hosting to advanced production deployments.

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended)

Vercel offers excellent React/Vite support with zero configuration needed.

#### Deploy from GitHub
1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your repository
4. Vercel will auto-detect Vite and configure build settings
5. Click "Deploy" - your site will be live in minutes!

#### Deploy via CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project root
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? [Select your account]
# - Link to existing project? No
# - Project name? tenebris-os
# - Directory? ./
# - Override settings? No
```

#### Custom Domain Setup
```bash
# Add custom domain
vercel domains add yourdomain.com
vercel alias your-deployment-url.vercel.app yourdomain.com
```

### Option 2: Netlify

Great for static sites with easy continuous deployment.

#### Deploy via Drag & Drop
1. Build your project: `npm run build`
2. Visit [netlify.com](https://netlify.com)
3. Drag the `dist` folder to the deploy area
4. Your site is live instantly!

#### Deploy from Git
1. Connect your GitHub repository
2. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Deploy automatically on every push

#### Netlify Configuration
Create `netlify.toml` in project root:
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"
```

### Option 3: GitHub Pages

Free hosting directly from your GitHub repository.

#### Setup GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

#### Configure Vite for GitHub Pages
Update `vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/', // Add this line
  server: {
    port: 3000,
    open: true
  }
})
```

## 🛠 Advanced Deployment

### Option 4: Docker Deployment

For containerized deployments and better control.

#### Create Dockerfile
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Create nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # Enable gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
        
        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

#### Build and Run
```bash
# Build image
docker build -t tenebris-os .

# Run container
docker run -p 80:80 tenebris-os

# Or with docker-compose
echo "version: '3.8'
services:
  tenebris-os:
    build: .
    ports:
      - '80:80'
    restart: unless-stopped" > docker-compose.yml

docker-compose up -d
```

### Option 5: Railway

Simple deployment with automatic builds.

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

Add `railway.toml`:
```toml
[build]
  builder = "NIXPACKS"

[deploy]
  startCommand = "npm run build && npx serve dist"
  restartPolicyType = "ON_FAILURE"
  restartPolicyMaxRetries = 10
```

## 🔧 Build Optimization

### Production Build Settings

Update `vite.config.js` for production:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animations: ['framer-motion'],
          ui: ['lucide-react', 'clsx'],
          utils: ['date-fns']
        }
      }
    },
    // Enable source maps for debugging (optional)
    sourcemap: false,
    // Minimize bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react']
  }
})
```

### Environment Variables

Create `.env.production`:
```bash
VITE_APP_TITLE=Tenebris OS
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Personal Productivity Operating System
```

Update `index.html` to use environment variables:
```html
<title>%VITE_APP_TITLE%</title>
<meta name="description" content="%VITE_APP_DESCRIPTION%">
```

## 🔍 Performance Optimization

### Bundle Analysis
```bash
# Install bundle analyzer
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.js
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true
    })
  ]
})

# Build and analyze
npm run build
```

### PWA Setup (Optional)

Add Progressive Web App capabilities:

```bash
npm install vite-plugin-pwa workbox-window
```

Update `vite.config.js`:
```javascript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Tenebris OS',
        short_name: 'TenebrisOS',
        description: 'Personal Productivity Operating System',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        icons: [
          {
            src: 'vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ]
})
```

## 🔐 Security & Headers

### Security Headers (Netlify)
Create `_headers` file in `public/`:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self'; img-src 'self' data: https:; connect-src 'self';
```

### Security Headers (Vercel)
Create `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Build Fails with "Cannot resolve module"
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. Blank page after deployment
- Check browser console for errors
- Verify `base` path in `vite.config.js`
- Ensure routing configuration is correct

#### 3. Assets not loading
- Check network tab in browser dev tools
- Verify asset paths are correct
- Check server configuration for static files

#### 4. Performance issues
```bash
# Check bundle size
npm run build
npx serve dist

# Analyze with lighthouse
npm install -g lighthouse
lighthouse http://localhost:3000
```

### Build Optimization Tips

1. **Code Splitting**: Split large components into separate chunks
2. **Lazy Loading**: Load components only when needed
3. **Asset Optimization**: Compress images and fonts
4. **Tree Shaking**: Remove unused code
5. **Caching**: Set proper cache headers

### Monitoring & Analytics

#### Add Error Monitoring
```bash
npm install @sentry/react @sentry/tracing
```

#### Add Analytics (Optional)
```javascript
// Add to main.jsx
if (import.meta.env.PROD) {
  // Add your analytics code here
  console.log('Production mode - analytics enabled')
}
```

## 📊 Performance Benchmarks

Target metrics for optimal performance:

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **First Input Delay**: < 100ms
- **Cumulative Layout Shift**: < 0.1
- **Bundle Size**: < 500KB gzipped

Test your deployment:
```bash
# Lighthouse audit
lighthouse https://your-domain.com --output html --output-path report.html

# Bundle size check
npm run build
ls -la dist/assets/
```

## 🚀 Going Live Checklist

- [ ] Domain configured and SSL enabled
- [ ] Performance optimization applied
- [ ] Security headers configured
- [ ] Error monitoring set up
- [ ] Analytics implemented (if needed)
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured
- [ ] Documentation updated
- [ ] Team access configured

Your Tenebris OS is now ready for production! 🎉

For questions or issues, refer to the main README.md or create an issue in the repository.