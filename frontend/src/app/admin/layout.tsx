"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
    Bell,
    CalendarDays,
    CreditCard,
    LayoutDashboard,
    Image as ImageIcon,
    LogOut,
    Menu,
    MessageSquare,
    Tag,
    MapPin,
    TrendingUp,
    Users,
    Wrench,
    X,
} from "lucide-react";

import AdminNotificationBell from "@/components/admin/AdminNotificationBell";
import { logoutUser, fetchProfile } from "../../lib/authSlice";


// ============================================================
// Navigation
// ============================================================

const sidebarLinks = [
    {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        label: "Bookings",
        href: "/admin/bookings",
        icon: CalendarDays,
    },
    {
        label: "Services",
        href: "/admin/services",
        icon: Wrench,
    },
    {
        label: "Customers",
        href: "/admin/customers",
        icon: Users,
    },
    {
        label: "Payments",
        href: "/admin/payments",
        icon: CreditCard,
    },
    {
        label: "Image CMS",
        href: "/admin/images",
        icon: ImageIcon,
    },
    {
        label: "Offers",
        href: "/admin/offers",
        icon: Tag,
    },
    {
        label: "Service Areas",
        href: "/admin/service-areas",
        icon: MapPin,
    },
    {
        label: "Analytics",
        href: "/admin/analytics",
        icon: TrendingUp,
    },
    {
        label: "Testimonials",
        href: "/admin/testimonials",
        icon: MessageSquare,
    },
];


// ============================================================
// Types
// ============================================================

type RootState = {
    auth: {
        user: {
            fullname?: string;
            email?: string;
            role?: string;
        } | null;
    };
};


