import React, { useState, useEffect } from 'react';
import type { OrderData, CartItem } from '../types';
import { CloseIcon, CheckIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  lastSuccessfulOrder: OrderData | null;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, orderId, lastSuccessfulOrder }) => {
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (isPrinting) {
        const handleAfterPrint = () => {
            setIsPrinting(false);
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
  }, [isPrinting]);

  if (!isOpen) return null;

  const handleLineShare = () => {
    if (!orderId) return;
    const text = `您好，我已送出訂單，訂單編號為【${orderId}】，請您盡快確認，謝謝！`;
    const url = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const renderOrderItemSummary = (item: CartItem, index: number) => (
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

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
          <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <CheckIcon className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">訂單請求已送出</h2>
              <p className="text-slate-600 mt-2">您的訂單編號為：</p>
              <p className="font-mono text-2xl font-bold text-slate-800 my-2 bg-slate-100 py-2 rounded-md">{orderId}</p>
              
              <div className="text-sm bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg p-3 mt-4">
                  <p><strong>重要提示：</strong></p>
                  <p className="mt-1">此訂單需由店家回覆確認後才算正式成立。請點擊下方按鈕，透過 LINE 分享您的訂單編號以完成訂購程序。</p>
              </div>
          </div>
          <footer className="px-6 pb-6 space-y-2">
              <button 
                  onClick={handleLineShare} 
                  className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 font-bold text-lg"
              >
                  LINE 分享提醒
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={() => setIsPrinting(true)} 
                    disabled={!lastSuccessfulOrder}
                    className="w-full bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50"
                >
                    列印訂單摘要
                </button>
                <button 
                    onClick={onClose} 
                    className="w-full bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 transition-colors"
                >
                    關閉
                </button>
              </div>
          </footer>
        </div>
      </div>
      <div className="print-area">
          {isPrinting && lastSuccessfulOrder && (
              <div className="p-4 bg-white">
                  <h3 className="text-lg font-bold text-center mb-2">訂單摘要</h3>
                  <p><strong>訂單號:</strong> {orderId}</p>
                  <p><strong>顧客:</strong> {lastSuccessfulOrder.customerInfo.name} ({lastSuccessfulOrder.customerInfo.phone})</p>
                   <p><strong>類型:</strong> {lastSuccessfulOrder.orderType} {lastSuccessfulOrder.customerInfo.tableNumber && `(${lastSuccessfulOrder.customerInfo.tableNumber}桌)`}</p>
                  <hr className="my-2" />
                  <ul className="text-sm">
                      {lastSuccessfulOrder.items.map(renderOrderItemSummary)}
                  </ul>
                  <hr className="my-2" />
                  <p className="text-right font-bold text-lg">總計: ${lastSuccessfulOrder.totalPrice}</p>
              </div>
          )}
      </div>
    </>
  );
};

export default ConfirmationModal;