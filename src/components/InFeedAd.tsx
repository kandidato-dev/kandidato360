'use client';

import { useEffect } from 'react';

export default function InFeedAd() {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className="my-8">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-format="fluid"
        data-ad-layout-key="-hd+7-8-3y+81"
        data-ad-client="ca-pub-9496331727688071"
        data-ad-slot="1256871187"
      />
    </div>
  );
} 