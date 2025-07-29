// Debug utility untuk membantu troubleshoot deployment issues

export function debugEnvironment() {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...', // Only show first 20 chars for security
  };
  

  
  // Check if required env vars are present
  const missingVars = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars);
  } else {

  }
  
  return env;
}

export function debugSupabaseConnection() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    if (!supabaseUrl) {
      console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not defined');
      return false;
    }
    
    // Basic URL validation
    const url = new URL(supabaseUrl);
    // console.log('🔗 Supabase URL validation:', {
    //   protocol: url.protocol,
    //   hostname: url.hostname,
    //   isValid: url.hostname.includes('supabase')
    // });
    
    return true;
  } catch (error) {
    console.error('❌ Invalid Supabase URL:', error);
    return false;
  }
}
