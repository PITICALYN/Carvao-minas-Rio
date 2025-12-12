import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, Search, Calendar, Edit, Trash2 } from 'lucide-react';
import { type PurchaseOrder, type MaterialType } from '../types';

export const Compras = () => {
    const { purchaseOrders, addPurchaseOrder, updatePurchaseOrder, removePurchaseOrder, suppliers, currentUser } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [newOrder, setNewOrder] = useState<Partial<PurchaseOrder>>({
        supplierId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        items: [],
        totalAmount: 0
    });

    // Temporary state for adding items to the order
    const [currentItem, setCurrentItem] = useState<{
        materialType: MaterialType;
        quantity: number;
        unitPrice: number;
        total: number;
    }>({
        materialType: 'Eucalyptus',
        quantity: 0,
        unitPrice: 0,
        total: 0
    });

    const addItem = () => {
        if (currentItem.quantity <= 0 || currentItem.unitPrice <= 0) return;

        const total = currentItem.quantity * currentItem.unitPrice;
        const newItem = {
            materialType: currentItem.materialType,
            quantity: currentItem.quantity,
            unitPrice: currentItem.unitPrice,
            description: `${currentItem.materialType} - ${currentItem.quantity} units`,
            total: total
        };

        const updatedItems = [...(newOrder.items || []), newItem];
        const orderTotal = updatedItems.reduce((acc, item) => acc + item.total, 0);

        setNewOrder({
            ...newOrder,
            items: updatedItems,
            totalAmount: orderTotal
        });

        setCurrentItem({ materialType: 'Eucalyptus', quantity: 0, unitPrice: 0, total: 0 });
    };

    const removeItem = (index: number) => {
        const updatedItems = [...(newOrder.items || [])];
        updatedItems.splice(index, 1);
        const orderTotal = updatedItems.reduce((acc, item) => acc + item.total, 0);

        setNewOrder({
            ...newOrder,
            items: updatedItems,
            totalAmount: orderTotal
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newOrder.supplierId || !newOrder.items?.length) return;

        const orderData = {
            id: newOrder.id || crypto.randomUUID(),
            supplierId: newOrder.supplierId,
            date: newOrder.date || new Date().toISOString(),
            status: newOrder.status || 'Pending',
            items: newOrder.items,
            totalAmount: newOrder.totalAmount || 0,
            manifestNumber: newOrder.manifestNumber,
            originAuthorizationNumber: newOrder.originAuthorizationNumber
        } as PurchaseOrder;

        if (newOrder.id) {
            updatePurchaseOrder(orderData);
        } else {
            addPurchaseOrder(orderData);
        }

        setIsModalOpen(false);
        setNewOrder({ supplierId: '', date: new Date().toISOString().split('T')[0], status: 'Pending', items: [], totalAmount: 0 });
    };

    const getSupplierName = (id: string) => suppliers.find(s => s.id === id)?.name || 'Desconhecido';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Compras</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg"
                >
                    <Plus className="w-4 h-4" />
                    Nova Compra
                </button>
            </div>

            <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-white/5">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar pedido..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none">
                        <option value="all">Todos os Status</option>
                        <option value="Pending">Pendente</option>
                        <option value="Received">Recebido</option>
                        <option value="Cancelled">Cancelado</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {purchaseOrders.map(order => (
                    <div key={order.id} className="glass-card p-5 rounded-xl space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-white text-lg">{getSupplierName(order.supplierId)}</h3>
                                <p className="text-sm text-slate-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {new Date(order.date).toLocaleDateString()}
                                    {order.manifestNumber && <span className="ml-2 text-xs bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">M: {order.manifestNumber}</span>}
                                    {order.originAuthorizationNumber && <span className="ml-2 text-xs bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">AO: {order.originAuthorizationNumber}</span>}
                                </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${order.status === 'Received' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                order.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                    'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                {order.status === 'Received' ? 'Recebido' : order.status === 'Pending' ? 'Pendente' : 'Cancelado'}
                            </span>
                        </div>

                        <div className="space-y-2 text-sm text-slate-300 bg-slate-950/30 p-3 rounded-lg">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between">
                                    <span>{item.quantity}x {item.materialType}</span>
                                    <div className="text-right">
                                        <span className="block">R$ {item.total.toFixed(2)}</span>
                                        <span className="text-xs text-slate-500">
                                            (R$ {item.unitPrice.toFixed(2)}/{item.materialType === 'Charcoal_Bulk' ? 'kg' : 'un'})
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-slate-400 text-sm">Total</span>
                            <span className="text-xl font-bold text-white">R$ {order.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2">
                            {currentUser?.role === 'Admin' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setNewOrder(order);
                                            setIsModalOpen(true);
                                        }}
                                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                        title="Editar Pedido"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.')) {
                                                removePurchaseOrder(order.id);
                                            }
                                        }}
                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Excluir Pedido"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            {order.status === 'Pending' && (
                                <button
                                    onClick={() => {
                                        if (confirm('Marcar este pedido como Recebido?')) {
                                            useAppStore.getState().updatePurchaseOrderStatus(order.id, 'Received');
                                        }
                                    }}
                                    className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg border border-emerald-500/20 transition-colors"
                                >
                                    Receber
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {purchaseOrders.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        Nenhum pedido de compra registrado.
                    </div>
                )}
            </div>

            {/* New Purchase Order Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold text-white mb-4">Nova Compra</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Fornecedor</label>
                                        <select
                                            required
                                            value={newOrder.supplierId}
                                            onChange={e => setNewOrder({ ...newOrder, supplierId: e.target.value })}
                                            className="w-full input-field px-4 py-2"
                                        >
                                            <option value="">Selecione...</option>
                                            {suppliers.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Data</label>
                                        <input
                                            type="date"
                                            value={newOrder.date}
                                            onChange={e => setNewOrder({ ...newOrder, date: e.target.value })}
                                            className="w-full input-field px-4 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                                        <select
                                            value={newOrder.status}
                                            onChange={e => setNewOrder({ ...newOrder, status: e.target.value as any })}
                                            className="w-full input-field px-4 py-2"
                                        >
                                            <option value="Pending">Pendente</option>
                                            <option value="Received">Recebido</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Nº Manifesto</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: 123456"
                                            value={newOrder.manifestNumber || ''}
                                            onChange={e => setNewOrder({ ...newOrder, manifestNumber: e.target.value })}
                                            className="w-full input-field px-4 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Aut. Origem</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: AO-98765"
                                            value={newOrder.originAuthorizationNumber || ''}
                                            onChange={e => setNewOrder({ ...newOrder, originAuthorizationNumber: e.target.value })}
                                            className="w-full input-field px-4 py-2"
                                        />
                                    </div>
                                </div>

                                {/* Add Items Section */}
                                <div className="bg-slate-800/50 p-4 rounded-xl space-y-4">
                                    <h3 className="text-sm font-medium text-white">Adicionar Itens</h3>
                                    <div className="grid grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Material</label>
                                            <select
                                                value={currentItem.materialType}
                                                onChange={e => setCurrentItem({ ...currentItem, materialType: e.target.value as MaterialType })}
                                                className="w-full input-field px-2 py-1 text-sm"
                                            >
                                                <option value="Eucalyptus">Eucalipto</option>
                                                <option value="Pinus">Pinus</option>
                                                <option value="EmptyBag_3kg">Saco 3kg</option>
                                                <option value="EmptyBag_5kg">Saco 5kg</option>
                                                <option value="EmptyBag_Paulistao">Saco Paulistão</option>
                                                <option value="Other">Outro</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Quantidade (Kg/Un)</label>
                                            <input
                                                type="number"
                                                placeholder="Qtd"
                                                value={currentItem.quantity || ''}
                                                onChange={e => {
                                                    const quantity = Number(e.target.value);
                                                    setCurrentItem({
                                                        ...currentItem,
                                                        quantity,
                                                        total: quantity * currentItem.unitPrice
                                                    });
                                                }}
                                                className="w-full input-field px-2 py-1 text-sm"
                                            />
                                            {currentItem.quantity > 0 && (
                                                <span className="text-xs text-slate-500 block mt-1">
                                                    {currentItem.quantity.toLocaleString('pt-BR')} {currentItem.materialType === 'Charcoal_Bulk' ? 'kg' : 'un'}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Valor Unitário (R$)</label>
                                            <input
                                                type="number"
                                                placeholder="R$ Unit."
                                                value={currentItem.unitPrice || ''}
                                                onChange={e => {
                                                    const unitPrice = Number(e.target.value);
                                                    setCurrentItem({
                                                        ...currentItem,
                                                        unitPrice,
                                                        total: currentItem.quantity * unitPrice
                                                    });
                                                }}
                                                className="w-full input-field px-2 py-1 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Valor Total (R$)</label>
                                            <input
                                                type="text"
                                                placeholder="R$ Total"
                                                value={currentItem.total ? currentItem.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                                                readOnly
                                                className="w-full input-field px-2 py-1 text-sm bg-slate-900 text-slate-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="w-full btn-primary py-2 rounded-lg text-sm flex justify-center items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Adicionar Item
                                    </button>

                                    {/* Items List */}
                                    {newOrder.items && newOrder.items.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {newOrder.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-slate-950 p-2 rounded text-sm group">
                                                    <span className="text-slate-300">{item.quantity}x {item.materialType}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-white">R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(idx)}
                                                            className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                            title="Remover item"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex justify-between items-center pt-2 border-t border-white/10 font-bold">
                                                <span className="text-slate-400">Total do Pedido</span>
                                                <span className="text-white">R$ {newOrder.totalAmount?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3">
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
                                        Salvar Compra
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
