'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Question } from '@/lib/utils';
import { useTranslation } from '@/i18n/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { SelectQuestion } from '@/lib/db';
import { useState } from 'react';
import { AddQuestionForm, generateSchema } from './addQuestionForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { DialogDescription } from '@radix-ui/react-dialog';
import ProcessingDialog from '@/components/processingDialog';
import { truncateText } from '@/lib/utils';

export const generateImportColumns = (lng: string): ColumnDef<Question>[] => {
  const { t } = useTranslation(lng);

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'question',
      header: t('Question'),
      cell: ({ row }) => {
        return <span>{truncateText(row.original.question, 50)}</span>;
      },
      enableHiding: false
    },
    {
      accessorKey: 'qtype',
      header: t('Question Type'),
      cell: ({ row }) => {
        return (
          <Badge variant="outline" className="capitalize whitespace-nowrap">
            {t(row.original.qtype)}
          </Badge>
        );
      },
      enableHiding: true
    },
    {
      accessorKey: 'answer',
      header: t('Answer'),
      cell: ({ row }) => {
        return <span>{truncateText(row.original.answer, 50)}</span>;
      },
      enableHiding: false
    },
    {
      accessorKey: 'explanation',
      header: t('Explanation'),
      cell: ({ row }) => {
        return <span>{truncateText(row.original.explanation, 50)}</span>;
      },
      enableHiding: true
    }
  ];
};

export const generateColumns = (lng: string): ColumnDef<SelectQuestion>[] => {
  const { t } = useTranslation(lng);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [editingQuestion, setEditingQuestion] = useState<SelectQuestion | null>(
    null
  );

  let addQuestionSchema = generateSchema(lng);

  // delete question by its id
  async function deleteQuestion(question: SelectQuestion) {
    setDialogTitle(t('Deleting...'));
    setDialogMessage(t('Please wait while we delete the question'));
    setIsProcessing(true); // set processing to true
    setIsDialogOpen(true); // open the dialog

    try {
      const response = await fetch(`/api/questions?id=${question.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete question');
      }
      setDialogTitle(t('Success'));
      setDialogMessage(t('Question deleted successfully.'));
      setIsProcessing(false); // set processing to false
      window.location.reload(); // reload the page
    } catch (e) {
      setDialogTitle(t('Error'));
      setDialogMessage(t('Failed to delete question. Please try again later.'));
      setIsProcessing(false); // set processing to false
    }
  }

  // edit question form
  const form = useForm<z.infer<typeof addQuestionSchema>>({
    resolver: zodResolver(addQuestionSchema)
  });

  const handleEdit = (question: SelectQuestion) => {
    setEditingQuestion(question);
    form.reset({
      question: question.question,
      qtype: question.qtype,
      answer: question.answer,
      explanation: question.explanation
    });
    setIsEditDialogOpen(true);
  };

  return [
    {
      accessorKey: 'question',
      header: t('Question'),
      cell: ({ row }) => {
        return <span>{truncateText(row.original.question)}</span>;
      }
    },
    {
      accessorKey: 'qtype',
      header: t('Question Type'),
      cell: ({ row }) => {
        return (
          <Badge variant="outline" className="capitalize whitespace-nowrap">
            {t(row.original.qtype)}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'answer',
      header: t('Answer'),
      cell: ({ row }) => {
        return <span>{truncateText(row.original.answer, 50)}</span>;
      },
      enableHiding: true
    },
    {
      accessorKey: 'explanation',
      header: t('Explanation'),
      cell: ({ row }) => {
        return <span>{truncateText(row.original.explanation, 50)}</span>;
      },
      enableHiding: true
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        return (
          <>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t('Actions')}</DropdownMenuLabel>
                  <Separator></Separator>
                  <DialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={() => {
                        handleEdit(row.original);
                      }}
                    >
                      <button>{t('Edit')}</button>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DropdownMenuItem>
                    <button
                      className="text-red-700"
                      onClick={async () => {
                        await deleteQuestion(row.original);
                      }}
                    >
                      {t('Delete')}
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('Edit question')}</DialogTitle>
                  <DialogDescription>
                    {t(
                      "Edit the existing question selected. Click submit when you're done."
                    )}
                  </DialogDescription>
                </DialogHeader>
                {/* Form */}
                <AddQuestionForm
                  onSubmit={async (
                    formData: z.infer<typeof addQuestionSchema>
                  ) => {
                    setIsEditDialogOpen(false);
                    setDialogTitle(t('Processing...'));
                    setDialogMessage(t('Altering question...'));
                    setIsProcessing(true);
                    setIsDialogOpen(true);

                    try {
                      const response = await fetch(
                        `/api/questions?id=${editingQuestion?.id}`,
                        {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({ ...formData })
                        }
                      );
                      if (!response.ok) {
                        throw new Error('Failed to add question');
                      }
                      const data = await response.json();
                      if (data.success) {
                        setDialogTitle(t('Success'));
                        setDialogMessage(t('Question altered successfully.'));
                        setIsProcessing(false);
                        window.location.reload();
                      } else {
                        throw new Error('Failed to add question');
                      }
                    } catch (e) {
                      setDialogTitle(t('Error'));
                      setDialogMessage(
                        t('Failed to alter question. Please try again later.')
                      );
                      setIsProcessing(false);
                    }
                  }}
                  form={form}
                  lng={lng}
                />
              </DialogContent>
            </Dialog>
            {/* Waiting... */}
            <ProcessingDialog
              title={dialogTitle}
              message={dialogMessage}
              isOpen={isDialogOpen}
              setIsOpen={setIsDialogOpen}
              isProcessing={isProcessing}
              confirmTXT={t('Confirm')}
            />
          </>
        );
      }
    }
  ];
};
