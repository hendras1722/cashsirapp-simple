"use client"

import type { Cart } from "../_type/cart"
import type { Product } from "../_type/product"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import ArrayMap from "@/hooks/arrayMap"
import { useLocalStorage } from "@/hooks/useLocalStorage"

export default function HomePage() {
  const [data, _setData] = useLocalStorage<Product[]>("product", [])
  const [_cart, setCart] = useLocalStorage<Cart[]>("cart", [])

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  function onCart(product: Product) {
    setCart((prev) => {
      const exists = prev.find(item => item.id === product.id)

      if (exists) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item,
        )
      }

      return [
        ...prev,
        {
          ...product,
          qty: 1,
        },
      ]
    })
  }

  if (!mounted)
    return null
  return (
    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 grid-rows-1 gap-4" style={{ viewTransitionName: "featured-list" }}>
      <ArrayMap
        of={data ?? []}
        render={(item, index) => (
          <div key={`${index}-product`} className="flex flex-col gap-4 hover:shadow rounded-2xl">
            <div className="bg-[#e67e22] rounded-tl-2xl rounded-tr-2xl w-full h-[200px] flex justify-center items-center">
              <div className="flex flex-col gap-4 justify-center items-center">
                <Image
                  src={item.category === "food" ? "/fork.png" : "sauce.png"}
                  alt=""
                  width={100}
                  height={100}
                  unoptimized
                />
              </div>
            </div>
            <div className="pb-2 px-2">
              <h2 className="text-2xl font-normal">{item.name_product}</h2>
              <p className="text-2xl font-semibold">
                Rp.
                {Number(item.price).toLocaleString("id-ID")}
              </p>
            </div>
            <Button onClick={() => onCart(item)} className="text-white rounded-tl-none rounded-tr-none hover:cursor-pointer">
              Add to cart
            </Button>
          </div>
        )}
      />
    </div>
  )
}
