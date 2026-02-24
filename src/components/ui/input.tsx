import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "h-12 w-full min-w-0 rounded-xl border border-input px-3 py-1 text-base text-foreground outline-none transition-colors file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:ring focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring aria-invalid:ring-destructive md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive",
  {
    variants: {
      variant: {
        default: "bg-input/30",
        inverted: "bg-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Input({
  className,
  variant = "default",
  type,
  ...props
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <input
      className={cn(inputVariants({ variant, className }))}
      data-slot="input"
      data-variant={variant}
      type={type}
      {...props}
    />
  );
}

export { Input, inputVariants };
