"use client";

import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@iconify/react";
import { Each, ConditionalGroup, If, Else, ElseIf } from "use-react-utilities";

export function DarkModeToggle() {
  const { setTheme, theme, themes } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <ConditionalGroup>
            <If condition={theme === "dark"}>
              <Icon icon="lucide:moon" className="h-[1.2rem] w-[1.2rem]" />
            </If>
            <ElseIf condition={theme === "light"}>
              <Icon icon="lucide:sun" className="h-[1.2rem] w-[1.2rem]" />
            </ElseIf>
            <Else>
              <Icon icon="lucide:moon" className="h-[1.2rem] w-[1.2rem]" />
            </Else>
          </ConditionalGroup>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Each
          of={themes}
          render={(theme, index) => (
            <DropdownMenuItem key={index} onClick={() => setTheme(theme)}>
              {theme}
            </DropdownMenuItem>
          )}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
