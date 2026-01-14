import * as React from "react";

import { cn } from "@/lib/utils";

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked: checkedProp,
      defaultChecked,
      disabled,
      onCheckedChange,
      ...props
    },
    ref
  ) => {
    const [uncontrolled, setUncontrolled] = React.useState(
      defaultChecked ?? false
    );

    const isControlled = checkedProp !== undefined;
    const checked = isControlled ? checkedProp : uncontrolled;

    const toggle = () => {
      if (disabled) return;
      const next = !checked;

      if (!isControlled) {
        setUncontrolled(next);
      }

      onCheckedChange?.(next);
    };

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        data-state={checked ? "checked" : "unchecked"}
        data-disabled={disabled ? "" : undefined}
        ref={ref}
        onClick={toggle}
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-input transition-colors focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
          className
        )}
        disabled={disabled}
        {...props}
      >
        <span
          data-state={checked ? "checked" : "unchecked"}
          className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };

