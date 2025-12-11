import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Package, AlertTriangle, DollarSign, Printer } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string; icon: React.ElementType; color: string }) => (
    <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
            <p className="text-sm text-slate-400 font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-white">{value}</h3>
        </div>
    </div>
);

export const Dashboard = () => {
    const { inventory, sales, productionBatches, currentUser } = useAppStore();

    const totalStockFactory = Object.values(inventory.Factory).reduce((a, b) => a + b, 0);
    const totalStockItaguai = Object.values(inventory.Itaguai).reduce((a, b) => a + b, 0);
    const totalSales = sales.reduce((a, b) => a + b.totalAmount, 0);

    // Calculate average loss across all batches
    const avgLoss = productionBatches.length > 0
        ? (productionBatches.reduce((a, b) => a + b.lossPercentage, 0) / productionBatches.length).toFixed(1)
        : '0';

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Visão Geral</h2>
                    <p className="text-slate-400">Bem-vindo ao painel de controle da Carvoaria.</p>
                </div>
                {(currentUser?.role === 'Admin' || currentUser?.canPrint) && (
                    <button
                        onClick={() => window.print()}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-white/10"
                    >
                        <Printer className="w-4 h-4" />
                        Imprimir
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Estoque Fábrica"
                    value={`${totalStockFactory} un`}
                    icon={Package}
                    color="bg-emerald-500 text-emerald-600"
                />
                <StatCard
                    title="Estoque Itaguaí"
                    value={`${totalStockItaguai} un`}
                    icon={Package}
                    color="bg-amber-500 text-amber-600"
                />
                <StatCard
                    title="Vendas Totais"
                    value={`R$ ${totalSales.toLocaleString('pt-BR')}`}
                    icon={DollarSign}
                    color="bg-green-500 text-green-600"
                />
                <StatCard
                    title="Perda Média"
                    value={`${avgLoss}%`}
                    icon={AlertTriangle}
                    color="bg-orange-500 text-orange-600"
                />
            </div>

            {/* Quick Actions or Recent Activity could go here */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl h-64 flex items-center justify-center text-slate-500 border-dashed border-2 border-slate-700">
                    Gráfico de Vendas (Em Breve)
                </div>
                <div className="glass-card p-6 rounded-2xl h-64 flex items-center justify-center text-slate-500 border-dashed border-2 border-slate-700">
                    Ranking de Fornecedores (Em Breve)
                </div>
            </div>
        </div>
    );
};
