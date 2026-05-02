"use client";

import Script from "next/script";

import { cn } from "@/lib/utils";

type AdSlotSize = "banner" | "sidebar" | "inline";

interface AdSlotProps {
  size: AdSlotSize;
}

const sizeConfig: Record<
  AdSlotSize,
  {
    label: string;
    className: string;
    slotId: string;
    minHeight: number;
  }
> = {
  banner: {
    label: "728 x 90",
    className: "mx-auto w-full max-w-[728px] min-h-[90px]",
    slotId: "1234567890",
    minHeight: 90
  },
  sidebar: {
    label: "300 x 250",
    className: "mx-auto w-full max-w-[300px] min-h-[250px]",
    slotId: "2345678901",
    minHeight: 250
  },
  inline: {
    label: "336 x 280",
    className: "mx-auto w-full max-w-[336px] min-h-[280px]",
    slotId: "3456789012",
    minHeight: 280
  }
};

export function AdSlot({ size }: AdSlotProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const config = sizeConfig[size];
  const shouldRenderAdsense = process.env.NODE_ENV === "production" && Boolean(client);

  if (!shouldRenderAdsense || !client) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-100 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400",
          config.className
        )}
        style={{ minHeight: config.minHeight }}
      >
        Ad Slot - Google AdSense ({config.label})
      </div>
    );
  }

  return (
    <div className={config.className}>
      <Script
        id={`adsense-loader-${size}`}
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <ins
        className="adsbygoogle block overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
        style={{ minHeight: config.minHeight }}
        data-ad-client={client}
        data-ad-slot={config.slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <Script id={`adsense-init-${size}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  );
}
