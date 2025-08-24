# Quick Start Guide

Get your Lead Management System running locally in minutes!

## Prerequisites

- Node.js 16+ and npm
- PostgreSQL database (or use Supabase for free)

## 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://username:password@localhost:5432/erino_db
FRONTEND_URL=http://localhost:3000
```

## 2. Database Setup

### Option A: Local PostgreSQL
1. Create database: `createdb erino_db`
2. Run schema: `psql erino_db < ../database/schema.sql`
3. Run seed data: `psql erino_db < ../database/seed.sql`

### Option B: Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Run the SQL from `database/schema.sql` and `database/seed.sql`
4. Update your `.env` with Supabase connection details

## 3. Frontend Setup

```bash
cd frontend
npm install
```

## 4. Start the Application

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

## 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## 6. Test Account

- **Email**: test@erino.com
- **Password**: test123

## 7. Features to Test

✅ **Authentication**
- Register new user
- Login/logout
- JWT with httpOnly cookies

✅ **Lead Management**
- Create new lead
- View leads in AG Grid
- Edit existing lead
- Delete lead
- Server-side pagination
- Advanced filtering

✅ **Security**
- Protected routes
- 401 responses for unauthorized requests
- Input validation

## 8. Next Steps

1. **Deploy to Production**: Follow `docs/DEPLOYMENT.md`
2. **Customize**: Modify colors, branding, and fields
3. **Extend**: Add more features like email integration, reporting, etc.

## Troubleshooting

- **Port conflicts**: Change PORT in backend `.env`
- **Database connection**: Verify DATABASE_URL format
- **CORS issues**: Check FRONTEND_URL in backend `.env`
- **Build errors**: Ensure Node.js version compatibility

## Support

- Check the logs in both terminal windows
- Verify all environment variables are set
- Ensure database is running and accessible

---

**Happy coding! 🚀**
