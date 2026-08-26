"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SlotsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/bookings");
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center text-xs text-[#707A82]">
      Redirecting to Bookings management...
    </div>
  );
}