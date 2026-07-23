/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Property, Booking, SystemParameters, AppStateBackup,
  INITIAL_PROPERTIES, INITIAL_BOOKINGS, INITIAL_PARAMETERS 
} from './types';
import { calculateUnitStatuses } from './utils/formulas';

// Import Views
import { DashboardView } from './components/DashboardView';
import { BookingMasterView } from './components/BookingMasterView';
import { UnitStatusEngineView } from './components/UnitStatusEngineView';
import { VacancyListView } from './components/VacancyListView';
import { ParametersView } from './components/ParametersView';

// Icons
import { 
  BarChart3, FileSpreadsheet, Cpu, ClipboardList, Sliders,
  CloudLightning, RefreshCw, Download, Upload, RotateCcw
} from 'lucide-react';

type TabId = '00_Dashboard' | '01_Booking_Master' | '02_Unit_Status_Engine' | '03_Vacancy_List' | '04_Parameters';

export default function App() {
  // State Initialization from LocalStorage
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('furnished_SaaS_properties_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AppStateBackup;
        if (Array.isArray(parsed.properties)) return parsed.properties;
      } catch (e) {
        console.error('Failed to load properties from cache', e);
      }
    }
    return INITIAL_PROPERTIES;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('furnished_SaaS_properties_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AppStateBackup;
        if (Array.isArray(parsed.bookings)) return parsed.bookings;
      } catch (e) {
        console.error('Failed to load bookings from cache', e);
      }
    }
    return INITIAL_BOOKINGS;
  });

  const [parameters, setParameters] = useState<SystemParameters>(() => {
    const saved = localStorage.getItem('furnished_SaaS_properties_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AppStateBackup;
        if (parsed.parameters) return parsed.parameters;
      } catch (e) {
        console.error('Failed to load parameters from cache', e);
      }
    }
    return INITIAL_PARAMETERS;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<TabId>('00_Dashboard');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  // Auto-Save Effect
  useEffect(() => {
    const state: AppStateBackup = {
      version: '1.0.0',
      properties,
      bookings,
      parameters,
      lastSaved: new Date().toLocaleTimeString('en-US', { hour12: false })
    };
    localStorage.setItem('furnished_SaaS_properties_v1', JSON.stringify(state));
    
    const timeString = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: false 
    });
    setLastSavedTime(timeString);
  }, [properties, bookings, parameters]);

  // Dynamic status evaluation block
  const computedStatuses = calculateUnitStatuses(properties, bookings, parameters);

  // --- Ledgers State Updates ---
  const handleAddBooking = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  const handleUpdateBooking = (updatedBooking: Booking) => {
    setBookings((prev) => prev.map(b => b.Booking_ID === updatedBooking.Booking_ID ? updatedBooking : b));
  };

  const handleDeleteBooking = (id: string) => {
    setBookings((prev) => prev.filter(b => b.Booking_ID !== id));
  };

  const handleBulkImportBookings = (imported: Booking[]) => {
    setBookings((prev) => {
      // Avoid duplicate Booking_IDs, replace match or append
      const existingMap = new Map(prev.map(b => [b.Booking_ID, b]));
      imported.forEach(b => {
        existingMap.set(b.Booking_ID, b);
      });
      return Array.from(existingMap.values());
    });
  };

  // --- Parameters & Properties Static Master updates ---
  const handleUpdateParameters = (params: SystemParameters) => {
    setParameters(params);
  };

  const handleAddProperty = (newProperty: Property) => {
    setProperties((prev) => [...prev, newProperty]);
  };

  const handleUpdateProperty = (updatedProperty: Property) => {
    setProperties((prev) => prev.map(p => p.Unit_ID === updatedProperty.Unit_ID ? updatedProperty : p));
  };

  const handleDeleteProperty = (id: string) => {
    setProperties((prev) => prev.filter(p => p.Unit_ID !== id));
    // Cascade delete or clean up booking's unit dependencies safely if needed
  };

  // --- Backup File Utilities ---
  const handleExportBackup = () => {
    const state: AppStateBackup = {
      version: '1.0.0',
      properties,
      bookings,
      parameters,
      lastSaved: new Date().toLocaleString('en-US')
    };

    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `furnish_saas_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as AppStateBackup;

        if (Array.isArray(parsed.properties) && Array.isArray(parsed.bookings) && parsed.parameters) {
          setProperties(parsed.properties);
          setBookings(parsed.bookings);
          setParameters(parsed.parameters);
          alert('✓ SaaS system backup backup file parsed & state successfully restored! Real-time compiler updated.');
        } else {
          alert('Failed to parse backup. Check json schema criteria compatibility.');
        }
      } catch (err: any) {
        alert(`Error parsing backup: ${err.message}`);
      }
    };
    reader.readAsText(file);
    if (backupFileInputRef.current) {
      backupFileInputRef.current.value = '';
    }
  };

  const handleResetData = () => {
    if (window.confirm('⚠️ CRITICAL WARNING:\nAre you sure you want to reset all current SaaS properties records, customized parameters, and ledger bookings back to factory initial status? This action cannot be undone.')) {
      localStorage.removeItem('furnished_SaaS_properties_v1');
      setProperties(INITIAL_PROPERTIES);
      setBookings(INITIAL_BOOKINGS);
      setParameters(INITIAL_PARAMETERS);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F2] text-[#1A1A2E] flex flex-col font-sans selection:bg-[#2251FF]/[0.1] selection:text-[#2251FF]">
      
      {/* SECTION 1: STICKY HORIZONTAL NAVIGATION BAR (56px) */}
      <header className="sticky top-0 z-40 h-[56px] bg-white border-b border-[#E8E8E6] card-shadow-sm px-6 flex items-center justify-between print:hidden">
        
        {/* Brand logo & Outstanding Operations signature */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[8px] bg-[#051C2C] flex items-center justify-center font-bold text-white text-base font-serif tracking-tighter shadow-sm">
            32
          </div>
          <div>
            <h1 className="text-sm font-serif font-bold text-[#051C2C] tracking-tight uppercase leading-none">
              Rental Property Operations & Vacancy Intelligence Excel Toolkit
            </h1>
            <span className="text-[10px] text-[#888888] font-semibold tracking-wider font-sans-body uppercase">
              Outstanding Operations SaaS
            </span>
          </div>
        </div>

        {/* Tab switcher */}
        <nav className="h-full hidden md:flex items-center space-x-1 pl-6">
          <button
            onClick={() => setActiveTab('00_Dashboard')}
            className={`h-full text-xs font-semibold px-4 cursor-pointer transition-all relative flex items-center gap-1 ${
              activeTab === '00_Dashboard' ? 'text-[#051C2C]' : 'text-[#888888] hover:text-[#051C2C]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#2251FF]" />
            <span>00_Dashboard</span>
            {activeTab === '00_Dashboard' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2251FF] rounded-t-full"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('01_Booking_Master')}
            className={`h-full text-xs font-semibold px-4 cursor-pointer transition-all relative flex items-center gap-1 ${
              activeTab === '01_Booking_Master' ? 'text-[#051C2C]' : 'text-[#888888] hover:text-[#051C2C]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#2251FF]" />
            <span>01_Booking_Master</span>
            {activeTab === '01_Booking_Master' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2251FF] rounded-t-full"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('02_Unit_Status_Engine')}
            className={`h-full text-xs font-semibold px-4 cursor-pointer transition-all relative flex items-center gap-1 ${
              activeTab === '02_Unit_Status_Engine' ? 'text-[#051C2C]' : 'text-[#888888] hover:text-[#051C2C]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#2251FF]" />
            <span>02_Unit_Status_Engine</span>
            {activeTab === '02_Unit_Status_Engine' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2251FF] rounded-t-full"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('03_Vacancy_List')}
            className={`h-full text-xs font-semibold px-4 cursor-pointer transition-all relative flex items-center gap-1 ${
              activeTab === '03_Vacancy_List' ? 'text-[#051C2C]' : 'text-[#888888] hover:text-[#051C2C]'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 text-[#2251FF]" />
            <span>03_Vacancy_List</span>
            {activeTab === '03_Vacancy_List' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2251FF] rounded-t-full"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('04_Parameters')}
            className={`h-full text-xs font-semibold px-4 cursor-pointer transition-all relative flex items-center gap-1 ${
              activeTab === '04_Parameters' ? 'text-[#051C2C]' : 'text-[#888888] hover:text-[#051C2C]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#2251FF]" />
            <span>04_Parameters</span>
            {activeTab === '04_Parameters' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2251FF] rounded-t-full"></span>
            )}
          </button>
        </nav>

        {/* Global Control Widgets (Last Saved, Export/Import, Reset) */}
        <div className="flex items-center gap-2">
          {/* Last Saved feedback */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#888888] mr-2">
            <span className="w-1.5 h-1.5 bg-[#00C853] rounded-full"></span>
            <span>Last saved: <span className="font-mono font-bold text-[#051C2C]">{lastSavedTime || 'Pending'}</span></span>
          </div>

          {/* Backup Action Stack */}
          <div className="flex items-center bg-[#F5F5F2] p-1 rounded-[8px] border border-[#E8E8E6] text-[#051C2C]">
            {/* Export */}
            <button
              onClick={handleExportBackup}
              className="p-1.5 hover:bg-white rounded-[6px] transition-all cursor-pointer"
              title="Export Full SaaS Backup (.json)"
            >
              <Download className="w-3.5 h-3.5 text-[#051C2C]" />
            </button>

            {/* Import trigger */}
            <button
              onClick={() => backupFileInputRef.current?.click()}
              className="p-1.5 hover:bg-white rounded-[6px] transition-all cursor-pointer"
              title="Import SaaS Backup (.json)"
            >
              <Upload className="w-3.5 h-3.5 text-[#051C2C]" />
              <input 
                type="file"
                ref={backupFileInputRef}
                onChange={handleImportBackup}
                accept=".json"
                className="hidden"
              />
            </button>

            {/* Reset */}
            <button
              onClick={handleResetData}
              className="p-1.5 hover:bg-white rounded-[6px] transition-all text-[#888888] hover:text-[#D32F2F] cursor-pointer"
              title="Reset System Data to Default Seed Data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE SHEET NAV BAR (Shown on small screens) */}
      <div className="md:hidden bg-white border-b border-[#E8E8E6] p-2 flex overflow-x-auto gap-1 no-scrollbar print:hidden">
        {[
          { id: '00_Dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: '01_Booking_Master', label: 'Ledger', icon: FileSpreadsheet },
          { id: '02_Unit_Status_Engine', label: 'Engine', icon: Cpu },
          { id: '03_Vacancy_List', label: 'Vacancy', icon: ClipboardList },
          { id: '04_Parameters', label: 'Parameters', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`flex items-center gap-1 py-1.5 px-3 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-all ${
                isSelected ? 'bg-[#051C2C] text-white' : 'text-[#888888] hover:bg-gray-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 2: CENTRAL MAIN CONTENT ZONE (Max Width 1400px, 40px left/right padding) */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-10 py-10">
        
        {/* Render Selected View */}
        {activeTab === '00_Dashboard' && (
          <DashboardView
            properties={properties}
            bookings={bookings}
            parameters={parameters}
            computedStatuses={computedStatuses}
          />
        )}

        {activeTab === '01_Booking_Master' && (
          <BookingMasterView
            properties={properties}
            bookings={bookings}
            onAddBooking={handleAddBooking}
            onUpdateBooking={handleUpdateBooking}
            onDeleteBooking={handleDeleteBooking}
            onBulkImport={handleBulkImportBookings}
            currencySymbol={parameters.Para_Currency_Symbol}
          />
        )}

        {activeTab === '02_Unit_Status_Engine' && (
          <UnitStatusEngineView
            properties={properties}
            bookings={bookings}
            parameters={parameters}
            computedStatuses={computedStatuses}
          />
        )}

        {activeTab === '03_Vacancy_List' && (
          <VacancyListView
            properties={properties}
            bookings={bookings}
            parameters={parameters}
            computedStatuses={computedStatuses}
          />
        )}

        {activeTab === '04_Parameters' && (
          <ParametersView
            properties={properties}
            parameters={parameters}
            onUpdateParameters={handleUpdateParameters}
            onAddProperty={handleAddProperty}
            onUpdateProperty={handleUpdateProperty}
            onDeleteProperty={handleDeleteProperty}
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-[#E8E8E6] py-5 px-6 text-center text-[11px] text-[#888888] mt-12 print:hidden">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 px-4">
          <span className="font-serif font-bold text-[#051C2C]">
            Rental Property Operations & Vacancy Intelligence Excel Toolkit &copy; 2026. All rights reserved.
          </span>
          <div className="flex items-center gap-4 text-xs font-medium text-[#888888]">
            <span>Automated Save Mode: <span className="text-[#00C853] font-bold">Enabled</span></span>
            <span>Platform: <span className="text-[#2251FF] font-bold">SaaS Core v1.0.0</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
