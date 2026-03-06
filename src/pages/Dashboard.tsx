import React, { useMemo } from 'react';
import clsx from 'clsx';
import { useAppStore } from '../store/useAppStore';
import { Package, AlertTriangle, DollarSign, Printer, TrendingUp, Users, Factory, Settings, PieChart as PieChartIcon, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

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

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
                <p className="text-slate-300 text-sm mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
                        {entry.name}: {entry.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const DreManagement = () => {
    const { sales, transactions, dreSettings, updateDreSettings, currentUser } = useAppStore();
    const [isConfigOpen, setIsConfigOpen] = React.useState(false);
    const [tempSettings, setTempSettings] = React.useState(dreSettings);

    const totalRevenue = useMemo(() => sales.reduce((acc, s) => acc + s.totalAmount, 0), [sales]);

    // Detailed DRE Calculations
    const totalBagsSold = useMemo(() => {
        return sales.reduce((acc, sale) => {
            return acc + sale.items.reduce((itemAcc, item) => itemAcc + (item.productType === 'Bulk' ? 0 : item.quantity), 0);
        }, 0);
    }, [sales]);

    const taxes = totalRevenue * (dreSettings.taxRate / 100);
    const laborCosts = totalBagsSold * dreSettings.laborCostPerUnit;
    const packagingCosts = totalBagsSold * dreSettings.packagingCostPerUnit;
    const transportCosts = totalBagsSold * dreSettings.transportCostPerBag;

    // Purchases (CMV equivalent for this simple model)
    const rawMaterialCosts = transactions
        .filter(t => t.category === 'Purchase' && t.type === 'Expense')
        .reduce((acc, t) => acc + t.amount, 0);

    const otherExpenses = transactions
        .filter(t => t.category === 'Operational' && t.type === 'Expense')
        .reduce((acc, t) => acc + t.amount, 0);

    const totalCosts = taxes + laborCosts + packagingCosts + transportCosts + rawMaterialCosts + otherExpenses;
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const handleSaveSettings = () => {
        updateDreSettings(tempSettings);
        setIsConfigOpen(false);
    };

    return (
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-bold text-white">DRE Gerencial</h3>
                </div>
                {(currentUser?.role === 'Admin' || currentUser?.role === 'Director' || currentUser?.role === 'Financial') && (
                    <button
                        onClick={() => setIsConfigOpen(!isConfigOpen)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
                        title="Configurar Custos"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                )}
            </div>

            {isConfigOpen && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Imposto Médio (%)</label>
                        <input
                            type="number"
                            value={tempSettings.taxRate}
                            onChange={e => setTempSettings({ ...tempSettings, taxRate: Number(e.target.value) })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Mão de Obra (R$/saco)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={tempSettings.laborCostPerUnit}
                            onChange={e => setTempSettings({ ...tempSettings, laborCostPerUnit: Number(e.target.value) })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Embalagem (R$/saco)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={tempSettings.packagingCostPerUnit}
                            onChange={e => setTempSettings({ ...tempSettings, packagingCostPerUnit: Number(e.target.value) })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Transporte (R$/saco)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={tempSettings.transportCostPerBag}
                            onChange={e => setTempSettings({ ...tempSettings, transportCostPerBag: Number(e.target.value) })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                        <button onClick={() => setIsConfigOpen(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">Cancelar</button>
                        <button onClick={handleSaveSettings} className="px-4 py-1.5 text-xs bg-indigo-600 text-white rounded-lg font-bold">Salvar Configurações</button>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <span className="text-sm font-medium text-emerald-400">Receita Bruta</span>
                    <span className="text-lg font-bold text-white">R$ {totalRevenue.toLocaleString()}</span>
                </div>

                <div className="space-y-1 pl-2">
                    <div className="flex justify-between text-xs text-slate-400 border-b border-white/5 py-1.5">
                        <span>(-) Impostos ({dreSettings.taxRate}%)</span>
                        <span className="text-red-400">- R$ {taxes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 border-b border-white/5 py-1.5">
                        <span>(-) Mão de Obra (R$ {dreSettings.laborCostPerUnit}/sc)</span>
                        <span className="text-red-400">- R$ {laborCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 border-b border-white/5 py-1.5">
                        <span>(-) Embalagens (R$ {dreSettings.packagingCostPerUnit}/sc)</span>
                        <span className="text-red-400">- R$ {packagingCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 border-b border-white/5 py-1.5">
                        <span>(-) Transporte (R$ {dreSettings.transportCostPerBag}/sc)</span>
                        <span className="text-red-400">- R$ {transportCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 border-b border-white/5 py-1.5">
                        <span>(-) Matéria Prima (Compras)</span>
                        <span className="text-red-400">- R$ {rawMaterialCosts.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 mt-4">
                    <div>
                        <span className="block text-xs font-medium text-indigo-400 mb-0.5">LUCRO LÍQUIDO</span>
                        <div className="flex items-center gap-2">
                            {netProfit >= 0 ? <ArrowUpCircle className="w-5 h-5 text-emerald-500" /> : <ArrowDownCircle className="w-5 h-5 text-red-500" />}
                            <span className="text-xl font-black text-white">R$ {netProfit.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="block text-xs font-medium text-slate-400 mb-0.5">MARGEM</span>
                        <span className={clsx("text-lg font-bold", netProfit >= 0 ? "text-emerald-400" : "text-red-400")}>
                            {profitMargin.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Dashboard = () => {
    const { inventory, sales, productionBatches, currentUser } = useAppStore();

    const totalStockFactory = Object.values(inventory.Factory).reduce((a, b) => a + b, 0);
    const totalStockItaguai = Object.values(inventory.Itaguai).reduce((a, b) => a + b, 0);
    const totalSales = sales.reduce((a, b) => a + b.totalAmount, 0);

    // Calculate average loss across all batches
    const avgLoss = productionBatches.length > 0
        ? (productionBatches.reduce((a, b) => a + b.lossPercentage, 0) / productionBatches.length).toFixed(1)
        : '0';

    // --- Chart Data Preparation ---

    // 1. Sales Trend (Last 30 Days)
    const salesData = useMemo(() => {
        const last30Days = [...Array(30)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (29 - i));
            return d.toLocaleDateString('sv-SE');
        });

        return last30Days.map(date => {
            const daySales = sales.filter(s => s.date === date);
            return {
                date: date.split('-').reverse().slice(0, 2).join('/'),
                cash: daySales.filter(s => s.paymentMethod === 'Cash').reduce((acc, s) => acc + s.totalAmount, 0),
                credit: daySales.filter(s => s.paymentMethod === 'Credit').reduce((acc, s) => acc + s.totalAmount, 0)
            };
        });
    }, [sales]);

    // 2. Production vs Loss
    const productionData = useMemo(() => {
        const last7DaysBatches = productionBatches.slice(-10); // Last 10 batches for better viz
        return last7DaysBatches.map(batch => ({
            name: `Lote ${batch.id.slice(0, 6)}`,
            Produção: batch.totalOutputWeightKg,
            Perda: batch.inputWeightKg - batch.totalOutputWeightKg
        }));
    }, [productionBatches]);

    // 3. Top Customers
    const customerData = useMemo(() => {
        const customerSales: Record<string, number> = {};
        sales.forEach(sale => {
            const name = sale.customerName || 'Consumidor Final';
            customerSales[name] = (customerSales[name] || 0) + sale.totalAmount;
        });

        return Object.entries(customerSales)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5
    }, [sales]);

    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

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
                    title="Estoque Itaguai"
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

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Trend Chart */}
                <div className="glass-card p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                Evolução de Vendas
                            </h3>
                            <p className="text-sm text-slate-400">Últimos 30 dias (Vista vs Prazo)</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `R$${value / 1000}k`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="cash"
                                    name="À Vista"
                                    stackId="1"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorCash)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="credit"
                                    name="A Prazo"
                                    stackId="1"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorCredit)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Production vs Loss Chart */}
                <div className="glass-card p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Factory className="w-5 h-5 text-blue-400" />
                                Produção vs Perda (kg)
                            </h3>
                            <p className="text-sm text-slate-400">Últimos Lotes</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={productionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="Produção" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Perda" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Customers Chart */}
                <div className="glass-card p-6 rounded-2xl border border-white/5 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-amber-400" />
                                Top Clientes
                            </h3>
                            <p className="text-sm text-slate-400">Por volume de compras</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full flex flex-col md:flex-row items-center justify-center gap-8">
                        <div className="w-full md:w-1/2 h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={customerData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {customerData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full md:w-1/2 grid grid-cols-1 gap-4">
                            {customerData.map((entry, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className="text-slate-300 font-medium">{entry.name}</span>
                                    </div>
                                    <span className="text-white font-bold">
                                        R$ {entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* DRE Gerencial Row */}
            <div className="mt-8">
                <DreManagement />
            </div>
        </div>
    );
};
