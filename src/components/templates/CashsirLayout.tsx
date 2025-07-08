'use client'

import ArrayMap from '@/components/atoms/ArrayMap'
import { Else, If } from '@/components/atoms/if'
import { useComputed, useReactive } from '@/composable/useComputed'
import { Button, Input } from '@mui/material'
import { X } from 'lucide-react'
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
  const [showDrawer, setShowDrawer] = useState(false)

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

  return (
    <div className="h-screen bg-gray-400 flex flex-col lg:flex-row">
      {' '}
      {/* Mobile: column, Desktop: row */}
      {/* Main Content */}
      <div className="relative bg-white h-full flex-1 flex p-3 gap-5 flex-col">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col w-full md:w-2/3">
            <small>Search:</small>
            <Input
              fullWidth
              onChange={(e) => (searchComputed.value = e.target.value)}
            />
          </div>
          <Button
            href="/admin/product"
            variant="outlined"
            className="md:w-auto w-full"
          >
            Manage
          </Button>
        </div>

        <main className="flex flex-col gap-5">
          <If condition={getItem.value.length === 0}>
            <div className="flex justify-center mt-5 relative">
              <Image
                src="/man-woman.jpg"
                alt="empty"
                className="rounded-lg max-w-full h-auto"
                width={630}
                height={630}
              />
              <div className="absolute top-2/4 md:mt-28 mt-20 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <h3 className="text-sm">Kamu belum menambahkan barang</h3>
                <Link className="text-blue-600" href={'/admin/product'}>
                  Tambah Barang
                </Link>
              </div>
            </div>
            <Else key="empty">
              <div className="flex flex-wrap gap-6 w-full justify-center md:justify-start">
                <ArrayMap
                  of={getItem.value}
                  render={(item, index) => (
                    <div
                      key={item.id + index}
                      className="p-5 shadow-sm h-fit border border-slate-300 rounded-md flex flex-col gap-2 w-full sm:w-[200px] max-w-[250px]"
                    >
                      <div className="break-words">{item.product_name}</div>
                      <small>
                        Rp.{item.price} • {item.stock} item
                      </small>
                      <Button
                        variant="contained"
                        className="!mt-3"
                        onClick={() => handleAdd(item)}
                        disabled={cartComputed.value?.some(
                          (cartId) => cartId.id === item.id
                        )}
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

        {/* Cart Button Mobile (Always visible at bottom) */}
        {cartComputed.value.length > 0 && (
          <div className="fixed bottom-5 left-0 right-0 ml-auto mr-auto px-3 lg:hidden">
            <Button
              fullWidth
              variant="contained"
              onClick={() => setShowDrawer(true)}
            >
              Cart
            </Button>
          </div>
        )}
      </div>
      {/* Drawer Sidebar Mobile */}
      {showDrawer && (
        <div>
          {/* Backdrop */}
          <button
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
            onClick={() => setShowDrawer(false)}
          ></button>

          {/* Drawer Content */}
          <div
            className={`fixed top-0 right-0 h-full w-[90%] max-w-[400px] bg-white shadow-lg z-50 ease-in-out transform transition-transform duration-300 ${
              showDrawer ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-3 border-b">
                <h3 className="text-lg font-semibold">Detail Rincian</h3>
                <Button onClick={() => setShowDrawer(false)}>
                  <X />
                </Button>
              </div>
              <div className="px-3 flex-1 overflow-auto">
                <table className="min-w-full text-left mt-5">
                  <thead>
                    <tr>
                      <th className="px-3 text-nowrap">Nama</th>
                      <th className="px-3 text-nowrap">Jumlah</th>
                      <th className="px-3 text-nowrap">Total</th>
                      <th className="px-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <ArrayMap
                      of={cart}
                      render={(item) => (
                        <tr key={item.id}>
                          <td className="px-3 break-words max-w-[10px]">
                            {item.product_name}
                          </td>
                          <td className="px-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outlined"
                                size="small"
                                className="!min-w-fit mr-3"
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
                              {item.total_item}
                              <Button
                                variant="outlined"
                                size="small"
                                className="!min-w-fit mr-3"
                                onClick={() => minStock(item)}
                              >
                                -
                              </Button>
                            </div>
                          </td>
                          <td className="px-3">
                            Rp.
                            {Number(
                              item.price.replace(/[.]/g, '')
                            ).toLocaleString('id-ID')}
                          </td>
                          <td className="px-3">
                            <Button
                              onClick={() => deleteStock(item)}
                              variant="outlined"
                              color="error"
                              size="small"
                            >
                              <X />
                            </Button>
                          </td>
                        </tr>
                      )}
                    />
                  </tbody>
                </table>
              </div>
              <div className="p-3 border-t">
                <div className="flex justify-between font-bold mb-3">
                  <span>Total:</span>
                  <span>
                    Rp.
                    {(totalPrice.value &&
                      totalPrice.value.toLocaleString('id-ID')) ||
                      0}
                  </span>
                </div>
                <Button fullWidth variant="contained">
                  Print
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
