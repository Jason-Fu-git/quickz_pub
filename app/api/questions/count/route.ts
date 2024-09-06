import { NextRequest, NextResponse } from 'next/server';
import {
  deleteQuestion,
  editQuestion,
  getQuestionCountByOrgId,
  getQuestionsByOrgId,
  insertQuestion
} from '@/lib/db';

// GET /api/questions/count?orgid=something
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orgid = parseInt(url.searchParams.get('orgid') || '-1', 10);

  try {
    const questionCount = await getQuestionCountByOrgId(orgid);
    return NextResponse.json(
      {
        totalQuestions: questionCount
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
