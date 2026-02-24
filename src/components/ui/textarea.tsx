import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "field-sizing-content flex min-h-16 w-full resize-none rounded-xl border border-input px-3 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring aria-invalid:ring-destructive md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive",
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

function Textarea({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      className={cn(textareaVariants({ variant, className }))}
      data-slot="textarea"
      data-variant={variant}
      {...props}
    />
  );
}

export { Textarea, textareaVariants };
