import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SimpleSelect,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { ReusablePopover } from "@/components/common/ReusablePopover";
import { ToggleGroupSelector } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import React from "react";
import {
  DATE_RANGE_OPTIONS,
  getDateRangeFromOption,
} from "@/components/common/DataTable/DataTableUtils";
import { Calendar, X, Minus, Layers } from "lucide-react";
import { DatePicker } from "@/components/ui/calendar";

// Memoized FilterComponent to prevent unnecessary re-renders
export const FilterComponent = React.memo(
  function FilterComponent({
    filter,
    value,
    onChange,
    onClear,
  }: IFilterComponentProps) {
    // State for controlling popover open states
    const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
    const [isDateRangePopoverOpen, setIsDateRangePopoverOpen] = useState(false);

    // Use API options if available, otherwise fall back to static options
    const options = useMemo(() => {
      return filter.options || [];
    }, [filter.options]);

    // Memoize hasValue calculation
    const hasValue = useMemo(() => {
      return (
        value &&
        (typeof value === "string"
          ? value !== ""
          : Array.isArray(value)
          ? value.length > 0
          : value !== null && value !== undefined && value !== "all")
      );
    }, [value]);

    // Apply width class if provided
    const widthClass = useMemo(() => {
      return filter.className ? `${filter.className}` : "w-full";
    }, [filter.className]);

    // Memoize transformed options for MultiSelect
    const transformedOptions = useMemo(() => {
      return options.map((option) => ({
        ...option,
        value: option.value,
        label: String(option.label),
      }));
    }, [options]);

    // Stable key generation - only based on filter.id to prevent component remounting
    const multiSelectKey = useMemo(() => {
      return `${filter.id}`;
    }, [filter.id]);

    // Memoize toggle group options
    const toggleGroupOptions = useMemo(() => {
      return options.map((option) => ({
        value: String(option.value),
        label: String(option.label),
        icon: option.icon
          ? React.createElement(option.icon, { className: "h-4 w-4" })
          : undefined,
      }));
    }, [options]);

    // Memoize callback functions with stable references
    const handleDateSelect = useCallback(
      (date: Date | undefined) => {
        onChange(date ? date.toISOString() : null);
        setIsDatePopoverOpen(false);
      },
      [onChange]
    );

    const handleDateRangeSelect = useCallback(
      (range: any) => {
        onChange(range);
        // Close popover only when both from and to dates are selected
        if (range?.from && range?.to) {
          setIsDateRangePopoverOpen(false);
        }
      },
      [onChange]
    );

    const handleBooleanChange = useCallback(
      (val: string) => {
        if (val === "all") {
          onChange(null);
        } else {
          onChange(val === "true");
        }
      },
      [onChange]
    );

    const handleToggleGroupChange = useCallback(
      (val: string) => {
        onChange(val || null);
      },
      [onChange]
    );

    const handleNumberRangeChange = useCallback(
      (type: "min" | "max", newValue: string) => {
        onChange({
          ...value,
          [type]: newValue ? Number(newValue) : null,
        });
      },
      [onChange, value]
    );

    const handleNumberRangeClear = useCallback(
      (type: "min" | "max") => {
        onChange({
          ...value,
          [type]: null,
        });
      },
      [onChange, value]
    );

    const handleSingleNumberChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value ? Number(e.target.value) : null);
      },
      [onChange]
    );

    const handleDateClear = useCallback(
      (e: React.MouseEvent) => {
        onChange(null);
        e.stopPropagation();
      },
      [onChange]
    );

    // Memoize select trigger className to prevent unnecessary re-renders
    const selectTriggerClassName = useMemo(() => {
      return `h-9 w-full font-normal ${
        value ? "text-foreground" : "text-muted-foreground/60"
      }`;
    }, [value]);

    // Memoize date button className
    const dateButtonClassName = useMemo(() => {
      return cn(
        "h-9 w-full justify-start text-left font-normal",
        !value && "text-muted-foreground/60"
      );
    }, [value]);

    // Memoize date range button className
    const dateRangeButtonClassName = useMemo(() => {
      return cn(
        "h-9 w-full justify-start text-left font-normal",
        !value?.from && "text-muted-foreground/60"
      );
    }, [value?.from]);

    switch (filter.type) {
      case "text":
        return (
          <div className={cn("relative", widthClass)}>
            <Input
              type="text"
              placeholder={filter.placeholder || filter.label}
              value={value || ""}
              onChange={(e) => onChange(e.target.value || null)}
              className="h-9 w-full pr-8"
            />
            {hasValue && (
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-muted absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0"
                onClick={onClear}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        );

      case "select":
        return (
          <div className={widthClass}>
            <SimpleSelect
              options={options}
              value={value}
              onValueChange={onChange}
              placeholder={filter.placeholder || filter.label}
              disabled={false}
              triggerClassName={selectTriggerClassName}
              loading={false}
            />
          </div>
        );

      case "multiSelect":
        return (
          <div className={widthClass}>
            <MultiSelect
              key={multiSelectKey}
              options={transformedOptions}
              onValueChange={onChange}
              defaultValue={value || []}
              placeholder={filter.placeholder || filter.label}
              className="h-auto min-h-9 w-full"
              disabled={false}
              loading={false}
            />
          </div>
        );

      case "date":
        return (
          <div className={widthClass}>
            <ReusablePopover
              trigger={
                <Button variant="outline" className={dateButtonClassName}>
                  <Calendar className="mr-2 h-4 w-4" />
                  {value
                    ? format(new Date(value), filter.dateFormat || "PPP")
                    : filter.placeholder || filter.label}
                  {value && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDateClear}
                      className="ml-auto h-6 w-6 p-0 opacity-70 hover:opacity-100"
                      aria-label="Clear date"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </Button>
              }
              open={isDatePopoverOpen}
              onOpenChange={setIsDatePopoverOpen}
              align="start"
              contentClassName="w-auto p-0"
            >
              <DatePicker
                value={value ? new Date(value) : undefined}
                onChange={handleDateSelect}
              />
            </ReusablePopover>
          </div>
        );

      case "dateRange":
        return (
          <div className={widthClass}>
            <ReusablePopover
              trigger={
                <Button variant="outline" className={dateRangeButtonClassName}>
                  <Calendar className="mr-2 h-4 w-4" />
                  {value?.from ? (
                    value.to ? (
                      <span className="truncate">
                        {format(
                          new Date(value.from),
                          filter.dateFormat || "MMM dd"
                        )}{" "}
                        -{" "}
                        {format(
                          new Date(value.to),
                          filter.dateFormat || "MMM dd"
                        )}
                      </span>
                    ) : (
                      <span className="truncate">
                        {format(
                          new Date(value.from),
                          filter.dateFormat || "MMM dd"
                        )}
                      </span>
                    )
                  ) : (
                    filter.placeholder || filter.label
                  )}
                </Button>
              }
              open={isDateRangePopoverOpen}
              onOpenChange={setIsDateRangePopoverOpen}
              align="start"
              contentClassName="w-auto p-0"
            >
              <DatePicker value={value} onChange={handleDateRangeSelect} />
            </ReusablePopover>
          </div>
        );

      case "dateRangeWithOptions":
        return (
          <div className={widthClass}>
            <div className="space-y-2">
              <SimpleSelect
                options={DATE_RANGE_OPTIONS}
                value={value?.option || ""}
                onValueChange={(option) => {
                  if (option === "custom") {
                    // Open custom date picker
                    onChange({
                      option,
                    });
                    // setIsDateRangePopoverOpen(true);
                  } else if (option === "") {
                    onChange(null);
                  } else {
                    // Apply predefined range
                    const dateRange = getDateRangeFromOption(option);
                    onChange({
                      option,
                      ...dateRange,
                    });
                  }
                }}
                placeholder={filter.placeholder || filter.label}
                disabled={false}
                triggerClassName={selectTriggerClassName}
              />

              {/* Custom date range picker - only show when custom is selected */}
              {value?.option === "custom" && (
                <ReusablePopover
                  trigger={
                    <Button
                      variant="outline"
                      className={dateRangeButtonClassName}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {value?.from ? (
                        value.to ? (
                          <span className="truncate">
                            {format(
                              new Date(value.from),
                              filter.dateFormat || "MMM dd"
                            )}{" "}
                            -{" "}
                            {format(
                              new Date(value.to),
                              filter.dateFormat || "MMM dd"
                            )}
                          </span>
                        ) : (
                          <span className="truncate">
                            {format(
                              new Date(value.from),
                              filter.dateFormat || "MMM dd"
                            )}
                          </span>
                        )
                      ) : (
                        "Select custom date range"
                      )}
                    </Button>
                  }
                  open={isDateRangePopoverOpen}
                  onOpenChange={setIsDateRangePopoverOpen}
                  align="start"
                  contentClassName="w-auto p-0 text-muted-foreground"
                >
                  <div className="flex gap-4 p-4">
                    <div className="space-y-2">
                      <label className="text-foreground text-sm font-medium">
                        From Date
                      </label>
                      <DatePicker
                        value={
                          value?.from
                            ? new Date(value.from)
                            : value?.to
                            ? new Date(value.to)
                            : undefined
                        }
                        onChange={(date) => {
                          onChange({
                            option: "custom",
                            from: date?.toISOString(),
                            to: value?.to,
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-foreground text-sm font-medium">
                        To Date
                      </label>
                      <DatePicker
                        value={
                          value?.to
                            ? new Date(value.to)
                            : value?.from
                            ? new Date(value.from)
                            : undefined
                        }
                        onChange={(date) => {
                          onChange({
                            option: "custom",
                            from: value?.from,
                            to: date?.toISOString(),
                          });
                          // Close popover when both dates are selected
                          if (value?.from && date) {
                            setIsDateRangePopoverOpen(false);
                          }
                        }}
                      />
                    </div>
                  </div>
                </ReusablePopover>
              )}
            </div>
          </div>
        );

      case "number":
        // Check if this should be a range input
        if (filter.min !== undefined && filter.max !== undefined) {
          return (
            <div className="h-9 w-full">
              <div className="flex h-full items-center gap-2">
                <div className="relative h-full flex-1">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={value?.min || ""}
                    onChange={(e) =>
                      handleNumberRangeChange("min", e.target.value)
                    }
                    min={filter.min}
                    max={filter.max}
                    step={filter.step}
                    className="h-9 w-full pr-8"
                  />
                  {!!value?.min && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-muted absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0"
                      onClick={() => handleNumberRangeClear("min")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Minus className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                <div className="relative h-full flex-1">
                  <Input
                    type="number"
                    placeholder="Max"
                    value={value?.max || ""}
                    onChange={(e) =>
                      handleNumberRangeChange("max", e.target.value)
                    }
                    min={filter.min}
                    max={filter.max}
                    step={filter.step}
                    className="h-9 w-full pr-8"
                  />
                  {!!value?.max && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-muted absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0"
                      onClick={() => handleNumberRangeClear("max")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        }

        // Single number input
        return (
          <div className={cn("relative", widthClass)}>
            <Input
              type="number"
              placeholder={filter.placeholder || filter.label}
              value={value || ""}
              onChange={handleSingleNumberChange}
              min={filter.min}
              max={filter.max}
              step={filter.step}
              className="h-9 w-full pr-8"
            />
            {hasValue && (
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-muted absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0"
                onClick={onClear}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        );

      case "boolean":
        return (
          <div className={widthClass}>
            <Select
              value={value?.toString() || "all"}
              onValueChange={handleBooleanChange}
            >
              <SelectTrigger className="h-9 w-full font-normal">
                <SelectValue placeholder={filter.placeholder || filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "toggleGroup":
        return (
          <div className={cn("mr-auto", widthClass)}>
            <ToggleGroupSelector
              options={toggleGroupOptions}
              value={value || filter.defaultValue || ""}
              onValueChange={handleToggleGroupChange}
              className="border-border bg-muted hover:bg-muted/80 h-9 min-w-0 rounded-lg border p-0"
            />
          </div>
        );

      case "switch":
        return (
          <div
            className={cn(
              "text-foreground flex h-9 items-center justify-between space-x-2 rounded-lg border p-2",
              widthClass,
              !filter.showOutside && "mt-6"
            )}
          >
            <Label
              htmlFor={`switch-${filter.id}`}
              className="flex items-center text-xs font-medium"
            >
              {filter.icon &&
                React.createElement(filter.icon, {
                  className: "h-4 w-4 text-muted-foreground",
                })}
              {filter.placeholder || filter.label}
            </Label>
            <Switch
              id={`switch-${filter.id}`}
              checked={Boolean(value)}
              onCheckedChange={onChange}
              disabled={false}
              className="flex-shrink-0"
            />
          </div>
        );

      case "groupBy":
        return (
          <div
            className={cn(
              "flex h-9 items-center space-x-2 rounded-lg border pl-2",
              widthClass
            )}
          >
            <Label
              htmlFor={`switch-${filter.id}`}
              className="text-sm font-normal"
            >
              <Layers className="text-muted-foreground/60 mr-2 h-4 w-4" />
            </Label>
            <SimpleSelect
              options={options}
              value={value}
              onValueChange={onChange}
              placeholder={filter.placeholder || filter.label}
              disabled={false}
              triggerClassName={`h-9 w-full font-normal p-0 border-l-0 rounded-l-none ${
                value ? "text-foreground" : "text-muted-foreground/60"
              }`}
            />
          </div>
        );

      default:
        return null;
    }
  },
  (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    return (
      prevProps.filter.id === nextProps.filter.id &&
      prevProps.value === nextProps.value &&
      prevProps.onChange === nextProps.onChange &&
      prevProps.onClear === nextProps.onClear
    );
  }
);

export function DataTableFilters({
  filters,
  filterState,
  onFilterChange,
  onClearAll,
  className,
}: IDataTableFiltersProps) {
  // Helper function to check if a filter value is actually active/meaningful
  const isFilterActive = useCallback(
    (filter: IFilterConfig, value: any): boolean => {
      if (!value) return false;

      switch (filter.type) {
        case "text":
          return typeof value === "string" && value.trim() !== "";

        case "select":
          return typeof value === "string" && value !== "" && value !== "all";

        case "multiSelect":
          return Array.isArray(value) && value.length > 0;

        case "date":
          return value !== null && value !== undefined;

        case "dateRange":
          return value && (value.from || value.to);

        case "dateRangeWithOptions":
          return value && (value.option || (value.from && value.to));

        case "number":
          // Handle number range (min/max object)
          if (filter.min !== undefined && filter.max !== undefined) {
            return (
              value &&
              ((value.min !== null &&
                value.min !== undefined &&
                value.min !== "") ||
                (value.max !== null &&
                  value.max !== undefined &&
                  value.max !== ""))
            );
          }
          // Handle single number
          return value !== null && value !== undefined && value !== "";

        case "boolean":
          return value !== null; // null means "all", true/false are active

        case "toggleGroup":
          return (
            typeof value === "string" &&
            value !== "" &&
            value !== "all" &&
            value !== "ALL" &&
            value !== null &&
            value !== undefined
          );

        case "switch":
          return value === true || value === false;

        default:
          return false;
      }
    },
    []
  );

  // Memoize active filters calculation
  const activeFilters = useMemo(() => {
    return filters.filter((filter) => {
      const value = filterState[filter.id];
      return isFilterActive(filter, value);
    });
  }, [filters, filterState, isFilterActive]);

  // Memoize filter change handler to prevent unnecessary re-renders
  const handleFilterChange = useCallback(
    (filterId: string, value: any) => {
      onFilterChange({
        ...filterState,
        [filterId]: value,
      });
    },
    [onFilterChange, filterState]
  );

  // Memoize filter clear handler
  const handleFilterClear = useCallback(
    (filterId: string) => {
      const newState = { ...filterState };
      delete newState[filterId];
      onFilterChange(newState);
    },
    [onFilterChange, filterState]
  );

  if (filters.length === 0) return null;

  // For single filter display (inline), use a more compact layout
  if (filters.length === 1) {
    const filter = filters[0];
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex flex-col space-y-1">
          {filter.type !== "switch" && (
            <label className="text-left text-xs font-medium text-gray-400">
              {filter.label}
            </label>
          )}
          <FilterComponent
            filter={filter}
            value={filterState[filter.id]}
            onChange={(value) => handleFilterChange(filter.id, value)}
            onClear={() => handleFilterClear(filter.id)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filters</h3>
        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all ({activeFilters.length})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filters.map((filter) => (
          <div
            key={filter.id}
            className={cn(
              "flex w-full flex-col space-y-2",
              filter.fullWidth && "col-span-full"
            )}
          >
            {filter.type !== "switch" && (
              <label className="text-left text-xs font-medium text-gray-400">
                {filter.label}
              </label>
            )}
            <div className="flex items-start">
              <FilterComponent
                filter={filter}
                value={filterState[filter.id]}
                onChange={(value) => handleFilterChange(filter.id, value)}
                onClear={() => handleFilterClear(filter.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
