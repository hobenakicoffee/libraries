import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "peer relative flex size-5.5 shrink-0 items-center justify-center rounded-md border border-input shadow-xs outline-none transition-shadow after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 group-has-disabled/field:opacity-50 aria-invalid:border-destructive aria-invalid:ring aria-invalid:ring-destructive aria-invalid:aria-checked:border-primary data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:bg-input/30 dark:data-checked:bg-primary dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      data-slot="checkbox"
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
        data-slot="checkbox-indicator"
      >
        <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
