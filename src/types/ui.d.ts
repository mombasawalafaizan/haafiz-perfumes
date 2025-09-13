declare type TSortOption =
  | "featured"
  | "name-asc"
  | "name-desc"
  | "date-old-new"
  | "date-new-old"
  | "price-low-high"
  | "price-high-low";

declare interface IMultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  options: IMultiSelectOption[];
  onValueChange: (value: (string | number | boolean)[]) => void;
  defaultValue?: (string | number | boolean)[];
  placeholder?: string;
  animation?: number;
  maxCount?: number;
  modalPopover?: boolean;
  className?: string;
  variant?: "default" | "secondary" | "destructive" | "inverted";
  loading?: boolean;
}

declare interface ToggleGroupSelectorProps {
  options: IToggleOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: VariantProps<typeof toggleGroupVariants>["variant"];
  size?: VariantProps<typeof toggleGroupVariants>["size"];
  className?: string;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
}

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
