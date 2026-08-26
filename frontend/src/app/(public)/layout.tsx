"use client";

import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import FloatingActions from "@/components/common/FloatingActions";
import BookingDrawer from "@/components/booking/BookingDrawer";
import { BookingProvider } from "@/context/BookingProvider";
import { ToastProvider } from "@/components/ui/Toast";
import Cursor from "../../components/common/PremiumCursor"

import IntroWrapper from "@/components/intro/IntroWrapper";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ToastProvider>
            <BookingProvider>
                <IntroWrapper>
                    <Cursor />
                    <Header />

                    <main>{children}</main>

                    <Footer />
                    <FloatingActions />
                    <BookingDrawer />
                </IntroWrapper>
            </BookingProvider>
        </ToastProvider>
    );
}