// ============================================================
// Admin Layout
// ============================================================

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();

    const { user } = useSelector(
        (state: RootState) => state.auth
    );

    const [isMobileMenuOpen, setIsMobileMenuOpen] =
        useState(false);

    const [isLoggingOut, setIsLoggingOut] =
        useState(false);


    // ========================================================
    // Fetch profile
    // ========================================================

    useEffect(() => {
        dispatch(fetchProfile() as any);
    }, [dispatch]);


    // ========================================================
    // Close mobile navigation when route changes
    // ========================================================

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);


    // ========================================================
    // Logout
    // ========================================================

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);

        try {
            await dispatch(logoutUser() as any);

            router.replace("/login");
        } finally {
            setIsLoggingOut(false);
        }
    };


    // ========================================================
    // Sidebar
    // ========================================================

    const SidebarContent = () => {
        return (
            <div className="flex h-full flex-col">

                {/* ==================================================
                    BRAND
                ================================================== */}

                <div className="px-5 py-6 sm:px-6">

                    <Link
                        href="/admin"
                        className="flex items-center gap-3"
                    >

                        <span
                            className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                bg-[var(--color-primary)]
                                text-sm
                                font-black
                                text-white
                            "
                        >
                            B
                        </span>

                        <div className="min-w-0">

                            <p
                                className="
                                    truncate
                                    text-[17px]
                                    font-bold
                                    tracking-[-0.04em]
                                    text-white
                                "
                            >
                                The Black Wash
                            </p>

                            <p
                                className="
                                    mt-0.5
                                    text-[9px]
                                    font-semibold
                                    uppercase
                                    tracking-[0.18em]
                                    text-white/40
                                "
                            >
                                Management
                            </p>

                        </div>

                    </Link>

                </div>


                {/* ==================================================
                    NAVIGATION
                ================================================== */}

                <nav className="flex-1 px-3 py-3 sm:px-4">

                    <p
                        className="
                            px-3
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.18em]
                            text-white/30
                        "
                    >
                        Workspace
                    </p>


                    <div className="space-y-1 mt-2">

                        {sidebarLinks.map((link) => {
                            const Icon = link.icon;

                            const isActive =
                                pathname === link.href ||
                                (
                                    link.href !== "/admin" &&
                                    pathname.startsWith(
                                        `${link.href}/`
                                    )
                                );

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`
                                        relative
                                        flex
                                        min-h-[46px]
                                        items-center
                                        gap-3
                                        px-3
                                        text-sm
                                        font-semibold
                                        transition-none
                                        ${isActive
                                            ? `
                                                    bg-[var(--color-primary)]
                                                    text-white
                                                `
                                            : `
                                                    text-white/55
                                                    hover:bg-white/[0.05]
                                                    hover:text-white
                                                `
                                        }
                                    `}
                                >

                                    {isActive && (
                                        <span
                                            className="
                                                absolute
                                                left-0
                                                top-0
                                                h-full
                                                w-[3px]
                                                bg-white
                                            "
                                        />
                                    )}

                                    <Icon
                                        size={18}
                                        strokeWidth={1.8}
                                        className={
                                            isActive
                                                ? "text-white"
                                                : "text-white/50"
                                        }
                                    />

                                    <span className="flex-1">
                                        {link.label}
                                    </span>

                                </Link>
                            );
                        })}

                    </div>

                </nav>


                {/* ==================================================
                    USER AREA
                ================================================== */}

                <div className="p-3 sm:p-4">

                    <div
                        className="
                            bg-white/[0.04]
                            p-3
                        "
                    >

                        {/* User */}

                        <div className="flex items-center gap-3">

                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    bg-[var(--color-primary)]
                                    text-sm
                                    font-bold
                                    text-white
                                "
                            >
                                {(user?.fullname || "A")
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>


                            <div className="min-w-0 mb-3">

                                <p
                                    className="
                                        truncate
                                        text-sm
                                        font-semibold
                                        text-white
                                    "
                                >
                                    {user?.fullname ||
                                        "Administrator"}
                                </p>

                                <p
                                    className="
                                        mt-0.5
                                        truncate
                                        text-[11px]
                                        text-white/40
                                    "
                                >
                                    {user?.role || "Manager"}
                                </p>

                            </div>

                        </div>


                        {/* Email */}

                        <p
                            className="
                                mt-3
                                truncate
                                border-t
                                border-white/10
                                pt-3
                                text-[11px]
                                text-white/35
                            "
                        >
                            {user?.email ||
                                "admin@theblackwash.com"}
                        </p>


                        {/* Logout */}

                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="
                                mt-3
                                flex
                                min-h-[42px]
                                w-full
                                items-center
                                justify-center
                                gap-2
                                bg-white/[0.06]
                                px-3
                                text-xs
                                font-semibold
                                text-white/65
                                transition-none
                                hover:bg-white/[0.1]
                                hover:text-white
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            <LogOut size={15} />

                            {isLoggingOut
                                ? "Signing out..."
                                : "Sign out"}

                        </button>

                    </div>

                </div>

            </div>
        );
    };


    // ============================================================
    // Render
    // ============================================================

    return (
        <div
            className="
                min-h-screen
                bg-[var(--color-section-bg)]
                text-[var(--color-heading)]
            "
        >

            {/* ====================================================
                DESKTOP SIDEBAR
            ==================================================== */}

            <aside
                className="
                    fixed
                    inset-y-0
                    left-0
                    z-40
                    hidden
                    w-[240px]
                    bg-[var(--color-footer-bg)]
                    lg:block
                "
            >
                <SidebarContent />
            </aside>


            {/* ====================================================
                MOBILE / TABLET DRAWER
            ==================================================== */}

            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden">

                    {/* Overlay */}

                    <button
                        type="button"
                        aria-label="Close navigation"
                        onClick={() =>
                            setIsMobileMenuOpen(false)
                        }
                        className="
                            absolute
                            inset-0
                            cursor-default
                            bg-black/50
                        "
                    />


                    {/* Drawer */}

                    <aside
                        className="
                            absolute
                            inset-y-0
                            left-0
                            flex
                            w-[280px]
                            max-w-[85vw]
                            flex-col
                            bg-[var(--color-footer-bg)]
                        "
                    >

                        {/* Close */}

                        <button
                            type="button"
                            aria-label="Close navigation"
                            onClick={() =>
                                setIsMobileMenuOpen(false)
                            }
                            className="
                                absolute
                                right-3
                                top-4
                                z-10
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                bg-white/[0.07]
                                text-white/60
                                hover:bg-white/[0.12]
                                hover:text-white
                            "
                        >
                            <X size={18} />
                        </button>


                        <SidebarContent />

                    </aside>

                </div>
            )}


            {/* ====================================================
                MAIN CONTENT
            ==================================================== */}

            <div className="lg:pl-[240px]">

                {/* ==================================================
                    TOP HEADER
                ================================================== */}

                <header
                    className="
        sticky
        top-0
        z-30
        bg-[var(--color-section-bg)]
    "
                >
                    <div
                        className="
            flex
            h-[64px]
            items-center
            justify-between
            px-4
            sm:px-6
            lg:px-8
        "
                    >
                        {/* ==================================================
            MOBILE MENU
        ================================================== */}

                        <button
                            type="button"
                            aria-label="Open navigation"
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="
                flex
                h-10
                w-10
                items-center
                justify-center
                bg-[var(--color-card-bg)]
                text-[var(--color-heading)]
                lg:hidden
            "
                        >
                            <Menu size={19} strokeWidth={1.8} />
                        </button>


                        {/* ==================================================
            DESKTOP CONTEXT
        ================================================== */}

                        <div className="hidden lg:block">

                            <p
                                className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-[var(--color-text-light)]
                "
                            >
                                The Black Wash
                            </p>

                            <p
                                className="
                    mt-0.5
                    text-sm
                    font-semibold
                    tracking-[-0.02em]
                    text-[var(--color-heading)]
                "
                            >
                                Management Dashboard
                            </p>

                        </div>


                        {/* ==================================================
            MOBILE BRAND
        ================================================== */}

                        <div
                            className="
                absolute
                left-1/2
                -translate-x-1/2
                lg:hidden
            "
                        >
                            <div className="flex items-center text-center gap-2.5">
                                <div>

                                    <p
                                        className="
                            whitespace-nowrap
                            text-sm
                            font-bold
                            tracking-[-0.04em]
                            text-[var(--color-heading)]
                        "
                                    >
                                        The Black Wash
                                    </p>

                                    <p
                                        className="
                            hidden
                            text-[7px]
                            font-semibold
                            uppercase
                            tracking-[0.15em]
                            text-[var(--color-text-light)]
                            min-[400px]:block
                        "
                                    >
                                        Management
                                    </p>

                                </div>

                            </div>
                        </div>


                        {/* ==================================================
            HEADER ACTIONS
        ================================================== */}

                        <div className="ml-auto flex items-center gap-2">

                            <AdminNotificationBell />

                        </div>

                    </div>
                </header>


                {/* ==================================================
                    PAGE CONTENT
                ================================================== */}

                <main
                    className="
                        min-h-[calc(100vh-64px)]
                        px-4
                        py-5
                        sm:px-6
                        sm:py-6
                        lg:px-8
                        lg:py-8
                    "
                >

                    <div className="mx-auto w-full max-w-[1600px]">
                        {children}
                    </div>

                </main>

            </div>

        </div>
    );
}