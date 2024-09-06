'use client';

import { useEffect, useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Copy, MoreHorizontal } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { SelectAnswerSheet, SelectQuiz } from '@/lib/db';
import ProcessingDialog from '@/components/processingDialog';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/i18n/client';

export function Quiz({
  quiz,
  offset,
  lng
}: {
  quiz: SelectQuiz;
  offset: number;
  lng: string;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const router = useRouter();

  // link ref
  const linkRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation(lng);

  // handle copy link
  const handleCopyLink = () => {
    if (linkRef.current) {
      const link = linkRef.current.value;
      navigator.clipboard.writeText(link).then(() => {
        alert(t('Link copied to clipboard'));
      });
    }
  };

  // delete quiz by its id
  async function deleteQuiz() {
    setDialogTitle(t('Deleting...'));
    setDialogMessage(t('Please wait while we delete the quiz'));
    setIsProcessing(true); // set processing to true
    setIsDialogOpen(true); // open the dialog

    try {
      const response = await fetch(`/api/quizzes?id=${quiz.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }
      setDialogTitle(t('Success'));
      setDialogMessage(t('Quiz deleted successfully.'));
      setIsProcessing(false); // set processing to false
      window.location.reload(); // reload the page
    } catch (e) {
      setDialogTitle(t('Error'));
      setDialogMessage(t('Failed to delete quiz. Please try again later.'));
      setIsProcessing(false); // set processing to false
    }
  }

  // answerSheets
  let questionNum = quiz.questionNum;
  const [totalMembers, setTotalMembers] = useState(0);
  const [membersAnswered, setMembersAnswered] = useState(0);
  const [isPublic, setIsPublic] = useState(false);
  const [hash, setHash] = useState('');

  const getStats = async () => {
    try {
      // fetch the answerSheets
      const response = await fetch(`/api/quiz/answerSheets?id=${quiz.id}`);
      if (!response.ok) {
        throw new Error('Failed to get answerSheets');
      }
      const data = await response.json();
      // fetch the hash
      const hashResponse = await fetch(
        `/api/quiz/secret?quizid=${quiz.id}&userid=-1`
      );
      if (!hashResponse.ok) {
        throw new Error('Failed to get hash');
      }
      const hashData = await hashResponse.json();
      setHash(hashData.hash);
      // count the number of members who answered
      let completedCount = 0;
      let membersCount = 0;
      data.forEach((answerSheet: SelectAnswerSheet) => {
        // @ts-ignore
        membersCount++;
        if (Number(answerSheet.score) != -1 && answerSheet.userId != -1) {
          completedCount++;
        }
        if (answerSheet.userId == -1) {
          membersCount--;
          setIsPublic(true);
        }
      });
      setTotalMembers(membersCount);
      setMembersAnswered(completedCount);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getStats();
  }, []);

  // current status of the quiz
  let startTime =
    typeof quiz.startTime === 'string'
      ? new Date(quiz.startTime)
      : quiz.startTime;
  let endTime =
    typeof quiz.endTime === 'string' ? new Date(quiz.endTime) : quiz.endTime;

  const currentTime = new Date();
  let status = t('Active');
  let color = 'bg-green-300';
  if (startTime > currentTime) {
    status = t('Scheduled');
    color = 'bg-gray-300';
  } else if (endTime < currentTime) {
    status = t('Closed');
    color = 'bg-red-300';
  }

  // translate status

  return (
    <>
      <TableRow>
        <TableCell className="hidden sm:table-cell">{offset}</TableCell>
        <TableCell className="font-medium">{quiz.name}</TableCell>
        <TableCell>
          <Badge
            variant="outline"
            className={`capitalize ${color} whitespace-nowrap`}
          >
            {status}
          </Badge>
        </TableCell>
        <TableCell className="hidden sm:table-cell">
          {startTime.toLocaleDateString()} {startTime.toLocaleTimeString()}
        </TableCell>
        <TableCell className="hidden sm:table-cell">
          {endTime.toLocaleDateString()} {endTime.toLocaleTimeString()}
        </TableCell>
        <TableCell className="hidden md:table-cell">{questionNum}</TableCell>
        <TableCell className="hidden sm:table-cell whitespace-nowrap">
          {totalMembers == 0 ? '--' : `${membersAnswered}/${totalMembers}`}
        </TableCell>
        <TableCell>
          {/* Share link*/}
          <Dialog>
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
                {isPublic && (
                  <DialogTrigger asChild>
                    <DropdownMenuItem>
                      <button>{t('Public link')}</button>
                    </DropdownMenuItem>
                  </DialogTrigger>
                )}
                <DropdownMenuItem>
                  <Link href={`/${lng}/admin/quiz?id=${quiz.id}`}>
                    <button>{t('Details')}</button>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button className="text-red-700" onClick={deleteQuiz}>
                    {t('Delete')}
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('Share link')}</DialogTitle>
                <DialogDescription>
                  {t('Anyone who has this link will be able to view this.')}
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="link" className="sr-only">
                    {t('Link')}
                  </Label>
                  <Input
                    id="link"
                    ref={linkRef}
                    defaultValue={`https://jasonfu.top/${lng}/quiz?hash=${hash}`}
                    readOnly
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="px-3"
                  onClick={handleCopyLink}
                >
                  <span className="sr-only">{t('Copy')}</span>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    {t('Close')}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TableCell>
      </TableRow>

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
