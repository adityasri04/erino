# Deployment Guide

This guide will walk you through deploying the Lead Management System to production.

## Prerequisites

- GitHub account
- Vercel account (for frontend)
- Supabase account (for backend and database)

## 1. Backend Deployment (Supabase)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `erino-lead-management`
   - Database Password: Choose a strong password
   - Region: Select closest to your users
5. Click "Create new project"
6. Wait for project setup (5-10 minutes)

### Step 2: Set Up Database

1. In your Supabase dashboard, go to "SQL Editor"
2. Copy and paste the contents of `database/schema.sql`
3. Click "Run" to create the database schema
4. Copy and paste the contents of `database/seed.sql`
5. Click "Run" to insert sample data

### Step 3: Get Database Connection Details

1. Go to "Settings" → "Database"
2. Copy the following values:
   - Database URL
   - Anon Key
   - Service Role Key
   - Project URL

### Step 4: Deploy Backend as Edge Functions

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Initialize Supabase in your project:
   ```bash
   cd backend
   supabase init
   ```

4. Link to your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

5. Create the edge function:
   ```bash
   supabase functions new lead-management-api
   ```

6. Copy your backend code to `supabase/functions/lead-management-api/`

7. Update the function configuration in `supabase/functions/lead-management-api/index.ts`:
   ```typescript
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
   
   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
   }
   
   serve(async (req) => {
     if (req.method === 'OPTIONS') {
       return new Response('ok', { headers: corsHeaders })
     }
   
     try {
       const { url, method, headers, body } = req
       const supabaseUrl = Deno.env.get('SUPABASE_URL')!
       const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
       
       const supabase = createClient(supabaseUrl, supabaseServiceKey)
       
       // Your Express-like logic here
       // Convert your Express routes to Deno handlers
       
       return new Response(JSON.stringify({ message: 'Hello from Supabase Edge Function!' }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       })
     } catch (error) {
       return new Response(JSON.stringify({ error: error.message }), {
         status: 400,
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       })
     }
   })
   ```

8. Deploy the function:
   ```bash
   supabase functions deploy lead-management-api
   ```

9. Set environment variables:
   ```bash
   supabase secrets set JWT_SECRET=your-super-secret-jwt-key-here
   supabase secrets set DATABASE_URL=your-database-url
   ```

### Alternative: Deploy to Railway/Render

If you prefer traditional hosting:

1. **Railway**:
   - Connect your GitHub repo
   - Set environment variables
   - Deploy automatically

2. **Render**:
   - Create new Web Service
   - Connect GitHub repo
   - Set environment variables
   - Deploy

## 2. Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. Update API base URL in your frontend code:
   ```javascript
   // In your axios configuration
   const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend-url.com'
   ```

2. Create `.env.production` file:
   ```env
   REACT_APP_API_URL=https://your-backend-url.com
   ```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Set environment variables:
   - `REACT_APP_API_URL`: Your backend URL
6. Click "Deploy"

### Step 3: Configure Custom Domain (Optional)

1. In your Vercel project, go to "Settings" → "Domains"
2. Add your custom domain
3. Configure DNS records as instructed

## 3. Environment Variables

### Backend (.env)
```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (.env.production)
```env
REACT_APP_API_URL=https://your-backend-url.com
```

## 4. Testing Deployment

1. **Test Authentication**:
   - Try to register a new user
   - Login with test account: `test@erino.com` / `test123`
   - Verify JWT cookies are set

2. **Test Lead Operations**:
   - Create a new lead
   - View leads in the grid
   - Edit an existing lead
   - Delete a lead
   - Test filters and pagination

3. **Test Security**:
   - Try to access protected routes without authentication
   - Verify 401 responses
   - Test CORS configuration

## 5. Monitoring and Maintenance

### Supabase Dashboard
- Monitor database performance
- Check function logs
- Review API usage

### Vercel Analytics
- Monitor frontend performance
- Track user behavior
- Check error rates

### Health Checks
- Backend: `https://your-backend-url.com/health`
- Frontend: Check Vercel deployment status

## 6. Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Verify CORS configuration in backend
   - Check frontend URL in backend CORS settings

2. **Database Connection Issues**:
   - Verify DATABASE_URL format
   - Check Supabase project status
   - Verify IP allowlist if applicable

3. **JWT Issues**:
   - Verify JWT_SECRET is set
   - Check token expiration settings
   - Verify cookie settings

4. **Build Failures**:
   - Check dependency versions
   - Verify Node.js version compatibility
   - Review build logs

### Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [AG Grid Documentation](https://www.ag-grid.com/documentation)

## 7. Production Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database schema created
- [ ] Sample data inserted
- [ ] Environment variables configured
- [ ] CORS properly configured
- [ ] JWT authentication working
- [ ] All CRUD operations functional
- [ ] Pagination and filtering working
- [ ] Error handling implemented
- [ ] Health checks responding
- [ ] SSL certificates valid
- [ ] Performance monitoring enabled
- [ ] Backup strategy in place

## 8. Scaling Considerations

### Database
- Monitor query performance
- Add indexes as needed
- Consider read replicas for high traffic

### Backend
- Monitor function execution times
- Consider multiple function instances
- Implement caching strategies

### Frontend
- Enable CDN for static assets
- Implement lazy loading
- Monitor bundle sizes

---

**Note**: This deployment guide assumes you're using the latest versions of all tools. Always refer to official documentation for the most up-to-date instructions.
