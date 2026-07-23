/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Property {
  Unit_ID: string;
  Unit_Name: string;
  Room_Type: string;
  Base_Rent: number;
}

export type BookingStatus = 'Confirmed' | 'Checked_in' | 'Checked_out' | 'Cancelled';

export interface Booking {
  Booking_ID: string;
  Unit_ID: string;
  Tenant_Name: string;
  Check_In: string; // YYYY-MM-DD
  Check_Out: string; // YYYY-MM-DD
  Contract_Rent: number;
  Status: BookingStatus;
}

export interface SystemParameters {
  Para_Anchor_Date: string; // YYYY-MM-DD
  Para_Alert_Days: number; // e.g. 3
  Para_Target_Occ: number; // e.g. 0.85
  Para_Currency_Symbol: string; // e.g. "$"
}

export type ComputedStatus = 
  | 'Occupied' 
  | 'Checkout Soon' 
  | 'Reserved' 
  | 'Check-in Soon' 
  | 'Vacant';

export interface UnitStatusRow {
  Unit_ID: string;
  Unit_Name: string;
  Room_Type: string;
  Base_Rent: number;
  Today_Status: ComputedStatus;
  Current_Tenant: string;
  Next_Checkin: string; // YYYY-MM-DD or "-"
  Days_To_Event: number | "-"; // days until checkout (if occupied) or check-in (if vacant), or "-"
}

// Full State for import/export backups
export interface AppStateBackup {
  version: string;
  properties: Property[];
  bookings: Booking[];
  parameters: SystemParameters;
  lastSaved: string;
}

// Generate the 32 standard properties
export const INITIAL_PROPERTIES: Property[] = [
  { Unit_ID: 'U01', Unit_Name: 'Room 101', Room_Type: 'Studio', Base_Rent: 1200 },
  { Unit_ID: 'U02', Unit_Name: 'Room 102', Room_Type: 'Studio', Base_Rent: 1200 },
  { Unit_ID: 'U03', Unit_Name: 'Room 103', Room_Type: '1-Bedroom', Base_Rent: 1600 },
  { Unit_ID: 'U04', Unit_Name: 'Room 104', Room_Type: '1-Bedroom', Base_Rent: 1650 },
  { Unit_ID: 'U05', Unit_Name: 'Room 105', Room_Type: '2-Bedroom', Base_Rent: 2200 },
  { Unit_ID: 'U06', Unit_Name: 'Room 106', Room_Type: '2-Bedroom', Base_Rent: 2200 },
  { Unit_ID: 'U07', Unit_Name: 'Room 107', Room_Type: 'Penthouse', Base_Rent: 3500 },
  { Unit_ID: 'U08', Unit_Name: 'Room 108', Room_Type: '1-Bedroom', Base_Rent: 1600 },
  { Unit_ID: 'U09', Unit_Name: 'Room 201', Room_Type: 'Studio', Base_Rent: 1250 },
  { Unit_ID: 'U10', Unit_Name: 'Room 202', Room_Type: 'Studio', Base_Rent: 1250 },
  { Unit_ID: 'U11', Unit_Name: 'Room 203', Room_Type: '1-Bedroom', Base_Rent: 1700 },
  { Unit_ID: 'U12', Unit_Name: 'Room 204', Room_Type: '1-Bedroom', Base_Rent: 1700 },
  { Unit_ID: 'U13', Unit_Name: 'Room 205', Room_Type: '2-Bedroom', Base_Rent: 2300 },
  { Unit_ID: 'U14', Unit_Name: 'Room 206', Room_Type: '2-Bedroom', Base_Rent: 2300 },
  { Unit_ID: 'U15', Unit_Name: 'Room 207', Room_Type: 'Penthouse', Base_Rent: 3600 },
  { Unit_ID: 'U16', Unit_Name: 'Room 208', Room_Type: '1-Bedroom', Base_Rent: 1700 },
  { Unit_ID: 'U17', Unit_Name: 'Room 301', Room_Type: 'Studio', Base_Rent: 1300 },
  { Unit_ID: 'U18', Unit_Name: 'Room 302', Room_Type: 'Studio', Base_Rent: 1300 },
  { Unit_ID: 'U19', Unit_Name: 'Room 303', Room_Type: '1-Bedroom', Base_Rent: 1750 },
  { Unit_ID: 'U20', Unit_Name: 'Room 304', Room_Type: '1-Bedroom', Base_Rent: 1750 },
  { Unit_ID: 'U21', Unit_Name: 'Room 305', Room_Type: '2-Bedroom', Base_Rent: 2400 },
  { Unit_ID: 'U22', Unit_Name: 'Room 306', Room_Type: '2-Bedroom', Base_Rent: 2400 },
  { Unit_ID: 'U23', Unit_Name: 'Room 307', Room_Type: 'Penthouse', Base_Rent: 3800 },
  { Unit_ID: 'U24', Unit_Name: 'Room 308', Room_Type: '1-Bedroom', Base_Rent: 1750 },
  { Unit_ID: 'U25', Unit_Name: 'Room 401', Room_Type: 'Studio', Base_Rent: 1350 },
  { Unit_ID: 'U26', Unit_Name: 'Room 402', Room_Type: 'Studio', Base_Rent: 1350 },
  { Unit_ID: 'U27', Unit_Name: 'Room 403', Room_Type: '1-Bedroom', Base_Rent: 1800 },
  { Unit_ID: 'U28', Unit_Name: 'Room 404', Room_Type: '1-Bedroom', Base_Rent: 1800 },
  { Unit_ID: 'U29', Unit_Name: 'Room 405', Room_Type: '2-Bedroom', Base_Rent: 2500 },
  { Unit_ID: 'U30', Unit_Name: 'Room 406', Room_Type: '2-Bedroom', Base_Rent: 2500 },
  { Unit_ID: 'U31', Unit_Name: 'Room 407', Room_Type: 'Penthouse', Base_Rent: 4000 },
  { Unit_ID: 'U32', Unit_Name: 'Room 408', Room_Type: '1-Bedroom', Base_Rent: 1800 },
];

