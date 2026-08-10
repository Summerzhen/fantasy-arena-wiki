"use client";

import { useEffect, useId, useRef } from "react";

type AdUnit = "native" | "rectangle" | "tower" | "halfTower" | "stickyBanner";

const AD_CONFIG = {
  native: {
    width: 300,
    height: 90,
    containerId: "container-036e2e36c27fbfe85992bc9843efed59",
    src: "https://pl30774880.effectivecpmnetwork.com/036e2e36c27fbfe85992bc9843efed59/invoke.js",
  },
  rectangle: {
    key: "7aa54740f63dd49ccf5f8a1afee08442",
    width: 300,
    height: 250,
  },
  tower: {
    key: "80d1dcfc36fc4e3c03b4b71e7e4f9450",
    width: 160,
    height: 600,
  },
  halfTower: {
    key: "96936062d29b38a6542f984e07a8420a",
    width: 160,
    height: 300,
  },
  stickyBanner: {
    key: "3d2b96e35143861c4a1280be09423b68",
    width: 320,
    height: 50,
  },
} as const;

declare global {
  interface Window {
    atOptions?: {
      key: string;
      format: "iframe";
      height: number;
      width: number;
      params: Record<string, never>;
    };
  }
}

function AdFrame({ unit }: { unit: Exclude<AdUnit, "native"> }) {
  const ref = useRef<HTMLDivElement>(null);
  const config = AD_CONFIG[unit];

  useEffect(() => {
    if (!ref.current || ref.current.dataset.loaded === "true") return;
    ref.current.dataset.loaded = "true";

    window.atOptions = {
      key: config.key,
      format: "iframe",
      height: config.height,
      width: config.width,
      params: {},
    };

    const script = document.createElement("script");
    script.src = `https://www.highperformanceformat.com/${config.key}/invoke.js`;
    script.async = true;
    ref.current.appendChild(script);
  }, [config.height, config.key, config.width]);

  return (
    <div
      ref={ref}
      className="overflow-hidden"
      style={{ width: config.width, minHeight: config.height }}
    />
  );
}

function NativeAd() {
  const rootRef = useRef<HTMLDivElement>(null);
  const instanceId = useId().replace(/:/g, "");
  const config = AD_CONFIG.native;

  useEffect(() => {
    if (!rootRef.current || rootRef.current.dataset.loaded === "true") return;
    rootRef.current.dataset.loaded = "true";

    const container = document.createElement("div");
    container.id = config.containerId;
    rootRef.current.appendChild(container);

    const script = document.createElement("script");
    script.async = true;
    script.dataset.cfasync = "false";
    script.src = config.src;
    rootRef.current.appendChild(script);
  }, [config.containerId, config.src, instanceId]);

  return (
    <div
      ref={rootRef}
      className="overflow-hidden"
      style={{ width: config.width, minHeight: config.height }}
    />
  );
}

export function AdUnitBox({
  unit,
  className = "",
}: {
  unit: AdUnit;
  className?: string;
}) {
  return (
    <div className={`flex justify-center ${className}`} aria-label="Advertisement">
      {unit === "native" ? <NativeAd /> : <AdFrame unit={unit} />}
    </div>
  );
}

export function DesktopLeftStickyAd() {
  return (
    <aside className="pointer-events-none fixed left-[max(1rem,calc((100vw-80rem)/2-12rem))] top-28 z-30 hidden 2xl:block">
      <AdUnitBox unit="halfTower" className="pointer-events-auto" />
    </aside>
  );
}

export function ResponsiveStickyBannerAd() {
  return (
    <>
      <aside className="fixed inset-x-0 bottom-0 z-40 flex justify-center border-t border-border/60 bg-background/80 py-1.5 backdrop-blur md:hidden">
        <AdUnitBox unit="stickyBanner" />
      </aside>
      <aside className="fixed inset-x-0 top-[65px] z-40 hidden justify-center border-b border-border/60 bg-background/80 py-1.5 backdrop-blur md:flex">
        <AdUnitBox unit="stickyBanner" />
      </aside>
    </>
  );
}
