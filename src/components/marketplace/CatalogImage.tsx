"use client";

import Image from "next/image";
import { useState } from "react";
import { publicHttpUrl } from "@/lib/public-catalog";

export default function CatalogImage({ src, alt, className }: {
  src: string | null; alt: string; className: string;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const validSource = src && ((src.startsWith("/") && !src.startsWith("//")) || publicHttpUrl(src));
  return (
    <div className={`relative overflow-hidden bg-zinc-800 ${className}`}>
      {validSource && failedSource !== src ? (
        <Image src={src!} alt={alt} fill unoptimized sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover" onError={() => setFailedSource(src)} />
      ) : (
        <div role="img" aria-label={alt} className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
          Sem imagem
        </div>
      )}
    </div>
  );
}
