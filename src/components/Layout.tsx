import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Truck, Factory, Package, ShoppingCart, LogOut, User, Users, ShoppingBag, DollarSign, PieChart, Shield, Lock, Settings, Bell, X, Check, FileText, Menu } from 'lucide-react';
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
    const location = useLocation();

    const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false);
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    // Close mobile menu when route changes
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

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
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    // Notifications Logic
    const { notifications, checkNotifications, markNotificationAsRead, clearNotifications } = useAppStore();
    const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    React.useEffect(() => {
        checkNotifications();
        // Optional: Interval to check periodically
        const interval = setInterval(checkNotifications, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [checkNotifications]);

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'warning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'error': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'success': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        }
    };

    // Helper to check permissions with fallback for legacy Admin users
    const hasPermission = (permission: string) => {
        if (!currentUser) return false;
        // If user has permissions array, use it
        if (currentUser.permissions && currentUser.permissions.length > 0) {
            return currentUser.permissions.includes(permission);
        }
        // Fallback: If no permissions array but role is Admin, allow everything
        if (currentUser.role === 'Admin') return true;

        return false;
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-950">
            {/* Mobile Menu Button */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 bg-slate-800 text-white rounded-lg border border-white/10 shadow-lg"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={clsx(
                "fixed md:static inset-y-0 left-0 w-64 glass-panel border-r border-white/5 flex flex-col z-40 transition-transform duration-300 ease-in-out transform",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                <div className="p-8 flex flex-col items-center">
                    <img src="/logo.jpg" alt="Minas Rio" className="h-24 w-auto mb-2 rounded-lg" />
                    <p className="text-xs text-slate-400">Gestão Inteligente</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {hasPermission('view_dashboard') && (
                        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                    )}

                    {/* Commercial & Sales */}
                    {(hasPermission('view_sales') || hasPermission('manage_sales')) && (
                        <>
                            <NavItem to="/comercial" icon={Users} label="Comercial" />
                            <NavItem to="/vendas" icon={ShoppingCart} label="Vendas" />
                        </>
                    )}

                    {/* Purchasing */}
                    {hasPermission('manage_inventory') && ( // Assuming purchasing falls under inventory/admin for now or add specific perm
                        <>
                            <NavItem to="/compras" icon={ShoppingBag} label="Compras" />
                            <NavItem to="/suppliers" icon={User} label="Fornecedores" />
                        </>
                    )}

                    {/* Inventory & Shipping */}
                    {hasPermission('view_inventory') && (
                        <>
                            <NavItem to="/estoque" icon={Package} label="Estoque" />
                            <NavItem to="/expedicao" icon={Truck} label="Expedição" />
                        </>
                    )}

                    {/* Production */}
                    {hasPermission('view_production') && (
                        <NavItem to="/production" icon={Factory} label="Produção" />
                    )}

                    {/* Financial */}
                    {hasPermission('view_financial') && (
                        <>
                            <NavItem to="/financeiro" icon={DollarSign} label="Financeiro" />
                            <NavItem to="/dre" icon={FileText} label="DRE Gerencial" />
                            <NavItem to="/controladoria" icon={PieChart} label="Controladoria" />
                        </>
                    )}

                    <div className="pt-4 mt-4 border-t border-white/10">
                        {hasPermission('view_users') && (
                            <NavItem to="/usuarios" icon={User} label="Usuários" />
                        )}
                        {hasPermission('view_audit') && (
                            <NavItem to="/auditoria" icon={Shield} label="Auditoria" />
                        )}
                        {hasPermission('manage_settings') && (
                            <NavItem to="/configuracoes" icon={Settings} label="Configurações" />
                        )}
                    </div>
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
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="flex items-center gap-3 px-4 py-2 w-full text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 group mb-2 text-sm relative"
                    >
                        <div className="relative">
                            <Bell className="w-4 h-4" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                        </div>
                        <div className="flex-1 text-left flex justify-between items-center">
                            <span>Notificações</span>
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                    </button>

                    {/* Notification Dropdown (Sidebar Popover style) */}
                    {isNotificationsOpen && (
                        <div className="absolute left-64 bottom-4 w-80 glass-panel border border-white/10 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden ml-2 max-h-[400px]">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
                                <h3 className="font-bold text-white">Notificações</h3>
                                <div className="flex gap-2">
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={clearNotifications}
                                            className="text-xs text-slate-400 hover:text-white transition-colors"
                                        >
                                            Limpar
                                        </button>
                                    )}
                                    <button onClick={() => setIsNotificationsOpen(false)}>
                                        <X className="w-4 h-4 text-slate-400 hover:text-white" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                                {notifications.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500 text-sm">
                                        Nenhuma notificação nova.
                                    </div>
                                ) : (
                                    notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            className={`p-3 rounded-lg border transition-colors relative group ${notification.read ? 'bg-slate-900/30 border-white/5 opacity-60' : 'bg-slate-800/50 border-white/10'}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${getNotificationColor(notification.type)}`}>
                                                    {notification.title}
                                                </span>
                                                <span className="text-[10px] text-slate-500">
                                                    {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-300 mb-2">{notification.message}</p>

                                            {!notification.read && (
                                                <button
                                                    onClick={() => markNotificationAsRead(notification.id)}
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                                                    title="Marcar como lida"
                                                >
                                                    <Check className="w-3 h-3 text-emerald-400" />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

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
            <main className="flex-1 p-4 md:p-8 overflow-y-auto pt-16 md:pt-8">
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
