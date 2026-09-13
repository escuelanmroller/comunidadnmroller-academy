import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center border px-3 py-1 text-xs font-bold uppercase tracking-wide-label transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Plan tag: flat (radius 0), brand red
        default:
          "rounded-none border-transparent bg-primary text-primary-foreground hover:bg-brand-600",
        plan:
          "rounded-none border-transparent bg-primary text-primary-foreground",
        secondary:
          "rounded-none border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "rounded-none border-transparent bg-destructive text-destructive-foreground",
        outline:
          "rounded-none border-border-strong text-foreground",
        // Level pill (teal) for "Primeros pasos / Principiante / Intermedio"
        level:
          "rounded-pill border-transparent bg-teal-700/40 text-teal-200 hover:bg-teal-700/60",
        // Status dot variants
        success:
          "rounded-pill border-transparent bg-teal-700/30 text-teal-300",
        status:
          "rounded-pill border-border bg-card text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
