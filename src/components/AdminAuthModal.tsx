import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Lock, AlertCircle } from 'lucide-react';

interface AdminAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    actionType: 'Edit' | 'Delete';
}

export const AdminAuthModal = ({ isOpen, onClose, onConfirm, actionType }: AdminAuthModalProps) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { users } = useAppStore();

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Find the admin user (assuming there's always an admin with role 'Admin')
        // In a real app, we might check against the specific admin user's password or a global admin password
        // Here we check if ANY user with role 'Admin' has this password
        const adminUser = users.find(u => u.role === 'Admin' && u.password === password);

        if (adminUser) {
            onConfirm();
            onClose();
            setPassword('');
            setError('');
        } else {
            setError('Senha de administrador incorreta.');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-red-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex flex-col items-center mb-6 text-center">
                    <div className="p-3 bg-red-500/10 rounded-full mb-4">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Autorização Necessária</h2>
                    <p className="text-slate-400 text-sm mt-2">
                        Esta ação de <span className="font-bold text-red-400">{actionType === 'Edit' ? 'Edição' : 'Exclusão'}</span> requer permissão de administrador.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Senha de Administrador</label>
                        <input
                            autoFocus
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            className="w-full input-field px-4 py-2 border-red-500/20 focus:border-red-500"
                            placeholder="Digite a senha..."
                        />
                        {error && (
                            <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            Confirmar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
