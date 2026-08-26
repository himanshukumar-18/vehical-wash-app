import Link from "next/link";
import { ArrowLeft, CarFront, Home, Wrench } from "lucide-react";

export const metadata = {
  title: "404 - Page Not Found | The Black Wash",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050708] px-5 py-24 text-center">
      <div className="mx-auto max-w-md border border-[#26313A] bg-[#0D1115] p-8 sm:p-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#19C7F3]/10 text-[#19C7F3]">
          <CarFront size={32} />
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#19C7F3]">
          Error 404
        </p>

        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-[#F5F7F8] sm:text-4xl">
          Page Not Found
        </h1>

        <p className="mt-4 text-xs leading-6 text-[#A7B0B7] sm:text-sm">
          The vehicle detailing page or resource you are looking for has been moved or does not exist.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 bg-[#19C7F3] px-6 text-xs font-bold uppercase tracking-[0.1em] text-[#050708] transition hover:bg-[#0FA9D1]"
          >
            <Home size={16} />
            Return to Homepage
          </Link>

          <Link
            href="/#services"
            className="inline-flex h-11 items-center justify-center gap-2 border border-[#26313A] bg-[#080A0C] px-6 text-xs font-bold uppercase tracking-[0.1em] text-[#F5F7F8] transition hover:border-[#19C7F3]/50 hover:text-[#19C7F3]"
          >
            <Wrench size={16} />
            Explore Services
          </Link>
        </div>
      </div>
    </div>
  );
}
