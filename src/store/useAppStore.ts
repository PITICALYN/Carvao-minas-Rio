import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Supplier, type ProductionBatch, type Sale, type InventoryState, type ProductType, type Location, type User, type Customer, type PurchaseOrder, type PurchaseStatus, type FinancialTransaction, type Driver, type Shipment, type PriceTable, type AuditLog, type AuditAction, type AuditResource } from '../types';

interface AppState {
    suppliers: Supplier[];
    productionBatches: ProductionBatch[];
    sales: Sale[];
    inventory: InventoryState;

    // Actions
    addSupplier: (supplier: Supplier) => void;
    addProductionBatch: (batch: ProductionBatch) => void;
    addSale: (sale: Sale) => void;
    transferStock: (from: Location, to: Location, type: ProductType, quantity: number) => void;

    // Helpers
    getSupplierStats: (supplierId: string) => { totalInput: number, avgLoss: number };
    // Auth
    currentUser: User | null;
    users: User[];
    login: (username: string, password: string) => boolean;
    logout: () => void;
    addUser: (user: User) => void;
    removeUser: (id: string) => void;

    // --- New Modules ---

    // Comercial
    customers: Customer[];
    priceTables: PriceTable[];
    addCustomer: (customer: Customer) => void;
    addPriceTable: (priceTable: PriceTable) => void;

    // Compras
    purchaseOrders: PurchaseOrder[];
    addPurchaseOrder: (po: PurchaseOrder) => void;
    updatePurchaseOrderStatus: (id: string, status: PurchaseStatus) => void;

    // Financeiro
    transactions: FinancialTransaction[];
    addTransaction: (transaction: FinancialTransaction) => void;

    // Expedição
    drivers: Driver[];
    shipments: Shipment[];
    addDriver: (driver: Driver) => void;
    addShipment: (shipment: Shipment) => void;

    // Audit Log
    auditLogs: AuditLog[];
    logAction: (userId: string, userName: string, action: AuditAction, resource: AuditResource, details: string) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            suppliers: [],
            productionBatches: [],
            sales: [],
            inventory: {
                Factory: { '3kg': 0, '5kg': 0, 'Paulistao': 0, 'Bulk': 0 },
                Itaguai: { '3kg': 0, '5kg': 0, 'Paulistao': 0, 'Bulk': 0 },
            },
            currentUser: null,
            users: [
                { id: 'admin', name: 'Administrador', username: 'admin', password: '123', role: 'Admin' }
            ],

            // New State Init
            customers: [],
            priceTables: [],
            purchaseOrders: [],
            transactions: [],
            drivers: [],
            shipments: [],
            auditLogs: [],

            logAction: (userId, userName, action, resource, details) => set((state) => ({
                auditLogs: [{
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    userId,
                    userName,
                    action,
                    resource,
                    details
                }, ...state.auditLogs]
            })),

            login: (username, password) => {
                const state = get();
                const user = state.users.find(u => u.username === username && u.password === password);

                if (user) {
                    // Don't store password in currentUser session
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { password: _, ...safeUser } = user;
                    set({ currentUser: safeUser });

                    // Log Login
                    state.logAction(user.id, user.name, 'Login', 'User', 'User logged in');
                    return true;
                }
                return false;
            },

            addUser: (user) => set((state) => ({
                users: [...state.users, user]
            })),

            removeUser: (id) => set((state) => ({
                users: state.users.filter(u => u.id !== id)
            })),

            logout: () => set({ currentUser: null }),

            addSupplier: (supplier) => set((state) => ({
                suppliers: [...state.suppliers, supplier]
            })),

            addProductionBatch: (batch) => set((state) => {
                // Update inventory
                const newInventory = { ...state.inventory };
                batch.outputs.forEach(output => {
                    newInventory.Factory[output.productType] += Number(output.quantity);
                });

                return {
                    productionBatches: [batch, ...state.productionBatches],
                    inventory: newInventory
                };
            }),

            addSale: (sale) => set((state) => {
                // Check Credit Limit if customer is selected
                if (sale.customerName) {
                    const customer = state.customers.find(c => c.name === sale.customerName);
                    if (customer) {
                        // Calculate current balance (Total Receivables - Total Paid)
                        // For MVP, we'll just sum up all unpaid transactions for this customer
                        // In a real app, we'd have a more robust balance calculation
                        const currentDebt = state.transactions
                            .filter(t => t.entityId === customer.id && t.type === 'Income' && t.status !== 'Paid')
                            .reduce((acc, t) => acc + t.amount, 0);

                        if (currentDebt + sale.totalAmount > customer.creditLimit) {
                            throw new Error(`Limite de crédito excedido! Disponível: R$ ${(customer.creditLimit - currentDebt).toLocaleString()}`);
                        }
                    }
                }

                // Update inventory
                const newInventory = { ...state.inventory };
                sale.items.forEach(item => {
                    if (newInventory[sale.location][item.productType] >= Number(item.quantity)) {
                        newInventory[sale.location][item.productType] -= Number(item.quantity);
                    }
                });

                // Log Action
                state.logAction(
                    state.currentUser?.id || 'system',
                    state.currentUser?.name || 'System',
                    'Create',
                    'Sale',
                    `New Sale: R$ ${sale.totalAmount.toLocaleString()} to ${sale.customerName || 'Cash'}`
                );

                return {
                    sales: [sale, ...state.sales],
                    inventory: newInventory
                };
            }),

            transferStock: (from, to, type, quantity) => set((state) => {
                const newInventory = { ...state.inventory };
                if (newInventory[from][type] >= quantity) {
                    newInventory[from][type] -= quantity;
                    newInventory[to][type] += quantity;
                }
                return { inventory: newInventory };
            }),

            getSupplierStats: (supplierId) => {
                const state = get();
                const batches = state.productionBatches.filter(b => b.supplierId === supplierId);
                const totalInput = batches.reduce((acc, b) => acc + b.inputWeightKg, 0);
                const avgLoss = batches.length > 0
                    ? batches.reduce((acc, b) => acc + b.lossPercentage, 0) / batches.length
                    : 0;

                return { totalInput, avgLoss };
            },

            // --- New Actions ---

            addCustomer: (customer) => set((state) => ({
                customers: [...state.customers, customer]
            })),

            addPriceTable: (priceTable) => set((state) => ({
                priceTables: [...state.priceTables, priceTable]
            })),

            addPurchaseOrder: (po) => set((state) => ({
                purchaseOrders: [...state.purchaseOrders, po]
            })),

            addTransaction: (transaction) => set((state) => ({
                transactions: [...state.transactions, transaction]
            })),

            addDriver: (driver) => set((state) => ({
                drivers: [...state.drivers, driver]
            })),

            addShipment: (shipment) => set((state) => ({
                shipments: [...state.shipments, shipment]
            })),

            updatePurchaseOrderStatus: (id, status) => set((state) => ({
                purchaseOrders: state.purchaseOrders.map(po =>
                    po.id === id ? { ...po, status } : po
                )
            })),


        }),
        {
            name: 'charcoal-app-storage',
        }
    )
);
