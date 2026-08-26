"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowRight,
    CarFront,
    CheckCircle2,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

import { registerUser } from "../../../lib/authSlice";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

const BENEFITS = [
    "Book professional car care",
    "Manage your vehicles",
    "Track your wash history",
];

const TRUST_ITEMS = [
    { icon: CarFront, label: "Easy", justify: "justify-start" },
    { icon: ShieldCheck, label: "Secure", justify: "justify-center" },
    { icon: Sparkles, label: "Premium", justify: "justify-end" },
];

const Logo = ({ size = "text-2xl", boxSize = "h-10 w-10", boxTextColor = "" }) => (
    <a
        href="#"
        aria-label="The Black Wash home"
        className={`inline-flex items-center gap-3 ${size} font-extrabold tracking-[-0.06em]`}
    >
        <span className={`flex ${boxSize} items-center justify-center bg-[var(--color-primary)] text-[var(--color-black)] font-black ${boxTextColor}`}>
            BW
        </span>
        The Black <span className="text-[var(--color-primary)]">Wash</span>
    </a>
);

export default function RegisterPage() {
    const dispatch = useDispatch();
    const router = useRouter();

    const { loading, error } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        password: "",
    });
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [termsError, setTermsError] = useState(null);

    const handleChange = (e) => {
        setFormData((previous) => ({
            ...previous,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTermsError(null);

        if (!termsAccepted) {
            setTermsError("You must agree to the Terms & Conditions to create an account.");
            return;
        }

        const result = await dispatch(registerUser(formData));

        if (registerUser.fulfilled.match(result)) {
            router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
        }
    };

    return (
        <main className="h-screen overflow-hidden bg-[var(--color-page-bg)]">
            <div className="grid h-full lg:grid-cols-[0.95fr_1.05fr]">
                {/* ===================== LEFT BRAND PANEL ===================== */}
                <section className="relative hidden overflow-hidden bg-[var(--color-footer-bg)] text-white lg:flex lg:h-full lg:flex-col lg:justify-between lg:p-10 xl:p-14">
                    {/* Background glow */}
                    <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[var(--color-primary)] opacity-[0.07] blur-[100px]" />
                    <div className="pointer-events-none absolute -bottom-48 -left-48 h-[550px] w-[550px] rounded-full bg-[var(--color-primary)] opacity-[0.04] blur-[110px]" />

                    {/* Brand */}
                    <div className="relative z-10 shrink-0">
                        <Logo />
                    </div>

                    {/* Main content */}
                    <div className="relative z-10 max-w-[620px] overflow-hidden">
                        <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-primary)]">
                            <Sparkles size={14} />
                            Start Your Journey
                        </div>

                        <h2 className="max-w-[600px] text-4xl font-semibold leading-[0.98] tracking-[-0.065em] text-white xl:text-6xl">
                            Better care.
                            <br />
                            <span className="text-white/45">Better drives.</span>
                        </h2>

                        <p className="mt-5 max-w-[500px] text-sm leading-6 text-white/50 xl:text-base">
                            Create your account and make professional car care easier
                            to manage.
                        </p>

                        {/* Benefits */}
                        <div className="mt-7 space-y-3">
                            {BENEFITS.map((item) => (
                                <div key={item} className="flex items-center gap-3 text-sm font-medium text-white/70">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-white/[0.08] text-[var(--color-primary)]">
                                        <CheckCircle2 size={14} />
                                    </span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom tags */}
                    <div className="relative z-10 flex shrink-0 items-center gap-8 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
                        <span>Clean</span>
                        <span>Protect</span>
                        <span>Shine</span>
                    </div>
                </section>

                {/* ===================== RIGHT REGISTER PANEL ===================== */}
                <section className="flex h-full flex-col overflow-hidden bg-[var(--color-page-bg)]">
                    {/* Mobile brand bar */}
                    <div className="flex shrink-0 items-center justify-between px-5 py-4 sm:px-8 lg:hidden">
                        <Logo size="text-xl" boxSize="h-9 w-9" boxTextColor="text-white" />

                        <Link
                            href="/login"
                            className="text-xs font-bold text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)]"
                        >
                            Sign in
                        </Link>
                    </div>

                    {/* Register content */}
                    <div className="flex flex-1 items-center overflow-y-auto px-5 py-6 sm:px-8 lg:px-14 xl:px-20">
                        <div className="mx-auto w-full max-w-[470px]">
                            {/* Heading */}
                            <div className="mb-6">
                                <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                                    <CarFront size={15} />
                                    Get Started
                                </div>

                                <h1 className="text-3xl font-semibold leading-[1.05] tracking-[-0.06em] text-[var(--color-heading)] sm:text-4xl">
                                    Create your
                                    <br />
                                    account.
                                </h1>

                                <p className="mt-3 max-w-[420px] text-sm leading-6 text-[var(--color-text)]">
                                    Join The Black Wash to book services, manage your
                                    vehicles, and keep your car care history organized.
                                </p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div
                                    role="alert"
                                    className="mb-5 flex items-start gap-3 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                                >
                                    <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                                    <span>
                                        {typeof error === "string"
                                            ? error
                                            : error?.message || "Registration failed. Please try again."}
                                    </span>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    label="Full name"
                                    type="text"
                                    name="fullname"
                                    placeholder="Your full name"
                                    value={formData.fullname}
                                    onChange={handleChange}
                                    autoComplete="name"
                                    required
                                    disabled={loading}
                                    leftIcon={<span aria-hidden="true">Aa</span>}
                                />

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
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    required
                                    disabled={loading}
                                    hint="Use at least 8 characters."
                                    leftIcon={<span aria-hidden="true">•</span>}
                                />

                                {/* Terms Consent Checkbox */}
                                <div className="pt-2">
                                    <label className="flex items-start gap-3 cursor-pointer text-xs text-[var(--color-text)]">
                                        <input
                                            type="checkbox"
                                            checked={termsAccepted}
                                            onChange={(e) => {
                                                setTermsAccepted(e.target.checked);
                                                if (e.target.checked) setTermsError(null);
                                            }}
                                            className="mt-0.5 h-4 w-4 rounded border-gray-700 bg-[var(--color-card-bg)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                        />
                                        <span>
                                            I agree to the{" "}
                                            <Link href="/terms-and-conditions" className="font-bold text-[var(--color-primary)] hover:underline" target="_blank">
                                                Terms & Conditions
                                            </Link>{" "}
                                            and Privacy Policy.
                                        </span>
                                    </label>
                                    {termsError && (
                                        <p className="mt-1 text-xs font-semibold text-red-400">{termsError}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    fullWidth
                                    size="lg"
                                    loading={loading}
                                    className="mt-1 !rounded-none !bg-[var(--color-primary)] hover:!bg-[var(--color-primary-hover)]"
                                >
                                    {loading ? "Creating account..." : "Create Account"}
                                </Button>
                            </form>

                            {/* Login */}
                            <div className="mt-6 flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                                <p className="text-sm text-[var(--color-text)]">Already have an account?</p>

                                <Link
                                    href="/login"
                                    className="group inline-flex items-center justify-center gap-2 text-sm font-bold text-[var(--color-heading)] transition-colors hover:text-[var(--color-primary)]"
                                >
                                    Sign in
                                    <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                                </Link>
                            </div>

                            {/* Trust strip */}
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

                    {/* Desktop footer */}
                    <div className="hidden shrink-0 items-center justify-between px-14 pb-5 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-light)] xl:flex xl:px-20">
                        <span>© {new Date().getFullYear()} The Black Wash</span>
                        <span>Premium Car Care</span>
                    </div>
                </section>
            </div>
        </main>
    );
}