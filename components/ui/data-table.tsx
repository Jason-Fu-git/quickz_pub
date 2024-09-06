import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
  OnChangeFn,
  RowSelectionState
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useEffect } from 'react';
import { Search } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterableColumnName: string;
  lng?: string;
  rowSelection?: RowSelectionState;
  setRowSelection?: OnChangeFn<RowSelectionState>;
}

// A sortable, searchable, selectable and paginated data table.
export function DataTable<TData, TValue>({
  columns,
  data,
  filterableColumnName,
  lng,
  rowSelection,
  setRowSelection
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const supportedLngs = ['en', 'cn'];
  if (!lng || !supportedLngs.includes(lng)) {
    lng = 'en';
  }

  const dictionary = {
    Prev: {
      en: 'Previous',
      cn: '上一页'
    },
    Next: {
      en: 'Next',
      cn: '下一页'
    },
    no_results: {
      en: 'No results.',
      cn: '搜索无结果。'
    },
    filter_: {
      en: 'Filter',
      cn: '筛选'
    }
  };

  let table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 5
      }
    }
  });

  if (rowSelection && setRowSelection) {
    table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
      onColumnFiltersChange: setColumnFilters,
      getFilteredRowModel: getFilteredRowModel(),
      onRowSelectionChange: setRowSelection,
      state: {
        sorting,
        columnFilters,
        rowSelection
      },
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 5
        }
      }
    });
  }

  // pagination info
  const totalRows = table.getFilteredRowModel().rows.length;
  const startIndex =
    table.getState().pagination.pageIndex *
      table.getState().pagination.pageSize +
    1;
  const endIndex = Math.min(
    (table.getState().pagination.pageIndex + 1) *
      table.getState().pagination.pageSize,
    totalRows
  );

  return (
    <div>
      {/* Search */}
      <div className="flex items-center py-4">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-[.75rem] h-4 w-4 text-muted-foreground" />
          <Input
            className="w-full rounded-lg bg-background pl-8"
            placeholder={`${dictionary.filter_[lng]} ${filterableColumnName}...`}
            value={
              (table
                .getColumn(filterableColumnName)
                ?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table
                .getColumn(filterableColumnName)
                ?.setFilterValue(event.target.value)
            }
          />
        </div>
      </div>
      {/* Main Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const enableHiding = header.column.columnDef.enableHiding;
                  return (
                    <TableHead
                      key={header.id}
                      className={enableHiding ? 'hidden md:table-cell' : ''}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const enableHiding = cell.column.columnDef.enableHiding;
                      return (
                        <TableCell
                          key={cell.id}
                          className={enableHiding ? 'hidden md:table-cell' : ''}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {dictionary.no_results[lng]}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        {/* Selection */}

        {rowSelection && setRowSelection ? (
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
        ) : (
          <div className="flex-1 text-sm text-muted-foreground">
            {totalRows > 0 && (
              <span>
                Showing {startIndex}-{endIndex} of {totalRows} rows.
              </span>
            )}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {dictionary.Prev[lng]}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {dictionary.Next[lng]}
        </Button>
      </div>
    </div>
  );
}
