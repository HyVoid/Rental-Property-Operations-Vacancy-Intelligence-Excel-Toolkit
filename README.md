# English | 简体中文

# Rental Property Operations & Vacancy Intelligence Excel Toolkit

![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Browser%20%7C%20Excel-success)
![Tool](https://img.shields.io/badge/Tool-Rental%20Operations%20Decision%20Support-orange)

**Track occupancy, vacancy, upcoming turnovers, rental readiness, and operational priorities from one booking table—without rebuilding reports, installing software, or maintaining formulas. Available free in both Browser and Excel versions.**

> ## **No signup. No installation. Free.**
>
> 🌐 **Open in Browser**  
> Browser edition (HTML live demo)
>
> 📥 **Download Excel**  
> Excel workbook (GitHub Release / Gumroad)

---

## Screenshots

### Browser Version

<!-- screenshot: browser version -->

*A browser-based operational dashboard showing live occupancy, vacancy alerts, turnover schedules, and portfolio KPIs.*

### Excel Version

<!-- screenshot: excel version -->

*The Excel workbook providing booking management, automated property status calculation, vacancy intelligence, and executive dashboards.*

---

## What It Helps You Track

- Real-time occupied units, vacant units, reserved units, and turnover readiness in one operational view.
- Upcoming check-ins and check-outs before they become operational bottlenecks.
- Vacancy windows that can still be marketed before the next confirmed booking.
- Daily revenue lost because properties remain vacant instead of generating rental income.
- Rental performance across an entire portfolio without manually checking every booking.
- Property expansion without redesigning reports when new units are added.

---

# Quick Start Workflow

Instead of maintaining multiple calendars, occupancy spreadsheets, and manually updated vacancy lists, this toolkit follows a simple operational workflow that can be repeated whenever booking information changes.

### 1. Configure operational parameters

Open the **Parameters** worksheet once and define the values that drive the workbook.

Typical examples include:

- System date
- Alert window (for example 3 days before turnover)
- Target occupancy rate
- Currency
- Property master list

These settings rarely change after initial setup.

---

### 2. Import existing booking records

Paste booking data into the dedicated booking sheet.

Existing information can come directly from:

- Property management software exports
- Booking platform CSV files
- Accounting systems
- Previous Excel trackers
- Any spreadsheet with reservation records

No manual restructuring or report rebuilding is required.

---

### 3. Review operational results

Switch to the Dashboard.

The workbook immediately updates:

- Current occupancy
- Vacancy list
- Upcoming turnovers
- Available units
- Occupancy KPIs
- Vacancy cost estimates

No refresh buttons or manual calculations are required.

---

### 4. Refresh whenever bookings change

As reservations are added, cancelled, or completed, only the booking table needs updating.

Everything else—including vacancy reports, operational alerts, executive dashboards, and property status calculations—updates automatically.

**Set a few key parameters. Drop in existing booking data. Get operational insight immediately. Refresh only when booking information changes.**

---

# Why I Built This

Most rental businesses do not struggle because they lack booking data.

They struggle because the operational picture is fragmented.

Bookings live in one spreadsheet.

Vacancy lists live somewhere else.

Cleaning schedules are maintained separately.

Managers mentally estimate which units are becoming available next week, while leasing staff often work from outdated vacancy reports.

The result is not simply administrative inconvenience.

It becomes an operational decision problem.

A vacant apartment may sit empty for several unnecessary days because nobody noticed that another reservation had been cancelled.

A cleaning team may prepare the wrong unit because the latest booking update never reached the operations spreadsheet.

Executives often see occupancy percentages without understanding *which* units are actually driving the problem.

I wanted a reusable analytical framework rather than another booking spreadsheet.

Instead of asking people to manually maintain multiple reports, the workbook treats every reservation as a single operational source of truth.

For example:

**Before**

Unit 204 appears occupied because last week's report was never updated after an early checkout.

Leasing staff stop advertising it.

Three rental days are lost.

**After**

The booking record changes once.

The vacancy engine immediately classifies Unit 204 as vacant.

The vacancy list updates.

The dashboard reflects the reduced occupancy.

Operations can begin marketing immediately.

The workbook is less about recording reservations and more about turning booking history into operational decisions that can be trusted.

---

# Common Rental Operations Problems This Solves

| Problem | Without This Tool | With This Tool |
|----------|------------------|----------------|
| Vacancy status becomes outdated | Staff manually compare booking calendars | Vacancy status updates automatically from reservation records |
| Turnover preparation starts too late | Upcoming check-outs are discovered manually | Turnover alerts appear automatically before deadlines |
| Leasing teams market the wrong properties | Old vacancy reports continue circulating | Live vacancy list always reflects current booking status |
| Managers cannot explain occupancy changes | Occupancy percentages have little operational context | Dashboard connects occupancy with actual property status |
| Portfolio growth breaks spreadsheets | Additional units require copying formulas everywhere | Property master expands automatically while calculations remain consistent |

---

# Who This Is For

This toolkit is designed for:

- Property managers overseeing residential rental portfolios.
- Short-term rental operators managing furnished apartments.
- Small property management companies that rely heavily on Excel.
- Leasing coordinators responsible for vacancy turnaround.
- Operations managers who need a single operational picture instead of multiple disconnected spreadsheets.

It is **not** intended to replace enterprise Property Management Systems (PMS), accounting platforms, or reservation software.

Instead, it provides a lightweight operational decision-support layer that sits on top of existing booking data.

No spreadsheet expertise is required. Open the Browser version or Excel workbook and begin tracking operational performance immediately.

---

# About

I build lightweight Excel-based operational decision tools for situations where there are simply too many moving parts to keep in your head.

The question behind every project is always the same:

> **What information needs to exist in one place so the next operational decision becomes obvious?**

The **Rental Property Operations & Vacancy Intelligence Excel Toolkit** is one example of that philosophy—turning booking records into operational visibility instead of another spreadsheet full of disconnected data.
## Technical Details

<details>
<summary>For technical reviewers, Excel practitioners, and collaborators</summary>

### Workbook Architecture

The workbook follows a strict **single-source-of-truth** architecture. Reservation records are entered once, business logic is calculated centrally, and every report references the same calculation layer.

```
Booking Records
        │
        ▼
01_Booking_Master
(Data Input)

        │
        ▼

02_Unit_Status_Engine
(Status Calculation Engine)

        │
 ┌──────┴────────┐
 ▼               ▼

03_Vacancy_List   00_Dashboard
(Output)          (Executive View)

        ▲
        │
04_Parameters
(Global Configuration)
```

| Worksheet | Primary Role | Editable | Purpose |
|------------|--------------|----------|----------|
| 00_Dashboard | Executive reporting | No | Portfolio KPIs and operational alerts |
| 01_Booking_Master | Reservation input | Yes | Single operational source of truth |
| 02_Unit_Status_Engine | Calculation engine | No | Determines live property status |
| 03_Vacancy_List | Operational output | No | Automatically generated vacancy opportunities |
| 04_Parameters | Configuration | Yes | Global assumptions, property master and thresholds |

### Data Flow

```
Property Master
        │
        ▼
Booking Records
        │
        ▼
Status Engine
        │
        ├────────► Dashboard
        │
        └────────► Vacancy List
```

Only two worksheets require routine maintenance:

- Property master
- Booking master

Everything else is generated automatically.

---

## Design Principles

### One source of truth

Reservation information is never duplicated.

Occupancy reports, vacancy lists, operational alerts and executive dashboards all reference the same booking table.

This prevents different departments from working from different versions of the truth.

---

### Parameter-driven calculations

Operational assumptions are stored centrally rather than embedded inside formulas.

Typical configurable parameters include:

- Anchor date
- Occupancy target
- Alert window
- Currency
- Property master

Changing one parameter updates every downstream calculation.

---

### Dynamic array architecture

The workbook is designed around modern Excel dynamic arrays.

Instead of copying formulas downward, calculations automatically expand when:

- additional bookings are added
- additional properties are created
- historical data grows

No manual maintenance is required after expansion.

---

### Separation of responsibilities

The workbook intentionally separates:

Input

↓

Business Logic

↓

Decision Output

This reduces accidental editing while making troubleshooting substantially easier.

---

## Three Traps That Catch Even Experienced Property Managers

### Trap 1 — Occupancy Looks High, But Revenue Opportunity Is Poor

A manager reports an 85% occupancy rate.

Everything appears healthy.

However, several vacant apartments became available yesterday after unexpected early departures.

Because the vacancy report is updated only weekly, leasing activity never begins.

The occupancy percentage remains acceptable while rental opportunity is quietly disappearing.

| Incorrect Interpretation | Correct Interpretation |
|--------------------------|------------------------|
| Portfolio occupancy is acceptable. | Vacancy age and availability matter as much as occupancy percentage. |
| Weekly reporting is sufficient. | Vacancy should be identified immediately after booking changes. |

Instead of measuring occupancy alone, the workbook continuously identifies which specific units are now available for leasing.

Operational recommendation:

- Begin marketing immediately.
- Trigger turnover workflow.
- Reduce vacancy days instead of merely monitoring occupancy.

<details>
<summary>Formula logic</summary>

Core logic evaluates:

- Booking overlap
- Reservation status
- Current anchor date
- Alert thresholds

The result classifies every unit into standardized operational states such as:

- Occupied
- Reserved
- Checkout Soon
- Check-in Soon
- Vacant

</details>

---

### Trap 2 — Turnover Planning Starts Too Late

Cleaning schedules are often created after tenants leave.

Operationally this is already too late.

Every additional preparation day delays the next rental.

The underlying mistake is treating check-out as an event instead of a predictable future milestone.

| Incorrect Approach | Correct Approach |
|--------------------|------------------|
| Wait until departure occurs. | Plan before departure occurs. |
| Cleaning begins afterward. | Cleaning resources are scheduled in advance. |
| Leasing begins after inspection. | Marketing begins before turnover. |

Instead of reacting to completed departures, the workbook continuously monitors future checkout windows.

Managers know which units require preparation several days before occupancy changes.

<details>
<summary>Formula logic</summary>

Alert windows compare:

Current Date

↓

Checkout Date

↓

Configured Alert Threshold

Properties inside the threshold automatically appear as operational alerts.

</details>

---

### Trap 3 — Portfolio Growth Breaks Existing Reports

Many Excel workbooks work well until additional properties are introduced.

Formula ranges stop expanding.

Dashboards exclude new apartments.

Vacancy reports become incomplete.

Managers gradually lose confidence in reporting.

The underlying issue is fixed-range spreadsheet design.

| Traditional Workbook | Dynamic Workbook |
|----------------------|------------------|
| Copy formulas manually | Automatic expansion |
| Update multiple reports | Update one property master |
| Risk inconsistent calculations | One calculation engine |
| Frequent maintenance | Minimal maintenance |

Instead of treating expansion as a spreadsheet redesign project, this workbook treats new properties as additional master data.

Operational consequence:

Adding Unit 33 requires only one additional row inside the Property Master.

The status engine, dashboard and vacancy reports expand automatically.

<details>
<summary>Formula logic</summary>

Dynamic arrays retrieve:

Property Master

↓

Property IDs

↓

Status Engine

↓

Dashboard

↓

Vacancy List

No manual formula copying is required.

</details>

---

### Example Scenario

A furnished rental operator manages **32 apartments**.

On Monday morning, three reservation changes occur:

- Unit 204 checks out two days earlier than expected.
- Unit 108 receives a confirmed reservation beginning next week.
- Unit 312 has its reservation cancelled.

Without a centralized operational model, several departments continue working from yesterday's reports.

Leasing staff still believe Unit 204 is occupied.

Cleaning schedules ignore the early vacancy.

Managers continue reporting yesterday's occupancy percentage.

With this workbook, only the Booking Master changes.

Immediately afterward:

- Unit 204 becomes **Vacant**
- Unit 108 becomes **Check-in Soon**
- Unit 312 returns to **Vacant**

The vacancy report refreshes automatically.

Dashboard KPIs update immediately.

Operational alerts identify which apartments require action first.

Instead of discovering these issues during the weekly operations meeting, managers see them within seconds after updating reservations.

This changes operational behavior from reactive reporting into proactive portfolio management.

---

### Formula Reference

The workbook groups calculations by operational responsibility rather than by worksheet complexity.

<details>
<summary>Booking Master</summary>

### Purpose

Stores the single source of truth for every reservation.

### Key Functions

| Function | Purpose |
|----------|---------|
| Structured Tables | Automatically expand as bookings grow |
| Data Validation | Prevent invalid Property IDs and booking status |
| XLOOKUP | Retrieve related property information |
| COUNTIFS | Evaluate active reservations |
| MINIFS | Find upcoming check-ins and check-outs |

### Notes

Only this worksheet should be edited during daily operations.

</details>

<details>
<summary>Unit Status Engine</summary>

### Purpose

Transforms raw booking records into standardized operational states.

### Primary Logic

```
Booking Dates
        │
        ▼

Compare Against

Anchor Date

        │
        ▼

Evaluate

Reservation Status

        │
        ▼

Return

Occupied
Reserved
Checkout Soon
Check-in Soon
Vacant
```

### Core Functions

- LET()
- MAP()
- LAMBDA()
- COUNTIFS()
- MINIFS()
- XLOOKUP()

These functions eliminate copied formulas and allow calculations to expand automatically as additional properties are introduced.

</details>

<details>
<summary>Dashboard</summary>

### Purpose

Aggregate operational information into executive KPIs.

Typical calculations include:

- Occupancy Rate
- Vacancy Rate
- Reserved Units
- Upcoming Check-outs
- Upcoming Check-ins
- Estimated Daily Vacancy Cost

The dashboard contains aggregation logic only and does not duplicate booking calculations.

</details>

<details>
<summary>Vacancy List</summary>

### Purpose

Produce an operational vacancy report without manual filtering.

Typical functions include:

- FILTER()
- XLOOKUP()
- Dynamic Arrays

Only properties currently available—or approaching availability according to operational rules—appear in this report.

</details>

### Validation Rules

| Field | Validation Rule | Error Behavior |
|------|-----------------|----------------|
| Property ID | Must exist in Property Master | Prevent invalid lookup |
| Booking ID | Unique value required | Duplicate reservation rejected |
| Check-in Date | Required | Booking considered incomplete |
| Check-out Date | Must be later than Check-in | Invalid reservation flagged |
| Booking Status | Must match predefined status list | Status calculation ignored until corrected |
| Rental Amount | Numeric value only | Financial summaries excluded |
| Alert Threshold | Positive integer | Operational alerts disabled if invalid |
| Anchor Date | Valid Excel date | Status engine cannot classify properties |
| Property Master | Unique Property IDs | Prevent duplicate asset records |
| Vacancy Output | Read-only generated range | Manual edits overwritten by calculation engine |

### Operational Assumptions

- Reservation history is maintained in a single booking table.
- Property IDs remain unique across the workbook.
- Every reservation belongs to exactly one property.
- Dashboard metrics are derived exclusively from the status engine.
- Business rules are parameter-driven rather than hard-coded into formulas.
- Dynamic array support requires Microsoft Excel 365 or Excel 2021 and later.

### Reproducibility

The workbook is intentionally designed so that identical booking data always produces identical operational outputs.

Changing only one booking record automatically propagates through:

```
Booking Master

↓

Status Engine

↓

Dashboard

↓

Vacancy List
```

This deterministic calculation flow makes the workbook suitable for operational review, historical analysis, and future occupancy simulation without rebuilding reports.

</details>

---

## Other Tools in This Series

If you find this workbook useful, you may also be interested in other lightweight Excel decision-support tools built using the same design philosophy:

- **Inventory Planning & Reorder Decision Toolkit** — Demand-driven replenishment and purchasing decisions.
- **Restaurant Menu Configuration & Modifier Pricing Toolkit** — Menu engineering and pricing consistency.
- **Employee Performance & Annual Work Planning Toolkit** — Performance tracking and annual objective management.
- **Manufacturing Cost & Unit Economics Toolkit** — Product costing, contribution margin, and production planning.
- **Construction Estimate & Cost Tracking Toolkit** — Estimate preparation and project cost monitoring.
- More projects are available through the GitHub profile and Gumroad store.

---

## License

This project is licensed under the **Apache License 2.0**.

You are free to use, modify, and distribute this project in accordance with the terms of the Apache License 2.0. Attribution is appreciated, and contributions that improve operational accuracy or usability are welcome.

For the full license text, see the `LICENSE` file included in this repository.
