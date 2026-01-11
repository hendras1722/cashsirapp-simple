import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

function PaginationWithNumber({
  page,
  totalPage,
  onNext,
  onPrevious,
}: {
  page: number
  totalPage: number
  onNext: () => void
  onPrevious: () => void
}) {
  return (
    <Pagination>
      <PaginationContent className="w-full justify-between">
        {
          totalPage > 1 && (
            <PaginationItem>
              <PaginationPrevious className="border" onClick={onPrevious} />
            </PaginationItem>
          )
        }
        <PaginationItem>
          <p className="text-muted-foreground text-sm" aria-live="polite">
            Page
            {" "}
            <span className="text-foreground">{page}</span>
            {" "}
            of
            {" "}
            <span className="text-foreground">{totalPage}</span>
          </p>
        </PaginationItem>
        {
          totalPage > 1 && (
            <PaginationItem>
              <PaginationNext className="border" onClick={onNext} />
            </PaginationItem>
          )
        }
      </PaginationContent>
    </Pagination>
  )
}

export default PaginationWithNumber
