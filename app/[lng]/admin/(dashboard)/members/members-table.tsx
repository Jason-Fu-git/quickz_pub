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
import { Member } from './member';
import { SelectUser } from '@/lib/db';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import { useTranslation } from '@/i18n/client';

export function MembersTable({
  members,
  offset,
  newOffset,
  totalMembers,
  lng
}: {
  members: SelectUser[];
  offset: number;
  newOffset: number;
  totalMembers: number;
  lng: string;
}) {
  let router = useRouter();
  let membersPerPage = ITEMS_PER_PAGE;

  const { t } = useTranslation(lng);

  function prevPage() {
    router.back();
  }

  function nextPage() {
    router.push(`/${lng}/admin/members?offset=${newOffset}`, { scroll: false });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Members')}</CardTitle>
        <CardDescription>
          {t("Manage your organization's members.")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">{t('Image')}</span>
              </TableHead>
              <TableHead>{t('Username')}</TableHead>
              <TableHead className="hidden md:table-cell">
                {t('Login source')}
              </TableHead>
              <TableHead>
                <span className="sr-only">{t('Actions')}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <Member key={member.id} member={member} lng={lng}/>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <form className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Showing{' '}
            <strong>
              {offset + 1}-{Math.min(offset + membersPerPage, totalMembers)}
            </strong>{' '}
            of <strong>{totalMembers}</strong> members
          </div>
          <div className="flex">
            <Button
              formAction={prevPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset < membersPerPage}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t('Prev')}
            </Button>
            <Button
              formAction={nextPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset + membersPerPage >= totalMembers}
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
