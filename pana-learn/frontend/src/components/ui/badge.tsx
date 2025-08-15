import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-neutral px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 bg-accent text-primary hover:bg-accent/80",
  {
    variants: {
      variant: {
        default:
          "border-neutral bg-accent text-primary hover:bg-accent/80",
        secondary:
          "border-neutral bg-neutral text-primary hover:bg-surface/80",
        destructive:
          "border-red-600 bg-red-100 text-red-800 hover:bg-red-200",
        outline: "text-primary border-neutral",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
