import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { type ProductType, type Location, type Sale } from '../types';
import { Plus, Printer, FileText, X } from 'lucide-react';

export const Sales = () => {
    const { sales, addSale, currentUser } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

    // Form State
    const [location, setLocation] = useState<Location>(currentUser?.role === 'Itaguai' ? 'Itaguai' : 'Factory');
    const [customerName, setCustomerName] = useState('');
    const [items, setItems] = useState<{ type: ProductType; qty: string; price: string }[]>([
        { type: '3kg', qty: '', price: '' },
    ]);

    const handleAddItem = () => {
        setItems([...items, { type: '3kg', qty: '', price: '' }]);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => {
            const qty = parseFloat(item.qty) || 0;
            const price = parseFloat(item.price) || 0;
            return sum + (qty * price);
        }, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const finalItems = items.map(item => ({
            productType: item.type,
            quantity: parseFloat(item.qty) || 0,
            unitPrice: parseFloat(item.price) || 0,
            total: (parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0)
        })).filter(i => i.quantity > 0);

        if (finalItems.length === 0) return;

        addSale({
            id: crypto.randomUUID(),
            date: new Date().toISOString().split('T')[0],
            location,
            customerName,
            items: finalItems,
            totalAmount: calculateTotal(),
            timestamp: Date.now(),
        });

        setIsModalOpen(false);
        setCustomerName('');
        setItems([{ type: '3kg', qty: '', price: '' }]);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Vendas</h2>
                    <p className="text-slate-400">Registre vendas e saídas de produtos.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Nova Venda
                </button>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Data</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Local</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Cliente</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Itens</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Total</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sales
                            .filter(sale => {
                                if (currentUser?.role === 'Admin') return true;
                                if (currentUser?.role === 'Factory') return sale.location === 'Factory';
                                if (currentUser?.role === 'Itaguai') return sale.location === 'Itaguai';
                                return false;
                            })
                            .map((sale) => (
                                <tr key={sale.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        {new Date(sale.timestamp).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${sale.location === 'Factory' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20' : 'bg-amber-500/20 text-amber-300 border border-amber-500/20'
                                            }`}>
                                            {sale.location === 'Factory' ? 'Fábrica' : 'Itaguaí'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-white">
                                        {sale.customerName || 'Consumidor Final'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        <div className="flex flex-col gap-1">
                                            {sale.items.map((item, idx) => (
                                                <span key={idx} className="text-xs">
                                                    {item.quantity}x {item.productType} (R$ {item.unitPrice})
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-green-400">
                                        R$ {sale.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedSale(sale)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                                            title="Gerar Romaneio"
                                        >
                                            <FileText className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        {sales.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    Nenhuma venda registrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="glass-panel p-6 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto border border-white/10">
                        <h3 className="text-xl font-bold mb-4 text-white">Nova Venda</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Local da Venda</label>
                                    <select
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value as Location)}
                                        className="w-full input-field px-4 py-2"
                                        disabled={currentUser?.role !== 'Admin'}
                                    >
                                        <option value="Factory">Fábrica</option>
                                        <option value="Itaguai">Itaguaí</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Cliente (Opcional)</label>
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full input-field px-4 py-2"
                                        placeholder="Nome do cliente"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Itens</label>
                                <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <select
                                                value={item.type}
                                                onChange={(e) => {
                                                    const newItems = [...items];
                                                    newItems[idx].type = e.target.value as ProductType;
                                                    setItems(newItems);
                                                }}
                                                className="w-32 input-field px-3 py-2 text-sm"
                                            >
                                                <option value="3kg">3kg</option>
                                                <option value="5kg">5kg</option>
                                                <option value="Paulistao">Paulistão</option>
                                                <option value="Bulk">Granel</option>
                                            </select>
                                            <input
                                                type="number"
                                                value={item.qty}
                                                onChange={(e) => {
                                                    const newItems = [...items];
                                                    newItems[idx].qty = e.target.value;
                                                    setItems(newItems);
                                                }}
                                                className="w-24 input-field px-3 py-2 text-sm"
                                                placeholder="Qtd"
                                            />
                                            <input
                                                type="number"
                                                value={item.price}
                                                onChange={(e) => {
                                                    const newItems = [...items];
                                                    newItems[idx].price = e.target.value;
                                                    setItems(newItems);
                                                }}
                                                className="flex-1 input-field px-3 py-2 text-sm"
                                                placeholder="Preço Unit."
                                            />
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" /> Adicionar Item
                                    </button>
                                </div>
                            </div>

                            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex justify-between items-center">
                                <p className="text-xs text-green-400 font-medium uppercase tracking-wider">Total da Venda</p>
                                <p className="text-2xl font-bold text-green-400">
                                    R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-400 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary px-4 py-2 rounded-lg"
                                >
                                    Confirmar Venda
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Romaneio Modal */}
            {selectedSale && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 print:bg-white print:absolute print:inset-0">
                    <div className="bg-white text-slate-900 p-8 rounded-2xl w-full max-w-2xl shadow-2xl relative print:shadow-none print:w-full print:max-w-none print:rounded-none">
                        <button
                            onClick={() => setSelectedSale(null)}
                            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full print:hidden"
                        >
                            <X className="w-6 h-6 text-slate-500" />
                        </button>

                        <div className="text-center mb-8 border-b border-slate-200 pb-6">
                            <h2 className="text-3xl font-bold text-slate-900">ROMANEIO DE ENTREGA</h2>
                            <p className="text-slate-500 mt-2">Carvoaria Gestão Inteligente</p>
                            <p className="text-sm text-slate-400">Pedido #{selectedSale.id.slice(0, 8).toUpperCase()}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cliente</p>
                                <p className="text-lg font-semibold">{selectedSale.customerName || 'Consumidor Final'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Data</p>
                                <p className="text-lg font-semibold">{new Date(selectedSale.timestamp).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Origem</p>
                                <p className="text-lg font-semibold">{selectedSale.location === 'Factory' ? 'Fábrica' : 'Itaguaí'}</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 text-sm font-semibold text-slate-600">Produto</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-slate-600 text-right">Qtd</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-slate-600 text-right">Preço Unit.</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-slate-600 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {selectedSale.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-3 text-slate-800">{item.productType}</td>
                                            <td className="px-4 py-3 text-slate-600 text-right">{item.quantity}</td>
                                            <td className="px-4 py-3 text-slate-600 text-right">R$ {Number(item.unitPrice).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-slate-800 font-medium text-right">
                                                R$ {(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t-2 border-slate-200">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-4 text-right font-bold text-slate-900">TOTAL</td>
                                        <td className="px-4 py-4 text-right font-bold text-xl text-slate-900">
                                            R$ {selectedSale.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="border-t border-dashed border-slate-300 pt-8 mt-8">
                            <div className="flex justify-between items-end">
                                <div className="text-center w-48">
                                    <div className="border-b border-slate-300 mb-2 h-8"></div>
                                    <p className="text-xs text-slate-500">Assinatura do Entregador</p>
                                </div>
                                <div className="text-center w-48">
                                    <div className="border-b border-slate-300 mb-2 h-8"></div>
                                    <p className="text-xs text-slate-500">Assinatura do Recebedor</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-4 print:hidden">
                            <button
                                onClick={() => setSelectedSale(null)}
                                className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Fechar
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="btn-primary px-6 py-2 rounded-lg flex items-center gap-2"
                            >
                                <Printer className="w-5 h-5" />
                                Imprimir Romaneio
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
