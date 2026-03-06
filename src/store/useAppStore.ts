import { create } from 'zustand';
import { type Supplier, type ProductionBatch, type Sale, type InventoryState, type ProductType, type Location, type User, type Customer, type PurchaseOrder, type PurchaseStatus, type FinancialTransaction, type Driver, type Shipment, type PriceTable, type AuditLog, type AuditAction, type AuditResource, type Notification } from '../types';
import { supabase } from '../lib/supabase';

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
    getPrice: (productType: ProductType, paymentMethod: 'Cash' | 'Credit', customerId?: string) => number;
    // Auth
    currentUser: User | null;
    users: User[];
    login: (username: string, password: string) => Promise<boolean>;
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
    updateDriver: (driver: Driver) => void;
    removeDriver: (id: string) => void;
    addShipment: (shipment: Shipment) => void;
    updateShipment: (shipment: Shipment) => void;
    removeShipment: (id: string) => void;
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
        laborCostPerUnit: number; // R$ per bag
        packagingCostPerUnit: number; // R$ per bag
        transportCostPerBag: number; // R$ per bag
        cmvRate: number; // %
        fixedLaborCost: number; // R$
    };
    updateDreSettings: (settings: {
        taxRate: number;
        laborCostPerUnit: number;
        packagingCostPerUnit: number;
        transportCostPerBag: number;
        cmvRate: number;
        fixedLaborCost: number;
    }) => void;

    // Initialization
    initialize: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
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

        initialize: async () => {
            try {
                const [
                    { data: suppliers },
                    { data: customers },
                    { data: priceTables },
                    { data: productionBatches },
                    { data: sales },
                    { data: transactions },
                    { data: drivers },
                    { data: shipments },
                    { data: purchaseOrders },
                    { data: auditLogs },
                    { data: inventoryData },
                    { data: users }
                ] = await Promise.all([
                    supabase.from('suppliers').select('*'),
                    supabase.from('customers').select('*'),
                    supabase.from('price_tables').select('*'),
                    supabase.from('production_batches').select('*').order('date', { ascending: false }),
                    supabase.from('sales').select('*').order('date', { ascending: false }),
                    supabase.from('transactions').select('*').order('date', { ascending: false }),
                    supabase.from('drivers').select('*'),
                    supabase.from('shipments').select('*').order('date', { ascending: false }),
                    supabase.from('purchase_orders').select('*').order('date', { ascending: false }),
                    supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(100),
                    supabase.from('inventory').select('*'),
                    supabase.from('users_table').select('*')
                ]);

                const inventory: InventoryState = {
                    Factory: { '3kg': 0, '5kg': 0, 'Paulistao': 0, 'Bulk': 0 },
                    Itaguai: { '3kg': 0, '5kg': 0, 'Paulistao': 0, 'Bulk': 0 },
                };

                inventoryData?.forEach((item: { location: string; stock: any }) => {
                    inventory[item.location as Location] = item.stock;
                });

                set({
                    suppliers: suppliers || [],
                    customers: customers?.map(c => ({
                        ...c,
                        creditLimit: Number(c.credit_limit),
                        priceTableId: c.price_table_id,
                        paymentTerms: c.payment_terms
                    })) || [],
                    priceTables: priceTables || [],
                    productionBatches: productionBatches || [],
                    sales: sales || [],
                    transactions: transactions?.map(t => ({
                        ...t,
                        amount: Number(t.amount),
                        entityId: t.entity_id,
                        entityName: t.entity_name,
                        dueDate: t.due_date
                    })) || [],
                    drivers: drivers || [],
                    shipments: shipments?.map(s => ({
                        ...s,
                        salesIds: s.sales_ids,
                        sourceLocation: s.source_location,
                        destinationLocation: s.destination_location
                    })) || [],
                    purchaseOrders: purchaseOrders?.map(po => ({
                        ...po,
                        supplierId: po.supplier_id,
                        totalAmount: Number(po.total_amount),
                        manifestNumber: po.manifest_number,
                        originAuthorizationNumber: po.origin_authorization_number
                    })) || [],
                    auditLogs: auditLogs?.map(log => ({
                        ...log,
                        userId: log.user_id,
                        userName: log.user_name,
                        entityId: log.entity_id
                    })) || [],
                    inventory,
                    users: users?.map(u => ({
                        ...u,
                        canPrint: u.can_print
                    })) || []
                });
            } catch (error) {
                console.error('Error initializing store from Supabase:', error);
            }
        },

        logAction: async (userId, userName, action, resource, details, entityId) => {
            const log = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                userId,
                userName,
                action,
                resource,
                details,
                entityId
            };

            set((state) => ({
                auditLogs: [log, ...state.auditLogs]
            }));

            await supabase.from('audit_logs').insert([{
                id: log.id,
                timestamp: log.timestamp,
                user_id: userId,
                user_name: userName,
                action,
                resource,
                details,
                entity_id: entityId
            }]);
        },

        login: async (username, password) => {
            const { data, error } = await supabase
                .from('users_table')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single();

            if (data && !error) {
                // Don't store password in currentUser session
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { password: _, ...safeUser } = data;
                set({ currentUser: safeUser });

                // Log Login
                const state = get();
                state.logAction(data.id, data.name, 'Login', 'User', 'User logged in', data.id);
                return true;
            }
            return false;
        },

        addUser: async (user) => {
            set((state) => ({
                users: [...state.users, user]
            }));
            // We'll store users in a custom table as requested in schema
            await supabase.from('users_table').insert([{
                id: user.id,
                name: user.name,
                username: user.username,
                password: user.password,
                role: user.role,
                permissions: user.permissions,
                can_print: user.canPrint
            }]);
        },

        updateUser: async (updatedUser) => {
            const state = get();
            state.logAction(
                state.currentUser?.id || 'system',
                state.currentUser?.name || 'System',
                'Update',
                'User',
                `Updated User: ${updatedUser.name}`,
                updatedUser.id
            );
            set((state) => ({
                users: state.users.map(u => u.id === updatedUser.id ? updatedUser : u)
            }));
            await supabase.from('users_table').update({
                name: updatedUser.name,
                username: updatedUser.username,
                role: updatedUser.role,
                permissions: updatedUser.permissions,
                can_print: updatedUser.canPrint
            }).eq('id', updatedUser.id);
        },

        removeUser: async (id) => {
            set((state) => ({
                users: state.users.filter(u => u.id !== id)
            }));
            await supabase.from('users_table').delete().eq('id', id);
        },

        updateUserPassword: async (id, newPassword) => {
            set((state) => ({
                users: state.users.map(u => u.id === id ? { ...u, password: newPassword } : u)
            }));
            await supabase.from('users_table').update({ password: newPassword }).eq('id', id);
        },
        logout: () => set({ currentUser: null }),

        addSupplier: async (supplier) => {
            set((state) => ({
                suppliers: [...state.suppliers, supplier]
            }));
            await supabase.from('suppliers').insert([supplier]);
        },

        updateSupplier: async (updatedSupplier) => {
            const state = get();
            state.logAction(
                state.currentUser?.id || 'system',
                state.currentUser?.name || 'System',
                'Update',
                'Supplier',
                `Updated Supplier: ${updatedSupplier.name}`,
                updatedSupplier.id
            );
            set((state) => ({
                suppliers: state.suppliers.map(s => s.id === updatedSupplier.id ? updatedSupplier : s)
            }));
            await supabase.from('suppliers').update(updatedSupplier).eq('id', updatedSupplier.id);
        },

        removeSupplier: async (id) => {
            const state = get();
            const supplier = state.suppliers.find(s => s.id === id);
            state.logAction(
                state.currentUser?.id || 'system',
                state.currentUser?.name || 'System',
                'Delete',
                'Supplier',
                `Deleted Supplier: ${supplier?.name || id}`,
                id
            );
            set((state) => ({
                suppliers: state.suppliers.filter(s => s.id !== id)
            }));
            await supabase.from('suppliers').delete().eq('id', id);
        },

        addProductionBatch: async (batch) => {
            const state = get();
            // Update inventory
            const newInventory = { ...state.inventory };
            batch.outputs.forEach(output => {
                newInventory.Factory[output.productType] += Number(output.quantity);
            });

            set({
                productionBatches: [batch, ...state.productionBatches],
                inventory: newInventory
            });

            await supabase.from('production_batches').insert([{
                ...batch,
                input_weight_kg: batch.inputWeightKg,
                total_output_weight_kg: batch.totalOutputWeightKg,
                loss_percentage: batch.lossPercentage,
                supplier_id: batch.supplierId
            }]);

            // Sync inventory
            await supabase.from('inventory').upsert([{
                location: 'Factory',
                stock: newInventory.Factory
            }]);
        },

        addSale: async (sale) => {
            const state = get();
            // Check Credit Limit if customer is selected
            if (sale.customerName) {
                const customer = state.customers.find(c => c.name === sale.customerName);
                if (customer) {
                    // 1. Check if explicitly blocked
                    if (customer.isBlocked) {
                        throw new Error(`Cliente BLOQUEADO: ${customer.blockedReason || 'Motivo não especificado'}. Procure a diretoria.`);
                    }

                    // 2. Check for Overdue Transactions
                    const hasOverdue = state.transactions.some(t =>
                        t.entityId === customer.id &&
                        t.type === 'Income' &&
                        t.status === 'Overdue'
                    );

                    if (hasOverdue) {
                        throw new Error(`Venda Não Autorizada: Cliente possui pendências em ATRASO no financeiro.`);
                    }

                    // 3. Check Credit Limit
                    const currentDebt = state.transactions
                        .filter(t => t.entityId === customer.id && t.type === 'Income' && t.status !== 'Paid')
                        .reduce((acc, t) => acc + t.amount, 0);

                    if (currentDebt + sale.totalAmount > (customer.creditLimit || 0)) {
                        throw new Error(`Limite de crédito excedido! Total devido com esta venda: R$ ${(currentDebt + sale.totalAmount).toLocaleString()}. Limite: R$ ${(customer.creditLimit || 0).toLocaleString()}`);
                    }
                }
            }

            // Check Stock Availability
            const newInventory = { ...state.inventory };
            for (const item of sale.items) {
                const currentStock = newInventory[sale.location][item.productType] || 0;
                const requestedQty = Number(item.quantity);

                if (currentStock < requestedQty) {
                    throw new Error(`Estoque insuficiente de ${item.productType} em ${sale.location === 'Factory' ? 'Fábrica' : 'Itaguaí'}. Disponível: ${currentStock}, Solicitado: ${requestedQty}`);
                }
                newInventory[sale.location][item.productType] -= requestedQty;
            }

            // Auto-create Financial Transaction
            const transaction: FinancialTransaction = {
                id: crypto.randomUUID(),
                date: sale.date,
                dueDate: sale.dueDate || sale.date,
                type: 'Income',
                category: 'Sales',
                description: `Venda ${sale.customerName || 'Consumidor Final'} - ${sale.items.map(i => `${i.quantity}x ${i.productType}`).join(', ')}`,
                amount: sale.totalAmount,
                status: sale.paymentMethod === 'Credit' ? 'Pending' : 'Paid',
                entityName: sale.customerName || 'Consumidor Final',
                entityId: state.customers.find(c => c.name === sale.customerName)?.id,
                location: sale.location
            };

            // Log Action
            state.logAction(
                state.currentUser?.id || 'system',
                state.currentUser?.name || 'System',
                'Create',
                'Sale',
                `New Sale: R$ ${sale.totalAmount.toLocaleString()} to ${sale.customerName || 'Cash'}`,
                sale.id
            );

            set({
                sales: [sale, ...state.sales],
                inventory: newInventory,
                transactions: [...state.transactions, transaction]
            });

            await Promise.all([
                supabase.from('sales').insert([{
                    ...sale,
                    customer_name: sale.customerName,
                    payment_method: sale.paymentMethod,
                    payment_term: sale.paymentTerm,
                    due_date: sale.dueDate
                }]),
                supabase.from('transactions').insert([{
                    ...transaction,
                    due_date: transaction.dueDate,
                    entity_id: transaction.entityId,
                    entity_name: transaction.entityName
                }]),
                supabase.from('inventory').upsert([{
                    location: sale.location,
                    stock: newInventory[sale.location]
                }])
            ]);
        },

        transferStock: async (from, to, type, quantity) => {
            const state = get();
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

            set({ inventory: newInventory });

            await supabase.from('inventory').upsert([
                { location: from, stock: newInventory[from] },
                { location: to, stock: newInventory[to] }
            ]);
        },

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

        getPrice: (productType, paymentMethod, customerId) => {
            const state = get();
            // Removed unused 'let price = 0;'

            // 1. Check for Customer Specific Table
            if (customerId) {
                const customer = state.customers.find(c => c.id === customerId);
                if (customer?.priceTableId) {
                    const table = state.priceTables.find(t => t.id === customer.priceTableId);
                    if (table?.prices[productType]) {
                        return table.prices[productType];
                    }
                }
            }

            // 2. Check for Default Tables based on Payment Method
            const defaultTableName = paymentMethod === 'Credit' ? 'Tabela Padrão - A Prazo' : 'Tabela Padrão - À Vista';
            const defaultTable = state.priceTables.find(t => t.name === defaultTableName);

            if (defaultTable?.prices[productType]) {
                return defaultTable.prices[productType];
            }

            // 3. Fallback / Init Defaults if missing (Self-healing)
            // If we are here, it means no table was found. Let's return a hardcoded default but also log a warning or handle it.
            // For MVP, we'll return hardcoded defaults.
            if (paymentMethod === 'Credit') {
                if (productType === '3kg') return 12;
                if (productType === '5kg') return 18;
                if (productType === 'Paulistao') return 45;
                if (productType === 'Bulk') return 1.5;
            } else {
                if (productType === '3kg') return 10;
                if (productType === '5kg') return 15;
                if (productType === 'Paulistao') return 40;
                if (productType === 'Bulk') return 1.2;
            }
            return 0;
        },

        // --- New Actions ---


        addCustomer: async (customer) => {
            set((state) => ({
                customers: [...state.customers, customer]
            }));
            await supabase.from('customers').insert([{
                ...customer,
                credit_limit: customer.creditLimit,
                price_table_id: customer.priceTableId,
                payment_terms: customer.paymentTerms
            }]);
        },

        updateCustomer: async (updatedCustomer) => {
            const state = get();
            state.logAction(
                state.currentUser?.id || 'system',
                state.currentUser?.name || 'System',
                'Update',
                'Sale',
                `Updated Customer: ${updatedCustomer.name}`,
                updatedCustomer.id
            );
            set((state) => ({
                customers: state.customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)
            }));
            await supabase.from('customers').update({
                ...updatedCustomer,
                credit_limit: updatedCustomer.creditLimit,
                price_table_id: updatedCustomer.priceTableId,
                payment_terms: updatedCustomer.paymentTerms
            }).eq('id', updatedCustomer.id);
        },

        removeCustomer: async (id) => {
            const state = get();
            const customer = state.customers.find(c => c.id === id);
            state.logAction(
                state.currentUser?.id || 'system',
                state.currentUser?.name || 'System',
                'Delete',
                'Sale',
                `Deleted Customer: ${customer?.name || id}`,
                id
            );
            set((state) => ({
                customers: state.customers.filter(c => c.id !== id)
            }));
            await supabase.from('customers').delete().eq('id', id);
        },

        addPriceTable: async (priceTable) => {
            set((state) => ({
                priceTables: [...state.priceTables, priceTable]
            }));
            await supabase.from('price_tables').insert([priceTable]);
        },

        updatePriceTable: async (updatedTable) => {
            const state = get();
            state.logAction(
                state.currentUser?.id || 'system',
                state.currentUser?.name || 'System',
                'Update',
                'Product',
                `Updated Price Table: ${updatedTable.name}`,
                updatedTable.id
            );
            set((state) => ({
                priceTables: state.priceTables.map(t => t.id === updatedTable.id ? updatedTable : t)
            }));
            await supabase.from('price_tables').update(updatedTable).eq('id', updatedTable.id);
        },

        removePriceTable: async (id) => {
            const state = get();
            const table = state.priceTables.find(t => t.id === id);
            state.logAction(
                state.currentUser?.id || 'system',
                state.currentUser?.name || 'System',
                'Delete',
                'Product',
                `Deleted Price Table: ${table?.name || id}`,
                id
            );
            set((state) => ({
                priceTables: state.priceTables.filter(t => t.id !== id)
            }));
            await supabase.from('price_tables').delete().eq('id', id);
        },

        addPurchaseOrder: async (po) => {
            set((state) => ({
                purchaseOrders: [...state.purchaseOrders, po]
            }));
            await supabase.from('purchase_orders').insert([{
                ...po,
                supplier_id: po.supplierId,
                total_amount: po.totalAmount,
                manifest_number: po.manifestNumber,
                origin_authorization_number: po.originAuthorizationNumber
            }]);
        },

        updatePurchaseOrder: async (updatedPo) => {
            const state = get();
            state.logAction(
                state.currentUser?.id || 'system',
                state.currentUser?.name || 'System',
                'Update',
                'Purchase',
                `Updated Purchase Order: ${updatedPo.id}`,
                updatedPo.id
            );
            set((state) => ({
                purchaseOrders: state.purchaseOrders.map(po => po.id === updatedPo.id ? updatedPo : po)
            }));
            await supabase.from('purchase_orders').update({
                ...updatedPo,
                supplier_id: updatedPo.supplierId,
                total_amount: updatedPo.totalAmount,
                manifest_number: updatedPo.manifestNumber,
                origin_authorization_number: updatedPo.originAuthorizationNumber
            }).eq('id', updatedPo.id);
        },

        updatePurchaseOrderStatus: async (id, status) => {
            set((state) => ({
                purchaseOrders: state.purchaseOrders.map(po =>
                    po.id === id ? { ...po, status } : po
                )
            }));
            await supabase.from('purchase_orders').update({ status }).eq('id', id);
        },

        removePurchaseOrder: async (id) => {
            const state = get();
            state.logAction(
                state.currentUser?.id || 'system',
                state.currentUser?.name || 'System',
                'Delete',
                'Purchase',
                `Deleted Purchase Order: ${id}`,
                id
            );
            set((state) => ({
                purchaseOrders: state.purchaseOrders.filter(po => po.id !== id)
            }));
            await supabase.from('purchase_orders').delete().eq('id', id);
        },

        addTransaction: async (transaction) => {
            set((state) => ({
                transactions: [...state.transactions, transaction]
            }));
            await supabase.from('transactions').insert([{
                ...transaction,
                due_date: transaction.dueDate,
                entity_id: transaction.entityId,
                entity_name: transaction.entityName
            }]);
        },

        updateTransaction: async (updatedTransaction) => {
            const state = get();
            state.logAction(
                state.currentUser?.id || 'system',
                state.currentUser?.name || 'System',
                'Update',
                'Financial',
                `Updated Transaction: ${updatedTransaction.description}`,
                updatedTransaction.id
            );
            set((state) => ({
                transactions: state.transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
            }));
            await supabase.from('transactions').update({
                ...updatedTransaction,
                due_date: updatedTransaction.dueDate,
                entity_id: updatedTransaction.entityId,
                entity_name: updatedTransaction.entityName
            }).eq('id', updatedTransaction.id);
        },

        removeTransaction: async (id) => {
            const state = get();
            const transaction = state.transactions.find(t => t.id === id);
            state.logAction(
                state.currentUser?.id || 'system',
                state.currentUser?.name || 'System',
                'Delete',
                'Financial',
                `Deleted Transaction: ${transaction?.description || id}`,
                id
            );
            set((state) => ({
                transactions: state.transactions.filter(t => t.id !== id)
            }));
            await supabase.from('transactions').delete().eq('id', id);
        },

        addDriver: async (driver) => {
            set((state) => ({
                drivers: [...state.drivers, driver]
            }));
            await supabase.from('drivers').insert([driver]);
        },

        updateDriver: async (updatedDriver) => {
            const state = get();
            state.logAction(
                state.currentUser?.id || 'system',
                state.currentUser?.name || 'System',
                'Update',
                'Sale',
                `Updated Driver: ${updatedDriver.name}`,
                updatedDriver.id
            );
            set((state) => ({
                drivers: state.drivers.map(d => d.id === updatedDriver.id ? updatedDriver : d)
            }));
            await supabase.from('drivers').update(updatedDriver).eq('id', updatedDriver.id);
        },

        removeDriver: async (id) => {
            const state = get();
            const driver = state.drivers.find(d => d.id === id);
            state.logAction(
                state.currentUser?.id || 'system',
                state.currentUser?.name || 'System',
                'Delete',
                'Sale',
                `Deleted Driver: ${driver?.name || id}`,
                id
            );
            set((state) => ({
                drivers: state.drivers.filter(d => d.id !== id)
            }));
            await supabase.from('drivers').delete().eq('id', id);
        },

        addShipment: async (shipment) => {
            const state = get();
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
                'Stock',
                `Created Shipment: ${shipment.id} (${shipment.type})`,
                shipment.id
            );

            set({
                shipments: [shipment, ...state.shipments],
                inventory: newInventory
            });

            await Promise.all([
                supabase.from('shipments').insert([{
                    ...shipment,
                    driver_id: shipment.driverId,
                    sales_ids: shipment.salesIds,
                    source_location: shipment.sourceLocation,
                    destination_location: shipment.destinationLocation
                }]),
                shipment.type === 'Transfer' && shipment.sourceLocation ?
                    supabase.from('inventory').upsert([{
                        location: shipment.sourceLocation,
                        stock: newInventory[shipment.sourceLocation]
                    }]) : Promise.resolve()
            ]);
        },

        updateShipment: async (updatedShipment) => {
            const state = get();
            const oldShipment = state.shipments.find(s => s.id === updatedShipment.id);
            const newInventory = { ...state.inventory };

            // Revert Old Stock if Transfer
            if (oldShipment?.type === 'Transfer' && oldShipment.sourceLocation && oldShipment.items) {
                oldShipment.items.forEach(item => {
                    newInventory[oldShipment.sourceLocation!][item.productType] += item.quantity;
                });
            }

            // Apply New Stock if Transfer
            if (updatedShipment.type === 'Transfer' && updatedShipment.sourceLocation && updatedShipment.items) {
                for (const item of updatedShipment.items) {
                    const currentStock = newInventory[updatedShipment.sourceLocation][item.productType];
                    if (currentStock < item.quantity) {
                        throw new Error(`Estoque insuficiente de ${item.productType} em ${updatedShipment.sourceLocation}. Disponível: ${currentStock}`);
                    }
                    newInventory[updatedShipment.sourceLocation][item.productType] -= item.quantity;
                }
            }

            state.logAction(
                state.currentUser?.id || 'system',
                state.currentUser?.name || 'System',
                'Update',
                'Stock',
                `Updated Shipment: ${updatedShipment.id}`,
                updatedShipment.id
            );

            set({
                shipments: state.shipments.map(s => s.id === updatedShipment.id ? updatedShipment : s),
                inventory: newInventory
            });

            await Promise.all([
                supabase.from('shipments').update({
                    ...updatedShipment,
                    driver_id: updatedShipment.driverId,
                    sales_ids: updatedShipment.salesIds,
                    source_location: updatedShipment.sourceLocation,
                    destination_location: updatedShipment.destinationLocation
                }).eq('id', updatedShipment.id),
                supabase.from('inventory').upsert([
                    { location: 'Factory', stock: newInventory.Factory },
                    { location: 'Itaguai', stock: newInventory.Itaguai }
                ])
            ]);
        },

        removeShipment: async (id) => {
            const state = get();
            const shipment = state.shipments.find(s => s.id === id);
            const newInventory = { ...state.inventory };

            // Revert Stock if Transfer
            if (shipment?.type === 'Transfer' && shipment.sourceLocation && shipment.items) {
                shipment.items.forEach(item => {
                    newInventory[shipment.sourceLocation!][item.productType] += item.quantity;
                });
            }

            state.logAction(
                state.currentUser?.id || 'system',
                state.currentUser?.name || 'System',
                'Delete',
                'Stock',
                `Deleted Shipment: ${id}`,
                id
            );

            set({
                shipments: state.shipments.filter(s => s.id !== id),
                inventory: newInventory
            });

            await Promise.all([
                supabase.from('shipments').delete().eq('id', id),
                supabase.from('inventory').upsert([
                    { location: 'Factory', stock: newInventory.Factory },
                    { location: 'Itaguai', stock: newInventory.Itaguai }
                ])
            ]);
        },

        updateShipmentStatus: async (id, status) => {
            const state = get();
            state.logAction(
                state.currentUser?.id || 'system',
                state.currentUser?.name || 'System',
                'Update',
                'Sale',
                `Updated Shipment Status: ${status}`,
                id
            );
            set((state) => ({
                shipments: state.shipments.map(s => s.id === id ? { ...s, status } : s)
            }));
            await supabase.from('shipments').update({ status }).eq('id', id);
        },

        receiveShipment: async (id) => {
            const state = get();
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

            set({
                inventory: newInventory,
                shipments: state.shipments.map(s => s.id === id ? { ...s, status: 'Delivered' } : s)
            });

            await Promise.all([
                supabase.from('shipments').update({ status: 'Delivered' }).eq('id', id),
                supabase.from('inventory').upsert([{
                    location: shipment.destinationLocation,
                    stock: newInventory[shipment.destinationLocation]
                }])
            ]);
        },


        updateProductionBatch: async (updatedBatch) => {
            const state = get();
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

            set({
                productionBatches: state.productionBatches.map(b => b.id === updatedBatch.id ? updatedBatch : b),
                inventory: newInventory
            });

            await supabase.from('production_batches').update({
                ...updatedBatch,
                input_weight_kg: updatedBatch.inputWeightKg,
                total_output_weight_kg: updatedBatch.totalOutputWeightKg,
                loss_percentage: updatedBatch.lossPercentage,
                supplier_id: updatedBatch.supplierId
            }).eq('id', updatedBatch.id);

            await supabase.from('inventory').upsert([{
                location: 'Factory',
                stock: newInventory.Factory
            }]);
        },

        updateSale: async (updatedSale) => {
            const state = get();
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

            set({
                sales: state.sales.map(s => s.id === updatedSale.id ? updatedSale : s),
                inventory: newInventory
            });

            await Promise.all([
                supabase.from('sales').update({
                    ...updatedSale,
                    customer_name: updatedSale.customerName,
                    payment_method: updatedSale.paymentMethod,
                    payment_term: updatedSale.paymentTerm,
                    due_date: updatedSale.dueDate
                }).eq('id', updatedSale.id),
                supabase.from('inventory').upsert([
                    { location: 'Factory', stock: newInventory.Factory },
                    { location: 'Itaguai', stock: newInventory.Itaguai }
                ])
            ]);
        },


        removeProductionBatch: async (id) => {
            const state = get();
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

            set({
                productionBatches: state.productionBatches.filter(b => b.id !== id),
                inventory: newInventory
            });

            await supabase.from('production_batches').delete().eq('id', id);
            await supabase.from('inventory').upsert([{
                location: 'Factory',
                stock: newInventory.Factory
            }]);
        },

        removeSale: async (id) => {
            const state = get();
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

            set({
                sales: state.sales.filter(s => s.id !== id),
                inventory: newInventory
            });

            await Promise.all([
                supabase.from('sales').delete().eq('id', id),
                supabase.from('inventory').upsert([{
                    location: sale?.location || 'Factory',
                    stock: newInventory[sale?.location || 'Factory']
                }])
            ]);
        },

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

            // 2. Check Overdue Bills (Accounts Payable) & Receivables
            const today = new Date();
            const todayStr = today.toLocaleDateString('sv-SE');
            const todayDate = new Date(todayStr + 'T00:00:00'); // Local Midnight

            state.transactions.forEach(t => {
                if (t.status === 'Pending') {
                    const dueDate = new Date(t.dueDate + 'T00:00:00'); // Local Midnight
                    // Reset hours not needed if we use YYYY-MM-DD strings to create dates

                    const diffTime = dueDate.getTime() - todayDate.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    const isReceivable = t.type === 'Income';
                    const prefix = isReceivable ? 'Recebimento' : 'Pagamento';
                    const link = '/financeiro';

                    if (diffDays < 0) {
                        // Overdue
                        newNotifications.push({
                            id: crypto.randomUUID(),
                            title: `${prefix} Atrasado`,
                            message: `O ${prefix.toLowerCase()} "${t.description}" de R$ ${t.amount.toLocaleString()} venceu em ${dueDate.toLocaleDateString()}.`,
                            type: 'error',
                            timestamp: Date.now(),
                            read: false,
                            link
                        });
                    } else if (diffDays === 0) {
                        // Due Today
                        newNotifications.push({
                            id: crypto.randomUUID(),
                            title: `${prefix} Vence Hoje`,
                            message: `O ${prefix.toLowerCase()} "${t.description}" de R$ ${t.amount.toLocaleString()} vence hoje!`,
                            type: 'warning',
                            timestamp: Date.now(),
                            read: false,
                            link
                        });
                    } else if (diffDays <= 3) {
                        // Due Soon
                        newNotifications.push({
                            id: crypto.randomUUID(),
                            title: `${prefix} Próximo`,
                            message: `O ${prefix.toLowerCase()} "${t.description}" vence em ${diffDays} dias.`,
                            type: 'info',
                            timestamp: Date.now(),
                            read: false,
                            link
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
            taxRate: 6,
            laborCostPerUnit: 0.50, // R$ 0,50 por saco (exemplo)
            packagingCostPerUnit: 1.20, // R$ 1,20 por saco (exemplo)
            transportCostPerBag: 2.00, // R$ 2,00 por saco (exemplo)
            cmvRate: 40,
            fixedLaborCost: 0
        },

        updateDreSettings: (settings) => set(() => ({
            dreSettings: settings
        })),

    })
);
