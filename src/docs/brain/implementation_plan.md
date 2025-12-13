# Implementation Plan - Advanced Features

## Goal
Implement four high-value features to elevate the application's intelligence, security, and management capabilities:
1.  **Smart Notifications** (Alerts for stock, finance, etc.)
2.  **DRE (Financial Statement)** (Real profit analysis)
3.  **RBAC (Granular Access Control)** (Custom permissions)
4.  **Visual Audit** (Timeline view for tracking history)

## User Review Required
> [!IMPORTANT]
> **RBAC Strategy**: We will add a `permissions` list to the `User` type. This allows defining exactly what each user can do (e.g., `['view_sales', 'edit_sales', 'view_reports']`).
> **DRE Calculation**: We will use `PurchaseOrder` costs for Variable Costs and `FinancialTransaction` (Expenses) for Fixed Costs.

## Proposed Changes

### Core UI
#### [MODIFY] [Layout.tsx](file:///Users/piticalyn/Desktop/antigravity/charcoal-management-app/src/components/Layout.tsx)
- Add Hamburger menu for mobile.
- Implement responsive sidebar (collapsible on mobile).
- Adjust main content padding for mobile.

### Supplier Management
#### [MODIFY] [useAppStore.ts](file:///Users/piticalyn/Desktop/antigravity/charcoal-management-app/src/store/useAppStore.ts)
- Add `updateSupplier` action.
- Add `removeSupplier` action.

#### [MODIFY] [Suppliers.tsx](file:///Users/piticalyn/Desktop/antigravity/charcoal-management-app/src/pages/Suppliers.tsx)
- Add Edit/Delete buttons to supplier cards (Admin only).
- Implement Edit Modal logic (populate with existing data).
- Implement Delete confirmation logic.

### Standardizing Admin Actions
#### [MODIFY] [useAppStore.ts](file:///Users/piticalyn/Desktop/antigravity/charcoal-management-app/src/store/useAppStore.ts)
- Add `updateUser` (general update).
- Add `updateCustomer`, `removeCustomer`.
- Add `updatePriceTable`, `removePriceTable`.

#### [MODIFY] [Users.tsx](file:///Users/piticalyn/Desktop/antigravity/charcoal-management-app/src/pages/Users.tsx)
- Add Edit button (Admin only).
- Implement Edit Modal logic.

#### [MODIFY] [Comercial.tsx](file:///Users/piticalyn/Desktop/antigravity/charcoal-management-app/src/pages/Comercial.tsx)
- Add Edit/Delete buttons for Customers (Admin only).
- Add Edit/Delete buttons for Price Tables (Admin only).
- Implement Edit Modal logic for both.

### Shipment Completion
#### [MODIFY] [useAppStore.ts](file:///Users/piticalyn/Desktop/antigravity/charcoal-management-app/src/store/useAppStore.ts)
- Add `updateShipmentStatus` action.

#### [MODIFY] [Expedicao.tsx](file:///Users/piticalyn/Desktop/antigravity/charcoal-management-app/src/pages/Expedicao.tsx)
- Add buttons to advance shipment status:
    - "Iniciar Entrega" (Planned -> InTransit)
    - "Concluir Entrega" (InTransit -> Delivered)
- Add visual indicators for status changes.

## Verification Plan

### Automated Tests
- None.

### Manual Verification
1.  **Start Shipment**: Click "Iniciar" on a Planned shipment. Verify status changes to 'InTransit'.
2.  **Complete Shipment**: Click "Concluir" on an InTransit shipment. Verify status changes to 'Delivered'.
3.  **Audit Log**: Verify actions are logged.

### 1. RBAC (Granular Access Control)
#### [MODIFY] [types/index.ts](file:///Users/piticalyn/Desktop/antigravity/charcoal-management-app/src/types/index.ts)
- Update `User` interface: Add `permissions: string[]`.
- Define available permissions constant.

#### [MODIFY] [pages/Users.tsx](file:///Users/piticalyn/Desktop/antigravity/charcoal-management-app/src/pages/Users.tsx)
- Add UI to select permissions when creating/editing a user.

#### [MODIFY] [components/Layout.tsx](file:///Users/piticalyn/Desktop/antigravity/charcoal-management-app/src/components/Layout.tsx)
- Update sidebar links to check `user.permissions.includes('...')` instead of just role.

### 2. Smart Notifications
#### [MODIFY] [store/useAppStore.ts](file:///Users/piticalyn/Desktop/antigravity/charcoal-management-app/src/store/useAppStore.ts)
- Add `notifications` state.
- Add `checkNotifications()` action:
    - Check Stock < Minimum.
    - Check Bills due today/tomorrow.
    - Check Credit Limits.

#### [MODIFY] [components/Layout.tsx](file:///Users/piticalyn/Desktop/antigravity/charcoal-management-app/src/components/Layout.tsx)
- Add Bell Icon with badge.
- Add Notification Dropdown.

### 3. DRE (Financial Statement)
#### [NEW] [pages/DRE.tsx](file:///Users/piticalyn/Desktop/antigravity/charcoal-management-app/src/pages/DRE.tsx)
- Calculate:
    - **Gross Revenue**: Sum of Sales.
    - **(-) COGS (CMV)**: Cost of Goods Sold (estimated from Purchase Orders avg cost).
    - **(-) Expenses**: Sum of Transactions (Expenses).
    - **(=) Net Profit**.
- Display as a structured report.

### 4. Visual Audit
#### [MODIFY] [types/index.ts](file:///Users/piticalyn/Desktop/antigravity/charcoal-management-app/src/types/index.ts)
- Update `AuditLog` to include `entityId` (optional).

#### [MODIFY] [store/useAppStore.ts](file:///Users/piticalyn/Desktop/antigravity/charcoal-management-app/src/store/useAppStore.ts)
- Update `logAction` to accept `entityId`.
- Update all `logAction` calls in the store to pass the relevant ID.

#### [NEW] [components/Timeline.tsx](file:///Users/piticalyn/Desktop/antigravity/charcoal-management-app/src/components/Timeline.tsx)
- Visual vertical timeline component.

#### [MODIFY] [pages/AuditLogs.tsx](file:///Users/piticalyn/Desktop/antigravity/charcoal-management-app/src/pages/AuditLogs.tsx)
- Integrate `Timeline` component.

## Execution Order
1.  **RBAC**: Foundation for security.
2.  **Visual Audit**: Enhances data structure (`entityId`).
3.  **Notifications**: Adds intelligence.
4.  **DRE**: Complex calculation, best for last.
