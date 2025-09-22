"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type DialogLayoutContextType = {
  setHeaderEl: (el: HTMLDivElement | null) => void;
  setFooterEl: (el: HTMLDivElement | null) => void;
  headerEl: HTMLDivElement | null;
  footerEl: HTMLDivElement | null;
};
const DialogLayoutContext = React.createContext<DialogLayoutContextType | null>(
  null
);

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  const [headerEl, setHeaderEl] = React.useState<HTMLDivElement | null>(null);
  const [footerEl, setFooterEl] = React.useState<HTMLDivElement | null>(null);
  return (
    <DialogLayoutContext.Provider
      value={{ setHeaderEl, setFooterEl, headerEl, footerEl }}
    >
      <DialogPrimitive.Root data-slot="dialog" {...props} />
    </DialogLayoutContext.Provider>
  );
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  disablePointerEvents = false,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
  disablePointerEvents?: boolean;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] rounded-lg border shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        onPointerDownOutside={(e) => {
          // Allow userback controls to receive events
          const target = e.target as Element;
          const isUserbackControl = target.closest(
            ".userback-controls, .userback-button-container"
          );

          if (isUserbackControl) {
            // Prevent dialog from closing when clicking userback controls
            e.preventDefault();
            return;
          }

          if (disablePointerEvents) {
            e.preventDefault();
          }
        }}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

const DialogHeader: React.FC<React.ComponentProps<"div">> = ({
  className,
  ...props
}) => {
  const layout = React.useContext(DialogLayoutContext);
  const localRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (layout) layout.setHeaderEl(localRef.current);
    return () => {
      if (layout) layout.setHeaderEl(null);
    };
  }, [layout]);

  return (
    <div
      ref={localRef}
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-2 border-b p-4 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
};
DialogHeader.displayName = "DialogHeader";

const DialogFooter: React.FC<React.ComponentProps<"div">> = ({
  className,
  ...props
}) => {
  const layout = React.useContext(DialogLayoutContext);
  const localRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (layout) layout.setFooterEl(localRef.current);
    return () => {
      if (layout) layout.setFooterEl(null);
    };
  }, [layout]);

  return (
    <div
      ref={localRef}
      data-slot="dialog-footer"
      className={cn(
        "bg-muted/30 flex flex-col-reverse gap-3 rounded-b-lg border-t p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
};
DialogFooter.displayName = "DialogFooter";

// DialogBody with dynamic maxHeight
const DialogBody: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => {
  const layout = React.useContext(DialogLayoutContext);
  const [maxHeight, setMaxHeight] = React.useState<string>("60vh");

  React.useLayoutEffect(() => {
    function updateHeight() {
      const headerHeight = layout?.headerEl?.offsetHeight || 0;
      const footerHeight = layout?.footerEl?.offsetHeight || 0;
      setMaxHeight(`calc(100vh - ${headerHeight + footerHeight + 60}px)`); // 48px for dialog paddings/margins
    }
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [layout]);

  return (
    <ScrollArea className={"w-full"} style={{ maxHeight }}>
      <div className={cn("px-4 py-4", className)}>{children}</div>
    </ScrollArea>
  );
};
DialogBody.displayName = "DialogBody";

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DialogBody,
};
