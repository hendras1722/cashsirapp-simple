"use client";

import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { useSlots } from "use-react-utilities";
import React, { useLayoutEffect, useRef, useState } from "react";

export default function BaseInput({
  className,
  type,
  children,
  ...props
}: React.ComponentProps<"input">) {
  const { slots }             = useSlots(children);
  const leadingRef            = useRef<HTMLDivElement>(null);
  const trailingRef           = useRef<HTMLDivElement>(null);
  const [padding, setPadding] = useState({ left: 12, right: 12 }); // default px-3

  useLayoutEffect(() => {
    const left  = leadingRef.current?.offsetWidth ?? 0;
    const right = trailingRef.current?.offsetWidth ?? 0;
    // tambahkan jarak kecil biar gak mepet
    setPadding({
      left: left > 0 ? left + 8 : 12,
      right: right > 0 ? right + 8 : 12,
    });
  }, [children]);

  return (
    <div className="relative w-full flex items-center">
      {slots.leading && (
        <div
          ref={leadingRef}
          className="absolute left-2 top-2 flex  items-center text-muted-foreground"
        >
          {slots.leading}
        </div>
      )}

      <Input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        style={{
          paddingLeft: padding.left,
          paddingRight: padding.right,
        }}
        data-np-intersection-state="visible"
        {...props}
      />

      {slots.trailing && (
        <div
          ref={trailingRef}
          className="absolute right-2 inset-y-0 flex items-center text-muted-foreground"
        >
          {slots.trailing}
        </div>
      )}
    </div>
  );
}
