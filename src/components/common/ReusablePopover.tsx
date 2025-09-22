import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface IReusablePopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  alignOffset?: number;
  className?: string;
  contentClassName?: string;
  triggerClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  modal?: boolean;
}

const ReusablePopover: React.FC<IReusablePopoverProps> = ({
  trigger,
  children,
  align = "center",
  side = "bottom",
  sideOffset = 4,
  alignOffset = 0,
  className,
  contentClassName,
  triggerClassName,
  open,
  onOpenChange,
  disabled = false,
  modal = false,
}) => {
  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={onOpenChange} modal={modal}>
        <PopoverTrigger
          asChild
          disabled={disabled}
          className={cn("cursor-pointer", triggerClassName)}
        >
          {trigger}
        </PopoverTrigger>
        <PopoverContent
          align={align}
          side={side}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          className={cn(contentClassName)}
        >
          {children}
        </PopoverContent>
      </Popover>
    </div>
  );
};

ReusablePopover.displayName = "ReusablePopover";

export { ReusablePopover };
export type { IReusablePopoverProps };
