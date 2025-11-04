import React from 'react';
import type { Order, CartItem, OrderData } from '../types';

type PrintableOrderProps = {
    order: Order | OrderData | null;
    orderId?: string | null;
};

const renderOrderItem = (item: CartItem) => (
    <li key={item.cartId} className="mb-2 text-left">
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
);


export const PrintableOrder: React.FC<PrintableOrderProps> = ({ order, orderId }) => {
    if (!order) {
        return null; // Safety check to prevent crashing if order data is missing.
    }
    
    const finalOrderId = 'id' in order ? order.id : orderId;
    
    return (
        <div className="p-4 bg-white">
            <h3 className="text-lg font-bold text-center mb-2">訂單摘要</h3>
            {finalOrderId && <p><strong>訂單號:</strong> {finalOrderId}</p>}
            <p><strong>顧客:</strong> {order.customerInfo.name} ({order.customerInfo.phone})</p>
            <p><strong>類型:</strong> {order.orderType} {order.customerInfo.tableNumber && `(${order.customerInfo.tableNumber}桌)`}</p>
            <hr className="my-2" />
            <ul className="text-sm">
                {order.items.map(renderOrderItem)}
            </ul>
            <hr className="my-2" />
            <p className="text-right font-bold text-lg">總計: ${order.totalPrice}</p>
        </div>
    );
};
