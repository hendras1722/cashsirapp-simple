"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import CartPage from "../_templates/cart"

export default function ModalCart({ children }: { children?: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cart</DialogTitle>
        </DialogHeader>
        <CartPage />
      </DialogContent>
    </Dialog>
  )
}
