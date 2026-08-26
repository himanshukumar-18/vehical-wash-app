"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../lib/store";
import {
  fetchPublicImages,
  selectPublicImages,
} from "../../lib/slices/imageSlice";
import { useBooking } from "../../context/BookingProvider";

import { getDynamicImageSrc } from "../../lib/utils/imageUtils";
const FALLBACK_BANNER_BG = "https://res.cloudinary.com/dfhcp9orx/image/upload/v1787204157/the_black_wash/dynamic_images/hee3uzrjqpn0wn5fyucv.jpg";

export default function PromotionalBanner() {
  const dispatch = useDispatch<AppDispatch>();
  const { openBooking } = useBooking();
  const publicImages = useSelector(selectPublicImages);

  useEffect(() => {
    dispatch(fetchPublicImages());
  }, [dispatch]);

  const offerBanner = publicImages["offer_banner"];
  const bannerImage = getDynamicImageSrc(offerBanner);

  // If offer banner is not active or has no admin uploaded image, hide banner
  if (!offerBanner || !offerBanner.is_active || !bannerImage) {
    return null;
  }

  const badgeText = offerBanner.badge_tag || "SPECIAL OFFER";

  return (
    <div className="relative w-full overflow-hidden border-b border-[#19C7F3]/30 bg-[#050708]">
      {/* Background Banner Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bannerImage}
          alt={badgeText}
          fill
          priority
          className="object-cover opacity-30 blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050708] via-[#050708]/85 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-5 py-3 sm:flex-row sm:px-8 lg:px-12">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#19C7F3] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#050708]">
            <Sparkles className="h-3 w-3" />
            {badgeText}
          </span>
          <p className="text-xs font-semibold text-[#F5F7F8] sm:text-sm">
            {offerBanner.title !== "Festival / Seasonal Promotional Banner"
              ? offerBanner.title
              : "Exclusive Seasonal Detailing Offers Available Now!"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {offerBanner.link_url ? (
            <a
              href={offerBanner.link_url}
              className="inline-flex items-center gap-2 rounded-lg bg-[#19C7F3] px-4 py-1.5 text-xs font-bold text-[#050708] transition hover:bg-white"
            >
              Claim Offer <ArrowRight className="h-3.5 w-3.5" />
            </a>
          ) : (
            <button
              type="button"
              onClick={() => openBooking()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#19C7F3] px-4 py-1.5 text-xs font-bold text-[#050708] transition hover:bg-white"
            >
              Book Offer Now <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
