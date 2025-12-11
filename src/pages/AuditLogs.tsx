import { useAppStore } from '../store/useAppStore';
import { Shield, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { type AuditAction } from '../types';

export const AuditLogs = () => {
    const { auditLogs, currentUser } = useAppStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState<AuditAction | 'All'>('All');

    if (currentUser?.role !== 'Admin') {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-white mb-2">Acesso Negado</h2>
                <p className="text-slate-400">Apenas administradores podem ver os logs de auditoria.</p>
            </div>
        );
    }

    const filteredLogs = auditLogs.filter(log => {
        const matchesSearch =
            log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAction = filterAction === 'All' || log.action === filterAction;
        return matchesSearch && matchesAction;
    });

    const getActionColor = (action: AuditAction) => {
        switch (action) {
            case 'Login': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'Create': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'Update': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'Delete': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Auditoria e Segurança</h1>
                    <p className="text-slate-400">Histórico de ações no sistema</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por usuário ou detalhes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value as AuditAction | 'All')}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                        <option value="All">Todas Ações</option>
                        <option value="Login">Login</option>
                        <option value="Create">Criação</option>
                        <option value="Update">Edição</option>
                        <option value="Delete">Exclusão</option>
                    </select>
                </div>
            </div>

            {/* Logs List */}
            <div className="space-y-2">
                {filteredLogs.map((log) => (
                    <div key={log.id} className="glass-panel p-4 rounded-lg flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg border ${getActionColor(log.action)}`}>
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-white">{log.userName}</span>
                                    <span className="text-xs text-slate-500">•</span>
                                    <span className="text-sm text-slate-300">{log.details}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-white/5 text-slate-400">
                                        {log.resource}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className={`text-xs font-medium px-2 py-1 rounded border ${getActionColor(log.action)}`}>
                            {log.action}
                        </div>
                    </div>
                ))}

                {filteredLogs.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        Nenhum registro encontrado.
                    </div>
                )}
            </div>
        </div>
    );
};
