import { useCallback, type RefCallback } from "react";

export function ref<T>(initialValue?: T) {
  const state = { value: initialValue as T };

  return new Proxy(state, {
    get(target, prop) {
      if (prop === "value") {
        return target.value;
      }
      return target[prop as keyof typeof target];
    },
    set(target, prop, newValue) {
      if (prop === "value") {
        target.value = newValue;
        return true;
      }
      return false;
    },
  });
}

export function reactive<T extends object>(obj: T): T {
  return new Proxy(obj, {
    get(target, prop) {
      return target[prop as keyof T];
    },
    set(target, prop, newValue) {
      (target as any)[prop] = newValue;
      return true;
    },
  });
}

export function useTemplateRef<T = any>() {
  const elementRef = ref<T | null>(null);
  const proxyRef   = ref<any>(null);

  const refCallback: RefCallback<T> = useCallback(
    (el: T | null) => {
      elementRef.value = el;
    },
    [elementRef]
  );

  if (!proxyRef.value) {
    proxyRef.value = new Proxy(refCallback, {
      get(_, prop) {
        if (prop === "value") {
          return elementRef.value;
        }

        const element = elementRef.value;
        if (element && typeof element === "object" && prop in element) {
          const value = (element as any)[prop];
          return typeof value === "function" ? value.bind(element) : value;
        }
        return undefined;
      },
      apply(_, _thisArg, args) {
        return refCallback.apply(null, args as [T | null]);
      },
    });
  }

  return proxyRef.value as { value: T | null } & RefCallback<T>;
}
