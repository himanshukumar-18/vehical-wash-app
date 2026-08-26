// components/ui/Button.tsx
"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "dark" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    loading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        "bg-[var(--color-primary)] text-white border border-[var(--color-primary)] shadow-[var(--shadow-button)] hover:bg-[var(--color-primary-hover)] hover:border-[var(--color-primary-hover)]",

    dark:
        "bg-[var(--color-black)] text-white border border-[var(--color-black)] shadow-[0_8px_20px_rgba(17,17,17,0.16)] hover:bg-[var(--color-heading)] hover:border-[var(--color-heading)]",

    outline:
        "bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)] shadow-none hover:bg-[var(--color-primary)] hover:text-white",

    ghost:
        "bg-transparent text-[var(--color-heading)] border border-transparent shadow-none hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]",
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: "min-h-[38px] px-4 py-2 text-xs",
    md: "min-h-[48px] px-5 py-3 text-sm",
    lg: "min-h-[56px] px-7 py-4 text-base",
};

export default function Button({
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    leftIcon,
    rightIcon,
    className = "",
    disabled,
    type = "button",
    ...props
}: ButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <button
            type={type}
            disabled={isDisabled}
            className={[
                "inline-flex items-center justify-center gap-2",
                "rounded-full font-bold leading-none tracking-[-0.01em]",
                "font-[var(--font-sans)]",
                "transition-all duration-200 ease-out",
                "hover:-translate-y-0.5 active:translate-y-0",
                "focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3",
                "focus-visible:outline-[var(--color-primary-soft)]",
                "disabled:cursor-not-allowed disabled:opacity-65 disabled:shadow-none",
                "disabled:hover:translate-y-0",
                variantClasses[variant],
                sizeClasses[size],
                fullWidth ? "w-full" : "w-fit",
                className,
            ].join(" ")}
            {...props}
        >
            {loading ? (
                <span
                    className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-current border-r-transparent"
                    aria-label="Loading"
                />
            ) : (
                <>
                    {leftIcon && (
                        <span className="inline-flex shrink-0 items-center justify-center">
                            {leftIcon}
                        </span>
                    )}

                    <span className="whitespace-nowrap">{children}</span>

                    {rightIcon && (
                        <span className="inline-flex shrink-0 items-center justify-center">
                            {rightIcon}
                        </span>
                    )}
                </>
            )}
        </button>
    );
}