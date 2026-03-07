import { generateId } from "../utils/id";
import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { type UserRole, PERMISSIONS } from '../types';
import { Plus, Trash2, Edit, Shield, User as UserIcon, RefreshCw, X } from 'lucide-react';
import { AdminAuthModal } from '../components/AdminAuthModal';
import clsx from 'clsx';

export const Users = () => {
    const { users, addUser, updateUser, removeUser, currentUser } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Admin Auth State
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<'Edit' | 'Delete' | 'Reset' | null>(null);
    const [userToActOn, setUserToActOn] = useState<any | null>(null);

    // Permission Translations
    const permissionLabels: Record<string, string> = {
        VIEW_DASHBOARD: 'Ver Dashboard',
        VIEW_SALES: 'Ver Vendas',
        MANAGE_SALES: 'Gerenciar Vendas',
        VIEW_PRODUCTION: 'Ver Produção',
        MANAGE_PRODUCTION: 'Gerenciar Produção',
        VIEW_INVENTORY: 'Ver Estoque',
        MANAGE_INVENTORY: 'Gerenciar Estoque',
        VIEW_FINANCIAL: 'Ver Financeiro',
        MANAGE_FINANCIAL: 'Gerenciar Financeiro',
        VIEW_COMMERCIAL: 'Ver Comercial',
        MANAGE_COMMERCIAL: 'Gerenciar Comercial',
        MANAGE_PRICES: 'Gerenciar Preços',
        VIEW_USERS: 'Ver Usuários',
        MANAGE_USERS: 'Gerenciar Usuários',
        VIEW_REPORTS: 'Ver Relatórios',
        MANAGE_SETTINGS: 'Gerenciar Configurações',
        VIEW_AUDIT: 'Ver Auditoria'
    };

    // Form State
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('Factory');
    const [canPrint, setCanPrint] = useState(false);
    const [permissions, setPermissions] = useState<string[]>([]);

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

        if (currentUserId) {
            // Update existing user
            // Find existing user to keep password if not changed (though here we require password in form, 
            // maybe we should make it optional for edit? For now let's assume admin resets it or re-enters it.
            // Actually, the form requires password. Let's keep it simple: Admin sets password.
            updateUser({
                id: currentUserId,
                name,
                username,
                password, // In a real app, handle password update separately or optionally
                role,
                canPrint,
                permissions
            });
        } else {
            // Create new user
            addUser({
                id: generateId(),
                name,
                username,
                password,
                role,
                canPrint,
                permissions
            });
        }

        setIsModalOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setCurrentUserId(null);
        setName('');
        setUsername('');
        setPassword('');
        setRole('Factory');
        setCanPrint(false);
        setPermissions([]);
    };

    const handleEdit = (user: any) => {
        setCurrentUserId(user.id);
        setName(user.name);
        setUsername(user.username);
        setPassword(user.password || ''); // Populate if available, or empty
        setRole(user.role);
        setCanPrint(user.canPrint || false);
        setPermissions(user.permissions || []);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const requestAction = (action: 'Edit' | 'Delete' | 'Reset', user: any) => {
        setUserToActOn(user);
        setPendingAction(action);
        setAuthModalOpen(true);
    };

    const confirmAction = () => {
        if (!userToActOn || !pendingAction) return;

        if (pendingAction === 'Edit') {
            handleEdit(userToActOn);
        } else if (pendingAction === 'Delete') {
            removeUser(userToActOn.id);
        } else if (pendingAction === 'Reset') {
            useAppStore.getState().updateUserPassword(userToActOn.id, '123');
            alert('Senha resetada com sucesso!');
        }

        setAuthModalOpen(false);
        setPendingAction(null);
        setUserToActOn(null);
    };

    return (
        <div className="space-y-6">
            <AdminAuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                onConfirm={confirmAction}
                actionType={pendingAction === 'Delete' ? 'Delete' : 'Edit'}
            />
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Gestão de Usuários</h1>
                    <p className="text-slate-400">Gerencie o acesso da sua equipe</p>
                </div>
                <button
                    onClick={handleNew}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
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
                                    <Shield className="w-6 h-6 text-blue-400" />
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
                                            <span className="text-blue-400 text-xs">Imprime</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {user.username !== 'admin' && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => requestAction('Edit', user)}
                                    className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                    title="Editar Usuário"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => requestAction('Reset', user)}
                                    className="p-2 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                                    title="Resetar Senha para '123'"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => requestAction('Delete', user)}
                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Remover usuário"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">{currentUserId ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Nome Completo</label>
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
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
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
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
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                    placeholder="******"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Função (Cargo)</label>
                                <select
                                    value={role}
                                    onChange={e => setRole(e.target.value as UserRole)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="Factory">Fábrica (Operacional)</option>
                                    <option value="Itaguai">Itaguaí (Operacional)</option>
                                    <option value="Production">Supervisor de Produção</option>
                                    <option value="Seller">Vendedor</option>
                                    <option value="Financial">Financeiro</option>
                                    <option value="Director">Diretor</option>
                                    <option value="Admin">Administrador do Sistema</option>
                                </select>
                                {role === 'Director' && (
                                    <p className={clsx(
                                        "text-[10px] mt-1",
                                        users.filter(u => u.role === 'Director').length >= 5 ? "text-amber-400" : "text-slate-500"
                                    )}>
                                        Limite sugerido: 5 Diretores (Atual: {users.filter(u => u.role === 'Director').length})
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                                <div>
                                    <p className="text-sm font-medium text-white">Permissões Padrão</p>
                                    <p className="text-[10px] text-slate-400">Aplicar conjunto de permissões para {role}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const defaultPerms: string[] = ['view_dashboard'];
                                        if (role === 'Admin' || role === 'Director') {
                                            defaultPerms.push(...Object.values(PERMISSIONS));
                                        } else if (role === 'Production' || role === 'Factory' || role === 'Itaguai') {
                                            defaultPerms.push(PERMISSIONS.VIEW_PRODUCTION, PERMISSIONS.MANAGE_PRODUCTION, PERMISSIONS.VIEW_INVENTORY);
                                        } else if (role === 'Seller') {
                                            defaultPerms.push(PERMISSIONS.VIEW_SALES, PERMISSIONS.MANAGE_SALES, PERMISSIONS.VIEW_COMMERCIAL);
                                        } else if (role === 'Financial') {
                                            defaultPerms.push(PERMISSIONS.VIEW_FINANCIAL, PERMISSIONS.MANAGE_FINANCIAL, PERMISSIONS.VIEW_REPORTS, PERMISSIONS.VIEW_COMMERCIAL, PERMISSIONS.MANAGE_PRICES);
                                        }
                                        setPermissions([...new Set(defaultPerms)]);
                                    }}
                                    className="text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-2 py-1 rounded transition-colors border border-blue-500/20"
                                >
                                    Aplicar
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="canPrint"
                                    checked={canPrint}
                                    onChange={e => setCanPrint(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                                />
                                <label htmlFor="canPrint" className="text-sm font-medium text-slate-400 select-none cursor-pointer">
                                    Permitir Impressão
                                </label>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <label className="block text-sm font-medium text-slate-400 mb-3">Permissões de Acesso</label>
                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                                    {Object.entries(PERMISSIONS).map(([key, value]) => (
                                        <div key={key} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={`perm-${value}`}
                                                checked={permissions.includes(value)}
                                                onChange={e => {
                                                    if (e.target.checked) {
                                                        setPermissions([...permissions, value]);
                                                    } else {
                                                        setPermissions(permissions.filter(p => p !== value));
                                                    }
                                                }}
                                                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                                            />
                                            <label htmlFor={`perm-${value}`} className="text-xs text-slate-300 select-none cursor-pointer">
                                                {permissionLabels[key] || key.replace('VIEW_', 'Ver ').replace('MANAGE_', 'Gerenciar ').replace('_', ' ')}
                                            </label>
                                        </div>
                                    ))}
                                </div>
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
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                                >
                                    {currentUserId ? 'Salvar Alterações' : 'Criar Usuário'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
