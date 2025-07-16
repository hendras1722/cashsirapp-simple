'use client'
import { Box, Button, InputAdornment, TextField } from '@mui/material'
import DataTable from '../molecules/DataTable'
import { Search } from 'lucide-react'
import Modal from '../atoms/Modal'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useComputed } from '@/composable/useComputed'
import { generateUUID } from '@/utils/generatorUUID'
import { default as ref } from '@/composable/useRef'

const formSchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
})

interface Category {
  id?: string
  name: string
}

export default function CategoryLayout() {
  const open = ref(false)
  const search = ref('')
  const isEdit = ref('')
  const category = ref<Category[]>([])

  const getItems = useComputed(() => {
    return category.value.filter((item) =>
      item.name.toLowerCase().includes(search.value.toLowerCase())
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
      category.value = JSON.parse(storeCategory)
    }
  }, [])

  useEffect(() => {
    if (!open) {
      isEdit.value = ''
      formReset()
    }
  }, [open.value, formReset])

  const id = generateUUID()

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (isEdit.value) {
      const findCategory = category.value.find(
        (category) => isEdit.value === category.id
      )
      console.log(findCategory, isEdit.value)
      if (findCategory) {
        const updatedCategory = category.value.map((category) => {
          if (category.id === isEdit.value) {
            return {
              ...category,
              ...data,
            }
          }
          return category
        })
        category.value = updatedCategory
        localStorage.setItem('category', JSON.stringify(updatedCategory))
        open.value = false
        isEdit.value = ''
        formReset()
      }

      return
    }
    const updatedProducts = [...category.value, { ...data, id: id }]
    category.value = updatedProducts
    localStorage.setItem('category', JSON.stringify(updatedProducts))
    open.value = false
    formReset()
  }

  function handleDelete(e: string) {
    const updatedCategory = category.value.filter(
      (category) => category.id !== e
    )
    category.value = updatedCategory
    localStorage.setItem('category', JSON.stringify(updatedCategory))
  }

  return (
    <div>
      <Modal
        open={open}
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
          onChange={(e) => (search.value = e.target.value)}
          className="w-full"
          size="small"
        />
        <Button
          variant="contained"
          className="text-nowrap"
          onClick={() => (open.value = true)}
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
                    isEdit.value = row.id ? row.id : ''
                    open.value = true
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
