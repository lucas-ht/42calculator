import { CompletionBar } from "@/components/ui/completion-bar";

interface TitleRequirementProps {
  name: string;
  value: number;
  max: number;
  unit?: string;
  /** Extra amount coming from simulated (not yet earned) projects. */
  simulatedValue?: number;
}

export function TitleRequirement({
  name,
  value,
  max,
  unit,
  simulatedValue = 0,
}: TitleRequirementProps) {
  function formatValue(value: number) {
    if (value > 1000) {
      return `${(value / 1000).toFixed(1).toLocaleString()}K`;
    }
    return value.toLocaleString();
  }

  const total = value + simulatedValue;
  const percentage = max > 0 ? (total / max) * 100 : 0;
  const isOver = total > max;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 px-1 text-sm">
        <p className="truncate">{name}</p>
        <p className="text-right font-medium tabular-nums">
          {formatValue(value)}
          {simulatedValue > 0 && (
            <span className="text-sky-600 dark:text-sky-400">
              {" +"}
              {formatValue(simulatedValue)}
            </span>
          )}
          {" / "}
          {formatValue(max)} {unit}
          {isOver && (
            <span className="ml-1 font-normal text-muted-foreground text-xs">
              ({Math.round(percentage)}%)
            </span>
          )}
        </p>
      </div>
      <CompletionBar
        value={value}
        simulatedValue={simulatedValue}
        max={max}
        aria-label={`${total} out of ${max} for the ${name.toLowerCase()}`}
      />
    </div>
  );
}
