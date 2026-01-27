import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, Search, Truck, Calendar, Package, ArrowRight, Printer, CheckCircle } from 'lucide-react';
import { type Driver, type Shipment, type ProductType, type Location } from '../types';

export const Expedicao = () => {
    const { drivers, addDriver, shipments, addShipment, updateShipmentStatus, receiveShipment, sales } = useAppStore();
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
    const [shipmentType, setShipmentType] = useState<'Sale' | 'Transfer'>('Sale');
    const [newShipment, setNewShipment] = useState<Partial<Shipment>>({
        date: new Date().toISOString().split('T')[0],
        driverId: '',
        salesIds: [],
        status: 'Planned',
        sourceLocation: 'Factory',
        destinationLocation: 'Itaguai',
        items: []
    });

    // Transfer Items State
    const [transferItem, setTransferItem] = useState<{ type: ProductType; qty: string }>({ type: '3kg', qty: '' });

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
        if (!newShipment.driverId) return;

        if (shipmentType === 'Sale' && (!newShipment.salesIds || newShipment.salesIds.length === 0)) {
            alert('Selecione ao menos um pedido para a carga.');
            return;
        }

        if (shipmentType === 'Transfer' && (!newShipment.items || newShipment.items.length === 0)) {
            alert('Adicione ao menos um item para transferência.');
            return;
        }

        try {
            addShipment({
                id: crypto.randomUUID(),
                type: shipmentType,
                date: newShipment.date || new Date().toISOString(),
                driverId: newShipment.driverId,
                salesIds: shipmentType === 'Sale' ? newShipment.salesIds || [] : [],
                sourceLocation: shipmentType === 'Transfer' ? newShipment.sourceLocation : undefined,
                destinationLocation: shipmentType === 'Transfer' ? newShipment.destinationLocation : undefined,
                items: shipmentType === 'Transfer' ? newShipment.items : undefined,
                status: newShipment.status || 'Planned'
            } as Shipment);

            setIsShipmentModalOpen(false);
            // Reset form
            setNewShipment({
                date: new Date().toISOString().split('T')[0],
                driverId: '',
                salesIds: [],
                status: 'Planned',
                sourceLocation: 'Factory',
                destinationLocation: 'Itaguai',
                items: []
            });
            setShipmentType('Sale');
        } catch (error: any) {
            alert(error.message);
        }
    };

    const addTransferItem = () => {
        if (!transferItem.qty || Number(transferItem.qty) <= 0) return;
        const currentItems = newShipment.items || [];
        setNewShipment({
            ...newShipment,
            items: [...currentItems, { productType: transferItem.type, quantity: Number(transferItem.qty) }]
        });
        setTransferItem({ ...transferItem, qty: '' });
    };

    const removeTransferItem = (index: number) => {
        const currentItems = newShipment.items || [];
        setNewShipment({
            ...newShipment,
            items: currentItems.filter((_, i) => i !== index)
        });
    };

    const handleReceiveShipment = (id: string) => {
        if (confirm('Confirma o recebimento desta carga? O estoque será atualizado.')) {
            try {
                receiveShipment(id);
                alert('Carga recebida com sucesso!');
            } catch (error: any) {
                alert(error.message);
            }
        }
    };

    const getDriverName = (id: string) => drivers.find(d => d.id === id)?.name || 'Desconhecido';

    // Filter available sales
    const availableSales = sales.filter(s => {
        // Check if sale is already in a shipment (simplified check)
        const isShipped = shipments.some(ship => ship.salesIds?.includes(s.id));
        return !isShipped;
    });

    const printShipment = (shipment: Shipment) => {
        const driver = drivers.find(d => d.id === shipment.driverId);
        const content = `
            <html>
                <head>
                    <title>Guia de Transporte #${shipment.id.slice(0, 8)}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { border-bottom: 2px solid #000; padding-bottom: 10px; }
                        .info { margin-bottom: 20px; }
                        .info p { margin: 5px 0; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .footer { margin-top: 50px; text-align: center; }
                        .signature { border-top: 1px solid #000; width: 200px; margin: 0 auto; padding-top: 5px; }
                    </style>
                </head>
                <body>
                    <h1>Guia de Transporte</h1>
                    <div class="info">
                        <p><strong>ID Carga:</strong> #${shipment.id}</p>
                        <p><strong>Data:</strong> ${new Date(shipment.date).toLocaleDateString()}</p>
                        <p><strong>Tipo:</strong> ${shipment.type === 'Transfer' ? 'Transferência entre Unidades' : 'Entrega ao Cliente'}</p>
                        <p><strong>Motorista:</strong> ${driver?.name || 'N/A'}</p>
                        <p><strong>Veículo:</strong> ${driver?.vehicleModel || ''} - ${driver?.licensePlate || ''}</p>
                        ${shipment.type === 'Transfer' ? `
                            <p><strong>Origem:</strong> ${shipment.sourceLocation}</p>
                            <p><strong>Destino:</strong> ${shipment.destinationLocation}</p>
                        ` : ''}
                    </div>

                    <h3>Itens Transportados</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Item / Pedido</th>
                                <th>Quantidade / Detalhes</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${shipment.type === 'Sale' ?
                shipment.salesIds.map(id => {
                    const sale = sales.find(s => s.id === id);
                    return `<tr><td>Pedido #${id.slice(0, 8)}</td><td>${sale?.customerName || 'Consumidor Final'} - R$ ${sale?.totalAmount.toLocaleString()}</td></tr>`;
                }).join('')
                :
                shipment.items?.map(item => `<tr><td>${item.productType}</td><td>${item.quantity} un</td></tr>`).join('')
            }
                        </tbody>
                    </table>

                    <div class="footer">
                        <br><br><br>
                        <div class="signature">Assinatura do Responsável</div>
                    </div>
                </body>
            </html>
        `;

        const printWindow = window.open('', '', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write(content);
            printWindow.document.close();
            printWindow.print();
        }
    };

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
                            <div key={shipment.id} className="glass-card p-5 rounded-xl space-y-4 relative group">
                                <button
                                    onClick={() => printShipment(shipment)}
                                    className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                    title="Imprimir Guia"
                                >
                                    <Printer className="w-4 h-4" />
                                </button>

                                <div className="flex justify-between items-start pr-12">
                                    <div>
                                        <h3 className="font-bold text-white text-lg">Carga #{shipment.id.slice(0, 8)}</h3>
                                        <p className="text-sm text-slate-400 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {new Date(shipment.date).toLocaleDateString()}
                                        </p>
                                        <span className={`mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${shipment.type === 'Transfer' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                            {shipment.type === 'Transfer' ? 'Transferência' : 'Venda'}
                                        </span>
                                    </div>
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

                                {shipment.type === 'Transfer' && (
                                    <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-900/50 p-2 rounded border border-white/5">
                                        <span className="font-bold text-slate-400">{shipment.sourceLocation}</span>
                                        <ArrowRight className="w-4 h-4 text-slate-500" />
                                        <span className="font-bold text-white">{shipment.destinationLocation}</span>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Conteúdo</p>
                                    {shipment.type === 'Sale' ? (
                                        shipment.salesIds.map(saleId => (
                                            <div key={saleId} className="flex items-center gap-2 text-sm text-slate-300">
                                                <Package className="w-4 h-4 text-slate-500" />
                                                <span>Pedido #{saleId.slice(0, 8)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        shipment.items?.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-sm text-slate-300">
                                                <span>{item.productType}</span>
                                                <span className="font-bold text-white">{item.quantity} un</span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${shipment.status === 'Delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            shipment.status === 'InTransit' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                            }`}>
                                            {shipment.status === 'Delivered' ? 'Entregue' : shipment.status === 'InTransit' ? 'Em Trânsito' : 'Planejado'}
                                        </span>
                                    </div>

                                    {shipment.status === 'Planned' && (
                                        <button
                                            onClick={() => updateShipmentStatus(shipment.id, 'InTransit')}
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Iniciar Transporte
                                        </button>
                                    )}

                                    {shipment.status === 'InTransit' && (
                                        shipment.type === 'Transfer' ? (
                                            <button
                                                onClick={() => handleReceiveShipment(shipment.id)}
                                                className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Receber Carga
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => updateShipmentStatus(shipment.id, 'Delivered')}
                                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Confirmar Entrega
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
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
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <h2 className="text-xl font-bold text-white mb-4">Nova Carga</h2>
                        <form onSubmit={handleShipmentSubmit} className="space-y-4">

                            {/* Type Selector */}
                            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setShipmentType('Sale')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${shipmentType === 'Sale' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Venda (Cliente)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShipmentType('Transfer')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${shipmentType === 'Transfer' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Transferência (Interna)
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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
                            </div>

                            {shipmentType === 'Transfer' && (
                                <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs text-slate-400 mb-1">Origem</label>
                                            <select
                                                value={newShipment.sourceLocation}
                                                onChange={e => setNewShipment({ ...newShipment, sourceLocation: e.target.value as Location })}
                                                className="w-full input-field px-3 py-2 text-sm"
                                            >
                                                <option value="Factory">Fábrica</option>
                                                <option value="Itaguai">Itaguaí</option>
                                            </select>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-500 mt-5" />
                                        <div className="flex-1">
                                            <label className="block text-xs text-slate-400 mb-1">Destino</label>
                                            <select
                                                value={newShipment.destinationLocation}
                                                onChange={e => setNewShipment({ ...newShipment, destinationLocation: e.target.value as Location })}
                                                className="w-full input-field px-3 py-2 text-sm"
                                            >
                                                <option value="Itaguai">Itaguaí</option>
                                                <option value="Factory">Fábrica</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Adicionar Itens</label>
                                        <div className="flex gap-2 mb-2">
                                            <select
                                                value={transferItem.type}
                                                onChange={e => setTransferItem({ ...transferItem, type: e.target.value as ProductType })}
                                                className="flex-1 input-field px-3 py-2 text-sm"
                                            >
                                                <option value="3kg">3kg</option>
                                                <option value="5kg">5kg</option>
                                                <option value="Paulistao">Paulistão</option>
                                                <option value="Bulk">Granel</option>
                                            </select>
                                            <input
                                                type="number"
                                                placeholder="Qtd"
                                                value={transferItem.qty}
                                                onChange={e => setTransferItem({ ...transferItem, qty: e.target.value })}
                                                className="w-24 input-field px-3 py-2 text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={addTransferItem}
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 rounded-lg"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            {newShipment.items?.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-slate-800 p-2 rounded text-sm">
                                                    <span className="text-white">{item.productType}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-emerald-400">{item.quantity}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTransferItem(idx)}
                                                            className="text-red-400 hover:text-red-300"
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!newShipment.items || newShipment.items.length === 0) && (
                                                <p className="text-xs text-slate-500 text-center py-2">Nenhum item adicionado.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {shipmentType === 'Sale' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Pedidos Disponíveis</label>
                                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2 custom-scrollbar">
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
                            )}

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
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
