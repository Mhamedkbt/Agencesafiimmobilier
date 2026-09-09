import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Ensure the route is evaluated on each request and not statically cached
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Vercel automatically sends this header to secure cron endpoints.
    // It prevents random internet users from triggering your keep-alive ping.
    const authHeader = request.headers.get('authorization');
    
    // In local development, you might not have CRON_SECRET set, so we can optionally 
    // bypass it in development, but enforce it in production.
    if (
      process.env.NODE_ENV === 'production' && 
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // A minimal, harmless request using the public ANON key to keep the Supabase database awake.
    // Selecting just 1 ID consumes practically zero resources.
    const { data, error } = await supabase
      .from('properties')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase keep-alive ping failed:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Supabase project kept alive successfully.',
      timestamp: new Date().toISOString() 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Keep-alive route error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
