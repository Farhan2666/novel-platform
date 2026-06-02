"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoverImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}

export default function CoverImage({ src, alt, className, imgClassName }: CoverImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className={cn("bg-white/5 flex items-center justify-center", className)}>
        <BookOpen className="w-8 h-8 text-white/20" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn("object-cover", imgClassName)}
      onError={() => setHasError(true)}
    />
  );
}
