"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useBooking } from "../../context/BookingProvider";
import { CalendarDays, ChevronDown, LogOut, ArrowUpRight, Menu, X, Download } from "lucide-react";
import { logoutUser, fetchProfile } from "../../lib/authSlice";
import { usePWAInstall, IOSInstallModal } from "../pwa/InstallApp";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthState {
    auth: {
        user: {
            fullname?: string;
            email?: string;
        } | null;
    };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NAV_LINKS = [
    { label: "Home", href: "#home" },
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Work", href: "#work" },
    { label: "Contact", href: "#contact" },
];

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const dispatch = useDispatch();
    const router = useRouter();
    const profileRef = useRef<HTMLDivElement>(null);

    const { user } = useSelector((state: AuthState) => state.auth);
    const { openBooking } = useBooking();

    const initial = user?.fullname ? user.fullname.charAt(0).toUpperCase() : "U";

    // -------------------------------------------------------------------------
    // Effects
    // -------------------------------------------------------------------------

    // Fetch profile on mount
    useEffect(() => {
        dispatch(fetchProfile() as any);
    }, [dispatch]);

    // Sticky header on scroll
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    // Close profile dropdown on outside click
    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    // Close menus on Escape key
    useEffect(() => {
        const onEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setMenuOpen(false);
                setProfileOpen(false);
            }
        };
        document.addEventListener("keydown", onEscape);
        return () => document.removeEventListener("keydown", onEscape);
    }, []);

    // -------------------------------------------------------------------------
    // Handlers
    // -------------------------------------------------------------------------

    const handleLogout = async () => {
        await dispatch(logoutUser() as any);
        setMenuOpen(false);
        setProfileOpen(false);
        router.push("/login");
    };

    const handleBookNow = () => {
        setMenuOpen(false);
        openBooking();
    };

    const closeMenus = () => {
        setMenuOpen(false);
        setProfileOpen(false);
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
        <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-all duration-300 sm:px-5 sm:pt-5 lg:px-8">

            {/* ================================================================
          NAVBAR
      ================================================================ */}
            <div
                className={[
                    "mx-auto flex h-[64px] max-w-[1400px] items-center",
                    "border px-3 backdrop-blur-md transition-all duration-300 sm:h-[72px] sm:px-5 lg:px-6",
                    scrolled
                        ? "border-[var(--color-border)] bg-[rgba(8,10,12,0.96)]"
                        : "border-white/[0.08] bg-[rgba(8,10,12,0.82)]",
                ].join(" ")}
            >

                {/* Brand */}
                <Brand onClick={closeMenus} />

                {/* Desktop nav */}
                <nav className="ml-auto hidden items-center gap-7 xl:flex" aria-label="Main navigation">
                    {NAV_LINKS.map((link, index) => (
                        <DesktopNavLink key={link.href} link={link} isFirst={index === 0} />
                    ))}
                </nav>

                {/* Desktop actions */}
                <div className="ml-7 hidden items-center gap-3 lg:flex">
                    <BookButton onClick={handleBookNow} />
                    <ProfileDropdown
                        ref={profileRef}
                        user={user}
                        initial={initial}
                        open={profileOpen}
                        onToggle={() => setProfileOpen((v) => !v)}
                        onClose={() => setProfileOpen(false)}
                        onLogout={handleLogout}
                    />
                </div>

                {/* Mobile menu toggle */}
                <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={menuOpen}
                    className={[
                        "ml-auto flex h-10 w-10 items-center justify-center",
                        "border border-[var(--color-border)] bg-[var(--color-card-bg)]",
                        "text-[var(--color-heading)] transition-all duration-200",
                        "hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
                        "lg:hidden",
                    ].join(" ")}
                >
                    {menuOpen ? <X size={19} strokeWidth={1.8} /> : <Menu size={19} strokeWidth={1.8} />}
                </button>
            </div>

            {/* ================================================================
          MOBILE MENU
      ================================================================ */}
            {menuOpen && (
                <MobileMenu
                    user={user}
                    initial={initial}
                    onNavClick={closeMenus}
                    onBookNow={handleBookNow}
                    onLogout={handleLogout}
                />
            )}
        </header>
    );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Brand({ onClick }: { onClick: () => void }) {
    return (
        <Link
            href="/"
            onClick={onClick}
            className="group flex shrink-0 items-center gap-3"
            aria-label="The Black Wash home"
        >
            <div className={[
                "relative flex h-9 w-9 items-center justify-center",
                "border border-[var(--color-primary)] bg-[var(--color-primary)]",
                "transition-transform duration-300 group-hover:scale-95",
            ].join(" ")}>
                <span className="font-heading text-sm font-bold tracking-tight text-[var(--color-black)]">
                    BW
                </span>
            </div>

            <div className="hidden flex-col leading-none min-[380px]:flex">
                <span className="font-heading text-[13px] font-semibold tracking-[0.12em] text-[var(--color-heading)] sm:text-sm">
                    THE BLACK WASH
                </span>
                <span className="mt-1 text-[8px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-light)] sm:text-[9px]">
                    Doorstep Car Care · Hazaribagh
                </span>
            </div>
        </Link>
    );
}

