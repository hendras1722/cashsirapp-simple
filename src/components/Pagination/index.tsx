"use client";
import React from "react";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  total: number;
  siblingCount?: number;
  showEdges?: boolean;
  showEllipsis?: boolean;
  onChange: (page: number) => void;
};

export function PaginationNuxt({
  page,
  total,
  siblingCount = 1,
  showEdges = true,
  showEllipsis = true,
  onChange,
}: PaginationProps) {
  const range = React.useMemo(() => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [];
    const left                      = Math.max(2, page - siblingCount);
    const right                     = Math.min(total - 1, page + siblingCount);

    pages.push(1);

    if (showEllipsis) {
      if (left > 2) pages.push("...");
    } else {
      for (let i = 2; i < left; i++) pages.push(i);
    }

    for (let i = left; i <= right; i++) pages.push(i);

    if (showEllipsis) {
      if (right < total - 1) pages.push("...");
    } else {
      for (let i = right + 1; i < total; i++) pages.push(i);
    }

    pages.push(total);
    return pages;
  }, [page, total, siblingCount, showEllipsis]);

  const changePage = (p: number) => {
    if (p < 1 || p > total) return;
    onChange(p);
  };

  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      {showEdges && (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => changePage(1)}
            disabled={page === 1}
            aria-label="First page"
          >
            {"<<"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => changePage(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            {"<"}
          </Button>
        </>
      )}

      {range.map((p, i) =>
        p === "..." ? (
          <span key={i} className="px-2 text-muted-foreground select-none">
            …
          </span>
        ) : (
          <Button
            key={p}
            size="sm"
            variant={page === p ? "default" : "outline"}
            onClick={() => changePage(p as number)}
            id={p.toString()}
            aria-label={p.toString()}
          >
            {p}
          </Button>
        )
      )}

      {showEdges && (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => changePage(page + 1)}
            disabled={page === total}
            aria-label="Next page"
          >
            {">"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => changePage(total)}
            disabled={page === total}
            aria-label="Last page"
          >
            {">>"}
          </Button>
        </>
      )}
    </div>
  );
}
