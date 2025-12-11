import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Supplier, type ProductionBatch, type Sale, type InventoryState, type ProductType, type Location, type User, type UserRole, type Customer, type PurchaseOrder, type PurchaseStatus, type FinancialTransaction, type Driver, type Shipment, type PriceTable } from '../types';

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
    login: (role: UserRole) => void;
    logout: () => void;

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

            // New State Init
            customers: [],
            priceTables: [],
            purchaseOrders: [],
            transactions: [],
            drivers: [],
            shipments: [],

            login: (role) => {
                const user: User = {
                    id: role.toLowerCase(),
                    name: role === 'Admin' ? 'Administrador' : role === 'Factory' ? 'Gerente Fábrica' : 'Gerente Itaguaí',
                    role
                };
                set({ currentUser: user });
            },

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
                // Update inventory
                const newInventory = { ...state.inventory };
                sale.items.forEach(item => {
                    if (newInventory[sale.location][item.productType] >= Number(item.quantity)) {
                        newInventory[sale.location][item.productType] -= Number(item.quantity);
                    }
                });

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
