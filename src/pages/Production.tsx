import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { type ProductType } from '../types';
import { Plus, Scale, Edit, Trash2 } from 'lucide-react';
import { AdminAuthModal } from '../components/AdminAuthModal';

export const Production = () => {
    const { suppliers, productionBatches, addProductionBatch, updateProductionBatch, removeProductionBatch } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);

    // Admin Auth State
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<'Edit' | 'Delete' | null>(null);
    const [batchToActOn, setBatchToActOn] = useState<any | null>(null);

    // Form State
    // We now use an array of inputs for blending
    const [inputs, setInputs] = useState<{ supplierId: string; weight: string; maxStock: number }[]>([
        { supplierId: '', weight: '', maxStock: 0 }
    ]);

    const [outputs, setOutputs] = useState<{ type: ProductType; qty: string }[]>([
        { type: '3kg', qty: '' },
        { type: '5kg', qty: '' },
        { type: 'Paulistao', qty: '' },
    ]);

    const getTotalInputWeight = () => {
        return inputs.reduce((sum, input) => sum + (parseFloat(input.weight) || 0), 0);
    };

    const calculateLoss = () => {
        const input = getTotalInputWeight();
        if (input === 0) return 0;

        let totalOutputKg = 0;
        outputs.forEach(out => {
            const qty = parseFloat(out.qty) || 0;
            if (out.type === '3kg') totalOutputKg += qty * 3;
            if (out.type === '5kg') totalOutputKg += qty * 5;
            if (out.type === 'Paulistao') totalOutputKg += qty * 16;
        });

        // Loss = (Input - Output) / Input
        return ((input - totalOutputKg) / input) * 100;
    };

    const PAULISTAO_WEIGHT = 16;

    const getAvailableStock = (supplierId: string, excludeBatchId?: string | null) => {
        if (!supplierId) return 0;
        const { purchaseOrders, productionBatches } = useAppStore.getState();

        const totalReceived = purchaseOrders
            .filter(po => po.supplierId === supplierId && po.status === 'Received')
            .reduce((acc, po) => {
                const rawMaterialItems = po.items.filter(item =>
                    ['Charcoal_Bulk', 'Eucalyptus', 'Pinus'].includes(item.materialType)
                );
                return acc + rawMaterialItems.reduce((sum, item) => sum + item.quantity, 0);
            }, 0);

        const totalConsumed = productionBatches
            .filter(batch => batch.id !== excludeBatchId) // Exclude current batch if editing
            .reduce((acc, batch) => {
                // Check if batch has inputs (new format)
                if (batch.inputs) {
                    const input = batch.inputs.find(i => i.supplierId === supplierId);
                    return acc + (input ? input.weightKg : 0);
                }
                // Fallback for old format
                if (batch.supplierId === supplierId) {
                    return acc + batch.inputWeightKg;
                }
                return acc;
            }, 0);

        return Math.max(0, totalReceived - totalConsumed);
    };

    const handleAddInput = () => {
        setInputs([...inputs, { supplierId: '', weight: '', maxStock: 0 }]);
    };

    const handleRemoveInput = (index: number) => {
        const newInputs = inputs.filter((_, i) => i !== index);
        setInputs(newInputs);
    };

    const handleInputChange = (index: number, field: 'supplierId' | 'weight', value: string) => {
        const newInputs = [...inputs];

        if (field === 'supplierId') {
            newInputs[index].supplierId = value;
            // Recalculate max stock for this supplier
            if (value) {
                newInputs[index].maxStock = getAvailableStock(value, currentBatchId);
                // Auto-fill weight if it's the first input and empty (UX convenience)
                if (newInputs[index].maxStock > 0 && !newInputs[index].weight && inputs.length === 1 && !currentBatchId) {
                    newInputs[index].weight = newInputs[index].maxStock.toString();
                }
            } else {
                newInputs[index].maxStock = 0;
                newInputs[index].weight = '';
            }
        } else {
            newInputs[index].weight = value;
        }

        setInputs(newInputs);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate Inputs
        const validInputs = inputs.filter(i => i.supplierId && parseFloat(i.weight) > 0);
        if (validInputs.length === 0) {
            alert('Adicione pelo menos uma entrada de matéria-prima válida.');
            return;
        }

        // Check Stock for each input
        for (const input of validInputs) {
            const weight = parseFloat(input.weight);
            // Re-check stock to be safe
            const available = getAvailableStock(input.supplierId, currentBatchId);
            if (weight > available + 0.1) {
                const supplierName = suppliers.find(s => s.id === input.supplierId)?.name;
                alert(`Erro: Estoque insuficiente para ${supplierName}. Disponível: ${available.toFixed(2)}kg.`);
                return;
            }
        }

        const totalInputKg = getTotalInputWeight();

        let totalOutputKg = 0;
        const finalOutputs = outputs.map(o => {
            const qty = parseFloat(o.qty) || 0;
            if (qty < 0) return null;

            let weight = 0;
            if (o.type === '3kg') weight = 3;
            if (o.type === '5kg') weight = 5;
            if (o.type === 'Paulistao') weight = PAULISTAO_WEIGHT;

            totalOutputKg += qty * weight;
            return { productType: o.type, quantity: qty };
        }).filter((o): o is { productType: ProductType; quantity: number } => o !== null && o.quantity > 0);

        if (totalOutputKg > totalInputKg) {
            alert(`Erro: O peso total de saída (${totalOutputKg}kg) não pode ser maior que a entrada (${totalInputKg}kg).`);
            return;
        }

        const loss = ((totalInputKg - totalOutputKg) / totalInputKg) * 100;

        const batchData = {
            id: currentBatchId || crypto.randomUUID(),
            inputs: validInputs.map(i => ({ supplierId: i.supplierId, weightKg: parseFloat(i.weight) })),
            date: new Date().toISOString().split('T')[0],
            inputWeightKg: totalInputKg,
            outputs: finalOutputs,
            totalOutputWeightKg: totalOutputKg,
            lossPercentage: loss,
            timestamp: currentBatchId ? productionBatches.find(b => b.id === currentBatchId)?.timestamp || Date.now() : Date.now(),
        };

        if (currentBatchId) {
            updateProductionBatch(batchData as any); // Type assertion needed until full migration
        } else {
            addProductionBatch(batchData as any);
        }

        setIsModalOpen(false);
        setCurrentBatchId(null);
        setInputs([{ supplierId: '', weight: '', maxStock: 0 }]);
        setOutputs([
            { type: '3kg', qty: '' },
            { type: '5kg', qty: '' },
            { type: 'Paulistao', qty: '' },
        ]);
    };

    // Auth Wrappers
    const requestEdit = (batch: any) => {
        setBatchToActOn(batch);
        setPendingAction('Edit');
        setAuthModalOpen(true);
    };

    const requestDelete = (batch: any) => {
        setBatchToActOn(batch);
        setPendingAction('Delete');
        setAuthModalOpen(true);
    };

    const confirmAction = () => {
        if (!batchToActOn || !pendingAction) return;

        if (pendingAction === 'Edit') {
            const batch = batchToActOn;
            setCurrentBatchId(batch.id);

            // Populate Inputs
            if (batch.inputs && batch.inputs.length > 0) {
                const editInputs = batch.inputs.map((i: any) => ({
                    supplierId: i.supplierId,
                    weight: i.weightKg.toString(),
                    maxStock: getAvailableStock(i.supplierId, batch.id) // This will exclude current batch usage correctly
                }));
                setInputs(editInputs);
            } else {
                // Legacy support
                setInputs([{
                    supplierId: batch.supplierId,
                    weight: batch.inputWeightKg.toString(),
                    maxStock: getAvailableStock(batch.supplierId, batch.id)
                }]);
            }

            const newOutputs = [
                { type: '3kg', qty: '' },
                { type: '5kg', qty: '' },
                { type: 'Paulistao', qty: '' },
            ] as { type: ProductType; qty: string }[];

            batch.outputs.forEach((o: any) => {
                const idx = newOutputs.findIndex(no => no.type === o.productType);
                if (idx >= 0) newOutputs[idx].qty = o.quantity.toString();
            });

            setOutputs(newOutputs);
            setIsModalOpen(true);
        } else if (pendingAction === 'Delete') {
            removeProductionBatch(batchToActOn.id);
        }

        setAuthModalOpen(false);
        setPendingAction(null);
        setBatchToActOn(null);
    };

    const handleNew = () => {
        setCurrentBatchId(null);
        setInputs([{ supplierId: '', weight: '', maxStock: 0 }]);
        setOutputs([
            { type: '3kg', qty: '' },
            { type: '5kg', qty: '' },
            { type: 'Paulistao', qty: '' },
        ]);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <AdminAuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                onConfirm={confirmAction}
                actionType={pendingAction || 'Edit'}
            />

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Produção</h2>
                    <p className="text-slate-400">Registre a entrada de matéria-prima e saída de sacos.</p>
                </div>
                <button
                    onClick={handleNew}
                    className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Nova Produção
                </button>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Data</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Fornecedores (Entrada)</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Total Entrada</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Saída (Sacos)</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Perda</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {productionBatches.map((batch) => {
                            // Helper to display suppliers
                            const batchInputs = (batch as any).inputs || (batch.supplierId ? [{ supplierId: batch.supplierId, weightKg: batch.inputWeightKg }] : []);

                            return (
                                <tr key={batch.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        {new Date(batch.timestamp).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        <div className="flex flex-col gap-1">
                                            {batchInputs.map((input: any, idx: number) => {
                                                const s = suppliers.find(sup => sup.id === input.supplierId);
                                                return (
                                                    <span key={idx} className="text-xs">
                                                        {s?.name || 'Unknown'}: {input.weightKg}kg
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-white">
                                        {batch.inputWeightKg} kg
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        <div className="flex gap-2">
                                            {batch.outputs.map(o => (
                                                <span key={o.productType} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-medium border border-blue-500/20">
                                                    {o.quantity}x {o.productType}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${batch.lossPercentage > 15 ? 'bg-red-500/20 text-red-300 border border-red-500/20' : 'bg-green-500/20 text-green-300 border border-green-500/20'
                                            }`}>
                                            {batch.lossPercentage.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* Allow Edit/Delete for everyone but protected by password */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => requestEdit(batch)}
                                                className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                                title="Editar Produção"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => requestDelete(batch)}
                                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                title="Excluir Produção"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {productionBatches.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    Nenhuma produção registrada.
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
                        <h3 className="text-xl font-bold mb-4 text-white">Nova Produção</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Inputs Section */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Entrada de Matéria-Prima (Mistura)</label>
                                <div className="space-y-3">
                                    {inputs.map((input, idx) => (
                                        <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 relative">
                                            {inputs.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveInput(idx)}
                                                    className="absolute top-2 right-2 text-slate-500 hover:text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs text-slate-400 mb-1 block">Fornecedor</label>
                                                    <select
                                                        value={input.supplierId}
                                                        onChange={(e) => handleInputChange(idx, 'supplierId', e.target.value)}
                                                        className="w-full input-field px-3 py-2 text-sm"
                                                        required
                                                    >
                                                        <option value="">Selecione...</option>
                                                        {suppliers.map(s => (
                                                            <option key={s.id} value={s.id}>{s.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-400 mb-1 block">Peso (kg)</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={input.weight}
                                                            onChange={(e) => handleInputChange(idx, 'weight', e.target.value)}
                                                            className={`w-full input-field px-3 py-2 pl-9 text-sm ${input.maxStock <= 0 ? 'border-red-500/50' : ''}`}
                                                            placeholder="0.00"
                                                            required
                                                        />
                                                        <Scale className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                                                    </div>
                                                </div>
                                            </div>
                                            {input.supplierId && (
                                                <div className="mt-2 text-xs">
                                                    <span className={parseFloat(input.weight) > input.maxStock ? 'text-red-400 font-bold' : 'text-slate-500'}>
                                                        Disponível: {input.maxStock.toFixed(2)} kg
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={handleAddInput}
                                        className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" /> Adicionar Outro Fornecedor
                                    </button>
                                </div>
                                <div className="mt-2 text-right">
                                    <p className="text-sm text-slate-300">Total Entrada: <span className="font-bold text-white">{getTotalInputWeight().toFixed(2)} kg</span></p>
                                </div>
                            </div>

                            {/* Outputs */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Produção (Sacos)</label>
                                <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
                                    {outputs.map((out, idx) => (
                                        <div key={out.type} className="flex items-center gap-4">
                                            <span className="w-24 text-sm font-medium text-slate-300">{out.type}</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={out.qty}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (parseFloat(val) < 0) return;

                                                    const newOutputs = [...outputs];
                                                    newOutputs[idx].qty = val;
                                                    setOutputs(newOutputs);
                                                }}
                                                className="flex-1 input-field px-4 py-2"
                                                placeholder="Qtd Sacos"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Perda Estimada</p>
                                    <p className="text-2xl font-bold text-emerald-400">
                                        {calculateLoss().toFixed(1)}%
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-emerald-400">Peso Entrada: {getTotalInputWeight().toFixed(2)} kg</p>
                                </div>
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
                                    Confirmar Produção
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

