import { NextRequest, NextResponse } from 'next/server';
import { db, getOrgByName } from '@/lib/db';

// GET /api/org/right?name=something&secret=something
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const name = url.searchParams.get('name') || '';
  const secret = url.searchParams.get('secret') || '';

  try {
    const org = await getOrgByName(name);
    if (!org) {
      return NextResponse.json({ right: false });
    }
    return NextResponse.json({ right: org.secret === secret });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch orgs' },
      { status: 500 }
    );
  }
}
