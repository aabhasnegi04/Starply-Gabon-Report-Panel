# Plesk Deployment Guide for rpadmin.stpudhim.in

## Important: Plesk-Specific Steps

### Step 1: Enable Node.js in Plesk
1. Log into Plesk panel
2. Go to **Domains** → **rpadmin.stpudhim.in**
3. Click on **Node.js** (if available) or **Application Server**
4. Enable Node.js for this domain
5. Select Node.js version (14.x or higher recommended)
6. Set **Application Mode**: Production
7. Set **Application Root**: `/httpdocs` or wherever your files are
8. Set **Application Startup File**: `server.js`
9. Click **Enable Node.js** and **Apply**

### Step 2: Upload Files via Plesk File Manager
Upload these files to the domain directory (usually `/httpdocs`):
- ✅ server.js
- ✅ package.json
- ✅ package-lock.json
- ✅ web.config
- ✅ iisnode.yml
- ✅ All folders: routes, controllers, db, utils

### Step 3: Install Dependencies in Plesk
**Option A: Using Plesk Node.js Interface**
1. In Plesk → Node.js settings for your domain
2. Look for **NPM Install** button or **Package Management**
3. Click to install dependencies from package.json

**Option B: Using SSH/Terminal (if available)**
```bash
cd /var/www/vhosts/stpudhim.in/rpadmin.stpudhim.in/httpdocs
npm install
```

**Option C: Using Plesk Scheduled Tasks**
1. Go to **Tools & Settings** → **Scheduled Tasks**
2. Create a new task:
   - Command: `cd /var/www/vhosts/stpudhim.in/rpadmin.stpudhim.in/httpdocs && npm install`
   - Run once

### Step 4: Set Environment Variables (if needed)
1. In Plesk → Node.js settings
2. Look for **Environment Variables** section
3. Add:
   - `NODE_ENV` = `production`
   - `PORT` = (leave empty, Plesk sets this automatically)

### Step 5: Restart Node.js Application
1. In Plesk → Node.js settings
2. Click **Restart App** or **Restart Node.js**

## Troubleshooting in Plesk

### Check Application Logs
1. Plesk → Domains → rpadmin.stpudhim.in
2. Click **Logs** 
3. Check:
   - Error log
   - Node.js application log (if available)

### Common Plesk Issues

**Issue: "Application is not running"**
- Solution: Make sure Node.js is enabled in Plesk settings
- Check if the startup file path is correct (server.js)
- Verify Node.js version is compatible

**Issue: "Cannot find module"**
- Solution: Dependencies not installed
- Run npm install via Plesk interface or SSH

**Issue: "Port already in use"**
- Solution: Don't specify a fixed port in server.js
- Let Plesk assign the port via process.env.PORT

**Issue: Database connection fails**
- Check if Plesk firewall allows outbound connections to SQL Server
- Verify SQL Server IP: 103.127.31.218 port 1433 is accessible

### Alternative: Use Plesk's Proxy Rules Instead of web.config

If Node.js extension is enabled in Plesk, you might not need web.config at all:

1. Plesk → Apache & nginx Settings
2. Add to **Additional nginx directives**:
```nginx
location / {
    proxy_pass http://127.0.0.1:PORT;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```
(Replace PORT with the port Plesk assigns to your Node.js app)

## Quick Test
After deployment, visit:
- https://rpadmin.stpudhim.in/ 
- Should show: "Backend server is running!"

If you see errors, check the Plesk logs immediately.
