"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Building, Home, Phone, Navigation, Loader2, Truck } from "lucide-react";
import { useSelector } from "react-redux";
import { useBooking } from "@/context/BookingProvider";
export default function AddressStep() {
  const { addressDetails, setAddressDetails } = useBooking();
  const authUser = useSelector((state: any) => state.auth?.user);

  const [address, setAddress] = useState(addressDetails.address || "");
  const [area, setArea] = useState(addressDetails.area || "");
  const [city, setCity] = useState(addressDetails.city || "Hazaribagh");
  const [state, setState] = useState(addressDetails.state || "Jharkhand");
  const [pincode, setPincode] = useState(addressDetails.pincode || "825301");
  const [phone, setPhone] = useState(
    addressDetails.phone || authUser?.phone || ""
  );

  const [isLocating, setIsLocating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setAddressDetails({
      address,
      area,
      city,
      state,
      pincode,
      phone,
    });
  }, [address, area, city, state, pincode, phone, setAddressDetails]);

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPincode(val);
    if (val.length === 6) {
      setErrors((prev) => ({ ...prev, pincode: "" }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
    if (val.length === 10) {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          if (data && data.address) {
            const streetName =
              data.address.road ||
              data.address.suburb ||
              data.address.neighbourhood ||
              `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            const fetchedCity =
              data.address.city ||
              data.address.town ||
              data.address.county ||
              city ||
              "Hazaribagh";
            const fetchedState = data.address.state || state || "Jharkhand";
            const fetchedPincode =
              data.address.postcode?.replace(/\D/g, "").slice(0, 6) ||
              pincode ||
              "825301";

            setAddress(streetName);
            if (data.address.suburb || data.address.neighbourhood) {
              setArea(data.address.suburb || data.address.neighbourhood);
            }
            setCity(fetchedCity);
            setState(fetchedState);
            setPincode(fetchedPincode);
            setErrors((prev) => ({ ...prev, address: "" }));
          } else {
            setAddress(`GPS Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        } catch (err) {
          setAddress(`GPS Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        alert("Unable to detect location. Please grant location permission or type address manually.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-base font-bold text-[#F5F7F8] mb-0.5">
          Service Location & Contact
        </h3>
        <p className="text-xs text-[#A7B0B7]">
          Where should our mobile washing van travel to perform the service?
        </p>
      </div>

      {/* Doorstep Van Notice & GPS Trigger */}
      <div className="flex flex-col gap-3 border border-[#19C7F3]/30 bg-[#19C7F3]/10 p-3.5 sm:p-4">
        <div className="flex items-start gap-3">
          <Truck size={20} className="text-[#19C7F3] shrink-0 mt-0.5" />
          <p className="text-xs text-[#F5F7F8] leading-relaxed">
            <strong className="text-[#19C7F3]">Doorstep Washing Unit:</strong> Our service van will arrive fully equipped with water supply and detailing tools.
          </p>
        </div>

        <button
          type="button"
          onClick={handleUseGPS}
          disabled={isLocating}
          className="inline-flex h-9 items-center justify-center gap-2 border border-[#19C7F3] bg-[#080A0C] px-3.5 text-xs font-bold uppercase tracking-[0.08em] text-[#19C7F3] transition hover:bg-[#19C7F3] hover:text-black disabled:opacity-50 w-full sm:w-auto"
        >
          {isLocating ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Detecting Location...
            </>
          ) : (
            <>
              <Navigation size={14} /> Detect My Location (GPS)
            </>
          )}
        </button>
      </div>

      {/* Hazaribagh Exclusive Service Availability Alert */}
      {city && city.trim().toLowerCase() !== "hazaribagh" && (
        <div className="flex items-start gap-2.5 border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-300">
          <MapPin size={16} className="shrink-0 mt-0.5 text-amber-400" />
          <div>
            <p className="font-bold">Service Currently Unavailable in {city}</p>
            <p className="mt-0.5 text-[11px] text-amber-200/80">
              The Black Wash doorstep car wash currently operates exclusively in <strong>Hazaribagh</strong>. We are expanding to your city soon!
            </p>
          </div>
        </div>
      )}

      {/* Input Fields */}
      <div className="flex flex-col gap-3.5">
        {/* Contact Phone */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#707A82] mb-1">
            Contact Phone Number *
          </label>
          <div className="relative">
            <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707A82]" />
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="e.g. 9876543210"
              maxLength={10}
              className="h-10 w-full border border-[#26313A] bg-[#080A0C] pl-9 pr-3 text-xs text-[#F5F7F8] outline-none focus:border-[#19C7F3] tracking-wider"
            />
          </div>
          {errors.phone && (
            <span className="text-[11px] font-semibold text-red-400 mt-1 block">{errors.phone}</span>
          )}
        </div>

        {/* Street / Building Address */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#707A82] mb-1">
            Flat / Building / Street Address *
          </label>
          <div className="relative">
            <Home size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707A82]" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Flat 402, Sunshine Apartments, Main Road"
              className="h-10 w-full border border-[#26313A] bg-[#080A0C] pl-9 pr-3 text-xs text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
            />
          </div>
          {errors.address && (
            <span className="text-[11px] font-semibold text-red-400 mt-1 block">{errors.address}</span>
          )}
        </div>

        {/* Landmark / Area */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#707A82] mb-1">
            Landmark / Area (Optional)
          </label>
          <div className="relative">
            <Building size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707A82]" />
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Near Bus Stand / Opp. State Bank"
              className="h-10 w-full border border-[#26313A] bg-[#080A0C] pl-9 pr-3 text-xs text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
            />
          </div>
        </div>

        {/* City & State Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#707A82] mb-1">
              City *
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-10 w-full border border-[#26313A] bg-[#080A0C] px-3 text-xs text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#707A82] mb-1">
              State *
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="h-10 w-full border border-[#26313A] bg-[#080A0C] px-3 text-xs text-[#F5F7F8] outline-none focus:border-[#19C7F3]"
            />
          </div>
        </div>

        {/* PIN Code */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#707A82] mb-1">
            PIN Code *
          </label>
          <input
            type="text"
            value={pincode}
            onChange={handlePincodeChange}
            maxLength={6}
            placeholder="825301"
            className="h-10 w-full border border-[#26313A] bg-[#080A0C] px-3 text-xs text-[#F5F7F8] outline-none focus:border-[#19C7F3] tracking-widest font-mono"
          />
          {errors.pincode && (
            <span className="text-[11px] font-semibold text-red-400 mt-1 block">{errors.pincode}</span>
          )}
        </div>
      </div>
    </div>
  );
}
