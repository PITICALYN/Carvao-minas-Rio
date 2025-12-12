import React from 'react';
import { type AuditLog } from '../types';
import { User, ShoppingCart, Factory, Clock, Trash2, Edit, Plus } from 'lucide-react';

interface TimelineProps {
    logs: AuditLog[];
}

export const Timeline: React.FC<TimelineProps> = ({ logs }) => {
    const getIcon = (action: string, resource: string) => {
        if (action === 'Delete') return Trash2;
        if (action === 'Update') return Edit;
        if (action === 'Create') return Plus;
        if (resource === 'User') return User;
        if (resource === 'Sale') return ShoppingCart;
        if (resource === 'Stock') return Factory;
        return Clock;
    };

    const getColor = (action: string) => {
        if (action === 'Delete') return 'bg-red-500/20 text-red-400 border-red-500/20';
        if (action === 'Update') return 'bg-amber-500/20 text-amber-400 border-amber-500/20';
        if (action === 'Create') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20';
        return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
    };

    return (
        <div className="relative border-l border-white/10 ml-3 space-y-8">
            {logs.map((log) => {
                const Icon = getIcon(log.action, log.resource);
                const colorClass = getColor(log.action);
                const date = new Date(log.timestamp);

                return (
                    <div key={log.id} className="relative pl-8 group">
                        {/* Dot */}
                        <div className={`absolute -left-[21px] p-1 rounded-full border-4 border-slate-900 ${colorClass.replace('bg-', 'bg-').replace('/20', '')}`}>
                            <div className="w-2 h-2 rounded-full bg-white flex items-center justify-center">
                                {/* Optional: Tiny icon inside dot? No, too small. */}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="glass-panel p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg ${colorClass}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colorClass}`}>
                                        {log.action} {log.resource}
                                    </span>
                                    {log.entityId && (
                                        <span className="text-xs font-mono text-slate-500 bg-slate-900 px-1 rounded">
                                            #{log.entityId.slice(0, 8)}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {date.toLocaleTimeString()} - {date.toLocaleDateString()}
                                </span>
                            </div>

                            <p className="text-white text-sm mb-2">{log.details}</p>

                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <User className="w-3 h-3" />
                                <span>{log.userName}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
