"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { IllustrationType } from "@/lib/preview-data";

export function ProductIllustration({
  type,
  className = "h-28 w-40",
}: {
  type: IllustrationType;
  className?: string;
}) {
  switch (type) {
    case "bag":
      return (
        <svg
          viewBox="0 0 200 130"
          className={className}
          role="img"
          aria-label="Ilustrasi kartun tas lipat dan modul"
        >
          <rect
            x="34"
            y="26"
            width="132"
            height="84"
            rx="16"
            fill="#15803D"
            stroke="#111827"
            strokeWidth="4"
          />
          <rect
            x="30"
            y="22"
            width="132"
            height="84"
            rx="16"
            fill="#15803D"
            stroke="#111827"
            strokeWidth="3.5"
          />
          <rect
            x="48"
            y="38"
            width="96"
            height="28"
            rx="8"
            fill="#FACC15"
            stroke="#111827"
            strokeWidth="3"
          />
          <rect
            x="82"
            y="58"
            width="28"
            height="12"
            rx="4"
            fill="#FFFFFF"
            stroke="#111827"
            strokeWidth="2.5"
          />
        </svg>
      );
    case "sneaker":
      return (
        <svg
          viewBox="0 0 220 130"
          className={className}
          role="img"
          aria-label="Ilustrasi kartun sepatu kampus"
        >
          <path
            d="M34 86 L44 38 L102 38 L142 64 L184 68 C196 70 198 86 190 86 Z"
            fill="#111827"
            stroke="#111827"
            strokeWidth="3.5"
          />
          <rect
            x="58"
            y="58"
            width="64"
            height="16"
            rx="6"
            fill="#15803D"
            stroke="#FFFFFF"
            strokeWidth="2.5"
          />
          <rect
            x="30"
            y="84"
            width="168"
            height="18"
            rx="9"
            fill="#FFFFFF"
            stroke="#111827"
            strokeWidth="3.5"
          />
          <circle cx="52" cy="50" r="5" fill="#FACC15" />
        </svg>
      );
    case "headphone":
      return (
        <svg
          viewBox="0 0 200 130"
          className={className}
          role="img"
          aria-label="Ilustrasi kartun headphone belajar"
        >
          <path
            d="M52 84 A48 46 0 0 1 148 84"
            fill="none"
            stroke="#111827"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <rect
            x="36"
            y="62"
            width="34"
            height="52"
            rx="16"
            fill="#111827"
            stroke="#FFFFFF"
            strokeWidth="3"
          />
          <rect
            x="130"
            y="62"
            width="34"
            height="52"
            rx="16"
            fill="#FACC15"
            stroke="#111827"
            strokeWidth="3"
          />
        </svg>
      );
    case "hat":
      return (
        <svg
          viewBox="0 0 220 130"
          className={className}
          role="img"
          aria-label="Ilustrasi kartun bucket hat praktikum"
        >
          <ellipse
            cx="110"
            cy="96"
            rx="78"
            ry="18"
            fill="#111827"
            stroke="#111827"
            strokeWidth="3"
          />
          <path
            d="M64 34 L156 34 L172 92 L48 92 Z"
            fill="#111827"
            stroke="#FFFFFF"
            strokeWidth="2.5"
          />
          <rect
            x="56"
            y="72"
            width="108"
            height="14"
            rx="4"
            fill="#FACC15"
            stroke="#111827"
            strokeWidth="2.5"
          />
        </svg>
      );
    case "volleyball":
      return (
        <svg
          viewBox="0 0 200 130"
          className={className}
          role="img"
          aria-label="Ilustrasi kartun bola voli UKM"
        >
          <circle cx="104" cy="68" r="46" fill="#111827" />
          <circle
            cx="100"
            cy="64"
            r="46"
            fill="#FFFFFF"
            stroke="#111827"
            strokeWidth="3.5"
          />
          <path d="M58 64 Q100 38 142 64 Q100 90 58 64 Z" fill="#111827" />
          <rect
            x="76"
            y="34"
            width="48"
            height="18"
            rx="8"
            fill="#FACC15"
            stroke="#111827"
            strokeWidth="2.5"
          />
        </svg>
      );
    case "umkm-coffee":
      return (
        <svg
          viewBox="0 0 200 130"
          className={className}
          role="img"
          aria-label="Ilustrasi kartun paket kuliner UMKM"
        >
          <rect
            x="68"
            y="18"
            width="64"
            height="36"
            rx="16"
            fill="#FACC15"
            stroke="#111827"
            strokeWidth="7"
          />
          <circle cx="104" cy="80" r="38" fill="#15803D" />
          <circle
            cx="100"
            cy="76"
            r="38"
            fill="#111827"
            stroke="#111827"
            strokeWidth="3.5"
          />
          <text
            x="100"
            y="81"
            textAnchor="middle"
            fill="#FACC15"
            fontSize="14"
            fontWeight="bold"
          >
            UMKM
          </text>
        </svg>
      );
  }
}

export function ModalDialog({
  open,
  onClose,
  titleId,
  children,
  maxWidthClass = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  titleId: string;
  children: ReactNode;
  maxWidthClass?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    const handleClose = () => {
      dialog.returnValue = "";
      onClose();
    };
    dialog.addEventListener("close", handleClose);

    // Fallback light-dismiss hanya bila browser belum mendukung dialog[closedby] (seperti Safari)
    const supportsClosedBy = "closedBy" in HTMLDialogElement.prototype;
    if (supportsClosedBy) {
      return () => dialog.removeEventListener("close", handleClose);
    }

    let pressedOutside = false;
    const isOutside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      );
    };
    const onPointerDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e)) {
        dialog.close();
      }
      pressedOutside = false;
    };

    dialog.addEventListener("pointerdown", onPointerDown);
    dialog.addEventListener("pointerup", onPointerUp);

    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("pointerdown", onPointerDown);
      dialog.removeEventListener("pointerup", onPointerUp);
    };
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      {...({ closedby: "any" } as Record<string, string>)}
      className={`m-auto w-[calc(100%-2rem)] ${maxWidthClass} rounded-3xl border-[3px] border-[#111827] bg-white p-5 text-[#111827] shadow-[6px_6px_0px_#111827] backdrop:bg-[#111827]/60 sm:p-6`}
    >
      {children}
    </dialog>
  );
}

