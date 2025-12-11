
import { useAppStore } from '../store/useAppStore';
import { type UserRole } from '../types';
import { Factory, Building2, ShieldCheck } from 'lucide-react';

export const Login = () => {
    const { login } = useAppStore();

    const handleLogin = (role: UserRole) => {
        login(role);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-12 flex flex-col items-center">
                    <img src="/logo.jpg" alt="Minas Rio" className="h-32 w-auto mb-4 rounded-xl shadow-lg shadow-blue-500/20" />
                    <p className="text-slate-400">Gestão Inteligente</p>
                </div>

                <div className="glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl bg-slate-900/50">
                    <h2 className="text-xl font-semibold text-white mb-6 text-center">Selecione seu acesso</h2>

                    <div className="space-y-4">
                        <button
                            onClick={() => handleLogin('Admin')}
                            className="w-full p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group flex items-center gap-4"
                        >
                            <div className="p-3 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
                                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-white">Administrador</p>
                                <p className="text-xs text-slate-400">Acesso total ao sistema</p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleLogin('Factory')}
                            className="w-full p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group flex items-center gap-4"
                        >
                            <div className="p-3 rounded-lg bg-amber-500/20 group-hover:bg-amber-500/30 transition-colors">
                                <Factory className="w-6 h-6 text-amber-400" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-white">Fábrica</p>
                                <p className="text-xs text-slate-400">Gestão de produção e estoque</p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleLogin('Itaguai')}
                            className="w-full p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group flex items-center gap-4"
                        >
                            <div className="p-3 rounded-lg bg-teal-500/20 group-hover:bg-teal-500/30 transition-colors">
                                <Building2 className="w-6 h-6 text-teal-400" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-white">Itaguaí</p>
                                <p className="text-xs text-slate-400">Gestão de vendas e estoque</p>
                            </div>
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-slate-500">
                            Sistema seguro e monitorado.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
