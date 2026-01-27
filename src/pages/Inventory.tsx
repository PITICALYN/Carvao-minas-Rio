import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { type ProductType, type Location } from '../types';
import { Package, ArrowRightLeft, Truck } from 'lucide-react';

export const Inventory = () => {
    const { inventory, transferStock, currentUser } = useAppStore();
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    // Transfer State
    const [transferType, setTransferType] = useState<ProductType>('3kg');
    const [transferQty, setTransferQty] = useState('');
    const [transferFrom] = useState<Location>('Factory');
    const [transferTo] = useState<Location>('Itaguai');

    const handleTransfer = (e: React.FormEvent) => {
        e.preventDefault();
        const qty = parseInt(transferQty);
        if (!qty || qty <= 0) return;

        try {
            transferStock(transferFrom, transferTo, transferType, Number(transferQty));
            setIsTransferModalOpen(false);
            setTransferQty('');
            alert('Transferência realizada com sucesso!');
        } catch (error: any) {
            alert(error.message);
        }
    };

    const InventoryCard = ({ location, items, color }: { location: string; items: Record<string, number>; color: string }) => (
        <div className="glass-card p-6 rounded-2xl h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${color}`}>{location}</h3>
                <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-').replace('700', '500')} bg-opacity-20`}>
                    <Package className={`w-5 h-5 ${color}`} />
                </div>
            </div>

            <div className="space-y-4">
                {Object.entries(items).map(([type, qty]) => (
                    <div key={type} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="font-medium text-slate-300">{type}</span>
                        <span className="font-bold text-white bg-white/10 px-3 py-1 rounded-lg shadow-sm border border-white/10">
                            {qty} un
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Estoque</h2>
                    <p className="text-slate-400">Controle de estoque nas duas unidades.</p>
                </div>
                <button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <ArrowRightLeft className="w-5 h-5" />
                    Transferir Estoque
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(currentUser?.role === 'Admin' || currentUser?.role === 'Factory') && (
                    <InventoryCard
                        location="Fábrica (Beneficiamento)"
                        items={inventory.Factory}
                        color="text-blue-400"
                    />
                )}
                {(currentUser?.role === 'Admin' || currentUser?.role === 'Itaguai') && (
                    <InventoryCard
                        location="Depósito Itaguaí"
                        items={inventory.Itaguai}
                        color="text-purple-400"
                    />
                )}
            </div>

            {/* Transfer Modal */}
            {isTransferModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="glass-panel p-6 rounded-2xl w-full max-w-md shadow-2xl border border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-emerald-500/20 rounded-full">
                                <Truck className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Transferir Estoque</h3>
                        </div>

                        <form onSubmit={handleTransfer} className="space-y-4">
                            <div className="flex items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="text-center flex-1">
                                    <p className="text-xs text-slate-400 mb-1">Origem</p>
                                    <p className="font-bold text-white">{transferFrom}</p>
                                </div>
                                <ArrowRightLeft className="w-4 h-4 text-slate-500" />
                                <div className="text-center flex-1">
                                    <p className="text-xs text-slate-400 mb-1">Destino</p>
                                    <p className="font-bold text-white">{transferTo}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Produto</label>
                                <select
                                    value={transferType}
                                    onChange={(e) => setTransferType(e.target.value as ProductType)}
                                    className="w-full input-field px-4 py-2"
                                >
                                    <option value="3kg">3kg</option>
                                    <option value="5kg">5kg</option>
                                    <option value="Paulistao">Paulistão</option>
                                    <option value="Bulk">Granel</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Quantidade</label>
                                <input
                                    type="number"
                                    value={transferQty}
                                    onChange={(e) => setTransferQty(e.target.value)}
                                    className="w-full input-field px-4 py-2"
                                    placeholder="0"
                                    min="1"
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Disponível na origem: {inventory[transferFrom][transferType]} un
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsTransferModalOpen(false)}
                                    className="px-4 py-2 text-slate-400 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary px-4 py-2 rounded-lg"
                                >
                                    Confirmar Transferência
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