export const INITIAL_PARAMETERS: SystemParameters = {
  Para_Anchor_Date: '2026-07-20', // Explicit mock baseline matching current local time context year
  Para_Alert_Days: 3,
  Para_Target_Occ: 0.85,
  Para_Currency_Symbol: '$',
};

// Initial bookings designed to populate various cell states based on Anchor_Date = 2026-07-20 and Alert_Days = 3
export const INITIAL_BOOKINGS: Booking[] = [
  // 1. Fully Occupied (Checked_in, far from checkout)
  { Booking_ID: 'BK-0001', Unit_ID: 'U01', Tenant_Name: 'John Smith', Check_In: '2026-07-01', Check_Out: '2026-07-31', Contract_Rent: 1250, Status: 'Checked_in' },
  { Booking_ID: 'BK-0002', Unit_ID: 'U03', Tenant_Name: 'Alice Johnson', Check_In: '2026-06-15', Check_Out: '2026-08-15', Contract_Rent: 1650, Status: 'Checked_in' },
  { Booking_ID: 'BK-0003', Unit_ID: 'U05', Tenant_Name: 'Michael Brown', Check_In: '2026-07-10', Check_Out: '2026-08-10', Contract_Rent: 2200, Status: 'Checked_in' },
  { Booking_ID: 'BK-0004', Unit_ID: 'U07', Tenant_Name: 'Sophia Martinez', Check_In: '2026-07-05', Check_Out: '2026-09-05', Contract_Rent: 3600, Status: 'Checked_in' },
  { Booking_ID: 'BK-0005', Unit_ID: 'U09', Tenant_Name: 'James Wilson', Check_In: '2026-07-01', Check_Out: '2026-08-01', Contract_Rent: 1300, Status: 'Checked_in' },
  { Booking_ID: 'BK-0006', Unit_ID: 'U11', Tenant_Name: 'Olivia Davis', Check_In: '2026-06-01', Check_Out: '2026-08-01', Contract_Rent: 1750, Status: 'Checked_in' },
  { Booking_ID: 'BK-0007', Unit_ID: 'U13', Tenant_Name: 'Robert Thomas', Check_In: '2026-07-12', Check_Out: '2026-08-12', Contract_Rent: 2350, Status: 'Checked_in' },
  { Booking_ID: 'BK-0008', Unit_ID: 'U15', Tenant_Name: 'Emily Taylor', Check_In: '2026-07-01', Check_Out: '2026-07-28', Contract_Rent: 3500, Status: 'Checked_in' },
  { Booking_ID: 'BK-0009', Unit_ID: 'U17', Tenant_Name: 'William Anderson', Check_In: '2026-07-05', Check_Out: '2026-08-05', Contract_Rent: 1350, Status: 'Checked_in' },
  { Booking_ID: 'BK-0010', Unit_ID: 'U19', Tenant_Name: 'Isabella Thomas', Check_In: '2026-06-20', Check_Out: '2026-07-25', Contract_Rent: 1750, Status: 'Checked_in' },
  { Booking_ID: 'BK-0011', Unit_ID: 'U21', Tenant_Name: 'David Jackson', Check_In: '2026-07-01', Check_Out: '2026-08-01', Contract_Rent: 2400, Status: 'Checked_in' },
  { Booking_ID: 'BK-0012', Unit_ID: 'U23', Tenant_Name: 'Charlotte White', Check_In: '2026-06-10', Check_Out: '2026-08-10', Contract_Rent: 3900, Status: 'Checked_in' },
  { Booking_ID: 'BK-0013', Unit_ID: 'U25', Tenant_Name: 'Joseph Harris', Check_In: '2026-07-01', Check_Out: '2026-07-31', Contract_Rent: 1350, Status: 'Checked_in' },
  { Booking_ID: 'BK-0014', Unit_ID: 'U27', Tenant_Name: 'Amelia Martin', Check_In: '2026-07-01', Check_Out: '2026-08-01', Contract_Rent: 1800, Status: 'Checked_in' },
  { Booking_ID: 'BK-0015', Unit_ID: 'U29', Tenant_Name: 'Charles Thompson', Check_In: '2026-07-15', Check_Out: '2026-08-15', Contract_Rent: 2500, Status: 'Checked_in' },
  { Booking_ID: 'BK-0016', Unit_ID: 'U31', Tenant_Name: 'Patricia Garcia', Check_In: '2026-07-01', Check_Out: '2026-08-31', Contract_Rent: 4100, Status: 'Checked_in' },

  // 2. Checkout Soon (Checked_in, checkout date is <= Anchor_Date + Alert_Days, which is 2026-07-23)
  { Booking_ID: 'BK-0017', Unit_ID: 'U02', Tenant_Name: 'Richard Miller', Check_In: '2026-06-22', Check_Out: '2026-07-22', Contract_Rent: 1200, Status: 'Checked_in' }, // 2 days left
  { Booking_ID: 'BK-0018', Unit_ID: 'U04', Tenant_Name: 'Sarah Clark', Check_In: '2026-06-21', Check_Out: '2026-07-21', Contract_Rent: 1700, Status: 'Checked_in' }, // 1 day left

  // 3. Reserved (Confirmed, anchor date is inside the booking range)
  { Booking_ID: 'BK-0019', Unit_ID: 'U06', Tenant_Name: 'Thomas Lewis', Check_In: '2026-07-18', Check_Out: '2026-07-26', Contract_Rent: 2200, Status: 'Confirmed' },

  // 4. Check-in Soon (Confirmed, check-in date is <= Anchor_Date + Alert_Days, but check_in > Anchor_Date)
  { Booking_ID: 'BK-0020', Unit_ID: 'U08', Tenant_Name: 'Jessica Robinson', Check_In: '2026-07-23', Check_Out: '2026-08-23', Contract_Rent: 1600, Status: 'Confirmed' }, // check-in in 3 days
  { Booking_ID: 'BK-0021', Unit_ID: 'U10', Tenant_Name: 'Daniel Walker', Check_In: '2026-07-21', Check_Out: '2026-08-21', Contract_Rent: 1250, Status: 'Confirmed' }, // check-in in 1 day

  // 5. Historial booking / Cancelled booking (does not impact today)
  { Booking_ID: 'BK-0022', Unit_ID: 'U01', Tenant_Name: 'Mark Allen', Check_In: '2026-05-01', Check_Out: '2026-06-01', Contract_Rent: 1200, Status: 'Checked_out' },
  { Booking_ID: 'BK-0023', Unit_ID: 'U03', Tenant_Name: 'Sandra King', Check_In: '2026-07-01', Check_Out: '2026-07-10', Contract_Rent: 1600, Status: 'Checked_out' },
  { Booking_ID: 'BK-0024', Unit_ID: 'U12', Tenant_Name: 'George Wright', Check_In: '2026-07-15', Check_Out: '2026-08-15', Contract_Rent: 1700, Status: 'Cancelled' },
];
