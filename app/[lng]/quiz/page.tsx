import 'server-only';

export const dynamic = 'force-dynamic';

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { decryptQuiz } from '@/lib/safety';
import {
  getAnswerSheetByUserIdQuizId,
  getQuestionsByIdArray,
  getQuizById
} from '@/lib/db';
import { AnswerSheetForm } from './form';
import { useTranslation } from '@/i18n/index';

export default async function QuizPage({
  searchParams,
  params: { lng }
}: {
  searchParams: { hash: string };
  params: { lng: string };
}) {
  const { t } = await useTranslation(lng);

  // Decrypt the hash
  try {
    const [userId, quizId] = decryptQuiz(searchParams.hash);

    // get the answer sheet for the quiz
    const answerSheet = await getAnswerSheetByUserIdQuizId(
      parseInt(userId, 10),
      parseInt(quizId, 10)
    );

    // if the quiz is not found, return an error
    if (!answerSheet) {
      // @ts-ignore
      throw new Error('Invalid user id');
    }

    if (answerSheet.userId == -1) {
      answerSheet.score = '-1';
    }

    // get the quiz
    const quiz = await getQuizById(parseInt(quizId, 10));

    // if the quiz is not found, return an error
    if (!quiz) {
      // @ts-ignore
      throw new Error('Invalid quiz id');
    }

    // if the quiz is found, get the questions
    const questionIds = answerSheet.questions;

    // split the questions by comma
    const questions = questionIds.split(',');

    // convert the questions to an array of integers
    const questionIdsArray = questions.map((id) => parseInt(id, 10));

    // get the questions from the database
    const questionsForTest = await getQuestionsByIdArray(questionIdsArray);

    if (!questionsForTest || questionsForTest.length === 0) {
      // @ts-ignore
      throw new Error('Invalid questions');
    }

    // check whether the quiz is expired or not started
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(quiz.endTime);

    if (now < startTime) {
      return (
        <div className="min-h-screen flex justify-center items-start md:items-center p-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{t('NOT STARTED')}</CardTitle>
              <CardDescription>
                {t('Quiz has not started yet. Please visit this page after')}{' '}
                {startTime.toLocaleString()}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      );
    } else if (now > endTime && Number(answerSheet.score) === -1) {
      return (
        <div className="min-h-screen flex justify-center items-start md:items-center p-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{t('EXPIRED')}</CardTitle>
              <CardDescription>
                {t('Quiz has expired. You can no longer submit your answers.')}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      );
    }

    // organize the questions into a dic
    const questionsDict = {};
    questionsForTest.forEach((question) => {
      questionsDict[question.id] = question;
    });

    // split answerSheet.answers by comma
    const answers = answerSheet.answers.split(',');

    // generate ItemProps array
    const items = questionIdsArray.map((id, index) => {
      const question = questionsDict[id];
      if (!question) {
        return{
          index: index + 1,
          question: '',
          qType: 'deleted',
          rightAnswer: '',
          explanation: '',
          answer: '',
          lng: lng
        };
      }
      if (Number(userId) != -1 && Number(answerSheet.score) != -1) {
        return {
          index: index + 1,
          question: question.question,
          qType: question.qtype,
          rightAnswer: question.answer,
          explanation: question.explanation,
          answer: answers[index],
          lng: lng
        };
      }
      return {
        index: index + 1,
        question: question.question,
        qType: question.qtype,
        rightAnswer: null,
        explanation: '',
        answer: '',
        lng: lng
      };
    });
    return (
      <div className="min-h-screen flex justify-center items-start md:items-center p-8">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-3xl">{quiz.name}</CardTitle>
            <CardDescription>
              {t('Published at')}{' '}
              {new Date(quiz.startTime).toLocaleDateString()}
              {'   '}
              {new Date(quiz.startTime).toLocaleTimeString()}
            </CardDescription>
            <Separator></Separator>
          </CardHeader>
          <AnswerSheetForm
            items={items}
            answerSheetId={answerSheet.id}
            answerSheetScore={Number(answerSheet.score)}
            lng={lng}
          />
        </Card>
      </div>
    );
  } catch (e) {
    return (
      <div className="min-h-screen flex justify-center items-start md:items-center p-8">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-3xl">{t('Error')}</CardTitle>
            <CardDescription>{t('Invalid quiz link')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
}
