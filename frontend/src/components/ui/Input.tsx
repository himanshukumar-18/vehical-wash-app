// components/ui/Input.tsx
"use client";

import {
    forwardRef,
    type InputHTMLAttributes,
    type ReactNode,
} from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            hint,
            leftIcon,
            rightIcon,
            containerClassName = "",
            className = "",
            id,
            disabled,
            ...props
        },
        ref
    ) => {
        const inputId = id || props.name;

        return (
            <div className={`w-full ${containerClassName}`}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className="mb-2 block text-sm font-semibold text-[var(--color-heading)]"
                    >
                        {label}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[var(--color-text-light)]">
                            {leftIcon}
                        </span>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        disabled={disabled}
                        className={[
                            "w-full rounded-xl border bg-[#080A0C] border-[var(--color-border)]",
                            "min-h-[50px] px-4 py-3",
                            "font-[var(--font-sans)] text-sm text-[var(--color-heading)]",
                            "placeholder:text-[var(--color-text-light)]",
                            "outline-none transition-all duration-200",
                            "focus:border-[var(--color-primary)]",
                            "focus:ring-1 focus:ring-[var(--color-primary)]",
                            "disabled:cursor-not-allowed disabled:bg-[var(--color-section-bg)] disabled:opacity-70",
                            leftIcon ? "pl-11" : "",
                            rightIcon ? "pr-11" : "",
                            error
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                : "",
                            className,
                        ]
                            .filter(Boolean)
                            .join(" ")}
                        {...props}
                    />

                    {rightIcon && (
                        <span className="absolute inset-y-0 right-4 flex items-center text-[var(--color-text-light)]">
                            {rightIcon}
                        </span>
                    )}
                </div>

                {error ? (
                    <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
                ) : hint ? (
                    <p className="mt-1.5 text-xs text-[var(--color-text-light)]">
                        {hint}
                    </p>
                ) : null}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;