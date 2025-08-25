const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['https://frontend-dnqyl6hra-adityasri04s-projects.vercel.app', 'http://localhost:3000'],
  credentials: true
}));

// Demo data storage (in-memory for demo purposes)
let users = [
  {
    id: 1,
    first_name: 'Demo',
    last_name: 'User',
    email: 'demo@erino.com',
    password_hash: '$2b$10$demo.hash.for.testing.purposes.only',
    created_at: new Date().toISOString()
  }
];

let leads = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  user_id: 1,
  first_name: `Demo${i + 1}`,
  last_name: 'Lead',
  email: `demo${i + 1}@example.com`,
  phone: `+1-555-${String(i + 1000).padStart(4, '0')}`,
  company: `Company ${i + 1}`,
  city: `City ${i + 1}`,
  state: `State ${i + 1}`,
  source: ['website', 'facebook_ads', 'google_ads', 'referral', 'events'][i % 5],
  status: ['new', 'contacted', 'qualified', 'lost', 'won'][i % 5],
  score: Math.floor(Math.random() * 100) + 1,
  lead_value: Math.floor(Math.random() * 10000) + 1000,
  is_qualified: i % 3 === 0,
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
  updated_at: new Date(Date.now() - i * 86400000).toISOString()
}));

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Backend API is working!'
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Express.js Backend is working!',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // Validate input
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = {
      id: users.length + 1,
      first_name,
      last_name,
      email,
      password_hash,
      created_at: new Date().toISOString()
    };

    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '24h' });

    // Set cookie
    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { 
        id: newUser.id, 
        first_name: newUser.first_name, 
        last_name: newUser.last_name, 
        email: newUser.email 
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    // Set cookie
    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: { 
        id: user.id, 
        first_name: user.first_name, 
        last_name: user.last_name, 
        email: user.email 
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

app.get('/api/auth/current-user', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: { 
        id: user.id, 
        first_name: user.first_name, 
        last_name: user.last_name, 
        email: user.email, 
        created_at: user.created_at 
      }
    });

  } catch (error) {
    console.error('Current user error:', error);
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth-token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Leads routes
app.get('/api/leads', authenticateToken, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;

    // Filter leads by user_id
    const userLeads = leads.filter(lead => lead.user_id === req.user.userId);
    const total = userLeads.length;
    const paginatedLeads = userLeads.slice(offset, offset + limit);

    res.json({
      success: true,
      data: paginatedLeads,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leads' });
  }
});

app.post('/api/leads', authenticateToken, (req, res) => {
  try {
    const { first_name, last_name, email, phone, company, city, state, source, status, score, lead_value } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ success: false, message: 'First name, last name, and email are required' });
    }

    // Create new lead
    const newLead = {
      id: leads.length + 1,
      user_id: req.user.userId,
      first_name,
      last_name,
      email,
      phone: phone || '',
      company: company || '',
      city: city || '',
      state: state || '',
      source: source || 'website',
      status: status || 'new',
      score: score || 50,
      lead_value: lead_value || 0,
      is_qualified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    leads.push(newLead);

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: newLead
    });

  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ success: false, message: 'Failed to create lead' });
  }
});

app.get('/api/leads/:id', authenticateToken, (req, res) => {
  try {
    const leadId = parseInt(req.params.id);
    const lead = leads.find(l => l.id === leadId && l.user_id === req.user.userId);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.json({ success: true, data: lead });

  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lead' });
  }
});

app.put('/api/leads/:id', authenticateToken, (req, res) => {
  try {
    const leadId = parseInt(req.params.id);
    const leadIndex = leads.findIndex(l => l.id === leadId && l.user_id === req.user.userId);

    if (leadIndex === -1) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const { first_name, last_name, email, phone, company, city, state, source, status, score, lead_value } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ success: false, message: 'First name, last name, and email are required' });
    }

    // Update lead
    leads[leadIndex] = {
      ...leads[leadIndex],
      first_name,
      last_name,
      email,
      phone: phone || '',
      company: company || '',
      city: city || '',
      state: state || '',
      source: source || 'website',
      status: status || 'new',
      score: score || 50,
      lead_value: lead_value || 0,
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: leads[leadIndex]
    });

  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ success: false, message: 'Failed to update lead' });
  }
});

app.delete('/api/leads/:id', authenticateToken, (req, res) => {
  try {
    const leadId = parseInt(req.params.id);
    const leadIndex = leads.findIndex(l => l.id === leadId && l.user_id === req.user.userId);

    if (leadIndex === -1) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Remove lead
    leads.splice(leadIndex, 1);

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });

  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete lead' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    method: req.method,
    message: 'Try /test or /health endpoints'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
