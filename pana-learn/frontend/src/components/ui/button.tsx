import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-accent text-primary hover:bg-accent/80",
        destructive:
          "bg-red-600 text-white hover:bg-red-700",
        outline:
          "border border-neutral bg-surface hover:bg-neutral hover:text-primary",
        secondary:
          "bg-neutral text-primary hover:bg-surface/80",
        ghost: "hover:bg-neutral hover:text-accent",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ variant = 'primary', ...props }) {
  let className = '';
  if (variant === 'primary') {
    className = 'bg-era-dark text-era-neon rounded-lg font-heading font-bold transition-colors hover:bg-era-neon hover:text-era-dark';
  } else if (variant === 'secondary') {
    className = 'bg-white text-era-dark border-2 border-era-dark rounded-lg font-heading font-bold hover:bg-era-neon hover:text-era-dark';
  }
  return <button className={className + ' ' + (props.className || '')} {...props} />;
}
