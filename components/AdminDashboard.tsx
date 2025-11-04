import React, { useState, useEffect, useMemo, useCallback } from 'react';
// FIX: Import SalesStatistics type to resolve compilation error.
import type { Order, OrderStatus, CartItem, SalesStatistics } from '../types';
import { apiService } from '../services/apiService';
import { CloseIcon } from './icons';

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case '待店長確認': return 'bg-orange-100 text-orange-800 border-orange-300';
        case '待處理': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case '製作中': return 'bg-blue-100 text-blue-800 border-blue-300';
        case '可以取餐': return 'bg-purple-100 text-purple-800 border-purple-300';
        case '已完成': return 'bg-green-100 text-green-800 border-green-300';
        default: return 'bg-red-100 text-red-800 border-red-300';
    }
};

const ORDER_STATUSES: OrderStatus[] = ['待店長確認', '待處理', '製作中', '可以取餐', '已完成'];

const OrderDetailModal: React.FC<{ order: Order; onClose: () => void }> = ({ order, onClose }) => {
  const renderOrderItem = (item: CartItem, index: number) => (
    <div key={item.cartId || index} className="py-2 border-b border-slate-200 last:border-b-0">
      <p className="font-semibold text-slate-800">{item.item.name.replace(/半全餐|半套餐/g, '套餐')} (${item.item.price}) <span className="font-normal">x{item.quantity}</span></p>
      <div className="text-xs text-slate-500 pl-2 mt-1 space-y-0.5">
        {item.selectedDonenesses && Object.keys(item.selectedDonenesses).length > 0 && <p>熟度: {Object.entries(item.selectedDonenesses).map(([d, q]) => `${d}x${q}`).join(', ')}</p>}
        {item.selectedMultiChoice && Object.keys(item.selectedMultiChoice).length > 0 && <p>口味: {Object.entries(item.selectedMultiChoice).map(([d, q]) => `${d}x${q}`).join(', ')}</p>}
        {item.selectedDrinks && Object.keys(item.selectedDrinks).length > 0 && <p>飲料: {Object.entries(item.selectedDrinks).map(([d, q]) => `${d}x${q}`).join(', ')}</p>}
        {item.selectedSauces && item.selectedSauces.length > 0 && <p>醬料: {item.selectedSauces.map(s => `${s.name}x${s.quantity}`).join(', ')}</p>}
        {item.selectedDesserts && item.selectedDesserts.length > 0 && <p>甜品: {item.selectedDesserts.map(d => `${d.name}x${d.quantity}`).join(', ')}</p>}
        {item.selectedSingleChoiceAddon && <p>單點加購: {item.selectedSingleChoiceAddon}</p>}
        {item.selectedAddons && item.selectedAddons.length > 0 && <p>其他加購: {item.selectedAddons.map(a => `${a.name} ($${a.price}) x${a.quantity}`).join(', ')}</p>}
        {item.selectedNotes && <p>備註: {item.selectedNotes}</p>}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <header className="p-5 relative border-b">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"><CloseIcon /></button>
                <h2 className="text-2xl font-bold text-slate-800">訂單內容</h2>
            </header>
            <main className="px-6 py-4 space-y-4 overflow-y-auto bg-slate-50">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-600">訂單編號:</span><span className="font-mono font-bold text-slate-800">{order.id}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">顧客:</span><span className="font-semibold">{order.customerInfo.name} ({order.customerInfo.phone})</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">類型:</span><span className="font-semibold">{order.orderType}{order.orderType === '內用' && order.customerInfo.tableNumber ? ` (${order.customerInfo.tableNumber}桌)`: ''}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">狀態:</span><span className={`px-2 py-0.5 font-semibold leading-tight rounded-full text-xs ${getStatusColor(order.status)}`}>{order.status}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">時間:</span><span className="font-semibold">{new Date(order.createdAt).toLocaleString()}</span></div>
                </div>
                <div className="border-t border-slate-300 pt-3 mt-3">
                    <h4 className="text-base font-bold text-slate-700 mb-2">餐點內容</h4>
                    <div className="bg-white p-3 rounded-md border">
                        {order.items.map(renderOrderItem)}
                    </div>
                </div>
            </main>
            <footer className="p-5 border-t bg-white flex justify-between items-center">
                <p className="text-lg font-bold">總金額:</p>
                <p className="text-xl font-bold text-green-700">${order.totalPrice}</p>
            </footer>
        </div>
    </div>
  );
};


