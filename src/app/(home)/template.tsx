"use client"

import type { Cart } from "./_type/cart"
import { Icon } from "@iconify/react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/hooks/useCart"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import ModalAddProduct from "./_components/ModalAddProduct"
import CartPage from "./_templates/cart"
import "./_css/mobile.css"
import { useState } from "react"
import ModalCart from "./_components/ModalCart"
import { useMobile } from "@/hooks/use-mobile"

export default function ListLayout({ children }: { children?: React.ReactNode }) {
  const [data, _] = useLocalStorage<Cart[]>("cart", [])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isMobile = useMobile()

  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen)
    }
  }

  return (
    <div className="min-h-screen bg-[#BEC3CA4D]/30">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-30 bg-white">
        <div className="grid grid-cols-[1fr_360px] header-mobile gap-[2px] ">
          <div className="w-full bg-white shadow-sm py-7 px-4 flex items-center gap-2 justify-between">
            <button onClick={toggleSidebar}>
              <Icon icon="lucide:menu" width={32} height={32} />
            </button>
            <h1 className="text-[25px] font-medium">Food Items</h1>
            <ModalCart>
              <button className="hidden cart-mobile-button">
                <Icon icon="lucide:shopping-cart" width={32} height={32} />
              </button>
            </ModalCart>
          </div>
          <div className=" bg-white shadow-sm py-7 px-4 border-l border-[#BEC3CA4D]/30 flex items-center gap-2 justify-center cart-mobile">
            <h2 className="text-[25px] font-medium">
              Cart (
              {data.length}
              )
            </h2>
          </div>
        </div>
      </header>

      {/* ===== BODY ===== */}
      <main className="grid grid-cols-[80px_1fr_360px] grid-mobile gap-[2px] items-start">
        {/* LEFT SIDEBAR */}
        {(!isMobile || isSidebarOpen) && (
          <aside
            className="
              sticky
              z-50
              top-[94px]
              h-[calc(100vh-94px)]
              bg-white
              px-4
              py-7
              shadow-sm
              flex
              flex-col
              gap-6
            "
          >
            <button className="hover:cursor-pointer">
              <Image
                src="/fork.svg"
                alt="fork"
                width={0}
                height={0}
                className="w-[40px] h-[40px]"
                unoptimized
              />
            </button>
            <ModalAddProduct>
              <button className="hover:cursor-pointer">
                <Image
                  src="/add.svg"
                  alt="fork"
                  width={0}
                  height={0}
                  className="w-[40px] h-[40px]"
                  unoptimized
                />
              </button>
            </ModalAddProduct>
          </aside>
        )}

        {/* CONTENT */}
        <section className="px-4 py-7">
          {children}
        </section>

        {/* CART */}
        <aside
          className="
            sticky
            top-[94px]
            h-[calc(100vh-94px)]
            bg-white
            shadow-sm
            flex
            flex-col
            border-l
            border-[#BEC3CA4D]/30
            cart-mobile
          "
        >
          <div className="flex-1 overflow-y-auto min-h-0 px-4 py-7">
            <CartPage />
          </div>
          <div className="shrink-0 p-4 bg-white border-t">
            <Button className="w-full text-white">
              Checkout
            </Button>
          </div>
        </aside>
      </main>
    </div>
  )
}
