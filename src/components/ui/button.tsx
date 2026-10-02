import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--red)] disabled:pointer-events-none disabled:opacity-50", {
  variants: {
    variant: { primary: "bg-[var(--red)] text-white hover:bg-[var(--red-bright)]", secondary: "border border-[var(--line)] bg-[var(--panel-raised)] text-white hover:bg-[#1c272d]", ghost: "text-[var(--muted)] hover:bg-white/5 hover:text-white" },
    size: { default: "h-10 px-4", sm: "h-8 rounded-md px-3 text-xs", icon: "size-10" },
  },
  defaultVariants: { variant: "primary", size: "default" },
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />);
Button.displayName = "Button";
export { Button, buttonVariants };
