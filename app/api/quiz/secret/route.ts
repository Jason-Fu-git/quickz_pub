import { NextRequest, NextResponse } from 'next/server';
import { encryptQuiz } from '@/lib/safety';
import { auth } from '@/lib/auth';

// GET /api/quiz/secret?quizid=something&userid=something
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const quizid = parseInt(url.searchParams.get('quizid') || '-1', 10);
  const userid = parseInt(url.searchParams.get('userid') || '-1', 10);

  try {
    // check session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    const secret = encryptQuiz(userid, quizid);
    return NextResponse.json({ hash: secret });
  } catch (error) {
    console.error('Failed to fetch hash', error);
    return NextResponse.json(
      { error: 'Failed to fetch hash' },
      { status: 500 }
    );
  }
}
