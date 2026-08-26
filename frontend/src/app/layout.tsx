import type { Metadata, Viewport } from "next";
import ReduxProvider from "@/lib/ReduxProvider";
import { siteConfig } from "@/config/site";
import SWRegister from "@/components/pwa/SWRegister";
import InstallBanner from "@/components/pwa/InstallBanner";
import InstallAppButton from "@/components/pwa/InstallAppButton";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#050708",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Black Wash",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  title: {
    default: "Car Wash Service in Hazaribagh | The Black Wash",
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    title: "Car Wash Service in Hazaribagh | The Black Wash",
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1920,
        height: 1080,
        alt: `${siteConfig.name} Premium Doorstep Car Detailing`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Car Wash Service in Hazaribagh | The Black Wash",
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLdLocalBusiness = {
    "@context": "https://schema.org",
    "@type": ["AutoWash", "LocalBusiness"],
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    logo: siteConfig.ogImage,
    image: siteConfig.ogImage,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.location.address,
      addressLocality: siteConfig.location.city,
      addressRegion: siteConfig.location.state,
      postalCode: siteConfig.location.postalCode,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "23.9925",
      longitude: "85.3637",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "08:00",
        closes: "20:00",
      },
    ],
    areaServed: siteConfig.serviceArea.map((city) => ({
      "@type": "City",
      name: city,
    })),
  };

  const jsonLdWebSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: {
      "@id": `${siteConfig.url}/#organization`,
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdLocalBusiness),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdWebSite),
          }}
        />
      </head>
      <body className="min-h-dvh flex flex-col bg-[#050708] text-[#F5F7F8] antialiased text-sm sm:text-base selection:bg-[#19C7F3] selection:text-black w-full">
        <ReduxProvider>
          {children}
          <InstallAppButton />
          <SWRegister />
        </ReduxProvider>
      </body>
    </html>
  );
}
