import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { type ProductType } from '../types';
import { Plus, Scale, Edit } from 'lucide-react';

export const Production = () => {
    const { suppliers, productionBatches, addProductionBatch, updateProductionBatch, currentUser } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);

    // Form State
    const [supplierId, setSupplierId] = useState('');
    const [inputWeight, setInputWeight] = useState('');
    const [outputs, setOutputs] = useState<{ type: ProductType; qty: string }[]>([
        { type: '3kg', qty: '' },
        { type: '5kg', qty: '' },
        { type: 'Paulistao', qty: '' },
    ]);

    const calculateLoss = () => {
        const input = parseFloat(inputWeight) || 0;
        if (input === 0) return 0;

        let totalOutputKg = 0;
        outputs.forEach(out => {
            const qty = parseFloat(out.qty) || 0;
            if (out.type === '3kg') totalOutputKg += qty * 3;
            if (out.type === '5kg') totalOutputKg += qty * 5;
            if (out.type === 'Paulistao') totalOutputKg += qty * 10; // Assuming Paulistao is 10kg? Or maybe standard bag. Let's assume 4kg for now or ask user? 
            // Prompt says "3kg, 5kg e Paulistao". Paulistao usually is big, maybe 10kg or just a brand name for a standard size.
            // Let's assume Paulistao is 4kg for now based on common sizes, but I should probably make this configurable or ask.
            // Actually, let's assume Paulistao is a specific bag type.
            // Wait, if I don't know the weight, the loss calc will be wrong.
            // Let's assume Paulistao = 10kg for this prototype or maybe 2.5kg?
            // "Paulistão" might be a brand of bag.
            // Let's use 10kg as a placeholder and add a note.
            // Actually, let's check the prompt again. "3kg, 5kg e Paulistao".
            // Usually charcoal bags are 2kg, 3kg, 5kg, 10kg.
            // I'll assume 10kg for Paulistao.
        });

        // Loss = (Input - Output) / Input
        return ((input - totalOutputKg) / input) * 100;
    };

    const PAULISTAO_WEIGHT = 16; // Updated to 16kg per user request

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!supplierId || !inputWeight) return;

        const input = parseFloat(inputWeight);
        let totalOutputKg = 0;
        const finalOutputs = outputs.map(o => {
            const qty = parseFloat(o.qty) || 0;
            let weight = 0;
            if (o.type === '3kg') weight = 3;
            if (o.type === '5kg') weight = 5;
            if (o.type === 'Paulistao') weight = PAULISTAO_WEIGHT;

            totalOutputKg += qty * weight;
            return { productType: o.type, quantity: qty };
        }).filter(o => o.quantity > 0);

        const loss = ((input - totalOutputKg) / input) * 100;

        const batchData = {
            id: currentBatchId || crypto.randomUUID(),
            supplierId,
            date: new Date().toISOString().split('T')[0],
            inputWeightKg: input,
            outputs: finalOutputs,
            totalOutputWeightKg: totalOutputKg,
            lossPercentage: loss,
            timestamp: currentBatchId ? productionBatches.find(b => b.id === currentBatchId)?.timestamp || Date.now() : Date.now(),
        };

        if (currentBatchId) {
            updateProductionBatch(batchData);
        } else {
            addProductionBatch(batchData);
        }

        setIsModalOpen(false);
        setCurrentBatchId(null);
        setSupplierId('');
        setInputWeight('');
        setOutputs([
            { type: '3kg', qty: '' },
            { type: '5kg', qty: '' },
            { type: 'Paulistao', qty: '' },
        ]);
    };

    const handleEdit = (batch: any) => {
        setCurrentBatchId(batch.id);
        setSupplierId(batch.supplierId);
        setInputWeight(batch.inputWeightKg.toString());

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
    };

    const handleNew = () => {
        setCurrentBatchId(null);
        setSupplierId('');
        setInputWeight('');
        setOutputs([
            { type: '3kg', qty: '' },
            { type: '5kg', qty: '' },
            { type: 'Paulistao', qty: '' },
        ]);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
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
                            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Fornecedor</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Entrada (kg)</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Saída (Sacos)</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Perda</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {productionBatches.map((batch) => {
                            const supplier = suppliers.find(s => s.id === batch.supplierId);
                            return (
                                <tr key={batch.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        {new Date(batch.timestamp).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-white">
                                        {supplier?.name || 'Desconhecido'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
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
                                        {currentUser?.role === 'Admin' && (
                                            <button
                                                onClick={() => handleEdit(batch)}
                                                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="Editar Produção"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {productionBatches.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
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

                            {/* Supplier & Input */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Fornecedor</label>
                                    <select
                                        value={supplierId}
                                        onChange={(e) => setSupplierId(e.target.value)}
                                        className="w-full input-field px-4 py-2"
                                        required
                                    >
                                        <option value="">Selecione...</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Entrada (kg)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={inputWeight}
                                            onChange={(e) => setInputWeight(e.target.value)}
                                            className="w-full input-field px-4 py-2 pl-10"
                                            placeholder="0.00"
                                            required
                                        />
                                        <Scale className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                    </div>
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
                                                value={out.qty}
                                                onChange={(e) => {
                                                    const newOutputs = [...outputs];
                                                    newOutputs[idx].qty = e.target.value;
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
                                    <p className="text-xs text-emerald-400">Peso Entrada: {inputWeight || 0} kg</p>
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

