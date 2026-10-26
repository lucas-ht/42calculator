"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface CompletionBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Real, earned amount (drawn in the fill colour). */
  value: number;
  /** Additional simulated amount, stacked after `value` (drawn distinctly). */
  simulatedValue?: number;
  /** Target amount that represents 100%. */
  max: number;
  /** Extra classes for the mandatory (0–100%) real fill segment. */
  fillClassName?: string;
  /** Extra classes for the real overflow (>100%) segment. */
  overflowClassName?: string;
  /** Extra classes for the simulated segment (defaults to a striped blue fill). */
  simulatedClassName?: string;
  /** Extra classes for the 100% marker shown while overflowing. */
  markerClassName?: string;
  /** Show a marker at the 100% boundary when the total overflows. */
  showMarker?: boolean;
  /**
   * Optional content rendered on top of the bar. When a function, it receives
   * the computed state so callers can format their own label.
   */
  children?: React.ReactNode | ((state: CompletionBarState) => React.ReactNode);
}

export interface CompletionBarState {
  /** (value + simulatedValue) / max, as a percentage (can exceed 100). */
  percentage: number;
  /** How far past 100% the total is (0 when not overflowing). */
  overflowPercentage: number;
  isOver: boolean;
  hasSimulated: boolean;
}

/**
 * A tuneable completion bar that:
 *  - draws the real `value` and the `simulatedValue` as two distinct stacked
 *    segments, so simulated ("fake") progress is obvious; and
 *  - clearly visualises overflow: when the total exceeds `max`, the track
 *    rescales to represent the total and a marker is drawn at the 100% line,
 *    so anything past it reads as "beyond 100%".
 * Every segment is restyleable through its `*ClassName` prop.
 */
export function CompletionBar({
  value,
  simulatedValue = 0,
  max,
  className,
  fillClassName,
  overflowClassName,
  simulatedClassName,
  markerClassName,
  showMarker = true,
  children,
  ...props
}: CompletionBarProps) {
  const safeMax = max > 0 ? max : 1;
  const real = Math.max(value, 0);
  const simulated = Math.max(simulatedValue, 0);
  const total = real + simulated;

  const percentage = (total / safeMax) * 100;
  const isOver = total > safeMax;
  const overflowPercentage = isOver ? percentage - 100 : 0;
  const hasSimulated = simulated > 0;

  // When overflowing, the whole track represents the total; otherwise it
  // represents `max` (so the empty remainder stays visible).
  const displayTotal = isOver ? total : safeMax;

  // Split the real portion into the part that counts toward the requirement
  // (mandatory) and the part beyond 100% (extra), so they read differently.
  const realMandatory = Math.min(real, safeMax);
  const realExtra = Math.max(real - safeMax, 0);

  const realMandatoryWidth = (realMandatory / displayTotal) * 100;
  const realExtraWidth = (realExtra / displayTotal) * 100;
  const simulatedWidth = (simulated / displayTotal) * 100;
  const markerLeft = (safeMax / displayTotal) * 100;

  const state: CompletionBarState = {
    percentage,
    overflowPercentage,
    isOver,
    hasSimulated,
  };

  return (
    <div
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className,
      )}
      role="progressbar"
      aria-valuenow={total}
      aria-valuemin={0}
      aria-valuemax={max}
      data-state={isOver ? "over" : "within"}
      {...props}
    >
      <div className="flex h-full w-full">
        <div
          className={cn(
            "h-full bg-primary transition-all duration-300 ease-out",
            fillClassName,
          )}
          style={{ width: `${realMandatoryWidth}%` }}
        />
        {realExtra > 0 && (
          <div
            className={cn(
              // Real progress beyond 100% — a deeper amber so the "extra" is
              // distinct from the mandatory fill but still reads as real.
              "h-full bg-amber-500 transition-all duration-300 ease-out",
              overflowClassName,
            )}
            style={{ width: `${realExtraWidth}%` }}
          />
        )}
        {hasSimulated && (
          <div
            className={cn(
              // Distinct colour (the theme primary is yellow, so simulated
              // uses a contrasting blue) plus a diagonal stripe overlay so it
              // clearly reads as "not real".
              "h-full bg-sky-500 transition-all duration-300 ease-out",
              simulatedClassName,
            )}
            style={{
              width: `${simulatedWidth}%`,
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,0.3) 0 4px, transparent 4px 8px)",
            }}
          />
        )}
      </div>

      {isOver && showMarker && (
        <div
          className={cn(
            "absolute inset-y-0 w-0.5 bg-background/70",
            markerClassName,
          )}
          style={{ left: `${markerLeft}%` }}
          aria-hidden
        />
      )}

      {typeof children === "function" ? children(state) : children}
    </div>
  );
}
