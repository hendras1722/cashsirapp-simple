"use client"

import type { Cart } from "../_type/cart"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import ArrayMap from "@/hooks/arrayMap"
import { useLocalStorage } from "@/hooks/useLocalStorage"

export default function CartPage() {
  const [data, setData] = useLocalStorage<Cart[]>("cart", [])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  function onQtyChange(data: Cart, type: "add" | "remove") {
    setData((prev) => {
      if (type === "remove" && data.qty === 1) {
        return prev.filter(item => item.id !== data.id)
      }
      return prev.map((item) => {
        if (item.id === data.id) {
          return {
            ...item,
            qty: type === "add" ? item.qty + 1 : item.qty - 1,
          }
        }
        return item
      })
    })
  }

  if (!mounted)
    return null
  return (
    <div>
      <ArrayMap
        of={data ?? []}
        render={(item, index) => (
          <div key={`${index}-product`} className="grid grid-cols-[100px_1fr] grid-rows-1 gap-4 mt-2 first:mt-0">
            <div className="bg-[#e67e22] rounded-2xl w-full h-[100px] flex justify-center items-center">
              <div className="flex flex-col gap-4 justify-center items-center">
                <Image
                  src={item.category === "food" ? "/fork.png" : "sauce.png"}
                  alt=""
                  width={50}
                  height={50}
                  unoptimized
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-[25px] font-medium">{item.name_product}</p>
              <div className="flex justify-between gap-3 items-center">
                <div className="flex">
                  <Button onClick={() => onQtyChange(item, "remove")} className="bg-[#82DE3A]/20 rounded-tr-none rounded-br-none border border-[#82DE3A] hover:bg-[#82DE3A] text-[#82DE3A] font-bold text-2xl ">-</Button>
                  <div className="flex flex-col items-center text-2xl border border-[#82DE3A] px-2 text-[#82DE3A]">{item.qty}</div>
                  <Button onClick={() => onQtyChange(item, "add")} className="bg-[#82DE3A]/20 rounded-tl-none rounded-bl-none border border-[#82DE3A] hover:bg-[#82DE3A] text-[#82DE3A] font-bold text-2xl ">+</Button>
                </div>
                <div>
                  Rp.
                  {Number(item.price).toLocaleString("id-ID")}
                </div>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  )
}
