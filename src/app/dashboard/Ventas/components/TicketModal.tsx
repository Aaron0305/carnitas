'use client';

import { FiCheckCircle } from 'react-icons/fi';
import type { LastSale } from '../types';

interface Props {
  lastSale: LastSale | null;
  onClose: () => void;
}

export default function TicketModal({ lastSale, onClose }: Props) {
  if (!lastSale) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-6 flex flex-col items-center">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <FiCheckCircle size={28} className="animate-pulse" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">¡Venta Registrada!</h3>
            <p className="text-[11px] text-slate-400">El ticket ha sido generado.</p>
          </div>
          <div className="w-full bg-white text-slate-800 p-5 rounded-2xl shadow-inner border-t-4 border-[#FF6701] font-mono text-[11px] space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(circle_at_bottom,_transparent_2px,_white_3px)] bg-[length:8px_8px] bg-repeat-x" />
            <div className="text-center">
              <h4 className="font-extrabold text-sm tracking-widest text-slate-900">CARNITAS POS</h4>
              <p className="text-[10px] text-slate-500">&quot;Los Amigos&quot;</p>
              <p className="text-[9px] text-slate-400">Sucursal Central</p>
            </div>
            <div className="border-t border-dashed border-slate-200 pt-2 space-y-1">
              <p><b>Folio:</b> {lastSale.doc}</p>
              <p><b>Fecha:</b> {new Date().toLocaleDateString('es-MX')} {lastSale.time}</p>
              <p><b>Cliente:</b> {lastSale.client}</p>
            </div>
            <div className="border-t border-dashed border-slate-200 pt-2">
              <table className="w-full text-left text-[10px]">
                <thead>
                  <tr className="border-b border-dashed border-slate-200">
                    <th className="pb-1">Cant.</th>
                    <th className="pb-1">Producto</th>
                    <th className="pb-1 text-right">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {lastSale.items.map(item => (
                    <tr key={item.id}>
                      <td className="py-1">{item.qty}x</td>
                      <td className="py-1 truncate max-w-[120px]">{item.name}</td>
                      <td className="py-1 text-right">${(item.price * item.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between text-xs font-bold text-slate-950">
              <span>TOTAL:</span>
              <span>${lastSale.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t border-dashed border-slate-200 pt-3 text-center space-y-0.5 text-[9px] text-slate-400">
              <p className="font-bold text-slate-600">¡Gracias por su preferencia!</p>
              <p>Hecho con mucho amor</p>
            </div>
          </div>
          <div className="w-full space-y-2.5">
            <button onClick={() => window.print()} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6701] to-[#FFA82F] text-white font-bold text-sm shadow-lg hover:shadow-xl hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2 cursor-pointer">
              🖨️ Imprimir Ticket
            </button>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 font-extrabold text-xs hover:bg-slate-50 dark:hover:bg-slate-600 transition-all cursor-pointer text-center">
              Continuar
            </button>
          </div>
        </div>
      </div>

      <div id="thermal-receipt" className="hidden">
        <div className="receipt-container">
          <h2 className="receipt-title">CARNITAS POS</h2>
          <p className="receipt-subtitle">&quot;Los Amigos&quot;</p>
          <p className="receipt-subtitle">Sucursal Central</p>
          <div className="receipt-divider">================================</div>
          <p className="receipt-text"><b>Folio:</b> {lastSale.doc}</p>
          <p className="receipt-text"><b>Fecha:</b> {new Date().toLocaleDateString('es-MX')} {lastSale.time}</p>
          <p className="receipt-text"><b>Cliente:</b> {lastSale.client}</p>
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
              {lastSale.items.map(item => (
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
            <b>${lastSale.total.toFixed(2)}</b>
          </div>
          <div className="receipt-divider">================================</div>
          <p className="receipt-footer">¡Gracias por su preferencia!</p>
          <p className="receipt-footer">Hecho con mucho amor</p>
        </div>
      </div>

      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        @media print {
          body * { visibility: hidden !important; background: none !important; box-shadow: none !important; }
          #thermal-receipt, #thermal-receipt * { visibility: visible !important; }
          #thermal-receipt { display: block !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 80mm !important; padding: 2mm 4mm !important; font-family: 'Courier New', Courier, monospace !important; font-size: 12px !important; color: #000 !important; background: #fff !important; }
          .receipt-container { width: 100% !important; }
          .receipt-title { text-align: center !important; font-size: 16px !important; font-weight: bold !important; margin: 0 0 2px 0 !important; }
          .receipt-subtitle { text-align: center !important; font-size: 11px !important; margin: 0 0 3px 0 !important; }
          .receipt-divider { text-align: center !important; margin: 5px 0 !important; letter-spacing: -1px !important; font-weight: bold !important; }
          .receipt-text { margin: 2px 0 !important; font-size: 11px !important; line-height: 1.2 !important; }
          .receipt-table { width: 100% !important; border-collapse: collapse !important; font-size: 11px !important; margin-top: 4px !important; }
          .receipt-table th, .receipt-table td { padding: 2px 0 !important; line-height: 1.2 !important; }
          .receipt-total { font-size: 14px !important; font-weight: bold !important; }
          .receipt-footer { text-align: center !important; font-size: 10px !important; margin: 4px 0 0 0 !important; font-weight: bold !important; }
        }
      `}</style>
    </>
  );
}
