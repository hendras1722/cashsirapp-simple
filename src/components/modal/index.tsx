import type { ReactNode } from "react"
import { Icon } from "@iconify/react"
import React, { useState } from "react"

export interface ModalRef {
  open: (data: ModalData) => void
  close: () => void
}

export interface ModalData {
  title?: string
  content?: string | ReactNode
  type?: "info" | "success" | "error" | "warning"
  action?: () => void
}

const Modal = React.forwardRef<ModalRef, Record<string, any>>((_props, ref) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [data, setData] = useState<ModalData>({
    title: "Modal",
    content: "Content",
    type: "info",
  })

  // Expose methods
  React.useImperativeHandle(ref, () => ({
    open: (modalData: ModalData = {}) => {
      setData(prev => ({ ...prev, ...modalData }))
      setIsOpen(true)
    },
    close: () => {
      setIsOpen(false)
    },
  }))

  const colorClasses: Record<string, string> = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  }

  const iconColor: Record<string, string> = {
    info: "text-blue-500",
    success: "text-green-500",
    error: "text-red-500",
    warning: "text-yellow-500",
  }

  const iconMap: Record<string, string> = {
    info: "📋",
    success: "✅",
    error: "❌",
    warning: "⚠️",
  }

  if (!isOpen)
    return null

  const type = data.type || "info"

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full mx-4 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className={`text-2xl mt-0.5 ${iconColor[type]}`}>{iconMap[type]}</div>
            <h2 className="text-lg font-semibold text-gray-900">{data.title}</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon icon="lucide:x" className="h-4 w-4" />
          </button>
        </div>

        <div className={`p-3 rounded border ${colorClasses[type]} mb-6`}>{data.content}</div>

        <button
          onClick={() => setIsOpen(false)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Tutup
        </button>
        <button
          onClick={data.action}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Action
        </button>
      </div>
    </div>
  )
})

Modal.displayName = "Modal"
export default Modal
