# Lead Management System

A full-stack Lead Management System built with React, Express, and PostgreSQL.

## Features

- **Authentication**: JWT-based auth with httpOnly cookies
- **Lead Management**: Full CRUD operations for leads
- **Advanced Filtering**: Server-side filtering with multiple operators
- **Pagination**: Server-side pagination for optimal performance
- **Modern UI**: Built with React and AG Grid
- **Fully Deployed**: Frontend on Vercel, Backend on Supabase

## Tech Stack

- **Frontend**: React.js, AG Grid, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT with httpOnly cookies
- **Deployment**: Vercel (Frontend), Supabase (Backend)

## Project Structure

```
erino/
├── frontend/          # React frontend application
├── backend/           # Express backend API
├── database/          # Database schema and migrations
└── docs/             # Documentation and deployment guides
```

## Quick Start

1. **Frontend**: Navigate to `frontend/` and run `npm install && npm start`
2. **Backend**: Navigate to `backend/` and run `npm install && npm run dev`
3. **Database**: Follow the Supabase setup guide in `docs/`

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

### Leads
- `POST /leads` - Create lead
- `GET /leads` - List leads with pagination & filters
- `GET /leads/:id` - Get single lead
- `PUT /leads/:id` - Update lead
- `DELETE /leads/:id` - Delete lead

## Deployment

- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Supabase Edge Functions
- **Database**: PostgreSQL on Supabase

## Test Account

- **Email**: test@erino.com
- **Password**: test123

## License

MIT
