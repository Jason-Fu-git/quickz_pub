import { NextRequest, NextResponse } from 'next/server';
import {
  getQuestionsByIdArray,
  updateAnswerSheet,
  getAnswerSheetById,
  getAnswerSheetsByUserId,
  getQuizById,
  SelectQuiz,
  SelectAnswerSheet,
  SelectQuestion
} from '@/lib/db';
import { judge } from '@/lib/utils';
import { GetSelectTableName } from 'drizzle-orm/query-builders/select.types';
import { encryptQuiz } from '@/lib/safety';
import { auth } from '@/lib/auth';

export interface AnswerSheetForUser {
  answerSheet: SelectAnswerSheet;
  quiz: SelectQuiz;
  hash: string;
}

// GET /api/answerSheet?userid=1
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const userId = parseInt(url.searchParams.get('userid') || '0', 10);
  try {
    // check the user id
    const session = await auth();
    const userid = session?.user?.id;
    if (!userid) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (userId !== Number(userid)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    // get the answer sheets
    const answerSheets = await getAnswerSheetsByUserId(userId);
    // get the quizzes
    let results: AnswerSheetForUser[] = [];
    for (let i = 0; i < answerSheets.length; i++) {
      const quiz = await getQuizById(answerSheets[i].quizId);
      if (!quiz) {
        throw new Error('Invalid quiz');
      }
      results.push({
        answerSheet: answerSheets[i],
        quiz: quiz,
        hash: encryptQuiz(userId, quiz.id)
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get the answer sheets' },
      { status: 500 }
    );
  }
}

//POST /api/answerSheet
export async function POST(request: NextRequest) {
  const { answerSheetId, answers } = await request.json();

  try {
    // get the answer sheet
    const answerSheet = await getAnswerSheetById(parseInt(answerSheetId, 10));
    if (!answerSheet) {
      throw new Error('Invalid answer sheet');
    }
    // check the user id
    if (answerSheet.userId != -1) {
      const session = await auth();
      const userid = session?.user?.id;
      if (!userid) {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        );
      }
      if (answerSheet.userId !== Number(userid)) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }
    }
    const questionIds = answerSheet.questions
      .split(',')
      .map((id) => parseInt(id, 10));
    // get the questions
    const questionsTmp = await getQuestionsByIdArray(questionIds);
    // re-order the questions
    const questions: SelectQuestion[] = [];
    questionIds.forEach((id) => {
      const question = questionsTmp.find((q) => q.id === id);
      if (question) {
        questions.push(question);
      }
    });
    // judge the answers
    let rightCount = 0;
    const answersArray = answers.split(',');
    questions.forEach((question, index) => {
      const answer = answersArray[index];
      const standard = question.answer;
      if (judge(question.qtype, standard, answer)) {
        rightCount++;
      }
    });
    // calculate the score
    const score = (rightCount / questions.length) * 100;
    // update the answer sheet
    await updateAnswerSheet(
      parseInt(answerSheetId, 10),
      answers,
      score.toFixed(2),
      new Date()
    );
    return NextResponse.json({ success: true, score, questions });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit the answers' },
      { status: 500 }
    );
  }
}
