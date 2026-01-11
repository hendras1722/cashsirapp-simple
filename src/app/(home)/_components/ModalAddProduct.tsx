"use client"

import { useEffect, useState } from "react"
import { z } from "zod"
import { Form, FormField } from "@/components/form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { InputCurrency } from "@/components/ui/input-currency"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLocalStorage } from "@/hooks/useLocalStorage"

const schema = z.object({
  name_product: z.string().min(3),
  price: z.number().min(1),
  category: z.string().min(1),
  description: z.string().min(3),
})

type Product = z.infer<typeof schema>

export default function ModalAddProduct({
  children,
}: {
  children: React.ReactNode
}) {
  const [data, setData] = useLocalStorage<Product[]>("product", [])

  const [isOpen, setIsOpen] = useState(false)

  function onSubmit(values: Product) {
    const newData = [...data, { id: new Date().getTime(), ...values }]

    setData(newData)

    setIsOpen(false)
  }

  return (
    <Dialog modal onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
        </DialogHeader>

        <Form
          schema={schema}
          onSubmit={onSubmit}
          defaultValues={{
            name_product: "",
            price: 0,
            category: "",
            description: "",
          }}
        >
          {({ setValue }) => (
            <>
              <FormField name="name_product" label="Name Product" required>
                <Input />
              </FormField>

              <FormField name="price" label="Price" required>
                <InputCurrency
                  onValueChange={val =>
                    setValue("price", Number(val || 0))}
                />
              </FormField>

              <FormField name="category" label="Category" required>
                <Select onValueChange={v => setValue("category", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="food">Makanan</SelectItem>
                      <SelectItem value="drink">Minuman</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField name="description" label="Description" required>
                <Input />
              </FormField>

              <Button type="submit" className="w-full text-white">
                Submit
              </Button>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  )
}
