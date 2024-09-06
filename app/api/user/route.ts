import { NextRequest, NextResponse } from 'next/server';
import {
  db,
  deleteAnswerSheetsByUserId,
  deleteOrgById,
  deleteQuizzesByOrgId,
  deleteUserById,
  getUserById,
  getUserByName,
  getUserByOrgId,
  insertUser,
  updatePassword
} from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/user?name=jason
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const name = url.searchParams.get('name') || '';

  try {
    // check session
    const session = await auth();
    const userid = session?.user?.id;
    if (!userid) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    const user = await getUserByName(name, 'password');
    if (!user) {
      return NextResponse.json(null);
    }
    return NextResponse.json({
      id: user.id,
      name: user.name,
      orgId: user.orgId,
      privileges: user.privileges
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/user
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const { name, password, orgId, privileges } = await req.json();
  let privilegesEnum: 'admin' | 'user' = 'user';
  if (privileges === 'admin') {
    privilegesEnum = 'admin';
  }

  try {
    await insertUser(name, password, orgId, privilegesEnum, 'password');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PUT /api/user
export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  try {
    // check user id
    const session = await auth();
    const userid = session?.user?.id;
    if (!userid) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    const { id, password } = await req.json();
    if (Number(userid) !== Number(id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    await updatePassword(id, password);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/user?id=1
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id') || '';
  try {
    const member = await getUserById(Number(id));
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
    // check whether the admin is deleting himself
    if (Number(userid) === Number(id)) {
      // delete the org
      await deleteOrgById(orgid);
      // delete the users
      const members = await getUserByOrgId(orgid, null);
      for (const member of members.members) {
        await deleteUserById(member.id);
        await deleteAnswerSheetsByUserId(member.id);
      }
      // delete the related quizzes
      await deleteQuizzesByOrgId(orgid);
    }
    await deleteUserById(Number(id));
    await deleteAnswerSheetsByUserId(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
