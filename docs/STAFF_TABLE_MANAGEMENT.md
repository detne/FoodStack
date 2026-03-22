# Staff Table Management Guide

## Overview
The table management interface allows staff to view and update table status in their assigned branch.

## Features

### 1. View Table List
- Display all tables in the branch
- Tables are grouped by area (Area): Main Dining, VIP Section, Outdoor Terrace, etc.
- Display basic information:
  - Table name/number (Table tag)
  - Capacity
  - Current status
  - Number of reservations

### 2. View Table Status
Available statuses:
- **Available**: Table is ready for service
- **Occupied**: Guests are currently seated
- **Reserved**: Table has been reserved
- **Out of Service**: Table is under maintenance/unavailable

### 3. Change Table Status
- Open dialog to select new status
- Update table status based on actual situation
- Example: Change from Available → Occupied when guests are seated

### 4. View Table Details
When clicking "Details", staff can view:

**Table Information:**
- Table name and area
- Number of seats
- Current status

**Reservation Information:**
- Guest name
- Email and phone number
- Number of guests
- Start/end time
- Reservation status (Confirmed, Pending, etc.)
- Special notes from guests

**Carousel for multiple reservations:**
- If table has multiple reservations, can view each one
- Auto-slide or use Previous/Next buttons

### 5. Filter and Quick Statistics
- View available tables
- View occupied tables
- Statistics by area

## Staff Permissions

### What Staff CAN do:
✅ View table list
✅ View table details
✅ Change table status
✅ View reservation information

### What Staff CANNOT do:
❌ Create new tables
❌ Delete tables
❌ Edit table information (capacity, area)
❌ Manage areas
❌ Create/delete reservations (view only)
❌ Export QR codes

## API Endpoints Used

### Tables
- `GET /api/v1/branches/:branchId/tables` - Get table list
- `PATCH /api/v1/tables/:tableId` - Update table status (staff can only update status, not capacity)

### Reservations
- `GET /api/v1/reservations?branchId=...` - Get reservation list
- `GET /api/v1/reservations/:id` - View reservation details

## Typical Workflow

1. **Guest arrives at restaurant**:
   - Staff opens table management interface
   - Find available table (green)
   - Lead guest to table
   - Change table status from Available → Occupied

2. **Guest pays and leaves**:
   - Staff changes table status from Occupied → Available
   - Table is ready for next guest

3. **Check reservations**:
   - Staff clicks "Details" on table
   - View information of guest who reserved
   - Prepare table before guest arrives

4. **Table needs maintenance**:
   - Staff changes table status to Out of Service
   - Table will not be used until fixed
   - After fixing, change back to Available
