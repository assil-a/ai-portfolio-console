import * as React from "react"
import { cn } from "../../lib/utils"

type BadgeVariant = "default" | "secondary" | "destructive" | "success" | "warning" | "outline"

const getBadgeClasses = (variant: BadgeVariant = "default") => {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-background"

  const variants = {
    default: "border-accent/30 bg-accent/15 text-accent",
    secondary: "border-border-hairline bg-panel-elev text-text-secondary",
    destructive: "border-danger/30 bg-danger/15 text-danger",
    success: "border-success/30 bg-success/15 text-success",
    warning: "border-warning/30 bg-warning/15 text-warning",
    outline: "text-text-primary border-border-hairline bg-transparent",
  }

  return `${baseClasses} ${variants[variant]}`
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div className={cn(getBadgeClasses(variant), className)} {...props} />
  )
}

export { Badge }
