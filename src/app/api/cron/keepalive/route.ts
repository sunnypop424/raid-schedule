import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/** Supabase 무료 프로젝트 일시정지 방지용 핑 (vercel.json 의 Cron 이 하루 1회 호출) */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  // Vercel Cron은 CRON_SECRET을 Authorization 헤더로 전달
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return Response.json({ ok: false, error: 'supabase env is not configured' }, { status: 500 });
  }

  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { error } = await supabase.from('members').select('id').limit(1);
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

  return Response.json({ ok: true, at: new Date().toISOString() });
}
