import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navigation from "@/components/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "学生行为检测系统",
  description: "基于AI的学生行为分析系统",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
          <footer className="text-center p-4 text-sm text-muted-foreground border-t">
            学生行为检测系统 © {new Date().getFullYear()}
          </footer>
        </div>
      </body>
    </html>
  )
}