function DesktopNavLink({
    link,
    isFirst,
}: {
    link: { label: string; href: string };
    isFirst: boolean;
}) {
    return (
        <Link
            href={link.href}
            className={[
                "group relative py-2",
                "text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors duration-200",
                isFirst
                    ? "text-[var(--color-heading)]"
                    : "text-[var(--color-text)] hover:text-[var(--color-heading)]",
            ].join(" ")}
        >
            {link.label}
            <span className={[
                "absolute -bottom-0.5 left-0 h-px bg-[var(--color-primary)] transition-all duration-300",
                isFirst ? "w-full" : "w-0 group-hover:w-full",
            ].join(" ")} />
        </Link>
    );
}

function BookButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "group flex h-10 items-center gap-2 px-4",
                "border border-[var(--color-primary)] bg-[var(--color-primary)]",
                "font-sans text-xs font-bold text-[var(--color-black)]",
                "transition-all duration-200",
                "hover:border-[var(--color-primary-hover)] hover:bg-[var(--color-primary-hover)]",
            ].join(" ")}
        >
            <span>Book a Wash</span>
            <ArrowUpRight
                size={15}
                strokeWidth={2.2}
                className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
        </button>
    );
}

// Profile dropdown uses forwardRef so parent can detect outside clicks
import { forwardRef } from "react";

const ProfileDropdown = forwardRef<
    HTMLDivElement,
    {
        user: { fullname?: string; email?: string } | null;
        initial: string;
        open: boolean;
        onToggle: () => void;
        onClose: () => void;
        onLogout: () => void;
    }
>(({ user, initial, open, onToggle, onClose, onLogout }, ref) => (
    <div className="relative" ref={ref}>
        <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-haspopup="true"
            aria-label="Open profile menu"
            className={[
                "flex h-10 items-center gap-2 px-2.5",
                "border border-[var(--color-border)] bg-[var(--color-card-bg)]",
                "transition-all duration-200 hover:border-[var(--color-border-hover)]",
            ].join(" ")}
        >
            <span className="flex h-7 w-7 items-center justify-center bg-[var(--color-primary)] font-heading text-[11px] font-bold text-[var(--color-black)]">
                {initial}
            </span>
            <span className="hidden max-w-[110px] truncate text-xs font-semibold text-[var(--color-heading)] 2xl:block">
                {user?.fullname || "Account"}
            </span>
            <ChevronDown
                size={13}
                className={[
                    "text-[var(--color-text-light)] transition-transform duration-200",
                    open ? "rotate-180" : "",
                ].join(" ")}
            />
        </button>

        {open && (
            <div className={[
                "absolute right-0 top-full mt-2 w-60 overflow-hidden",
                "border border-[var(--color-border)] bg-[var(--color-card-bg)]",
                "shadow-[var(--shadow-card)]",
            ].join(" ")}>
                {/* User info */}
                <div className="border-b border-[var(--color-divider)] px-4 py-4">
                    <p className="truncate text-sm font-semibold text-[var(--color-heading)]">
                        {user?.fullname || "User"}
                    </p>
                    <p className="mt-1 truncate text-xs text-[var(--color-text-light)]">
                        {user?.email || ""}
                    </p>
                </div>

                {/* Menu items */}
                <div className="p-1.5">
                    <Link
                        href="/my-booking"
                        onClick={onClose}
                        className={[
                            "flex items-center gap-3 px-3 py-2.5",
                            "text-xs font-semibold text-[var(--color-text)]",
                            "transition-colors hover:bg-[var(--color-card-hover)] hover:text-[var(--color-heading)]",
                        ].join(" ")}
                    >
                        <CalendarDays size={15} strokeWidth={1.8} />
                        <span>My Bookings</span>
                    </Link>

                    <button
                        type="button"
                        onClick={onLogout}
                        className={[
                            "flex w-full items-center gap-3 px-3 py-2.5",
                            "text-xs font-semibold text-[var(--color-text)]",
                            "transition-colors hover:bg-[var(--color-card-hover)] hover:text-red-400",
                        ].join(" ")}
                    >
                        <LogOut size={15} strokeWidth={1.8} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        )}
    </div>
));
ProfileDropdown.displayName = "ProfileDropdown";

