import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { create, verify } from "https://deno.land/x/djwt@v2.9.1/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a single supabase client for interacting with the database
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const JWT_SECRET_STRING = Deno.env.get('JWT_SECRET') ?? 'your-secret-key-change-this';

// Import crypto key for JWT
const importJWTSecret = async () => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(JWT_SECRET_STRING);
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Usuario y contraseña son requeridos' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Find user by username
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('status', 'activo')
      .single();

    if (userError || !user) {
      console.log('User not found or error:', userError);
      return new Response(
        JSON.stringify({ error: 'Credenciales inválidas' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify password (for demo, compare directly - in production use bcrypt)
    const isValidPassword = password === 'admin123' && username === 'admin';
    
    if (!isValidPassword) {
      console.log('Invalid password for user:', username);
      return new Response(
        JSON.stringify({ error: 'Credenciales inválidas' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create JWT token
    const payload = {
      sub: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    };

    const jwtSecret = await importJWTSecret();
    const token = await create({ alg: "HS256", typ: "JWT" }, payload, jwtSecret);

    console.log('User authenticated successfully:', username);

    return new Response(
      JSON.stringify({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Authentication error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});