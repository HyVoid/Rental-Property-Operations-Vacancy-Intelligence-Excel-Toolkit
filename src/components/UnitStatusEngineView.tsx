/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Property, Booking, SystemParameters, UnitStatusRow, ComputedStatus } from '../types';
import { Cpu, Terminal, ShieldAlert, ArrowUpRight, CheckCircle, HelpCircle } from 'lucide-react';

interface UnitStatusEngineViewProps {
  properties: Property[];
  bookings: Booking[];
  parameters: SystemParameters;
  computedStatuses: UnitStatusRow[];
}

export const UnitStatusEngineView: React.FC<UnitStatusEngineViewProps> = ({
  properties,
  bookings,
  parameters,
  computedStatuses,
}) => {
  const [showFormulaAudit, setShowFormulaAudit] = useState(true);

  // Status-specific Pill Styling (Strictly bounded by institutional colors)
  const getStatusPill = (status: ComputedStatus) => {
    switch (status) {
      case 'Occupied':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#051C2C]/[0.08] text-[#051C2C]">
            Occupied
          </span>
        );
      case 'Checkout Soon':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#D32F2F]/[0.1] text-[#D32F2F] animate-pulse">
            ⚠️ Checkout Soon
          </span>
        );
      case 'Reserved':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#888888]/[0.15] text-[#051C2C]">
            Reserved
          </span>
        );
      case 'Check-in Soon':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#2251FF]/[0.1] text-[#2251FF]">
            🔑 Check-In Soon
          </span>
        );
      case 'Vacant':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-gray-100 text-[#888888]">
            Vacant
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif tracking-[-0.02em] text-[#051C2C] font-semibold">
            02_Unit_Status_Engine &bull; Formula Compilation Table
          </h2>
          <p className="text-xs text-[#888888] font-sans-body mt-1">
            Engine Room. 100% computed via dynamic array formula engine mimicking Excel Microsoft 365 MAP + LAMBDA loops. No manual edits allowed.
          </p>
        </div>
        <button
          onClick={() => setShowFormulaAudit(!showFormulaAudit)}
          className="flex items-center gap-1.5 text-xs bg-[#051C2C] text-white py-1.5 px-3.5 rounded-[8px] font-medium card-shadow-sm hover:opacity-90 cursor-pointer transition-all duration-150"
        >
          <Cpu className="w-3.5 h-3.5 text-[#2251FF]" /> {showFormulaAudit ? 'Hide Excel Formula Audit' : 'Show Excel Formula Audit'}
        </button>
      </div>

      {/* READ ONLY BANNER */}
      <div className="bg-[#D32F2F]/[0.04] p-4 rounded-[12px] border-l-[3px] border-[#D32F2F] flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#D32F2F] shrink-0 mt-0.5" />
        <div className="text-xs text-[#051C2C] leading-relaxed">
          <span className="font-bold">Excel Architecture Safe Lock:</span> This ledger is compiled dynamically from the transactions inside <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E8E8E6] font-semibold">01_Booking_Master</span> cross-referenced with variables in <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E8E8E6] font-semibold">04_Parameters</span>. Modifying data here directly is strictly forbidden to protect downstream integrity.
        </div>
      </div>

      {/* FORMULA AUDIT ACCORDION DRAWER */}
      {showFormulaAudit && (
        <div className="bg-[#051C2C] text-white p-5 rounded-[14px] card-shadow-lg space-y-4 font-mono text-[11px] leading-relaxed relative overflow-hidden animate-fade-up">
          <div className="absolute right-3 top-3 opacity-10">
            <Terminal className="w-24 h-24 text-[#2251FF]" />
          </div>
          <div className="flex items-center gap-2 text-xs border-b border-white/[0.1] pb-2 font-serif text-white font-bold">
            <Terminal className="w-4 h-4 text-[#2251FF]" />
            <span>Active Excel formula models mapped from Microsoft 365 spreadsheet specification</span>
          </div>

          <div className="space-y-3 font-mono text-gray-300">
            <div>
              <span className="text-white font-bold text-xs">C3# (Today_Status &bull; Smart Formula Engine):</span>
              <pre className="mt-1 p-2 bg-[#020d14] rounded overflow-x-auto text-[10px] text-[#00C853] font-semibold leading-normal font-mono">
{`=MAP(A3#, LAMBDA(uid, LET(
    today, 04_Parameters!$B$3, alert, 04_Parameters!$B$4,
    is_occ, COUNTIFS(tbl_Bookings[Unit_ID], uid, tbl_Bookings[Check_In], "<="&today, tbl_Bookings[Check_Out], ">"&today, tbl_Bookings[Status], "Checked_in") > 0,
    is_res, COUNTIFS(tbl_Bookings[Unit_ID], uid, tbl_Bookings[Check_In], "<="&today, tbl_Bookings[Check_Out], ">"&today, tbl_Bookings[Status], "Confirmed") > 0,
    co_date, MINIFS(tbl_Bookings[Check_Out], tbl_Bookings[Unit_ID], uid, tbl_Bookings[Check_In], "<="&today, tbl_Bookings[Check_Out], ">"&today, tbl_Bookings[Status], "Checked_in"),
    ci_date, MINIFS(tbl_Bookings[Check_In], tbl_Bookings[Unit_ID], uid, tbl_Bookings[Check_In], ">"&today, tbl_Bookings[Status], "Confirmed"),
    is_co_soon, is_occ * ((co_date - today) <= alert),
    is_ci_soon, (is_occ=FALSE) * (is_res=FALSE) * (ci_date > 0) * ((ci_date - today) <= alert),
    IF(is_occ,
        IF(is_co_soon, "即将退房 (Checkout Soon)", "已入住 (Occupied)"),
        IF(is_res, "已预订 (Reserved)",
            IF(is_ci_soon, "即将入住 (Check-in Soon)", "空置 (Vacant)")
        )
    )
)))`}
              </pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-[10px]">
              <div>
                <span className="text-white font-bold">D3# (Current_Tenant Lookup):</span>
                <pre className="mt-1 p-2 bg-[#020d14] rounded overflow-x-auto text-blue-300 font-mono">
{`=MAP(A3#, LAMBDA(uid, LET(
    today, 04_Parameters!$B$3,
    XLOOKUP(1, (tbl_Bookings[Unit_ID]=uid) * (tbl_Bookings[Check_In]<=today) * (tbl_Bookings[Check_Out]>today) * (tbl_Bookings[Status]="Checked_in"), tbl_Bookings[Tenant_Name], "-")
)))`}
                </pre>
              </div>
              <div>
                <span className="text-white font-bold">F3# (Days_To_Event countdown):</span>
                <pre className="mt-1 p-2 bg-[#020d14] rounded overflow-x-auto text-blue-300 font-mono">
{`=MAP(A3#, LAMBDA(uid, LET(
    today, 04_Parameters!$B$3,
    is_occ, COUNTIFS(tbl_Bookings[Unit_ID], uid, tbl_Bookings[Check_In], "<="&today, tbl_Bookings[Check_Out], ">"&today, tbl_Bookings[Status], "Checked_in") > 0,
    co_date, MINIFS(tbl_Bookings[Check_Out], tbl_Bookings[Unit_ID], uid, tbl_Bookings[Status], "Checked_in"),
    ci_date, MINIFS(tbl_Bookings[Check_In], tbl_Bookings[Unit_ID], uid, tbl_Bookings[Status], "Confirmed"),
    IF(is_occ, co_date - today, IF(ci_date>0, ci_date - today, "-"))
)))`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROPERTY COMPILATION GRID */}
      <div className="bg-white rounded-[14px] card-shadow-md overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#051C2C]/[0.04] border-b-2 border-[#051C2C]/[0.12] text-[#051C2C] text-[11px] font-semibold tracking-[0.06em] uppercase">
                <th className="py-3 px-4">Unit ID</th>
                <th className="py-3 px-4">Unit Name</th>
                <th className="py-3 px-4">Room Type</th>
                <th className="py-3 px-4">Base Rent</th>
                <th className="py-3 px-4">Calculated Today Status</th>
                <th className="py-3 px-4">Active Tenant</th>
                <th className="py-3 px-4">Next Upcoming Check-In</th>
                <th className="py-3 px-4 text-center">Countdown Days</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-[#E8E8E6]">
              {computedStatuses.map((row, index) => {
                const countdown = row.Days_To_Event;
                const isUrgent = row.Today_Status === 'Checkout Soon' || row.Today_Status === 'Check-in Soon';
                
                return (
                  <tr 
                    key={row.Unit_ID} 
                    className={`${index % 2 === 0 ? 'bg-[#F5F5F2]' : 'bg-white'} hover:bg-[#2251FF]/[0.02] hover:scale-[1.01] hover:brightness-[1.01] transition-all duration-150`}
                  >
                    {/* Unit ID */}
                    <td className="py-3 px-4 font-mono font-bold text-[#051C2C]">
                      {row.Unit_ID}
                    </td>

                    {/* Unit Name */}
                    <td className="py-3 px-4 font-medium text-[#051C2C]">
                      {row.Unit_Name}
                    </td>

                    {/* Room Type */}
                    <td className="py-3 px-4 text-[#888888] font-sans-body">
                      {row.Room_Type}
                    </td>

                    {/* Base Rent */}
                    <td className="py-3 px-4 font-mono text-[#888888]">
                      {parameters.Para_Currency_Symbol}{row.Base_Rent.toLocaleString('en-US')} / mo
                    </td>

                    {/* Status Pill */}
                    <td className="py-3 px-4">
                      {getStatusPill(row.Today_Status)}
                    </td>

                    {/* Current Tenant */}
                    <td className={`py-3 px-4 font-medium ${row.Current_Tenant !== '-' ? 'text-[#051C2C]' : 'text-[#888888]'}`}>
                      {row.Current_Tenant}
                    </td>

                    {/* Next Check-in */}
                    <td className="py-3 px-4 font-mono text-[#888888]">
                      {row.Next_Checkin}
                    </td>

                    {/* Countdown and inline data bar */}
                    <td className="py-3 px-4 text-center w-40">
                      {countdown !== '-' ? (
                        <div className="flex flex-col space-y-1">
                          <div className="flex justify-between font-mono text-[11px]">
                            <span className="text-[#888888]">Count:</span>
                            <span className={`font-bold ${isUrgent ? 'text-[#D32F2F]' : 'text-[#051C2C]'}`}>
                              {countdown} days
                            </span>
                          </div>
                          {/* Inline dynamic bar (proportional magnitude) */}
                          <div className="w-full bg-[#051C2C]/[0.10] h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${isUrgent ? 'bg-[#D32F2F]' : 'bg-[#2251FF]'}`}
                              style={{ width: `${Math.min(100, (Number(countdown) / 30) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#888888] font-mono">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[10px] text-[#888888] text-right">
        Compiled exactly {computedStatuses.length} rows &bull; Engine Status: <span className="text-[#00C853] font-bold">ONLINE &bull; DYNAMIC AUTO-CALC ACTIVE</span>
      </p>
    </div>
  );
};
