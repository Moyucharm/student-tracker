"use client"

import Link from "next/link"
import { Camera, ImageIcon, LayoutDashboard } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "首页", icon: LayoutDashboard },
    { href: "/image-detection", label: "图片检测", icon: ImageIcon },
    { href: "/realtime-detection", label: "实时检测", icon: Camera },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">行为检测</span>
        </Link>
        <nav className="flex items-center space-x-1">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              asChild
              className={cn("text-sm font-medium", pathname === item.href ? "text-primary" : "text-muted-foreground")}
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  )
}
