"use client";

import { Suspense, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import {
    ArrowRight,
    CarFront,
    CheckCircle2,
    Droplets,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

import { loginUser, fetchProfile } from "../../../lib/authSlice";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

const BENEFITS = [
    "Professional car care",
    "Easy online booking",
    "Trusted service experience",
];

const TRUST_ITEMS = [
    { icon: Droplets, label: "Clean", justify: "justify-start" },
    { icon: ShieldCheck, label: "Safe", justify: "justify-center" },
    { icon: Sparkles, label: "Premium", justify: "justify-end" },
];

const Logo = ({
    size = "text-2xl",
    boxSize = "h-10 w-10",
}) => (
    <a
        href="#"
        aria-label="The Black Wash"
        className={`inline-flex items-center gap-3 ${size} font-extrabold tracking-[-0.06em]`}
    >
        <span
            className={`
                flex
                ${boxSize}
                shrink-0
                items-center
                justify-center
                bg-[var(--color-primary)]
                text-base
                font-black
                text-[var(--color-black)]
            `}
        >
            BW
        </span>

        <span className="text-[var(--color-heading)]">
            The Black
        </span>

        <span className="text-[var(--color-primary)]">
            Wash
        </span>
    </a>
);

function LoginForm() {
    const dispatch = useDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const { loading, error } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData((previous) => ({
            ...previous,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const loginResult = await dispatch(loginUser(formData));

        if (!loginUser.fulfilled.match(loginResult)) {
            return;
        }

        const profileResult = await dispatch(fetchProfile());

        if (fetchProfile.fulfilled.match(profileResult)) {
            const role = profileResult.payload.role;

            Cookies.set("role", role);

            const nextFromQuery =
                searchParams?.get("next") || searchParams?.get("redirect");

            if (nextFromQuery && nextFromQuery.startsWith("/")) {
                router.push(nextFromQuery);
            } else if (role === "admin") {
                router.push("/admin");
            } else {
                router.push("/");
            }
        }
    };

    return (
        <main className="h-screen overflow-hidden bg-[var(--color-page-bg)]">
            <div className="grid h-full lg:grid-cols-[0.95fr_1.05fr]">
                {/* LEFT BRAND PANEL */}
                <section className="relative hidden overflow-hidden bg-[var(--color-footer-bg)] text-white lg:flex lg:h-full lg:flex-col lg:justify-between lg:p-10 xl:p-14">
                    <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[var(--color-primary)] opacity-[0.07] blur-[100px]" />
                    <div className="pointer-events-none absolute -bottom-48 -left-48 h-[550px] w-[550px] rounded-full bg-[var(--color-primary)] opacity-[0.04] blur-[110px]" />

                    <div className="relative z-10 shrink-0">
                        <Logo />
                    </div>

                    <div className="relative z-10 max-w-[620px] overflow-hidden">
                        <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-primary)]">
                            <Sparkles size={14} />
                            Premium Car Care
                        </div>

                        <h2 className="max-w-[600px] text-4xl font-semibold leading-[0.98] tracking-[-0.065em] text-white xl:text-6xl">
                            Your car.
                            <br />
                            <span className="text-white/45">Always looking</span>
                            <br />
                            its best.
                        </h2>

                        <p className="mt-5 max-w-[500px] text-sm leading-6 text-white/50 xl:text-base">
                            Manage your bookings, vehicles, services, and wash history from one simple place.
                        </p>

                        <div className="mt-7 space-y-3">
                            {BENEFITS.map((item) => (
                                <div key={item} className="flex items-center gap-3 text-sm font-medium text-white/70">
                                    <span className="flex h-6 w-6 items-center justify-center bg-white/[0.08] text-[var(--color-primary)]">
                                        <CheckCircle2 size={14} />
                                    </span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 flex shrink-0 items-center gap-8 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
                        <span>Clean</span>
                        <span>Protect</span>
                        <span>Shine</span>
                    </div>
                </section>

                {/* RIGHT LOGIN PANEL */}
                <section className="flex h-full flex-col overflow-hidden bg-[var(--color-page-bg)]">
                    <div className="flex shrink-0 items-center justify-between px-5 py-4 sm:px-8 lg:hidden">
                        <Logo size="text-xl" boxSize="h-9 w-9" />

                        <Link
                            href="/register"
                            className="text-xs font-bold text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)]"
                        >
                            Create account
                        </Link>
                    </div>

                    <div className="flex flex-1 items-center overflow-y-auto px-5 py-6 sm:px-8 lg:px-14 xl:px-20">
                        <div className="mx-auto w-full max-w-[470px]">
                            <div className="mb-6">
                                <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                                    <CarFront size={15} />
                                    Welcome back
                                </div>

                                <h1 className="text-3xl font-semibold leading-[1.05] tracking-[-0.06em] text-[var(--color-heading)] sm:text-4xl">
                                    Sign in to
                                    <br />
                                    your account.
                                </h1>

                                <p className="mt-3 max-w-[420px] text-sm leading-6 text-[var(--color-text)]">
                                    Access your bookings, vehicle details, and wash history in one place.
                                </p>
                            </div>

                            {error && (
                                <div
                                    role="alert"
                                    className="mb-5 flex items-start gap-3 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                                >
                                    <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                                    <span>
                                        {typeof error === "string"
                                            ? error
                                            : error?.message || "Login failed. Please try again."}
                                    </span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    label="Email address"
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    required
                                    disabled={loading}
                                    leftIcon={<span aria-hidden="true">@</span>}
                                />

                                <Input
                                    label="Password"
                                    type="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    required
                                    disabled={loading}
                                    leftIcon={<span aria-hidden="true">•</span>}
                                />

                                <div className="flex justify-end">
                                    <Link
                                        href="#"
                                        className="text-xs font-bold text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)]"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <Button
                                    type="submit"
                                    fullWidth
                                    loading={loading}
                                    size="lg"
                                    className="mt-1 !rounded-none !bg-[var(--color-primary)] hover:!bg-[var(--color-primary-hover)]"
                                >
                                    {loading ? "Signing in..." : "Sign In"}
                                </Button>
                            </form>

                            <div className="mt-6 flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                                <p className="text-sm text-[var(--color-text)]">New to The Black Wash?</p>

                                <Link
                                    href="/register"
                                    className="group inline-flex items-center justify-center gap-2 text-sm font-bold text-[var(--color-heading)] transition-colors hover:text-[var(--color-primary)]"
                                >
                                    Create an account
                                    <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                                </Link>
                            </div>

                            <div className="mt-8 grid grid-cols-3 border-y border-[var(--color-border)] py-4">
                                {TRUST_ITEMS.map(({ icon: Icon, label, justify }) => (
                                    <div key={label} className={`flex items-center ${justify} gap-2`}>
                                        <Icon size={16} className="text-[var(--color-primary)]" />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-light)]">
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="hidden shrink-0 items-center justify-between px-14 pb-5 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-light)] xl:flex xl:px-20">
                        <span>© {new Date().getFullYear()} The Black Wash</span>
                        <span>Premium Car Care</span>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-white">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}