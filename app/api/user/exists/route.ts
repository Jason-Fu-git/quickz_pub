import { NextRequest, NextResponse } from 'next/server';
import { db, getUserByName } from '@/lib/db';

// GET /api/user/exists?name=jason
// GET /api/user/exists?name=jason&password=1234
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const name = url.searchParams.get('name') || '';
  const password = url.searchParams.get('password') || null;
  try {
    const user = await getUserByName(name, 'password');
    if (!user) {
      return NextResponse.json({ exists: false });
    }
    if (password && user.password !== password) {
      return NextResponse.json({ exists: false });
    }
    return NextResponse.json({ exists: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
