'use client'
import { Box, Button, InputAdornment, Switch, TextField } from '@mui/material'
import DataTable from '../molecules/DataTable'
import { Search } from 'lucide-react'
import Modal from '../atoms/Modal'
import { useEffect, useId, useState } from 'react'
import z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { moneyRupiah } from '@/utils/convertMoney'
import { useComputed } from '@/composable/useComputed'

const formSchema = z.object({
  id: z.string().optional(),
  product_name: z.string().min(3, 'Product name must be at least 3 characters'),
  price: z
    .string()
    .refine(
      (value) => Number(value.replace(/[.]/g, '')) > 0,
      'Stock must be at least 0'
    ),
  stock: z.string(),
  description: z.string(),
  active: z.boolean(),
  actions: z.string().optional(),
})

export default function ProductLayout() {
  const [open, setOpen] = useState(false)
  const [products, setProducts] = useState<z.infer<typeof formSchema>[]>([])
  const [search, setSearch] = useState('')

  const [isEdit, setEdit] = useState('')
  const id = useId()

  useEffect(() => {
    const storedProducts = localStorage.getItem('product')
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts))
    }
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_name: '',
      price: '',
      stock: '',
      description: '',
      active: false,
    },
  })

  useEffect(() => {
    if (!open) {
      setEdit('')
      form.reset()
    }
  }, [open, form])

  const columns: {
    label: string
    minWidth?: number
    accessor?: keyof z.infer<typeof formSchema> | 'actions'
    render?: (row: z.infer<typeof formSchema>, index: number) => React.ReactNode
  }[] = [
    {
      label: 'Name',
      minWidth: 170,
      accessor: 'product_name',
    },
    {
      label: 'Stock',
      minWidth: 100,
      accessor: 'stock',
    },
    {
      label: 'Price',
      minWidth: 70,
      accessor: 'price',
      render: (row) => `Rp.${row.price}`,
    },
    {
      label: 'Description',
      minWidth: 170,
      accessor: 'description',
    },
    {
      label: 'Active',
      minWidth: 70,
      accessor: 'active',
      render: (row) => (
        <Switch
          checked={row.active}
          onChange={() => {
            const updatedProducts = products.map((product) => {
              if (product.id === row.id) {
                return {
                  ...product,
                  active: !product.active,
                }
              }
              return product
            })
            setProducts(updatedProducts)
            localStorage.setItem('product', JSON.stringify(updatedProducts))
          }}
        />
      ),
    },
    {
      label: 'Action',
      minWidth: 70,
      accessor: 'actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button
            variant="contained"
            onClick={() => {
              form.setValue('product_name', row.product_name)
              form.setValue('price', row.price)
              form.setValue('stock', row.stock)
              form.setValue('description', row.description)
              form.setValue('active', row.active)
              setOpen(true)
              setEdit(row.id ? row.id : '')
            }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setEdit(row.id ? row.id : '')
              handeDelete()
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ]

  const items = useComputed(() => {
    return products
      ? products.filter((product) =>
          product.product_name.toLowerCase().includes(search.toLowerCase())
        )
      : []
  })

  function handleSubmit(data: z.infer<typeof formSchema>) {
    setOpen(false)
    if (isEdit) {
      const findProduct = products.find((product) => isEdit === product.id)
      if (findProduct) {
        const updatedProducts = products.map((product) => {
          if (product.id === isEdit) {
            return {
              ...product,
              ...data,
            }
          }
          return product
        })
        setProducts(updatedProducts)
        localStorage.setItem('product', JSON.stringify(updatedProducts))
      }
      return
    }
    const updatedProducts = [
      ...products,
      { ...data, id: id + data.product_name },
    ]
    setProducts(updatedProducts)
    localStorage.setItem('product', JSON.stringify(updatedProducts))
  }

  function handeDelete() {
    const updatedProducts = products.filter((product) => product.id !== isEdit)
    setProducts(updatedProducts)
    localStorage.setItem('product', JSON.stringify(updatedProducts))
  }
  return (
    <div>
      <Modal
        setOpen={setOpen}
        open={open}
        title={isEdit ? 'Edit Product' : 'Add Product'}
        contentText=""
      >
        <Box pb={2}>
          <div>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-3"
            >
              <TextField
                fullWidth
                label="Product Name"
                {...form.register('product_name')}
                error={!!form.formState.errors.product_name}
                helperText={form.formState.errors.product_name?.message}
                margin="dense"
              />
              <Controller
                control={form.control}
                name="price"
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Price"
                    {...field}
                    error={!!form.formState.errors.price}
                    helperText={form.formState.errors.price?.message}
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement
                      if (!input.value) return (input.value = '')
                      if (input.value.startsWith('0')) {
                        input.value = ''
                        return
                      }
                      const value = moneyRupiah(input.value)
                      if (value === '') return (input.value = '')
                      input.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                      field.onChange(input.value)
                    }}
                  />
                )}
              />

              <TextField
                type="number"
                fullWidth
                label="Stock"
                onInput={(e) => {
                  const input = e.target as HTMLInputElement
                  if (!input.value) return (input.value = '')
                  if (input.value.startsWith('0')) {
                    input.value = ''
                  }
                }}
                {...form.register('stock')}
                error={!!form.formState.errors.stock}
                helperText={form.formState.errors.stock?.message}
              />
              <TextField
                fullWidth
                label="Description"
                {...form.register('description')}
                error={!!form.formState.errors.description}
                helperText={form.formState.errors.description?.message}
              />
              <Box
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
              >
                <span>Product Status</span>
                <Controller
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <Switch
                      {...form.register('active')}
                      onChange={field.onChange}
                      checked={field.value}
                    />
                  )}
                />
              </Box>
              <Button variant="contained" type="submit">
                Submit
              </Button>
            </form>
          </div>
        </Box>
      </Modal>
      <div>
        <Box display={'flex'} justifyContent={'space-between'} mb={5} gap={3}>
          <TextField
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              },
            }}
            className="w-full"
            size="small"
          />
          <Button variant="contained" onClick={() => setOpen(true)}>
            Add
          </Button>
        </Box>
        <DataTable
          fields={columns}
          items={items.value}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          totalItems={1}
          page={0}
          rowsPerPage={10}
        />
      </div>
    </div>
  )
}
