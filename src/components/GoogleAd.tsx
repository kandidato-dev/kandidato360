'use client';

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function GoogleAd() {
  const adRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const ad = adRef.current?.querySelector('.adsbygoogle') as HTMLElement | null;
    if (ad && ad.offsetWidth > 0 && !initialized.current) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        initialized.current = true;
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, []);

  return (
    <div
      ref={adRef}
      style={{ minWidth: 320, minHeight: 100, width: "100%" }}
      className="flex justify-center items-center"
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", minWidth: 320, minHeight: 100 }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_AD_SLOT}
        data-ad-format="auto"
      />
    </div>
  );
} 