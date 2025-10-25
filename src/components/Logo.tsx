"use client";
import { useState } from "react";

export default function Logo({
  abbr,
  name,
  srcFromDb,
  size = 48,
}: { abbr: string; name: string; srcFromDb?: string | null; size?: number }) {
  // Try DB → .svg → .png gracefully
  const [src, setSrc] = useState<string | undefined>(
    srcFromDb || `/logos/${abbr}.svg`
  );

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className="object-contain"
      onError={() => {
        if (src?.endsWith(".svg")) setSrc(`/logos/${abbr}.png`);
        else setSrc(undefined); // gives up; UI will show fallback chip
      }}
    />
  );
}
