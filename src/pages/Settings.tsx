import React, { useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Download, Upload, AlertTriangle, Save, RefreshCw, DollarSign } from 'lucide-react';
import * as XLSX from 'xlsx';
import { AdminAuthModal } from '../components/AdminAuthModal';

export const Settings = () => {
    const store = useAppStore();
    const { currentUser, restoreData } = store;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Admin Auth State
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<'Restore' | 'UpdateDRE' | null>(null);
    const [pendingData, setPendingData] = useState<any>(null);

    if (currentUser?.role !== 'Admin') {
        return (
            <div className="flex items-center justify-center h-full text-slate-400">
                Acesso restrito a administradores.
            </div>
        );
    }

    const handleExportBackup = () => {
        const wb = XLSX.utils.book_new();

        // Helper to add sheet
        const addSheet = (data: any[], name: string) => {
            if (data.length === 0) return;
            const ws = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, name);
        };

        // Add all data
        addSheet(store.sales, 'Vendas');
        addSheet(store.productionBatches, 'Produção');
        addSheet(store.purchaseOrders, 'Compras');
        addSheet(store.customers, 'Clientes');
        addSheet(store.suppliers, 'Fornecedores');
        addSheet(store.transactions, 'Financeiro');
        addSheet(store.users, 'Usuários');

        // Inventory is an object, needs transformation
        const inventoryData = [
            ...Object.entries(store.inventory.Factory).map(([type, qty]) => ({ Location: 'Factory', Type: type, Quantity: qty })),
            ...Object.entries(store.inventory.Itaguai).map(([type, qty]) => ({ Location: 'Itaguai', Type: type, Quantity: qty }))
        ];
        addSheet(inventoryData, 'Estoque');

        // Generate filename with date
        const date = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `backup_carvoaria_${date}.xlsx`);
    };

    const [localDreSettings, setLocalDreSettings] = useState(store.dreSettings || { taxRate: 6, cmvRate: 40, fixedLaborCost: 0 });

    const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });

            try {
                const newData: any = {};
                const getSheetData = (name: string) => {
                    const ws = wb.Sheets[name];
                    return ws ? XLSX.utils.sheet_to_json(ws) : [];
                };

                newData.sales = getSheetData('Vendas');
                newData.productionBatches = getSheetData('Produção');
                newData.purchaseOrders = getSheetData('Compras');
                newData.customers = getSheetData('Clientes');
                newData.suppliers = getSheetData('Fornecedores');
                newData.transactions = getSheetData('Financeiro');

                const users = getSheetData('Usuários');
                if (users.length > 0) newData.users = users;

                const inventoryRows: any[] = getSheetData('Estoque');
                if (inventoryRows.length > 0) {
                    newData.inventory = {
                        Factory: { '3kg': 0, '5kg': 0, 'Paulistao': 0, 'Bulk': 0 },
                        Itaguai: { '3kg': 0, '5kg': 0, 'Paulistao': 0, 'Bulk': 0 }
                    };
                    inventoryRows.forEach(row => {
                        if (newData.inventory[row.Location]) {
                            newData.inventory[row.Location][row.Type] = row.Quantity;
                        }
                    });
                }

                setPendingData(newData);
                setPendingAction('Restore');
                setAuthModalOpen(true);
            } catch (error) {
                console.error(error);
                alert('Erro ao processar arquivo de backup. Verifique se o formato está correto.');
            }

            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsBinaryString(file);
    };

    const confirmAction = () => {
        if (!pendingAction) return;

        if (pendingAction === 'Restore') {
            restoreData(pendingData);
            alert('Backup restaurado com sucesso!');
        } else if (pendingAction === 'UpdateDRE') {
            store.updateDreSettings(localDreSettings);
            alert('Configurações salvas com sucesso!');
        }

        setAuthModalOpen(false);
        setPendingAction(null);
        setPendingData(null);
    };

    const handleSaveDRE = () => {
        setPendingAction('UpdateDRE');
        setAuthModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <AdminAuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                onConfirm={confirmAction}
                actionType="Edit"
            />
            <div>
                <h2 className="text-2xl font-bold text-white">Configurações</h2>
                <p className="text-slate-400">Gerencie backups e preferências do sistema.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Backup Section */}
                <div className="glass-card p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                            <Save className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Backup de Dados</h3>
                            <p className="text-sm text-slate-400">Exporte seus dados para segurança</p>
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm mb-6">
                        Gera um arquivo Excel (.xlsx) contendo todos os registros de vendas, produção, estoque, clientes e financeiro.
                    </p>
                    <button
                        onClick={handleExportBackup}
                        className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        Baixar Backup Completo
                    </button>
                </div>

                {/* Restore Section */}
                <div className="glass-card p-6 rounded-2xl border border-red-500/20">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-red-500/20 text-red-400">
                            <RefreshCw className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Restaurar Dados</h3>
                            <p className="text-sm text-slate-400">Recupere dados de um arquivo</p>
                        </div>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex gap-3 items-start">
                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-200">
                            <strong>Cuidado:</strong> Esta ação irá substituir TODOS os dados atuais pelos dados do arquivo selecionado. Esta ação não pode ser desfeita.
                        </p>
                    </div>

                    <input
                        type="file"
                        accept=".xlsx"
                        onChange={handleImportBackup}
                        ref={fileInputRef}
                        className="hidden"
                        id="restore-input"
                    />
                    <label
                        htmlFor="restore-input"
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors border border-white/10"
                    >
                        <Upload className="w-5 h-5" />
                        Selecionar Arquivo de Backup
                    </label>
                </div>
            </div>

            {/* DRE Configuration */}
            <div className="glass-card p-6 rounded-2xl border border-white/5 mt-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Configurações do DRE</h3>
                        <p className="text-sm text-slate-400">Defina as taxas e custos fixos para o relatório financeiro.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Impostos (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={localDreSettings.taxRate}
                                onChange={(e) => setLocalDreSettings({
                                    ...localDreSettings,
                                    taxRate: Number(e.target.value)
                                })}
                                className="w-full input-field px-4 py-2 pr-8"
                                placeholder="0.00"
                            />
                            <span className="absolute right-3 top-2 text-slate-500">%</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Incide sobre a Receita Bruta.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">CMV Estimado (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={localDreSettings.cmvRate}
                                onChange={(e) => setLocalDreSettings({
                                    ...localDreSettings,
                                    cmvRate: Number(e.target.value)
                                })}
                                className="w-full input-field px-4 py-2 pr-8"
                                placeholder="0.00"
                            />
                            <span className="absolute right-3 top-2 text-slate-500">%</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Custo de Matéria-prima/Embalagem sobre Vendas.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Mão de Obra Fixa (R$)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-slate-500">R$</span>
                            <input
                                type="number"
                                value={localDreSettings.fixedLaborCost}
                                onChange={(e) => setLocalDreSettings({
                                    ...localDreSettings,
                                    fixedLaborCost: Number(e.target.value)
                                })}
                                className="w-full input-field px-4 py-2 pl-10"
                                placeholder="0.00"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Adicionado automaticamente às Despesas Operacionais.</p>
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={handleSaveDRE}
                        className="btn-primary px-6 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Salvar Configurações
                    </button>
                </div>
            </div>
        </div>
    );
};
