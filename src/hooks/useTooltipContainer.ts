import { useRef, useEffect, useState } from "react";

export const useTooltipContainer = () => {
  const [container, setContainer] = useState<HTMLElement | undefined>(
    undefined
  );
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Check if the element is inside a dialog
    const dialogContent = ref.current.closest('[data-slot="dialog-content"]');
    if (dialogContent) {
      // If inside a dialog, use the dialog content as the container
      setContainer(dialogContent as HTMLElement);
    } else {
      // Otherwise, use the document body (default behavior)
      setContainer(document.body);
    }
  }, []);

  return { container, ref };
};
