'use client';

import { useState, useEffect } from 'react';
import { FiX, FiPrinter, FiCheck, FiSquare, FiCheckSquare } from 'react-icons/fi';
import type { PendingOrder } from '../types';

interface Props {
  isOpen: boolean;
  orders: PendingOrder[];
  onClose: () => void;
}

export default function QuickPrintModal({ isOpen, orders, onClose }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Auto-select all orders when modal opens
  useEffect(() => {
    if (isOpen && orders.length > 0) {
      setSelectedIds(orders.map(o => o.id));
    }
  }, [isOpen, orders]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map(o => o.id));
    }
  };

  const handlePrint = () => {
    if (selectedIds.length === 0) return;
    window.print();
  };

  const selectedOrders = orders.filter(o => selectedIds.includes(o.id));
  const totalAmount = selectedOrders.reduce((sum, order) => {
    const orderTotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
    return sum + orderTotal;
  }, 0);

  return (
    <>
      {/* ── Desktop UI Dialog ── */}
      <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#FF6701]/10 text-[#FF6701]">
                <FiPrinter size={18} />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Impresión Rápida</h3>
                <p className="text-[10px] text-slate-400">Selecciona las mesas para imprimir</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <FiX size={16} className="text-slate-400" />
            </button>
          </div>

          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl text-xs">
            <button
              onClick={toggleSelectAll}
              className="font-bold text-[#FF6701] flex items-center gap-1.5 cursor-pointer"
            >
              {selectedIds.length === orders.length ? (
                <FiCheckSquare size={14} />
              ) : (
                <FiSquare size={14} />
              )}
              {selectedIds.length === orders.length ? 'Desmarcar Todos' : 'Seleccionar Todos'}
            </button>
            <span className="text-slate-400 font-medium">
              {selectedIds.length} de {orders.length} seleccionados
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {orders.map(order => {
              const orderTotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
              const itemCount = order.items.reduce((s, i) => s + i.qty, 0);
              const isSelected = selectedIds.includes(order.id);

              return (
                <div
                  key={order.id}
                  onClick={() => toggleSelect(order.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#FF6701] bg-[#FF6701]/5'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isSelected ? 'text-[#FF6701]' : 'text-slate-300 dark:text-slate-600'}>
                      {isSelected ? <FiCheckSquare size={15} /> : <FiSquare size={15} />}
                    </span>
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-white">{order.label}</p>
                      <p className="text-[10px] text-slate-400">
                        {itemCount} artículos {order.client ? ` · ${order.client}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-[#FF6701]">
                    ${orderTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total a Imprimir</span>
            <span className="text-base font-black text-[#FF6701]">
              ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 font-extrabold text-xs hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              onClick={handlePrint}
              disabled={selectedIds.length === 0}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FF6701] to-[#FFA82F] text-white font-extrabold text-xs shadow-lg hover:shadow-xl hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              🖨️ Imprimir ({selectedIds.length})
            </button>
          </div>
        </div>
      </div>

      {/* ── Thermal Receipt Multi-Page Print Layout (Hidden on Screen) ── */}
      <div id="thermal-receipt-multi" className="hidden">
        {selectedOrders.map((order, idx) => (
          <div
            key={order.id}
            className="receipt-container receipt-page"
            style={{ marginBottom: idx < selectedOrders.length - 1 ? '40px' : '0' }}
          >
            <h2 className="receipt-title">CARNITAS POS</h2>
            <p className="receipt-subtitle">&quot;Los Amigos&quot;</p>
            <p className="receipt-subtitle">Sucursal Central</p>
            <div className="receipt-divider">================================</div>
            <p className="receipt-text"><b>Folio:</b> PRE-{order.id.slice(0, 5).toUpperCase()}</p>
            <p className="receipt-text"><b>Mesa:</b> {order.label}</p>
            <p className="receipt-text">
              <b>Fecha:</b> {new Date(order.createdAt).toLocaleDateString('es-MX')} {new Date(order.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="receipt-text"><b>Cliente:</b> {order.client || 'Público General'}</p>
            <div className="receipt-divider">--------------------------------</div>
            <table className="receipt-table">
              <thead>
                <tr>
                  <th className="text-left" style={{ width: '15%' }}>Cant</th>
                  <th className="text-left" style={{ width: '60%' }}>Producto</th>
                  <th className="text-right" style={{ width: '25%' }}>Importe</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.id}>
                    <td>{item.qty}x</td>
                    <td>{item.name}</td>
                    <td className="text-right">${(item.price * item.qty).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="receipt-divider">--------------------------------</div>
            <div className="receipt-total" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <b>TOTAL:</b>
              <b>${order.items.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)}</b>
            </div>
            <div className="receipt-divider">================================</div>
            <p className="receipt-footer">¡Gracias por su preferencia!</p>
            <p className="receipt-footer">Hecho con mucho amor</p>
          </div>
        ))}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden !important; background: none !important; box-shadow: none !important; }
          #thermal-receipt-multi, #thermal-receipt-multi * { visibility: visible !important; }
          #thermal-receipt-multi { 
            display: block !important; 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 80mm !important; 
            padding: 2mm 4mm !important; 
            font-family: 'Courier New', Courier, monospace !important; 
            font-size: 12px !important; 
            color: #000 !important; 
            background: #fff !important; 
          }
          .receipt-container { width: 100% !important; }
          .receipt-title { text-align: center !important; font-size: 16px !important; font-weight: bold !important; margin: 0 0 2px 0 !important; }
          .receipt-subtitle { text-align: center !important; font-size: 11px !important; margin: 0 0 3px 0 !important; }
          .receipt-divider { text-align: center !important; margin: 5px 0 !important; letter-spacing: -1px !important; font-weight: bold !important; }
          .receipt-text { margin: 2px 0 !important; font-size: 11px !important; line-height: 1.2 !important; }
          .receipt-table { width: 100% !important; border-collapse: collapse !important; font-size: 11px !important; margin-top: 4px !important; }
          .receipt-table th, .receipt-table td { padding: 2px 0 !important; line-height: 1.2 !important; }
          .receipt-total { font-size: 14px !important; font-weight: bold !important; }
          .receipt-footer { text-align: center !important; font-size: 10px !important; margin: 4px 0 0 0 !important; font-weight: bold !important; }
          
          .receipt-page {
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>
    </>
  );
}
