type GroupBy<T, K extends keyof T> = Record<string & T[K], T[]>;

export function groupBy<T, K extends keyof T>(array: T[], key: K): GroupBy<T, K> {
  return array.reduce(
    (acc, item) => {
      const keyValue = item[key] as unknown as string & T[K];
      if (!acc[keyValue]) {
        acc[keyValue] = [];
      }
      acc[keyValue].push(item);
      return acc;
    },
    {} as GroupBy<T, K>
  );
}
