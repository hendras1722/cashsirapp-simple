"use client"

import type { ReactElement, ReactNode } from "react"
import type {
  ArrayPath,
  DefaultValues,
  FieldValues,
  SubmitHandler,
  UseFieldArrayReturn,
  UseFormReturn,
} from "react-hook-form"
import type { ZodSchema } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import React, { createContext, useContext } from "react"
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext as useRHFContext,
} from "react-hook-form"
import { cn } from "@/lib/utils"

interface FormProps<T extends FieldValues> {
  children: ReactNode | ((
    methods: UseFormReturn<T> & {
      submit: () => void
      isPending: boolean
      useFieldArray: <K extends ArrayPath<T>>(name: K) => UseFieldArrayReturn<T, K>
    },
  ) => ReactNode)
  onSubmit: SubmitHandler<T>
  schema?: ZodSchema<T>
  defaultValues?: DefaultValues<T>
  className?: string
  config?: Omit<Parameters<typeof useForm>[0], "defaultValues" | "resolver">
}

interface FormFieldProps {
  name: string
  label?: string
  required?: boolean
  className?: string
  children: ReactElement
  rules?: object
}

const FormContext = createContext<UseFormReturn<any> | null>(null)

export function Form<T extends FieldValues>({
  children,
  onSubmit,
  schema,
  defaultValues,
  className = "",
  config = {},
}: FormProps<T>) {
  const methods = useForm<T>({
    resolver: schema ? (zodResolver(schema as any) as any) : undefined,
    defaultValues,
    mode: "onChange",
    ...config,
  })

  const submit = async () => {
    await methods.handleSubmit(onSubmit)()
  }

  return (
    <FormProvider {...methods}>
      <FormContext.Provider value={methods}>
        <form className={className} onSubmit={methods.handleSubmit(onSubmit)}>
          {typeof children === "function" ? children({
            ...methods,
            submit,
            isPending: methods.formState.isSubmitting,
            useFieldArray: <K extends ArrayPath<T>>(name: K) =>
              useFieldArray({ control: methods.control, name }),
          }) : children}
        </form>
      </FormContext.Provider>
    </FormProvider>
  )
}

export function FormField({
  name,
  label,
  required = false,
  className = "",
  children,
  rules = {},
}: FormFieldProps) {
  const {
    formState: { errors },
  } = useRHFContext()

  const error = name
    .split(".")
    .reduce(
      (obj: any, key) => (obj && obj[key] ? obj[key] : undefined),
      errors,
    )

  const fieldRules = {
    ...rules,
    ...(required && { required: `${label || name} wajib diisi` }),
  }

  if (!children) {
    throw new Error(
      "FormField requires children. Use <FormField name='...'><input /></FormField>",
    )
  }

  const child = children as React.ReactElement<any>
  return (
    <Controller
      name={name}
      rules={fieldRules}
      render={({ field }) => (
        <div className={cn("mb-4", className)}>
          {label && (
            <label
              htmlFor={name}
              className="block text-sm font-medium mb-1 text-[#344054]"
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          {React.cloneElement(children as React.ReactElement<any>, {
            ...field,
            "id": name,
            "aria-invalid": !!error,
            "aria-describedby": error ? `${name}-error` : undefined,
            "onChange": (...args: any[]) => {
              field.onChange(...args)
              child.props?.onChange?.(...args)
            },
          })}
          {error && (
            <p id={`${name}-error`} className="mt-1 text-sm text-red-400">
              {(error.message || "Field tidak valid") as string}
            </p>
          )}
        </div>
      )}
    />
  )
}

export function useFormContext<T extends FieldValues = FieldValues>(): UseFormReturn<T> {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error("useFormContext must be used within a Form component")
  }
  return context as UseFormReturn<T>
}

export function useFormField(name: string) {
  const methods = useRHFContext()
  const { fields, append, remove, insert, update, prepend, swap, move } = useFieldArray({
    control: methods.control,
    name,
  })

  return {
    fields,
    append,
    remove,
    insert,
    update,
    prepend,
    swap,
    move,
  }
}
