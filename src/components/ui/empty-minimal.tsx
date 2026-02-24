import { cn } from "@/lib/utils";

export function EmptyMinimal({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "h-fit rounded-lg border border-dashed py-8 text-center text-muted-foreground text-sm",
        className
      )}
      data-slot="empty"
      {...props}
    >
      {children}
    </div>
  );
}
