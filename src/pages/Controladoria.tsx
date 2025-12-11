import { useAppStore } from '../store/useAppStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertCircle, DollarSign, PieChart as PieChartIcon } from 'lucide-react';

export const Controladoria = () => {
    const { productionBatches, sales, transactions } = useAppStore();

    // Calculate Metrics
    const totalProductionCost = productionBatches.reduce((acc, batch) => {
        // Estimate cost based on input weight (e.g., R$ 0.50 per kg of wood) + operational cost
        // This is a placeholder logic as we don't have exact cost data in batch yet
        return acc + (batch.inputWeightKg * 0.5);
    }, 0);

    const totalSalesRevenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'Expense')
        .reduce((acc, t) => acc + t.amount, 0);

    const totalIncome = transactions
        .filter(t => t.type === 'Income')
        .reduce((acc, t) => acc + t.amount, 0);

    // Combine Sales Revenue with Transaction Income for total revenue view
    const grossRevenue = totalSalesRevenue + totalIncome;
    const netProfit = grossRevenue - (totalProductionCost + totalExpenses);

    const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    // Chart Data
    const financialData = [
        { name: 'Receita', value: grossRevenue },
        { name: 'Custos/Despesas', value: totalProductionCost + totalExpenses },
        { name: 'Lucro Líquido', value: netProfit }
    ];

    const expenseBreakdown = transactions
        .filter(t => t.type === 'Expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

    const pieData = Object.entries(expenseBreakdown).map(([name, value]) => ({ name, value }));
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Controladoria</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-5 rounded-xl">
                    <p className="text-slate-400 text-sm font-medium mb-1">Receita Bruta</p>
                    <h3 className="text-2xl font-bold text-green-400">R$ {grossRevenue.toLocaleString()}</h3>
                    <div className="flex items-center gap-1 text-xs text-green-500 mt-2">
                        <TrendingUp className="w-3 h-3" />
                        <span>+12% vs mês anterior</span>
                    </div>
                </div>

                <div className="glass-card p-5 rounded-xl">
                    <p className="text-slate-400 text-sm font-medium mb-1">Custo Total</p>
                    <h3 className="text-2xl font-bold text-red-400">R$ {(totalProductionCost + totalExpenses).toLocaleString()}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                        <AlertCircle className="w-3 h-3" />
                        <span>Inclui produção e operacional</span>
                    </div>
                </div>

                <div className="glass-card p-5 rounded-xl">
                    <p className="text-slate-400 text-sm font-medium mb-1">Lucro Líquido</p>
                    <h3 className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        R$ {netProfit.toLocaleString()}
                    </h3>
                </div>

                <div className="glass-card p-5 rounded-xl">
                    <p className="text-slate-400 text-sm font-medium mb-1">Margem de Lucro</p>
                    <h3 className={`text-2xl font-bold ${profitMargin >= 20 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {profitMargin.toFixed(1)}%
                    </h3>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Financial Overview Chart */}
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-blue-400" />
                        Visão Geral Financeira
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financialData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expense Breakdown Chart */}
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-purple-400" />
                        Distribuição de Despesas
                    </h3>
                    <div className="h-80 flex items-center justify-center">
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-slate-500">Sem dados de despesas para exibir.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Audit Log (Placeholder) */}
            <div className="glass-card p-6 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-4">Log de Auditoria Recente</h3>
                <div className="space-y-3">
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <p className="text-sm text-slate-300">Usuário <span className="text-white font-medium">Admin</span> atualizou estoque</p>
                            </div>
                            <span className="text-xs text-slate-500">Há {i * 15 + 5} min</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
