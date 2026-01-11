"use client";

import { useRoute as useRouteStore } from "@/lib/route-store";
import { usePathname, useParams } from "next/navigation";
import { useEffect } from "react";
import { ref } from "use-react-utilities";
import { useComputed } from "use-react-utilities";

export const useRoute = () => {
  const pathname  = usePathname();
  const params    = useParams();
  const query     = ref<Record<string, string>>({});
  const origin    = ref("");
  const routeData = useRouteStore();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams                      = new URLSearchParams(window.location.search);
      const result: Record<string, string> = {};
      urlParams.forEach((value, key) => {
        result[key] = value;
      });
      query.value  = result;
      origin.value = window.location.origin;
    }
  }, [pathname, params]);

  const asPath = useComputed(() => {
    const qs = new URLSearchParams(query.value).toString();
    return qs ? `${pathname}?${qs}` : pathname;
  });

  return {
    pathname,
    query: query.value,
    params,
    asPath: asPath.value,
    fullPath: `${origin.value}${asPath.value}`,
    origin: origin.value,
    ...routeData, // ✅ gabungkan dengan definePage
  };
};
