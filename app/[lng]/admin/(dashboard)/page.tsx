'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, File, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { SelectQuiz, SelectUser } from '@/lib/db';
import { getSession } from 'next-auth/react';
import { unstable_rethrow, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { QuizzesTable } from './quizzes-table';
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Member, columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { RowSelectionState } from '@tanstack/react-table';
import { useTranslation } from '@/i18n/client';

export default function QuizzesPage({
  searchParams,
  params: { lng }
}: {
  searchParams: { q: string; offset: string };
  params: { lng: string };
}) {
  const { t } = useTranslation(lng);

  // quizzes
  const [quizzes, setQuizzes] = useState<SelectQuiz[]>([]);
  const [newOffset, setNewOffset] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [isAddDialogVisible, setIsAddDialogVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // alert dialog
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const router = useRouter();
  let offset = parseInt(searchParams.offset ?? 0, 10);
  const [statusParam, setStatusParam] = useState('all');

  // org info
  const [orgId, setOrgId] = useState(-1);
  const [orgName, setOrgName] = useState('');
  const [secret, setSecret] = useState('');
  const [members, setMembers] = useState<Member[]>([]);

  // dialog page
  const [dialogPage, setDialogPage] = useState(0);
  const [selectedMembers, setSelectedMembers] = useState<RowSelectionState>({});

  // question bank info
  const [questionNum, setQuestionNum] = useState(0);

  // === add quiz schema ===
  const addQuizSchema = z
    .object({
      name: z.string().min(1, t('Name is required')),
      questionNum: z.string().refine(
        (value) => {
          return parseInt(value) <= questionNum && parseInt(value) > 0;
        },
        {
          message: `${t('Question number should be no more than')} ${questionNum} ${t('and greater than 0')}`
        }
      ),
      quizMode: z.enum(['all random', 'random once']),
      startTime: z.string().min(1, t('Start time is required')),
      endTime: z.string().min(1, t('End time is required'))
    })
    .superRefine((data, ctx) => {
      // convert start time and end time to date
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);
      // check if start time is before end time
      if (startTime >= endTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['startTime'],
          message: t('Start time must be before end time')
        });
      }
    });
  // === end of add quiz schema ===

  // add quiz form
  const form = useForm<z.infer<typeof addQuizSchema>>({
    resolver: zodResolver(addQuizSchema),
    defaultValues: {
      name: '',
      questionNum: '10',
      quizMode: 'all random',
      startTime: '', // "YYYY-MM-DDTHH:MM"
      endTime: ''
    }
  });

  // fetch org info and questions
  const fetchInfo = async () => {
    setIsProcessing(true);
    setIsLoading(true);
    try {
      const session = await getSession();
      if (!session) {
        router.push(`/${lng}/login`);
        return;
      } else {
        // fetch org info
        offset = parseInt(searchParams.offset ?? 0, 10);
        const response = await fetch(`/api/org?userid=${session.user?.id}`);
        const data = await response.json();
        setOrgName(data.name);
        setSecret(data.secret);
        setOrgId(data.id);
        // fetch question bank info
        const qeResponse = await fetch(`/api/questions/count?orgid=${data.id}`);
        const qeData = await qeResponse.json();
        setQuestionNum(qeData.totalQuestions);
        // fetch org members
        const mResponse = await fetch(`/api/members?orgid=${data.id}`);
        const mData = await mResponse.json();
        let members: Member[] = mData.members.map((member: SelectUser) => {
          // turn admin into guest {-1, 'All Guests'}
          if (member.id.toString() === session.user?.id) {
            return {
              id: -1,
              image: `https://ui-avatars.com/api/?name=${encodeURIComponent('访客')}&format=png`,
              name: 'All Guests'
            };
          }
          return {
            id: member.id,
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&format=png`,
            name: member.name
          };
        });
        setMembers(members);
        // fetch quizzes
        const qResponse = await fetch(
          `/api/quizzes?orgid=${data.id}&offset=${offset}&status=${statusParam}`
        );
        if (!qResponse.ok) {
          throw new Error('Failed to fetch quizzes');
        }
        const qData = await qResponse.json();
        if (qData) {
          setQuizzes(qData.quizzes);
          setNewOffset(qData.newOffset);
          setTotalQuizzes(qData.totalQuizzes);
        }
        setIsLoading(false);
      }
    } catch (e) {
      unstable_rethrow(e);
      setAlertTitle(t('Error'));
      setAlertMessage(t('Failed to fetch quizzes. Please try again later.'));
      setIsAlertDialogOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, [offset, statusParam]);

  // add quiz form submit
  const onSubmit = async (formData: z.infer<typeof addQuizSchema>) => {
    setIsAddDialogVisible(false);
    setAlertTitle(t('Processing...'));
    setAlertMessage(t('Adding quiz'));
    setIsProcessing(true);
    setIsAlertDialogOpen(true);

    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orgId: orgId,
          questionNum: formData.questionNum,
          name: formData.name,
          quizMode: formData.quizMode,
          startTime: new Date(formData.startTime).toUTCString(),
          endTime: new Date(formData.endTime).toUTCString(),
          members: Object.keys(selectedMembers).map((key) => {
            return members[Number(key)].id;
          })
        })
      });
      if (!response.ok) {
        throw new Error('Failed to add question');
      }
      const responseData = await response.json();
      if (responseData.success) {
        setAlertTitle(t('Success'));
        setAlertMessage(t('Quiz added successfully.'));
        setIsProcessing(false);
        fetchInfo();
      } else {
        throw new Error('Failed to add quiz');
      }
    } catch (e) {
      setAlertTitle(t('Error'));
      setAlertMessage(t('Failed to add quiz. Please try again later.'));
    } finally {
      setIsProcessing(false);
    }
  };

  // on add quiz button click
  const onAddQuizClick = () => {
    setDialogPage(0);
  };

  // on next step button click
  const onNextStepClick = () => {
    if (Object.keys(selectedMembers).length == 0) {
      setAlertTitle(t('Error'));
      setAlertMessage(t('Please select at least one member'));
      setIsProcessing(false);
      setIsAlertDialogOpen(true);
    } else {
      setDialogPage(1);
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
              <TabsTrigger
                value="all"
                onClick={() => {
                  setStatusParam('all');
                }}
              >
                {t('All')}
              </TabsTrigger>
              <TabsTrigger
                value="active"
                onClick={() => {
                  setStatusParam('active');
                }}
              >
                {t('Active')}
              </TabsTrigger>
              <TabsTrigger
                value="closed"
                onClick={() => {
                  setStatusParam('closed');
                }}
              >
                {t('Closed')}
              </TabsTrigger>
              <TabsTrigger
                value="scheduled"
                onClick={() => {
                  setStatusParam('scheduled');
                }}
              >
                {t('Scheduled')}
              </TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
              {/* Add quiz Dialog */}
              <Dialog
                open={isAddDialogVisible}
                onOpenChange={setIsAddDialogVisible}
              >
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="h-8 gap-1"
                    disabled={isLoading}
                    onClick={onAddQuizClick}
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      {t('Add Quiz')}
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('Add Quiz')}</DialogTitle>
                    {dialogPage === 0 ? (
                      <DialogDescription>
                        {t('Step 1 : Choose members')}
                      </DialogDescription>
                    ) : (
                      <DialogDescription>
                        {t('Step 2 : Fill in quiz details')}
                      </DialogDescription>
                    )}
                  </DialogHeader>
                  {dialogPage === 0 ? (
                    <>
                      {/* Members table */}
                      <DataTable
                        columns={columns}
                        data={members}
                        filterableColumnName="name"
                        rowSelection={selectedMembers}
                        setRowSelection={setSelectedMembers}
                        lng={lng}
                      />
                      <DialogFooter>
                        <Button
                          size="sm"
                          type="submit"
                          onClick={onNextStepClick}
                        >
                          {t('Next step')}
                        </Button>
                      </DialogFooter>
                    </>
                  ) : (
                    <Form {...form}>
                      {/* Add quiz form */}
                      <form
                        className="space-y-4"
                        onSubmit={form.handleSubmit(onSubmit)}
                      >
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('Name')}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t('Quiz name')}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="questionNum"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('Question number')}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Number of questions"
                                  className="max-w-[250px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="quizMode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('Quiz mode')}</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col items-start space-x-2"
                                >
                                  <FormDescription>
                                    {t(
                                      'random hint'
                                    )}
                                  </FormDescription>
                                  <div className="flex items-start space-x-2">
                                    <FormItem className="flex items-center space-x-1 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="all random" />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {t('All random')}
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-1 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem value="random once" />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {t('Random once')}
                                      </FormLabel>
                                    </FormItem>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('Start time')}</FormLabel>
                              <FormControl>
                                <Input
                                  type="datetime-local"
                                  placeholder="Start time"
                                  className="max-w-[250px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('End time')}</FormLabel>
                              <FormControl>
                                <Input
                                  type="datetime-local"
                                  placeholder="End time"
                                  className="max-w-[250px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit">{t('Submit')}</Button>
                        </DialogFooter>
                      </form>
                      {/* End of add quiz form */}
                    </Form>
                  )}
                </DialogContent>
              </Dialog>
              {/* End of dialog */}
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
              <QuizzesTable
                quizzes={quizzes}
                offset={offset ?? 0}
                newOffset={newOffset}
                totalQuizzes={totalQuizzes}
                lng={lng}
              />
            )}
          </TabsContent>

          <TabsContent value="scheduled">
            {isLoading ? (
              <div className="flex flex-col space-y-3 p-5">
                <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ) : (
              <QuizzesTable
                quizzes={quizzes}
                offset={offset ?? 0}
                newOffset={newOffset}
                totalQuizzes={totalQuizzes}
                lng={lng}
              />
            )}
          </TabsContent>

          <TabsContent value="closed">
            {isLoading ? (
              <div className="flex flex-col space-y-3 p-5">
                <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ) : (
              <QuizzesTable
                quizzes={quizzes}
                offset={offset ?? 0}
                newOffset={newOffset}
                totalQuizzes={totalQuizzes}
                lng={lng}
              />
            )}
          </TabsContent>

          <TabsContent value="active">
            {isLoading ? (
              <div className="flex flex-col space-y-3 p-5">
                <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ) : (
              <QuizzesTable
                quizzes={quizzes}
                offset={offset ?? 0}
                newOffset={newOffset}
                totalQuizzes={totalQuizzes}
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
