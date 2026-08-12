/**
 * Client-side event tracking.
 *
 * The OpenPanel script (loaded by <OpenPanelComponent> in the root layout)
 * installs the `window.op` queue, which is what the SDK's `useOpenPanel` hook
 * calls into. Going through it directly keeps `track` callable from plain
 * event handlers instead of forcing every call site to add a hook, and makes
 * it a drop-in replacement for the `@vercel/analytics` signature it replaced.
 *
 * Events queue up until the script loads, so early calls are not lost.
 */
export function track(name: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") {
    return;
  }

  window.op?.("track", name, properties);
}
