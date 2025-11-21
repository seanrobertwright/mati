import { NextResponse } from 'next/server';
import { createChangeRequest, getAllChangeRequests } from '@/lib/db/repositories/change-requests';
import { createClient } from '@/lib/auth/server';

export async function GET() {
  const requests = await getAllChangeRequests();
  return NextResponse.json(requests);
}

export async function POST(req: Request) {
  const data = await req.json();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const result = await createChangeRequest(data, user);
  return NextResponse.json(result);
}
