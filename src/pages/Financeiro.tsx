import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, Search, TrendingUp, TrendingDown, DollarSign, Calendar, ArrowUpRight, ArrowDownLeft, Printer } from 'lucide-react';
import { type FinancialTransaction, type TransactionCategory } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Financeiro = () => {
    const { transactions, addTransaction } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'Income' | 'Expense'>('all');

    // Form State
    const [newTransaction, setNewTransaction] = useState<Partial<FinancialTransaction>>({
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        type: 'Expense',
        category: 'Operational',
        description: '',
        amount: 0,
        status: 'Pending',
        entityName: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTransaction.description || !newTransaction.amount) return;

        addTransaction({
            id: crypto.randomUUID(),
            date: newTransaction.date || new Date().toISOString(),
            dueDate: newTransaction.dueDate || new Date().toISOString(),
            type: newTransaction.type || 'Expense',
            category: newTransaction.category || 'Operational',
            description: newTransaction.description,
            amount: Number(newTransaction.amount),
            status: newTransaction.status || 'Pending',
            entityName: newTransaction.entityName || '',
            entityId: newTransaction.entityId
        } as FinancialTransaction);

        setIsModalOpen(false);
        setNewTransaction({
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date().toISOString().split('T')[0],
            type: 'Expense',
            category: 'Operational',
            description: '',
            amount: 0,
            status: 'Pending',
            entityName: ''
        });
    };

    const filteredTransactions = transactions.filter(t => filterType === 'all' || t.type === filterType);

    const totalIncome = transactions.filter(t => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = totalIncome - totalExpense;

    // Cash Flow Projection (Next 30 Days)
    const getProjectionData = () => {
        const today = new Date();
        const data = [];
        let currentBalance = balance;

        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            // Find transactions due on this date
            const dailyTransactions = transactions.filter(t =>
                t.status === 'Pending' && t.dueDate === dateStr
            );

            const dailyIncome = dailyTransactions
                .filter(t => t.type === 'Income')
                .reduce((acc, t) => acc + t.amount, 0);

            const dailyExpense = dailyTransactions
                .filter(t => t.type === 'Expense')
                .reduce((acc, t) => acc + t.amount, 0);

            currentBalance += (dailyIncome - dailyExpense);

            data.push({
                date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                balance: currentBalance
            });
        }
        return data;
    };

    const projectionData = getProjectionData();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Financeiro</h1>
                <div className="flex gap-3">
                    {(useAppStore.getState().currentUser?.role === 'Admin' || useAppStore.getState().currentUser?.canPrint) && (
                        <button
                            onClick={() => window.print()}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-white/10"
                        >
                            <Printer className="w-4 h-4" />
                            Imprimir
                        </button>
                    )}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg"
                    >
                        <Plus className="w-4 h-4" />
                        Nova Transação
                    </button>
                </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                        <ArrowDownLeft className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-400 font-medium">Receitas Totais</p>
                        <h3 className="text-2xl font-bold text-white">R$ {totalIncome.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-red-500/20 text-red-400">
                        <ArrowUpRight className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-400 font-medium">Despesas Totais</p>
                        <h3 className="text-2xl font-bold text-white">R$ {totalExpense.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-400 font-medium">Saldo Atual</p>
                        <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            R$ {balance.toLocaleString()}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Cash Flow Projection Chart */}
            <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Fluxo de Caixa Projetado (30 Dias)
                </h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={projectionData}>
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fill: '#94a3b8' }}
                                tickFormatter={(value) => `R$ ${value / 1000}k`}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                                formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Saldo Projetado']}
                            />
                            <Area
                                type="monotone"
                                dataKey="balance"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorBalance)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
            {/* Filters & List */}
            <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-white/5">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar transação..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${filterType === 'all' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setFilterType('Income')}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${filterType === 'Income' ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:text-green-400'}`}
                    >
                        Receitas
                    </button>
                    <button
                        onClick={() => setFilterType('Expense')}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${filterType === 'Expense' ? 'bg-red-500/20 text-red-400' : 'text-slate-400 hover:text-red-400'}`}
                    >
                        Despesas
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {filteredTransactions.map(transaction => (
                    <div key={transaction.id} className="glass-card p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${transaction.type === 'Income' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                {transaction.type === 'Income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{transaction.description}</h4>
                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(transaction.date).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>{transaction.category}</span>
                                    {transaction.entityName && (
                                        <>
                                            <span>•</span>
                                            <span>{transaction.entityName}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className={`font-bold text-lg ${transaction.type === 'Income' ? 'text-green-400' : 'text-red-400'}`}>
                                {transaction.type === 'Income' ? '+' : '-'} R$ {transaction.amount.toLocaleString()}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${transaction.status === 'Paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                transaction.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                    'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                {transaction.status === 'Paid' ? 'Pago/Recebido' : transaction.status === 'Pending' ? 'Pendente' : 'Atrasado'}
                            </span>
                        </div>
                    </div>
                ))}

                {filteredTransactions.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        Nenhuma transação encontrada.
                    </div>
                )}
            </div>

            {/* New Transaction Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">Nova Transação</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex gap-4 p-1 bg-slate-950 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setNewTransaction({ ...newTransaction, type: 'Income' })}
                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${newTransaction.type === 'Income' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Receita
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewTransaction({ ...newTransaction, type: 'Expense' })}
                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${newTransaction.type === 'Expense' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Despesa
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Descrição</label>
                                <input
                                    required
                                    type="text"
                                    value={newTransaction.description}
                                    onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                    className="w-full input-field px-4 py-2"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Valor (R$)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={newTransaction.amount}
                                        onChange={e => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
                                        className="w-full input-field px-4 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Categoria</label>
                                    <select
                                        value={newTransaction.category}
                                        onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value as TransactionCategory })}
                                        className="w-full input-field px-4 py-2"
                                    >
                                        <option value="Sales">Vendas</option>
                                        <option value="Raw Material">Matéria Prima</option>
                                        <option value="Operational">Operacional</option>
                                        <option value="Payroll">Folha de Pagamento</option>
                                        <option value="Taxes">Impostos</option>
                                        <option value="Other">Outros</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Data Competência</label>
                                    <input
                                        type="date"
                                        value={newTransaction.date}
                                        onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                        className="w-full input-field px-4 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Data Vencimento</label>
                                    <input
                                        type="date"
                                        value={newTransaction.dueDate}
                                        onChange={e => setNewTransaction({ ...newTransaction, dueDate: e.target.value })}
                                        className="w-full input-field px-4 py-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Entidade (Cliente/Fornecedor)</label>
                                <input
                                    type="text"
                                    placeholder="Opcional"
                                    value={newTransaction.entityName}
                                    onChange={e => setNewTransaction({ ...newTransaction, entityName: e.target.value })}
                                    className="w-full input-field px-4 py-2"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary px-6 py-2 rounded-lg"
                                >
                                    Salvar Transação
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
