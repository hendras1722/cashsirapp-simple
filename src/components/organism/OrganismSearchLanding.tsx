import { Button, Input } from '@mui/material'

export default function OrganismSearchLanding({
  search,
}: {
  readonly search: { value: string }
}) {
  return (
    <div className="flex flex-row justify-between gap-4 w-full items-center h-fit">
      <div className="flex flex-col w-full">
        <small>Search:</small>
        <Input onChange={(e) => (search.value = e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button
          href="/admin/product"
          variant="outlined"
          className="hidden sm:inline-flex"
        >
          Manage
        </Button>
      </div>
    </div>
  )
}
