# 🔐 WitnessOS Admin Credentials & API Access Guide

## 📧 Admin User Details
- **Email**: `sheshnarayan.iyer@gmail.com`
- **Default Password**: `WitnessOS2025!` (after reset)
- **Full Name**: Cumbipuram Nateshan Sheshanarayan Iyer
- **Birth Data**: 1991-08-13 at 13:31, Bengaluru India (12.9629°N, 77.5775°E)

## 🚀 Quick Access Methods (Choose One)

### **Option A: Automated Reset Script (Recommended)**
```bash
# Run the automated reset script
node scripts/reset-admin-password.js
```
**What it does:**
1. ✅ Requests password reset token
2. ✅ Resets password to `WitnessOS2025!`
3. ✅ Logs in with new password
4. ✅ Generates API key for Raycast
5. ✅ Tests API key functionality

**Output:** Complete credentials ready for Raycast extension

### **Option B: Manual API Calls**
```bash
# 1. Request reset token
curl -X POST https://api.witnessos.space/auth/request-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "sheshnarayan.iyer@gmail.com"}'

# 2. Reset password (use token from step 1)
curl -X POST https://api.witnessos.space/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sheshnarayan.iyer@gmail.com",
    "newPassword": "WitnessOS2025!",
    "resetToken": "YOUR_RESET_TOKEN_HERE"
  }'

# 3. Login to get JWT
curl -X POST https://api.witnessos.space/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sheshnarayan.iyer@gmail.com",
    "password": "WitnessOS2025!"
  }'

# 4. Generate API key (use JWT from step 3)
curl -X POST https://api.witnessos.space/api/developer/keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raycast Extension",
    "description": "API key for Raycast WitnessOS extension",
    "environment": "live",
    "scopes": [
      "engines:numerology:read",
      "engines:human_design:read",
      "engines:tarot:read",
      "engines:biorhythm:read",
      "engines:iching:read",
      "user:profile:read"
    ]
  }'
```

### **Option C: Use Developer Dashboard**
1. Open WitnessOS app
2. Click 🔧 API button (we built this)
3. Go to "API Keys" tab
4. Create new key named "Raycast Extension"
5. Copy the generated API key

## 🔑 Expected Credentials After Reset

### **Login Credentials**
```
Email: sheshnarayan.iyer@gmail.com
Password: WitnessOS2025!
```

### **API Access**
```
API Key Format: wos_live_[32-character-string]
Example: wos_live_abc123def456ghi789jkl012mno345pq
Base URL: https://api.witnessos.space
```

### **JWT Token (7-day expiration)**
```
Format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Expires: 7 days from generation
Use: Temporary access or API key generation
```

## 🎯 Raycast Extension Configuration

### **Required Preferences**
```
API Token: [Your generated API key]
API Base URL: https://api.witnessos.space
User Profile: Cumbipuram Nateshan Sheshanarayan Iyer
Birth Date: 1991-08-13
Birth Time: 13:31
Birth Location: Bengaluru, India
Birth Latitude: 12.9629
Birth Longitude: 77.5775
```

### **Auto-Configuration with Admin Profile**
The admin profile configuration file automatically provides:
- ✅ All birth data and personal information
- ✅ Engine input parameter generation
- ✅ Consciousness profile data
- ✅ Tier 3 preferences (direction: east, card: alchemist)
- ✅ Enterprise tier access (all engines unlocked)

## 🔧 Development & Debug Setup

### **KV Storage for Credentials**
```javascript
// Store admin credentials in Cloudflare KV
await env.ADMIN_SECRETS.put('admin:credentials', JSON.stringify({
  email: 'sheshnarayan.iyer@gmail.com',
  password: 'WitnessOS2025!',
  apiKey: 'wos_live_your_generated_key',
  jwtToken: 'your_jwt_token'
}));

// Retrieve credentials
const credentials = JSON.parse(await env.ADMIN_SECRETS.get('admin:credentials'));
```

### **Environment Variables**
```bash
# .env file for local development
JWT_SECRET=dev-jwt-secret-key
ENVIRONMENT=development
API_BASE_URL=https://api.witnessos.space
ADMIN_EMAIL=sheshnarayan.iyer@gmail.com
ADMIN_PASSWORD=WitnessOS2025!
```

### **Wrangler Configuration**
```toml
# wrangler.toml
[env.development.vars]
ENVIRONMENT = "development"
API_BASE_URL = "https://api.witnessos.space"

[[env.development.kv_namespaces]]
binding = "ADMIN_SECRETS"
id = "your-kv-namespace-id"
```

## 🧪 Testing API Access

### **Test Numerology Engine**
```bash
curl -X POST https://api.witnessos.space/engines/numerology/calculate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "birth_date": "1991-08-13",
      "full_name": "Cumbipuram Nateshan Sheshanarayan Iyer"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "calculation": {
      "life_path": 8,
      "expression": 3,
      "soul_urge": 11,
      "personality": 6
    }
  }
}
```

## 🔒 Security Notes

### **Password Policy**
- ✅ Minimum 6 characters (backend requirement)
- ✅ Default: `WitnessOS2025!` (strong password)
- ✅ Can be changed after reset

### **API Key Security**
- ✅ Long-term access (no expiration unless set)
- ✅ Scoped permissions (only requested engines)
- ✅ Revocable through developer dashboard
- ✅ Rate limited (enterprise tier: 1000/min)

### **JWT Token Security**
- ✅ 7-day expiration
- ✅ Stateless authentication
- ✅ Automatically invalidated on password reset

## 🚨 Troubleshooting

### **Common Issues**
1. **"User not found"** → Admin user doesn't exist in database
2. **"Invalid token"** → Reset token expired (1 hour limit)
3. **"Login failed"** → Wrong password or account locked
4. **"API key generation failed"** → JWT token expired or invalid

### **Solutions**
1. **Check database** → Verify admin user exists
2. **Generate new token** → Reset tokens expire in 1 hour
3. **Use reset script** → Automated solution handles all steps
4. **Check logs** → Cloudflare Workers logs show detailed errors

## 📞 Support Commands

### **Check Admin User Exists**
```sql
SELECT id, email, name, is_admin, created_at 
FROM users 
WHERE email = 'sheshnarayan.iyer@gmail.com';
```

### **Verify API Key**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.witnessos.space/auth/me
```

### **Test Engine Access**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.witnessos.space/engines
```

---

## 🎯 Recommended Approach

**For immediate Raycast extension setup:**
1. Run `node scripts/reset-admin-password.js`
2. Copy the generated API key
3. Configure Raycast extension preferences
4. Test with consciousness engine calculations

This provides the most reliable, automated setup with full testing and validation.
