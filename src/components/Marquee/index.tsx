"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { tv } from "tailwind-variants";
import styles from "./marquee.module.css";

const marqueeVariants = tv({
  slots: {
    root: "relative flex overflow-hidden",
    content: "flex-shrink-0 flex items-center justify-around",
  },
  variants: {
    orientation: {
      horizontal: {
        root: "flex-row",
      },
      vertical: {
        root: "flex-col",
      },
    },
    overlay: {
      true: {
        root: 'relative after:absolute after:inset-0 after:content-[""] after:[background:linear-gradient(to_right,_theme(colors.background)_0%,_transparent_10%,_transparent_90%,_theme(colors.background)_100%)] dark:after:[background:linear-gradient(to_right,_theme(colors.background)_0%,_transparent_10%,_transparent_90%,_theme(colors.background)_100%)]',
      },
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    overlay: true,
  },
});

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  repeat?: number;
  orientation?: "horizontal" | "vertical";
  pauseOnHover?: boolean; // kalau true, akan menambahkan class "group" ke root => :global(.group):hover CSS akan bekerja
  reverse?: boolean;
  overlay?: boolean;
  /**
   * Speed in seconds (durasi satu loop). Default 30 (seconds).
   * smaller = faster (e.g. 15 => 2x faster than 30)
   */
  speed?: number;
  /**
   * Jika true, pakai explicit pause class (bukan hover). berguna untuk kontrol via JS.
   */
  paused?: boolean;
}

const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(
  (
    {
      className,
      orientation = "horizontal",
      pauseOnHover = false,
      reverse = false,
      overlay = true,
      as: Component = "div",
      repeat = 4,
      speed = 30,
      paused = false,
      children,
      ...props
    },
    ref
  ) => {
    const { root, content } = marqueeVariants({ orientation, overlay });

    const animationClass =
      orientation === "vertical" ? styles.contentVertical : styles.contentHorizontal;

    // Jika kamu ingin "semakin besar speed semakin cepat"
    const animationStyle: React.CSSProperties = {
      animationDuration: `${Math.max(1, 300 / speed)}s`, // misal speed 100 → durasi 3s, speed 10 → durasi 30s
    };

    return (
      <Component
        ref={ref}
        data-orientation={orientation}
        // kalau pauseOnHover true -> tambahkan global class "group" agar :global(.group):hover bekerja
        className={cn(root(), pauseOnHover && "group", className)}
        {...props}
      >
        {Array.from({ length: repeat }).map((_, i) => (
          <div
            key={i}
            className={cn(
              content(),
              animationClass,
              reverse && styles.reverse,
              paused && styles.paused
            )}
            style={animationStyle}
            aria-hidden={i > 0}
          >
            {children}
          </div>
        ))}
      </Component>
    );
  }
);

Marquee.displayName = "Marquee";

export { Marquee, marqueeVariants };
