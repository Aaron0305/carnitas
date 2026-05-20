'use client';

import { useState, useEffect } from 'react';
import { FiX, FiPrinter, FiCheck, FiSquare, FiCheckSquare, FiLoader } from 'react-icons/fi';
import { VentasService } from '@/service/ventas';
import { OrdenesService } from '@/service/ordenes';
import { ProductosService } from '@/service/productos';
import { supabase } from '@/service/supabase';
import type { PendingOrder } from '../types';

interface Props {
  isOpen: boolean;
  orders: PendingOrder[];
  onClose: () => void;
  onPrintComplete?: () => void;
  onOrdersCharged?: (ids: string[]) => void;
}

export default function QuickPrintModal({ isOpen, orders, onClose, onPrintComplete, onOrdersCharged }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [printProgress, setPrintProgress] = useState(0);
  const [totalToProcess, setTotalToProcess] = useState(0);

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

  const selectedOrders = orders.filter(o => selectedIds.includes(o.id));
  const totalAmount = selectedOrders.reduce((sum, order) => {
    const orderTotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
    return sum + orderTotal;
  }, 0);

  const generateTicketHtml = (order: PendingOrder): string => {
    const orderTotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
    const date = new Date(order.createdAt);
    const dateStr = date.toLocaleDateString('es-MX');
    const timeStr = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const docId = `PRE-${order.id.slice(0, 5).toUpperCase()}`;

    const itemsHtml = order.items.map(item => `
          <tr>
            <td>${item.qty}x</td>
            <td>${item.name}</td>
            <td style="text-align:right">$${(item.price * item.qty).toFixed(2)}</td>
          </tr>`).join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Ticket - ${order.label}</title>
  <style>
    @page { margin: 0; size: 80mm auto; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px; color: #000; background: #fff;
      width: 80mm; padding: 2mm 4mm;
    }
    .receipt-container { width: 100%; }
    .receipt-title { text-align: center; font-size: 16px; font-weight: bold; margin: 0 0 2px 0; }
    .receipt-subtitle { text-align: center; font-size: 11px; margin: 0 0 3px 0; }
    .receipt-divider { text-align: center; margin: 5px 0; letter-spacing: -1px; font-weight: bold; }
    .receipt-text { margin: 2px 0; font-size: 11px; }
    .receipt-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 4px; }
    .receipt-table th, .receipt-table td { padding: 2px 0; }
    .receipt-total { font-size: 14px; font-weight: bold; display: flex; justify-content: space-between; margin-top: 6px; }
    .receipt-footer { text-align: center; font-size: 10px; margin: 4px 0 0 0; font-weight: bold; }
  </style>
</head>
<body>
  <div class="receipt-container">
    <h2 class="receipt-title">CARNITAS POS</h2>
    <p class="receipt-subtitle">&quot;Los Amigos&quot;</p>
    <p class="receipt-subtitle">Sucursal Central</p>
    <div class="receipt-divider">================================</div>
    <p class="receipt-text"><b>Folio:</b> ${docId}</p>
    <p class="receipt-text"><b>Mesa:</b> ${order.label}</p>
    <p class="receipt-text"><b>Fecha:</b> ${dateStr} ${timeStr}</p>
    <p class="receipt-text"><b>Cliente:</b> ${order.client || 'Público General'}</p>
    <div class="receipt-divider">--------------------------------</div>
    <table class="receipt-table">
      <thead>
        <tr>
          <th style="text-align:left;width:15%">Cant</th>
          <th style="text-align:left;width:60%">Producto</th>
          <th style="text-align:right;width:25%">Importe</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    <div class="receipt-divider">--------------------------------</div>
    <div class="receipt-total">
      <b>TOTAL:</b>
      <b>$${orderTotal.toFixed(2)}</b>
    </div>
    <div class="receipt-divider">================================</div>
    <p class="receipt-footer">¡Gracias por su preferencia!</p>
    <p class="receipt-footer">Hecho con mucho amor</p>
  </div>
</body>
</html>`;
  };

  const printTicketInIframe = (order: PendingOrder): Promise<void> => {
    return new Promise((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.style.left = '-9999px';
      iframe.style.top = '-9999px';
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) {
        document.body.removeChild(iframe);
        resolve();
        return;
      }

      doc.open();
      doc.write(generateTicketHtml(order));
      doc.close();

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!iframe.contentWindow) {
            document.body.removeChild(iframe);
            resolve();
            return;
          }

          let resolved = false;
          const cleanup = () => {
            if (resolved) return;
            resolved = true;
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            resolve();
          };

          try {
            iframe.contentWindow.addEventListener('afterprint', cleanup, { once: true });
          } catch {
            // ignore
          }

          iframe.contentWindow.focus();
          iframe.contentWindow.print();

          setTimeout(cleanup, 5000);
        });
      });
    });
  };

  const handlePrint = async () => {
    if (selectedIds.length === 0) return;

    setIsProcessing(true);
    setProcessingMessage('Cobrando órdenes...');
    setPrintProgress(0);
    setTotalToProcess(selectedOrders.length);

    const chargedIds: string[] = [];
    const chargedOrders: PendingOrder[] = [];

    for (const order of selectedOrders) {
      setProcessingMessage(`Cobrando ${order.label}...`);
      const itemsStr = order.items.map(i => `${i.qty}x ${i.name}`).join(', ');
      const orderTotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);

      const success = await VentasService.create({
        total: orderTotal,
        method: 'Efectivo',
        items: itemsStr,
        client: order.client || 'Público General'
      });

      if (success) {
        chargedIds.push(order.id);
        chargedOrders.push(order);

        if (order.isDbOrder) {
          try {
            await OrdenesService.updateStatus(order.id, 'Entregado');
          } catch (err) {
            console.error('Error al actualizar estado:', err);
          }
        }

        try {
          for (const item of order.items) {
            if (typeof item.id === 'string' && !item.id.startsWith('def-')) {
              const { data: prod } = await supabase
                .from('products')
                .select('stock')
                .eq('id', item.id)
                .single();

              if (prod && parseFloat(prod.stock) !== -1) {
                const currentStock = parseFloat(prod.stock) || 0;
                const newStock = Math.max(0, currentStock - item.qty);
                const { status } = ProductosService.getStatusAndAccent(newStock);

                await supabase
                  .from('products')
                  .update({ stock: newStock, status })
                  .eq('id', item.id);
              }
            }
          }
        } catch (err) {
          console.error('Error al descontar stock:', err);
        }
      }
    }

    onOrdersCharged?.(chargedIds);

    setTotalToProcess(chargedOrders.length);

    if (chargedOrders.length > 0) {
      for (let i = 0; i < chargedOrders.length; i++) {
        setProcessingMessage(`Imprimiendo ticket ${i + 1} de ${chargedOrders.length}...`);
        setPrintProgress(i + 1);
        await printTicketInIframe(chargedOrders[i]);
      }
    }

    setIsProcessing(false);
    onPrintComplete?.();
    onClose();
  };

  return (
    <>
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
              disabled={isProcessing}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-30"
            >
              <FiX size={16} className="text-slate-400" />
            </button>
          </div>

          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <FiLoader size={32} className="text-[#FF6701] animate-spin" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{processingMessage}</p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF6701] to-[#FFA82F] rounded-full transition-all duration-500"
                  style={{
                    width: totalToProcess > 0
                      ? `${(printProgress / totalToProcess) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
          ) : (
            <>
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
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total a Cobrar</span>
                <span className="text-base font-black text-[#FF6701]">
                  ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 font-extrabold text-xs hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-pointer text-center disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePrint}
                  disabled={selectedIds.length === 0 || isProcessing}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FF6701] to-[#FFA82F] text-white font-extrabold text-xs shadow-lg hover:shadow-xl hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <><FiLoader size={14} className="animate-spin" /> Procesando...</>
                  ) : (
                    <><FiPrinter size={14} /> Cobrar e Imprimir ({selectedIds.length})</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
