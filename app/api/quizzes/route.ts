import { NextRequest, NextResponse } from 'next/server';
import {
  getQuizzesByOrgId,
  generateAnswerSheet,
  getRandomQuestionsByOrgId,
  insertQuiz,
  getQuizByNameOrgIdStartTimeEndTime,
  deleteQuiz,
  deleteAnswerSheetsByQuizId,
  getUserById,
  getQuizById
} from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/quizzes?orgid=something&offset=something&status=something
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orgid = parseInt(url.searchParams.get('orgid') || '-1', 10);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);
  const status = url.searchParams.get('status') || 'all';

  try {
    // check user id
    const session = await auth();
    const userid = session?.user?.id;
    if (!userid) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    const user = await getUserById(Number(userid));
    if (!user || user.orgId !== orgid || user.privileges !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const quizzes = await getQuizzesByOrgId(orgid, offset, status);
    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Failed to fetch quizzes', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}

// POST /api/quizzes
export async function POST(req: NextRequest) {
  const body = await req.json();
  let orgid = parseInt(body.orgId, 10);
  let questionNum = parseInt(body.questionNum, 10);
  let quizName = body.name;
  let quizMode = body.quizMode;
  let startTime = new Date(body.startTime);
  let endTime = new Date(body.endTime);
  // console.log(startTime.toLocaleString(), startTime.toUTCString());
  let members = body.members;

  try {
    // check user id
    const session = await auth();
    const userid = session?.user?.id;
    if (!userid) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    const user = await getUserById(Number(userid));
    if (!user || user.orgId !== orgid || user.privileges !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    // Create quiz
    await insertQuiz(
      quizName,
      orgid,
      questionNum,
      quizMode,
      startTime,
      endTime
    );
    // get quiz id
    const quiz = await getQuizByNameOrgIdStartTimeEndTime(
      quizName,
      orgid,
      startTime,
      endTime
    );
    if (quiz === null) {
      throw new Error('Failed to get quiz id');
    }
    // generate quiz for each member
    if (quizMode === 'all random') {
      for (let member of members) {
        // Get random questions
        const questions = await getRandomQuestionsByOrgId(orgid, questionNum);
        // Extract question ids
        const questionIds = questions.map((question) => question.id);
        // Generate answer sheet
        const answerSheet = await generateAnswerSheet(
          member,
          quiz.id,
          questionIds.join(','),
          'null',
          '-1',
          new Date()
        );
      }
    } else {
      // random once
      const questions = await getRandomQuestionsByOrgId(orgid, questionNum);
      // Extract question ids
      const questionIds = questions.map((question) => question.id);
      // Generate answer sheet
      for (let member of members) {
        const answerSheet = await generateAnswerSheet(
          member,
          quiz.id,
          questionIds.join(','),
          'null',
          '-1',
          new Date()
        );
      }
    }
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Failed to create quiz', error);
    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    );
  }
}

// DELETE /api/quizzes?id=something
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = parseInt(url.searchParams.get('id') || '-1', 10);

  try {
    const quiz = await getQuizById(id);
    const orgid = quiz?.orgId;
    // check user id
    const session = await auth();
    const userid = session?.user?.id;
    if (!userid) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    const user = await getUserById(Number(userid));
    if (!user || user.orgId !== orgid || user.privileges !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    // Delete quiz
    await deleteAnswerSheetsByQuizId(id);
    await deleteQuiz(id);
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Failed to delete quiz', error);
    return NextResponse.json(
      { error: 'Failed to delete quiz' },
      { status: 500 }
    );
  }
}
