import React, { forwardRef, useImperativeHandle, useMemo } from "react";
import type { DateValue} from "@internationalized/date";
import { CalendarDate, startOfWeek, getWeeksInMonth } from "@internationalized/date";
import { Icon } from "@iconify/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Types
export interface DateRange {
  start: DateValue;
  end: DateValue | null;
}

export type CalendarDefaultValue<
  R extends boolean = false,
  M extends boolean = false,
> = R extends true ? DateRange : M extends true ? DateValue[] : DateValue;

export type CalendarModelValue<
  R extends boolean = false,
  M extends boolean = false,
> = R extends true ? DateRange | null : M extends true ? DateValue[] : DateValue | undefined;

interface ButtonProps {
  color?: string;
  variant?: string;
  size?: string;
}

type ColorType = "primary" | "secondary" | "success" | "warning" | "error" | "neutral";
type VariantType = "solid" | "soft" | "outline" | "ghost";
type SizeType = "sm" | "md" | "lg";

interface CalendarProps<R extends boolean = false, M extends boolean = false> {
  nextYearIcon?: React.ReactNode;
  nextYear?: ButtonProps;
  nextMonthIcon?: React.ReactNode;
  nextMonth?: ButtonProps;
  prevYearIcon?: React.ReactNode;
  prevYear?: ButtonProps;
  prevMonthIcon?: React.ReactNode;
  prevMonth?: ButtonProps;
  color?: ColorType;
  variant?: VariantType;
  size?: SizeType;
  range?: R & boolean;
  multiple?: M & boolean;
  monthControls?: boolean;
  yearControls?: boolean;
  fixedWeeks?: boolean;
  defaultValue?: CalendarDefaultValue<R, M>;
  value?: CalendarModelValue<R, M>;
  onChange?: (date: CalendarModelValue<R, M>) => void;
  className?: string;
  locale?: string;
  minValue?: DateValue;
  maxValue?: DateValue;
  isDateUnavailable?: (date: DateValue) => boolean;
  numberOfMonths?: number;
  hideWeekdays?: boolean;
  showYearPicker?: boolean;
  showMonthPicker?: boolean;
  showTimePicker?: boolean;
  use24HourFormat?: boolean;
  minYear?: number;
  maxYear?: number;
  defaultHour?: number; // ✅ Tambahkan ini
  defaultMinute?: number; // ✅ Tambahkan ini
  slots?: {
    heading?: (props: { value: string }) => React.ReactNode;
    day?: (props: { day: DateValue }) => React.ReactNode;
    weekDay?: (props: { day: string }) => React.ReactNode;
  };
  onTimeChange?: (hour: number, minute: number) => void;
}

interface SingleMonthCalendarProps {
  currentMonth: DateValue;
  locale: string;
  fixedWeeks: boolean;
  color: ColorType;
  variant: VariantType;
  size: SizeType;
  hideWeekdays: boolean;
  isDisabled: (date: DateValue) => boolean;
  isSelected: (date: DateValue) => boolean;
  isInSelectedRange: (date: DateValue) => boolean;
  handleDateClick: (date: DateValue) => void;
  slots: CalendarProps["slots"];
  weekDays: string[];
}

