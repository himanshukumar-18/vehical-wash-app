// components/ui/Loader.tsx

interface LoaderProps {
    size?: "sm" | "md" | "lg";
    text?: string;
    fullScreen?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-9 w-9 border-[3px]",
    lg: "h-14 w-14 border-4",
};

export default function Loader({
    size = "md",
    text,
    fullScreen = false,
    className = "",
}: LoaderProps) {
    const content = (
        <div
            className={[
                "flex flex-col items-center justify-center gap-3",
                className,
            ].join(" ")}
            role="status"
            aria-live="polite"
        >
            <span
                className={[
                    "animate-spin rounded-full",
                    "border-[var(--color-primary-light)]",
                    "border-t-[var(--color-primary)]",
                    sizeClasses[size],
                ].join(" ")}
                aria-hidden="true"
            />

            {text && (
                <p className="text-sm font-medium text-[var(--color-text)]">
                    {text}
                </p>
            )}

            <span className="sr-only">{text || "Loading"}</span>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 p-4 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    return content;
}