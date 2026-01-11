import type { VariantProps } from "class-variance-authority"
import { useSlots } from "use-react-utilities"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "../ui/button"

export default function BaseButton({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<"button">
  & VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const { slots } = useSlots(children)
  return (
    <Button {...props} className={cn(buttonVariants({ variant, size, className }))}>
      {slots.leading && <span className="mr-1">{slots.leading}</span>}
      {children}
      {slots.trailing && <span className="ml-1">{slots.trailing}</span>}
    </Button>
  )
}
