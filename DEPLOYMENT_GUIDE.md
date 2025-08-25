# 🚀 **Detailed Redeployment Guide - Lead Management System**

This guide provides step-by-step instructions to redeploy your Lead Management System to production.

## 📋 **Prerequisites**

- [Supabase Account](https://supabase.com) (Free tier available)
- [Vercel Account](https://vercel.com) (Free tier available)
- [GitHub Account](https://github.com) with your `erino` repository
- Node.js 18+ installed locally
- Supabase CLI installed (will be installed automatically if missing)

## 🔧 **Phase 1: Supabase Backend Setup**

### **Step 1.1: Create New Supabase Project**

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Click "New Project"**
3. **Choose your organization** (create one if needed)
4. **Fill in project details:**
   - **Name:** `erino-lead-management`
   - **Database Password:** Choose a strong password (save this!)
   - **Region:** Select closest to your users
5. **Click "Create new project"**
6. **Wait for project to be created** (2-3 minutes)

### **Step 1.2: Get Project Credentials**

1. **Go to Project Settings → Database**
2. **Copy the following values:**
   - **Host:** `your-project-ref.supabase.co` (note the project reference)
   - **Database name:** `postgres`
   - **Port:** `5432`
   - **User:** `postgres`
   - **Password:** Your database password

### **Step 1.3: Set Environment Variable**

```bash
export SUPABASE_PROJECT_REF=your-project-ref
```

Replace `your-project-ref` with the actual reference from Step 1.2.

### **Step 1.4: Deploy Backend**

1. **Run the deployment script:**
   ```bash
   ./deploy.sh
   ```

2. **Choose option 1** (Supabase Backend & Database)

3. **The script will:**
   - Install Supabase CLI if needed
   - Link to your project
   - Deploy database schema
   - Seed with sample data

## 🌐 **Phase 2: Vercel Frontend Setup**

### **Step 2.1: Prepare Frontend for Production**

1. **Update environment variables in `frontend/vercel.json`:**
   ```json
   "env": {
     "REACT_APP_API_URL": "https://your-project-ref.supabase.co"
   }
   ```

2. **Replace `your-project-ref` with your actual Supabase project reference**

### **Step 2.2: Deploy to Vercel**

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import your GitHub repository:**
   - Select `erino` repository
   - **Framework Preset:** `Create React App`
   - **Root Directory:** `frontend`
4. **Configure environment variables:**
   - `REACT_APP_API_URL`: `https://your-project-ref.supabase.co`
5. **Click "Deploy"**

### **Step 2.3: Update CORS Settings**

1. **Go back to Supabase Dashboard**
2. **Navigate to Authentication → Settings**
3. **Add your Vercel domain to "Additional Redirect URLs":**
   - `https://erino-lead-management.vercel.app`
   - `https://erino-lead-management.vercel.app/auth/callback`

## 🔐 **Phase 3: Environment Configuration**

### **Step 3.1: Backend Environment Variables**

1. **Copy `backend/env.production` to `backend/.env`**
2. **Update the values with your actual credentials:**

```env
NODE_ENV=production
PORT=3001

# Database Configuration (Supabase)
DB_HOST=your-project-ref.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-actual-database-password
DB_SSL=true
DATABASE_URL=postgresql://postgres:your-actual-database-password@your-project-ref.supabase.co:5432/postgres

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_COOKIE_NAME=auth-token

# Frontend URL
FRONTEND_URL=https://erino-lead-management.vercel.app

# CORS
CORS_ORIGIN=https://erino-lead-management.vercel.app

# Security
HELMET_ENABLED=true
RATE_LIMIT_ENABLED=true
```

### **Step 3.2: Generate Strong JWT Secret**

```bash
openssl rand -base64 32
```

Copy the output and replace `your-super-secret-jwt-key-change-in-production` in your `.env` file.

## 🧪 **Phase 4: Testing the Deployment**

### **Step 4.1: Test User Credentials**

Use these credentials to test the deployed app:

- **Email:** `demo@erino.com`
- **Password:** `demo123`

### **Step 4.2: Verify Features**

1. **User Registration/Login**
2. **Lead Creation**
3. **Lead Listing with Pagination**
4. **Lead Filtering**
5. **Lead Editing/Deletion**

## 🚨 **Troubleshooting Common Issues**

### **Issue 1: CORS Errors**
- **Solution:** Check CORS configuration in Supabase
- **Verify:** Frontend URL in environment variables

### **Issue 2: Database Connection Issues**
- **Solution:** Verify database credentials
- **Check:** SSL configuration
- **Ensure:** Database is accessible

### **Issue 3: JWT Issues**
- **Solution:** Verify JWT secret is set correctly
- **Check:** Cookie settings
- **Ensure:** HTTPS is enabled

### **Issue 4: Frontend Build Failures**
- **Solution:** Check Node.js version (must be 18+)
- **Verify:** All dependencies are installed
- **Check:** Build script in package.json

## 📱 **Phase 5: Custom Domain (Optional)**

### **Step 5.1: Vercel Custom Domain**

1. **Go to Vercel Project Settings → Domains**
2. **Add your custom domain**
3. **Update DNS records as instructed**

### **Step 5.2: Supabase Custom Domain**

1. **Go to Supabase Project Settings → API**
2. **Configure custom domain if needed**

## 🎉 **Deployment Complete!**

Your Lead Management System is now deployed and accessible at:
- **Frontend:** `https://erino-lead-management.vercel.app`
- **Backend:** `https://your-project-ref.supabase.co`

## 📊 **Post-Deployment Checklist**

- [ ] Test user registration and login
- [ ] Verify lead CRUD operations
- [ ] Check pagination and filtering
- [ ] Test responsive design on mobile
- [ ] Verify all environment variables are set
- [ ] Check CORS configuration
- [ ] Monitor error logs
- [ ] Set up monitoring and alerts

## 🔄 **Redeployment Process**

To redeploy in the future:

1. **Make your code changes**
2. **Commit and push to GitHub**
3. **Run `./deploy.sh`**
4. **Choose deployment option**
5. **Verify deployment success**

## 📞 **Support Resources**

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [React Documentation](https://reactjs.org/docs)
- [GitHub Issues](https://github.com/adityasri04/erino/issues)

---

**Need help?** Check the troubleshooting section or refer to the official documentation for each platform.
