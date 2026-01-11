import type { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { useSlots } from "use-react-utilities";

export default function BaseCard({ title, children }: { title?: string; children: ReactNode }) {
  const { slots } = useSlots(children);

  return (
    <Card>
      {(title || slots.header) && (
        <CardHeader>
          <CardTitle>{title ?? slots.header}</CardTitle>
        </CardHeader>
      )}
      <CardContent>{slots.default || children}</CardContent>
      {slots.footer && <CardFooter>{slots.footer}</CardFooter>}
    </Card>
  );
}
