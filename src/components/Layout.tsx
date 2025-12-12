import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Truck, Factory, Package, ShoppingCart, LogOut, User, Users, ShoppingBag, DollarSign, PieChart, Shield, Lock } from 'lucide-react';
import clsx from 'clsx';
import { useAppStore } from '../store/useAppStore';

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group',
                isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
        >
            <Icon className={clsx('w-5 h-5 transition-transform group-hover:scale-110', isActive && 'animate-pulse')} />
            <span className="font-medium">{label}</span>
        </Link>
    );
};

export const Layout = () => {
    const { currentUser, logout } = useAppStore();

    const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false);
    const [currentPassword, setCurrentPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        // In a real app, we would verify currentPassword here
        if (currentUser) {
            useAppStore.getState().updateUserPassword(currentUser.id, newPassword);
            alert('Senha alterada com sucesso!');
            setIsChangePasswordOpen(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 glass-panel border-r border-white/5 flex flex-col z-20">
                <div className="p-8 flex flex-col items-center">
                    <img src="/logo.jpg" alt="Minas Rio" className="h-24 w-auto mb-2 rounded-lg" />
                    <p className="text-xs text-slate-400">Gestão Inteligente</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />

                    {/* Commercial & Sales - Admin & Itaguai */}
                    {(currentUser?.role === 'Admin' || currentUser?.role === 'Itaguai') && (
                        <>
                            <NavItem to="/comercial" icon={Users} label="Comercial" />
                            <NavItem to="/vendas" icon={ShoppingCart} label="Vendas" />
                        </>
                    )}

                    {/* Purchasing - Admin Only (for now) */}
                    {currentUser?.role === 'Admin' && (
                        <NavItem to="/compras" icon={ShoppingBag} label="Compras" />
                    )}

                    {/* Inventory & Shipping - Everyone (Filtered by location in page) */}
                    <NavItem to="/estoque" icon={Package} label="Estoque" />
                    <NavItem to="/expedicao" icon={Truck} label="Expedição" />

                    {/* Production - Admin & Factory */}
                    {(currentUser?.role === 'Admin' || currentUser?.role === 'Factory') && (
                        <NavItem to="/production" icon={Factory} label="Produção" />
                    )}

                    {/* Financial & Controllership - Admin Only */}
                    {currentUser?.role === 'Admin' && (
                        <>
                            <NavItem to="/financeiro" icon={DollarSign} label="Financeiro" />
                            <NavItem to="/controladoria" icon={PieChart} label="Controladoria" />
                        </>
                    )}

                    {currentUser?.role === 'Admin' && (
                        <div className="pt-4 mt-4 border-t border-white/10">
                            <NavItem to="/usuarios" icon={User} label="Usuários" />
                            <NavItem to="/auditoria" icon={Shield} label="Auditoria" />
                        </div>
                    )}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="p-2 bg-emerald-500/20 rounded-full">
                            <User className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">{currentUser?.name}</p>
                            <p className="text-xs text-slate-400">{currentUser?.role === 'Admin' ? 'Administrador' : currentUser?.role === 'Factory' ? 'Fábrica' : 'Itaguaí'}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsChangePasswordOpen(true)}
                        className="flex items-center gap-3 px-4 py-2 w-full text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 group mb-2 text-sm"
                    >
                        <Lock className="w-4 h-4" />
                        <span>Alterar Senha</span>
                    </button>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 group"
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>

            {/* Change Password Modal */}
            {isChangePasswordOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-6">Alterar Senha</h2>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Nova Senha</label>
                                <input
                                    required
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                                    placeholder="******"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Confirmar Nova Senha</label>
                                <input
                                    required
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                                    placeholder="******"
                                />
                            </div>
                            <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsChangePasswordOpen(false)}
                                    className="flex-1 px-4 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
