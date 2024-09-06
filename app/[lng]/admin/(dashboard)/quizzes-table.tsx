'use client';

import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Quiz } from './quiz';
import { SelectQuiz } from '@/lib/db';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import { useTranslation } from '@/i18n/client';

export function QuizzesTable({
  quizzes,
  offset,
  newOffset,
  totalQuizzes,
  lng
}: {
  quizzes: SelectQuiz[];
  offset: number;
  newOffset: number;
  totalQuizzes: number;
  lng: string;
}) {
  const { t } = useTranslation(lng);

  let router = useRouter();
  let itemsPerPage = ITEMS_PER_PAGE;
  let questionsIdx = new Map();
  quizzes.forEach((quiz, idx) => questionsIdx.set(quiz.id, offset + idx + 1));

  function prevPage() {
    router.back();
  }

  function nextPage() {
    router.push(`/${lng}/admin?offset=${newOffset}`, { scroll: false });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Quizzes')}</CardTitle>
        <CardDescription>{t('Manage your quizzes.')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden sm:table-cell">
                <span className="sr-only">ID</span>
              </TableHead>
              <TableHead>{t('Name')}</TableHead>
              <TableHead>{t('Status')}</TableHead>
              <TableHead className="hidden sm:table-cell">
                {t('Start time')}
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                {t('End time')}
              </TableHead>
              <TableHead className="hidden md:table-cell">
                {t('Question number')}
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                {t('Members completed')}
              </TableHead>
              <TableHead>
                <span className="sr-only">{t('Actions')}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizzes.map((quiz) => (
              <Quiz
                key={quiz.id}
                quiz={quiz}
                offset={questionsIdx.get(quiz.id)}
                lng={lng}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <form className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Showing{' '}
            <strong>
              {offset + 1}-{Math.min(offset + itemsPerPage, totalQuizzes)}
            </strong>{' '}
            of <strong>{totalQuizzes}</strong> quizzes
          </div>
          <div className="flex">
            <Button
              formAction={prevPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset < itemsPerPage}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t('Prev')}
            </Button>
            <Button
              formAction={nextPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset + itemsPerPage >= totalQuizzes}
            >
              {t('Next')}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
