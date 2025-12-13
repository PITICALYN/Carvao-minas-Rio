import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, Search, Truck, Calendar, Package } from 'lucide-react';
import { type Driver, type Shipment } from '../types';

export const Expedicao = () => {
    const { drivers, addDriver, shipments, addShipment, sales } = useAppStore();
    const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
    const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'shipments' | 'drivers'>('shipments');

    // Driver Form State
    const [newDriver, setNewDriver] = useState<Partial<Driver>>({
        name: '',
        licensePlate: '',
        vehicleModel: ''
    });

    // Shipment Form State
    const [newShipment, setNewShipment] = useState<Partial<Shipment>>({
        date: new Date().toISOString().split('T')[0],
        driverId: '',
        salesIds: [],
        status: 'Planned'
    });

    const handleDriverSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDriver.name || !newDriver.licensePlate) return;

        addDriver({
            id: crypto.randomUUID(),
            name: newDriver.name,
            licensePlate: newDriver.licensePlate,
            vehicleModel: newDriver.vehicleModel || ''
        } as Driver);

        setIsDriverModalOpen(false);
        setNewDriver({ name: '', licensePlate: '', vehicleModel: '' });
    };

    const handleShipmentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newShipment.driverId || !newShipment.salesIds?.length) return;

        addShipment({
            id: crypto.randomUUID(),
            date: newShipment.date || new Date().toISOString(),
            driverId: newShipment.driverId,
            salesIds: newShipment.salesIds,
            status: newShipment.status || 'Planned'
        } as Shipment);

        setIsShipmentModalOpen(false);
        setNewShipment({ date: new Date().toISOString().split('T')[0], driverId: '', salesIds: [], status: 'Planned' });
    };

    const getDriverName = (id: string) => drivers.find(d => d.id === id)?.name || 'Desconhecido';

    // Filter available sales (not yet shipped) - simplified logic for now
    // In a real app, we would check if saleId is already in another shipment
    const availableSales = sales;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Expedição</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('shipments')}
                        className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'shipments' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
                    >
                        Cargas
                    </button>
                    <button
                        onClick={() => setActiveTab('drivers')}
                        className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'drivers' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
                    >
                        Motoristas
                    </button>
                </div>
            </div>

            {activeTab === 'shipments' && (
                <>
                    <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-white/5">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar carga..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <button
                            onClick={() => setIsShipmentModalOpen(true)}
                            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg"
                        >
                            <Plus className="w-4 h-4" />
                            Nova Carga
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {shipments.map(shipment => (
                            <div key={shipment.id} className="glass-card p-5 rounded-xl space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-white text-lg">Carga #{shipment.id.slice(0, 8)}</h3>
                                        <p className="text-sm text-slate-400 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {new Date(shipment.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${shipment.status === 'Delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        shipment.status === 'InTransit' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                        }`}>
                                        {shipment.status === 'Delivered' ? 'Entregue' : shipment.status === 'InTransit' ? 'Em Trânsito' : 'Planejado'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-slate-950/30 rounded-lg">
                                    <div className="p-2 bg-slate-800 rounded-lg">
                                        <Truck className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{getDriverName(shipment.driverId)}</p>
                                        <p className="text-xs text-slate-500">Motorista</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Pedidos</p>
                                    {shipment.salesIds.map(saleId => (
                                        <div key={saleId} className="flex items-center gap-2 text-sm text-slate-300">
                                            <Package className="w-4 h-4 text-slate-500" />
                                            <span>Pedido #{saleId.slice(0, 8)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-white/5 flex gap-2">
                                    {shipment.status === 'Planned' && (
                                        <button
                                            onClick={() => useAppStore.getState().updateShipmentStatus(shipment.id, 'InTransit')}
                                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Iniciar Entrega
                                        </button>
                                    )}
                                    {shipment.status === 'InTransit' && (
                                        <button
                                            onClick={() => useAppStore.getState().updateShipmentStatus(shipment.id, 'Delivered')}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Concluir Entrega
                                        </button>
                                    )}
                                    {shipment.status === 'Delivered' && (
                                        <div className="flex-1 text-center py-2 text-emerald-400 text-sm font-medium bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                            Entrega Finalizada
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {shipments.length === 0 && (
                            <div className="col-span-full text-center py-12 text-slate-500">
                                Nenhuma carga planejada.
                            </div>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'drivers' && (
                <>
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={() => setIsDriverModalOpen(true)}
                            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg"
                        >
                            <Plus className="w-4 h-4" />
                            Novo Motorista
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {drivers.map(driver => (
                            <div key={driver.id} className="glass-card p-5 rounded-xl flex items-center gap-4">
                                <div className="p-3 bg-slate-800 rounded-full">
                                    <Truck className="w-6 h-6 text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{driver.name}</h3>
                                    <p className="text-sm text-slate-400">{driver.vehicleModel} • {driver.licensePlate}</p>
                                </div>
                            </div>
                        ))}

                        {drivers.length === 0 && (
                            <div className="col-span-full text-center py-12 text-slate-500">
                                Nenhum motorista cadastrado.
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Add Driver Modal */}
            {isDriverModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">Novo Motorista</h2>
                        <form onSubmit={handleDriverSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Nome</label>
                                <input
                                    required
                                    type="text"
                                    value={newDriver.name}
                                    onChange={e => setNewDriver({ ...newDriver, name: e.target.value })}
                                    className="w-full input-field px-4 py-2"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Placa</label>
                                    <input
                                        required
                                        type="text"
                                        value={newDriver.licensePlate}
                                        onChange={e => setNewDriver({ ...newDriver, licensePlate: e.target.value })}
                                        className="w-full input-field px-4 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Modelo Veículo</label>
                                    <input
                                        type="text"
                                        value={newDriver.vehicleModel}
                                        onChange={e => setNewDriver({ ...newDriver, vehicleModel: e.target.value })}
                                        className="w-full input-field px-4 py-2"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsDriverModalOpen(false)}
                                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary px-6 py-2 rounded-lg"
                                >
                                    Salvar Motorista
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Shipment Modal */}
            {isShipmentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">Nova Carga</h2>
                        <form onSubmit={handleShipmentSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Data</label>
                                <input
                                    type="date"
                                    value={newShipment.date}
                                    onChange={e => setNewShipment({ ...newShipment, date: e.target.value })}
                                    className="w-full input-field px-4 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Motorista</label>
                                <select
                                    required
                                    value={newShipment.driverId}
                                    onChange={e => setNewShipment({ ...newShipment, driverId: e.target.value })}
                                    className="w-full input-field px-4 py-2"
                                >
                                    <option value="">Selecione...</option>
                                    {drivers.map(d => (
                                        <option key={d.id} value={d.id}>{d.name} ({d.licensePlate})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Pedidos para Embarque</label>
                                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                                    {availableSales.map(sale => (
                                        <label key={sale.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newShipment.salesIds?.includes(sale.id)}
                                                onChange={e => {
                                                    const currentIds = newShipment.salesIds || [];
                                                    if (e.target.checked) {
                                                        setNewShipment({ ...newShipment, salesIds: [...currentIds, sale.id] });
                                                    } else {
                                                        setNewShipment({ ...newShipment, salesIds: currentIds.filter(id => id !== sale.id) });
                                                    }
                                                }}
                                                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div className="text-sm">
                                                <p className="text-white font-medium">Pedido #{sale.id.slice(0, 8)}</p>
                                                <p className="text-slate-500">{new Date(sale.date).toLocaleDateString()} • {sale.location}</p>
                                            </div>
                                        </label>
                                    ))}
                                    {availableSales.length === 0 && (
                                        <p className="text-slate-500 text-sm text-center">Nenhum pedido disponível.</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsShipmentModalOpen(false)}
                                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary px-6 py-2 rounded-lg"
                                >
                                    Salvar Carga
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
