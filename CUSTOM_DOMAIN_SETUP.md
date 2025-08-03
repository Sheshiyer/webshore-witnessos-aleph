# 🌐 WitnessOS Custom Domain Configuration

## Domain Structure
- **Frontend**: `https://witnessos.space`
- **API**: `https://api.witnessos.space/api/docs`
- **Health**: `https://api.witnessos.space/api/health`

---

## 🔧 Cloudflare Pages Custom Domain Setup

### Step 1: Configure Frontend Domain (witnessos.space)
1. **Go to Cloudflare Pages Dashboard**
   - Visit: https://dash.cloudflare.com/pages
   - Select: `witnessos-frontend` project

2. **Add Custom Domain**
   - Click "Custom domains" tab
   - Click "Set up a custom domain"
   - Enter: `witnessos.space`
   - Click "Continue"

3. **DNS Configuration**
   - Cloudflare will automatically configure DNS
   - Verify CNAME record: `witnessos.space` → `witnessos-frontend.pages.dev`
   - SSL certificate will be automatically provisioned

### Step 2: Configure API Subdomain (api.witnessos.space)
1. **Create API Worker/Pages Project**
   - This should point to your Railway backend or Workers API
   - Configure: `api.witnessos.space` → Railway backend URL

2. **DNS Configuration**
   - Add CNAME record: `api.witnessos.space` → Railway backend URL
   - Or configure as Cloudflare Worker if using Workers

---

## 🚀 Deployment with Custom Domain

### Build and Deploy
```bash
# Build with custom domain configuration
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy .next --project-name=witnessos-frontend

# The deployment will automatically use witnessos.space once configured
```

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=https://api.witnessos.space
NEXT_PUBLIC_SITE_URL=https://witnessos.space
NEXT_PUBLIC_ENVIRONMENT=production
```

---

## 🔗 URL Structure

### Frontend Routes (witnessos.space)
- **Homepage**: `https://witnessos.space`
- **Engines**: `https://witnessos.space/engines`
- **Individual Engine**: `https://witnessos.space/engines/human_design`
- **Onboarding**: `https://witnessos.space/onboarding`

### API Routes (api.witnessos.space)
- **API Docs**: `https://api.witnessos.space/api/docs`
- **Health Check**: `https://api.witnessos.space/api/health`
- **Engine List**: `https://api.witnessos.space/api/engines`
- **Calculate**: `https://api.witnessos.space/api/engines/{engine}/calculate`
- **Swiss Ephemeris**: `https://api.witnessos.space/api/swiss_ephemeris/calculate`

---

## 🔄 Redirect Configuration

The `_redirects` file configures:
- API calls from frontend → `api.witnessos.space`
- Documentation routes → API docs
- Health checks → API health endpoint
- All other routes → Frontend SPA

---

## 🧪 Testing Custom Domain

### Frontend Testing
```bash
# Test homepage
curl -I https://witnessos.space

# Test engine page
curl -I https://witnessos.space/engines

# Test API connectivity from frontend
# (Should automatically route to api.witnessos.space)
```

### API Testing
```bash
# Test API health
curl https://api.witnessos.space/api/health

# Test API docs
curl -I https://api.witnessos.space/api/docs

# Test engine calculation
curl -X POST https://api.witnessos.space/api/engines/numerology/calculate \
  -H "Content-Type: application/json" \
  -d '{"input":{"birth_date":"1991-08-13","full_name":"Test User"}}'
```

---

## 📊 Expected Results

### After Configuration
- **Frontend**: Professional `witnessos.space` URL
- **API**: Clean `api.witnessos.space/api/docs` documentation
- **SSL**: Automatic HTTPS for both domains
- **Performance**: Cloudflare CDN optimization
- **SEO**: Better search engine optimization with custom domain

### User Experience
- **Professional Branding**: Custom domain enhances credibility
- **Clean URLs**: Easy to remember and share
- **Fast Loading**: Cloudflare global CDN
- **Secure**: Automatic SSL certificates

---

## 🔧 Troubleshooting

### Common Issues
1. **DNS Propagation**: May take up to 24 hours
2. **SSL Certificate**: Usually provisions within minutes
3. **API Routing**: Verify backend is accessible at api.witnessos.space

### Verification Steps
1. **Check DNS**: Use `dig witnessos.space` and `dig api.witnessos.space`
2. **Test SSL**: Verify HTTPS works on both domains
3. **API Connectivity**: Ensure frontend can reach API endpoints
4. **CORS**: Verify API allows requests from witnessos.space

---

## 🌟 Benefits of Custom Domain

### Professional Presentation
- **Brand Recognition**: witnessos.space reinforces brand identity
- **Trust**: Custom domains appear more professional
- **SEO**: Better search engine ranking potential
- **Sharing**: Easier to remember and share URLs

### Technical Advantages
- **CDN**: Cloudflare's global content delivery network
- **SSL**: Automatic certificate management
- **Analytics**: Better tracking and analytics
- **Performance**: Optimized routing and caching

---

**Status**: Ready for custom domain configuration in Cloudflare dashboard
