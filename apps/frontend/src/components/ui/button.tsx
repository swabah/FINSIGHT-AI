import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl text-sm font-bold tracking-tight transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200",
        primary: "bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20",
        outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-600",
        ghost: "hover:bg-slate-100/50 text-slate-500 hover:text-slate-900",
        destructive: "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-100",
      },
      size: {
        default: "h-12 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10 p-0",
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
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
