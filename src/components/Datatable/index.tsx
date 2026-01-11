"use client";

import React from "react";
import type {
  ColumnDef} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationNuxt } from "../Pagination";

type PaginationState = {
  pageIndex: number;
  pageSize: number;
};

type DataTableProps<TData> = {
  columns: ColumnDef<TData, any>[];
  data: TData[];

  // 🔹 Optional controlled pagination from parent
  paginate?: PaginationState;
  setPaginate?: React.Dispatch<React.SetStateAction<PaginationState>>;

  // 🔹 Optional page size options
  pageSizeOptions?: number[];

  // 🔹 Pagination display options
  showEdges?: boolean;
  showEllipsis?: boolean;
};

export default function ShadcnDataTable<TData>({
  columns,
  data,
  paginate,
  setPaginate,
  pageSizeOptions = [5, 10, 20, 50],
  showEdges = true,
  showEllipsis = true,
}: DataTableProps<TData>) {
  // 🧩 Internal state (only used if parent doesn’t control pagination)
  const [internalPaginate, setInternalPaginate] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSizeOptions[0],
  });

  // 🧠 Use external paginate if provided, else fallback to internal
  const pagination    = paginate ?? internalPaginate;
  const setPagination = setPaginate ?? setInternalPaginate;

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false, // can be made true for server pagination
  });

  const currentPage = pagination.pageIndex + 1;
  const totalPages  = table.getPageCount();

  return (
    <div className="w-full space-y-4">
      {/* 🧱 Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 🔢 Pagination controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(value) =>
              setPagination((prev) => ({ ...prev, pageSize: Number(value), pageIndex: 0 }))
            }
          >
            <SelectTrigger className="ShadcnDataTable">
              <SelectValue placeholder={String(pagination.pageSize)} />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page navigation */}
        <div className="flex flex-col items-end gap-2">
          <PaginationNuxt
            page={currentPage}
            total={totalPages}
            onChange={(p) => setPagination((prev) => ({ ...prev, pageIndex: p - 1 }))}
            siblingCount={1}
            showEdges={showEdges}
            showEllipsis={showEllipsis}
          />
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      </div>
    </div>
  );
}
