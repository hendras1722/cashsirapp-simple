"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Icon, type IconifyIcon } from "@iconify/react";
import { toArray } from "@/utils/toArray";

export interface MenuItem {
  id: string;
  label: string;
  to?: string;
  children?: MenuItem[];
  icon?: string | IconifyIcon;
}

interface AppSidebarProps {
  collapsed: boolean;
  onClose?: () => void;
  logoLabel?: string;
  logoIcon?: React.ReactNode;
  items: MenuItem[];
}

// for checking if a menu item contains a path
function containsPath(item: MenuItem, path: string | null): boolean {
  if (!path) return false;
  if (item.to && path.startsWith(item.to)) return true;
  if (!item.children) return false;
  return item.children.some((c: MenuItem) => containsPath(c, path));
}

// for Collapsed nav item
function CollapsedNavItem({ item, currentPath }: { item: MenuItem; currentPath: string | null }) {
  if (item.children) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-10 h-10 rounded-lg hover:!bg-primary/50 mt-2 mb-0",
              item.children.some((c: MenuItem) => containsPath(c, currentPath)) && "bg-primary/50"
            )}
            aria-label={item.label}
          >
            {item.icon && <Icon icon={item.icon} className="h-5 w-5" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent side="right" className="p-2 w-56 space-y-1">
          <p className="px-2 py-1.5 text-sm font-medium text-muted-foreground">{item.label}</p>
          {item.children.map((child: MenuItem) => (
            <NestedPopover key={child.id} item={child} currentPath={currentPath} />
          ))}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={item.to || "#"} passHref aria-label={item.label}>
            <Button
              aria-label="tooltip_icon"
              variant="ghost"
              size="icon"
              className={cn(
                "w-10 h-10 rounded-lg hover:bg-primary/50",
                currentPath && item.to && currentPath.startsWith(item.to) && "bg-primary/50"
              )}
            >
              {item.icon && <Icon icon={item.icon} className="h-5 w-5" />}
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{item.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// for popover nested
function NestedPopover({ item, currentPath }: { item: MenuItem; currentPath: string | null }) {
  if (item.children) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            aria-label={item.label}
            variant="ghost"
            className="w-full justify-between px-3 py-2 text-sm font-normal hover:bg-primary/50"
          >
            {item.label}
            <Icon icon="lucide:chevron-right" className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="right" align="start" className="p-2 w-52 space-y-1">
          {item.children.map((child: MenuItem) => (
            <NestedPopover key={child.id} item={child} currentPath={currentPath} />
          ))}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Link href={item.to || "#"} passHref aria-label={item.label}>
      <Button
        aria-label={item.label}
        variant={currentPath && item.to && currentPath.startsWith(item.to) ? "default" : "ghost"}
        className={cn(
          "w-full justify-start px-3 py-2 text-sm font-normal hover:!bg-primary/50 mb-2",
          currentPath &&
            item.to &&
            currentPath.startsWith(item.to) &&
            "!bg-primary/50 hover:!bg-primary/50"
        )}
      >
        {item.label}
      </Button>
    </Link>
  );
}

// for sidebar item navigation
function SidebarItem({ item, currentPath }: { item: MenuItem; currentPath: string | null }) {
  const hasChildren     = !!item.children?.length;
  const [open, setOpen] = useState<boolean>(() => containsPath(item, currentPath));

  useEffect(() => {
    const shouldOpen = containsPath(item, currentPath);
    setOpen(shouldOpen);
  }, [item, currentPath]);

  if (hasChildren) {
    return (
      <div className="space-y-2">
        <button
          aria-label={item.label}
          onClick={() => setOpen((v) => !v)}
          className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium hover:bg-primary/50 rounded-md mt-2"
          aria-expanded={open}
        >
          <span className="flex items-center gap-2">
            {item.icon && <Icon icon={item.icon} className="h-5 w-5" />}
            <span>{item.label}</span>
          </span>
          <Icon
            icon="lucide:chevron-down"
            className={cn("h-4 w-4 transition-transform", open ? "rotate-180" : "")}
          />
        </button>

        {open && (
          <div className="ml-7 mt-2 space-y-1 border-l border-black/20 pl-2">
            {toArray(item.children).map((child: MenuItem) => (
              <SidebarItem key={child.id} item={child} currentPath={currentPath} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href={item.to || "#"} passHref aria-label={item.label}>
      <Button
        aria-label={item.label}
        variant={currentPath && item.to && currentPath.startsWith(item.to) ? "default" : "ghost"}
        className={cn(
          "w-full justify-start px-3 py-2 text-sm font-normal hover:!bg-primary/50 first:mt-2",
          currentPath &&
            item.to &&
            currentPath.startsWith(item.to) &&
            "!bg-primary/50 hover:!bg-primary/50"
        )}
      >
        {item.icon && <Icon icon={item.icon} className="h-5 w-5" />}
        {item.label}
      </Button>
    </Link>
  );
}

export function AppSidebar({
  collapsed,
  logoLabel = "Gemini UI",
  logoIcon,
  items,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "bg-card border-r border-border flex flex-col fixed lg:static inset-y-0 left-0 z-50 transition-all duration-200 ease-in-out",
        {
          "w-[72px]": collapsed,
          "w-[260px]": !collapsed,
          "-translate-x-full lg:translate-x-0": collapsed,
        }
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-border">
        {logoIcon ? (
          logoIcon
        ) : (
          <div className="w-8 h-8 bg-primary/50 rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">M</span>
          </div>
        )}
        {!collapsed && <span className="ml-3 font-semibold text-lg">{logoLabel}</span>}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {collapsed ? (
          <div className="space-y-2">
            {items.map((section) =>
              section.children?.map((item) => (
                <CollapsedNavItem key={item.id} item={item} currentPath={pathname} />
              ))
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((section) => (
              <div key={section.id}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase px-3">
                  {section.label}
                </h3>
                {section.children?.map((item) => (
                  <SidebarItem key={item.id} item={item} currentPath={pathname} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
