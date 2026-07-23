/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Property, Booking, SystemParameters, UnitStatusRow, ComputedStatus } from '../types';

/**
 * Calculates the difference in days between two date strings (YYYY-MM-DD)
 * Returns date1 - date2 in days
 */
export function getDaysDiff(dateStr1: string, dateStr2: string): number {
  if (!dateStr1 || !dateStr2 || dateStr1 === '-' || dateStr2 === '-') return 0;
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Validates check-in/out range. Check-out must be after check-in.
 */
export function isValidDateRange(checkIn: string, checkOut: string): boolean {
  if (!checkIn || !checkOut) return false;
  return getDaysDiff(checkOut, checkIn) > 0;
}

/**
 * Core Formula Engine: Replicates 02_Unit_Status_Engine
 * Maps properties + bookings + params -> current statuses of all 32 properties
 */
export function calculateUnitStatuses(
  properties: Property[],
  bookings: Booking[],
  parameters: SystemParameters
): UnitStatusRow[] {
  const today = parameters.Para_Anchor_Date;
  const alertDays = parameters.Para_Alert_Days;

  return properties.map((prop) => {
    const uid = prop.Unit_ID;

    // Filter relevant non-cancelled bookings for this unit
    const unitBookings = bookings.filter(b => b.Unit_ID === uid && b.Status !== 'Cancelled');

    // 1. Check if occupied today (Status = Checked_in AND check_in <= today < check_out)
    const activeOccupiedBooking = unitBookings.find(
      b => b.Status === 'Checked_in' && getDaysDiff(today, b.Check_In) >= 0 && getDaysDiff(b.Check_Out, today) > 0
    );
    const isOcc = !!activeOccupiedBooking;

    // 2. Check if reserved today (Status = Confirmed AND check_in <= today < check_out)
    const activeReservedBooking = !isOcc ? unitBookings.find(
      b => b.Status === 'Confirmed' && getDaysDiff(today, b.Check_In) >= 0 && getDaysDiff(b.Check_Out, today) > 0
    ) : undefined;
    const isRes = !!activeReservedBooking;

    // 3. Find checkout date of the current tenant (if occupied)
    let coDate = '-';
    if (activeOccupiedBooking) {
      coDate = activeOccupiedBooking.Check_Out;
    }

    // 4. Find the next upcoming booking (Confirmed AND check_in > today)
    const upcomingBookings = unitBookings
      .filter(b => b.Status === 'Confirmed' && getDaysDiff(b.Check_In, today) > 0)
      .sort((a, b) => getDaysDiff(a.Check_In, b.Check_In));

    const nextUpcoming = upcomingBookings[0];
    const ciDate = nextUpcoming ? nextUpcoming.Check_In : '-';

    // 5. Determine today's status based on parameters (without hardcoding)
    let todayStatus: ComputedStatus = 'Vacant';
    let currentTenant = '-';
    let daysToEvent: number | '-' = '-';

    if (isOcc && activeOccupiedBooking) {
      currentTenant = activeOccupiedBooking.Tenant_Name;
      const daysToCheckout = getDaysDiff(coDate, today);
      
      if (daysToCheckout <= alertDays && daysToCheckout >= 0) {
        todayStatus = 'Checkout Soon';
      } else {
        todayStatus = 'Occupied';
      }
      daysToEvent = daysToCheckout;
    } else if (isRes && activeReservedBooking) {
      todayStatus = 'Reserved';
      currentTenant = activeReservedBooking.Tenant_Name;
      const daysToCheckout = getDaysDiff(activeReservedBooking.Check_Out, today);
      daysToEvent = daysToCheckout;
    } else {
      // It's technically vacant, check if a future check-in is upcoming soon
      if (ciDate !== '-') {
        const daysToNextCheckin = getDaysDiff(ciDate, today);
        if (daysToNextCheckin <= alertDays && daysToNextCheckin >= 0) {
          todayStatus = 'Check-in Soon';
        } else {
          todayStatus = 'Vacant';
        }
        daysToEvent = daysToNextCheckin;
      } else {
        todayStatus = 'Vacant';
        daysToEvent = '-';
      }
    }

    return {
      Unit_ID: uid,
      Unit_Name: prop.Unit_Name,
      Room_Type: prop.Room_Type,
      Base_Rent: prop.Base_Rent,
      Today_Status: todayStatus,
      Current_Tenant: currentTenant,
      Next_Checkin: ciDate,
      Days_To_Event: daysToEvent
    };
  });
}

/**
 * Aggregates KPIs: Replicates 00_Dashboard
 */
export function calculateDashboardKPIs(
  properties: Property[],
  computedStatuses: UnitStatusRow[],
  parameters: SystemParameters
) {
  const totalUnits = computedStatuses.length;

  // Occupied includes 'Occupied' and 'Checkout Soon'
  const occupiedUnits = computedStatuses.filter(
    s => s.Today_Status === 'Occupied' || s.Today_Status === 'Checkout Soon'
  ).length;

  // Vacant includes 'Vacant' and 'Check-in Soon'
  const vacantUnits = computedStatuses.filter(
    s => s.Today_Status === 'Vacant' || s.Today_Status === 'Check-in Soon'
  ).length;

  // Reserved includes 'Reserved' (locked bookings not yet checked-in today)
  const reservedUnits = computedStatuses.filter(
    s => s.Today_Status === 'Reserved'
  ).length;

  const occupancyRate = totalUnits > 0 ? occupiedUnits / totalUnits : 0;
  const vacancyRate = totalUnits > 0 ? vacantUnits / totalUnits : 0;

  const checkoutAlerts = computedStatuses.filter(s => s.Today_Status === 'Checkout Soon').length;
  const checkinAlerts = computedStatuses.filter(s => s.Today_Status === 'Check-in Soon').length;

  // Vacancy Loss: sum of (Base_Rent / 30) for Vacant or Check-in Soon properties
  const dailyVacancyLoss = computedStatuses
    .filter(s => s.Today_Status === 'Vacant' || s.Today_Status === 'Check-in Soon')
    .reduce((sum, s) => sum + (s.Base_Rent / 30), 0);

  return {
    totalUnits,
    occupiedUnits,
    vacantUnits,
    reservedUnits,
    occupancyRate,
    vacancyRate,
    checkoutAlerts,
    checkinAlerts,
    dailyVacancyLoss
  };
}

/**
 * Filter list: Replicates 03_Vacancy_List
 */
export function calculateVacancyList(computedStatuses: UnitStatusRow[]): UnitStatusRow[] {
  return computedStatuses.filter(
    s => s.Today_Status === 'Vacant' || s.Today_Status === 'Check-in Soon'
  );
}

/**
 * Converts status string to user friendly label
 */
export function getStatusText(status: ComputedStatus): string {
  switch (status) {
    case 'Occupied': return 'Occupied';
    case 'Checkout Soon': return 'Checkout Soon';
    case 'Reserved': return 'Reserved';
    case 'Check-in Soon': return 'Check-in Soon';
    case 'Vacant': return 'Vacant';
  }
}
