import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, Search, MapPin, Phone, Mail, FileText, DollarSign, Edit, Trash2 } from 'lucide-react';
import { type Customer, type PriceTable } from '../types';

export const Comercial = () => {
    const {
        customers, addCustomer, updateCustomer, removeCustomer,
        priceTables, addPriceTable, updatePriceTable, removePriceTable,
        currentUser
    } = useAppStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'customers' | 'prices'>('customers');

    // Edit State
    const [currentCustomerId, setCurrentCustomerId] = useState<string | null>(null);
    const [currentPriceTableId, setCurrentPriceTableId] = useState<string | null>(null);

    // Customer Form State
    const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
        name: '',
        document: '',
        email: '',
        phone: '',
        address: '',
        creditLimit: 0,
        paymentTerms: '30 dias'
    });

    // Price Table Form State
    const [newPriceTable, setNewPriceTable] = useState<Partial<PriceTable>>({
        name: '',
        prices: {
            '3kg': 0,
            '5kg': 0,
            'Paulistao': 0,
            'Bulk': 0
        }
    });

    const handleCustomerSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCustomer.name || !newCustomer.document) return;

        if (currentCustomerId) {
            updateCustomer({
                id: currentCustomerId,
                name: newCustomer.name,
                document: newCustomer.document,
                email: newCustomer.email,
                phone: newCustomer.phone,
                address: newCustomer.address || '',
                creditLimit: Number(newCustomer.creditLimit),
                paymentTerms: newCustomer.paymentTerms || '30 dias',
                ...newCustomer
            } as Customer);
        } else {
            addCustomer({
                id: crypto.randomUUID(),
                name: newCustomer.name,
                document: newCustomer.document,
                email: newCustomer.email,
                phone: newCustomer.phone,
                address: newCustomer.address || '',
                creditLimit: Number(newCustomer.creditLimit),
                paymentTerms: newCustomer.paymentTerms || '30 dias',
                ...newCustomer
            } as Customer);
        }

        setIsModalOpen(false);
        resetCustomerForm();
    };

    const resetCustomerForm = () => {
        setCurrentCustomerId(null);
        setNewCustomer({ name: '', document: '', email: '', phone: '', address: '', creditLimit: 0, paymentTerms: '30 dias' });
    };

    const handleEditCustomer = (customer: Customer) => {
        setCurrentCustomerId(customer.id);
        setNewCustomer({ ...customer });
        setIsModalOpen(true);
    };

    const handleNewCustomer = () => {
        resetCustomerForm();
        setIsModalOpen(true);
    };

    const handlePriceTableSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPriceTable.name) return;

        if (currentPriceTableId) {
            updatePriceTable({
                id: currentPriceTableId,
                name: newPriceTable.name,
                prices: newPriceTable.prices || {}
            } as PriceTable);
        } else {
            addPriceTable({
                id: crypto.randomUUID(),
                name: newPriceTable.name,
                prices: newPriceTable.prices || {}
            } as PriceTable);
        }

        setIsPriceModalOpen(false);
        resetPriceTableForm();
    };

    const resetPriceTableForm = () => {
        setCurrentPriceTableId(null);
        setNewPriceTable({ name: '', prices: { '3kg': 0, '5kg': 0, 'Paulistao': 0, 'Bulk': 0 } });
    };

    const handleEditPriceTable = (table: PriceTable) => {
        setCurrentPriceTableId(table.id);
        setNewPriceTable({ ...table });
        setIsPriceModalOpen(true);
    };

    const handleNewPriceTable = () => {
        resetPriceTableForm();
        setIsPriceModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Comercial</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('customers')}
                        className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'customers' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
                    >
                        Clientes
                    </button>
                    <button
                        onClick={() => setActiveTab('prices')}
                        className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'prices' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
                    >
                        Tabelas de Preço
                    </button>
                </div>
            </div>

            {activeTab === 'customers' && (
                <>
                    <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-white/5">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar cliente..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <button
                            onClick={handleNewCustomer}
                            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg"
                        >
                            <Plus className="w-4 h-4" />
                            Novo Cliente
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {customers.map(customer => (
                            <div key={customer.id} className="glass-card p-5 rounded-xl space-y-4 relative group">
                                {currentUser?.role === 'Admin' && (
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditCustomer(customer)}
                                            className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Tem certeza que deseja excluir este cliente?')) {
                                                    removeCustomer(customer.id);
                                                }
                                            }}
                                            className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{customer.name}</h3>
                                        <p className="text-sm text-slate-400 flex items-center gap-1">
                                            <FileText className="w-3 h-3" /> {customer.document}
                                        </p>
                                    </div>
                                    <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                                        Ativo
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-slate-500" />
                                        <span className="truncate">{customer.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-slate-500" />
                                        <span>{customer.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-slate-500" />
                                        <span>{customer.email || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex justify-between items-center text-sm">
                                    <div>
                                        <p className="text-slate-500 text-xs">Limite de Crédito</p>
                                        <p className="text-white font-medium">R$ {customer.creditLimit.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs">Prazo</p>
                                        <p className="text-white font-medium">{customer.paymentTerms}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {customers.length === 0 && (
                            <div className="col-span-full text-center py-12 text-slate-500">
                                Nenhum cliente cadastrado.
                            </div>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'prices' && (
                <>
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={handleNewPriceTable}
                            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg"
                        >
                            <Plus className="w-4 h-4" />
                            Nova Tabela
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {priceTables.map(table => (
                            <div key={table.id} className="glass-card p-5 rounded-xl space-y-4 relative group">
                                {currentUser?.role === 'Admin' && (
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditPriceTable(table)}
                                            className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Tem certeza que deseja excluir esta tabela?')) {
                                                    removePriceTable(table.id);
                                                }
                                            }}
                                            className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-white text-lg">{table.name}</h3>
                                </div>

                                <div className="space-y-2">
                                    {Object.entries(table.prices).map(([type, price]) => (
                                        <div key={type} className="flex justify-between text-sm border-b border-white/5 pb-1 last:border-0">
                                            <span className="text-slate-400">{type}</span>
                                            <span className="text-white font-medium">R$ {price.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {priceTables.length === 0 && (
                            <div className="col-span-full text-center py-12 text-slate-500">
                                Nenhuma tabela de preço cadastrada.
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Add Customer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">{currentCustomerId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                        <form onSubmit={handleCustomerSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Nome / Razão Social</label>
                                <input
                                    required
                                    type="text"
                                    value={newCustomer.name}
                                    onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    className="w-full input-field px-4 py-2"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">CPF / CNPJ</label>
                                    <input
                                        required
                                        type="text"
                                        value={newCustomer.document}
                                        onChange={e => setNewCustomer({ ...newCustomer, document: e.target.value })}
                                        className="w-full input-field px-4 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Telefone</label>
                                    <input
                                        type="text"
                                        value={newCustomer.phone}
                                        onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                        className="w-full input-field px-4 py-2"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={newCustomer.email}
                                    onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                    className="w-full input-field px-4 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Endereço</label>
                                <input
                                    type="text"
                                    value={newCustomer.address}
                                    onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                    className="w-full input-field px-4 py-2"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Limite de Crédito (R$)</label>
                                    <input
                                        type="number"
                                        value={newCustomer.creditLimit}
                                        onChange={e => setNewCustomer({ ...newCustomer, creditLimit: Number(e.target.value) })}
                                        className="w-full input-field px-4 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Prazo de Pagamento</label>
                                    <select
                                        value={newCustomer.paymentTerms}
                                        onChange={e => setNewCustomer({ ...newCustomer, paymentTerms: e.target.value })}
                                        className="w-full input-field px-4 py-2"
                                    >
                                        <option value="À Vista">À Vista</option>
                                        <option value="15 dias">15 dias</option>
                                        <option value="30 dias">30 dias</option>
                                        <option value="45 dias">45 dias</option>
                                        <option value="60 dias">60 dias</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary px-6 py-2 rounded-lg"
                                >
                                    {currentCustomerId ? 'Salvar Alterações' : 'Salvar Cliente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Price Table Modal */}
            {isPriceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">{currentPriceTableId ? 'Editar Tabela' : 'Nova Tabela de Preço'}</h2>
                        <form onSubmit={handlePriceTableSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Nome da Tabela</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Ex: Varejo, Atacado, Região Sul"
                                    value={newPriceTable.name}
                                    onChange={e => setNewPriceTable({ ...newPriceTable, name: e.target.value })}
                                    className="w-full input-field px-4 py-2"
                                />
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-slate-400 border-b border-white/10 pb-2">Preços por Produto</h3>
                                {['3kg', '5kg', 'Paulistao', 'Bulk'].map((type) => (
                                    <div key={type} className="flex items-center justify-between">
                                        <label className="text-sm text-slate-300">{type}</label>
                                        <div className="relative w-32">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={newPriceTable.prices?.[type] || 0}
                                                onChange={e => setNewPriceTable({
                                                    ...newPriceTable,
                                                    prices: { ...newPriceTable.prices, [type]: Number(e.target.value) }
                                                })}
                                                className="w-full input-field pl-8 pr-4 py-1 text-right"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsPriceModalOpen(false)}
                                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary px-6 py-2 rounded-lg"
                                >
                                    {currentPriceTableId ? 'Salvar Alterações' : 'Salvar Tabela'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
