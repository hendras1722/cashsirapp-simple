"use client"

import { Icon } from "@iconify/react"
import Image from "next/image"
import ModalAddProduct from "./_components/ModalAddProduct"
import CartPage from "./_templates/cart"

export default function ListLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#BEC3CA4D]/30">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-30 bg-white">
        <div className="grid grid-cols-[1fr_360px]  gap-[2px] ">
          <div className="w-full bg-white shadow-sm py-7 px-4 flex items-center gap-2 justify-between">
            <button>
              <Icon icon="lucide:menu" width={32} height={32} />
            </button>
            <h1 className="text-[25px] font-medium">Food Items</h1>
            <button>
              <Icon icon="lucide:search" width={32} height={32} />
            </button>
          </div>
          <div className=" bg-white shadow-sm py-7 px-4 border-l border-[#BEC3CA4D]/30 flex items-center gap-2 justify-center">
            <h2 className="text-[25px] font-medium">Cart</h2>
          </div>
        </div>
      </header>

      {/* ===== BODY ===== */}
      <main className="grid grid-cols-[80px_1fr_360px] gap-[2px]">

        {/* LEFT SIDEBAR */}
        <aside
          className="
            sticky
            z-50
            top-[94px]
            h-[calc(100vh-94px)]
            bg-white
            px-4 py-7
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

        {/* CONTENT */}
        <section className="px-4 py-7 min-h-[calc(100vh - 94px)]">
          {children}
        </section>

        {/* CART */}
        <aside
          className="
            sticky
             z-50
            top-[94px]
            h-[calc(100vh-94px)]
            bg-white
            px-4 py-7
            shadow-sm
          "
        >
          <CartPage />
        </aside>

      </main>
    </div>
  )
}
