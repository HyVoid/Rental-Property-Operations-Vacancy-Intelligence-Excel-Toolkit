/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Property, Booking, SystemParameters, UnitStatusRow } from '../types';
import { calculateVacancyList } from '../utils/formulas';
import { Printer, Share2, Clipboard, ShieldCheck, Mail, ArrowUpRight } from 'lucide-react';

interface VacancyListViewProps {
  properties: Property[];
  bookings: Booking[];
  parameters: SystemParameters;
  computedStatuses: UnitStatusRow[];
}

export const VacancyListView: React.FC<VacancyListViewProps> = ({
  properties,
  bookings,
  parameters,
  computedStatuses,
}) => {
  const vacantList = calculateVacancyList(computedStatuses);
  const currency = parameters.Para_Currency_Symbol;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyClipboard = () => {
    const listText = vacantList.map(v => 
      `${v.Unit_Name} (${v.Room_Type}) - ${currency}${v.Base_Rent}/mo. Status: ${v.Today_Status}. Next Check-in: ${v.Next_Checkin}`
    ).join('\n');
    
    navigator.clipboard.writeText(`Active Vacant Properties (${parameters.Para_Anchor_Date}):\n${listText}`);
    alert('✓ Vacancy list copied to clipboard in plain text standard format!');
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* HEADER BAR - Hidden in print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-serif tracking-[-0.02em] text-[#051C2C] font-semibold">
            03_Vacancy_List &bull; Real-time To-Let Pipeline
          </h2>
          <p className="text-xs text-[#888888] font-sans-body mt-1">
            Sales pipeline tool. Dynamically filters out all Occupied properties. Provides current price points, next tenant ETA, and vacancy security buffers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyClipboard}
            className="flex items-center gap-1.5 text-xs bg-white text-[#051C2C] border border-[#E8E8E6] py-2 px-3 rounded-[8px] font-medium card-shadow-sm hover:translate-y-[-1px] cursor-pointer transition-all duration-150"
          >
            <Share2 className="w-3.5 h-3.5 text-[#2251FF]" /> Copy Text List
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs bg-[#2251FF] text-white py-2 px-4 rounded-[8px] font-medium card-shadow-sm hover:opacity-90 hover:translate-y-[-1px] cursor-pointer transition-all duration-150"
          >
            <Printer className="w-3.5 h-3.5" /> Export PDF / Print
          </button>
        </div>
      </div>

      {/* PRINT-ONLY COMPANION HEADER */}
      <div className="hidden print:block space-y-2 border-b-2 border-[#051C2C] pb-4">
        <h1 className="text-2xl font-serif font-bold text-[#051C2C]">
          32 Furnished Properties Outstanding Operations System
        </h1>
        <h2 className="text-lg font-serif text-[#051C2C]">
          03_Vacancy_List &bull; Live Vacancy and Availability Pipeline
        </h2>
        <div className="flex justify-between text-xs text-[#888888] font-mono">
          <span>Anchor Calculation Date: {parameters.Para_Anchor_Date}</span>
          <span>Printed: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* BULLET INSIGHT */}
      <div className="bg-[#2251FF]/[0.04] p-4 rounded-[12px] border-l-[3px] border-[#2251FF] print:hidden">
        <div className="text-xs text-[#051C2C] leading-relaxed flex items-start gap-2">
          <ArrowUpRight className="w-4 h-4 text-[#2251FF] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Sales & Agent Instruction:</span> There are currently <span className="font-bold text-[#2251FF]">{vacantList.length} rooms</span> open for immediate booking or within pre-checkin cleaning alert intervals. Coordinate with保洁 (保洁 housekeeping) for units labeled <span className="text-[#2251FF] font-semibold">Check-In Soon</span> to avoid overlapping operational friction.
          </div>
        </div>
      </div>

      {/* PIPELINE TABLE */}
      <div className="bg-white rounded-[14px] card-shadow-md overflow-hidden print:shadow-none print:border print:border-[#E8E8E6]">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#051C2C]/[0.04] border-b-2 border-[#051C2C]/[0.12] text-[#051C2C] text-[11px] font-semibold tracking-[0.06em] uppercase">
                <th className="py-3 px-4">Unit ID</th>
                <th className="py-3 px-4">Property Room</th>
                <th className="py-3 px-4">Room Type</th>
                <th className="py-3 px-4 text-right">Base Rent</th>
                <th className="py-3 px-4">Leasing Status</th>
                <th className="py-3 px-4">Next Confirmed Entry</th>
                <th className="py-3 px-4 text-center">Security Buffer</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-[#E8E8E6]">
              {vacantList.length > 0 ? (
                vacantList.map((v, index) => {
                  const daysToEvent = v.Days_To_Event;
                  const isCheckinSoon = v.Today_Status === 'Check-in Soon';

                  return (
                    <tr 
                      key={v.Unit_ID} 
                      className={`${index % 2 === 0 ? 'bg-[#F5F5F2]' : 'bg-white'} hover:bg-[#2251FF]/[0.01] transition-colors`}
                    >
                      {/* Unit ID */}
                      <td className="py-3 px-4 font-mono font-bold text-[#051C2C]">
                        {v.Unit_ID}
                      </td>

                      {/* Property Room */}
                      <td className="py-3 px-4 font-medium text-[#051C2C]">
                        {v.Unit_Name}
                      </td>

                      {/* Room Type */}
                      <td className="py-3 px-4 text-[#888888] font-sans-body">
                        {v.Room_Type}
                      </td>

                      {/* Base Rent */}
                      <td className="py-3 px-4 font-mono font-bold text-right text-[#051C2C]">
                        {currency}{v.Base_Rent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {isCheckinSoon ? (
                          <span className="inline-flex items-center text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#2251FF]/[0.1] text-[#2251FF]">
                            🔑 Check-In Soon
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#00C853]/[0.1] text-[#00C853]">
                            Vacant (Ready)
                          </span>
                        )}
                      </td>

                      {/* Next Checkin */}
                      <td className="py-3 px-4 font-mono text-[#888888]">
                        {v.Next_Checkin === '-' ? 'No Bookings Logged' : v.Next_Checkin}
                      </td>

                      {/* Countdown to check-in */}
                      <td className="py-3 px-4 text-center">
                        {daysToEvent !== '-' ? (
                          <span className={`font-mono font-bold py-1 px-2.5 rounded text-[11px] ${
                            isCheckinSoon ? 'bg-[#D32F2F]/[0.08] text-[#D32F2F]' : 'bg-[#2251FF]/[0.08] text-[#2251FF]'
                          }`}>
                            {daysToEvent} Days Left
                          </span>
                        ) : (
                          <span className="text-[#888888] font-mono italic">Infinite Buffer</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#888888] italic">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShieldCheck className="w-8 h-8 text-[#00C853]" />
                      <span className="font-semibold text-[#051C2C]">暂无空置房源 &bull; No Vacant Units Available</span>
                      <p className="text-xs text-[#888888] max-w-sm">
                        All 32 properties are fully occupied with stable lease agreements. Check 01_Booking_Master for upcoming checkout dates.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT-ONLY FOOTER */}
      <div className="hidden print:block text-[10px] text-[#888888] text-right mt-12 border-t border-[#E8E8E6] pt-2">
        Outstanding Operations Management Software Suite &bull; Strictly Confidential internal use.
      </div>

      <p className="text-[10px] text-[#888888] text-right print:hidden">
        Showing {vacantList.length} of {properties.length} total units. Print this sheet to generate a PDF flyer instantly.
      </p>
    </div>
  );
};
