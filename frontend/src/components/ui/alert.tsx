import * as React from "react"
import { cn } from "../../lib/utils"

type AlertVariant = "default" | "destructive" | "success" | "warning" | "info"

const getAlertClasses = (variant: AlertVariant = "default") => {
  const baseClasses = "relative w-full rounded-lg border p-4"

  const variants = {
    default: "bg-panel text-text-primary border-border-hairline",
    destructive: "border-danger text-danger bg-danger/10",
    success: "border-success text-success bg-success/10",
    warning: "border-warning text-warning bg-warning/10",
    info: "border-accent text-accent bg-accent/10",
  }

  return `${baseClasses} ${variants[variant]}`
}

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(getAlertClasses(variant), className)}
      {...props}
    />
  )
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
