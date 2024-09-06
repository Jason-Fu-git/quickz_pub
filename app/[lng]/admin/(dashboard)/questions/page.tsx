'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import type { SelectQuestion } from '@/lib/db';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import ProcessingDialog from '@/components/processingDialog';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogDescription } from '@radix-ui/react-dialog';
import { generateSchema, AddQuestionForm } from './addQuestionForm';
import { useTranslation } from '@/i18n/client';
import { Textarea } from '@/components/ui/textarea';
import { Question, splitQuestions } from '@/lib/utils';
import { generateImportColumns, generateColumns } from './columns';
import { DataTable } from '@/components/ui/data-table';

export default function QuestionsPage({
  searchParams,
  params: { lng }
}: {
  searchParams: { q: string; offset: string };
  params: { lng: string };
}) {
  let addQuestionSchema = generateSchema(lng);

  const [questions, setQuestions] = useState<SelectQuestion[]>([]);
  const [newOffset, setNewOffset] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isAddDialogVisible, setIsAddDialogVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // alert dialog
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // org info
  const [orgId, setOrgId] = useState(-1);
  const [orgName, setOrgName] = useState('');
  const [secret, setSecret] = useState('');
  const router = useRouter();

  // translation
  const { t } = useTranslation(lng);

  // ref
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // form
  const form = useForm<z.infer<typeof addQuestionSchema>>({
    resolver: zodResolver(addQuestionSchema),
    defaultValues: {
      question: '',
      qtype: 'choice',
      answer: '',
      explanation: ''
    }
  });

  // fetch org info and questions
  const fetchInfo = async () => {
    setIsLoading(true);
    try {
      const session = await getSession();
      if (!session) {
        router.push(`/${lng}/login`);
        return;
      } else {
        // fetch org info
        const response = await fetch(`/api/org?userid=${session.user?.id}`);
        const data = await response.json();
        setOrgName(data.name);
        setSecret(data.secret);
        setOrgId(data.id);
        // fetch questions
        const qResponse = await fetch(`/api/questions?orgid=${data.id}`);
        if (!qResponse.ok) {
          throw new Error('Failed to fetch questions');
        }
        const qData = await qResponse.json();
        if (qData) {
          setQuestions(qData.questions);
          setNewOffset(qData.newOffset);
          setTotalQuestions(qData.totalQuestions);
        }
        setIsLoading(false);
      }
    } catch (e) {
      setAlertTitle(t('Error'));
      setAlertMessage(
        t('Failed to fetch questions. Please manually refresh later.')
      );
      setIsAlertDialogOpen(true);
    }
  };

  // add question form submission
  async function onAddQuestionSubmit(
    formData: z.infer<typeof addQuestionSchema>
  ) {
    setIsAddDialogVisible(false);
    setAlertTitle(t('Processing...'));
    setAlertMessage(t('Adding question...'));
    setIsLoading(true);
    setIsProcessing(true);
    setIsAlertDialogOpen(true);

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...formData, orgId })
      });
      if (!response.ok) {
        throw new Error('Failed to add question');
      }
      const data = await response.json();
      if (data.success) {
        setAlertTitle(t('Success'));
        setAlertMessage(t('Question added successfully.'));
        setIsProcessing(false);
        fetchInfo();
      } else {
        throw new Error('Failed to add question');
      }
    } catch (e) {
      setAlertTitle(t('Error'));
      setAlertMessage(t('Failed to add question. Please try again later.'));
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    fetchInfo();
  }, []);

  // import questions

  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [checkDialogOpen, setCheckDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importedQuestions, setImportedQuestions] = useState<Question[]>([]);

  const onImportSubmit = () => {
    const text = (textAreaRef.current as any).value;
    try {
      const questions = splitQuestions(text);
      setImportedQuestions(questions);
      setCheckDialogOpen(true);
    } catch (e) {
      setAlertTitle(t('Error'));
      if (e instanceof Error) {
        setAlertMessage(e.message);
      }
      setIsAlertDialogOpen(true);
    }
  };

  const importColumns = generateImportColumns(lng);
  const columns = generateColumns(lng);

  const onCheckSubmit = async () => {
    setImportDialogOpen(false);
    setCheckDialogOpen(false);
    setAlertTitle(t('Processing...'));
    setAlertMessage(t('Adding question...'));
    setIsLoading(true);
    setIsProcessing(true);
    setIsAlertDialogOpen(true);

    let checkedQuestions: Question[] = [];
    for (let key in selectedRows) {
      if (selectedRows[key]) {
        // @ts-ignore
        checkedQuestions.push(importedQuestions[parseInt(key)]);
      }
    }

    try {
      for (const checkedQuestion of checkedQuestions) {
        const response = await fetch('/api/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...checkedQuestion,
            orgId
          })
        });
        if (!response.ok) {
          throw new Error('Failed to add question');
        }
        const data = await response.json();
        if (!data.success) {
          throw new Error('Failed to add question');
        }
      }
      setAlertTitle(t('Success'));
      setAlertMessage(t('Question added successfully.'));
      setIsProcessing(false);
      window.location.reload();
    } catch (e) {
      setAlertTitle(t('Error'));
      setAlertMessage(t('Failed to add question. Please try again later.'));
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="space-y-8">
        <Card>
          {isLoading ? (
            <div className="flex items-center space-x-4 p-5">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-5 p-5">
              <Building2 className="h-10 w-10"></Building2>
              <div>
                <h1 className="text-xl font-semibold">{orgName}</h1>
                <Separator className="my-1"></Separator>
                <Label className="whitespace-normal w-full break-all">
                  {t('Secret')} : {secret}
                </Label>
              </div>
            </div>
          )}
        </Card>
        <Tabs defaultValue="all">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="all">{t('All')}</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
              {/* Import Questions */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1"
                    disabled={isLoading}
                  >
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      {t('Import')}
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent aria-describedby={undefined}>
                  <DialogHeader>
                    <DialogTitle>{t('Import Questions')}</DialogTitle>
                  </DialogHeader>
                  <Textarea
                    className={'w-full h-96'}
                    ref={textAreaRef}
                    placeholder={
                      'choice\n\nHow many days are there in a week?\nA:1\nB:2\nC:7\n\nC\n\n7 days in a week\n\n\n' +
                      'judge\n\nIs the earth round?\n\nA\n\nYes, the earth is round\n\n\n' +
                      'short answer\n\nWhat is the capital of India?\n\nNew Delhi\n\nNew Delhi is the capital of India\n\n'
                    }
                  />
                  <DialogFooter className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>{t('View Format')}</Button>
                      </DialogTrigger>
                      <DialogContent aria-describedby={undefined}>
                        <DialogHeader>
                          <DialogTitle>{t('Format')}</DialogTitle>
                        </DialogHeader>
                        <p className="whitespace-pre-line">
                          {t('Format rule')}
                        </p>
                      </DialogContent>
                    </Dialog>
                    <Button onClick={onImportSubmit}>{t('Submit')}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/*  Add Question Dialog*/}
              <Dialog
                open={isAddDialogVisible}
                onOpenChange={setIsAddDialogVisible}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 gap-1" disabled={isLoading}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      {t('Add Question')}
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t('Add Question')}</DialogTitle>
                    <DialogDescription>
                      {t('Add question description')}
                    </DialogDescription>
                  </DialogHeader>
                  {/* Form */}
                  <AddQuestionForm
                    onSubmit={onAddQuestionSubmit}
                    form={form}
                    lng={lng}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <TabsContent value="all">
            {isLoading ? (
              <div className="flex flex-col space-y-3 p-5">
                <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{t('Questions')}</CardTitle>
                  <CardDescription>
                    {t('Manage your question bank.')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={questions}
                    filterableColumnName={'question'}
                    lng={lng}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/*Check Dialog*/}
      <Dialog open={checkDialogOpen} onOpenChange={setCheckDialogOpen}>
        <DialogContent className="max-w-[90%]">
          <DialogTitle>{t('Check')}</DialogTitle>
          <DialogDescription>
            {t(
              'Please check the questions we extracted. And select the ones you want to import.'
            )}
          </DialogDescription>
          <DataTable
            columns={importColumns}
            data={importedQuestions}
            filterableColumnName={'question'}
            rowSelection={selectedRows}
            setRowSelection={setSelectedRows}
            lng={lng}
          />
          <DialogFooter>
            <Button onClick={onCheckSubmit}>{t('Confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
