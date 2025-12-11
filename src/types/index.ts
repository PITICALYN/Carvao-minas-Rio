export type Location = 'Factory' | 'Itaguai';

export interface Supplier {
    id: string;
    name: string;
    contact?: string;
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
    timestamp: number;
}

export type UserRole = 'Admin' | 'Factory' | 'Itaguai';

export interface User {
    id: string;
    name: string;
    role: UserRole;
}

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

// --- Enhanced Sale Type ---
// We will extend the existing Sale interface in the future or use intersection types if needed.
// For now, we keep the existing Sale as is to avoid breaking changes immediately, 
// but we will need to migrate it to include customerId and status.
