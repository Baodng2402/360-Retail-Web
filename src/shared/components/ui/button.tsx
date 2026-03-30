import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#FF7B21]/50 focus-visible:ring-offset-0 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 shadow-lg shadow-destructive/20 active:scale-[0.98]",
        outline:
          "border-2 border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-[#FF7B21]/50 active:scale-[0.98] dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm active:scale-[0.98]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground hover:scale-105 dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-[#FF7B21] via-[#FF9F45] to-[#19D6C8] text-white shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-105 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-3",
        sm: "h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3 text-xs",
        lg: "h-12 rounded-xl px-8 has-[>svg]:px-5 text-base font-semibold",
        xl: "h-14 rounded-2xl px-10 has-[>svg]:px-6 text-lg font-bold shadow-lg",
        icon: "size-10 rounded-xl",
        "icon-sm": "size-9 rounded-lg",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button }
