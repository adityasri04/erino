import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Supabase Edge Function configuration
Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    console.log(`Request: ${method} ${path}`)

    // Health check
    if (path === '/health' && method === 'GET') {
      return new Response(
        JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          message: 'API is working!'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Test endpoint
    if (path === '/test' && method === 'GET') {
      return new Response(
        JSON.stringify({ 
          message: 'Edge Function is working!',
          timestamp: new Date().toISOString(),
          path: path,
          method: method
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // API routes
    if (path.startsWith('/api/')) {
      const apiPath = path.replace('/api', '')
      
      // Auth routes
      if (apiPath.startsWith('/auth/')) {
        return handleAuthRoutes(apiPath, method, req)
      }
      
      // Lead routes
      if (apiPath.startsWith('/leads/')) {
        return handleLeadRoutes(apiPath, method, req)
      }
      
      if (apiPath === '/leads') {
        return handleLeadsRoute(method, req)
      }
    }

    return new Response(
      JSON.stringify({ 
        error: 'Not Found',
        path: path,
        method: method,
        message: 'Try /test or /health endpoints'
      }),
      { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleAuthRoutes(path: string, method: string, req: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  }

  if (path === '/auth/register' && method === 'POST') {
    try {
      const body = await req.json()
      const { first_name, last_name, email, password } = body

      // Validate input
      if (!first_name || !last_name || !email || !password) {
        return new Response(
          JSON.stringify({ success: false, message: 'All fields are required' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // For demo purposes, return success without database
      const user = { id: 1, first_name, last_name, email, created_at: new Date().toISOString() }
      const token = btoa(JSON.stringify({ userId: user.id, email: user.email }))

      const response = new Response(
        JSON.stringify({ 
          success: true, 
          message: 'User registered successfully (demo mode)',
          user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email }
        }),
        { 
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

      response.headers.set('Set-Cookie', `auth-token=${token}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=86400`)
      return response

    } catch (error) {
      console.error('Registration error:', error)
      return new Response(
        JSON.stringify({ success: false, message: 'Registration failed' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  }

  if (path === '/auth/login' && method === 'POST') {
    try {
      const body = await req.json()
      const { email, password } = body

      if (!email || !password) {
        return new Response(
          JSON.stringify({ success: false, message: 'Email and password are required' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Demo login - accept any email/password
      const user = { id: 1, first_name: 'Demo', last_name: 'User', email: email }
      const token = btoa(JSON.stringify({ userId: user.id, email: user.email }))

      const response = new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Login successful (demo mode)',
          user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email }
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

      response.headers.set('Set-Cookie', `auth-token=${token}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=86400`)
      return response

    } catch (error) {
      console.error('Login error:', error)
      return new Response(
        JSON.stringify({ success: false, message: 'Login failed' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  }

  if (path === '/auth/current-user' && method === 'GET') {
    try {
      const authHeader = req.headers.get('authorization')
      const cookieHeader = req.headers.get('cookie')
      
      let token = null
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      } else if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          acc[key] = value
          return acc
        }, {})
        token = cookies['auth-token']
      }

      if (!token) {
        return new Response(
          JSON.stringify({ success: false, message: 'No token provided' }),
          { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Demo user data
      const user = { id: 1, first_name: 'Demo', last_name: 'User', email: 'demo@example.com', created_at: new Date().toISOString() }

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, created_at: user.created_at }
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } catch (error) {
      console.error('Current user error:', error)
      return new Response(
        JSON.stringify({ success: false, message: 'Authentication failed' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  }

  return new Response(
    JSON.stringify({ error: 'Not Found' }),
    { 
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function handleLeadsRoute(method: string, req: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  }

  if (method === 'GET') {
    try {
      const url = new URL(req.url)
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)
      const offset = (page - 1) * limit

      // Demo leads data
      const demoLeads = Array.from({ length: 25 }, (_, i) => ({
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
      }))

      const total = demoLeads.length
      const paginatedLeads = demoLeads.slice(offset, offset + limit)

      return new Response(
        JSON.stringify({
          success: true,
          data: paginatedLeads,
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } catch (error) {
      console.error('Get leads error:', error)
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to fetch leads' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  }

  if (method === 'POST') {
    try {
      const body = await req.json()
      const { first_name, last_name, email, phone, company, city, state, source, status, score, lead_value } = body

      // Validate required fields
      if (!first_name || !last_name || !email) {
        return new Response(
          JSON.stringify({ success: false, message: 'First name, last name, and email are required' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Demo lead creation
      const newLead = {
        id: Math.floor(Math.random() * 10000) + 100,
        user_id: 1,
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
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Lead created successfully (demo mode)',
          data: newLead
        }),
        { 
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } catch (error) {
      console.error('Create lead error:', error)
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to create lead' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function handleLeadRoutes(path: string, method: string, req: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  }

  const leadId = path.split('/')[1]
  
  if (!leadId || isNaN(parseInt(leadId))) {
    return new Response(
      JSON.stringify({ error: 'Invalid lead ID' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  if (method === 'GET') {
    try {
      // Demo lead data
      const lead = {
        id: parseInt(leadId),
        user_id: 1,
        first_name: `Demo${leadId}`,
        last_name: 'Lead',
        email: `demo${leadId}@example.com`,
        phone: `+1-555-${String(parseInt(leadId) + 1000).padStart(4, '0')}`,
        company: `Company ${leadId}`,
        city: `City ${leadId}`,
        state: `State ${leadId}`,
        source: 'website',
        status: 'new',
        score: 50,
        lead_value: 5000,
        is_qualified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      return new Response(
        JSON.stringify({ success: true, data: lead }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } catch (error) {
      console.error('Get lead error:', error)
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to fetch lead' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  }

  if (method === 'PUT') {
    try {
      const body = await req.json()
      const { first_name, last_name, email, phone, company, city, state, source, status, score, lead_value } = body

      // Validate required fields
      if (!first_name || !last_name || !email) {
        return new Response(
          JSON.stringify({ success: false, message: 'First name, last name, and email are required' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Demo lead update
      const updatedLead = {
        id: parseInt(leadId),
        user_id: 1,
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
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Lead updated successfully (demo mode)',
          data: updatedLead
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } catch (error) {
      console.error('Update lead error:', error)
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to update lead' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  }

  if (method === 'DELETE') {
    try {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Lead deleted successfully (demo mode)'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } catch (error) {
      console.error('Delete lead error:', error)
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to delete lead' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}
