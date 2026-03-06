import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Lock, AlertCircle, X } from 'lucide-react';
import clsx from 'clsx';

interface AdminAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    actionType: 'Edit' | 'Delete' | 'Backup' | 'Restore';
}

export const AdminAuthModal = ({ isOpen, onClose, onConfirm, actionType }: AdminAuthModalProps) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { users } = useAppStore();

    if (!isOpen) return null;

    const getActionLabel = () => {
        switch (actionType) {
            case 'Edit': return 'Edição';
            case 'Delete': return 'Exclusão';
            case 'Backup': return 'Exportação de Backup';
            case 'Restore': return 'Restauração de Dados';
            default: return actionType;
        }
    };

    const getWarningMessage = () => {
        if (actionType === 'Restore') {
            return "ALERTA CRÍTICO: Esta ação substituirá TODOS os dados atuais do sistema pela versão do backup. Esta operação é irreversível.";
        }
        if (actionType === 'Backup') {
            return "Confirme sua identidade para gerar e baixar o arquivo de backup completo.";
        }
        return `Esta ação de ${getActionLabel()} requer permissão de administrador ou diretoria.`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Check if user is Admin or Director and password matches
        const authorizedUser = users.find(u =>
            (u.role === 'Admin' || u.role === 'Director') &&
            u.password === password
        );

        if (authorizedUser) {
            onConfirm();
            onClose();
            setPassword('');
            setError('');
        } else {
            setError('Senha incorreta ou usuário sem permissão.');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl shadow-2xl relative w-full max-w-sm">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                        <Lock className="w-5 h-5 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Autorização Necessária</h2>
                </div>
                <p className={clsx(
                    "text-sm mt-2 font-medium",
                    actionType === 'Restore' ? "text-red-400" : "text-slate-400"
                )}>
                    {getWarningMessage()}
                </p>

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
