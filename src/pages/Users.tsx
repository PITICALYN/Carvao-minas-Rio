import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { type UserRole } from '../types';
import { Plus, Trash2, Shield, User as UserIcon } from 'lucide-react';

export const Users = () => {
    const { users, addUser, removeUser, currentUser } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('Factory');
    const [canPrint, setCanPrint] = useState(false);

    if (currentUser?.role !== 'Admin') {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-white mb-2">Acesso Negado</h2>
                <p className="text-slate-400">Apenas administradores podem gerenciar usuários.</p>
            </div>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addUser({
            id: crypto.randomUUID(),
            name,
            username,
            password,
            role,
            canPrint
        });
        setIsModalOpen(false);
        // Reset form
        setName('');
        setUsername('');
        setPassword('');
        setRole('Factory');
        setCanPrint(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Gestão de Usuários</h1>
                    <p className="text-slate-400">Gerencie o acesso da sua equipe</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Novo Usuário
                </button>
            </div>

            <div className="grid gap-4">
                {users.map((user) => (
                    <div key={user.id} className="glass-panel p-6 rounded-xl flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-slate-800 border border-white/5">
                                {user.role === 'Admin' ? (
                                    <Shield className="w-6 h-6 text-emerald-400" />
                                ) : (
                                    <UserIcon className="w-6 h-6 text-slate-400" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">{user.name}</h3>
                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                    <span className="bg-slate-800 px-2 py-0.5 rounded text-xs border border-white/5">
                                        @{user.username}
                                    </span>
                                    <span>•</span>
                                    <span>{user.role === 'Admin' ? 'Administrador' : user.role === 'Factory' ? 'Fábrica' : 'Itaguaí'}</span>
                                    {user.canPrint && (
                                        <>
                                            <span>•</span>
                                            <span className="text-emerald-400 text-xs">Imprime</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {user.username !== 'admin' && (
                            <button
                                onClick={() => removeUser(user.id)}
                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Remover usuário"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-6">Novo Usuário</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Nome Completo</label>
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                                    placeholder="Ex: João Silva"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Usuário (Login)</label>
                                <input
                                    required
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                                    placeholder="Ex: joao.silva"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Senha</label>
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                                    placeholder="******"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Função (Cargo)</label>
                                <select
                                    value={role}
                                    onChange={e => setRole(e.target.value as UserRole)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                                >
                                    <option value="Factory">Fábrica</option>
                                    <option value="Itaguai">Itaguaí</option>
                                    <option value="Admin">Administrador</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="canPrint"
                                    checked={canPrint}
                                    onChange={e => setCanPrint(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900"
                                />
                                <label htmlFor="canPrint" className="text-sm font-medium text-slate-400 select-none cursor-pointer">
                                    Permitir Impressão
                                </label>
                            </div>

                            <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                                >
                                    Criar Usuário
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
