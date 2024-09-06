import { NextRequest, NextResponse } from 'next/server';
import { db, insertOrg, getUserById, getOrgById, getOrgByName } from '@/lib/db';
import * as assert from 'node:assert';
import { auth } from '@/lib/auth';

// GET /api/org?userid=something or GET /api/org?name=something
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userid = url.searchParams.get('userid') || '-1';
  const name = url.searchParams.get('name') || '';

  try {
    if (userid === '-1') {
      const org = await getOrgByName(name);
      if (!org) {
        return NextResponse.json({ error: 'Org not found' }, { status: 404 });
      }
      return NextResponse.json(org);
    } else {
      const user = await getUserById(parseInt(userid, 10));
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      } else {
        // check if the userid is valid
        const session = await auth();
        const useridInSession = session?.user?.id;
        if (!useridInSession) {
          return NextResponse.json(
            { error: 'Not authenticated' },
            { status: 401 }
          );
        }
        // check if the user is admin
        if (useridInSession !== userid || user.privileges !== 'admin') {
          return NextResponse.json(
            { error: 'Not authorized' },
            { status: 403 }
          );
        }
        const org = await getOrgById(user.orgId);
        if (!org) {
          return NextResponse.json({ error: 'Org not found' }, { status: 404 });
        }
        return NextResponse.json(org);
      }
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch orgs' },
      { status: 500 }
    );
  }
}

// POST /api/org
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  // get the org name from the request body
  const { name } = await req.json();
  if (!name) {
    return NextResponse.json(
      { error: 'Org name is required' },
      { status: 400 }
    );
  }
  try {
    await insertOrg(name);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create org' },
      { status: 500 }
    );
  }
}
