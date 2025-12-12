import { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export const DRE = () => {
    const { sales, transactions } = useAppStore();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    const financialData = useMemo(() => {
        // Filter data for selected period
        const periodSales = sales.filter(s => {
            const date = new Date(s.date);
            return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
        });

        const periodExpenses = transactions.filter(t => {
            const date = new Date(t.date);
            return t.type === 'Expense' &&
                date.getMonth() === selectedMonth &&
                date.getFullYear() === selectedYear;
        });

        // 1. Gross Revenue (Receita Bruta)
        const grossRevenue = periodSales.reduce((acc, sale) => acc + sale.totalAmount, 0);

        // 2. Deductions (Impostos, Devoluções - Placeholder for now)
        const deductions = 0;

        // 3. Net Revenue (Receita Líquida)
        const netRevenue = grossRevenue - deductions;

        // 4. Cost of Goods Sold (CMV - Custo da Mercadoria Vendida)
        // Ideally this should be calculated based on inventory cost, but for now we can approximate 
        // or use purchase orders if we assume direct sales-purchase link (which is not always true).
        // A better approximation for this MVP might be a fixed percentage or derived from production costs if available.
        // Let's use a simplified approach: Sum of Purchase Orders for raw materials in this period (Cash Basis) 
        // OR better: standard cost per unit * units sold.
        // Let's go with Standard Cost estimation for now as we don't have strict batch tracking cost yet.
        // Assuming average cost of 30% of sales price for demonstration, or 0 if no data.
        // TODO: Refine this with real production cost data.
        const cmv = periodSales.reduce((acc, sale) => {
            // Placeholder: 40% of sales value is cost (Charcoal + Packaging + Transport)
            return acc + (sale.totalAmount * 0.4);
        }, 0);

        // 5. Gross Profit (Lucro Bruto)
        const grossProfit = netRevenue - cmv;

        // 6. Operating Expenses (Despesas Operacionais)
        const operatingExpenses = periodExpenses.reduce((acc, t) => acc + t.amount, 0);

        // 7. Net Profit (Lucro Líquido)
        const netProfit = grossProfit - operatingExpenses;

        return {
            grossRevenue,
            deductions,
            netRevenue,
            cmv,
            grossProfit,
            operatingExpenses,
            netProfit
        };
    }, [sales, transactions, selectedMonth, selectedYear]);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const getPercentage = (value: number, total: number) => {
        if (total === 0) return '0%';
        return `${((value / total) * 100).toFixed(1)}%`;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">DRE Gerencial</h1>
                    <p className="text-slate-400">Demonstrativo de Resultado do Exercício</p>
                </div>

                <div className="flex gap-4 bg-slate-900 p-2 rounded-xl border border-white/10">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="bg-transparent text-white border-none focus:ring-0 cursor-pointer"
                    >
                        {months.map((m, i) => (
                            <option key={i} value={i} className="bg-slate-900">{m}</option>
                        ))}
                    </select>
                    <div className="w-px bg-white/10"></div>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="bg-transparent text-white border-none focus:ring-0 cursor-pointer"
                    >
                        {years.map((y) => (
                            <option key={y} value={y} className="bg-slate-900">{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-emerald-400 text-sm font-medium mb-1">Receita Líquida</p>
                            <h3 className="text-2xl font-bold text-white">{formatCurrency(financialData.netRevenue)}</h3>
                        </div>
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>
                    <div className="w-full bg-emerald-950/50 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-red-400 text-sm font-medium mb-1">Despesas + CMV</p>
                            <h3 className="text-2xl font-bold text-white">
                                {formatCurrency(financialData.operatingExpenses + financialData.cmv)}
                            </h3>
                        </div>
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <TrendingDown className="w-5 h-5 text-red-400" />
                        </div>
                    </div>
                    <div className="w-full bg-red-950/50 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: getPercentage(financialData.operatingExpenses + financialData.cmv, financialData.netRevenue) }}
                        ></div>
                    </div>
                </div>

                <div className={`border border-white/10 rounded-xl p-6 ${financialData.netProfit >= 0 ? 'bg-blue-500/10 border-blue-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className={`text-sm font-medium mb-1 ${financialData.netProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                                Lucro Líquido
                            </p>
                            <h3 className="text-2xl font-bold text-white">{formatCurrency(financialData.netProfit)}</h3>
                        </div>
                        <div className={`p-2 rounded-lg ${financialData.netProfit >= 0 ? 'bg-blue-500/20' : 'bg-red-500/20'}`}>
                            <DollarSign className={`w-5 h-5 ${financialData.netProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`} />
                        </div>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${financialData.netProfit >= 0 ? 'bg-blue-950/50' : 'bg-red-950/50'}`}>
                        <div
                            className={`h-full rounded-full ${financialData.netProfit >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                            style={{ width: getPercentage(Math.abs(financialData.netProfit), financialData.netRevenue) }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10 bg-white/5">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-emerald-500" />
                        Detalhamento Financeiro
                    </h3>
                </div>
                <div className="p-0">
                    <div className="divide-y divide-white/10">
                        {/* 1. Receita Bruta */}
                        <div className="p-4 hover:bg-white/5 transition-colors">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-slate-300 font-medium">(+) Receita Bruta de Vendas</span>
                                <span className="text-emerald-400 font-bold">{formatCurrency(financialData.grossRevenue)}</span>
                            </div>
                            <div className="text-xs text-slate-500">Total de vendas realizadas no período</div>
                        </div>

                        {/* 2. Deduções */}
                        <div className="p-4 hover:bg-white/5 transition-colors bg-red-500/5">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-slate-300">(-) Deduções e Impostos</span>
                                <span className="text-red-400">{formatCurrency(financialData.deductions)}</span>
                            </div>
                        </div>

                        {/* 3. Receita Líquida */}
                        <div className="p-4 bg-slate-800/50 font-bold border-y border-white/10">
                            <div className="flex justify-between items-center">
                                <span className="text-white">(=) Receita Líquida</span>
                                <span className="text-white">{formatCurrency(financialData.netRevenue)}</span>
                            </div>
                        </div>

                        {/* 4. CMV */}
                        <div className="p-4 hover:bg-white/5 transition-colors bg-red-500/5">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-slate-300">(-) Custo da Mercadoria Vendida (CMV)</span>
                                <span className="text-red-400">{formatCurrency(financialData.cmv)}</span>
                            </div>
                            <div className="text-xs text-slate-500">Estimado em 40% sobre a receita bruta (Matéria-prima, Embalagem, Frete)</div>
                        </div>

                        {/* 5. Lucro Bruto */}
                        <div className="p-4 bg-slate-800/50 font-bold border-y border-white/10">
                            <div className="flex justify-between items-center">
                                <span className="text-white">(=) Lucro Bruto</span>
                                <span className="text-white">{formatCurrency(financialData.grossProfit)}</span>
                            </div>
                            <div className="text-right text-xs text-slate-400 mt-1">
                                Margem Bruta: {getPercentage(financialData.grossProfit, financialData.netRevenue)}
                            </div>
                        </div>

                        {/* 6. Despesas Operacionais */}
                        <div className="p-4 hover:bg-white/5 transition-colors bg-red-500/5">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-slate-300">(-) Despesas Operacionais</span>
                                <span className="text-red-400">{formatCurrency(financialData.operatingExpenses)}</span>
                            </div>
                            <div className="text-xs text-slate-500">Contas pagas, salários, manutenção, etc.</div>
                        </div>

                        {/* 7. Lucro Líquido */}
                        <div className="p-6 bg-emerald-900/20 font-bold text-lg border-t border-white/10">
                            <div className="flex justify-between items-center">
                                <span className="text-emerald-400">(=) Resultado Líquido do Exercício</span>
                                <span className={financialData.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                    {formatCurrency(financialData.netProfit)}
                                </span>
                            </div>
                            <div className="text-right text-sm text-slate-400 mt-1 font-normal">
                                Margem Líquida: {getPercentage(financialData.netProfit, financialData.netRevenue)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
