// components/ui/SanityImage.tsx
'use client';

import Image from 'next/image';
import { urlFor } from '@/lib/sanity/client';

interface SanityImageProps {
  image: any;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
}

export default function SanityImage({ 
  image, 
  alt, 
  width = 500, 
  height = 300, 
  className = '',
  fill = false
}: SanityImageProps) {
  if (!image || !image.asset) {
    return null;
  }
  
  const imageUrl = urlFor(image).url();
  
  if (fill) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className={className}
      />
    );
  }
  
  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}