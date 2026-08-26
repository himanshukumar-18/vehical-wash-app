"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { X, Car, CarFront, Sparkles, AlertCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { createVehicle, selectVehicleCreating } from "@/lib/slices/vehicleSlice";
import { VehicleType, VehiclePayload } from "@/lib/api/vehicleApi";

interface AddVehicleFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const VEHICLE_TYPES: { value: VehicleType; label: string; icon: React.ElementType }[] = [
  { value: "hatchback", label: "Hatchback", icon: CarFront },
  { value: "sedan", label: "Sedan", icon: Car },
  { value: "suv", label: "SUV", icon: Car },
  { value: "muv", label: "MUV", icon: Car },
  { value: "luxury", label: "Luxury", icon: Sparkles },
];

type FormValues = {
  brand: string;
  model: string;
  registration_number: string;
  vehicle_type: VehicleType;
  color: string;
};

export default function AddVehicleForm({ onClose, onSuccess }: AddVehicleFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const creating = useSelector(selectVehicleCreating);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { vehicle_type: "hatchback" },
  });

  const selectedType = watch("vehicle_type");

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);
    const normalizedReg = data.registration_number.trim().toUpperCase();

    const payload: VehiclePayload = {
      brand: data.brand.trim(),
      model: data.model.trim(),
      registration_number: normalizedReg,
      vehicle_type: data.vehicle_type,
      color: data.color ? data.color.trim() : undefined,
    };

    const result = await dispatch(createVehicle(payload));

    if (createVehicle.fulfilled.match(result)) {
      onSuccess?.();
      onClose();
    } else if (createVehicle.rejected.match(result)) {
      const errorMsg = typeof result.payload === "string" ? result.payload : "Failed to create vehicle. Please check inputs.";
      setSubmitError(errorMsg);
    }
  };

  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--color-border)]">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
            New Vehicle Details
          </span>
          <h3 className="font-bold text-base text-[var(--color-heading)] mt-0.5">
            Add New Vehicle
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-[var(--color-text-light)] hover:text-[var(--color-heading)] transition"
        >
          <X size={18} />
        </button>
      </div>

      {submitError && (
        <div className="mb-4 flex items-start gap-2.5 border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Vehicle Type Choice */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-light)] mb-2">
            Vehicle Category *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {VEHICLE_TYPES.map((t) => {
              const Icon = t.icon;
              const isSelected = selectedType === t.value;
              return (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setValue("vehicle_type", t.value)}
                  className={[
                    "flex items-center justify-center gap-2 h-10 px-3 border text-xs font-bold transition-all",
                    isSelected
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      : "border-[var(--color-border)] bg-[var(--color-section-bg)] text-[var(--color-text-light)] hover:text-[var(--color-heading)]",
                  ].join(" ")}
                >
                  <Icon size={14} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Brand + Model */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-light)] mb-1">
              Brand *
            </label>
            <input
              {...register("brand", { required: "Brand is required (e.g. Honda, Hyundai, BMW)" })}
              placeholder="e.g. Honda"
              className="h-10 w-full border border-[var(--color-border)] bg-[var(--color-section-bg)] px-3 text-xs text-[var(--color-heading)] outline-none focus:border-[var(--color-primary)]"
            />
            {errors.brand && (
              <span className="text-[11px] font-semibold text-red-400 mt-1 block">
                {errors.brand.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-light)] mb-1">
              Model *
            </label>
            <input
              {...register("model", { required: "Model is required (e.g. City, Creta, X5)" })}
              placeholder="e.g. City ZX"
              className="h-10 w-full border border-[var(--color-border)] bg-[var(--color-section-bg)] px-3 text-xs text-[var(--color-heading)] outline-none focus:border-[var(--color-primary)]"
            />
            {errors.model && (
              <span className="text-[11px] font-semibold text-red-400 mt-1 block">
                {errors.model.message}
              </span>
            )}
          </div>
        </div>

        {/* Registration Number */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-light)] mb-1">
            Registration Number *
          </label>
          <input
            {...register("registration_number", {
              required: "Registration number is required",
              pattern: {
                value: /^[A-Z0-9 -]+$/i,
                message: "Use uppercase letters, numbers, spaces, or hyphens only.",
              },
            })}
            placeholder="e.g. JH 01 AB 1234"
            className="h-10 w-full uppercase border border-[var(--color-border)] bg-[var(--color-section-bg)] px-3 text-xs text-[var(--color-heading)] outline-none focus:border-[var(--color-primary)] tracking-wider font-mono"
            onChange={(e) => {
              setValue("registration_number", e.target.value.toUpperCase());
            }}
          />
          {errors.registration_number && (
            <span className="text-[11px] font-semibold text-red-400 mt-1 block">
              {errors.registration_number.message}
            </span>
          )}
          <span className="text-[10px] text-[var(--color-text-light)] mt-1 block">
            Format: Letters, numbers, spaces, or hyphens (e.g. JH 01 AB 1234)
          </span>
        </div>

        {/* Color */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-light)] mb-1">
            Vehicle Color (Optional)
          </label>
          <input
            {...register("color")}
            placeholder="e.g. Black"
            className="h-10 w-full border border-[var(--color-border)] bg-[var(--color-section-bg)] px-3 text-xs text-[var(--color-heading)] outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[var(--color-text-light)] hover:text-[var(--color-heading)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={creating}
            className="h-10 bg-[var(--color-primary)] px-5 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-black)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
          >
            {creating ? "Adding Vehicle..." : "Save & Select Vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
}
