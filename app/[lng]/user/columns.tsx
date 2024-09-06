'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/i18n/client';

// Define the columns for the table
export type AnswerSheet = {
  answerSheetId: number;
  userId: number;
  name: string;
  status: 'completed' | 'in-progress' | 'not-started' | 'expired';
  startTime: Date;
  endTime: Date;
  score: string;
  hash: string;
};

export const generateColumns = (lng: string) => {
  const { t } = useTranslation(lng);

  return [
    {
      accessorKey: 'name',
      header: t('Name'),
      cell: ({ row }) => (
        <div className="whitespace-normal break-all">{row.original.name}</div>
      )
    },
    {
      accessorKey: 'status',
      header: ({ column }) => {
        return (
          <div className="flex">
            <Label
              className="text-left"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              {t('Status')}
            </Label>
            {column.getIsSorted() && <ArrowUpDown className={`ml-2 h-4 w-4`} />}
          </div>
        );
      },
      cell: ({ row }) => {
        // color the status badge
        let color = 'bg-green-300';
        let status = t('Completed');
        if (row.original.status === 'not-started') {
          color = 'bg-gray-300';
          status = t('Not-Started');
        } else if (row.original.status === 'expired') {
          color = 'bg-red-300';
          status = t('Expired');
        } else if (row.original.status === 'in-progress') {
          color = 'bg-yellow-300';
          status = t('In-Progress');
        }
        return (
          <Badge
            variant="outline"
            className={`capitalize ${color} whitespace-nowrap`}
          >
            {status}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'startTime',
      header: t('Start time'),
      cell: ({ row }) => {
        return <div>{new Date(row.original.startTime).toLocaleString()}</div>;
      },
      enableHiding: true
    },
    {
      accessorKey: 'endTime',
      header: t('End time'),
      cell: ({ row }) => {
        return <div>{new Date(row.original.endTime).toLocaleString()}</div>;
      },
      enableHiding: true
    },
    {
      accessorKey: 'score',
      header: ({ column }) => {
        return (
          <div className="hidden md:flex">
            <Label
              className="text-left"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              {t('Score')}
            </Label>
            {column.getIsSorted() && <ArrowUpDown className={`ml-2 h-4 w-4`} />}
          </div>
        );
      },
      cell: ({ row }) => {
        const score = Number(row.original.score);
        // color
        let color = 'text-green-600';
        if (score === -1) {
          color = 'text-gray-500';
        } else if (score < 60) {
          color = 'text-red-500';
        } else if (score < 80) {
          color = 'text-yellow-500';
        }
        return (
          <>
            <div className="hidden md:table-cell">
              <Label className={color}>{score === -1 ? '--' : score}</Label>
            </div>
            <div className="table-cell md:hidden items-center">
              {row.original.status === 'completed' ||
              row.original.status === 'in-progress' ? (
                <Button
                  variant="outline"
                  className={color}
                  onClick={() =>
                    (window.location.href = `/${lng}/quiz?hash=${row.original.hash}`)
                  }
                >
                  {score === -1 ? 'GO' : score}
                </Button>
              ) : (
                <Label className={'whitespace-nowrap text-center'}>{'  '}</Label>
              )}
            </div>
          </>
        );
      }
    },
    {
      accessorKey: 'actions',
      header: '',
      cell: ({ row }) => {
        if (
          row.original.status === 'not-started' ||
          row.original.status === 'expired'
        ) {
          return <Label className="text-gray-500 text-center">--</Label>;
        } else {
          return (
            <Button
              onClick={() =>
                (window.location.href = `/${lng}/quiz?hash=${row.original.hash}`)
              }
            >
              {t('View')}
            </Button>
          );
        }
      },
      enableHiding: true
    }
  ];
};
