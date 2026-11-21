"use client";

import { Eye, EyeOff } from "lucide-react";
import type { InputHTMLAttributes, Ref } from "react";

interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  ref?: Ref<HTMLInputElement>;
  visible: boolean;
  onToggleVisible: () => void;
  toggleShowLabel?: string;
  toggleHideLabel?: string;
}

export function PasswordInput({
  ref,
  visible,
  onToggleVisible,
  toggleShowLabel = "Tampilkan kata sandi",
  toggleHideLabel = "Sembunyikan kata sandi",
  className = "",
  ...props
}: PasswordInputProps) {
  return (
    <div className="relative mt-1">
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        className={`min-h-11 w-full min-w-0 rounded-xl border-2 border-[#111827] bg-white pl-3 pr-12 text-base text-[#111827] sm:text-sm ${className}`}
        {...props}
      />
      <button
        type="button"
        aria-pressed={visible}
        aria-label={visible ? toggleHideLabel : toggleShowLabel}
        onClick={onToggleVisible}
        className="absolute inset-y-[2px] right-[2px] flex w-11 items-center justify-center rounded-r-[10px] text-[#334155] transition-colors hover:bg-[#F8FAFC] hover:text-[#111827] focus-visible:outline-2 focus-visible:outline-offset-1"
      >
        {visible ? (
          <EyeOff className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Eye className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
