/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Property, Booking, BookingStatus } from '../types';
import { isValidDateRange } from '../utils/formulas';
import { 
  Plus, Edit2, Trash2, Upload, Download, FileText, X, Search, Filter, HelpCircle, AlertCircle
} from 'lucide-react';

interface BookingMasterViewProps {
  properties: Property[];
  bookings: Booking[];
  onAddBooking: (booking: Booking) => void;
  onUpdateBooking: (booking: Booking) => void;
  onDeleteBooking: (id: string) => void;
  onBulkImport: (imported: Booking[]) => void;
  currencySymbol: string;
}

export const BookingMasterView: React.FC<BookingMasterViewProps> = ({
  properties,
  bookings,
  onAddBooking,
  onUpdateBooking,
  onDeleteBooking,
  onBulkImport,
  currencySymbol,
}) => {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [unitFilter, setUnitFilter] = useState<string>('ALL');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Form Fields
  const [formBookingId, setFormBookingId] = useState('');
  const [formUnitId, setFormUnitId] = useState('');
  const [formTenantName, setFormTenantName] = useState('');
  const [formCheckIn, setFormCheckIn] = useState('');
  const [formCheckOut, setFormCheckOut] = useState('');
  const [formContractRent, setFormContractRent] = useState('');
  const [formStatus, setFormStatus] = useState<BookingStatus>('Confirmed');
  const [formError, setFormError] = useState('');

  // Bulk CSV state
  const [csvText, setCsvText] = useState('');
  const [csvError, setCsvError] = useState('');
  const [csvSuccessCount, setCsvSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = b.Tenant_Name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.Booking_ID.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.Status === statusFilter;
    const matchesUnit = unitFilter === 'ALL' || b.Unit_ID === unitFilter;
    return matchesSearch && matchesStatus && matchesUnit;
  });

  // Open modal for Adding
  const handleOpenAdd = () => {
    const nextIdNum = bookings.reduce((max, b) => {
      const num = parseInt(b.Booking_ID.replace('BK-', ''));
      return !isNaN(num) && num > max ? num : max;
    }, 24); // Starting after initial dummy IDs
    const newId = `BK-${(nextIdNum + 1).toString().padStart(4, '0')}`;
    
    setEditingBooking(null);
    setFormBookingId(newId);
    setFormUnitId(properties[0]?.Unit_ID || '');
    setFormTenantName('');
    setFormCheckIn('2026-07-20');
    setFormCheckOut('2026-08-20');
    setFormContractRent(properties[0]?.Base_Rent.toString() || '1500');
    setFormStatus('Confirmed');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (b: Booking) => {
    setEditingBooking(b);
    setFormBookingId(b.Booking_ID);
    setFormUnitId(b.Unit_ID);
    setFormTenantName(b.Tenant_Name);
    setFormCheckIn(b.Check_In);
    setFormCheckOut(b.Check_Out);
    setFormContractRent(b.Contract_Rent.toString());
    setFormStatus(b.Status);
    setFormError('');
    setIsModalOpen(true);
  };

  // When changing unit selection in form, automatically recommend standard Base_Rent
  const handleUnitChange = (uid: string) => {
    setFormUnitId(uid);
    const matched = properties.find(p => p.Unit_ID === uid);
    if (matched) {
      setFormContractRent(matched.Base_Rent.toString());
    }
  };

  // Handle Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formTenantName.trim()) {
      setFormError('Tenant Name is required.');
      return;
    }
    if (!formCheckIn || !formCheckOut) {
      setFormError('Check-in and Check-out dates are required.');
      return;
    }
    if (!isValidDateRange(formCheckIn, formCheckOut)) {
      setFormError('Check-out date must be strictly after Check-in date.');
      return;
    }
    const rentNum = parseFloat(formContractRent);
    if (isNaN(rentNum) || rentNum <= 0) {
      setFormError('Contract rent must be a positive numeric value.');
      return;
    }

    // Verify booking ID unique for new entries
    if (!editingBooking) {
      const exists = bookings.some(b => b.Booking_ID === formBookingId);
      if (exists) {
        setFormError(`Booking ID ${formBookingId} already exists. Please choose a unique ID.`);
        return;
      }
    }

    const payload: Booking = {
      Booking_ID: formBookingId,
      Unit_ID: formUnitId,
      Tenant_Name: formTenantName.trim(),
      Check_In: formCheckIn,
      Check_Out: formCheckOut,
      Contract_Rent: rentNum,
      Status: formStatus
    };

    if (editingBooking) {
      onUpdateBooking(payload);
    } else {
      onAddBooking(payload);
    }
    setIsModalOpen(false);
  };

  // Helper: parse simple CSV
  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    // Simple robust header parsing
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    
    // Match headers to target fields
    return lines.slice(1).map(line => {
      // Split with quotes safety
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^["']|["']$/g, ''));
      const row: any = {};
      headers.forEach((h, i) => {
        row[h] = values[i] || '';
      });
      return row;
    });
  };

  // Handle CSV file upload
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
    };
    reader.readAsText(file);
  };

  // Handle Bulk CSV Process & Validation
  const handleProcessImport = () => {
    setCsvError('');
    setCsvSuccessCount(null);

    if (!csvText.trim()) {
      setCsvError('Please paste CSV text or upload a CSV file.');
      return;
    }

    try {
      const parsedRows = parseCSV(csvText);
      if (parsedRows.length === 0) {
        setCsvError('Failed to parse. Ensure CSV has a valid header and at least one data row.');
        return;
      }

      // Check required columns
      const required = ['Booking_ID', 'Unit_ID', 'Tenant_Name', 'Check_In', 'Check_Out', 'Contract_Rent', 'Status'];
      const firstRow = parsedRows[0];
      const missing = required.filter(col => !(col in firstRow));

      if (missing.length > 0) {
        setCsvError(`Missing columns in CSV header: ${missing.join(', ')}`);
        return;
      }

      const validBookings: Booking[] = [];
      const invalidRows: string[] = [];

      parsedRows.forEach((row, index) => {
        const rowNum = index + 2; // index 0 is row 2
        const bid = row.Booking_ID?.trim();
        const uid = row.Unit_ID?.trim();
        const tenant = row.Tenant_Name?.trim();
        const cin = row.Check_In?.trim();
        const cout = row.Check_Out?.trim();
        const rent = parseFloat(row.Contract_Rent);
        const status = row.Status?.trim() as BookingStatus;

        // Validation checks
        if (!bid || !uid || !tenant || !cin || !cout || isNaN(rent)) {
          invalidRows.push(`Row ${rowNum}: Empty values or invalid rent numeric format`);
          return;
        }

        // Validate Unit ID is in properties master (foreign key restriction)
        const unitExists = properties.some(p => p.Unit_ID === uid);
        if (!unitExists) {
          invalidRows.push(`Row ${rowNum}: Unit_ID "${uid}" does not exist in 04_Parameters`);
          return;
        }

        // Validate Status matches standard mapping
        const allowedStatuses = ['Confirmed', 'Checked_in', 'Checked_out', 'Cancelled'];
        if (!allowedStatuses.includes(status)) {
          invalidRows.push(`Row ${rowNum}: Status "${status}" must be Confirmed, Checked_in, Checked_out, or Cancelled`);
          return;
        }

        // Validate dates
        if (!isValidDateRange(cin, cout)) {
          invalidRows.push(`Row ${rowNum}: Check_Out must be after Check_In`);
          return;
        }

        validBookings.push({
          Booking_ID: bid,
          Unit_ID: uid,
          Tenant_Name: tenant,
          Check_In: cin,
          Check_Out: cout,
          Contract_Rent: rent,
          Status: status
        });
      });

      if (invalidRows.length > 0) {
        setCsvError(`Import aborted. Validation failures:\n` + invalidRows.slice(0, 5).join('\n') + (invalidRows.length > 5 ? `\n...and ${invalidRows.length - 5} more errors` : ''));
        return;
      }

      onBulkImport(validBookings);
      setCsvSuccessCount(validBookings.length);
      setCsvText('');
      setTimeout(() => {
        setIsImportOpen(false);
        setCsvSuccessCount(null);
      }, 1500);

    } catch (err: any) {
      setCsvError(`Unexpected parser exception: ${err.message}`);
    }
  };

  // Export full bookings as CSV
  const handleExportCSV = () => {
    const headers = 'Booking_ID,Unit_ID,Tenant_Name,Check_In,Check_Out,Contract_Rent,Status\n';
    const rows = bookings.map(b => 
      `"${b.Booking_ID}","${b.Unit_ID}","${b.Tenant_Name.replace(/"/g, '""')}","${b.Check_In}","${b.Check_Out}",${b.Contract_Rent},"${b.Status}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bookings_master_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif tracking-[-0.02em] text-[#051C2C] font-semibold">
            01_Booking_Master &bull; Unified Transaction Ledger
          </h2>
          <p className="text-xs text-[#888888] font-sans-body mt-1">
            The single source of truth for all bookings. Insert, update, or import bulk records. Calculated values flow downstream instantly.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1 text-xs bg-white text-[#051C2C] border border-[#E8E8E6] py-2 px-3 rounded-[8px] font-medium card-shadow-sm hover:translate-y-[-1px] cursor-pointer transition-all duration-150"
          >
            <Download className="w-3.5 h-3.5 text-[#2251FF]" /> Export CSV
          </button>
          <button 
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-1 text-xs bg-white text-[#051C2C] border border-[#E8E8E6] py-2 px-3 rounded-[8px] font-medium card-shadow-sm hover:translate-y-[-1px] cursor-pointer transition-all duration-150"
          >
            <Upload className="w-3.5 h-3.5 text-[#2251FF]" /> Bulk CSV Import
          </button>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-1 text-xs bg-[#2251FF] text-white py-2 px-4 rounded-[8px] font-medium card-shadow-sm hover:opacity-90 hover:translate-y-[-1px] cursor-pointer transition-all duration-150"
          >
            <Plus className="w-4 h-4" /> Add Reservation
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white p-4 rounded-[12px] card-shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#888888]" />
          <input 
            type="text" 
            placeholder="Search tenant or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-[#E8E8E6] rounded-[8px] focus:outline-none focus:border-[#2251FF]"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Status filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-[11px] text-[#888888] uppercase tracking-wider font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1.5 px-3 border border-[#E8E8E6] rounded-[8px] focus:outline-none focus:border-[#2251FF] bg-[#F5F5F2]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Confirmed">Confirmed (Confirmed)</option>
              <option value="Checked_in">Checked-In (Checked_in)</option>
              <option value="Checked_out">Checked-Out (Checked_out)</option>
              <option value="Cancelled">Cancelled (Cancelled)</option>
            </select>
          </div>

          {/* Unit ID filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-[11px] text-[#888888] uppercase tracking-wider font-semibold">Unit:</span>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="text-xs py-1.5 px-3 border border-[#E8E8E6] rounded-[8px] focus:outline-none focus:border-[#2251FF] bg-[#F5F5F2]"
            >
              <option value="ALL">All Units</option>
              {properties.map(p => (
                <option key={p.Unit_ID} value={p.Unit_ID}>{p.Unit_ID} &bull; {p.Unit_Name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-[14px] card-shadow-md overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#051C2C]/[0.04] border-b-2 border-[#051C2C]/[0.12] text-[#051C2C] text-[11px] font-semibold tracking-[0.06em] uppercase">
                <th className="py-3 px-4 font-semibold">Booking ID</th>
                <th className="py-3 px-4 font-semibold">Unit</th>
                <th className="py-3 px-4 font-semibold">Tenant Name</th>
                <th className="py-3 px-4 font-semibold">Check-In</th>
                <th className="py-3 px-4 font-semibold">Check-Out</th>
                <th className="py-3 px-4 font-semibold text-right">Contract Rent</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-[#E8E8E6]">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b, index) => (
                  <tr 
                    key={b.Booking_ID} 
                    className={`${index % 2 === 0 ? 'bg-[#F5F5F2]' : 'bg-white'} hover:bg-[#2251FF]/[0.02] transition-colors`}
                  >
                    <td className="py-3 px-4 font-mono font-medium text-[#051C2C]">{b.Booking_ID}</td>
                    <td className="py-3 px-4 font-medium text-[#051C2C]">
                      <span className="bg-[#051C2C]/[0.06] text-[#051C2C] px-1.5 py-0.5 rounded font-mono text-[10px] font-bold">
                        {b.Unit_ID}
                      </span>
                      <span className="ml-1 text-[#888888]">
                        {properties.find(p => p.Unit_ID === b.Unit_ID)?.Unit_Name || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#051C2C]">{b.Tenant_Name}</td>
                    <td className="py-3 px-4 font-mono text-[#888888]">{b.Check_In}</td>
                    <td className="py-3 px-4 font-mono text-[#888888]">{b.Check_Out}</td>
                    <td className="py-3 px-4 font-mono font-bold text-right text-[#051C2C]">
                      {currencySymbol}{b.Contract_Rent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        b.Status === 'Checked_in' ? 'bg-[#00C853]/[0.1] text-[#00C853]' :
                        b.Status === 'Confirmed' ? 'bg-[#2251FF]/[0.1] text-[#2251FF]' :
                        b.Status === 'Checked_out' ? 'bg-[#888888]/[0.15] text-[#888888]' :
                        'bg-[#D32F2F]/[0.1] text-[#D32F2F]'
                      }`}>
                        {b.Status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 text-[#051C2C] hover:text-[#2251FF] hover:scale-110 transition-all rounded"
                          title="Edit booking row"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete transaction ${b.Booking_ID}?`)) {
                              onDeleteBooking(b.Booking_ID);
                            }
                          }}
                          className="p-1.5 text-[#888888] hover:text-[#D32F2F] hover:scale-110 transition-all rounded"
                          title="Delete booking row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#888888] italic">
                    No ledger transactions matching the filter. Click "Add Reservation" or modify constraints.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER METRICS INFO */}
      <p className="text-[10px] text-[#888888] text-right font-sans-body">
        Showing {filteredBookings.length} of {bookings.length} ledger transactions. Column calculations bound with 04_Parameters and verified real-time.
      </p>

      {/* ADD / EDIT TRANSACTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#051C2C]/40 backdrop-blur-[6px] flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-[14px] card-shadow-lg overflow-hidden animate-fade-up">
            {/* Header */}
            <div className="bg-[#051C2C] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#2251FF]" />
                <h3 className="font-serif font-bold text-sm">
                  {editingBooking ? `Edit Ledger Transaction: ${formBookingId}` : 'Add New Ledger Transaction'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/[0.6] hover:text-white rounded p-1 hover:bg-white/[0.08]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border-l-2 border-[#D32F2F] text-[#D32F2F] text-xs flex items-start gap-1.5 rounded-[6px]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Booking ID */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">
                    Booking ID (System Key)
                  </label>
                  <input 
                    type="text"
                    value={formBookingId}
                    onChange={(e) => setFormBookingId(e.target.value)}
                    disabled={!!editingBooking}
                    className="w-full text-xs p-2.5 bg-gray-100 border border-[#E8E8E6] rounded-[6px] focus:outline-none text-[#888888] font-mono font-semibold"
                  />
                </div>

                {/* Unit ID Dropdown */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">
                    Unit ID (Foreign Key)
                  </label>
                  <select
                    value={formUnitId}
                    onChange={(e) => handleUnitChange(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#FFFDE7] border border-[#E8E8E6] rounded-[6px] focus:outline-none focus:border-[#2251FF] font-mono text-[#051C2C]"
                  >
                    {properties.map(p => (
                      <option key={p.Unit_ID} value={p.Unit_ID}>{p.Unit_ID} - {p.Unit_Name} ({p.Room_Type})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tenant Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">
                  Tenant Full Name
                </label>
                <input 
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formTenantName}
                  onChange={(e) => setFormTenantName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-[#FFFDE7] border border-[#E8E8E6] rounded-[6px] focus:outline-none focus:border-[#2251FF] text-[#051C2C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Check In */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">
                    Check-In Date
                  </label>
                  <input 
                    type="date"
                    value={formCheckIn}
                    onChange={(e) => setFormCheckIn(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#FFFDE7] border border-[#E8E8E6] rounded-[6px] focus:outline-none focus:border-[#2251FF] text-[#051C2C] font-mono"
                  />
                </div>

                {/* Check Out */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">
                    Check-Out Date
                  </label>
                  <input 
                    type="date"
                    value={formCheckOut}
                    onChange={(e) => setFormCheckOut(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#FFFDE7] border border-[#E8E8E6] rounded-[6px] focus:outline-none focus:border-[#2251FF] text-[#051C2C] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Rent */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">
                    Contract Rent ({currencySymbol} / Mo)
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1500"
                    value={formContractRent}
                    onChange={(e) => setFormContractRent(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#FFFDE7] border border-[#E8E8E6] rounded-[6px] focus:outline-none focus:border-[#2251FF] text-[#051C2C] font-mono font-bold"
                  />
                </div>

                {/* Booking Status Dropdown */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">
                    Booking Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as BookingStatus)}
                    className="w-full text-xs p-2.5 bg-[#FFFDE7] border border-[#E8E8E6] rounded-[6px] focus:outline-none focus:border-[#2251FF] text-[#051C2C] font-bold"
                  >
                    <option value="Confirmed">Confirmed (待入住)</option>
                    <option value="Checked_in">Checked_in (已入住)</option>
                    <option value="Checked_out">Checked_out (正常退房)</option>
                    <option value="Cancelled">Cancelled (已取消)</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E8E6]">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs text-[#051C2C] border border-[#E8E8E6] py-2 px-4 rounded-[8px] font-medium hover:bg-[#F5F5F2] cursor-pointer transition-all duration-150"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="text-xs bg-[#2251FF] text-white py-2 px-5 rounded-[8px] font-medium card-shadow-sm hover:opacity-90 cursor-pointer transition-all duration-150"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {isImportOpen && (
        <div className="fixed inset-0 bg-[#051C2C]/40 backdrop-blur-[6px] flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-[14px] card-shadow-lg overflow-hidden animate-fade-up">
            <div className="bg-[#051C2C] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-[#2251FF]" />
                <h3 className="font-serif font-bold text-sm">Bulk CSV Transaction Importer</h3>
              </div>
              <button 
                onClick={() => setIsImportOpen(false)}
                className="text-white/[0.6] hover:text-white rounded p-1 hover:bg-white/[0.08]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {csvError && (
                <div className="p-3 bg-red-50 border-l-2 border-[#D32F2F] text-[#D32F2F] text-xs font-mono whitespace-pre-wrap rounded-[6px]">
                  {csvError}
                </div>
              )}
              {csvSuccessCount !== null && (
                <div className="p-3 bg-[#00C853]/[0.1] border-l-2 border-[#00C853] text-[#00C853] text-xs font-bold rounded-[6px]">
                  ✓ Successfully imported {csvSuccessCount} transactions! Compiling dynamic statuses downstream...
                </div>
              )}

              {/* CSV Instructions */}
              <div className="p-4 bg-[#2251FF]/[0.04] border-l-3 border-[#2251FF] rounded-[8px] text-xs text-[#051C2C] space-y-2">
                <p className="font-bold">Required CSV Layout Instructions:</p>
                <p className="text-[#888888] leading-relaxed">
                  Your CSV must start with the exact header name mapping below:
                </p>
                <pre className="p-2 bg-white text-[10px] font-mono border border-[#E8E8E6] rounded text-[#051C2C] overflow-x-auto">
                  Booking_ID,Unit_ID,Tenant_Name,Check_In,Check_Out,Contract_Rent,Status
                </pre>
                <p className="text-[#888888] leading-relaxed">
                  Status allowed values: <span className="font-mono text-[#051C2C]">Confirmed</span>, <span className="font-mono text-[#051C2C]">Checked_in</span>, <span className="font-mono text-[#051C2C]">Checked_out</span>, <span className="font-mono text-[#051C2C]">Cancelled</span>.
                </p>
              </div>

              {/* Upload controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File picker */}
                <div className="border-2 border-dashed border-[#E8E8E6] p-6 rounded-[8px] flex flex-col items-center justify-center space-y-2 text-center bg-[#F5F5F2]">
                  <Upload className="w-8 h-8 text-[#888888]" />
                  <span className="text-xs text-[#051C2C] font-semibold">Upload spreadsheet .csv file</span>
                  <input 
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleCSVUpload}
                    className="hidden"
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] bg-white text-[#051C2C] py-1 px-3 border border-[#E8E8E6] rounded-[6px] font-medium hover:bg-gray-50 cursor-pointer"
                  >
                    Browse Files
                  </button>
                </div>

                {/* Paste Text template download */}
                <div className="flex flex-col justify-between p-4 border border-[#E8E8E6] rounded-[8px]">
                  <span className="text-xs text-[#051C2C] font-semibold">Quick paste template download:</span>
                  <p className="text-[11px] text-[#888888]">
                    Generate ready template to edit in Excel / Notepad.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const sample = `Booking_ID,Unit_ID,Tenant_Name,Check_In,Check_Out,Contract_Rent,Status\nBK-1001,U01,Guest One,2026-07-20,2026-07-30,1300,Confirmed\nBK-1002,U12,Guest Two,2026-07-21,2026-08-21,1700,Checked_in`;
                      setCsvText(sample);
                    }}
                    className="flex items-center gap-1 text-[11px] bg-white text-[#051C2C] border border-[#E8E8E6] py-1.5 px-3 rounded-[6px] justify-center hover:bg-gray-50 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#2251FF]" /> Load Clipboard Sample
                  </button>
                </div>
              </div>

              {/* Text area for raw paste */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1">
                  CSV Clipboard / Preview Editor
                </label>
                <textarea
                  rows={6}
                  placeholder="Booking_ID,Unit_ID,Tenant_Name,Check_In,Check_Out,Contract_Rent,Status..."
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full text-xs p-2.5 bg-[#FFFDE7] border border-[#E8E8E6] rounded-[6px] font-mono focus:outline-none focus:border-[#2251FF] text-[#051C2C]"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E8E6]">
                <button 
                  type="button"
                  onClick={() => setIsImportOpen(false)}
                  className="text-xs text-[#051C2C] border border-[#E8E8E6] py-2 px-4 rounded-[8px] font-medium hover:bg-[#F5F5F2] cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleProcessImport}
                  className="text-xs bg-[#2251FF] text-white py-2 px-5 rounded-[8px] font-medium card-shadow-sm hover:opacity-90 cursor-pointer transition-all"
                >
                  Validate & Commit Bulk CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
