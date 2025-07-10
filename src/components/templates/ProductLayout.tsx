'use client'
import {
  Autocomplete,
  Box,
  Button,
  InputAdornment,
  Switch,
  TextField,
} from '@mui/material'
import DataTable, { Column } from '../molecules/DataTable'
import { Search } from 'lucide-react'
import Modal from '../atoms/Modal'
import { useEffect, useState } from 'react'
import z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { moneyRupiah } from '@/utils/convertMoney'
import { useComputed } from '@/composable/useComputed'
import { generateUUID } from '@/utils/generatorUUID'
import { If } from '../atoms/if'

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
  category: z.string().optional(),
})

interface Category {
  id: string
  name: string
}

export default function ProductLayout() {
  const [open, setOpen] = useState(false)
  const [products, setProducts] = useState<z.infer<typeof formSchema>[]>([])
  const [search, setSearch] = useState('')

  const [isEdit, setIsEdit] = useState('')
  const [isDelete, setIsDelete] = useState('')

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
      category: '',
    },
  })

  useEffect(() => {
    if (!open) {
      setIsEdit('')
      form.reset()
    }
  }, [open, form])

  const getCategory = useComputed(() => {
    const category = localStorage.getItem('category')
    return category
      ? JSON.parse(category).map((item: Category) => {
          return {
            code: item.id,
            label: item.name,
          }
        })
      : []
  })

  const columns = useComputed(() => {
    if (getCategory.value.length > 0) {
      return [
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
          label: 'Category',
          minWidth: 170,
          accessor: 'category',
          render: (row) => {
            const categoryRow = getCategory.value.find(
              (item) => item.code === row.category
            )
            return categoryRow ? categoryRow.label : ''
          },
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
                  form.setValue('category', row.category)
                  setOpen(true)
                  setIsEdit(row.id ? row.id : '')
                }}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  setIsDelete(row.id ? row.id : '')
                  handeDelete()
                }}
              >
                Delete
              </Button>
            </div>
          ),
        },
      ] as Column<z.infer<typeof formSchema>>[]
    }
    return [
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
                setIsEdit(row.id ? row.id : '')
              }}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                setIsDelete(row.id ? row.id : '')
                handeDelete()
              }}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ] as Column<z.infer<typeof formSchema>>[]
  })

  const items = useComputed(() => {
    return products
      ? products.filter((product) =>
          product.product_name.toLowerCase().includes(search.toLowerCase())
        )
      : []
  })
  const id = generateUUID()

  function handleSubmit(data: z.infer<typeof formSchema>) {
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
      setOpen(false)

      return
    }

    const updatedProducts = [...products, { ...data, id: id }]
    setProducts(updatedProducts)
    localStorage.setItem('product', JSON.stringify(updatedProducts))
    setOpen(false)
  }

  function handeDelete() {
    const updatedProducts = products.filter(
      (product) => product.id !== isDelete
    )
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
              <If condition={!!(getCategory.value?.length > 0)}>
                <Controller
                  name="category"
                  control={form.control}
                  render={({
                    field: { onChange, onBlur, value, ref },
                    fieldState: { error },
                  }) => (
                    <Autocomplete
                      onBlur={onBlur}
                      onChange={(_, newValue) => {
                        onChange(newValue ? newValue.code : '')
                      }}
                      value={
                        getCategory.value.find(
                          (option) => option.code === value
                        ) || null
                      }
                      options={getCategory.value}
                      getOptionLabel={(option: { label: string }) =>
                        option.label
                      }
                      isOptionEqualToValue={(
                        option: { label: string; code: string },
                        value: { label: string; code: string }
                      ) => option.code === value.code}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Category"
                          inputRef={ref}
                          error={!!error}
                          helperText={error && error.message}
                        />
                      )}
                    />
                  )}
                />
              </If>

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
          fields={columns.value}
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
