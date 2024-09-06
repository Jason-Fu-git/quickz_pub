'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { useTranslation } from '@/i18n/client';

export type AnswerSheet = {
  answerSheetId: number;
  userId: number;
  userImage: string;
  name: string;
  status: 'completed' | 'incomplete';
  score: number;
  hash: string;
};

export const createColumns = (lng: string): ColumnDef<AnswerSheet>[] => {
  const { t } = useTranslation(lng);
  3;

  return [
    {
      accessorKey: 'userImage',
      header: '',
      cell: ({ row }) => {
        return (
          <img
            src={row.original.userImage}
            alt={row.original.userImage}
            className="w-8 h-8 rounded-full"
          />
        );
      },
      enableHiding: true
    },
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <div className="items-center flex">
            <Label
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              {t('Name')}
            </Label>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      }
    },
    {
      accessorKey: 'status',
      header: ({ column }) => {
        return (
          <div className="items-center flex">
            <Label
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              {t('Status')}
            </Label>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <Badge
            variant="outline"
            className={`capitalize whitespace-nowrap ${
              row.original.status === 'completed'
                ? 'bg-green-300'
                : 'bg-red-300'
            }`}
          >
            {row.original.status == 'completed'
              ? t('completed')
              : t('incomplete')}
          </Badge>
        );
      },
      enableHiding: true
    },
    {
      accessorKey: 'score',
      header: ({ column }) => {
        return (
          <div className="items-center flex">
            <Label
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              {t('Score')}
            </Label>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        );
      },
      cell: ({ row }) => {
        // score color
        let color = 'text-green-600';
        if (row.original.score < 0) {
          color = 'text-gray-600';
        } else if (row.original.score < 60) {
          color = 'text-red-600';
        } else if (row.original.score < 80) {
          color = 'text-yellow-600';
        }
        return (
          <Label className={color}>
            {row.original.score === -1 ? '--' : row.original.score}
          </Label>
        );
      }
    },
    {
      accessorKey: 'hash',
      header: '',
      cell: ({ row }) => {
        if (row.original.status === 'incomplete') {
          return <Label className="text-gray-600">{t('Not completed')}</Label>;
        }
        return (
          <Link href={`/${lng}/quiz?hash=${row.original.hash}`}>
            <Button>{t('View')}</Button>
          </Link>
        );
      }
    }
  ];
};
