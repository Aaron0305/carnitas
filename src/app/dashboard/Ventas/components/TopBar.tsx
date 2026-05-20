'use client';

import { useState, useEffect } from 'react';
import { FiClock, FiSearch, FiRefreshCw, FiShoppingCart, FiLayers } from 'react-icons/fi';
import { GiMeat } from 'react-icons/gi';

interface Props {
  pendingCount: number;
  showPendingPanel: boolean;
  onTogglePendingPanel: () => void;
  showSearch: boolean;
  onToggleSearch: () => void;
  onRefresh: () => void;
  cartCount: number;
  onToggleMobileCart: () => void;
}

export default function TopBar({
  pendingCount, showPendingPanel, onTogglePendingPanel,
  showSearch, onToggleSearch, onRefresh,
  cartCount, onToggleMobileCart,
}: Props) {
  const [time, setTime] = useState('');
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const handleRefresh = () => {
    setSpinning(true);
    onRefresh();
    setTimeout(() => setSpinning(false), 800);
  };

  return (
    <div className="topbar-root">
      <div className="topbar-inner">

        {/* ── Left: brand ── */}
        <div className="topbar-brand">
          <GiMeat className="topbar-logo" />
          <div className="topbar-brand-text">
            <span className="topbar-title">Carnitas</span>
            <span className="topbar-subtitle">Punto de Venta</span>
          </div>
        </div>

        {/* ── Center: live clock ── */}
        <div className="topbar-clock-pill">
          <FiClock size={12} className="topbar-clock-icon" />
          <span className="topbar-clock-time">{time}</span>
        </div>

        {/* ── Right: actions ── */}
        <div className="topbar-actions">

          {/* Refresh */}
          <button
            id="topbar-btn-refresh"
            onClick={handleRefresh}
            title="Actualizar"
            className="topbar-btn topbar-btn-ghost"
          >
            <FiRefreshCw size={16} className={spinning ? 'topbar-spin' : ''} />
          </button>

          {/* Search */}
          <button
            id="topbar-btn-search"
            onClick={onToggleSearch}
            title="Buscar producto"
            className={`topbar-btn ${showSearch ? 'topbar-btn-active' : 'topbar-btn-ghost'}`}
          >
            <FiSearch size={16} />
          </button>

          {/* Pending orders */}
          <button
            id="topbar-btn-pending"
            onClick={onTogglePendingPanel}
            title="Órdenes pendientes"
            className={`topbar-btn topbar-btn-relative ${showPendingPanel ? 'topbar-btn-active' : 'topbar-btn-ghost'}`}
          >
            <FiLayers size={16} />
            {pendingCount > 0 && (
              <span className="topbar-badge">{pendingCount > 9 ? '9+' : pendingCount}</span>
            )}
          </button>

          {/* Mobile cart */}
          <button
            id="topbar-btn-cart"
            onClick={onToggleMobileCart}
            title="Ver carrito"
            className="topbar-btn topbar-btn-relative topbar-btn-cart lg:hidden"
          >
            <FiShoppingCart size={17} />
            {cartCount > 0 && (
              <span className="topbar-badge topbar-badge-white">{cartCount > 9 ? '9+' : cartCount}</span>
            )}
          </button>
        </div>
      </div>

      <style>{`
        /* ════════════════════════════════════════
           CSS CUSTOM PROPERTIES — por tema
        ════════════════════════════════════════ */

        /* Modo oscuro (default si el sistema lo pide) */
        @media (prefers-color-scheme: dark) {
          .topbar-root {
            --tb-bg: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            --tb-border: rgba(255, 103, 1, 0.25);
            --tb-shadow: 0 4px 24px rgba(0,0,0,0.35), 0 1px 0 rgba(255,103,1,0.15);
            --tb-subtitle-color: rgba(255,255,255,0.4);
            --tb-clock-bg: rgba(255,255,255,0.06);
            --tb-clock-border: rgba(255,255,255,0.1);
            --tb-clock-text: rgba(255,255,255,0.85);
            --tb-ghost-bg: rgba(255,255,255,0.07);
            --tb-ghost-color: rgba(255,255,255,0.65);
            --tb-ghost-border: rgba(255,255,255,0.08);
            --tb-ghost-hover-bg: rgba(255,255,255,0.14);
            --tb-ghost-hover-color: #fff;
            --tb-badge-border: #1a1a2e;
            --tb-badge-border-cart: #0f3460;
          }
        }

        /* Modo claro */
        @media (prefers-color-scheme: light) {
          .topbar-root {
            --tb-bg: linear-gradient(135deg, #ffffff 0%, #fff7f2 50%, #fff1e6 100%);
            --tb-border: rgba(255, 103, 1, 0.2);
            --tb-shadow: 0 2px 16px rgba(0,0,0,0.08), 0 1px 0 rgba(255,103,1,0.12);
            --tb-subtitle-color: rgba(80,60,40,0.45);
            --tb-clock-bg: rgba(255, 103, 1, 0.06);
            --tb-clock-border: rgba(255, 103, 1, 0.18);
            --tb-clock-text: #7c4b1e;
            --tb-ghost-bg: rgba(0,0,0,0.05);
            --tb-ghost-color: #5a4030;
            --tb-ghost-border: rgba(0,0,0,0.08);
            --tb-ghost-hover-bg: rgba(255,103,1,0.1);
            --tb-ghost-hover-color: #FF6701;
            --tb-badge-border: #ffffff;
            --tb-badge-border-cart: #fff1e6;
          }
        }

        /* ════════════════════════════════════════
           ESTILOS COMPARTIDOS
        ════════════════════════════════════════ */
        .topbar-root {
          background: var(--tb-bg);
          border-bottom: 1px solid var(--tb-border);
          box-shadow: var(--tb-shadow);
          transition: background 0.3s ease, box-shadow 0.3s ease;
        }

        .topbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 80rem;
          margin: 0 auto;
          padding: 0.6rem 1.25rem;
          gap: 1rem;
        }

        /* ── Brand ── */
        .topbar-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-shrink: 0;
        }
        .topbar-logo {
          width: 1.6rem;
          height: 1.6rem;
          flex-shrink: 0;
          color: #FF6701;
          filter: drop-shadow(0 0 8px rgba(255,103,1,0.5));
          animation: topbar-float 3s ease-in-out infinite;
        }
        @keyframes topbar-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-3px); }
        }
        .topbar-brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }
        .topbar-title {
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(90deg, #FF6701, #FFA040);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .topbar-subtitle {
          font-size: 0.6rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--tb-subtitle-color);
          transition: color 0.3s ease;
        }

        /* ── Clock pill ── */
        .topbar-clock-pill {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.28rem 0.75rem;
          border-radius: 999px;
          background: var(--tb-clock-bg);
          border: 1px solid var(--tb-clock-border);
          backdrop-filter: blur(8px);
          flex-shrink: 0;
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        .topbar-clock-icon {
          color: #FF6701;
          opacity: 0.85;
          flex-shrink: 0;
        }
        .topbar-clock-time {
          font-size: 0.75rem;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.06em;
          color: var(--tb-clock-text);
          white-space: nowrap;
          transition: color 0.3s ease;
        }

        /* ── Actions ── */
        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          flex-shrink: 0;
        }

        /* ── Buttons ── */
        .topbar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.1rem;
          height: 2.1rem;
          border-radius: 0.875rem;
          border: none;
          cursor: pointer;
          transition: all 0.18s ease;
          outline: none;
          flex-shrink: 0;
        }
        .topbar-btn-relative {
          position: relative;
        }
        .topbar-btn-ghost {
          background: var(--tb-ghost-bg);
          color: var(--tb-ghost-color);
          border: 1px solid var(--tb-ghost-border);
        }
        .topbar-btn-ghost:hover {
          background: var(--tb-ghost-hover-bg);
          color: var(--tb-ghost-hover-color);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        }
        .topbar-btn-active {
          background: linear-gradient(135deg, #FF6701, #e55a00);
          color: #fff;
          border: 1px solid rgba(255,103,1,0.4);
          box-shadow: 0 0 16px rgba(255,103,1,0.4), 0 2px 8px rgba(0,0,0,0.15);
        }
        .topbar-btn-active:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
        .topbar-btn-cart {
          background: linear-gradient(135deg, #FF6701, #FFA040);
          color: #fff;
          border: 1px solid rgba(255,160,64,0.35);
          box-shadow: 0 0 14px rgba(255,103,1,0.3);
        }
        .topbar-btn-cart:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
          box-shadow: 0 0 20px rgba(255,103,1,0.5);
        }

        /* ── Spin animation ── */
        .topbar-spin {
          animation: topbar-spin-anim 0.7s linear;
        }
        @keyframes topbar-spin-anim {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ── Badge ── */
        .topbar-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          min-width: 16px;
          height: 16px;
          border-radius: 999px;
          background: #ef4444;
          color: #fff;
          font-size: 9px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
          border: 2px solid var(--tb-badge-border);
          box-shadow: 0 2px 6px rgba(239,68,68,0.45);
        }
        .topbar-badge-white {
          border-color: var(--tb-badge-border-cart);
        }

        /* ── Responsive ── */
        @media (max-width: 360px) {
          .topbar-clock-pill { display: none; }
          .topbar-subtitle   { display: none; }
        }
      `}</style>
    </div>
  );
}
