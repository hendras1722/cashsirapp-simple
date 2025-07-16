'use client'

import ArrayMap from '@/components/atoms/ArrayMap'
import { Else, If } from '@/components/atoms/if'
import { default as ref } from '@/composable/useRef'
import { useComputed } from '@/composable/useComputed'
import { Button, NoSsr } from '@mui/material'
import { X, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef } from 'react'
import html2canvas from 'html2canvas'
import { generateUUID } from '@/utils/generatorUUID'
import { useRoute } from '@/composable/useRoute'
import OrganismSearchLanding from '../organism/OrganismSearchLanding'
import OrganismWithCategory from '../organism/OrganismWithCategory'
import TableRincianDetail from '../molecules/TableRincianLanding'
import ModalReceipt from '../molecules/ModalReceipt'

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
  const items = ref<Product[]>([])
  const cart = ref<Product[]>([])
  const isSidebarOpen = ref(false)
  const open = ref(false)
  const isCapturing = ref(false)
  const category = ref<Category[]>([])
  const searchComputed = ref('')
  const uuid = ref('')
  const receiptRef = useRef<HTMLDivElement>(null)

  const route = useRoute()

  useEffect(() => {
    localStorage.removeItem('cart')
  }, [route.asPath])
  useEffect(() => {
    if (!open.value) {
      cart.value = []
      localStorage.removeItem('cart')
    }
  }, [open.value])

  useEffect(() => {
    const product = localStorage.getItem('product')
    const cartItem = localStorage.getItem('cart')
    const categoryItem = localStorage.getItem('category')

    if (cartItem) {
      cart.value = JSON.parse(cartItem)
    }

    if (product) {
      items.value = JSON.parse(product)
    }
    if (categoryItem) {
      category.value = JSON.parse(categoryItem)
    }

    return () => {
      localStorage.removeItem('cart')
    }
  }, [])

  const cartComputed = useComputed(() => {
    if (searchComputed.value === '') {
      return cart.value
    }
    if (searchComputed.value) {
      return cart.value
        .filter((item) => item.active)
        .filter((item) =>
          item.product_name
            .toLowerCase()
            .includes(searchComputed.value.toLowerCase())
        )
    }
    return []
  })

  const getCategory = useComputed(() => {
    return category.value
  })

  const getCheckout = useComputed(() => {
    const productFilter =
      (Array.isArray(items.value) &&
        items.value.length > 0 &&
        items.value
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
            item.product_name
              .toLowerCase()
              .includes(searchComputed.value.toLowerCase())
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
      (Array.isArray(items.value) &&
        items.value.length > 0 &&
        items.value
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
            item.product_name
              .toLowerCase()
              .includes(searchComputed.value.toLowerCase())
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

  const totalPrice = useComputed(() => {
    return cart.value.reduce((total: number, item: Product) => {
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

  const handleAdd = useCallback((data) => {
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
      cart.value = [
        ...productExist,
        {
          ...data,
          count: 1 * Number(data.price.replace(/[.]/g, '')),
          total_item: 1,
        },
      ]
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
      cart.value = [
        {
          ...data,
          count: 1 * Number(data.price.replace(/[.]/g, '')),
          total_item: 1,
        },
      ]
    }
  }, [])

  const addStock = useCallback(
    (e) => {
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
        cart.value = updatedCart
        localStorage.setItem('cart', JSON.stringify(updatedCart))
      }
    },
    [cartComputed.value]
  )

  const minStock = useCallback(
    (e) => {
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
        cart.value = updatedCart
        localStorage.setItem('cart', JSON.stringify(updatedCart))
      }
    },
    [cartComputed.value]
  )

  const deleteStock = useCallback(
    (e) => {
      const updatedCart = cartComputed.value.filter((item) => item.id !== e.id)
      cart.value = updatedCart

      localStorage.setItem('cart', JSON.stringify(updatedCart))
    },
    [cartComputed.value]
  )

  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
  }
  const captureReceipt = async () => {
    if (!receiptRef.current) return null

    try {
      isCapturing.value = true

      await new Promise((resolve) => setTimeout(resolve, 100))

      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        height: receiptRef.current.scrollHeight,
        width: receiptRef.current.scrollWidth,
      })
      isCapturing.value = false

      return canvas
    } catch (error) {
      console.error('Error capturing receipt:', error)
      isCapturing.value = false

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
                window.print();
                
                window.onafterprint = function() {
                  window.close();
                };
                
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
    open.value = true
    uuid.value = generateUUID()

    if (Array.isArray(getItem.value)) {
      const product = getItem.value.map((data) => {
        const item = cart.value.find((item) => item.id === data.id)
        if (!item) return { ...data }
        return {
          ...data,
          stock: data.stock - (item?.total_item || 0),
        }
      })
      localStorage.setItem('product', JSON.stringify(product))
      items.value = product
      return
    }
    const product = getCheckout.value.map((data) => {
      const categoryParse = getCategory.value
      const item = cart.value.find((item) => item.id === data.id)
      if (item) {
        const findCategory = categoryParse.find(
          (itemCategory: any) => itemCategory.name === item.category
        )
        return {
          ...data,
          category: findCategory ? findCategory.id : '',
          stock: data.stock - (item?.total_item || 0),
        }
      }
      const findCategory = categoryParse.find(
        (itemCategory: any) => itemCategory.name === data.category
      )
      return { ...data, category: findCategory ? findCategory.id : '' }
    })
    localStorage.setItem('product', JSON.stringify(product))
    items.value = product as Product[]
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
      <ModalReceipt
        open={open}
        receiptRef={receiptRef}
        getDetailPrint={getDetailPrint}
        uuid={uuid}
        getTotalHarga={getTotalHarga}
        totalPriceDetail={totalPriceDetail}
        isCapturing={isCapturing}
        downloadReceipt={downloadReceipt}
        printReceipt={printReceipt}
      />

      <div className="bg-white h-full flex-1 flex p-3 flex-wrap gap-5 sm:flex-col flex-row">
        <OrganismSearchLanding search={searchComputed} />

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
                            <OrganismWithCategory
                              cartComputed={cartComputed}
                              title={title}
                              getItem={getItem}
                              index={index}
                              handleAdd={handleAdd}
                            />
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

        <div className="fixed bottom-5 left-3 right-3 lg:!hidden">
          <Button
            fullWidth
            variant="contained"
            onClick={toggleSidebar}
            className="!py-3"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Cart ({cart.value.length})
          </Button>
        </div>
      </div>

      <If condition={isSidebarOpen.value}>
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      </If>

      <div
        className={`
        fixed lg:relative
        top-0 right-0 h-full
        bg-gray-50 shadow-sm border-l border-slate-300
        transform transition-transform duration-300 ease-in-out
        z-50
        ${isSidebarOpen.value ? 'translate-x-0' : 'translate-x-full'}
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
              <TableRincianDetail
                cart={cart}
                addStock={addStock}
                minStock={minStock}
                deleteStock={deleteStock}
              />
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
              disabled={!cart.value.length}
            >
              Print
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
