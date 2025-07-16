import { Button } from '@mui/material'
import ArrayMap from '../atoms/ArrayMap'
import { X } from 'lucide-react'

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

export default function TableRincianDetail({
  cart,
  addStock,
  minStock,
  deleteStock,
}: {
  readonly cart: { value: Product[] }
  readonly addStock: (item: Product) => void
  readonly minStock: (item: Product) => void
  readonly deleteStock: (item: Product) => void
}) {
  return (
    <table className="mt-5 w-full">
      <thead className="text-left gap-3">
        <tr>
          <th className="px-1 sm:px-3 text-xs sm:text-sm">Nama Barang</th>
          <th className="px-1 sm:px-3 text-xs sm:text-sm">Jumlah</th>
          <th className="px-1 sm:px-3 text-xs sm:text-sm">Harga</th>
          <th className="px-1 sm:px-3 text-xs sm:text-sm"></th>
        </tr>
      </thead>
      <tbody>
        <ArrayMap
          of={cart.value}
          render={(item) => (
            <tr key={item.id}>
              <td className="px-1 sm:px-3 break-words max-w-[80px] sm:max-w-[120px] text-xs sm:text-sm">
                {item.product_name}
              </td>
              <td className="px-1 sm:px-3">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="outlined"
                    size="small"
                    className="!min-w-fit !p-1 !text-xs"
                    onClick={() => addStock(item)}
                    disabled={
                      !!(item.total_item && item.total_item >= item.stock)
                    }
                  >
                    +
                  </Button>
                  <span className="text-xs sm:text-sm min-w-[20px] text-center">
                    {item.total_item}
                  </span>
                  <Button
                    variant="outlined"
                    size="small"
                    className="!min-w-fit !p-1 !text-xs"
                    onClick={() => minStock(item)}
                  >
                    -
                  </Button>
                </div>
              </td>
              <td className="px-1 sm:px-3 text-xs sm:text-sm">
                Rp.
                {(item.price &&
                  Number(item.price.replace(/[.]/g, '')).toLocaleString(
                    'id-ID'
                  )) ||
                  0}
              </td>
              <td className="px-1 sm:px-3">
                <Button
                  onClick={() => deleteStock(item)}
                  variant="outlined"
                  color="error"
                  size="small"
                  className="!min-w-fit !p-1"
                >
                  <X className="w-3 h-3" />
                </Button>
              </td>
            </tr>
          )}
        />
      </tbody>
    </table>
  )
}
