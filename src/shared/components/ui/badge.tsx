import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-[#FF7B21] to-[#FF9F45] text-white shadow-sm shadow-orange-500/20 [a&]:hover:bg-primary/90 hover:shadow-md hover:scale-105",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 hover:scale-105",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm shadow-red-500/20 [a&]:hover:bg-destructive/90 hover:shadow-md hover:scale-105",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground hover:scale-105",
        success:
          "border-transparent bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm shadow-emerald-500/20 hover:shadow-md hover:scale-105",
        warning:
          "border-transparent bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/20 hover:shadow-md hover:scale-105",
        info:
          "border-transparent bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm shadow-blue-500/20 hover:shadow-md hover:scale-105",
        gradient:
          "border-transparent bg-gradient-to-r from-[#FF7B21] via-[#FF9F45] to-[#19D6C8] text-white shadow-lg shadow-orange-500/20 hover:shadow-xl hover:scale-105",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge }
