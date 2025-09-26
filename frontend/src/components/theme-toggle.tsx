import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "./ui/button"
import { useTheme } from "./theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else {
      setTheme("light")
    }
  }

  const getIcon = () => {
    if (theme === "light") return <Sun className="h-4 w-4" />
    if (theme === "dark") return <Moon className="h-4 w-4" />
    // For system theme, show sun icon as default
    return <Sun className="h-4 w-4" />
  }

  const getLabel = () => {
    if (theme === "light") return "Switch to dark mode"
    if (theme === "dark") return "Switch to light mode"
    return "Switch to dark mode"
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={getLabel()}
      className="transition-all duration-200 hover:bg-accent"
    >
      {getIcon()}
      <span className="sr-only">{getLabel()}</span>
    </Button>
  )
}
