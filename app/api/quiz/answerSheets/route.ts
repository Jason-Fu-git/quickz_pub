import { NextRequest, NextResponse } from 'next/server';
import { getAnswerSheetsByQuizId, getQuizById, getUserById } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/quiz/answerSheets?id=1
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const quizId = url.searchParams.get('id') || '-1';
  try {
    // check user id
    const session = await auth();
    const userid = session?.user?.id;
    if (!userid) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    // check if user is the owner of the quiz
    const quiz = await getQuizById(parseInt(quizId, 10));
    const user = await getUserById(Number(userid));
    if (
      !quiz ||
      !user ||
      quiz.orgId !== user.orgId ||
      user.privileges !== 'admin'
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const answerSheets = await getAnswerSheetsByQuizId(parseInt(quizId, 10));
    return NextResponse.json(answerSheets);
  } catch (e) {
    return NextResponse.json(
      {
        error: 'Failed to get answer sheet'
      },
      {
        status: 500
      }
    );
  }
}
