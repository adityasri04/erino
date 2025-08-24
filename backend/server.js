const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Check if we're in demo mode (no database)
const isDemoMode = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('[YOUR-PASSWORD]');

// Demo data storage
let demoLeads = [
  {
    id: 1,
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0101',
    company: 'TechCorp',
    city: 'San Francisco',
    state: 'CA',
    source: 'website',
    status: 'new',
    score: 75,
    lead_value: 5000.00,
    is_qualified: false,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.j@techstart.com',
    phone: '+1-555-0102',
    company: 'TechStart',
    city: 'New York',
    state: 'NY',
    source: 'google_ads',
    status: 'contacted',
    score: 85,
    lead_value: 7500.00,
    is_qualified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    first_name: 'Alice',
    last_name: 'Williams',
    email: 'alice@newcorp.com',
    phone: '+1-555-0103',
    company: 'NewCorp',
    city: 'Chicago',
    state: 'IL',
    source: 'referral',
    status: 'contacted',
    score: 85,
    lead_value: 3000.00,
    is_qualified: false,
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    first_name: 'Bob',
    last_name: 'Brown',
    email: 'bob@example.com',
    phone: '+1-555-0104',
    company: 'Innovate Inc.',
    city: 'Austin',
    state: 'TX',
    source: 'website',
    status: 'qualified',
    score: 90,
    lead_value: 10000.00,
    is_qualified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    first_name: 'Charlie',
    last_name: 'Davis',
    email: 'charlie@solutions.net',
    phone: '+1-555-0105',
    company: 'Solutions Co.',
    city: 'Seattle',
    state: 'WA',
    source: 'facebook_ads',
    status: 'new',
    score: 60,
    lead_value: 2500.00,
    is_qualified: false,
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    first_name: 'Diana',
    last_name: 'Miller',
    email: 'diana@global.org',
    phone: '+1-555-0106',
    company: 'Global Corp',
    city: 'Miami',
    state: 'FL',
    source: 'events',
    status: 'lost',
    score: 40,
    lead_value: 1500.00,
    is_qualified: false,
    created_at: new Date().toISOString()
  },
  {
    id: 7,
    first_name: 'Eve',
    last_name: 'Wilson',
    email: 'eve@techsolutions.com',
    phone: '+1-555-0107',
    company: 'Tech Solutions',
    city: 'Boston',
    state: 'MA',
    source: 'google_ads',
    status: 'won',
    score: 95,
    lead_value: 12000.00,
    is_qualified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 8,
    first_name: 'Frank',
    last_name: 'Moore',
    email: 'frank@data.io',
    phone: '+1-555-0108',
    company: 'Data Insights',
    city: 'Denver',
    state: 'CO',
    source: 'referral',
    status: 'qualified',
    score: 88,
    lead_value: 6000.00,
    is_qualified: true,
    created_at: new Date().toISOString()
  },
  {
    id: 9,
    first_name: 'Grace',
    last_name: 'Taylor',
    email: 'grace@innovate.co',
    phone: '+1-555-0109',
    company: 'Innovate Co.',
    city: 'Portland',
    state: 'OR',
    source: 'website',
    status: 'new',
    score: 70,
    lead_value: 4000.00,
    is_qualified: false,
    created_at: new Date().toISOString()
  },
  {
    id: 10,
    first_name: 'Henry',
    last_name: 'Anderson',
    email: 'henry@enterprise.com',
    phone: '+1-555-0110',
    company: 'Enterprise Solutions',
    city: 'Dallas',
    state: 'TX',
    source: 'events',
    status: 'contacted',
    score: 80,
    lead_value: 5500.00,
    is_qualified: true,
    created_at: new Date().toISOString()
  }
];
let nextLeadId = demoLeads.length + 1;

if (isDemoMode) {
  console.log('🚨 Running in DEMO MODE - No database connection');
  console.log('📝 Set up DATABASE_URL in .env file for full functionality');
}

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mode: isDemoMode ? 'demo' : 'production'
  });
});

