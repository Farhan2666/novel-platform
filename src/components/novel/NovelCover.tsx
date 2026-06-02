"use client";

import { useState } from "react";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface NovelCoverProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export default function NovelCover({ src, alt, className, priority }: NovelCoverProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className={cn("bg-neutral-800 text-neutral-500 flex items-center justify-center border border-neutral-700 rounded-md aspect-[3/4]", className)}>
        <BookOpen className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-[3/4] overflow-hidden rounded-md", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 25vw"
        priority={priority}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
