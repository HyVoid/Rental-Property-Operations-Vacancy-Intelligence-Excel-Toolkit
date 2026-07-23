/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Property, SystemParameters } from '../types';
import { Plus, Edit3, Trash, Calendar, Bell, DollarSign, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface ParametersViewProps {
  properties: Property[];
  parameters: SystemParameters;
  onUpdateParameters: (params: SystemParameters) => void;
  onAddProperty: (prop: Property) => void;
  onUpdateProperty: (prop: Property) => void;
  onDeleteProperty: (id: string) => void;
}

export const ParametersView: React.FC<ParametersViewProps> = ({
  properties,
  parameters,
  onUpdateParameters,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
}) => {
  // Parameters local form state
  const [paramAnchorDate, setParamAnchorDate] = useState(parameters.Para_Anchor_Date);
  const [paramAlertDays, setParamAlertDays] = useState(parameters.Para_Alert_Days.toString());
  const [paramTargetOcc, setParamTargetOcc] = useState(parameters.Para_Target_Occ.toString());
  const [paramCurrency, setParamCurrency] = useState(parameters.Para_Currency_Symbol);
  const [paramSuccess, setParamSuccess] = useState('');

  // Property Form state
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [propId, setPropId] = useState('');
  const [propName, setPropName] = useState('');
  const [propType, setPropType] = useState('Studio');
  const [propRent, setPropRent] = useState('');
  const [propError, setPropError] = useState('');

  // Submit System Parameters
  const handleSaveParameters = (e: React.FormEvent) => {
    e.preventDefault();
    setParamSuccess('');

    const days = parseInt(paramAlertDays);
    const occ = parseFloat(paramTargetOcc);

    if (!paramAnchorDate) {
      alert('Anchor Date is required.');
      return;
    }
    if (isNaN(days) || days < 0) {
      alert('Alert Days must be a non-negative integer.');
      return;
    }
    if (isNaN(occ) || occ < 0 || occ > 1) {
      alert('Target Occupancy must be a fraction between 0.00 and 1.00 (e.g., 0.85).');
      return;
    }

    onUpdateParameters({
      Para_Anchor_Date: paramAnchorDate,
      Para_Alert_Days: days,
      Para_Target_Occ: occ,
      Para_Currency_Symbol: paramCurrency,
    });

    setParamSuccess('✓ System parameters committed and stored! Downstream sheets automatically recalculated.');
    setTimeout(() => setParamSuccess(''), 2500);
  };

  // Open Property Modal (Add)
  const handleOpenAddProperty = () => {
    const nextIdNum = properties.reduce((max, p) => {
      const num = parseInt(p.Unit_ID.replace('U', ''));
      return !isNaN(num) && num > max ? num : max;
    }, 32);
    const newId = `U${(nextIdNum + 1).toString().padStart(2, '0')}`;

    setEditingProperty(null);
    setPropId(newId);
    setPropName(`Room ${(nextIdNum + 1) * 10 || 501}`);
    setPropType('Studio');
    setPropRent('1500');
    setPropError('');
    setIsPropertyModalOpen(true);
  };

  // Open Property Modal (Edit)
  const handleOpenEditProperty = (p: Property) => {
    setEditingProperty(p);
    setPropId(p.Unit_ID);
    setPropName(p.Unit_Name);
    setPropType(p.Room_Type);
    setPropRent(p.Base_Rent.toString());
    setPropError('');
    setIsPropertyModalOpen(true);
  };

  // Property submit
  const handlePropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPropError('');

    if (!propName.trim()) {
      setPropError('Property Name is required.');
      return;
    }
    const rentNum = parseFloat(propRent);
    if (isNaN(rentNum) || rentNum <= 0) {
      setPropError('Base rent standard must be a positive numeric value.');
      return;
    }

    if (!editingProperty) {
      const exists = properties.some(p => p.Unit_ID === propId);
      if (exists) {
        setPropError(`Property ID ${propId} already exists. Match with unique ID.`);
        return;
      }
    }

    const payload: Property = {
      Unit_ID: propId,
      Unit_Name: propName.trim(),
      Room_Type: propType,
      Base_Rent: rentNum,
    };

    if (editingProperty) {
      onUpdateProperty(payload);
    } else {
      onAddProperty(payload);
    }

    setIsPropertyModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* TITLE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif tracking-[-0.02em] text-[#051C2C] font-semibold">
            04_Parameters &bull; Global Constants & Property Master
          </h2>
          <p className="text-xs text-[#888888] font-sans-body mt-1">
            Centrally manage shared formulas coefficients, warning thresholds, and static properties metadata list.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PARAMS CONTROL CARD */}
        <div className="bg-white p-6 rounded-[14px] card-shadow-md space-y-4 lg:col-span-1 h-fit">
          <h3 className="text-sm font-serif font-bold text-[#051C2C] tracking-[0.01em] uppercase border-b border-[#E8E8E6] pb-2">
            Global Control Parameters
          </h3>

          <form onSubmit={handleSaveParameters} className="space-y-4">
            {paramSuccess && (
              <div className="p-3 bg-[#00C853]/[0.1] border-l-2 border-[#00C853] text-[#00C853] text-xs font-semibold rounded-[6px]">
                {paramSuccess}
              </div>
            )}

            {/* B3: Anchor Date */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#2251FF]" />
                System Anchor Date (B3)
              </label>
              <input 
                type="date"
                value={paramAnchorDate}
                onChange={(e) => setParamAnchorDate(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#FFFDE7] border border-[#E8E8E6] rounded-[6px] focus:outline-none focus:border-[#2251FF] text-[#051C2C] font-mono"
              />
              <p className="text-[10px] text-[#888888] mt-1 leading-normal">
                Baseline for calculating check-in and checkout status checks. Try simulated date testing.
              </p>
            </div>

            {/* B4: Alert Days Threshold */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1 flex items-center gap-1">
                <Bell className="w-3 h-3 text-[#2251FF]" />
                Warning Buffer Threshold (B4)
              </label>
              <input 
                type="number"
                value={paramAlertDays}
                onChange={(e) => setParamAlertDays(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#FFFDE7] border border-[#E8E8E6] rounded-[6px] focus:outline-none focus:border-[#2251FF] text-[#051C2C] font-mono font-bold"
              />
              <p className="text-[10px] text-[#888888] mt-1 leading-normal">
                Trigger warning status if the event checkout or check-in falls within this window (in days).
              </p>
            </div>

            {/* B5: Target Occupancy */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#2251FF]" />
                Target Occupancy Rate (B5)
              </label>
              <input 
                type="number"
                step="0.01"
                min="0.0"
                max="1.0"
                value={paramTargetOcc}
                onChange={(e) => setParamTargetOcc(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#FFFDE7] border border-[#E8E8E6] rounded-[6px] focus:outline-none focus:border-[#2251FF] text-[#051C2C] font-mono font-bold"
              />
              <p className="text-[10px] text-[#888888] mt-1 leading-normal">
                Fraction index representing the performance threshold metric on Dashboard (e.g., 0.85 for 85%).
              </p>
            </div>

            {/* B6: Currency Symbol */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-[#2251FF]" />
                Currency Symbol (B6)
              </label>
              <input 
                type="text"
                maxLength={3}
                value={paramCurrency}
                onChange={(e) => setParamCurrency(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#FFFDE7] border border-[#E8E8E6] rounded-[6px] focus:outline-none focus:border-[#2251FF] text-[#051C2C] font-bold"
              />
              <p className="text-[10px] text-[#888888] mt-1 leading-normal">
                Preferred currency sign injected into all monetary components (e.g. $, ¥, £, €).
              </p>
            </div>

            <button
              type="submit"
              className="w-full text-xs bg-[#2251FF] text-white py-2.5 px-4 rounded-[8px] font-medium card-shadow-sm hover:opacity-95 cursor-pointer transition-all flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Commit System Constants
            </button>
          </form>
        </div>

        {/* PROPERTY LISTING TABLE */}
        <div className="bg-white p-6 rounded-[14px] card-shadow-md space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#E8E8E6] pb-3">
            <h3 className="text-sm font-serif font-bold text-[#051C2C] tracking-[0.01em] uppercase">
              Properties Master Registry
            </h3>
            <button
              onClick={handleOpenAddProperty}
              className="flex items-center gap-1 text-[11px] bg-[#2251FF] text-white py-1.5 px-3 rounded-[6px] font-medium card-shadow-sm hover:opacity-90 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Property Room
            </button>
          </div>

          {/* TABLE DISPLAY */}
          <div className="overflow-x-auto no-scrollbar max-h-[480px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#051C2C]/[0.02] border-b border-[#E8E8E6] text-[#051C2C] text-[10px] font-semibold tracking-wider uppercase">
                  <th className="py-2.5 px-3">Unit ID</th>
                  <th className="py-2.5 px-3">Room Name</th>
                  <th className="py-2.5 px-3">Room Type</th>
                  <th className="py-2.5 px-3 text-right">Standard Base Rent</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-[#E8E8E6]">
                {properties.map((p, index) => (
                  <tr key={p.Unit_ID} className={`${index % 2 === 0 ? 'bg-[#F5F5F2]' : 'bg-white'} hover:bg-gray-50 transition-colors`}>
                    <td className="py-2 px-3 font-mono font-bold text-[#051C2C]">
                      {p.Unit_ID}
                    </td>
                    <td className="py-2 px-3 font-medium text-[#051C2C]">
                      {p.Unit_Name}
                    </td>
                    <td className="py-2 px-3 text-[#888888]">
                      {p.Room_Type}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-right text-[#051C2C]">
                      {paramCurrency}{p.Base_Rent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditProperty(p)}
                          className="p-1 text-[#051C2C] hover:text-[#2251FF] hover:scale-110 transition-all"
                          title="Edit property static properties"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete property ${p.Unit_ID} &bull; ${p.Unit_Name}? This deletes active status compilation matching this Unit ID.`)) {
                              onDeleteProperty(p.Unit_ID);
                            }
                          }}
                          className="p-1 text-[#888888] hover:text-[#D32F2F] hover:scale-110 transition-all"
                          title="Delete property static properties"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-[#2251FF]/[0.04] rounded-[8px] text-[11px] text-[#051C2C] leading-relaxed flex items-start gap-1.5 font-sans-body">
            <AlertCircle className="w-4 h-4 text-[#2251FF] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Scale-up proofing:</span> If you purchase a new property, adding it here will instantly spawn a row in the status evaluation sheets with ZERO manual dragging of cell reference ranges.
            </div>
          </div>
        </div>
      </div>

      {/* ADD / EDIT PROPERTY MODAL */}
      {isPropertyModalOpen && (
        <div className="fixed inset-0 bg-[#051C2C]/40 backdrop-blur-[6px] flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-[14px] card-shadow-lg overflow-hidden animate-fade-up">
            <div className="bg-[#051C2C] p-4 text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm">
                {editingProperty ? `Edit Property: ${propId}` : 'Add New Property Unit'}
              </h3>
              <button 
                onClick={() => setIsPropertyModalOpen(false)}
                className="text-white/[0.6] hover:text-white rounded p-1 hover:bg-white/[0.08]"
              >
                <Plus className="w-4 h-4 transform rotate-45" />
              </button>
            </div>

            <form onSubmit={handlePropertySubmit} className="p-6 space-y-4">
              {propError && (
                <div className="p-3 bg-red-50 border-l-2 border-[#D32F2F] text-[#D32F2F] text-xs flex items-start gap-1.5 rounded-[6px]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{propError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Unit ID */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">
                    Property ID (Static Key)
                  </label>
                  <input 
                    type="text"
                    value={propId}
                    onChange={(e) => setPropId(e.target.value)}
                    disabled={!!editingProperty}
                    placeholder="e.g. U33"
                    className="w-full text-xs p-2.5 bg-gray-100 border border-[#E8E8E6] rounded-[6px] text-[#888888] font-mono font-bold"
                  />
                </div>

                {/* Unit Name */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">
                    Unit Name / Room #
                  </label>
                  <input 
                    type="text"
                    value={propName}
                    onChange={(e) => setPropName(e.target.value)}
                    placeholder="e.g. Room 501"
                    className="w-full text-xs p-2.5 bg-[#FFFDE7] border border-[#E8E8E6] rounded-[6px] focus:outline-none focus:border-[#2251FF] text-[#051C2C] font-bold"
                  />
                </div>
              </div>

              {/* Room Type */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">
                  Room Physical Layout
                </label>
                <select
                  value={propType}
                  onChange={(e) => setPropType(e.target.value)}
                  className="w-full text-xs p-2.5 bg-[#FFFDE7] border border-[#E8E8E6] rounded-[6px] focus:outline-none focus:border-[#2251FF] text-[#051C2C]"
                >
                  <option value="Studio">Studio (Studio)</option>
                  <option value="1-Bedroom">1-Bedroom (1-Bed)</option>
                  <option value="2-Bedroom">2-Bedroom (2-Bed)</option>
                  <option value="Penthouse">Penthouse (豪华顶层)</option>
                </select>
              </div>

              {/* Base Rent */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">
                  Standard Guide Base Rent ({paramCurrency} / Mo)
                </label>
                <input 
                  type="number"
                  placeholder="e.g. 1500"
                  value={propRent}
                  onChange={(e) => setPropRent(e.target.value)}
                  className="w-full text-xs p-2.5 bg-[#FFFDE7] border border-[#E8E8E6] rounded-[6px] focus:outline-none focus:border-[#2251FF] text-[#051C2C] font-mono font-bold"
                />
              </div>

              {/* Submit buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E8E6]">
                <button 
                  type="button"
                  onClick={() => setIsPropertyModalOpen(false)}
                  className="text-xs text-[#051C2C] border border-[#E8E8E6] py-2 px-4 rounded-[8px] font-medium hover:bg-[#F5F5F2]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="text-xs bg-[#2251FF] text-white py-2 px-5 rounded-[8px] font-medium card-shadow-sm hover:opacity-90"
                >
                  Save Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
