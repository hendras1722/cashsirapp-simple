import { Button } from '@mui/material'
import ArrayMap from '../atoms/ArrayMap'
import { format } from 'date-fns'
import Modal from '../atoms/Modal'

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

interface ProductWithTotal extends Product {
  total: number
}

export default function ModalReceipt({
  open,
  receiptRef,
  getDetailPrint,
  uuid,
  getTotalHarga,
  totalPriceDetail,
  isCapturing,
  downloadReceipt,
  printReceipt,
}: {
  readonly open: {
    value: boolean
  }
  readonly receiptRef: any
  readonly getDetailPrint: {
    value: Product[]
  }
  readonly uuid: any
  readonly getTotalHarga: {
    value: ProductWithTotal[]
  }
  readonly totalPriceDetail: {
    value: number
  }
  readonly isCapturing: {
    value: boolean
  }
  readonly downloadReceipt: () => void
  readonly printReceipt: () => void
}) {
  return (
    <Modal open={open} contentText={''} title={''}>
      <div className="mb-5" ref={receiptRef}>
        <div className="text-center">
          {format(new Date(), 'dd/MM/yyyy HH:mm')}
        </div>
        <div className="text-center mb-2">{String(uuid.value)}</div>
        <table className="mt-5 w-full">
          <thead className="text-left gap-3">
            <tr>
              <th className="px-1 sm:px-3 text-xs sm:text-sm"></th>
              <th className="px-1 sm:px-3 text-xs sm:text-sm"></th>
              <th className="px-1 sm:px-3 text-xs sm:text-sm"></th>
              <th className="px-1 sm:px-3 text-xs sm:text-sm"></th>
            </tr>
          </thead>
          <tbody>
            <ArrayMap
              of={getDetailPrint.value}
              render={(item, index) => (
                <tr key={item.id}>
                  <td className="px-1 sm:px-3 break-words max-w-[80px] sm:max-w-[120px] text-xs sm:text-sm">
                    {item.product_name}
                  </td>
                  <td className="px-1 sm:px-3">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-xs sm:text-sm min-w-[20px] text-center">
                        {item.total_item}
                      </span>
                    </div>
                  </td>
                  <td className="px-1 sm:px-3 text-xs sm:text-sm">
                    Rp.
                    {getTotalHarga.value[index].total.toLocaleString('id-ID')}
                  </td>
                </tr>
              )}
            />
            <tr>
              <td className="px-1 sm:px-3 break-words max-w-[80px] sm:max-w-[120px] text-xs sm:text-sm">
                Harga
              </td>
              <td className="px-1 sm:px-3"></td>
              <td className="px-1 sm:px-3 text-xs sm:text-sm">
                Rp.
                {totalPriceDetail.value.toLocaleString('id-ID') ?? 0}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="border-2 border-black h-1 w-full border-dashed mt-5"></div>
        <p className="text-center text-lg mt-3 " style={{ marginBottom: 30 }}>
          Terima kasih sudah menggunakan layanan kami
        </p>
        <div className="flex justify-between gap-3 mt-3">
          {!isCapturing.value && (
            <>
              <Button
                fullWidth
                color="info"
                variant="outlined"
                onClick={downloadReceipt}
              >
                Download
              </Button>
              <Button
                fullWidth
                color="success"
                variant="outlined"
                onClick={printReceipt}
              >
                Print
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
