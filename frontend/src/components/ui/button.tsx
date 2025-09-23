import * as React from "react"
import { cn } from "../../lib/utils"

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
type ButtonSize = "default" | "sm" | "lg" | "icon"

const getButtonClasses = (variant: ButtonVariant = "default", size: ButtonSize = "default") => {
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-fast gpu-accelerated"

  const variants = {
    default: "bg-accent text-accent-fg hover:bg-accent/90 active:bg-accent/80 shadow-sm border-hairline border-accent",
    destructive: "bg-danger text-white hover:bg-danger/90 active:bg-danger/80 shadow-sm border-hairline border-danger",
    outline: "border-hairline border-border-hairline bg-panel hover:bg-panel-elev active:bg-bg text-text-primary elev-1 hover:elev-2",
    secondary: "bg-panel-elev text-text-primary hover:bg-panel active:bg-bg shadow-sm border-hairline border-border-hairline",
    ghost: "text-text-primary hover:bg-panel-elev active:bg-panel",
    link: "text-accent underline-offset-4 hover:underline",
  }

  const sizes = {
    default: "h-9 px-4 text-data-lg",
    sm: "h-8 px-3 text-data-md",
    lg: "h-10 px-6 text-data-lg",
    icon: "h-9 w-9",
  }

  return `${baseClasses} ${variants[variant]} ${sizes[size]}`
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(getButtonClasses(variant, size), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }