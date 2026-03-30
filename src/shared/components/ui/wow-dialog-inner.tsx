import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/** Gradient top bar + motion wrapper for dashboard modals (use inside DialogContent with p-0 gap-0). */
export function WowDialogInner({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <div
        className="h-1 w-full shrink-0 bg-gradient-to-r from-[#FF7B21] to-[#19D6C8]"
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className={cn("p-6 pt-5", className)}
      >
        {children}
      </motion.div>
    </>
  );
}
