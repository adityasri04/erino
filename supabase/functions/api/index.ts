import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://frontend-q6kto3ksm-adityasri04s-projects.vercel.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    // Health check
    if (path === '/health' && method === 'GET') {
      return new Response(
        JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }),
        { 
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
      JSON.stringify({ error: 'Not Found' }),
      { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleAuthRoutes(path: string, method: string, req: Request) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

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

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        return new Response(
          JSON.stringify({ success: false, message: 'User already exists' }),
          { 
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Hash password (in production, use proper hashing)
      const hashedPassword = btoa(password) // Simple encoding for demo

      // Insert user
      const { data: user, error } = await supabase
        .from('users')
        .insert([{ first_name, last_name, email, password_hash: hashedPassword }])
        .select('id, first_name, last_name, email, created_at')
        .single()

      if (error) throw error

      // Generate JWT token
      const token = btoa(JSON.stringify({ userId: user.id, email: user.email }))

      // Set cookie
      const response = new Response(
        JSON.stringify({ 
          success: true, 
          message: 'User registered successfully',
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

      // Find user
      const { data: user, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, password_hash')
        .eq('email', email)
        .single()

      if (error || !user) {
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid credentials' }),
          { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Check password (in production, use proper comparison)
      if (btoa(password) !== user.password_hash) {
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid credentials' }),
          { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Generate JWT token
      const token = btoa(JSON.stringify({ userId: user.id, email: user.email }))

      // Set cookie
      const response = new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Login successful',
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

      // Decode token (in production, use proper JWT verification)
      const decoded = JSON.parse(atob(token))
      
      // Get user data
      const { data: user, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, created_at')
        .eq('id', decoded.userId)
        .single()

      if (error || !user) {
        return new Response(
          JSON.stringify({ success: false, message: 'User not found' }),
          { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

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
  if (method === 'GET') {
    try {
      const url = new URL(req.url)
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)
      const offset = (page - 1) * limit

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      )

      // Get total count
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })

      // Get leads with pagination
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (error) throw error

      return new Response(
        JSON.stringify({
          success: true,
          data: leads,
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
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

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      )

      // Insert lead
      const { data: lead, error } = await supabase
        .from('leads')
        .insert([{
          user_id: 1, // Default user for demo
          first_name,
          last_name,
          email,
          phone,
          company,
          city,
          state,
          source,
          status: status || 'new',
          score: score || 0,
          lead_value: lead_value || 0,
          is_qualified: false
        }])
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Lead created successfully',
          data: lead
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

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  if (method === 'GET') {
    try {
      const { data: lead, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()

      if (error || !lead) {
        return new Response(
          JSON.stringify({ success: false, message: 'Lead not found' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
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

      const { data: lead, error } = await supabase
        .from('leads')
        .update({
          first_name,
          last_name,
          email,
          phone,
          company,
          city,
          state,
          source,
          status,
          score,
          lead_value,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Lead updated successfully',
          data: lead
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
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId)

      if (error) throw error

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Lead deleted successfully'
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
