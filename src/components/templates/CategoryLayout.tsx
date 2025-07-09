'use client'
import { Box, Button, InputAdornment, TextField } from '@mui/material'
import DataTable from '../molecules/DataTable'
import { Search } from 'lucide-react'
import Modal from '../atoms/Modal'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useComputed } from '@/composable/useComputed'
import { generateUUID } from '@/utils/generatorUUID'

const formSchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
})

interface Category {
  id?: string
  name: string
}

export default function CategoryLayout() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [isEdit, setisEdit] = useState('')

  const [category, setCategory] = useState<Category[]>([])
  const getItems = useComputed(() => {
    return category.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    )
  })

  const {
    control,
    handleSubmit,
    formState,
    reset: formReset,
    setValue,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  })

  useEffect(() => {
    const storeCategory = localStorage.getItem('category')
    if (storeCategory) {
      setCategory(JSON.parse(storeCategory))
    }
  }, [])

  useEffect(() => {
    if (!open) {
      setisEdit('')
      formReset()
    }
  }, [open, setOpen, formReset])

  const id = generateUUID()

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (isEdit) {
      const findCategory = category.find((category) => isEdit === category.id)
      if (findCategory) {
        const updatedCategory = category.map((category) => {
          if (category.id === isEdit) {
            return {
              ...category,
              ...data,
            }
          }
          return category
        })
        setCategory(updatedCategory)
        localStorage.setItem('category', JSON.stringify(updatedCategory))
      }
      return
    }
    const updatedProducts = [...category, { ...data, id: id }]
    setCategory(updatedProducts)
    localStorage.setItem('category', JSON.stringify(updatedProducts))
    setOpen(false)
  }

  function handleDelete(e: string) {
    const updatedCategory = category.filter((category) => category.id !== e)
    setCategory(updatedCategory)
    localStorage.setItem('category', JSON.stringify(updatedCategory))
  }

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        contentText=""
        title={isEdit ? 'Edit Category' : 'Add Category'}
      >
        <div className="mb-7 mt-3">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="gap-3 flex flex-col"
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  label="Category Name"
                  error={!!formState.errors.name}
                  helperText={formState.errors.name?.message}
                  className="w-full"
                />
              )}
            />
            <Button variant="contained" type="submit">
              Submit
            </Button>
          </form>
        </div>
      </Modal>
      <Box display={'flex'} justifyContent={'space-between'} mb={5} gap={3}>
        <TextField
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            },
          }}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
          size="small"
        />
        <Button
          variant="contained"
          className="text-nowrap"
          onClick={() => setOpen(true)}
        >
          Add Category
        </Button>
      </Box>
      <DataTable
        fields={[
          {
            label: 'ID',
            accessor: 'id',
          },
          {
            label: 'Name',
            accessor: 'name',
          },
          {
            label: '',
            render: (row) => (
              <div className="flex flex-row gap-3">
                <Button
                  className="flex gap-2"
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setisEdit(row.id ? row.id : '')
                    setOpen(true)
                    setValue('name', row.name)
                  }}
                >
                  Edit
                </Button>
                <Button
                  className="flex gap-2"
                  variant="contained"
                  color="error"
                  onClick={() => handleDelete(row.id ? row.id : '')}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
        items={getItems.value}
        onPageChange={() => {}}
        onRowsPerPageChange={() => {}}
        totalItems={1}
        page={0}
        rowsPerPage={10}
      />
    </div>
  )
}
