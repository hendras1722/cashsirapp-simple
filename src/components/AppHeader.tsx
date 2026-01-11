"use client";

import React from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DarkModeToggle } from "./DarkMode";
import { Icon } from "@iconify/react";
import { Each } from "use-react-utilities";

interface AppHeaderProps {
  onMenuClick: () => void;
  avatarSrc?: string;
  avatarFallback?: string;
  userName?: string;
  onNotifications?: () => void;
  onProfile?: () => void;
  onSettings?: () => void;
  onSupport?: () => void;
  onLogout?: () => void;
}

export function AppHeader({
  onMenuClick,
  avatarSrc = "https://i.pravatar.cc/100?u=admin",
  avatarFallback = "AU",
  userName = "Admin User",
  onNotifications,
  onProfile,
  onSettings,
  onSupport,
  onLogout,
}: AppHeaderProps) {
  const pathname    = usePathname();
  const breadcrumbs = pathname.split("/").filter(Boolean);

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <Button
          aria-label="Toggle sidebar menu"
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="hover:!bg-primary/50"
        >
          <Icon icon="lucide:menu" className="h-6 w-6" />
        </Button>

        <Breadcrumb>
          <BreadcrumbList>
            <Each
              of={breadcrumbs}
              render={(crumb, idx) => (
                <React.Fragment key={idx}>
                  <BreadcrumbItem>
                    {idx < breadcrumbs.length - 1 ? (
                      <BreadcrumbLink href={`/${breadcrumbs.slice(0, idx + 1).join("/")}`}>
                        {crumb}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              )}
            />
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-3">
        <Button
          aria-label="Notifications"
          variant="ghost"
          size="icon"
          onClick={onNotifications}
          className="hover:!bg-primary/50"
        >
          <Icon icon="lucide:bell" className="h-5 w-5" />
        </Button>

        <DarkModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label="Open user menu" variant="ghost" className="rounded-full w-9 h-9">
              <Avatar>
                <AvatarImage src={avatarSrc} alt="avatar" />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onProfile}>
              <Icon icon="lucide:user" className="h-4 w-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSettings}>
              <Icon icon="lucide:settings" className="h-4 w-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSupport}>
              <Icon icon="lucide:life-buoy" className="h-4 w-4 mr-2" /> Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <Icon icon="lucide:log-out" className="h-4 w-4 mr-2" /> Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
