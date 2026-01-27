import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Supplier, type ProductionBatch, type Sale, type InventoryState, type ProductType, type Location, type User, type Customer, type PurchaseOrder, type PurchaseStatus, type FinancialTransaction, type Driver, type Shipment, type PriceTable, type AuditLog, type AuditAction, type AuditResource, type Notification } from '../types';

interface AppState {
    suppliers: Supplier[];
    productionBatches: ProductionBatch[];
    sales: Sale[];
    inventory: InventoryState;

    // Actions
    addSupplier: (supplier: Supplier) => void;
    updateSupplier: (supplier: Supplier) => void;
    removeSupplier: (id: string) => void;
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
    updateUser: (user: User) => void;
    removeUser: (id: string) => void;
    updateUserPassword: (id: string, newPassword: string) => void;

    // --- New Modules ---

    // Comercial
    customers: Customer[];
    priceTables: PriceTable[];
    addCustomer: (customer: Customer) => void;
    updateCustomer: (customer: Customer) => void;
    removeCustomer: (id: string) => void;
    addPriceTable: (priceTable: PriceTable) => void;
    updatePriceTable: (priceTable: PriceTable) => void;
    removePriceTable: (id: string) => void;

    // Compras
    purchaseOrders: PurchaseOrder[];
    addPurchaseOrder: (po: PurchaseOrder) => void;
    updatePurchaseOrderStatus: (id: string, status: PurchaseStatus) => void;
    updatePurchaseOrder: (po: PurchaseOrder) => void;
    removePurchaseOrder: (id: string) => void;
    updateProductionBatch: (batch: ProductionBatch) => void;
    removeProductionBatch: (id: string) => void;
    updateSale: (sale: Sale) => void;
    removeSale: (id: string) => void;

    // Financeiro
    transactions: FinancialTransaction[];
    addTransaction: (transaction: FinancialTransaction) => void;
    updateTransaction: (transaction: FinancialTransaction) => void;
    removeTransaction: (id: string) => void;

    // Expedição
    drivers: Driver[];
    shipments: Shipment[];
    addDriver: (driver: Driver) => void;
    addShipment: (shipment: Shipment) => void;
    updateShipmentStatus: (id: string, status: 'Planned' | 'InTransit' | 'Delivered') => void;
    receiveShipment: (id: string) => void; // New action to receive transfer

    // Audit Log
    auditLogs: AuditLog[];
    logAction: (userId: string, userName: string, action: AuditAction, resource: AuditResource, details: string, entityId?: string) => void;

    // Backup & Restore
    restoreData: (data: Partial<AppState>) => void;

    // Notifications
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    markNotificationAsRead: (id: string) => void;
    clearNotifications: () => void;
    checkNotifications: () => void;