// Color variants
const colorVariants: Record<ColorType, Record<VariantType | "range" | "today", string>> = {
  primary: {
    solid: "bg-blue-600 !text-white hover:bg-blue-700",
    soft: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    ghost: "text-blue-600 hover:bg-blue-50",
    range: "bg-blue-100",
    today: "border-2 border-blue-600",
  },
  secondary: {
    solid: "bg-gray-600 text-white hover:bg-gray-700",
    soft: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    outline: "border-2 border-gray-600 text-gray-600 hover:bg-gray-50",
    ghost: "text-gray-600 hover:bg-gray-50",
    range: "bg-gray-100",
    today: "border-2 border-gray-600",
  },
  success: {
    solid: "bg-green-600 text-white hover:bg-green-700",
    soft: "bg-green-100 text-green-700 hover:bg-green-200",
    outline: "border-2 border-green-600 text-green-600 hover:bg-green-50",
    ghost: "text-green-600 hover:bg-green-50",
    range: "bg-green-100",
    today: "border-2 border-green-600",
  },
  warning: {
    solid: "bg-amber-600 text-white hover:bg-amber-700",
    soft: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    outline: "border-2 border-amber-600 text-amber-600 hover:bg-amber-50",
    ghost: "text-amber-600 hover:bg-amber-50",
    range: "bg-amber-100",
    today: "border-2 border-amber-600",
  },
  error: {
    solid: "bg-red-600 text-white hover:bg-red-700",
    soft: "bg-red-100 text-red-700 hover:bg-red-200",
    outline: "border-2 border-red-600 text-red-600 hover:bg-red-50",
    ghost: "text-red-600 hover:bg-red-50",
    range: "bg-red-100",
    today: "border-2 border-red-600",
  },
  neutral: {
    solid: "bg-gray-600 text-white hover:bg-gray-700",
    soft: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    outline: "border-2 border-gray-600 text-gray-600 hover:bg-gray-50",
    ghost: "text-gray-600 hover:bg-gray-50",
    range: "bg-gray-100",
    today: "border-2 border-gray-600",
  },
};

// Size configurations
const sizeConfig: Record<SizeType, { button: string; text: string; gap: string; padding: string }> =
  {
    sm: { button: "h-7 w-7 text-xs", text: "text-xs", gap: "gap-0.5", padding: "p-0" },
    md: { button: "h-9 w-9 text-sm", text: "text-sm", gap: "gap-1", padding: "p-0" },
    lg: { button: "h-11 w-11 text-base", text: "text-base", gap: "gap-1.5", padding: "p-0" },
  };

// Button component
const Button: React.FC<{
  icon?: React.ReactNode;
  onClick?: () => void;
  "aria-label"?: string;
  className?: string;
}> = ({ icon, onClick, className, "aria-label": ariaLabel }) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className={`p-2 hover:bg-gray-100 rounded transition-colors ${className || ""}`}
  >
    {icon}
  </button>
);

// Helper functions
function getMonthName(date: DateValue, locale: string = "en-US"): string {
  const jsDate = new Date(date.year, date.month - 1, date.day);
  return jsDate.toLocaleDateString(locale, { month: "long", year: "numeric" });
}

function getWeekDayNames(locale: string = "en-US"): string[] {
  const days: string[] = [];
  const baseDate       = new Date(2024, 0, 7);
  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    days.push(date.toLocaleDateString(locale, { weekday: "short" }));
  }
  return days;
}

