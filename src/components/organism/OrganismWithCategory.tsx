import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Typography,
} from '@mui/material'
import { ChevronDown } from 'lucide-react'
import ArrayMap from '../atoms/ArrayMap'

interface Product {
  id: number
  active: boolean
  description: string
  product_name: string
  stock: number
  price: string
  count?: number
  total_item?: number
  category?: string
}

export default function OrganismWithCategory({
  handleAdd,
  title,
  getItem,
  index,
  cartComputed,
}: {
  readonly handleAdd: (item: Product) => void
  readonly title: string
  readonly getItem: { value: { [key: string]: Product[] } }
  readonly index: number
  readonly cartComputed: { value: Product[] }
}) {
  return (
    <Accordion style={{ boxShadow: 'none' }} defaultExpanded>
      <AccordionSummary
        expandIcon={<ChevronDown />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography component="span">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails className="flex flex-wrap gap-6 flex-row !w-fit">
        <ArrayMap
          of={getItem.value[title]}
          render={(item) => (
            <div
              key={item.id + index}
              className="p-5 mt-3 shadow-sm h-fit border border-slate-300 rounded-md flex flex-col gap-2 w-[150px]"
            >
              <div className="break-words">{item.product_name}</div>
              <small className="text-xs text-slate-400">
                Rp.{item.price} • {item.stock} item
              </small>
              <Button
                variant="contained"
                className="!mt-3"
                onClick={() => handleAdd(item)}
                disabled={
                  cartComputed.value?.filter((cartId) => cartId.id === item.id)
                    .length > 0
                }
              >
                Add Cart
              </Button>
            </div>
          )}
        />
      </AccordionDetails>
    </Accordion>
  )
}