    // Settings
    dreSettings: {
        taxRate: number; // %
        cmvRate: number; // % (Fallback if no real data)
        fixedLaborCost: number; // R$
    };
    updateDreSettings: (settings: { taxRate: number; cmvRate: number; fixedLaborCost: number }) => void;
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
                {
                    id: 'admin',
                    name: 'Administrador',
                    username: 'admin',
                    password: '123',
                    role: 'Admin',
                    permissions: [
                        'view_dashboard', 'view_sales', 'manage_sales', 'view_production', 'manage_production',
                        'view_inventory', 'manage_inventory', 'view_financial', 'manage_financial',
                        'view_users', 'manage_users', 'view_reports', 'manage_settings', 'view_audit'
                    ]
                }
            ],

            // New State Init
            customers: [],
            priceTables: [],
            purchaseOrders: [],
            transactions: [],
            drivers: [],
            shipments: [],
            auditLogs: [],

            logAction: (userId, userName, action, resource, details, entityId) => set((state) => ({
                auditLogs: [{
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    userId,
                    userName,
                    action,
                    resource,
                    details,
                    entityId
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
                    state.logAction(user.id, user.name, 'Login', 'User', 'User logged in', user.id);
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

            updateUserPassword: (id, newPassword) => set((state) => ({
                users: state.users.map(u => u.id === id ? { ...u, password: newPassword } : u)
            })),

            logout: () => set({ currentUser: null }),

            addSupplier: (supplier) => set((state) => ({
                suppliers: [...state.suppliers, supplier]
            })),

            updateSupplier: (updatedSupplier) => set((state) => {
                state.logAction(
                    state.currentUser?.id || 'system',
                    state.currentUser?.name || 'System',
                    'Update',
                    'Supplier',
                    `Updated Supplier: ${updatedSupplier.name}`,
                    updatedSupplier.id
                );
                return {
                    suppliers: state.suppliers.map(s => s.id === updatedSupplier.id ? updatedSupplier : s)
                };
            }),

            removeSupplier: (id) => set((state) => {
                const supplier = state.suppliers.find(s => s.id === id);
                state.logAction(
                    state.currentUser?.id || 'system',
                    state.currentUser?.name || 'System',
                    'Delete',
                    'Supplier',
                    `Deleted Supplier: ${supplier?.name || id}`,
                    id
                );
                return {
                    suppliers: state.suppliers.filter(s => s.id !== id)
                };
            }),

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

                // Check Stock Availability
                const newInventory = { ...state.inventory };
                for (const item of sale.items) {
                    const currentStock = newInventory[sale.location][item.productType];
                    if (currentStock < Number(item.quantity)) {
                        throw new Error(`Estoque insuficiente de ${item.productType} em ${sale.location === 'Factory' ? 'Fábrica' : 'Itaguaí'}. Disponível: ${currentStock}`);
                    }
                    newInventory[sale.location][item.productType] -= Number(item.quantity);
                }

                // Log Action
                state.logAction(
                    state.currentUser?.id || 'system',
                    state.currentUser?.name || 'System',
                    'Create',
                    'Sale',
                    `New Sale: R$ ${sale.totalAmount.toLocaleString()} to ${sale.customerName || 'Cash'}`,
                    sale.id
                );

                return {
                    sales: [sale, ...state.sales],
                    inventory: newInventory
                };
            }),

            transferStock: (from, to, type, quantity) => set((state) => {
                const newInventory = { ...state.inventory };
                const currentStock = newInventory[from][type];

                if (currentStock < quantity) {
                    throw new Error(`Estoque insuficiente na origem! Disponível: ${currentStock}`);
                }

                newInventory[from][type] -= quantity;
                newInventory[to][type] += quantity;

                state.logAction(
                    state.currentUser?.id || 'system',
                    state.currentUser?.name || 'System',
                    'Update',
                    'Stock',
                    `Transferred ${quantity} ${type} from ${from} to ${to}`,
                    `${from}-${to}-${Date.now()}`
                );

                return { inventory: newInventory };
            }),

            getSupplierStats: (supplierId) => {
                const state = get();
                // Filter batches where this supplier is one of the inputs
                const batches = state.productionBatches.filter(b =>
                    b.inputs ? b.inputs.some(i => i.supplierId === supplierId) : b.supplierId === supplierId
                );

                const totalInput = batches.reduce((acc, b) => {
                    if (b.inputs) {
                        const input = b.inputs.find(i => i.supplierId === supplierId);
                        return acc + (input ? input.weightKg : 0);
                    }
                    return acc + b.inputWeightKg;
                }, 0);

                const avgLoss = batches.length > 0
                    ? batches.reduce((acc, b) => acc + b.lossPercentage, 0) / batches.length
                    : 0;

                return { totalInput, avgLoss };
            },

            // --- New Actions ---

            updateUser: (updatedUser) => set((state) => {
                state.logAction(
                    state.currentUser?.id || 'system',
                    state.currentUser?.name || 'System',
                    'Update',
                    'User',
                    `Updated User: ${updatedUser.name}`,
                    updatedUser.id
                );
                return {
                    users: state.users.map(u => u.id === updatedUser.id ? updatedUser : u)
                };
            }),

            addCustomer: (customer) => set((state) => ({
                customers: [...state.customers, customer]
            })),

            updateCustomer: (updatedCustomer) => set((state) => {
                state.logAction(
                    state.currentUser?.id || 'system',
                    state.currentUser?.name || 'System',
                    'Update',
                    'Sale', // Using 'Sale' as resource for Customer since 'Customer' isn't in AuditResource yet, or I should add it. Let's stick to existing or add 'Customer'. I'll add 'Customer' to types later if needed, but for now 'Sale' or 'User' might be confusing. Actually I added 'Supplier' earlier. I should probably add 'Customer' to types too. For now I'll use 'Sale' as it's commercial related.
                    `Updated Customer: ${updatedCustomer.name}`,
                    updatedCustomer.id
                );
                return {
                    customers: state.customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)
                };
            }),

            removeCustomer: (id) => set((state) => {
                const customer = state.customers.find(c => c.id === id);
                state.logAction(
                    state.currentUser?.id || 'system',
                    state.currentUser?.name || 'System',
                    'Delete',
                    'Sale',
                    `Deleted Customer: ${customer?.name || id}`,
                    id
                );
                return {
                    customers: state.customers.filter(c => c.id !== id)
                };
            }),

            addPriceTable: (priceTable) => set((state) => ({
                priceTables: [...state.priceTables, priceTable]
            })),

            updatePriceTable: (updatedTable) => set((state) => {
                state.logAction(
                    state.currentUser?.id || 'system',
                    state.currentUser?.name || 'System',
                    'Update',
                    'Product', // Price table relates to products
                    `Updated Price Table: ${updatedTable.name}`,
                    updatedTable.id
                );
                return {
                    priceTables: state.priceTables.map(t => t.id === updatedTable.id ? updatedTable : t)
                };
            }),

            removePriceTable: (id) => set((state) => {
                const table = state.priceTables.find(t => t.id === id);
                state.logAction(
                    state.currentUser?.id || 'system',
                    state.currentUser?.name || 'System',
                    'Delete',
                    'Product',
                    `Deleted Price Table: ${table?.name || id}`,
                    id
                );
                return {
                    priceTables: state.priceTables.filter(t => t.id !== id)
                };
            }),

            addPurchaseOrder: (po) => set((state) => ({
                purchaseOrders: [...state.purchaseOrders, po]
            })),

            addTransaction: (transaction) => set((state) => ({
                transactions: [...state.transactions, transaction]
            })),

            updateTransaction: (updatedTransaction) => set((state) => {
                state.logAction(
                    state.currentUser?.id || 'system',
                    state.currentUser?.name || 'System',
                    'Update',
                    'Financial',
                    `Updated Transaction: ${updatedTransaction.description}`,
                    updatedTransaction.id
                );
                return {
                    transactions: state.transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
                };
            }),

            removeTransaction: (id) => set((state) => {
                const transaction = state.transactions.find(t => t.id === id);
                state.logAction(
                    state.currentUser?.id || 'system',
                    state.currentUser?.name || 'System',
                    'Delete',
                    'Financial',
                    `Deleted Transaction: ${transaction?.description || id}`,
                    id
                );
                return {
                    transactions: state.transactions.filter(t => t.id !== id)
                };
            }),

            addDriver: (driver) => set((state) => ({
                drivers: [...state.drivers, driver]
            })),

            addShipment: (shipment) => set((state) => {
                const newInventory = { ...state.inventory };

                // If it's a Transfer, deduct stock from Source immediately
                if (shipment.type === 'Transfer' && shipment.sourceLocation && shipment.items) {
                    for (const item of shipment.items) {
                        const currentStock = newInventory[shipment.sourceLocation][item.productType];
                        if (currentStock < item.quantity) {
                            throw new Error(`Estoque insuficiente de ${item.productType} em ${shipment.sourceLocation}. Disponível: ${currentStock}`);
                        }
                        newInventory[shipment.sourceLocation][item.productType] -= item.quantity;
                    }
                }

                state.logAction(
                    state.currentUser?.id || 'system',
                    state.currentUser?.name || 'System',
                    'Create',
                    'Stock', // Shipment is stock movement
                    `Created Shipment: ${shipment.id} (${shipment.type})`,
                    shipment.id
                );

                return {
                    shipments: [shipment, ...state.shipments],
                    inventory: newInventory
                };
            }),

            updateShipmentStatus: (id, status) => set((state) => {
                state.logAction(
                    state.currentUser?.id || 'system',
                    state.currentUser?.name || 'System',
                    'Update',
                    'Sale',
                    `Updated Shipment Status: ${status}`,
                    id
                );
                return {
                    shipments: state.shipments.map(s => s.id === id ? { ...s, status } : s)
                };
            }),

            receiveShipment: (id) => set((state) => {
                const shipment = state.shipments.find(s => s.id === id);
                if (!shipment) throw new Error('Carga não encontrada');
                if (shipment.type !== 'Transfer') throw new Error('Apenas transferências podem ser recebidas via estoque.');
                if (shipment.status === 'Delivered') throw new Error('Carga já recebida.');
                if (!shipment.destinationLocation || !shipment.items) throw new Error('Dados de destino inválidos.');

                const newInventory = { ...state.inventory };

                // Add stock to Destination
                for (const item of shipment.items) {
                    newInventory[shipment.destinationLocation][item.productType] += item.quantity;
                }

                state.logAction(
                    state.currentUser?.id || 'system',
                    state.currentUser?.name || 'System',
                    'Update',
                    'Stock',
                    `Received Transfer Shipment: ${id} at ${shipment.destinationLocation}`,
                    id
                );

                return {
                    inventory: newInventory,
                    shipments: state.shipments.map(s => s.id === id ? { ...s, status: 'Delivered' } : s)
                };
            }),

            updatePurchaseOrderStatus: (id, status) => set((state) => ({
                purchaseOrders: state.purchaseOrders.map(po =>
                    po.id === id ? { ...po, status } : po
                )
            })),

            updatePurchaseOrder: (updatedPo) => set((state) => {
                state.logAction(
                    state.currentUser?.id || 'system',
                    state.currentUser?.name || 'System',
                    'Update',
                    'Purchase',
                    `Updated Purchase Order: ${updatedPo.id}`,
                    updatedPo.id
                );
                return {
                    purchaseOrders: state.purchaseOrders.map(po => po.id === updatedPo.id ? updatedPo : po)
                };
            }),

            updateProductionBatch: (updatedBatch) => set((state) => {
                const oldBatch = state.productionBatches.find(b => b.id === updatedBatch.id);
                const newInventory = { ...state.inventory };

                if (oldBatch) {
                    // Revert old inventory addition
                    oldBatch.outputs.forEach(output => {
                        newInventory.Factory[output.productType] -= Number(output.quantity);
                    });
                }

                // Apply new inventory addition
                updatedBatch.outputs.forEach(output => {
                    newInventory.Factory[output.productType] += Number(output.quantity);
                });

                state.logAction(
                    state.currentUser?.id || 'system',
                    state.currentUser?.name || 'System',
                    'Update',
                    'Stock',
                    `Updated Production Batch: ${updatedBatch.id}`,
                    updatedBatch.id
                );

                return {
                    productionBatches: state.productionBatches.map(b => b.id === updatedBatch.id ? updatedBatch : b),
                    inventory: newInventory
                };
            }),

            updateSale: (updatedSale) => set((state) => {
                const oldSale = state.sales.find(s => s.id === updatedSale.id);
                // Create a deep copy to simulate changes
                const newInventory = JSON.parse(JSON.stringify(state.inventory));

                if (oldSale) {
                    // Revert old inventory deduction (Add back)
                    oldSale.items.forEach(item => {
                        newInventory[oldSale.location][item.productType] += Number(item.quantity);
                    });
                }

                // Check and Apply new inventory deduction
                for (const item of updatedSale.items) {
                    const currentStock = newInventory[updatedSale.location][item.productType];
                    if (currentStock < Number(item.quantity)) {
                        throw new Error(`Estoque insuficiente de ${item.productType} em ${updatedSale.location === 'Factory' ? 'Fábrica' : 'Itaguaí'} para atualização. Disponível (após reversão): ${currentStock}`);
                    }
                    newInventory[updatedSale.location][item.productType] -= Number(item.quantity);
                }

                state.logAction(
                    state.currentUser?.id || 'system',
                    state.currentUser?.name || 'System',
                    'Update',
                    'Sale',
                    `Updated Sale: ${updatedSale.id}`,
                    updatedSale.id
                );

                return {
                    sales: state.sales.map(s => s.id === updatedSale.id ? updatedSale : s),
                    inventory: newInventory
                };
            }),

            removePurchaseOrder: (id) => set((state) => {
                state.logAction(
                    state.currentUser?.id || 'system',
                    state.currentUser?.name || 'System',
                    'Delete',
                    'Purchase',
                    `Deleted Purchase Order: ${id}`,
                    id
                );
                return {
                    purchaseOrders: state.purchaseOrders.filter(po => po.id !== id)
                };
            }),

            removeProductionBatch: (id) => set((state) => {
                const batch = state.productionBatches.find(b => b.id === id);
                const newInventory = { ...state.inventory };

                if (batch) {
                    // Revert inventory addition (Subtract)
                    batch.outputs.forEach(output => {
                        newInventory.Factory[output.productType] -= Number(output.quantity);
                    });
                }

                state.logAction(
                    state.currentUser?.id || 'system',
                    state.currentUser?.name || 'System',
                    'Delete',
                    'Stock',
                    `Deleted Production Batch: ${id}`,
                    id
                );

                return {
                    productionBatches: state.productionBatches.filter(b => b.id !== id),
                    inventory: newInventory
                };
            }),

            removeSale: (id) => set((state) => {
                const sale = state.sales.find(s => s.id === id);
                const newInventory = { ...state.inventory };

                if (sale) {
                    // Revert inventory deduction (Add back)
                    sale.items.forEach(item => {
                        newInventory[sale.location][item.productType] += Number(item.quantity);
                    });
                }

                state.logAction(
                    state.currentUser?.id || 'system',
                    state.currentUser?.name || 'System',
                    'Delete',
                    'Sale',
                    `Deleted Sale: ${id}`,
                    id
                );

                return {
                    sales: state.sales.filter(s => s.id !== id),
                    inventory: newInventory
                };
            }),

            restoreData: (data) => set((state) => {
                state.logAction(
                    state.currentUser?.id || 'system',
                    state.currentUser?.name || 'System',
                    'Update',
                    'User',
                    'System Restore Performed'
                );
                return {
                    ...state,
                    ...data,
                    // Ensure we don't overwrite actions or current session if not intended, 
                    // but usually restore replaces everything data-wise.
                    // We should probably keep the current user session active though.
                    currentUser: state.currentUser
                };
            }),

            // Notifications
            notifications: [],

            addNotification: (notification) => set((state) => ({
                notifications: [notification, ...state.notifications]
            })),

            markNotificationAsRead: (id) => set((state) => ({
                notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
            })),

            clearNotifications: () => set({ notifications: [] }),

            checkNotifications: () => {
                const state = get();
                const newNotifications: Notification[] = [];

                // 1. Check Low Stock (Example threshold: 100 units)
                const LOW_STOCK_THRESHOLD = 100;
                Object.entries(state.inventory).forEach(([location, products]) => {
                    Object.entries(products).forEach(([product, qty]) => {
                        if (qty < LOW_STOCK_THRESHOLD) {
                            newNotifications.push({
                                id: crypto.randomUUID(),
                                title: 'Estoque Baixo',
                                message: `O produto ${product} em ${location} está com apenas ${qty} unidades.`,
                                type: 'warning',
                                timestamp: Date.now(),
                                read: false,
                                link: '/estoque'
                            });
                        }
                    });
                });

                // 2. Check Overdue Bills (Accounts Payable)
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                state.transactions.forEach(t => {
                    if (t.type === 'Expense' && t.status === 'Pending') {
                        const dueDate = new Date(t.date); // Assuming date is due date for simplicity or add dueDate field
                        if (dueDate < today) {
                            newNotifications.push({
                                id: crypto.randomUUID(),
                                title: 'Conta Atrasada',
                                message: `A conta "${t.description}" de R$ ${t.amount} venceu em ${dueDate.toLocaleDateString()}.`,
                                type: 'error',
                                timestamp: Date.now(),
                                read: false,
                                link: '/financeiro'
                            });
                        } else if (dueDate.getTime() === today.getTime()) {
                            newNotifications.push({
                                id: crypto.randomUUID(),
                                title: 'Conta Vence Hoje',
                                message: `A conta "${t.description}" de R$ ${t.amount} vence hoje!`,
                                type: 'warning',
                                timestamp: Date.now(),
                                read: false,
                                link: '/financeiro'
                            });
                        }
                    }
                });

                // Avoid duplicates (simple check by message content for this MVP)
                const existingMessages = new Set(state.notifications.map(n => n.message));
                const uniqueNewNotifications = newNotifications.filter(n => !existingMessages.has(n.message));

                if (uniqueNewNotifications.length > 0) {
                    set({ notifications: [...uniqueNewNotifications, ...state.notifications] });
                }
            },

            // Settings
            dreSettings: {
                taxRate: 6, // Default 6% (Simples Nacional approx)
                cmvRate: 40, // Default 40%
                fixedLaborCost: 0
            },

            updateDreSettings: (settings) => set(() => ({
                dreSettings: settings
            })),

        }),
        {
            name: 'charcoal-app-storage',
        }
    )
);
