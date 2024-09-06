import { NextRequest, NextResponse } from 'next/server';
import { getUserById, getUserByOrgId } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/members?orgid=something&offset=something
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orgid = parseInt(url.searchParams.get('orgid') || '-1', 10);
  const offset = parseInt(url.searchParams.get('offset') || '-1', 10);

  try {
    const session = await auth();
    const userid = session?.user?.id;
    if (!userid) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    // check whether the user is the admin of the organization
    const user = await getUserById(Number(userid));
    if (!user || user.orgId !== orgid || !user.privileges.includes('admin')) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    if (offset < 0) {
      const users = await getUserByOrgId(orgid, null);
      return NextResponse.json(users);
    }
    const users = await getUserByOrgId(orgid, offset);
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}
