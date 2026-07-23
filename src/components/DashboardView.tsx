/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Property, Booking, SystemParameters, UnitStatusRow } from '../types';
import { calculateDashboardKPIs, getDaysDiff } from '../utils/formulas';
import { ShieldAlert, Key, TrendingDown, Users, CheckCircle, ArrowUpRight, HelpCircle } from 'lucide-react';

interface DashboardViewProps {
  properties: Property[];
  bookings: Booking[];
  parameters: SystemParameters;
  computedStatuses: UnitStatusRow[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  properties,
  bookings,
  parameters,
  computedStatuses,
}) => {
  const kpis = calculateDashboardKPIs(properties, computedStatuses, parameters);

  // Filter checkout soon units
  const checkoutSoonUnits = computedStatuses.filter(s => s.Today_Status === 'Checkout Soon');
  // Filter checkin soon units
  const checkinSoonUnits = computedStatuses.filter(s => s.Today_Status === 'Check-in Soon');

  const currency = parameters.Para_Currency_Symbol;
  const targetOcc = parameters.Para_Target_Occ;
  const isOccTargetMet = kpis.occupancyRate >= targetOcc;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* SECTION TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif tracking-[-0.02em] text-[#051C2C] font-semibold">
            00_Dashboard &bull; Real-time Operations Console
          </h2>
          <p className="text-xs text-[#888888] font-sans-body mt-1">
            Real-time aggregate portfolio KPIs and pending operational actions calculated for anchor date {parameters.Para_Anchor_Date}.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-white py-1.5 px-3 rounded-full shadow-sm text-[#051C2C] font-medium border border-[#E8E8E6]">
          <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse"></span>
          Anchor Date: <span className="font-mono font-bold">{parameters.Para_Anchor_Date}</span>
        </div>
      </div>

      {/* KPI GRID - 8 Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Managed */}
        <div className="bg-white p-5 rounded-[12px] card-shadow-md hover:translate-y-[-2px] transition-all duration-200">
          <p className="text-[11px] font-semibold text-[#888888] uppercase tracking-[0.05em] font-sans-body">
            Total Properties
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-serif tracking-[-0.03em] font-bold text-[#051C2C]">
              {kpis.totalUnits}
            </span>
            <span className="text-xs font-sans-body text-[#888888] font-medium">
              Units Managed
            </span>
          </div>
          <p className="text-[11px] text-[#888888] font-sans-body mt-2">
            Dynamic Property Master
          </p>
        </div>

        {/* KPI 2: Occupied Units */}
        <div className="bg-white p-5 rounded-[12px] card-shadow-md hover:translate-y-[-2px] transition-all duration-200">
          <p className="text-[11px] font-semibold text-[#888888] uppercase tracking-[0.05em] font-sans-body">
            Occupied Units
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-serif tracking-[-0.03em] font-bold text-[#051C2C]">
              {kpis.occupiedUnits}
            </span>
            <span className="text-xs font-sans-body text-[#888888] font-medium">
              Active Leases
            </span>
          </div>
          <p className="text-[11px] text-[#888888] font-sans-body mt-2 flex items-center gap-1">
            <Users className="w-3 h-3 text-[#051C2C]" /> Today occupied count
          </p>
        </div>

        {/* KPI 3: Vacant Units */}
        <div className="bg-white p-5 rounded-[12px] card-shadow-md hover:translate-y-[-2px] transition-all duration-200">
          <p className="text-[11px] font-semibold text-[#888888] uppercase tracking-[0.05em] font-sans-body">
            Vacant / To-Let
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-serif tracking-[-0.03em] font-bold text-[#2251FF] font-semibold">
              {kpis.vacantUnits}
            </span>
            <span className="text-xs font-sans-body text-[#888888] font-medium">
              Available Now
            </span>
          </div>
          <p className="text-[11px] text-[#888888] font-sans-body mt-2">
            Syncs with Vacancy Sheet
          </p>
        </div>

        {/* KPI 4: Reserved Units */}
        <div className="bg-white p-5 rounded-[12px] card-shadow-md hover:translate-y-[-2px] transition-all duration-200">
          <p className="text-[11px] font-semibold text-[#888888] uppercase tracking-[0.05em] font-sans-body">
            Reserved / Locked
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-serif tracking-[-0.03em] font-bold text-[#051C2C]">
              {kpis.reservedUnits}
            </span>
            <span className="text-xs font-sans-body text-[#888888] font-medium">
              Future Booked
            </span>
          </div>
          <p className="text-[11px] text-[#888888] font-sans-body mt-2">
            Confirmed but not checked-in
          </p>
        </div>

        {/* KPI 5: Occupancy Rate */}
        <div className="bg-white p-5 rounded-[12px] card-shadow-md hover:translate-y-[-2px] transition-all duration-200">
          <p className="text-[11px] font-semibold text-[#888888] uppercase tracking-[0.05em] font-sans-body">
            Occupancy Rate
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-serif tracking-[-0.03em] font-bold text-[#051C2C]">
              {(kpis.occupancyRate * 100).toFixed(1)}%
            </span>
            <span className="text-xs font-sans-body text-[#888888] font-medium">
              Target: {(targetOcc * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-[11px] font-sans-body mt-2 text-[#888888]">
            {isOccTargetMet ? '✓ Portfolio target achieved' : '▲ Below performance baseline'}
          </p>
        </div>

        {/* KPI 6: Checkout Alerts */}
        <div className="bg-white p-5 rounded-[12px] card-shadow-md hover:translate-y-[-2px] transition-all duration-200">
          <p className="text-[11px] font-semibold text-[#888888] uppercase tracking-[0.05em] font-sans-body">
            Checkout Alerts
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-3xl font-serif tracking-[-0.03em] font-bold ${kpis.checkoutAlerts > 0 ? 'text-[#D32F2F]' : 'text-[#051C2C]'}`}>
              {kpis.checkoutAlerts}
            </span>
            <span className="text-xs font-sans-body text-[#888888] font-medium">
              Next {parameters.Para_Alert_Days} Days
            </span>
          </div>
          <p className="text-[11px] text-[#888888] font-sans-body mt-2 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-[#D32F2F]" /> Requires lease extension/prep
          </p>
        </div>

        {/* KPI 7: Check-in Alerts */}
        <div className="bg-white p-5 rounded-[12px] card-shadow-md hover:translate-y-[-2px] transition-all duration-200">
          <p className="text-[11px] font-semibold text-[#888888] uppercase tracking-[0.05em] font-sans-body">
            Check-in Alerts
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-3xl font-serif tracking-[-0.03em] font-bold ${kpis.checkinAlerts > 0 ? 'text-[#2251FF]' : 'text-[#051C2C]'}`}>
              {kpis.checkinAlerts}
            </span>
            <span className="text-xs font-sans-body text-[#888888] font-medium">
              Next {parameters.Para_Alert_Days} Days
            </span>
          </div>
          <p className="text-[11px] text-[#888888] font-sans-body mt-2 flex items-center gap-1">
            <Key className="w-3 h-3 text-[#2251FF]" /> Requires room check & clean
          </p>
        </div>

        {/* KPI 8: Vacancy Daily Loss */}
        <div className="bg-white p-5 rounded-[12px] card-shadow-md hover:translate-y-[-2px] transition-all duration-200">
          <p className="text-[11px] font-semibold text-[#888888] uppercase tracking-[0.05em] font-sans-body">
            Daily Vacancy Loss
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className={`text-3xl font-serif tracking-[-0.03em] font-bold ${kpis.dailyVacancyLoss > 0 ? 'text-[#D32F2F]' : 'text-[#051C2C]'}`}>
              {currency}{kpis.dailyVacancyLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-[#888888] font-sans-body mt-2 flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-[#D32F2F]" /> Finance penalty of idle rooms
          </p>
        </div>
      </div>

      {/* OPERATIONS WARNING / ACTION CENTER */}
      {(checkoutSoonUnits.length > 0 || checkinSoonUnits.length > 0) && (
        <div className="bg-white p-6 rounded-[14px] card-shadow-lg border-l-[3px] border-[#D32F2F] space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#D32F2F]" />
            <h3 className="text-base font-serif font-bold text-[#051C2C] tracking-[-0.01em]">
              Urgent Lease Operations Alert Center
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
            {/* Checkout Soon List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#888888] mb-2 flex items-center gap-1">
                <span>🔔 {checkoutSoonUnits.length} Units checkout soon</span>
              </h4>
              {checkoutSoonUnits.length > 0 ? (
                <div className="space-y-2">
                  {checkoutSoonUnits.map((u) => (
                    <div key={u.Unit_ID} className="flex justify-between items-center p-2.5 rounded-[8px] bg-[#F5F5F2] hover:scale-[1.01] transition-all text-xs">
                      <div>
                        <span className="font-bold text-[#051C2C]">{u.Unit_Name}</span>
                        <span className="text-[#888888] ml-2">({u.Room_Type})</span>
                        <div className="text-[11px] text-[#888888] mt-0.5">Tenant: {u.Current_Tenant}</div>
                      </div>
                      <div className="text-right">
                        <span className="bg-red-50 text-[#D32F2F] px-2 py-0.5 rounded-full font-mono font-bold text-[11px]">
                          {u.Days_To_Event}d Left
                        </span>
                        <div className="text-[10px] text-[#888888] mt-0.5">Out: {u.Next_Checkin === '-' ? 'N/A' : getDaysDiff(u.Next_Checkin, parameters.Para_Anchor_Date) <= 0 ? u.Next_Checkin : 'Soon'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#888888] italic">No urgent checkouts pending.</p>
              )}
            </div>

            {/* Check-in Soon List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#888888] mb-2 flex items-center gap-1">
                <span>🔑 {checkinSoonUnits.length} Units incoming check-in</span>
              </h4>
              {checkinSoonUnits.length > 0 ? (
                <div className="space-y-2">
                  {checkinSoonUnits.map((u) => (
                    <div key={u.Unit_ID} className="flex justify-between items-center p-2.5 rounded-[8px] bg-[#F5F5F2] hover:scale-[1.01] transition-all text-xs">
                      <div>
                        <span className="font-bold text-[#051C2C]">{u.Unit_Name}</span>
                        <span className="text-[#888888] ml-2">({u.Room_Type})</span>
                        <div className="text-[11px] text-[#888888] mt-0.5">Next In: {u.Next_Checkin}</div>
                      </div>
                      <div className="text-right">
                        <span className="bg-blue-50 text-[#2251FF] px-2 py-0.5 rounded-full font-mono font-bold text-[11px]">
                          In {u.Days_To_Event}d
                        </span>
                        <div className="text-[10px] text-[#888888] mt-0.5">Prepare clean service</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#888888] italic">No incoming check-ins pending.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CHARTS AND INSIGHTS SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART 1: Occupancy Gauges (SVG render) */}
        <div className="bg-white p-6 rounded-[14px] card-shadow-md space-y-4">
          <h3 className="text-sm font-serif font-bold text-[#051C2C] tracking-[0.01em] uppercase border-b border-[#E8E8E6] pb-2">
            Occupancy Performance
          </h3>
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div className="relative w-36 h-36">
              {/* Circular SVG Gauge */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#E8E8E6"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#2251FF"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * kpis.occupancyRate)}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-serif tracking-[-0.03em] font-bold text-[#051C2C]">
                  {(kpis.occupancyRate * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-[#888888] uppercase tracking-wider font-semibold">
                  Occupancy
                </span>
              </div>
            </div>

            <div className="w-full space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#888888]">Current Level:</span>
                <span className="font-mono font-bold text-[#051C2C]">{(kpis.occupancyRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888888]">SaaS System Target:</span>
                <span className="font-mono text-[#888888]">{(targetOcc * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-[#051C2C]/[0.1] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#2251FF] h-full rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(100, (kpis.occupancyRate / targetOcc) * 100)}%` }}
                ></div>
              </div>
              <div className="text-[10px] text-right text-[#888888] italic">
                Performance index: {(kpis.occupancyRate / targetOcc).toFixed(2)}x
              </div>
            </div>
          </div>
        </div>

        {/* CHART 2: Room Status Composition (SVG Horizontal Stack) */}
        <div className="bg-white p-6 rounded-[14px] card-shadow-md space-y-4">
          <h3 className="text-sm font-serif font-bold text-[#051C2C] tracking-[0.01em] uppercase border-b border-[#E8E8E6] pb-2">
            Portfolio Composition
          </h3>
          <div className="space-y-6 py-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#051C2C] font-semibold">Active Occupancy</span>
                <span className="font-mono text-[#888888]">{kpis.occupiedUnits} / {kpis.totalUnits} Units</span>
              </div>
              <div className="w-full bg-[#051C2C]/[0.1] h-3 rounded-full overflow-hidden flex">
                <div 
                  className="bg-[#2251FF] h-full transition-all duration-300"
                  style={{ width: `${(computedStatuses.filter(s => s.Today_Status === 'Occupied').length / kpis.totalUnits) * 100}%` }}
                ></div>
                <div 
                  className="bg-[#D32F2F] h-full transition-all duration-300"
                  style={{ width: `${(computedStatuses.filter(s => s.Today_Status === 'Checkout Soon').length / kpis.totalUnits) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-[#888888] mt-1">
                <span>Blue: Stable Occupied</span>
                <span>Red: Checkout Alert</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#051C2C] font-semibold">Marketing Availability</span>
                <span className="font-mono text-[#888888]">{kpis.vacantUnits} / {kpis.totalUnits} Units</span>
              </div>
              <div className="w-full bg-[#051C2C]/[0.1] h-3 rounded-full overflow-hidden flex">
                <div 
                  className="bg-[#00C853] h-full transition-all duration-300"
                  style={{ width: `${(computedStatuses.filter(s => s.Today_Status === 'Vacant').length / kpis.totalUnits) * 100}%` }}
                ></div>
                <div 
                  className="bg-yellow-400 h-full transition-all duration-300"
                  style={{ width: `${(computedStatuses.filter(s => s.Today_Status === 'Check-in Soon').length / kpis.totalUnits) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-[#888888] mt-1">
                <span>Green: Pure Vacant</span>
                <span>Yellow: Check-in soon</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="p-3 bg-[#F5F5F2] rounded-[8px] text-[11px] text-[#888888] leading-relaxed">
                <span className="font-bold text-[#051C2C]">Tip:</span> To improve occupancy metrics, prioritize units with "Checkout Soon" status for automatic marketing and future reservations.
              </div>
            </div>
          </div>
        </div>

        {/* INSIGHTS BLOCK - Left 3px accent border + 4% background */}
        <div className="bg-[#2251FF]/[0.04] p-6 rounded-[14px] border-l-[3px] border-[#2251FF] space-y-4">
          <h3 className="text-sm font-serif font-bold text-[#051C2C] tracking-[0.01em] uppercase flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-[#2251FF]" />
            Business Insights & Audit
          </h3>
          <div className="space-y-4 text-xs text-[#051C2C] leading-relaxed font-sans-body">
            <div>
              <p className="font-semibold text-xs flex items-center gap-1 text-[#051C2C]">
                <ArrowUpRight className="w-3.5 h-3.5 text-[#2251FF]" /> Occupancy Performance Index
              </p>
              <p className="text-[#888888] mt-0.5">
                Currently operating at <span className="font-bold text-[#051C2C]">{(kpis.occupancyRate * 100).toFixed(1)}%</span>. 
                {isOccTargetMet 
                  ? ` Portfolio is healthy and currently exceeding the specified target of ${(targetOcc * 100).toFixed(0)}%.` 
                  : ` Portfolio is currently underperforming against the baseline target of ${(targetOcc * 100).toFixed(0)}%. We need to convert vacant listings.`}
              </p>
            </div>

            <div>
              <p className="font-semibold text-xs flex items-center gap-1 text-[#051C2C]">
                <ArrowUpRight className="w-3.5 h-3.5 text-[#2251FF]" /> Daily Financial Exposure
              </p>
              <p className="text-[#888888] mt-0.5">
                The financial penalty of {kpis.vacantUnits} vacant units amounts to <span className="font-mono font-bold text-[#D32F2F]">{currency}{kpis.dailyVacancyLoss.toFixed(2)} / day</span> in lost rent opportunity based on properties' bottom-tier rental standard configurations.
              </p>
            </div>

            <div className="pt-2">
              <div className="border-t border-[#051C2C]/[0.08] pt-3 text-[11px] text-[#888888] flex items-center justify-between">
                <span>Calculations validated</span>
                <span className="font-mono font-semibold">Macro-Free Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
