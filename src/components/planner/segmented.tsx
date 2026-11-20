import { cn } from "@/lib/utils";

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: [T, string][];
  onChange: (value: T) => void;
  className?: string;
}

/** Two or three mutually exclusive buttons, in the shadcn button style. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      aria-label={label}
      className={cn(
        "bg-secondary inline-flex w-fit shrink-0 rounded-md p-1",
        className,
      )}
    >
      {options.map(([key, text]) => (
        <button
          key={key}
          type="button"
          aria-pressed={value === key}
          onClick={() => onChange(key)}
          className={cn(
            "focus-visible:ring-ring cursor-pointer rounded-sm px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-hidden",
            value === key
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
