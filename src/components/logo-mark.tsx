import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * The GlobaGRID globe-and-plane mark — the storefront's logo without its
 * wordmark (`public/favicon.svg` is the same drawing; keep the two in step).
 * Size it with a `size-*` class.
 */
export function LogoMark({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <g transform="translate(2, 2)">
        <circle cx="20" cy="20" r="18" stroke="#0088CC" strokeWidth="2.5" fill="#F0F9FF" />
        <ellipse
          cx="20"
          cy="20"
          rx="9"
          ry="18"
          stroke="#0088CC"
          strokeWidth="1.8"
          strokeDasharray="2 1"
        />
        <line x1="2" y1="20" x2="38" y2="20" stroke="#0088CC" strokeWidth="1.8" />
        <path d="M7 11 C 13 15, 27 15, 33 11" stroke="#0088CC" strokeWidth="1.5" fill="none" />
        <path d="M7 29 C 13 25, 27 25, 33 29" stroke="#0088CC" strokeWidth="1.5" fill="none" />
        <path d="M12 28 L24 12 L30 14 L24 22 L32 23 L34 26 L22 25 L16 30 Z" fill="#0B2545" />
        <circle cx="28" cy="10" r="2.5" fill="#FF5722" />
      </g>
    </svg>
  );
}
