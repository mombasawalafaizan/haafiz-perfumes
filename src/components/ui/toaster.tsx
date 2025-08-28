"use client";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={"light" as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--success-background)",
          "--success-text": "var(--success)",
          "--warning-bg": "var(--warning-background)",
          "--warning-text": "var(--warning)",
          "--error-bg": "var(--error-background)",
          "--error-text": "var(--error)",
          "--info-bg": "var(--info-background)",
          "--info-text": "var(--info)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
