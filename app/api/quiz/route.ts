import { NextRequest, NextResponse } from 'next/server';
import { getQuizById } from '@/lib/db';

// GET /api/quiz?id=1
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const quizId = url.searchParams.get('id') || '-1';
  try {
    const quiz = await getQuizById(parseInt(quizId, 10));
    return NextResponse.json(quiz);
  } catch (e) {
    return NextResponse.json(
      {
        error: 'Failed to get quiz'
      },
      {
        status: 500
      }
    );
  }
}
