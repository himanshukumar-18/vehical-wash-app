"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle, RefreshCw, Clock, IndianRupee, Check } from "lucide-react";
import { AppDispatch } from "@/lib/store";
import {
  fetchServices,
  selectService,
  selectServices,
  selectServicesLoading,
  selectServiceError,
  selectSelectedService,
} from "@/lib/slices/serviceSlice";
import { calculatePrice } from "@/lib/slices/bookingSlice";
import { useBooking } from "@/context/BookingProvider";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Service } from "@/lib/api/serviceApi";

function getServiceIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("basic") || lower.includes("exterior")) return "🚿";
  if (lower.includes("premium") || lower.includes("standard")) return "✨";
  if (lower.includes("detail")) return "🔧";
  if (lower.includes("ceramic") || lower.includes("coat")) return "💎";
  if (lower.includes("interior")) return "🪑";
  return "🚗";
}

export default function ServiceStep() {
  const dispatch = useDispatch<AppDispatch>();
  const services = useSelector(selectServices);
  const loading = useSelector(selectServicesLoading);
  const error = useSelector(selectServiceError);
  const selectedService = useSelector(selectSelectedService);
  const { setService } = useBooking();

  useEffect(() => {
    if (services.length === 0) {
      dispatch(fetchServices());
    }
  }, [dispatch, services.length]);

  const handleSelect = (service: Service) => {
    dispatch(selectService(service));
    setService({ ...service, duration: service.duration_minutes ?? 30 });
    const numericPrice = typeof service.price === "number" ? service.price : parseFloat(String(service.price || 0));
    dispatch(calculatePrice({ service_id: service.id, service_price: numericPrice }));
  };

  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <SkeletonCard height="120px" />
        <SkeletonCard height="120px" />
        <SkeletonCard height="120px" />
        <SkeletonCard height="120px" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "32px 20px",
          backgroundColor: "var(--color-section-bg)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)",
        }}
      >
        <AlertCircle size={36} style={{ color: "#ef4444", marginBottom: "12px" }} />
        <p style={{ fontWeight: 600, color: "var(--color-heading)", marginBottom: "8px" }}>
          Failed to load services
        </p>
        <button
          onClick={() => dispatch(fetchServices())}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 20px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--color-primary)",
            color: "var(--color-white)",
            border: "none",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <RefreshCw size={14} />
          Retry
        </button>
      </div>
    );
  }

  const activeServices = services.filter((s) => s.is_active);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--color-heading)",
            marginBottom: "4px",
          }}
        >
          Choose a Service
        </h3>
        <p style={{ fontSize: "13px", color: "var(--color-text-light)" }}>
          Select the service that fits your needs.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {activeServices.map((service) => {
          const isSelected = selectedService?.id === service.id;

          return (
            <button
              key={service.id}
              onClick={() => handleSelect(service)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
                padding: "16px",
                borderRadius: "var(--radius-md)",
                border: isSelected
                  ? "2px solid var(--color-primary)"
                  : "1.5px solid var(--color-border)",
                backgroundColor: isSelected
                  ? "var(--color-primary-soft)"
                  : "var(--color-card-bg)",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                fontFamily: "inherit",
                transition: "all 0.15s ease",
                boxShadow: isSelected ? "0 0 0 4px rgba(255, 107, 34, 0.1)" : "none",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: isSelected ? "var(--color-primary)" : "var(--color-icon-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  flexShrink: 0,
                }}
              >
                {getServiceIcon(service.name)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: "15px",
                      color: isSelected ? "var(--color-primary)" : "var(--color-heading)",
                      margin: 0,
                    }}
                  >
                    {service.name}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: "17px",
                        fontWeight: 800,
                        color: "var(--color-primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "1px",
                      }}
                    >
                      <IndianRupee size={14} />
                      {Number(service.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--color-text-light)",
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                        marginTop: "2px",
                      }}
                    >
                      <Clock size={11} />
                      {(service.duration_minutes ?? 30) >= 60
                        ? `${Math.round((service.duration_minutes ?? 30) / 60)}h`
                        : `${service.duration_minutes ?? 30} min`}
                    </span>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--color-text-light)",
                    margin: "4px 0 0",
                    lineHeight: 1.5,
                  }}
                >
                  {service.description}
                </p>
              </div>

              {/* Check */}
              {isSelected && (
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  <Check size={12} color="#fff" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {services.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "var(--color-text-light)",
          }}
        >
          No services available at the moment.
        </div>
      )}
    </div>
  );
}
