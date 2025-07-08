'use client'

import ArrayMap from '@/components/atoms/ArrayMap'
import { Else, If } from '@/components/atoms/if'
import { useComputed, useReactive } from '@/composable/useComputed'
import { Button, Input } from '@mui/material'
import { X, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Product {
  id: number
  active: boolean
  description: string
  product_name: string
  stock: number
  price: string
  count?: number
  total_item?: number
}

export default function CashsirLayout() {
  const [items, setItems] = useState<Product[]>([])
  const [cart, setCart] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const product = localStorage.getItem('product')
    const cartItem = localStorage.getItem('cart')

    if (cartItem) {
      setCart(JSON.parse(cartItem))
    }

    if (product) {
      setItems(JSON.parse(product).filter((item) => item.active))
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

  const getItem = useComputed(() => {
    return (
      (items.length > 0 &&
        items
          .filter((item) => item.active)
          .filter((item) =>
            item.product_name.toLowerCase().includes(search.toLowerCase())
          )) ||
      []
    )
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
    console.log(product)
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

  return (
    <div className="h-screen bg-gray-400 flex relative">
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
          <If condition={getItem.value.length === 0}>
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
              <div className="h-fit flex flex-wrap gap-6 w-full justify-center sm:justify-start">
                <ArrayMap
                  of={getItem.value}
                  render={(item, index) => (
                    <div
                      key={item.id + index}
                      className="p-5 shadow-sm h-fit border border-slate-300 rounded-md flex flex-col gap-2 w-[200px]"
                    >
                      <div className="break-words">{item.product_name}</div>
                      <small>
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
                    <th className="px-1 sm:px-3 text-xs sm:text-sm">Total</th>
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
            <Button fullWidth variant="contained" className="mx-3">
              Print
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
