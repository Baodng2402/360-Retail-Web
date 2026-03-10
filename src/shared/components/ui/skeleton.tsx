import { cn } from "@/lib/utils";

import type React from "react";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60 dark:bg-slate-800/80",
        className,
      )}
      {...props}
    />
  );
}

