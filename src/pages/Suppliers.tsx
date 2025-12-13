import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, User, Phone, Edit, Trash2 } from 'lucide-react';

export const Suppliers = () => {
    const { suppliers, addSupplier, updateSupplier, removeSupplier, getSupplierStats, currentUser } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSupplierId, setCurrentSupplierId] = useState<string | null>(null);
    const [newSupplierName, setNewSupplierName] = useState('');
    const [newSupplierContact, setNewSupplierContact] = useState('');
    const [newSupplierDocument, setNewSupplierDocument] = useState('');

    const handleAddOrUpdateSupplier = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSupplierName.trim()) return;

        if (currentSupplierId) {
            updateSupplier({
                id: currentSupplierId,
                name: newSupplierName,
                contact: newSupplierContact,
                document: newSupplierDocument,
            });
        } else {
            addSupplier({
                id: crypto.randomUUID(),
                name: newSupplierName,
                contact: newSupplierContact,
                document: newSupplierDocument,
            });
        }

        setNewSupplierName('');
        setNewSupplierContact('');
        setNewSupplierDocument('');
        setCurrentSupplierId(null);
        setIsModalOpen(false);
    };

    const handleEdit = (supplier: any) => {
        setCurrentSupplierId(supplier.id);
        setNewSupplierName(supplier.name);
        setNewSupplierContact(supplier.contact);
        setNewSupplierDocument(supplier.document);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setCurrentSupplierId(null);
        setNewSupplierName('');
        setNewSupplierContact('');
        setNewSupplierDocument('');
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Fornecedores</h2>
                    <p className="text-slate-400">Gerencie seus fornecedores de matéria-prima.</p>
                </div>
                <button
                    onClick={handleNew}
                    className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Novo Fornecedor
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map((supplier) => {
                    const stats = getSupplierStats(supplier.id);
                    return (
                        <div key={supplier.id} className="glass-card p-6 rounded-2xl relative group">
                            {currentUser?.role === 'Admin' && (
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(supplier)}
                                        className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
                                                removeSupplier(supplier.id);
                                            }
                                        }}
                                        className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{supplier.name}</h3>
                                        <div className="flex flex-col gap-1 mt-1">
                                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                                <span className="font-medium">Doc:</span>
                                                {supplier.document || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                                <Phone className="w-3 h-3" />
                                                {supplier.contact || 'Sem contato'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                                <div>
                                    <p className="text-xs text-slate-400">Total Fornecido</p>
                                    <p className="font-semibold text-slate-200">{stats.totalInput} kg</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Perda Média</p>
                                    <p className={`font-semibold ${stats.avgLoss > 15 ? 'text-red-400' : 'text-green-400'}`}>
                                        {stats.avgLoss.toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {suppliers.length === 0 && (
                    <div className="col-span-full text-center py-12 glass-card rounded-2xl border-2 border-dashed border-slate-700">
                        <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">Nenhum fornecedor cadastrado.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="glass-panel p-6 rounded-2xl w-full max-w-md shadow-2xl border border-white/10">
                        <h3 className="text-xl font-bold mb-4 text-white">{currentSupplierId ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
                        <form onSubmit={handleAddOrUpdateSupplier} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Nome</label>
                                <input
                                    type="text"
                                    value={newSupplierName}
                                    onChange={(e) => setNewSupplierName(e.target.value)}
                                    className="w-full input-field px-4 py-2"
                                    placeholder="Ex: Carvoaria do João"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">CPF / CNPJ</label>
                                <input
                                    type="text"
                                    value={newSupplierDocument}
                                    onChange={(e) => setNewSupplierDocument(e.target.value)}
                                    className="w-full input-field px-4 py-2"
                                    placeholder="000.000.000-00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Contato</label>
                                <input
                                    type="text"
                                    value={newSupplierContact}
                                    onChange={(e) => setNewSupplierContact(e.target.value)}
                                    className="w-full input-field px-4 py-2"
                                    placeholder="(XX) XXXXX-XXXX"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
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
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
