import { NextRequest, NextResponse } from 'next/server';
import {
  deleteQuestion,
  editQuestion,
  getQuestionById,
  getQuestionsByOrgId,
  getUserById,
  insertQuestion
} from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/questions?orgid=something&offset=something
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orgid = parseInt(url.searchParams.get('orgid') || '-1', 10);
  let offset: null | number = parseInt(
    url.searchParams.get('offset') || '-1',
    10
  );
  if (offset < 0) offset = null;

  try {
    // check whether the user is admin
    const session = await auth();
    const userid = session?.user?.id;
    if (!userid) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const user = await getUserById(Number(userid));
    if (!user || user.orgId !== orgid || user.privileges !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    const questions = await getQuestionsByOrgId(orgid, offset);
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

// POST /api/questions
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { question, qtype, answer, explanation, orgId } = body;

  try {
    // check whether the user is admin
    const session = await auth();
    const userid = session?.user?.id;
    if (!userid) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const user = await getUserById(Number(userid));
    if (!user || user.orgId != orgId || user.privileges !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    await insertQuestion(question, qtype, answer, explanation, orgId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to insert question' },
      { status: 500 }
    );
  }
}

// DELETE /api/questions?id=something
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = parseInt(url.searchParams.get('id') || '-1', 10);

  try {
    // get the question
    const question = await getQuestionById(id);
    // check whether the user is admin
    const session = await auth();
    const userid = session?.user?.id;
    if (!userid) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const user = await getUserById(Number(userid));
    if (!user || user.orgId != question?.orgId || user.privileges !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    await deleteQuestion(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}

// PUT /api/questions?id=something
export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = parseInt(url.searchParams.get('id') || '-1', 10);
  const body = await req.json();
  const { question, qtype, answer, explanation } = body;

  try {
    // get the question
    const originalQuestion = await getQuestionById(id);
    // check whether the user is admin
    const session = await auth();
    const userid = session?.user?.id;
    if (!userid) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const user = await getUserById(Number(userid));
    if (
      !user ||
      user.orgId != originalQuestion?.orgId ||
      user.privileges !== 'admin'
    ) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    await editQuestion(id, question, qtype, answer, explanation);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to edit question' },
      { status: 500 }
    );
  }
}
