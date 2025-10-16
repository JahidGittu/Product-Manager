'use client';

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-transform shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:-translate-y-0.5",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary/90",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border border-input bg-transparent text-foreground hover:bg-accent/10",
        ghost: "bg-transparent text-foreground hover:bg-muted/20",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        default: "px-5 py-2 text-base",
        lg: "px-6 py-3 text-lg",
        icon: "p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button, buttonVariants };
