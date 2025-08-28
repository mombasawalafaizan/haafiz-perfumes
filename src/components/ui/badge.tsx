import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-semibold h-fit w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.25 [&>svg]:pointer-events-none [&>svg]:text-inherit focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90 border-none',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        tertiary:
          'border-transparent bg-tertiary/12.5 text-tertiary [a&]:hover:bg-tertiary/20 focus-visible:ring-tertiary/20 dark:focus-visible:ring-tertiary/40',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        warning:
          'border-transparent bg-warning/12.5 text-warning [a&]:hover:bg-warning/20 focus-visible:ring-warning/20 dark:focus-visible:ring-warning/40',
        primary:
          'border-transparent bg-primary/12.5 text-primary [a&]:hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40',
        info: 'border-transparent bg-info/12.5 text-info [a&]:hover:bg-info/20 focus-visible:ring-info/20 dark:focus-visible:ring-info/40',
        success:
          'border-transparent bg-success/12.5 text-success [a&]:hover:bg-success/20 focus-visible:ring-success/20 dark:focus-visible:ring-success/40',
        error:
          'border-transparent bg-error/12.5 text-error [a&]:hover:bg-error/20 focus-visible:ring-error/20 dark:focus-visible:ring-error/40',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean };

function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
