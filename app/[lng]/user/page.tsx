'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ProcessingDialog from '@/components/processingDialog';

import { DataTable } from '@/components/ui/data-table';
import { AnswerSheet, generateColumns } from './columns';
import { Badge } from '@/components/ui/badge';
import { AnswerSheetForUser } from '../../api/answerSheet/route';
import { useTranslation } from '@/i18n/client';
import { columns } from '../admin/(dashboard)/columns';

export default function QuizzesPage({
  searchParams,
  params: { lng }
}: {
  searchParams: { q: string; offset: string };
  params: { lng: string };
}) {
  const { t } = useTranslation(lng);
  let columns = generateColumns(lng);

  // loading state
  const [isLoading, setIsLoading] = useState(false);

  // answer sheet data
  const [data, setData] = useState<AnswerSheet[]>([]);
  const [completedData, setCompletedData] = useState<AnswerSheet[]>([]);
  const [inProgressData, setInProgressData] = useState<AnswerSheet[]>([]);
  const [recentData, setRecentData] = useState<AnswerSheet | null>(null);

  // alert dialog
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // router
  const router = useRouter();

  // fetch answer sheet data
  const fetchAnswerSheetData = async () => {
    setIsProcessing(true);
    setIsLoading(true);
    try {
      const session = await getSession();
      if (!session || !session.user) {
        router.push(`/${lng}/login`);
        return;
      } else {
        // fetch answer sheet data
        const userId = session.user.id;
        const res = await fetch(`/api/answerSheet?userid=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setData(
            data.results.map((result: AnswerSheetForUser) => {
              // calculate status
              let status = 'in-progress';
              const now = new Date();
              const startTime = new Date(result.quiz.startTime);
              const endTime = new Date(result.quiz.endTime);
              if (now < startTime) {
                status = 'not-started';
              }
              if (now > endTime) {
                status = 'expired';
              }
              if (Number(result.answerSheet.score) !== -1) {
                status = 'completed';
              }
              return {
                answerSheetId: result.answerSheet.id,
                userId: result.answerSheet.userId,
                name: result.quiz.name,
                status: status,
                startTime: new Date(result.quiz.startTime),
                endTime: new Date(result.quiz.endTime),
                score: result.answerSheet.score,
                hash: result.hash
              };
            })
          );
        }
      }
      setIsLoading(false);
    } catch (e) {
      setAlertTitle(t('Error'));
      setAlertMessage(
        t('Failed to fetch answer sheet data. Please manually refresh later.')
      );
      setIsAlertDialogOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchAnswerSheetData();
  }, []);

  useEffect(() => {
    (() => {
      setCompletedData(data.filter((item) => item.status === 'completed'));
      setInProgressData(data.filter((item) => item.status === 'in-progress'));
      // select the in-progress and most urgent quiz
      let mostUrgent: number = -1;
      data.forEach((item, idx) => {
        if (item.status === 'in-progress') {
          if (mostUrgent === -1 || item.endTime < data[mostUrgent].endTime) {
            mostUrgent = idx;
          }
        }
      });
      if (mostUrgent !== -1) {
        setRecentData(data[mostUrgent]);
      }
    })();
  }, [data]);

  return (
    <>
      <div className="space-y-8">
        {recentData && (
          <div>
            <Card className=" inline-block p-4 ">
              <CardHeader className="space-y-4">
                <CardTitle>{recentData.name}</CardTitle>
                <CardDescription>
                  {t('Due at')} {recentData.endTime.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <Badge variant="outline" className="bg-amber-300">
                  {t('In-Progress')}
                </Badge>
                <Button
                  className="ml-4"
                  onClick={() => {
                    router.push(`/${lng}/quiz?hash=${recentData.hash}`);
                  }}
                >
                  {t('View')}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        <Tabs defaultValue="all" className="mt-4">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="all">{t('All')}</TabsTrigger>
              <TabsTrigger value="completed">{t('Completed')}</TabsTrigger>
              <TabsTrigger value="in-progress">{t('In-Progress')}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <div className={'flex flex-col w-full space-y-[10px]'}>
                  <CardTitle>{t('Quizzes')}</CardTitle>
                  <CardDescription>
                    {t('Here are all the quizzes your administrator has assigned to you.')}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col space-y-3 p-5">
                    <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ) : (
                  <DataTable
                    columns={columns}
                    data={data}
                    filterableColumnName={'name'}
                    lng={lng}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            {isLoading ? (
              <div className="flex flex-col space-y-3 p-5">
                <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={completedData}
                filterableColumnName={'name'}
                lng={lng}
              />
            )}
          </TabsContent>

          <TabsContent value="in-progress">
            {isLoading ? (
              <div className="flex flex-col space-y-3 p-5">
                <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={inProgressData}
                filterableColumnName={'name'}
                lng={lng}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
      <ProcessingDialog
        title={alertTitle}
        message={alertMessage}
        isOpen={isAlertDialogOpen}
        setIsOpen={setIsAlertDialogOpen}
        isProcessing={isProcessing}
        confirmTXT={t('Confirm')}
      />
    </>
  );
}
