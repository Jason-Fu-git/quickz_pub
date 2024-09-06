import { NextRequest, NextResponse } from 'next/server';
import { getUserById, resetPassword } from '@/lib/db';
import { auth } from '@/lib/auth';

// POST /api/user/reset
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const { id } = await req.json();
  try {
    const member = await getUserById(id);
    const orgid = member?.orgId;
    // check admin
    const session = await auth();
    const userid = session?.user?.id;
    if (!userid) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    const user = await getUserById(Number(userid));
    if (!user || user.orgId !== orgid || user.privileges !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    await resetPassword(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