function MobileMenu({
    user,
    initial,
    onNavClick,
    onBookNow,
    onLogout,
}: {
    user: { fullname?: string; email?: string } | null;
    initial: string;
    onNavClick: () => void;
    onBookNow: () => void;
    onLogout: () => void;
}) {
    return (
        <div className={[
            "mx-auto mt-2 max-w-[1400px] p-3",
            "border border-[var(--color-border)] bg-[rgba(8,10,12,0.98)]",
            "shadow-[var(--shadow-card)] lg:hidden",
        ].join(" ")}>

            {/* User info */}
            <div className="mb-2 flex items-center gap-3 border-b border-[var(--color-divider)] px-2 pb-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--color-primary)] font-heading text-xs font-bold text-[var(--color-black)]">
                    {initial}
                </span>
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--color-heading)]">
                        {user?.fullname || "User"}
                    </p>
                    {user?.email && (
                        <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-light)]">
                            {user.email}
                        </p>
                    )}
                </div>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col" aria-label="Mobile navigation">
                {NAV_LINKS.map((link, index) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        onClick={onNavClick}
                        className={[
                            "flex items-center justify-between",
                            "border-b border-[var(--color-divider)] px-2 py-3.5",
                            "text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
                            index === 0
                                ? "text-[var(--color-primary)]"
                                : "text-[var(--color-text)] hover:text-[var(--color-heading)]",
                        ].join(" ")}
                    >
                        <span>{link.label}</span>
                        {index === 0 && <span className="h-1.5 w-1.5 bg-[var(--color-primary)]" />}
                    </Link>
                ))}

                <Link
                    href="/my-booking"
                    onClick={onNavClick}
                    className={[
                        "flex items-center gap-3",
                        "border-b border-[var(--color-divider)] px-2 py-3.5",
                        "text-xs font-semibold uppercase tracking-[0.12em]",
                        "text-[var(--color-text)] transition-colors hover:text-[var(--color-heading)]",
                    ].join(" ")}
                >
                    <CalendarDays size={15} strokeWidth={1.8} />
                    <span>My Bookings</span>
                </Link>
            </nav>

            {/* Actions */}
            <div className="mt-3 flex flex-col gap-2">
                <button
                    type="button"
                    onClick={onBookNow}
                    className={[
                        "flex h-11 w-full items-center justify-center gap-2",
                        "bg-[var(--color-primary)]",
                        "text-xs font-bold text-[var(--color-black)]",
                        "transition-colors hover:bg-[var(--color-primary-hover)]",
                    ].join(" ")}
                >
                    <span>Book a Wash</span>
                    <ArrowUpRight size={15} />
                </button>

                <button
                    type="button"
                    onClick={onLogout}
                    className={[
                        "flex h-11 w-full items-center justify-center gap-2",
                        "border border-[var(--color-border)] bg-transparent",
                        "text-xs font-semibold text-[var(--color-text)]",
                        "transition-colors hover:border-red-400/40 hover:text-red-400",
                    ].join(" ")}
                >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
}