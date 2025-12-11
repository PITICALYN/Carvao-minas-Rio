import { useAppStore } from '../store/useAppStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Award } from 'lucide-react';

export const Reports = () => {
    const { suppliers, getSupplierStats, sales } = useAppStore();

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

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white">Relatórios</h2>
                <p className="text-slate-400">Análise de desempenho e financeiro.</p>
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
