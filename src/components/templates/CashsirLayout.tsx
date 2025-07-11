'use client'

import ArrayMap from '@/components/atoms/ArrayMap'
import { Else, If } from '@/components/atoms/if'
import { useComputed, useReactive } from '@/composable/useComputed'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Input,
  NoSsr,
  Typography,
} from '@mui/material'
import { X, ShoppingCart, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import Modal from '../atoms/Modal'
import { format } from 'date-fns'
import html2canvas from 'html2canvas'
import { generateUUID } from '@/utils/generatorUUID'
import { useRoute } from '@/composable/useRoute'

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

interface Category {
  id: number
  name: string
}

export default function CashsirLayout() {
  const [items, setItems] = useState<Product[]>([])
  const [cart, setCart] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const receiptRef = useRef<HTMLDivElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [category, setCategory] = useState<Category[]>([])
  const uuid = generateUUID()

  const route = useRoute()

  useEffect(() => {
    localStorage.removeItem('cart')
  }, [route.asPath])
  useEffect(() => {
    if (!open) {
      setCart([])
      localStorage.removeItem('cart')
    }
  }, [open, setOpen])

  useEffect(() => {
    const product = localStorage.getItem('product')
    const cartItem = localStorage.getItem('cart')
    const categoryItem = localStorage.getItem('category')

    if (cartItem) {
      setCart(JSON.parse(cartItem))
    }

    if (product) {
      setItems(JSON.parse(product).filter((item) => item.active))
    }
    if (categoryItem) {
      setCategory(JSON.parse(categoryItem))
    }

    return () => {
      localStorage.removeItem('cart')
    }
  }, [])

  const cartComputed = useComputed(() => {
    if (search === '') {
      return cart
    }
    if (search) {
      return cart
        .filter((item) => item.active)
        .filter((item) =>
          item.product_name.toLowerCase().includes(search.toLowerCase())
        )
    }
    return []
  })

  const getCategory = useComputed(() => {
    return category
  })

  const getCheckout = useComputed(() => {
    const productFilter =
      (Array.isArray(items) &&
        items.length > 0 &&
        items
          .map((item) => {
            const categoryParse = getCategory.value
            const findCategory = categoryParse.find(
              (itemCategory: any) => itemCategory.id === item.category
            )
            if (findCategory) {
              return {
                ...item,
                category: findCategory.name,
              }
            }
            return {
              ...item,
              category: '',
            }
          })
          .filter((item) => item.active && item.stock > 0)
          .filter((item) =>
            item.product_name.toLowerCase().includes(search.toLowerCase())
          )
          .sort((a, b) => {
            const aEmpty = a.category === '' || a.category === undefined
            const bEmpty = b.category === '' || b.category === undefined

            if (aEmpty && !bEmpty) return 1
            if (!aEmpty && bEmpty) return -1
            if (aEmpty && bEmpty) return 0
            return a.category && b.category
              ? (a.category as string).localeCompare(b.category as string)
              : 0
          })) ||
      []
    return productFilter
  })

  const getItem = useComputed(() => {
    const productFilter =
      (Array.isArray(items) &&
        items.length > 0 &&
        items
          .map((item) => {
            const categoryParse = getCategory.value
            const findCategory = categoryParse.find(
              (itemCategory: any) => itemCategory.id === item.category
            )
            if (findCategory) {
              return {
                ...item,
                category: findCategory.name,
              }
            }
            return {
              ...item,
              category: '',
            }
          })
          .filter((item) => item.active && item.stock > 0)
          .filter((item) =>
            item.product_name.toLowerCase().includes(search.toLowerCase())
          )
          .sort((a, b) => {
            const aEmpty = a.category === '' || a.category === undefined
            const bEmpty = b.category === '' || b.category === undefined

            if (aEmpty && !bEmpty) return 1
            if (!aEmpty && bEmpty) return -1
            if (aEmpty && bEmpty) return 0
            return a.category && b.category
              ? (a.category as string).localeCompare(b.category as string)
              : 0
          })) ||
      []

    const withCategory = (productFilter || []).reduce(function (r, a) {
      if (a.category) {
        r[a.category] = r[a.category] || []
        r[a.category].push(a)
      } else {
        r['Uncategorized'] = r['Uncategorized'] || []
        r['Uncategorized'].push(a)
      }
      return r
    }, {})

    if (getCategory.value.length > 0) {
      return withCategory
    }
    return productFilter
  })

  const searchComputed = useReactive(
    () => {
      return search
    },
    (newValue) => {
      setSearch(newValue)
    }
  )

  const totalPrice = useComputed(() => {
    return cart.reduce((total: number, item: Product) => {
      return (
        total +
        (item.count ? Number(String(item.count).replace(/[.]/g, '')) : 0)
      )
    }, 0)
  })

  const totalPriceDetail = useComputed(() => {
    return cartComputed.value
      ? cartComputed.value.reduce((total: number, item: Product) => {
          return (
            total +
            (item.count ? Number(String(item.count).replace(/[.]/g, '')) : 0)
          )
        }, 0)
      : 0
  })

  function handleAdd(data) {
    const getCart = localStorage.getItem('cart')
    if (getCart) {
      const productExist = JSON.parse(getCart)
      localStorage.setItem(
        'cart',
        JSON.stringify([
          ...productExist,
          {
            ...data,
            count: 1 * Number(data.price.replace(/[.]/g, '')),
            total_item: 1,
          },
        ])
      )
      setCart([
        ...productExist,
        {
          ...data,
          count: 1 * Number(data.price.replace(/[.]/g, '')),
          total_item: 1,
        },
      ])
    } else {
      localStorage.setItem(
        'cart',
        JSON.stringify([
          {
            ...data,
            count: 1 * Number(data.price.replace(/[.]/g, '')),
            total_item: 1,
          },
        ])
      )
      setCart([
        {
          ...data,
          count: 1 * Number(data.price.replace(/[.]/g, '')),
          total_item: 1,
        },
      ])
    }
  }

  function addStock(e) {
    const product = cartComputed.value.find((item) => item.id === e.id)
    if (product) {
      const updatedCart = cartComputed.value
        .map((item) => {
          if (item.id === e.id) {
            return {
              ...item,
              count:
                (Number(item.total_item) + 1) *
                Number(item.price.replace(/[.]/g, '')),
              total_item: item.total_item ? Number(item.total_item) + 1 : 0,
            }
          }
          return item
        })
        .filter(Boolean)
      setCart(updatedCart)
      localStorage.setItem('cart', JSON.stringify(updatedCart))
    }
  }

  function minStock(e) {
    const product = cartComputed.value.find((item) => item.id === e.id)
    if (product) {
      const updatedCart = cartComputed.value
        .map((item) => {
          if (item.id === e.id) {
            return {
              ...item,
              count:
                (Number(item.total_item) - 1) *
                Number(item.price.replace(/[.]/g, '')),
              total_item: item.total_item ? Number(item.total_item) - 1 : 0,
            }
          }
          return item
        })
        .filter((item) => item.total_item && item.total_item > 0)
      setCart(updatedCart)
      localStorage.setItem('cart', JSON.stringify(updatedCart))
    }
  }

  function deleteStock(e) {
    const updatedCart = cartComputed.value.filter((item) => item.id !== e.id)
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }

  function toggleSidebar() {
    setIsSidebarOpen(!isSidebarOpen)
  }
  const captureReceipt = async () => {
    if (!receiptRef.current) return null

    try {
      setIsCapturing(true)

      await new Promise((resolve) => setTimeout(resolve, 100))

      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        height: receiptRef.current.scrollHeight,
        width: receiptRef.current.scrollWidth,
      })

      setIsCapturing(false)

      return canvas
    } catch (error) {
      console.error('Error capturing receipt:', error)
      setIsCapturing(false)
      return null
    }
  }

  const downloadReceipt = async () => {
    const canvas = await captureReceipt()
    if (!canvas) return

    try {
      const link = document.createElement('a')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

      link.download = `receipt-${timestamp}.png`
      link.href = canvas.toDataURL('image/png')

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      console.log('Receipt downloaded successfully')
    } catch (error) {
      console.error('Error downloading receipt:', error)
    }
  }

  const printReceipt = async () => {
    const canvas = await captureReceipt()
    if (!canvas) return

    try {
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        console.error('Failed to open print window')
        return
      }

      const imgData = canvas.toDataURL('image/png')

      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                background: white;
                position: absolute;
                top: 0;
              }
              img {
                max-width: 100%;
                height: auto;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
                img {
                  width: 100%;
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <img src="${imgData}" alt="Receipt" />
            <script>
              window.onload = function() {
                // Auto print ketika halaman loaded
                window.print();
                
                // Close tab setelah print selesai
                window.onafterprint = function() {
                  window.close();
                };
                
                // Fallback: close tab jika user cancel print (setelah delay)
                setTimeout(function() {
                  window.close();
                }, 1000);
              };
              
              document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                  window.close();
                }
                if (e.ctrlKey && e.key === 'w') {
                  window.close();
                }
                if (e.metaKey && e.key === 'w') {
                  window.close();
                }
              });
              
              window.addEventListener('beforeunload', function() {
                window.close();
              });
            </script>
          </body>
        </html>
      `)

      printWindow.document.close()

      printWindow.focus()
    } catch (error) {
      console.error('Error printing receipt:', error)
    }
  }

  function handleDetailPrint() {
    setOpen(true)
    if (Array.isArray(getItem.value)) {
      const product = getItem.value.map((items) => {
        const item = cart.find((item) => item.id === items.id)
        if (!item) return { ...items }
        return {
          ...items,
          stock: items.stock - (item?.total_item || 0),
        }
      })
      localStorage.setItem('product', JSON.stringify(product))
      setItems(product)
      return
    }
    const product = getCheckout.value.map((items) => {
      console.log(items)
      const categoryParse = getCategory.value
      const findCategory = categoryParse.find(
        (itemCategory: any) => itemCategory.name === items.category
      )
      const item = cart.find((item) => item.id === items.id)
      if (!item) return { ...items }
      return {
        ...items,
        category: findCategory ? findCategory.id : '',
        stock: items.stock - (item?.total_item || 0),
      }
    })
    localStorage.setItem('product', JSON.stringify(product))
    setItems(product as Product[])
  }

  const getDetailPrint = useComputed(() => {
    return cartComputed.value ?? []
  })

  const getTotalHarga = useComputed(() => {
    return (getDetailPrint.value || [])?.map((item) => {
      return {
        ...item,
        total: Number(item.price.replace(/[.]/g, '')) * (item.total_item || 0),
      }
    })
  })
  return (
    <div className="h-screen bg-gray-400 flex relative">
      <Modal open={open} setOpen={setOpen} contentText={''} title={''}>
        <div className="mb-5" ref={receiptRef}>
          <div className="text-center">
            {format(new Date(), 'dd/MM/yyyy HH:mm')}
          </div>
          <div className="text-center mb-2">{uuid}</div>
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
                  {(totalPriceDetail.value &&
                    totalPriceDetail.value.toLocaleString('id-ID')) ||
                    0}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="border-2 border-black h-1 w-full border-dashed mt-5"></div>
          <p className="text-center text-lg mt-3 " style={{ marginBottom: 30 }}>
            Terima kasih sudah menggunakan layanan kami
          </p>
          <div className="flex justify-between gap-3 mt-3">
            {!isCapturing && (
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

      {/* Main Content */}
      <div className="bg-white h-full flex-1 flex p-3 flex-wrap gap-5 flex-col">
        <div className="flex flex-row justify-between gap-4">
          <div className="flex flex-col w-full">
            <small>Search:</small>
            <Input onChange={(e) => (searchComputed.value = e.target.value)} />
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

        <main className="flex flex-col gap-5 pb-20 lg:pb-5">
          <If
            condition={
              Array.isArray(getItem.value) &&
              (getItem.value || [])?.length === 0
            }
          >
            <div className="flex flex-row justify-center mt-5 relative">
              <Image
                src="/man-woman.jpg"
                alt="empty"
                className="rounded-lg max-w-full h-auto"
                width={630}
                height={630}
              />
              <div className="absolute top-2/4 md:mt-28 mt-20 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <h3 className="text-sm">Kamu belum menambahkan barang</h3>
                <Link className="text-blue-600" href={'/admin/product'}>
                  Tambah Barang
                </Link>
              </div>
            </div>
            <Else key={'empty'}>
              <div
                className={
                  'h-fit flex flex-wrap gap-6 w-full justify-center sm:justify-start' +
                  (getCategory.value.length > 0 ? ' flex-col' : '')
                }
              >
                <If condition={Array.isArray(getItem.value)}>
                  <ArrayMap
                    of={getItem.value as Product[]}
                    render={(item, index) => (
                      <div
                        key={item.id + index}
                        className="p-5 shadow-sm h-fit border border-slate-300 rounded-md flex flex-col gap-2 w-[170px]"
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
                            cartComputed.value?.filter(
                              (cartId) => cartId.id === item.id
                            ).length > 0
                          }
                        >
                          Add Cart
                        </Button>
                      </div>
                    )}
                  />
                  <Else key={'elseMap'}>
                    <NoSsr>
                      <ArrayMap
                        of={Object.keys(getItem.value)}
                        render={(title, index) => (
                          <div key={title + index}>
                            <Accordion
                              style={{ boxShadow: 'none' }}
                              defaultExpanded
                            >
                              <AccordionSummary
                                expandIcon={<ChevronDown />}
                                aria-controls="panel1-content"
                                id="panel1-header"
                              >
                                <Typography component="span">
                                  {title}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails className="flex flex-wrap gap-6 flex-row !w-fit">
                                <ArrayMap
                                  of={getItem.value[title] as Product[]}
                                  render={(item) => (
                                    <div
                                      key={item.id + index}
                                      className="p-5 mt-3 shadow-sm h-fit border border-slate-300 rounded-md flex flex-col gap-2 w-[170px]"
                                    >
                                      <div className="break-words">
                                        {item.product_name}
                                      </div>
                                      <small className="text-xs text-slate-400">
                                        Rp.{item.price} • {item.stock} item
                                      </small>
                                      <Button
                                        variant="contained"
                                        className="!mt-3"
                                        onClick={() => handleAdd(item)}
                                        disabled={
                                          cartComputed.value?.filter(
                                            (cartId) => cartId.id === item.id
                                          ).length > 0
                                        }
                                      >
                                        Add Cart
                                      </Button>
                                    </div>
                                  )}
                                />
                              </AccordionDetails>
                            </Accordion>
                          </div>
                        )}
                      />
                    </NoSsr>
                  </Else>
                </If>
              </div>
            </Else>
          </If>
        </main>

        {/* Mobile Cart Button */}
        <div className="fixed bottom-5 left-3 right-3 lg:!hidden">
          <Button
            fullWidth
            variant="contained"
            onClick={toggleSidebar}
            className="!py-3"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Cart ({cart.length})
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:relative
        top-0 right-0 h-full
        bg-gray-50 shadow-sm border-l border-slate-300
        transform transition-transform duration-300 ease-in-out
        z-50
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:translate-x-0
        lg:block
      `}
      >
        <div className="flex flex-col h-full w-[90vw] sm:w-[450px] lg:w-[450px]">
          <div className="flex flex-col items-center p-3 relative">
            <Button
              className="!absolute left-3 top-3 !min-w-fit !p-2 lg:!hidden"
              onClick={toggleSidebar}
              variant="outlined"
            >
              <X className="w-4 h-4" />
            </Button>
            <h3 className="mt-8 lg:mt-0">Detail Rincian</h3>
          </div>

          <div className="px-3 flex-1 h-[calc(100vh-200px)] overflow-auto">
            <div className="overflow-x-auto">
              <table className="mt-5 w-full">
                <thead className="text-left gap-3">
                  <tr>
                    <th className="px-1 sm:px-3 text-xs sm:text-sm">
                      Nama Barang
                    </th>
                    <th className="px-1 sm:px-3 text-xs sm:text-sm">Jumlah</th>
                    <th className="px-1 sm:px-3 text-xs sm:text-sm">Harga</th>
                    <th className="px-1 sm:px-3 text-xs sm:text-sm"></th>
                  </tr>
                </thead>
                <tbody>
                  <ArrayMap
                    of={cart}
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
                                !!(
                                  item.total_item &&
                                  item.total_item >= item.stock
                                )
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
                            Number(
                              item.price.replace(/[.]/g, '')
                            ).toLocaleString('id-ID')) ||
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
            </div>
          </div>

          <div className="h-[100px] border-t border-slate-200 flex flex-col items-start justify-center px-2">
            <div className="mt-5 px-3 mb-1 flex items-center justify-between font-bold w-full">
              <span className="text-sm sm:text-base">Total : </span>
              <span className="text-sm sm:text-base">
                Rp.
                {(totalPrice.value &&
                  totalPrice.value.toLocaleString('id-ID')) ||
                  0}
              </span>
            </div>
            <Button
              fullWidth
              variant="contained"
              className="mx-3"
              onClick={handleDetailPrint}
              disabled={!cart.length}
            >
              Print
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
