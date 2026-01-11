import { Icon } from "@iconify/react";

import { cn } from "@/lib/utils";

function Spinner({ className }: React.ComponentProps<"svg">) {
  return <Icon icon="lucide:loader-2" className={cn("size-4 animate-spin", className)} />;
}

export { Spinner };
