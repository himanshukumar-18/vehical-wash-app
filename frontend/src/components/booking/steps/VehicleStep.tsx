"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Car, Plus, AlertCircle, RefreshCw, Check } from "lucide-react";
import { AppDispatch } from "@/lib/store";
import {
  fetchVehicles,
  selectVehicle,
  selectVehicles,
  selectVehiclesLoading,
  selectVehicleError,
  selectSelectedVehicle,
} from "@/lib/slices/vehicleSlice";
import { useBooking } from "@/context/BookingProvider";
import { SkeletonVehicleCard } from "@/components/ui/Skeleton";
import AddVehicleForm from "./AddVehicleForm";
import { Vehicle } from "@/lib/api/vehicleApi";

const VEHICLE_EMOJIS: Record<string, string> = {
  hatchback: "🚗",
  sedan: "🏎️",
  suv: "🚙",
  muv: "🚐",
  luxury: "✨",
};

export default function VehicleStep() {
  const dispatch = useDispatch<AppDispatch>();
  const vehicles = useSelector(selectVehicles);
  const loading = useSelector(selectVehiclesLoading);
  const error = useSelector(selectVehicleError);
  const selectedVehicle = useSelector(selectSelectedVehicle);
  const { setVehicle } = useBooking();

  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  const handleSelect = (vehicle: Vehicle) => {
    dispatch(selectVehicle(vehicle));
    setVehicle(vehicle);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <SkeletonVehicleCard />
        <SkeletonVehicleCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-500/20 bg-red-500/5 p-6 text-center">
        <AlertCircle size={32} className="mx-auto text-red-400 mb-2" />
        <p className="text-sm font-bold text-[var(--color-heading)] mb-1">
          Failed to load vehicles
        </p>
        <p className="text-xs text-[var(--color-text-light)] mb-4">{error}</p>
        <button
          type="button"
          onClick={() => dispatch(fetchVehicles())}
          className="inline-flex items-center gap-2 border border-[var(--color-primary)] px-4 py-2 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-black"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-base font-bold text-[var(--color-heading)] mb-0.5">
          Select Your Vehicle
        </h3>
        <p className="text-xs text-[var(--color-text-light)]">
          Choose a saved vehicle or add a new one for your wash service.
        </p>
      </div>

      {/* Vehicle cards */}
      {vehicles.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {vehicles.map((vehicle) => {
            const isSelected = selectedVehicle && String(selectedVehicle.id) === String(vehicle.id);
            const typeLabel = vehicle.vehicle_type_display || (vehicle.vehicle_type ? vehicle.vehicle_type.toUpperCase() : "CAR");

            return (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => handleSelect(vehicle)}
                className={[
                  "flex items-center justify-between gap-3 p-4 border text-left transition-all",
                  isSelected
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-heading)]"
                    : "border-[var(--color-border)] bg-[var(--color-card-bg)] text-[var(--color-text)] hover:border-[var(--color-text-light)]",
                ].join(" ")}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[var(--color-section-bg)] text-xl border border-[var(--color-border)]">
                    {VEHICLE_EMOJIS[vehicle.vehicle_type] || "🚗"}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-[var(--color-heading)] truncate">
                        {vehicle.brand} {vehicle.model}
                      </p>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[var(--color-section-bg)] text-[var(--color-primary)] border border-[var(--color-border)]">
                        {typeLabel}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-[var(--color-text-light)] mt-0.5 tracking-wide">
                      {vehicle.registration_number.toUpperCase()}
                      {vehicle.color ? ` • ${vehicle.color}` : ""}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-[var(--color-primary)] text-black">
                    <Check size={14} strokeWidth={2.5} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {vehicles.length === 0 && !showAddForm && (
        <div className="border border-dashed border-[var(--color-border)] bg-[var(--color-card-bg)] py-10 px-4 text-center">
          <Car size={36} className="mx-auto text-[var(--color-text-light)] mb-3" />
          <p className="font-bold text-sm text-[var(--color-heading)] mb-1">
            No vehicles added yet
          </p>
          <p className="text-xs text-[var(--color-text-light)] mb-4">
            Add your vehicle to proceed with booking a car wash.
          </p>
        </div>
      )}

      {/* Add Vehicle toggle button */}
      {!showAddForm && (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="flex h-11 w-full items-center justify-center gap-2 border border-dashed border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-black"
        >
          <Plus size={16} /> Add New Vehicle
        </button>
      )}

      {/* Add vehicle form */}
      {showAddForm && (
        <AddVehicleForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}
