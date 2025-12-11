import { useAppStore } from '../store/useAppStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Award, Printer, DollarSign } from 'lucide-react';

export const Reports = () => {
    const { suppliers, getSupplierStats, sales, currentUser } = useAppStore();

    // Supplier Data
    const supplierData = suppliers.map(s => {
        const stats = getSupplierStats(s.id);
        return {
            name: s.name,
            loss: parseFloat(stats.avgLoss.toFixed(1)),
            input: stats.totalInput
        };
    }).sort((a, b) => a.loss - b.loss); // Best (lowest loss) first

    // Sales Data (Grouped by Date)
    const salesByDate = sales.reduce((acc, sale) => {
        const date = new Date(sale.timestamp).toLocaleDateString();
        acc[date] = (acc[date] || 0) + sale.totalAmount;
        return acc;
    }, {} as Record<string, number>);

    const salesData = Object.entries(salesByDate).map(([date, total]) => ({
        date,
        total
    }));

    // Cost Analysis
    const { productionBatches, transactions } = useAppStore();
    const totalInputWeight = productionBatches.reduce((acc, batch) => acc + batch.inputWeightKg, 0);

    // Calculate total purchase cost (Expenses with category 'Purchase')
    // If no specific category 'Purchase' is strictly used yet, we might need to rely on 'Expense' type generally or filter by description/category if available.
    // For now, let's assume all 'Expense' with category 'Purchase' or 'Operational' (if raw material is there) counts.
    // Let's stick to 'Purchase' category for accuracy if the user uses it correctly.
    const totalPurchaseCost = transactions
        .filter(t => t.type === 'Expense' && (t.category === 'Purchase' || t.category === 'Operational'))
        .reduce((acc, t) => acc + t.amount, 0);

    const avgCostPerKg = totalInputWeight > 0 ? totalPurchaseCost / totalInputWeight : 0;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Relatórios</h2>
                    <p className="text-slate-400">Análise de desempenho e financeiro.</p>
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

            {/* Cost Analysis Card */}
            <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    Análise de Custos (Estimativa)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                        <p className="text-sm text-slate-400 mb-1">Custo Médio Matéria Prima</p>
                        <p className="text-2xl font-bold text-white">R$ {avgCostPerKg.toFixed(2)} <span className="text-sm font-normal text-slate-500">/ kg</span></p>
                        <p className="text-xs text-slate-500 mt-2">Baseado em R$ {totalPurchaseCost.toLocaleString()} gastos / {totalInputWeight.toLocaleString()} kg entrada</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                        <p className="text-sm text-slate-400 mb-1">Custo Saco 3kg</p>
                        <p className="text-xl font-bold text-emerald-400">R$ {(avgCostPerKg * 3).toFixed(2)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                        <p className="text-sm text-slate-400 mb-1">Custo Saco 5kg</p>
                        <p className="text-xl font-bold text-emerald-400">R$ {(avgCostPerKg * 5).toFixed(2)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                        <p className="text-sm text-slate-400 mb-1">Custo Paulistão (20kg)</p>
                        <p className="text-xl font-bold text-emerald-400">R$ {(avgCostPerKg * 20).toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Supplier Ranking */}
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-orange-500/20 rounded-full">
                            <Award className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Ranking de Fornecedores</h3>
                            <p className="text-xs text-slate-400">Menor perda = Melhor desempenho</p>
                        </div>
                    </div>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={supplierData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
                                <XAxis type="number" unit="%" stroke="#94a3b8" />
                                <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" />
                                <Tooltip
                                    formatter={(value: number) => [`${value}%`, 'Perda Média']}
                                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                />
                                <Bar dataKey="loss" fill="#f97316" radius={[0, 4, 4, 0]} name="Perda %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Financial Overview */}
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-green-500/20 rounded-full">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Vendas Diárias</h3>
                            <p className="text-xs text-slate-400">Receita acumulada por dia</p>
                        </div>
                    </div>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="date" stroke="#94a3b8" />
                                <YAxis unit="R$" stroke="#94a3b8" />
                                <Tooltip
                                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Vendas']}
                                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, fill: '#22c55e' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
