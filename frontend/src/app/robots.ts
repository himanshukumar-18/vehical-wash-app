import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/admin/*",
        "/my-booking/",
        "/my-bookings/",
        "/my-booking/*",
        "/my-bookings/*",
        "/login/",
        "/register/",
        "/verify-otp/",
        "/api/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