function isSameDay(a: DateValue | null | undefined, b: DateValue | null | undefined): boolean {
  if (!a || !b) return false;
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

function isInRange(date: DateValue, range: DateRange | null | undefined): boolean {
  if (!range || !range.start || !range.end) return false;
  const dateNum  = date.year * 10000 + date.month * 100 + date.day;
  const startNum = range.start.year * 10000 + range.start.month * 100 + range.start.day;
  const endNum   = range.end.year * 10000 + range.end.month * 100 + range.end.day;
  return dateNum >= startNum && dateNum <= endNum;
}

// Single Month Calendar Component
function SingleMonthCalendar({
  currentMonth,
  locale,
  fixedWeeks,
  color,
  variant,
  size,
  hideWeekdays,
  isDisabled,
  isSelected,
  isInSelectedRange,
  handleDateClick,
  slots,
  weekDays,
}: SingleMonthCalendarProps) {
  const monthGrid = useMemo(() => {
    const weeks: DateValue[][] = [];
    const weeksInMonth         = getWeeksInMonth(currentMonth, locale);
    const firstDayOfMonth      = currentMonth.set({ day: 1 });
    let currentDate            = startOfWeek(firstDayOfMonth, locale);

    for (let week = 0; week < (fixedWeeks ? 6 : weeksInMonth); week++) {
      const weekDates: DateValue[] = [];
      for (let day = 0; day < 7; day++) {
        weekDates.push(currentDate);
        currentDate = currentDate.add({ days: 1 });
      }
      weeks.push(weekDates);
    }
    return weeks;
  }, [currentMonth, locale, fixedWeeks]);

  const colors = colorVariants[color];
  const sizes  = sizeConfig[size];

  return (
    <div>
      <div className={`text-center font-medium mb-3 text-gray-700 ${sizes.text}`}></div>
      {!hideWeekdays && (
        <div className={`grid grid-cols-7 ${sizes.gap} mb-2`}>
          {weekDays.map((day: string, i: number) => (
            <div key={i} className={`text-center ${sizes.text} font-semibold text-gray-600 py-2`}>
              {slots?.weekDay ? slots.weekDay({ day }) : day}
            </div>
          ))}
        </div>
      )}
      <div className="space-y-1">
        {monthGrid.map((week: DateValue[], weekIndex: number) => (
          <div key={weekIndex} className={`grid grid-cols-7 ${sizes.gap}`}>
            {week.map((date: DateValue, dateIndex: number) => {
              const isOutsideMonth = date.month !== currentMonth.month;
              const isSelectedDate = isSelected(date);
              const isInRangeDate  = isInSelectedRange(date);
              const isDisabledDate = isDisabled(date);
              const isToday        = isSameDay(
                date,
                new CalendarDate(
                  new Date().getFullYear(),
                  new Date().getMonth() + 1,
                  new Date().getDate()
                )
              );

              return (
                <button
                  key={dateIndex}
                  onClick={() => !isDisabledDate && handleDateClick(date)}
                  disabled={isDisabledDate}
                  className={`
                    relative ${sizes.button} p-0 rounded-full transition-all duration-200
                    ${isOutsideMonth ? "text-gray-300" : "text-gray-900"}
                    ${isSelectedDate ? colors[variant] : ""}
                    ${isInRangeDate && !isSelectedDate ? colors.range : ""}
                    ${!isSelectedDate && !isDisabledDate && !isOutsideMonth ? "hover:bg-gray-100" : ""}
                    ${isDisabledDate ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                    ${isToday && !isSelectedDate ? colors.today : ""}
                  `}
                >
                  {slots?.day ? slots.day({ day: date }) : date.day}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Calendar Component
export const Calendar = forwardRef(function Calendar<
  R extends boolean = false,
  M extends boolean = false,
>(
  {
    nextYearIcon,
    nextYear = {},
    nextMonthIcon,
    nextMonth = {},
    prevYearIcon,
    prevYear = {},
    prevMonthIcon,
    prevMonth = {},
    color = "primary",
    variant = "solid",
    size = "md",
    range = false as R,
    multiple = false as M,
    monthControls = true,
    yearControls = true,
    fixedWeeks = true,
    defaultValue,
    value,
    onChange,
    className = "",
    locale = "en-US",
    minValue,
    maxValue,
    isDateUnavailable,
    numberOfMonths = 1,
    hideWeekdays = false,
    showYearPicker = false,
    showMonthPicker = false,
    showTimePicker = false,
    use24HourFormat = true,
    minYear,
    maxYear,
    defaultHour,
    defaultMinute,
    slots = {},
    onTimeChange, // ✅ Tambahkan defaultHour, defaultMinute
  }: CalendarProps<R, M>,
  ref: React.Ref<any>
) {
  const [currentMonth, setCurrentMonth] = React.useState<DateValue>(() => {
    if (value) {
      if (range && value && typeof value === "object" && "start" in value) return value.start;
      if (multiple && Array.isArray(value) && value.length > 0) return value[0];
      if (value && typeof value === "object" && "year" in value) return value as DateValue;
    }
    if (defaultValue) {
      if (range && typeof defaultValue === "object" && "start" in defaultValue)
        return defaultValue.start;
      if (multiple && Array.isArray(defaultValue) && defaultValue.length > 0)
        return defaultValue[0];
      return defaultValue as DateValue;
    }
    return new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, 1);
  });

  const [selectedDate, setSelectedDate]         = React.useState<CalendarModelValue<R, M>>(
    value || (defaultValue as CalendarModelValue<R, M>)
  );
  const [showMonthPopover, setShowMonthPopover] = React.useState(false);
  const [showYearPopover, setShowYearPopover]   = React.useState(false);
  const [selectedHour, setSelectedHour]         = React.useState(new Date().getHours());
  const [selectedMinute, setSelectedMinute]     = React.useState(new Date().getMinutes());
  const [selectedPeriod, setSelectedPeriod]     = React.useState<"AM" | "PM">(() => {
    const hour = defaultHour !== undefined ? defaultHour : new Date().getHours();
    return hour >= 12 ? "PM" : "AM";
  });

  React.useEffect(() => {
    if (value !== undefined) setSelectedDate(value);
  }, [value]);

  // ✅ TAMBAHKAN 2 useEffect INI
  React.useEffect(() => {
    if (defaultHour !== undefined) {
      setSelectedHour(defaultHour);
      setSelectedPeriod(defaultHour >= 12 ? "PM" : "AM");
    }
  }, [defaultHour]);

  React.useEffect(() => {
    if (defaultMinute !== undefined) {
      setSelectedMinute(defaultMinute);
    }
  }, [defaultMinute]);

  const weekDays = useMemo(() => getWeekDayNames(locale), [locale]);
  const months   = useMemo(() => {
    const monthsArray: DateValue[] = [];
    for (let i = 0; i < numberOfMonths; i++) {
      monthsArray.push(currentMonth.add({ months: i }));
    }
    return monthsArray;
  }, [currentMonth, numberOfMonths]);

  const handleDateClick = (date: DateValue) => {
    let newValue: CalendarModelValue<R, M>;

    if (range) {
      const r = (selectedDate as DateRange | null) ?? null;

      if (!r || !r.start || (r.start && r.end)) {
        newValue = { start: date, end: null } as CalendarModelValue<R, M>;
        setSelectedDate(newValue);
        onChange?.(newValue);
        return;
      }

      if (r.start && !r.end) {
        if (date.compare(r.start) < 0) {
          newValue = { start: date, end: r.start } as CalendarModelValue<R, M>;
          setSelectedDate(newValue);
          onChange?.(newValue);
          return;
        }

        if (date.compare(r.start) === 0) {
          newValue = { start: r.start, end: r.start } as CalendarModelValue<R, M>;
          setSelectedDate(newValue);
          onChange?.(newValue);
          return;
        }

        newValue = { start: r.start, end: date } as CalendarModelValue<R, M>;
        setSelectedDate(newValue);
        onChange?.(newValue);
        return;
      }

      newValue = { start: date, end: null } as CalendarModelValue<R, M>;
      setSelectedDate(newValue);
      onChange?.(newValue);
      return;
    }

    if (multiple) {
      const multiValue = (selectedDate || []) as DateValue[];
      const exists     = multiValue.some((d) => isSameDay(d, date));
      newValue         = (
        exists ? multiValue.filter((d) => !isSameDay(d, date)) : [...multiValue, date]
      ) as CalendarModelValue<R, M>;
      setSelectedDate(newValue);
      onChange?.(newValue);
      return;
    }

    newValue = date as CalendarModelValue<R, M>;
    setSelectedDate(newValue);
    onChange?.(newValue);
  };

  const isSelected = (date: DateValue): boolean => {
    if (range) {
      const r = selectedDate as DateRange | null;
      if (!r || !r.start) return false;
      if (isSameDay(date, r.start)) return true;
      if (r.end && isSameDay(date, r.end)) return true;
      return false;
    }

    if (multiple) {
      const multiValue = selectedDate as DateValue[] | undefined;
      return multiValue?.some((d) => isSameDay(d, date)) || false;
    }

    return isSameDay(date, selectedDate as DateValue);
  };

  const isInSelectedRange = (date: DateValue): boolean => {
    if (!range) return false;
    const r = selectedDate as DateRange | null;
    if (!r || !r.start || !r.end) return false;

    const toNum = (d: DateValue) => d.year * 10000 + d.month * 100 + d.day;
    const n     = toNum(date);
    const s     = toNum(r.start);
    const e     = toNum(r.end);
    return n >= Math.min(s, e) && n <= Math.max(s, e);
  };

  const isDisabled = (date: DateValue): boolean => {
    if (minValue && date.compare(minValue) < 0) return true;
    if (maxValue && date.compare(maxValue) > 0) return true;
    if (isDateUnavailable?.(date)) return true;
    return false;
  };

  const prevMonthHandler = () => setCurrentMonth(currentMonth.subtract({ months: 1 }));
  const nextMonthHandler = () => setCurrentMonth(currentMonth.add({ months: 1 }));
  const prevYearHandler  = () => setCurrentMonth(currentMonth.subtract({ years: 1 }));
  const nextYearHandler  = () => setCurrentMonth(currentMonth.add({ years: 1 }));

  useImperativeHandle(ref, () => ({
    prevMonthHandler,
    nextMonthHandler,
    prevYearHandler,
    nextYearHandler,
  }));

  const generateTitle = () => {
    const firstMonth = months[0];
    const lastMonth  = months[months.length - 1];

    if (numberOfMonths === 1) {
      if (showMonthPicker || showYearPicker) {
        return {
          month: new Date(firstMonth.year, firstMonth.month - 1).toLocaleDateString(locale, {
            month: "long",
          }),
          year: firstMonth.year.toString(),
          full: getMonthName(firstMonth, locale),
        };
      }
      return { full: getMonthName(firstMonth, locale), month: "", year: "" };
    }

    const firstMonthName = new Date(firstMonth.year, firstMonth.month - 1).toLocaleDateString(
      locale,
      { month: "long" }
    );
    const lastMonthName  = new Date(lastMonth.year, lastMonth.month - 1).toLocaleDateString(locale, {
      month: "long",
    });

    if (firstMonth.year === lastMonth.year) {
      return {
        full: `${firstMonthName} - ${lastMonthName} ${firstMonth.year}`,
        month: `${firstMonthName} - ${lastMonthName}`,
        year: firstMonth.year.toString(),
      };
    } else {
      return {
        full: `${firstMonthName} ${firstMonth.year} - ${lastMonthName} ${lastMonth.year}`,
        month: `${firstMonthName} - ${lastMonthName}`,
        year: `${firstMonth.year} - ${lastMonth.year}`,
      };
    }
  };

  const titleText   = generateTitle();
  const sizes       = sizeConfig[size];
  const colors      = colorVariants[color];
  const currentYear = currentMonth.year;

  const yearsList = useMemo(() => {
    const defaultMinYear = minYear || 1900;
    const defaultMaxYear = maxYear || 2100;
    const years          = [];

    for (let year = defaultMinYear; year <= defaultMaxYear; year++) {
      years.push(year);
    }
    return years;
  }, [minYear, maxYear]);

  const monthNames = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2024, i, 1);
      return date.toLocaleDateString(locale, { month: "short" });
    });
  }, [locale]);

  const handleYearSelect = (year: number) => {
    const newStart = currentMonth.set({ year });
    setCurrentMonth(newStart);
    setShowYearPopover(false);
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newStart = currentMonth.set({ month: monthIndex + 1 });
    setCurrentMonth(newStart);
    setShowMonthPopover(false);
  };

  // ✅ FIX: Trigger onTimeChange ketika hour/minute berubah
  const handleHourChange = (hour: number) => {
    let actualHour = hour;

    if (!use24HourFormat) {
      if (selectedPeriod === "PM" && hour !== 12) {
        actualHour = hour + 12;
      } else if (selectedPeriod === "AM" && hour === 12) {
        actualHour = 0;
      }
    }

    setSelectedHour(actualHour);
    onTimeChange?.(actualHour, selectedMinute); // ✅ Emit change
  };

  const handleMinuteChange = (minute: number) => {
    setSelectedMinute(minute);
    onTimeChange?.(selectedHour, minute); // ✅ Emit change
  };

  const handlePeriodChange = (newPeriod: "AM" | "PM") => {
    setSelectedPeriod(newPeriod);
    let newHour = selectedHour;

    if (newPeriod === "PM" && selectedHour < 12) {
      newHour = selectedHour + 12;
    } else if (newPeriod === "AM" && selectedHour >= 12) {
      newHour = selectedHour - 12;
    }

    setSelectedHour(newHour);
    onTimeChange?.(newHour, selectedMinute); // ✅ Emit change
  };

  return (
    <div className={`inline-block ${sizes.padding} ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          {yearControls && (
            <Button
              icon={prevYearIcon || <Icon icon="lucide:chevrons-left" className="w-4 h-4" />}
              onClick={prevYearHandler}
              aria-label="Previous year"
              {...prevYear}
            />
          )}
          {monthControls && (
            <Button
              icon={prevMonthIcon || <Icon icon="lucide:chevron-left" className="w-4 h-4" />}
              onClick={prevMonthHandler}
              aria-label="Previous month"
              {...prevMonth}
            />
          )}
        </div>

        <div className="flex-1 text-center font-bold text-lg text-gray-900">
          {slots.heading ? (
            slots.heading({ value: titleText.full })
          ) : showMonthPicker || showYearPicker ? (
            <div className="flex items-center justify-center gap-2">
              {showMonthPicker ? (
                <Popover open={showMonthPopover} onOpenChange={setShowMonthPopover}>
                  <PopoverTrigger asChild>
                    <button className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer transition-colors">
                      {showYearPicker ? titleText.month : titleText.full}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4">
                    <div className="text-center font-bold text-gray-900 mb-3">
                      {currentMonth.year}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {monthNames.map((month, index) => (
                        <button
                          key={index}
                          onClick={() => handleMonthSelect(index)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                              ${index + 1 === currentMonth.month ? colors[variant] : "hover:bg-gray-100 text-gray-700"}`}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <span>{titleText.month}</span>
              )}

              {showYearPicker ? (
                <Popover open={showYearPopover} onOpenChange={setShowYearPopover}>
                  <PopoverTrigger asChild>
                    <button className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer transition-colors">
                      {titleText.year}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4">
                    <div className="text-center font-bold text-gray-900 mb-3">Select Year</div>
                    <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                      {yearsList.map((year) => (
                        <button
                          key={year}
                          onClick={() => handleYearSelect(year)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                              ${year === currentYear ? colors[variant] : "hover:bg-gray-100 text-gray-700"}`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              ) : showMonthPicker ? (
                <span>{titleText.year}</span>
              ) : null}
            </div>
          ) : (
            <span>{titleText.full}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {monthControls && (
            <Button
              icon={nextMonthIcon || <Icon icon="lucide:chevron-right" className="w-4 h-4" />}
              onClick={nextMonthHandler}
              aria-label="Next month"
              {...nextMonth}
            />
          )}
          {yearControls && (
            <Button
              icon={nextYearIcon || <Icon icon="lucide:chevrons-right" className="w-4 h-4" />}
              onClick={nextYearHandler}
              aria-label="Next year"
              {...nextYear}
            />
          )}
        </div>
      </div>

      <div
        className={`grid gap-8 ${numberOfMonths > 1 ? `grid-cols-${Math.min(numberOfMonths, 3)}` : ""}`}
        style={{
          gridTemplateColumns:
            numberOfMonths > 1
              ? `repeat(${Math.min(numberOfMonths, 3)}, minmax(0, 1fr))`
              : undefined,
        }}
      >
        {months.map((month, index) => (
          <div key={index}>
            <SingleMonthCalendar
              currentMonth={month}
              locale={locale}
              fixedWeeks={fixedWeeks}
              color={color}
              variant={variant}
              size={size}
              hideWeekdays={hideWeekdays}
              isDisabled={isDisabled}
              isSelected={isSelected}
              isInSelectedRange={isInSelectedRange}
              handleDateClick={handleDateClick}
              slots={slots}
              weekDays={weekDays}
            />
          </div>
        ))}
      </div>

      {showTimePicker && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Time:</label>
              <select
                value={
                  use24HourFormat
                    ? selectedHour
                    : selectedHour === 0
                      ? 12
                      : selectedHour > 12
                        ? selectedHour - 12
                        : selectedHour
                }
                onChange={(e) => handleHourChange(parseInt(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: use24HourFormat ? 24 : 12 }, (_, i) => (
                  <option key={i} value={use24HourFormat ? i : i + 1}>
                    {String(use24HourFormat ? i : i + 1).padStart(2, "0")}
                  </option>
                ))}
              </select>
              <span className="text-gray-600">:</span>
              <select
                value={selectedMinute}
                onChange={(e) => handleMinuteChange(parseInt(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, "0")}
                  </option>
                ))}
              </select>
              {!use24HourFormat && (
                <select
                  value={selectedPeriod}
                  onChange={(e) => handlePeriodChange(e.target.value as "AM" | "PM")}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
