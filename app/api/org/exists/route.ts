import { NextRequest, NextResponse } from 'next/server';
import { db, getOrgByName } from '@/lib/db';

// GET /api/org/exists?name=something
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const name = url.searchParams.get('name') || '';

  try {
    const org = await getOrgByName(name);
    if (org) {
      return NextResponse.json({ exists: true });
    }
    return NextResponse.json({ exists: false });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch orgs' },
      { status: 500 }
    );
  }
}
