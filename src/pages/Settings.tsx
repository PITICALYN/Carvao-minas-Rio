import React, { useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Download, Upload, AlertTriangle, Save, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';

export const Settings = () => {
    const store = useAppStore();
    const { currentUser, restoreData } = store;
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });

            if (!confirm('ATENÇÃO: Restaurar um backup irá SUBSTITUIR todos os dados atuais do sistema. Tem certeza que deseja continuar?')) {
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            try {
                const newData: any = {};

                // Helper to get data
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

                // Users - be careful not to lock out admin if backup is old
                const users = getSheetData('Usuários');
                if (users.length > 0) newData.users = users;

                // Inventory reconstruction
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

                restoreData(newData);
                alert('Backup restaurado com sucesso!');
            } catch (error) {
                console.error(error);
                alert('Erro ao processar arquivo de backup. Verifique se o formato está correto.');
            }

            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="space-y-8">
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
        </div>
    );
};