// Demo mode endpoints for testing
if (isDemoMode) {
  // In-memory storage for demo users
  const demoUsers = [
    {
      id: 1,
      email: 'test@erino.com',
      password: 'test123', // In real app, this would be hashed
      first_name: 'Test',
      last_name: 'User',
      created_at: new Date().toISOString()
    }
  ];

  // Demo registration endpoint
  app.post('/api/auth/register', (req, res) => {
    console.log('Registration request received:', {
      body: req.body,
      headers: req.headers,
      timestamp: new Date().toISOString()
    });
    
    const { first_name, last_name, email, password } = req.body;
    
    console.log('Extracted fields:', { first_name, last_name, email, password });
    
    // Simple validation
    if (!first_name || !last_name || !email || !password) {
      console.log('Validation failed - missing fields:', { 
        hasFirstName: !!first_name, 
        hasLastName: !!last_name, 
        hasEmail: !!email, 
        hasPassword: !!password 
      });
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }
    
    if (password.length < 6) {
      console.log('Validation failed - password too short:', password.length);
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    console.log('Validation passed, creating user...');
    
    // Check if user already exists
    const existingUser = demoUsers.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    // Create new user
    const newUser = {
      id: Date.now(),
      email: email,
      password: password, // In real app, this would be hashed
      first_name: first_name,
      last_name: last_name,
      created_at: new Date().toISOString()
    };
    
    // Add to demo users array
    demoUsers.push(newUser);
    
    // Set demo JWT cookie for immediate login
    const token = 'demo-jwt-token-' + newUser.id + '-' + Date.now();
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          first_name: newUser.first_name,
          last_name: newUser.last_name
        }
      }
    });
  });

  // Demo login endpoint
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    // Find user in demo users array
    const user = demoUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Set demo JWT cookie
      const token = 'demo-jwt-token-' + user.id + '-' + Date.now();
      res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name
          }
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
  });

  // Demo logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  });

  // Demo current user endpoint
  app.get('/api/auth/me', (req, res) => {
    const token = req.cookies.token;
    if (token && token.startsWith('demo-jwt-token-')) {
      // Extract user ID from token
      const tokenParts = token.split('-');
      const userId = parseInt(tokenParts[3]);
      
      // Find user in demo users array
      const user = demoUsers.find(u => u.id === userId);
      
      if (user) {
        res.status(200).json({
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name
            }
          }
        });
      } else {
        res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }
    } else {
      res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }
  });

  // Demo leads endpoint
  app.get('/api/leads', (req, res) => {
    const token = req.cookies.token;
    if (!token || !token.startsWith('demo-jwt-token-')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    let filteredLeads = [...demoLeads]; // Start with all leads

    // Apply filters based on query parameters
    const { status, source, search, score_min, score_max } = req.query;

    // Filter by status
    if (status && status !== 'all') {
      filteredLeads = filteredLeads.filter(lead => lead.status === status);
    }

    // Filter by source
    if (source && source !== 'all') {
      filteredLeads = filteredLeads.filter(lead => lead.source === source);
    }

    // Search filter (searches in name, email, company, city)
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLeads = filteredLeads.filter(lead => 
        lead.first_name.toLowerCase().includes(searchLower) ||
        lead.last_name.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower) ||
        lead.company.toLowerCase().includes(searchLower) ||
        lead.city.toLowerCase().includes(searchLower)
      );
    }

    // Filter by score range
    if (score_min) {
      filteredLeads = filteredLeads.filter(lead => lead.score >= parseInt(score_min));
    }
    if (score_max) {
      filteredLeads = filteredLeads.filter(lead => lead.score <= parseInt(score_max));
    }

    // Return filtered demo data
    res.status(200).json({
      success: true,
      data: filteredLeads,
      pagination: {
        page: 1,
        limit: 20,
        total: filteredLeads.length,
        totalPages: 1
      }
    });
  });

  // Demo lead by ID endpoint
  app.get('/api/leads/:id', (req, res) => {
    const token = req.cookies.token;
    if (!token || !token.startsWith('demo-jwt-token-')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const leadId = parseInt(req.params.id);
    
    // Find lead in actual storage
    const lead = demoLeads.find(l => l.id === leadId);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { lead }
    });
  });

  // Demo create lead endpoint
  app.post('/api/leads', (req, res) => {
    const token = req.cookies.token;
    if (!token || !token.startsWith('demo-jwt-token-')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Create new lead with generated ID
    const newLead = {
      id: nextLeadId++,
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add to storage
    demoLeads.push(newLead);

    res.status(201).json({
      success: true,
      message: 'Demo lead created successfully',
      data: { lead: newLead }
    });
  });

  // Demo update lead endpoint
  app.put('/api/leads/:id', (req, res) => {
    const token = req.cookies.token;
    if (!token || !token.startsWith('demo-jwt-token-')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const leadId = parseInt(req.params.id);
    
    // Find and update lead in storage
    const leadIndex = demoLeads.findIndex(l => l.id === leadId);
    
    if (leadIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    // Update the lead
    const updatedLead = {
      ...demoLeads[leadIndex],
      ...req.body,
      id: leadId, // Ensure ID doesn't change
      updated_at: new Date().toISOString()
    };

    demoLeads[leadIndex] = updatedLead;

    res.status(200).json({
      success: true,
      message: 'Demo lead updated successfully',
      data: { lead: updatedLead }
    });
  });

  // Demo delete lead endpoint
  app.delete('/api/leads/:id', (req, res) => {
    const token = req.cookies.token;
    if (!token || !token.startsWith('demo-jwt-token-')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const leadId = parseInt(req.params.id);
    
    // Find and remove lead from storage
    const leadIndex = demoLeads.findIndex(l => l.id === leadId);
    
    if (leadIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    // Remove the lead
    const deletedLead = demoLeads.splice(leadIndex, 1)[0];

    res.status(200).json({
      success: true,
      message: 'Demo lead deleted successfully',
      data: { lead: deletedLead }
    });
  });

  console.log('✅ Demo mode endpoints configured');
} else {
  // Production mode - use actual database routes
  const authRoutes = require('./routes/auth');
  const leadRoutes = require('./routes/leads');
  const { errorHandler } = require('./middleware/errorHandler');

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/leads', leadRoutes);

  // Error handling middleware
  app.use(errorHandler);
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🎭 Mode: ${isDemoMode ? 'DEMO' : 'PRODUCTION'}`);
});

module.exports = app;
