"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  IndianRupee,
  Users,
  CalendarCheck,
  CheckCircle2,
  Tag,
  MapPin,
  RefreshCw,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";
import {
  analyticsApi,
  AnalyticsOverview,
  RevenueDataPoint,
  ServiceStat,
  CustomerStats,
  OffersAnalytics,
  ServiceAreaStat,
} from "@/lib/api/analyticsApi";

const PERIOD_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 30 Days", value: "30days" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
];

export default function OwnerAnalyticsPage() {
  const [period, setPeriod] = useState("30days");
  const [loading, setLoading] = useState(true);

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [revenueTimeline, setRevenueTimeline] = useState<RevenueDataPoint[]>([]);
  const [services, setServices] = useState<ServiceStat[]>([]);
  const [customers, setCustomers] = useState<CustomerStats | null>(null);
  const [offers, setOffers] = useState<OffersAnalytics | null>(null);
  const [serviceAreas, setServiceAreas] = useState<ServiceAreaStat[]>([]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [ovData, revData, srvData, custData, offData, areaData] = await Promise.all([
        analyticsApi.getOverview(period),
        analyticsApi.getRevenue(period),
        analyticsApi.getServices(period),
        analyticsApi.getCustomers(period),
        analyticsApi.getOffers(period),
        analyticsApi.getServiceAreas(period),
      ]);
      setOverview(ovData);
      setRevenueTimeline(revData);
      setServices(srvData);
      setCustomers(custData);
      setOffers(offData);
      setServiceAreas(areaData);
    } catch (err: any) {
      console.error("Failed to load owner analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [period]);

  const maxRevenue = Math.max(...revenueTimeline.map((r) => r.revenue), 1);

  return (
    <div className="space-y-7 sm:space-y-8">
      {/* HEADER & PERIOD SELECTOR */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#19C7F3]">
            Owner Business Intelligence
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#F5F7F8] sm:text-4xl">
            Real Analytics Dashboard
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#A7B0B7]">
            PostgreSQL database-driven metrics for revenue, service demand, repeat customers, and offer performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period Selector Tabs */}
          <div className="flex border border-[#26313A] bg-[#0D1115] p-1">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 text-xs font-bold transition-all ${
                  period === opt.value
                    ? "bg-[#19C7F3] text-[#050708]"
                    : "text-[#707A82] hover:text-[#F5F7F8]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={loadAnalyticsData}
            className="inline-flex h-10 items-center justify-center gap-2 border border-[#26313A] bg-[#0D1115] px-4 text-xs font-bold text-[#A7B0B7] hover:text-[#19C7F3]"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* OVERVIEW STAT CARDS */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <div className="border border-[#26313A] bg-[#0D1115] p-4 sm:p-5">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.1em] text-[#707A82]">
            <span>Total Revenue</span>
            {overview?.growth.revenue_percent !== null && (
              <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
                <ArrowUpRight size={12} /> {overview?.growth.revenue_percent}%
              </span>
            )}
          </div>
          <p className="mt-2 text-[2rem] font-bold text-[#19C7F3]">
            ₹{overview?.total_revenue.toLocaleString() || 0}
          </p>
          <p className="mt-1 text-[11px] text-[#707A82]">Avg Order: ₹{overview?.average_booking_value || 0}</p>
        </div>

        <div className="border border-[#26313A] bg-[#0D1115] p-4 sm:p-5">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.1em] text-[#707A82]">
            <span>Total Bookings</span>
            {overview?.growth.bookings_percent !== null && (
              <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
                <ArrowUpRight size={12} /> {overview?.growth.bookings_percent}%
              </span>
            )}
          </div>
          <p className="mt-2 text-[2rem] font-bold text-[#F5F7F8]">{overview?.total_bookings || 0}</p>
          <p className="mt-1 text-[11px] text-[#707A82]">{overview?.completed_bookings || 0} Completed</p>
        </div>

        <div className="border border-[#26313A] bg-[#0D1115] p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#707A82]">Active Customers</p>
          <p className="mt-2 text-[2rem] font-bold text-emerald-400">{customers?.active_customers || 0}</p>
          <p className="mt-1 text-[11px] text-[#707A82]">{customers?.repeat_customer_rate || 0}% Repeat Rate</p>
        </div>

        <div className="border border-[#26313A] bg-[#0D1115] p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#707A82]">Discounts Given</p>
          <p className="mt-2 text-[2rem] font-bold text-amber-400">₹{overview?.total_discounts.toLocaleString() || 0}</p>
          <p className="mt-1 text-[11px] text-[#707A82]">{offers?.active_offers_count || 0} Active Offers</p>
        </div>
      </div>

      {/* REVENUE TIMELINE CHART */}
      <div className="border border-[#26313A] bg-[#0D1115] p-5 lg:p-6">
        <h2 className="text-base font-bold text-[#F5F7F8] mb-1">Revenue Trend</h2>
        <p className="text-xs text-[#707A82] mb-6">Daily revenue and booking volume timeline</p>

        {loading ? (
          <div className="h-48 flex items-center justify-center text-xs text-[#707A82]">Loading chart...</div>
        ) : revenueTimeline.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-[#707A82]">No paid bookings recorded in this timeframe.</div>
        ) : (
          <div className="flex h-52 items-end gap-2 pt-6">
            {revenueTimeline.map((pt) => {
              const heightPct = Math.max((pt.revenue / maxRevenue) * 100, 6);
              return (
                <div key={pt.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition absolute bottom-full mb-2 z-10 bg-[#080A0C] border border-[#26313A] p-2 text-[10px] whitespace-nowrap shadow-xl">
                    <p className="font-bold text-[#F5F7F8]">{pt.date}</p>
                    <p className="text-[#19C7F3]">Revenue: ₹{pt.revenue}</p>
                    <p className="text-[#A7B0B7]">{pt.bookings} Bookings</p>
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-[#19C7F3]/30 border-t-2 border-[#19C7F3] transition-all group-hover:bg-[#19C7F3]"
                  />
                  <span className="text-[9px] font-mono text-[#707A82] truncate max-w-[40px]">
                    {pt.date.split("-").slice(1).join("/")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* GRID FOR SERVICE & AREA ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Popularity */}
        <div className="border border-[#26313A] bg-[#0D1115] p-5 lg:p-6">
          <h2 className="text-base font-bold text-[#F5F7F8] mb-1">Service Demand & Revenue</h2>
          <p className="text-xs text-[#707A82] mb-4">Bookings and revenue share by service package</p>

          {services.length === 0 ? (
            <p className="text-xs text-[#707A82] py-8 text-center">No service data available.</p>
          ) : (
            <div className="space-y-4">
              {services.map((s) => (
                <div key={s.service_id} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#F5F7F8]">{s.service_name}</span>
                    <span className="font-mono text-[#19C7F3]">
                      {s.bookings_count} bookings (₹{s.revenue})
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#080A0C] overflow-hidden">
                    <div
                      style={{ width: `${s.share_percentage}%` }}
                      className="h-full bg-emerald-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Service Area Demand */}
        <div className="border border-[#26313A] bg-[#0D1115] p-5 lg:p-6">
          <h2 className="text-base font-bold text-[#F5F7F8] mb-1">Service Area Distribution</h2>
          <p className="text-xs text-[#707A82] mb-4">Doorstep wash requests by coverage zone</p>

          {serviceAreas.length === 0 ? (
            <p className="text-xs text-[#707A82] py-8 text-center">No area data available.</p>
          ) : (
            <div className="space-y-4">
              {serviceAreas.map((a) => (
                <div key={a.service_area_id || a.area_name} className="flex items-center justify-between border-b border-[#1D252B] pb-3">
                  <div>
                    <p className="text-xs font-bold text-[#F5F7F8]">{a.area_name}</p>
                    <p className="text-[10px] text-[#707A82]">Travel Charges: ₹{a.travel_charges_collected}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#19C7F3]">{a.bookings_count} Bookings</p>
                    <p className="text-[10px] font-semibold text-emerald-400">₹{a.revenue} Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
