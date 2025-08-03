# WitnessOS Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 401 Error During User Registration

**Problem**: Getting a 401 Unauthorized error when trying to register a new user via `/auth/register` endpoint.

**Root Cause**: This is typically caused by missing database tables. The registration endpoint doesn't require authentication, so a 401 error usually indicates a database initialization issue.

#### Solution Steps:

1. **Initialize the Database**
   ```bash
   # For local development
   npm run db:init
   
   # For remote/production
   npm run db:init-remote
   
   # For specific environments
   npm run db:init-prod
   npm run db:init-staging
   ```

2. **Verify Database Tables**
   ```bash
   # Check local database
   wrangler d1 execute witnessos-db --local --command="SELECT name FROM sqlite_master WHERE type='table';"
   
   # Check remote database
   wrangler d1 execute witnessos-db --command="SELECT name FROM sqlite_master WHERE type='table';"
   ```

3. **Test Registration with Detailed Logging**
   ```bash
   # Start development server with logs
   npm run dev
   
   # In another terminal, test registration
   curl -X POST http://localhost:8787/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "name": "Test User"
     }'
   ```

4. **Check Console Logs**
   Look for these log messages in your development console:
   - `🔧 Initializing WitnessOSAPIHandler`
   - `📊 Database provided: true`
   - `🔐 AuthService.register called for email: ...`
   - `🔍 Checking if user already exists...`

#### Expected Database Tables:
- `users`
- `consciousness_profiles`
- `readings`
- `reading_history`
- `user_sessions`
- `password_reset_tokens`
- `email_verification_tokens`

---

### Missing KV Namespaces

**Problem**: Errors related to missing KV namespaces, especially `SECRETS`.

#### Solution:

1. **Create Missing KV Namespaces**
   ```bash
   # Create SECRETS namespace
   wrangler kv:namespace create "SECRETS"
   wrangler kv:namespace create "SECRETS" --preview
   
   # For production
   wrangler kv:namespace create "SECRETS" --env production
   wrangler kv:namespace create "SECRETS" --env production --preview
   ```

2. **Update wrangler.toml**
   Replace the placeholder IDs in `wrangler.toml` with the actual namespace IDs from the previous step.

3. **Verify KV Namespaces**
   ```bash
   wrangler kv:namespace list
   ```

---

### AI Integration Issues

**Problem**: AI-enhanced endpoints returning errors or not working.

#### Solution:

1. **Set Up AI Secrets**
   ```bash
   npm run setup:ai
   ```

2. **Test AI Integration**
   ```bash
   npm run test:ai
   ```

3. **Manual Secret Setup**
   ```bash
   # Set OpenRouter API key
   wrangler secret put OPENROUTER_API_KEY
   
   # Or use KV secrets (recommended)
   wrangler kv:key put --binding=SECRETS "ai:openrouter:api_key" "your-api-key-here"
   ```

---

### Development Server Issues

**Problem**: Development server not starting or crashing.

#### Solution:

1. **Check Node.js Version**
   ```bash
   node --version  # Should be 18+ or 20+
   ```

2. **Clear Cache and Reinstall**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Wrangler Version**
   ```bash
   wrangler --version  # Should be 3.0+
   npm install -g wrangler@latest
   ```

4. **Start with Verbose Logging**
   ```bash
   wrangler dev --local --log-level debug
   ```

---

### CORS Issues

**Problem**: CORS errors when making requests from frontend.

#### Solution:

1. **Check CORS Headers**
   The API should return these headers:
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, POST, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Authorization
   ```

2. **Test with curl (bypasses CORS)**
   ```bash
   curl -X POST http://localhost:8787/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

3. **Check Preflight Requests**
   ```bash
   curl -X OPTIONS http://localhost:8787/auth/register \
     -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type"
   ```

---

### Rate Limiting Issues

**Problem**: Getting 429 Too Many Requests errors.

#### Solution:

1. **Check Rate Limit Headers**
   ```bash
   curl -I http://localhost:8787/health
   ```
   Look for:
   - `X-RateLimit-Limit`
   - `X-RateLimit-Remaining`
   - `X-RateLimit-Reset`

2. **Adjust Rate Limits**
   In `wrangler.toml`:
   ```toml
   [env.development.vars]
   RATE_LIMIT_MAX = "1000"  # Increase limit
   RATE_LIMIT_WINDOW = "60000"  # 1 minute window
   ```

3. **Clear Rate Limit Cache**
   ```bash
   wrangler kv:key delete --binding=CACHE "rate_limit:your-client-id"
   ```

---

## 🔧 Debugging Commands

### Database Debugging
```bash
# List all tables
wrangler d1 execute witnessos-db --local --command="SELECT name FROM sqlite_master WHERE type='table';"

# Check users table structure
wrangler d1 execute witnessos-db --local --command="PRAGMA table_info(users);"

# Count users
wrangler d1 execute witnessos-db --local --command="SELECT COUNT(*) FROM users;"

# View recent users
wrangler d1 execute witnessos-db --local --command="SELECT id, email, created_at FROM users ORDER BY created_at DESC LIMIT 5;"
```

### KV Debugging
```bash
# List all KV namespaces
wrangler kv:namespace list

# List keys in a namespace
wrangler kv:key list --binding=SECRETS

# Get a specific key
wrangler kv:key get --binding=SECRETS "ai:openrouter:api_key"

# Delete a key
wrangler kv:key delete --binding=SECRETS "key-name"
```

### API Testing
```bash
# Health check
curl http://localhost:8787/health

# List engines
curl http://localhost:8787/engines

# Test registration
curl -X POST http://localhost:8787/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"debug@example.com","password":"password123","name":"Debug User"}'

# Test login
curl -X POST http://localhost:8787/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"debug@example.com","password":"password123"}'
```

---

## 📞 Getting Help

If you're still experiencing issues:

1. **Check the logs** in your development console
2. **Enable verbose logging** with detailed error messages
3. **Test with curl** to isolate frontend vs backend issues
4. **Verify your environment** (Node.js, Wrangler versions)
5. **Check Cloudflare dashboard** for any service issues

### Log Analysis

Look for these key log patterns:

**Successful Registration:**
```
🔧 Initializing WitnessOSAPIHandler
📊 Database provided: true
🔐 AuthService.register called for email: user@example.com
🔍 Checking if user already exists...
✅ User existence check completed. Existing user: false
🔒 Hashing password...
✅ Password hashed successfully
👤 Creating user in database...
📝 User creation result: { success: true, lastRowId: 1 }
📖 Fetching created user...
✅ User fetched successfully: { id: 1, email: 'user@example.com' }
🎉 User registration completed successfully
```

**Database Error:**
```
❌ Database error during user existence check: no such table: users
```

**Missing Database:**
```
📊 Database provided: false
```

This troubleshooting guide should help you resolve most common issues with WitnessOS!