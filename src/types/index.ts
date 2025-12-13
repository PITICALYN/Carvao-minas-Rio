export type Location = 'Factory' | 'Itaguai';

export interface Supplier {
    id: string;
    name: string;
    contact?: string;
    document?: string; // CPF/CNPJ
}

export type ProductType = '3kg' | '5kg' | 'Paulistao' | 'Bulk';

export interface Product {
    id: string;
    type: ProductType;
    weightKg: number; // 3, 5, or 0 for bulk
    price: number;
}

export interface ProductionBatch {
    id: string;
    supplierId: string;
    date: string;
    inputWeightKg: number;
    outputs: {
        productType: ProductType;
        quantity: number; // number of bags
    }[];
    totalOutputWeightKg: number;
    lossPercentage: number;
    timestamp: number;
}

export interface InventoryItem {
    productType: ProductType;
    quantity: number; // bags or kg for bulk? Let's say bags for packaged, kg for bulk if needed. 
    // For simplicity, let's track everything in "units" (bags) and Bulk in kg?
    // The prompt says "vendas para clientes grande de caminha fechado sem embalar".
    // So Bulk is likely in kg or tons.
    // Let's assume packaged items are in units (bags), Bulk is in kg.
}

export interface InventoryState {
    [location: string]: {
        [productType: string]: number;
    };
}

export interface SaleItem {
    productType: ProductType;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Sale {
    id: string;
    date: string;
    location: Location;
    customerName?: string;
    items: SaleItem[];
    totalAmount: number;
    paymentMethod: 'Cash' | 'Credit';
    timestamp: number;
}

export type UserRole = 'Admin' | 'Factory' | 'Itaguai';

export interface User {
    id: string;
    name: string;
    username: string;
    password?: string; // Optional for current user object (security), required for storage
    role: UserRole;
    permissions: string[]; // Granular permissions
    canPrint?: boolean;
}

export const PERMISSIONS = {
    VIEW_DASHBOARD: 'view_dashboard',
    VIEW_SALES: 'view_sales',
    MANAGE_SALES: 'manage_sales', // Create, Edit, Delete
    VIEW_PRODUCTION: 'view_production',
    MANAGE_PRODUCTION: 'manage_production',
    VIEW_INVENTORY: 'view_inventory',
    MANAGE_INVENTORY: 'manage_inventory', // Transfers
    VIEW_FINANCIAL: 'view_financial',
    MANAGE_FINANCIAL: 'manage_financial',
    VIEW_USERS: 'view_users',
    MANAGE_USERS: 'manage_users',
    VIEW_REPORTS: 'view_reports',
    MANAGE_SETTINGS: 'manage_settings',
    VIEW_AUDIT: 'view_audit'
} as const;

// --- Module: Comercial ---
export interface Customer {
    id: string;
    name: string;
    document: string; // CPF/CNPJ
    email?: string;
    phone?: string;
    address: string;
    creditLimit: number;
    paymentTerms: string;
    priceTableId?: string;
}

export interface PriceTable {
    id: string;
    name: string;
    prices: Record<string, number>; // ProductType -> Price
}

// --- Module: Compras ---
export type MaterialType = 'Eucalyptus' | 'Pinus' | 'Charcoal_Bulk' | 'EmptyBag_3kg' | 'EmptyBag_5kg' | 'EmptyBag_Paulistao' | 'Other';
export type PurchaseStatus = 'Pending' | 'Approved' | 'Received' | 'Cancelled';

export interface PurchaseOrder {
    id: string;
    supplierId: string;
    date: string;
    status: PurchaseStatus;
    items: {
        materialType: MaterialType;
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }[];
    totalAmount: number;
    manifestNumber?: string;
    originAuthorizationNumber?: string;
}

// --- Module: Financeiro ---
export type TransactionType = 'Income' | 'Expense';
export type TransactionCategory = 'Sales' | 'Purchase' | 'Operational' | 'Salary' | 'Other';
export type PaymentStatus = 'Pending' | 'Paid' | 'Overdue';

export interface FinancialTransaction {
    id: string;
    date: string;
    dueDate: string;
    type: TransactionType;
    category: TransactionCategory;
    description: string;
    amount: number;
    status: PaymentStatus;
    entityId?: string; // CustomerID or SupplierID
    entityName: string;
}

// --- Module: Expedição ---
export interface Driver {
    id: string;
    name: string;
    licensePlate: string;
    vehicleModel: string;
}

export interface Shipment {
    id: string;
    date: string;
    driverId: string;
    salesIds: string[];
    status: 'Planned' | 'InTransit' | 'Delivered';
}

// --- Advanced Control: Audit Log ---
export type AuditAction = 'Login' | 'Create' | 'Update' | 'Delete' | 'Approve' | 'Reject';
export type AuditResource = 'User' | 'Product' | 'Stock' | 'Sale' | 'Purchase' | 'Financial' | 'Supplier';

export interface AuditLog {
    id: string;
    timestamp: number;
    userId: string;
    userName: string;
    action: AuditAction;
    resource: AuditResource;
    entityId?: string; // ID of the specific entity (Sale ID, Batch ID, etc.)
    details: string;
}

// --- Notifications ---
export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    timestamp: number;
    read: boolean;
    link?: string;
}