const OrderManagementView: React.FC<{ orders: Order[], onUpdateStatus: (id: string, status: OrderStatus) => void, onPrint: (order: Order) => void, onViewOrder: (order: Order) => void }> = ({ orders, onUpdateStatus, onPrint, onViewOrder }) => {
    const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
    
    const statusCounts = useMemo(() => {
        const counts = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {} as Record<OrderStatus, number>);

        const allStatuses: Record<OrderStatus | 'all', number> = {
            all: orders.length,
            '待店長確認': counts['待店長確認'] || 0,
            '待處理': counts['待處理'] || 0,
            '製作中': counts['製作中'] || 0,
            '可以取餐': counts['可以取餐'] || 0,
            '已完成': counts['已完成'] || 0,
            '錯誤': counts['錯誤'] || 0,
        };
        return allStatuses;

    }, [orders]);

    const filteredOrders = useMemo(() => {
        if (filter === 'all') return orders;
        return orders.filter(o => o.status === filter);
    }, [orders, filter]);

    return (
        <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
                <button 
                    onClick={() => setFilter('all')} 
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                >
                    <span>全部</span>
                    <span className={`flex items-center justify-center text-xs font-bold rounded-full w-6 h-6 ${filter === 'all' ? 'bg-white text-green-700' : 'bg-slate-400 text-white'}`}>
                        {statusCounts.all}
                    </span>
                </button>
                {ORDER_STATUSES.map(status => (
                    <button 
                        key={status} 
                        onClick={() => setFilter(status)} 
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${filter === status ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                    >
                        <span>{status}</span>
                         <span className={`flex items-center justify-center text-xs font-bold rounded-full w-6 h-6 ${filter === status ? 'bg-white text-green-700' : 'bg-slate-400 text-white'}`}>
                            {statusCounts[status] || 0}
                        </span>
                    </button>
                ))}
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-4 py-3">訂單號</th>
                                <th scope="col" className="px-4 py-3">顧客</th>
                                <th scope="col" className="px-4 py-3">金額</th>
                                <th scope="col" className="px-4 py-3">狀態</th>
                                <th scope="col" className="px-4 py-3">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-4 py-4 font-mono font-semibold text-slate-900">
                                        <button onClick={() => onViewOrder(order)} className="text-blue-600 hover:underline focus:outline-none">
                                            {order.id}
                                        </button>
                                    </td>
                                    <td className="px-4 py-4">{order.customerInfo.name} ({order.customerInfo.phone})</td>
                                    <td className="px-4 py-4">${order.totalPrice}</td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${getStatusColor(order.status)}`}>{order.status}</span>
                                    </td>
                                    <td className="px-4 py-4 flex flex-wrap gap-2">
                                        <select value={order.status} onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)} className="p-1 border rounded-md text-xs bg-white focus:ring-green-500 focus:border-green-500">
                                            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <button onClick={() => onPrint(order)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600">列印</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const SalesStatisticsView: React.FC = () => {
    const [stats, setStats] = useState<SalesStatistics | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 29)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const result = await apiService.getSalesStatistics(dateRange.startDate, dateRange.endDate);
        if (result.success && result.stats) {
            setStats(result.stats);
        } else {
            setError(result.message || '無法載入統計資料');
        }
        setIsLoading(false);
    }, [dateRange]);
    
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const maxTrendRevenue = useMemo(() => stats ? Math.max(...stats.salesTrend.map(t => t.revenue), 0) : 0, [stats]);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                <input type="date" value={dateRange.startDate} onChange={e => setDateRange(p => ({...p, startDate: e.target.value}))} className="p-2 border rounded-md" />
                <span className="text-slate-600">到</span>
                <input type="date" value={dateRange.endDate} onChange={e => setDateRange(p => ({...p, endDate: e.target.value}))} className="p-2 border rounded-md" />
                <button onClick={fetchStats} disabled={isLoading} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-slate-400">
                    {isLoading ? '載入中...' : '查詢'}
                </button>
            </div>

            {error && <p className="text-red-500 font-semibold">{error}</p>}
            
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* KPIs */}
                    <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-slate-500 text-sm font-medium">總營業額</h3><p className="text-3xl font-bold text-slate-800">${stats.totalRevenue.toLocaleString()}</p></div>
                    <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-slate-500 text-sm font-medium">總訂單數</h3><p className="text-3xl font-bold text-slate-800">{stats.orderCount}</p></div>
                    <div className="bg-white p-6 rounded-lg shadow-md col-span-1 md:col-span-2">
                        <h3 className="font-semibold text-slate-800 mb-3">熱門商品排行</h3>
                        <ul className="space-y-2 text-sm">
                            {stats.popularItems.slice(0, 5).map(item => (
                                <li key={item.name} className="flex justify-between items-center"><span className="font-medium text-slate-700">{item.name}</span><span className="font-semibold text-green-700">{item.quantity} 份 / ${item.revenue.toLocaleString()}</span></li>
                            ))}
                        </ul>
                    </div>

                    {/* Sales Trend Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-md col-span-1 lg:col-span-4">
                        <h3 className="font-semibold text-slate-800 mb-4">銷售趨勢</h3>
                        {maxTrendRevenue > 0 ? (
                        <div className="flex items-end h-64 gap-2 border-b border-l border-slate-200 p-2">
                           {stats.salesTrend.map(day => (
                               <div key={day.date} className="flex-1 flex flex-col items-center justify-end group" title={`${day.date}: $${day.revenue}`}>
                                   <div className="text-xs font-bold text-green-700 opacity-0 group-hover:opacity-100 transition-opacity">${day.revenue}</div>
                                   <div style={{ height: `${(day.revenue / maxTrendRevenue) * 100}%` }} className="w-full bg-green-500 hover:bg-green-600 rounded-t-sm transition-all"></div>
                                   <div className="text-xxs text-slate-500 mt-1 transform -rotate-45">{day.date.substring(5)}</div>
                               </div>
                           ))}
                        </div>
                        ) : <p className="text-slate-500 text-center py-10">此區間無銷售資料</p>}
                    </div>
                </div>
            )}
        </div>
    );
};


interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
    const [view, setView] = useState<'orders' | 'stats'>('orders');
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);
    const [printOrder, setPrintOrder] = useState<Order | null>(null);
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const result = await apiService.getAllOrders();
        if (result.success && result.orders) {
            setOrders(result.orders);
        } else {
            setError(result.message || '無法載入訂單');
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, fetchData]);
    
    useEffect(() => {
        if (printOrder) {
            const handleAfterPrint = () => {
                setPrintOrder(null);
            };

            window.addEventListener('afterprint', handleAfterPrint);
            
            const timer = setTimeout(() => {
                window.print();
            }, 100);

            return () => {
                clearTimeout(timer);
                window.removeEventListener('afterprint', handleAfterPrint);
            };
        }
    }, [printOrder]);

    const handleUpdateStatus = async (id: string, status: OrderStatus) => {
        const originalOrders = [...orders];
        setOrders(prev => prev.map(o => o.id === id ? {...o, status} : o));
        const result = await apiService.updateOrderStatus(id, status);
        if (!result.success) {
            alert(result.message || '更新失敗');
            setOrders(originalOrders);
        }
    };
    
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-slate-800 bg-opacity-75 z-50">
                <div className="bg-slate-100 w-full h-full flex flex-col">
                    <header className="bg-white shadow-md flex-shrink-0">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">管理後台</h2>
                            <div className="flex items-center gap-4">
                                <div className="flex bg-slate-200 rounded-lg p-1">
                                    <button onClick={() => setView('orders')} className={`px-4 py-1.5 text-sm font-semibold rounded-md ${view === 'orders' ? 'bg-white shadow' : ''}`}>訂單管理</button>
                                    <button onClick={() => setView('stats')} className={`px-4 py-1.5 text-sm font-semibold rounded-md ${view === 'stats' ? 'bg-white shadow' : ''}`}>銷售統計</button>
                                </div>
                                <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><CloseIcon /></button>
                            </div>
                        </div>
                    </header>
                    <main className="flex-grow overflow-y-auto">
                        {isLoading && <div className="p-8 text-center">載入中...</div>}
                        {error && <div className="p-8 text-center text-red-500">{error}</div>}
                        {!isLoading && !error && view === 'orders' && <OrderManagementView orders={orders} onUpdateStatus={handleUpdateStatus} onPrint={setPrintOrder} onViewOrder={setViewingOrder} />}
                        {!isLoading && !error && view === 'stats' && <SalesStatisticsView />}
                    </main>
                </div>
            </div>
            <div className="print-area">
                {printOrder && (
                    <div className="p-4 bg-white">
                        <h3 className="text-lg font-bold text-center mb-2">訂單明細</h3>
                        <p><strong>訂單號:</strong> {printOrder.id}</p>
                        <p><strong>顧客:</strong> {printOrder.customerInfo.name}</p>
                        <p><strong>類型:</strong> {printOrder.orderType} {printOrder.customerInfo.tableNumber && `(${printOrder.customerInfo.tableNumber}桌)`}</p>
                        <hr className="my-2" />
                        <ul className="text-sm">
                            {printOrder.items.map(item => (
                                <li key={item.cartId} className="mb-2">
                                    <p className="font-semibold">{item.item.name} (${item.item.price}) x{item.quantity}</p>
                                    <div className="text-xs text-slate-500 pl-2 mt-1 space-y-0.5">
                                        {item.selectedDonenesses && Object.keys(item.selectedDonenesses).length > 0 && <p>熟度: {Object.entries(item.selectedDonenesses).map(([d, q]) => `${d}x${q}`).join(', ')}</p>}
                                        {item.selectedMultiChoice && Object.keys(item.selectedMultiChoice).length > 0 && <p>口味: {Object.entries(item.selectedMultiChoice).map(([d, q]) => `${d}x${q}`).join(', ')}</p>}
                                        {item.selectedDrinks && Object.keys(item.selectedDrinks).length > 0 && <p>飲料: {Object.entries(item.selectedDrinks).map(([d, q]) => `${d}x${q}`).join(', ')}</p>}
                                        {item.selectedSauces && item.selectedSauces.length > 0 && <p>醬料: {item.selectedSauces.map(s => `${s.name}x${s.quantity}`).join(', ')}</p>}
                                        {item.selectedDesserts && item.selectedDesserts.length > 0 && <p>甜品: {item.selectedDesserts.map(d => `${d.name}x${d.quantity}`).join(', ')}</p>}
                                        {item.selectedSingleChoiceAddon && <p>單點加購: {item.selectedSingleChoiceAddon}</p>}
                                        {item.selectedAddons && item.selectedAddons.length > 0 && <p>其他加購: {item.selectedAddons.map(a => `${a.name} ($${a.price}) x${a.quantity}`).join(', ')}</p>}
                                        {item.selectedNotes && <p>備註: {item.selectedNotes}</p>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <hr className="my-2" />
                        <p className="text-right font-bold text-lg">總計: ${printOrder.totalPrice}</p>
                    </div>
                )}
            </div>
            {viewingOrder && <OrderDetailModal order={viewingOrder} onClose={() => setViewingOrder(null)} />}
        </>
    );
};