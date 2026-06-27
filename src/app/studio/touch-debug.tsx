"use client";

import * as React from "react";

/**
 * Lightweight on-device input diagnostic. Renders NOTHING unless the page URL
 * contains `?debug=touch`, so it never affects normal visitors. When enabled it
 * shows, live on the device, which input events actually fire and whether the
 * canvas opted out of native scrolling — exactly the data we can't get from
 * desktop emulation when a real phone "doesn't pan".
 *
 * Usage: open /studio?debug=touch on the device and interact with the canvas.
 */
export function TouchDebugHUD() {
  const [enabled, setEnabled] = React.useState(false);
  const [lines, setLines] = React.useState<string[]>([]);
  const [env, setEnv] = React.useState<string>("");

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("debug") !== "touch") return;
    setEnabled(true);

    const canvas = document.querySelector<HTMLElement>(
      '[aria-label="Workflow canvas"]',
    );
    const ta = canvas ? getComputedStyle(canvas).touchAction : "no-canvas";
    setEnv(
      `dpr=${window.devicePixelRatio} touchPts=${navigator.maxTouchPoints} ` +
        `coarse=${matchMedia("(any-pointer:coarse)").matches} ` +
        `canvas.touchAction=${ta} ` +
        `PointerEvent=${"PointerEvent" in window} ` +
        `TouchEvent=${"ontouchstart" in window}`,
    );

    let n = 0;
    const log = (msg: string) => {
      n += 1;
      setLines((prev) => [`${n}. ${msg}`, ...prev].slice(0, 12));
    };

    const onPointer = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      const label =
        t?.closest("[data-node-id]")
          ? "NODE"
          : t?.closest('[aria-label="Workflow canvas"]')
            ? "CANVAS"
            : (t?.tagName ?? "?");
      log(
        `${e.type} ${e.pointerType} on ${label} @${Math.round(e.clientX)},${Math.round(e.clientY)}`,
      );
    };
    const onTouch = (e: TouchEvent) => {
      log(`${e.type} fingers=${e.touches.length} cancelable=${e.cancelable}`);
    };

    const opts = { passive: true, capture: true } as const;
    window.addEventListener("pointerdown", onPointer, opts);
    window.addEventListener("pointerup", onPointer, opts);
    window.addEventListener("touchstart", onTouch, opts);
    window.addEventListener("touchmove", onTouch, opts);
    window.addEventListener("touchend", onTouch, opts);
    return () => {
      window.removeEventListener("pointerdown", onPointer, opts);
      window.removeEventListener("pointerup", onPointer, opts);
      window.removeEventListener("touchstart", onTouch, opts);
      window.removeEventListener("touchmove", onTouch, opts);
      window.removeEventListener("touchend", onTouch, opts);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      style={{ touchAction: "none" }}
      className="pointer-events-none fixed inset-x-2 bottom-2 z-50 max-h-[40vh] overflow-hidden rounded-lg border border-border bg-background/95 p-2 font-mono text-[10px] leading-tight text-foreground shadow-lg"
    >
      <div className="mb-1 font-semibold text-emerald-500">touch-debug</div>
      <div className="mb-1 break-words text-muted-foreground">{env}</div>
      {lines.length === 0 ? (
        <div className="text-muted-foreground">
          Interact with the canvas to log events…
        </div>
      ) : (
        lines.map((l, i) => <div key={i}>{l}</div>)
      )}
    </div>
  );
}
