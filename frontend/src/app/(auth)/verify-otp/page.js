"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    MailCheck,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

import { verifyOtp } from "../../../lib/authSlice";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

function VerifyOTPForm() {
    const dispatch = useDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const emailFromUrl = searchParams.get("email") ?? "";

    const {
        loading,
        error: reduxError,
    } = useSelector((state) => state.auth);

    const [email, setEmail] = useState(emailFromUrl);
    const [otp, setOtp] = useState("");
    const [localError, setLocalError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLocalError("");

        if (otp.length !== 6) {
            setLocalError(
                "Please enter the complete 6-digit verification code."
            );
            return;
        }

        try {
            await dispatch(
                verifyOtp({
                    email: email.trim(),
                    otp,
                })
            ).unwrap();

            router.push("/login");
        } catch (err) {
            setLocalError(
                err?.error ||
                err?.message ||
                "OTP verification failed. Please try again."
            );
        }
    };

    const error =
        localError ||
        (typeof reduxError === "string"
            ? reduxError
            : reduxError?.error ||
            reduxError?.message);

    return (
        <main className="min-h-screen bg-[var(--color-page-bg)]">
            <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
                {/* LEFT BRAND PANEL */}
                <section className="relative hidden overflow-hidden bg-[var(--color-footer-bg)] text-white lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:p-12 xl:p-16">
                    <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[var(--color-primary)] opacity-[0.07] blur-[100px]" />
                    <div className="pointer-events-none absolute -bottom-48 -left-48 h-[550px] w-[550px] rounded-full bg-[var(--color-primary)] opacity-[0.04] blur-[110px]" />

                    <div className="relative z-10">
                        <a href="#" aria-label="The Black Wash home" className="inline-flex items-center gap-3 text-2xl font-extrabold tracking-[-0.06em]">
                            <span className="flex h-10 w-10 items-center justify-center bg-[var(--color-primary)] text-base font-black text-black">BW</span>
                            The Black <span className="text-[var(--color-primary)]">Wash</span>
                        </a>
                    </div>

                    <div className="relative z-10 max-w-[620px]">
                        <div className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-primary)]">
                            <MailCheck size={15} />
                            Almost There
                        </div>

                        <h2 className="max-w-[600px] text-5xl font-semibold leading-[0.98] tracking-[-0.065em] text-white xl:text-7xl">
                            One quick step.
                            <br />
                            <span className="text-white/45">Then you're in.</span>
                        </h2>

                        <p className="mt-7 max-w-[500px] text-base leading-7 text-white/50">
                            Verify your email to activate your account and start managing your car care services.
                        </p>

                        <div className="mt-10 space-y-4">
                            {["Secure email verification", "Protect your account", "Start booking instantly"].map((item) => (
                                <div key={item} className="flex items-center gap-3 text-sm font-medium text-white/70">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-white/[0.08] text-[var(--color-primary)]">
                                        <CheckCircle2 size={14} />
                                    </span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
                        <span>Verify</span>
                        <span>Activate</span>
                        <span>Drive</span>
                    </div>
                </section>

                {/* RIGHT VERIFICATION PANEL */}
                <section className="flex min-h-screen flex-col bg-[var(--color-page-bg)]">
                    <div className="flex items-center justify-between px-5 py-5 sm:px-8 lg:hidden">
                        <a href="#" className="inline-flex items-center gap-2.5 text-xl font-extrabold text-[var(--color-heading)]">
                            <span className="flex h-9 w-9 items-center justify-center bg-[var(--color-primary)] text-sm font-black text-black">BW</span>
                            The Black <span className="text-[var(--color-primary)]">Wash</span>
                        </a>

                        <button
                            type="button"
                            onClick={() => router.push("/login")}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-text)] hover:text-[var(--color-primary)]"
                        >
                            Sign in <ArrowRight size={13} />
                        </button>
                    </div>

                    <div className="flex flex-1 items-center px-5 py-10 sm:px-8 sm:py-14 lg:px-14 xl:px-20">
                        <div className="mx-auto w-full max-w-[470px]">
                            <div className="mb-9">
                                <div className="mb-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                                    <MailCheck size={15} />
                                    Account Verification
                                </div>

                                <h1 className="text-4xl font-semibold leading-[1] tracking-[-0.06em] text-[var(--color-heading)] sm:text-5xl">
                                    Verify your<br />email.
                                </h1>

                                <p className="mt-5 max-w-[430px] text-sm leading-6 text-[var(--color-text)] sm:text-base">
                                    We sent a 6-digit verification code to your email. Enter it below to activate your account.
                                </p>
                            </div>

                            {error && (
                                <div role="alert" className="mb-6 flex items-start gap-3 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-600">
                                    <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <Input
                                    label="Email address"
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    required
                                    disabled={loading}
                                    leftIcon={<span aria-hidden="true">@</span>}
                                />

                                <div>
                                    <Input
                                        label="Verification code"
                                        type="text"
                                        name="otp"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        maxLength={6}
                                        required
                                        disabled={loading}
                                        hint="Enter the 6-digit code from your email."
                                        className="text-center text-2xl font-bold tracking-[0.45em]"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    fullWidth
                                    size="lg"
                                    loading={loading}
                                    className="mt-2 !rounded-none !bg-[var(--color-primary)] hover:!bg-[var(--color-primary-hover)]"
                                >
                                    {loading ? "Verifying..." : "Verify Email"}
                                </Button>
                            </form>

                            <div className="mt-9 flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                                <button
                                    type="button"
                                    onClick={() => router.push("/login")}
                                    className="group inline-flex items-center justify-center gap-2 text-sm font-bold text-[var(--color-heading)] hover:text-[var(--color-primary)]"
                                >
                                    <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
                                    Back to sign in
                                </button>
                            </div>

                            <div className="mt-12 grid grid-cols-3 border-y border-[var(--color-border)] py-5">
                                <div className="flex items-center gap-2">
                                    <MailCheck size={16} className="text-[var(--color-primary)]" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-light)]">Verify</span>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <ShieldCheck size={16} className="text-[var(--color-primary)]" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-light)]">Secure</span>
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    <Sparkles size={16} className="text-[var(--color-primary)]" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-light)]">Ready</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden items-center justify-between px-14 pb-7 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-light)] xl:flex xl:px-20">
                        <span>© {new Date().getFullYear()} The Black Wash</span>
                        <span>Premium Car Care</span>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-white">Loading...</div>}>
            <VerifyOTPForm />
        </Suspense>
    );
}