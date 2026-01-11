"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";

export interface MultiSelectItem {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: string;
  children?: MultiSelectItem[];
  onSelect?: (event: React.MouseEvent) => void;
}

export interface FetchQuery {
  page: number;
  limit: number;
  page_size: number;
  q: string;
  search: string;
}

type FetchResult = Record<string, any>;

type Variant = "solid" | "outline" | "soft";
type Size = "sm" | "md" | "lg";

interface MultiSelectProps {
  id?: string;
  name?: string;
  value?: MultiSelectItem | MultiSelectItem[];
  defaultValue?: MultiSelectItem | MultiSelectItem[];
  onChange?: (value?: MultiSelectItem | MultiSelectItem[]) => void;
  items?: MultiSelectItem[];
  multiple?: boolean;
  url?: string;
  limit?: number;
  paginated?: boolean;
  variant?: Variant;
  size?: Size;
  transformFetchData?: (result: FetchResult) => MultiSelectItem[];
  transformFetchQuery?: (params: FetchQuery) => Record<string, string | number>;
  placeholder?: string;
  loading?: boolean;
  debounce?: number;
  disabled?: boolean;
  className?: string;
  searchInput?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  value,
  defaultValue,
  onChange,
  items = [],
  multiple = false,
  url,
  limit = 10,
  paginated = true,
  variant = "outline",
  size = "md",
  transformFetchData = (result: FetchResult) => {
    const data = result?.data ?? result?.results ?? result?.items ?? [];
    if (!Array.isArray(data)) return [];
    return data.map((val: any) => ({
      value: val.id ?? "",
      label: val.name ?? "",
    }));
  },
  transformFetchQuery = (params) => ({
    q: params.search,
    page: params.page,
    limit: params.limit,
  }),
  placeholder = "Select...",
  loading = false,
  debounce = 300,
  disabled = false,
  className = "",
  searchInput = true,
}) => {
  const [selected, setSelected]                 = useState<MultiSelectItem | MultiSelectItem[] | undefined>(
    value || defaultValue
  );
  const [data, setData]                         = useState<MultiSelectItem[]>([]);
  const [search, setSearch]                     = useState("");
  const [open, setOpen]                         = useState(false);
  const [isLoading, setIsLoading]               = useState(loading);
  const [page, setPage]                         = useState(1);
  const [hasMore, setHasMore]                   = useState(true);
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">("bottom");
  const debounceTimeout                         = useRef<NodeJS.Timeout | null>(null);
  const containerRef                            = useRef<HTMLDivElement>(null);
  const dropdownRef                             = useRef<HTMLDivElement>(null);
  const isFetchingRef                           = useRef(false);

  const transformDataRef  = useRef(transformFetchData);
  const transformQueryRef = useRef(transformFetchQuery);

  useEffect(() => {
    transformDataRef.current  = transformFetchData;
    transformQueryRef.current = transformFetchQuery;
  }, [transformFetchData, transformFetchQuery]);

  const _items = useMemo(
    () => (Array.isArray(items) && items.length > 0 ? items : data),
    [items, data]
  );

  const filteredItems = useMemo(() => {
    if (url) {
      return _items;
    }

    if (!search.trim()) {
      return _items;
    }

    const searchLower = search.toLowerCase();
    return _items.filter((item) => item.label.toLowerCase().includes(searchLower));
  }, [_items, search, url]);

  useEffect(() => {
    if (value !== undefined) setSelected(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setPage(1);
    }
  }, [open]);

  useEffect(() => {
    const checkAndUpdatePosition = () => {
      if (open && containerRef.current) {
        const rect           = containerRef.current.getBoundingClientRect();
        const spaceBelow     = window.innerHeight - rect.bottom;
        const spaceAbove     = rect.top;
        const dropdownHeight = 320;

        const shouldBeTop = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
        setDropdownPosition(shouldBeTop ? "top" : "bottom");

        setTimeout(() => {
          containerRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest",
          });
        }, 50);
      }
    };

    if (open) {
      checkAndUpdatePosition();

      window.addEventListener("scroll", checkAndUpdatePosition, true);
      window.addEventListener("resize", checkAndUpdatePosition);

      return () => {
        window.removeEventListener("scroll", checkAndUpdatePosition, true);
        window.removeEventListener("resize", checkAndUpdatePosition);
      };
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const fetchData = useCallback(
    (page: number, search: string, append: boolean) => {
      if (!url || isFetchingRef.current) return;

      isFetchingRef.current = true;
      setIsLoading(true);

      const params: FetchQuery = {
        page,
        limit,
        page_size: limit,
        q: search,
        search,
      };

      const queryParams = transformQueryRef.current(params);
      const queryString = new URLSearchParams(
        Object.entries(queryParams).reduce(
          (acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          },
          {} as Record<string, string>
        )
      ).toString();

      const fetchUrl = `${url}${url.includes("?") ? "&" : "?"}${queryString}`;

      fetch(fetchUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((result) => {
          const newData = transformDataRef.current(result);
          setData((prevData) => (append ? [...prevData, ...newData] : newData));
          setHasMore(newData.length === limit);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        })
        .finally(() => {
          isFetchingRef.current = false;
          setIsLoading(false);
        });
    },
    [url, limit]
  );

  useEffect(() => {
    if (!url) return;

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      setPage(1);
      fetchData(1, search, false);
    }, debounce);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [search, url, debounce, fetchData]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!paginated || !hasMore || isLoading || !url || isFetchingRef.current) return;

      const target = e.currentTarget;
      const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

      if (bottom) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchData(nextPage, search, true);
      }
    },
    [paginated, hasMore, isLoading, url, page, search, fetchData]
  );

  const handleSelect = (item: MultiSelectItem) => {
    if (disabled || item.disabled) return;

    let newValue: MultiSelectItem | MultiSelectItem[] | undefined;

    if (multiple) {
      const current = Array.isArray(selected) ? selected : [];
      const exists  = current.some((v) => v.value === item.value);
      newValue      = exists ? current.filter((v) => v.value !== item.value) : [...current, item];
    } else {
      newValue = item;
      setOpen(false);
    }

    setSelected(newValue);
    onChange?.(newValue);
  };

  const isSelected = useCallback(
    (item: MultiSelectItem) => {
      if (multiple && Array.isArray(selected)) {
        return selected.some((v) => v.value === item.value);
      }
      return (selected as MultiSelectItem)?.value === item.value;
    },
    [selected, multiple]
  );

  const displayValue = useMemo(() => {
    if (multiple && Array.isArray(selected)) return selected.map((i) => i.label).join(", ");
    if (!multiple && (selected as MultiSelectItem)?.label)
      return (selected as MultiSelectItem).label;
    return "";
  }, [selected, multiple]);

  const sizeClasses = {
    sm: "min-h-[2rem] text-xs px-2 py-1",
    md: "min-h-[2.5rem] text-sm px-3 py-2",
    lg: "min-h-[3rem] text-base px-4 py-2.5",
  }[size];

  const variantClasses = {
    outline: "border border-gray-300 bg-white text-gray-700",
    solid: "bg-blue-600 text-white border border-blue-600",
    soft: "bg-blue-50 border border-blue-100 text-blue-700",
  }[variant];

  const dropdownPositionClasses = dropdownPosition === "top" ? "bottom-full mb-2" : "top-full mt-2";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <div
        className={`flex items-center justify-between rounded-md cursor-pointer transition-colors ${sizeClasses} ${variantClasses} ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400"
          }`}
        onClick={() => !disabled && setOpen(!open)}
      >
        <span className={displayValue ? "text-gray-700" : "text-gray-400"}>
          {displayValue || placeholder}
        </span>
        <Icon
          icon="mdi:chevron-down"
          className={`w-4 h-4 ml-2 transition-transform text-gray-500 ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div
          ref={dropdownRef}
          className={`absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden flex flex-col ${dropdownPositionClasses}`}
        >
          {/* Search */}
          {searchInput && (
            <div className="p-2 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <Icon
                  icon="mdi:magnify"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="overflow-y-auto flex-1" onScroll={handleScroll}>
            {isLoading && page === 1 ? (
              <div className="flex items-center justify-center py-8 text-gray-500 text-sm">
                <Icon icon="mdi:loading" className="w-5 h-5 animate-spin mr-2" />
                Loading...
              </div>
            ) : filteredItems.length > 0 ? (
              <>
                {filteredItems.map((item) => {
                  const selected = isSelected(item);
                  return (
                    <div
                      key={item.value}
                      className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${item.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                        } ${selected ? "bg-blue-50" : ""}`}
                      onClick={() => handleSelect(item)}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {item.icon && <Icon icon={item.icon} className="w-4 h-4 text-gray-500" />}
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </div>
                      {selected && (
                        <Icon
                          icon="mdi:check"
                          className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2"
                        />
                      )}
                    </div>
                  );
                })}
                {isLoading && page > 1 && (
                  <div className="flex items-center justify-center py-3 text-gray-500 text-sm">
                    <Icon icon="mdi:loading" className="w-4 h-4 animate-spin mr-2" />
                    Loading more...
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">No results found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
