import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toggleGroupVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:bg-muted hover:text-muted-foreground",
        outline:
          "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-3",
        sm: "h-8 px-2",
        lg: "h-10 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleGroupVariants>
>(({ className, variant, size, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn(toggleGroupVariants({ variant, size, className }))}
    {...props}
  />
));

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleGroupVariants>
>(({ className, variant, size, ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    className={cn(toggleGroupVariants({ variant, size, className }))}
    {...props}
  />
));

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

// Reusable ToggleGroupSelector component

const ToggleGroupSelector = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  ToggleGroupSelectorProps
>(
  (
    {
      options,
      value,
      onValueChange,
      variant = "default",
      size = "default",
      className,
      disabled = false,
      orientation = "horizontal",
      ...props
    },
    ref
  ) => {
    return (
      <ToggleGroup
        ref={ref}
        type="single"
        value={value}
        onValueChange={onValueChange}
        variant={variant}
        size={size}
        className={cn(orientation === "vertical" && "flex-col", className)}
        disabled={disabled}
        {...props}
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            variant={variant}
            size={size}
            className={cn(
              "flex items-center gap-2",
              "text-muted-foreground",
              "hover:text-foreground hover:bg-accent",
              "focus:text-foreground focus:bg-accent",
              "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
              "border-0",
              "transition-all duration-200",
              "rounded-md",
              "min-w-0 flex-shrink",
              "text-sm"
            )}
          >
            {option.icon && (
              <span className="flex-shrink-0">{option.icon}</span>
            )}
            <span className="truncate">{option.label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    );
  }
);

ToggleGroupSelector.displayName = "ToggleGroupSelector";

export {
  ToggleGroup,
  ToggleGroupItem,
  ToggleGroupSelector,
  toggleGroupVariants,
};
