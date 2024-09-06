'use client';

import { useEffect, useState } from 'react';
import ProcessingDialog from '@/components/processingDialog';
import { DataTable } from '@/components/ui/data-table';
import { AnswerSheet, createColumns } from './columns';
import { Skeleton } from '@/components/ui/skeleton';
import { SelectAnswerSheet, SelectUser } from '@/lib/db';
import { CompleteChart } from './completeChart';
import { ScorePieChart } from './scorePieChart';
import { Car } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/i18n/client';

export default function QuizDetailPage({
  searchParams,
  params: { lng }
}: {
  searchParams: { id: number };
  params: { lng: string };
}) {
  // alert dialog
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // page loading state
  const [isLoading, setIsLoading] = useState(false);

  // table data
  const [data, setData] = useState<AnswerSheet[]>([]);

  // members completed
  const [membersCompleted, setMembersCompleted] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);

  // scores data
  const [scores, setScores] = useState<number[]>([]);

  // get quiz id from query
  const quizId = searchParams.id;

  // translate
  const { t } = useTranslation(lng);

  // fetch quiz data
  const fetchQuizData = async () => {
    setIsLoading(true);
    setIsProcessing(true);
    try {
      // fetch quiz data
      const qRes = await fetch(`/api/quiz?id=${quizId}`);
      if (!qRes.ok) {
        throw new Error('Failed to fetch quiz data');
      }
      const quiz = await qRes.json();
      // fetch answer sheet data
      const asRes = await fetch(`/api/quiz/answerSheets?id=${quizId}`);
      if (!asRes.ok) {
        throw new Error('Failed to fetch answer sheet data');
      }
      const answerSheets = await asRes.json();
      // fetch members data
      const mRes = await fetch(`/api/members?orgid=${quiz.orgId}`);
      if (!mRes.ok) {
        throw new Error('Failed to fetch members data');
      }
      const users = await mRes.json();
      const members: SelectUser[] = users.members;
      // convert members to map
      const memberMap = new Map();
      members.forEach((member: SelectUser) => {
        memberMap.set(member.id, member);
      });
      // organize data
      let answerSheetData: AnswerSheet[] = [];
      let totalMembers = 0;
      let membersCompleted = 0;
      let scoresTmp: number[] = [];
      for (const answerSheet of answerSheets) {
        // not guest user
        if (answerSheet.userId !== -1) {
          const score = Number(answerSheet.score);
          ++totalMembers;
          if (score !== -1) {
            ++membersCompleted;
          }
          // get user
          const user = memberMap.get(answerSheet.userId);
          // get hash
          const hashResponse = await fetch(
            `/api/quiz/secret?quizid=${quiz.id}&userid=${answerSheet.userId}`
          );
          if (!hashResponse.ok) {
            throw new Error('Failed to fetch hash');
          }
          const hash = await hashResponse.json();
          answerSheetData.push({
            answerSheetId: answerSheet.id,
            userId: answerSheet.userId,
            userImage: `https://ui-avatars.com/api/?name=${user?.name}&format=png`,
            name: user?.name,
            status: score === -1 ? 'incomplete' : 'completed',
            score: score,
            hash: hash.hash
          });
          scoresTmp.push(score);
        }
      }
      // set data
      setData(answerSheetData);
      setMembersCompleted(membersCompleted);
      setTotalMembers(totalMembers);
      setScores(scoresTmp);
      setIsLoading(false);
    } catch (error) {
      setAlertTitle(t('Error'));
      setAlertMessage(
        t('Failed to fetch quiz data. Please manually refresh later.')
      );
      setIsAlertDialogOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchQuizData();
  }, []);

  const columns = createColumns(lng);

  return (
    <>
      {isLoading ? (
        <div className="flex flex-col space-y-3 p-5">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ) : (
        <>
          <Card className="hidden md:flex items-center justify-center">
            <div className="flex-col">
              <CompleteChart
                completeMembers={membersCompleted}
                totalMembers={totalMembers}
                lng={lng}
              />

              <ScorePieChart scores={scores} lng={lng} />
            </div>

            <div className="w-full mx-4">
              <DataTable
                columns={columns}
                data={data}
                filterableColumnName={'name'}
              />
            </div>
          </Card>

          <div className="flex-col md:hidden">
            <ScorePieChart scores={scores} lng={lng} />
            <DataTable
              columns={columns}
              data={data}
              filterableColumnName={'name'}
              lng={lng}
            />
          </div>
        </>
      )}
      <ProcessingDialog
        title={alertTitle}
        message={alertMessage}
        isOpen={isAlertDialogOpen}
        setIsOpen={setIsAlertDialogOpen}
        isProcessing={isProcessing}
      />
    </>
  );
}
