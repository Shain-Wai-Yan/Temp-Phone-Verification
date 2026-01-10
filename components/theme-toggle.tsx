"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check localStorage or system preference on mount
    const stored = localStorage.getItem("theme") as "light" | "dark" | null
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    const initialTheme = stored || (prefersDark ? "dark" : "light")
    setTheme(initialTheme)
    document.documentElement.classList.toggle("dark", initialTheme === "dark")
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  if (!mounted) {
    return <div className="h-9 w-9 sm:h-10 sm:w-10" />
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 sm:h-10 sm:w-10 transition-transform hover:scale-110"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 sm:h-5 sm:w-5 transition-transform rotate-0" />
      ) : (
        <Moon className="h-4 w-4 sm:h-5 sm:w-5 transition-transform rotate-0" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
