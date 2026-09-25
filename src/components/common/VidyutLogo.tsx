'use client';

import React from 'react';
import Image from 'next/image';

export type LogoVariant = 'header' | 'footer' | 'admin' | 'invoice' | 'auth' | 'sm' | 'md' | 'lg';

interface VidyutLogoProps {
  variant?: LogoVariant;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  priority?: boolean;
}

const VARIANT_SIZES: Record<LogoVariant, { width: number; height: number; boxClass: string }> = {
  header: {
    width: 50,
    height: 32,
    boxClass: 'w-[50px] h-[32px]',
  },
  footer: {
    width: 45,
    height: 29,
    boxClass: 'w-[45px] h-[29px]',
  },
  admin: {
    width: 42,
    height: 27,
    boxClass: 'w-[42px] h-[27px]',
  },
  invoice: {
    width: 75,
    height: 48,
    boxClass: 'w-[75px] h-[48px]',
  },
  auth: {
    width: 60,
    height: 38,
    boxClass: 'w-[60px] h-[38px]',
  },
  sm: {
    width: 35,
    height: 22,
    boxClass: 'w-[35px] h-[22px]',
  },
  md: {
    width: 55,
    height: 35,
    boxClass: 'w-[55px] h-[35px]',
  },
  lg: {
    width: 85,
    height: 54,
    boxClass: 'w-[85px] h-[54px]',
  },
};

export default function VidyutLogo({
  variant = 'md',
  className = '',
  showText = false,
  textClassName = 'font-extrabold text-xl tracking-tight text-white',
  priority = false,
}: VidyutLogoProps) {
  const config = VARIANT_SIZES[variant] || VARIANT_SIZES.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Exact 25:16 aspect ratio box - zero unwanted margins or box padding */}
      <div className={`relative shrink-0 ${config.boxClass} rounded-md overflow-hidden flex items-center justify-center drop-shadow-sm transition-transform hover:scale-[1.02]`}>
        <Image
          src="/vs-logo.svg"
          alt="VIDYUT SPARES Logo"
          width={config.width}
          height={config.height}
          className="w-full h-full object-contain"
          priority={priority}
        />
      </div>

      {showText && (
        <span className={textClassName}>
          VIDYUT SPARES
        </span>
      )}
    </div>
  );
}
