"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarCheck } from "lucide-react";
import { useBooking } from "@/context/BookingProvider";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function DateStep() {
  const { date, setDate } = useBooking();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isPrevDisabled =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(viewYear, viewMonth, day);
    if (clickedDate < today) return;
    setDate(formatDate(clickedDate));
  };

  const selectedDate = date ? new Date(date + "T00:00:00") : null;

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-base font-bold text-[#F5F7F8] mb-0.5">
          Pick a Service Date
        </h3>
        <p className="text-xs text-[#A7B0B7]">
          Select your preferred doorstep washing date.
        </p>
      </div>

      {/* Calendar Card */}
      <div className="border border-[#26313A] bg-[#0D1115] overflow-hidden">
        {/* Month Navigation Header */}
        <div className="flex items-center justify-between border-b border-[#26313A] p-4">
          <button
            type="button"
            onClick={prevMonth}
            disabled={isPrevDisabled}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center border border-[#26313A] bg-[#080A0C] text-[#F5F7F8] transition hover:border-[#19C7F3]/50 disabled:opacity-30 disabled:hover:border-[#26313A]"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="font-bold text-sm text-[#F5F7F8]">
            {MONTHS[viewMonth]} {viewYear}
          </span>

          <button
            type="button"
            onClick={nextMonth}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center border border-[#26313A] bg-[#080A0C] text-[#F5F7F8] transition hover:border-[#19C7F3]/50"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 p-3 text-center border-b border-[#26313A]/50 bg-[#080A0C]">
          {DAYS.map((d) => (
            <span key={d} className="text-[10px] font-bold uppercase tracking-wider text-[#707A82]">
              {d}
            </span>
          ))}
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1.5 p-3">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} />;
            }

            const cellDate = new Date(viewYear, viewMonth, day);
            const isPast = cellDate < today;
            const isToday =
              day === today.getDate() &&
              viewMonth === today.getMonth() &&
              viewYear === today.getFullYear();
            const isSelected =
              selectedDate &&
              day === selectedDate.getDate() &&
              viewMonth === selectedDate.getMonth() &&
              viewYear === selectedDate.getFullYear();

            return (
              <button
                key={day}
                type="button"
                onClick={() => handleDayClick(day)}
                disabled={isPast}
                className={[
                  "flex aspect-square items-center justify-center text-xs font-bold transition-all",
                  isSelected
                    ? "bg-[#19C7F3] text-black font-extrabold shadow-[0_0_12px_rgba(25,199,243,0.5)]"
                    : isToday
                    ? "border border-[#19C7F3] bg-[#19C7F3]/10 text-[#19C7F3]"
                    : isPast
                    ? "opacity-25 text-[#707A82] cursor-not-allowed"
                    : "border border-[#26313A] bg-[#080A0C] text-[#F5F7F8] hover:border-[#19C7F3]/50 hover:text-[#19C7F3]",
                ].join(" ")}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Confirmation Banner */}
      {date && (
        <div className="flex items-center gap-3 border border-[#19C7F3]/40 bg-[#19C7F3]/10 p-3.5">
          <CalendarCheck size={18} className="text-[#19C7F3] shrink-0" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#19C7F3]">
              Selected Service Date
            </p>
            <p className="font-bold text-xs text-[#F5F7F8]">
              {new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
