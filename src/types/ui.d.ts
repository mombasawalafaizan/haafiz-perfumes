declare type TSortOption =
  | "featured"
  | "name-asc"
  | "name-desc"
  | "date-old-new"
  | "date-new-old"
  | "price-low-high"
  | "price-high-low";
declare interface ISimpleSelectProps {
  options: IFilterOption[];
  value?: string | number;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "default";
  triggerClassName?: string;
  contentClassName?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFields?: ("searchText" | "label" | "value")[];
  loading?: boolean;
  clearable?: boolean;
}

declare interface IFilterOption {
  label: string | React.ReactNode;
  value: string | number | boolean;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  searchText?: string; // Additional text for searching when label is ReactNode
}
