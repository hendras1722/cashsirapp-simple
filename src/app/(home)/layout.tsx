import type { Metadata } from "next"
import { ViewTransition } from "react"
import "../globals.css"
import "./_css/home.module.css"

export const metadata: Metadata = {
  title: "Products Shop",
  description: "Products Shop",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ViewTransition>
      {children}
    </ViewTransition>
  )
}
