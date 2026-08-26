"use client";

import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useBooking } from "@/context/BookingProvider";
import { AppDispatch } from "@/lib/store";
import { createBooking } from "@/lib/slices/bookingSlice";
import { useToast } from "@/components/ui/Toast";
import { Booking } from "@/lib/api/bookingApi";

import VehicleStep from "./steps/VehicleStep";
import ServiceStep from "./steps/ServiceStep";
import DateStep from "./steps/DateStep";
import AddressStep from "./steps/AddressStep";
import ReviewStep from "./steps/ReviewStep";
import PaymentStep, { PaymentStepRef } from "./steps/PaymentStep";
import BookingFooter from "./BookingFooter";
import BookingSuccess from "./BookingSuccess";

const TOTAL_STEPS = 6;

export default function BookingWizard() {
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const {
    currentStep,
    nextStep,
    previousStep,
    vehicle,
    service,
    date,
    addressDetails,
    address,
    notes,
    paymentMethod,
  } = useBooking();

  const paymentRef = useRef<PaymentStepRef>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0:
        if (!vehicle) {
          toast.error("Please select or add a vehicle to continue.");
          return false;
        }
        return true;
      case 1:
        if (!service) {
          toast.error("Please select a service to continue.");
          return false;
        }
        return true;
      case 2:
        if (!date) {
          toast.error("Please pick a date to continue.");
          return false;
        }
        return true;
      case 3:
        if (!addressDetails.phone || addressDetails.phone.length !== 10) {
          toast.error("Please enter a valid 10-digit contact phone number.");
          return false;
        }
        if (!addressDetails.address || !addressDetails.address.trim()) {
          toast.error("Please enter your street / building address.");
          return false;
        }
        if (!addressDetails.pincode || addressDetails.pincode.length !== 6) {
          toast.error("Please enter a valid 6-digit PIN code.");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (submitting) return;
    if (!validateCurrentStep()) return;

    if (currentStep === TOTAL_STEPS - 1) {
      await handleConfirmBooking();
      return;
    }

    nextStep();
  };

  const handleConfirmBooking = async () => {
    if (submitting) return;

    if (!vehicle || !service || !date || !addressDetails.address) {
      toast.error("Missing booking details. Please go back and complete all steps.");
      return;
    }

    const fullAddress = address || [
      addressDetails.address,
      addressDetails.area,
      addressDetails.city,
      `${addressDetails.state} - ${addressDetails.pincode}`,
    ].filter(Boolean).join(", ");

    setSubmitting(true);
    try {
      const bookingResult = await dispatch(
        createBooking({
          vehicle_id: vehicle.id,
          service_id: service.id,
          booking_date: date,
          address: fullAddress,
          customer_note: notes || undefined,
        })
      );

      if (!createBooking.fulfilled.match(bookingResult)) {
        toast.error(
          (bookingResult.payload as string) ?? "Failed to create booking. Please try again."
        );
        setSubmitting(false);
        return;
      }

      const booking = bookingResult.payload;

      if (paymentMethod === "razorpay" && paymentRef.current) {
        const paymentSuccess = await paymentRef.current.initiatePayment(String(booking.id));
        if (!paymentSuccess) {
          toast.error("Payment verification pending or cancelled.");
          setSubmitting(false);
          return;
        }
      }

      setCompletedBooking(booking);
      toast.success("Booking created successfully! 🎉");
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (completedBooking) {
    return <BookingSuccess booking={completedBooking} />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <VehicleStep />;
      case 1:
        return <ServiceStep />;
      case 2:
        return <DateStep />;
      case 3:
        return <AddressStep />;
      case 4:
        return <ReviewStep />;
      case 5:
        return <PaymentStep ref={paymentRef} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          scrollbarWidth: "thin",
          scrollbarColor: "var(--color-border) transparent",
        }}
      >
        {renderStep()}
      </div>

      <BookingFooter
        onNext={handleNext}
        onPrev={previousStep}
        nextLoading={submitting}
        nextDisabled={submitting}
      />
    </>
  );
}
