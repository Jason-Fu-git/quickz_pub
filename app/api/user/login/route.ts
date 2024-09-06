import { NextRequest, NextResponse } from 'next/server';
import { getUserByName } from '@/lib/db';

// GET /api/user/login?username=foo&password=bar
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const username = url.searchParams.get('username') || '';
  const password = url.searchParams.get('password');
  try {
    const user = await getUserByName(username, 'password');
    if (user && user.password === password) {
      return NextResponse.json({
        id: user.id.toString(),
        name: user.name.toString(),
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&format=png`
      });
    }
    return NextResponse.json(
      {
        error: 'Invalid username or password'
      },
      {
        status: 401
      }
    );
  } catch (e) {
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    );
  }
}
