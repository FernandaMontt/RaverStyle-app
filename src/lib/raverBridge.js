/**
 * RaverBridge — puente de integración entre Caja POS y Tienda Online.
 *
 * Módulo ES para comunicar eventos y estadísticas en tiempo real
 * entre el POS y la Web mediante localStorage y CustomEvents.
 */

import { safeGetJSON, safeSetJSON, isValidStats, isValidFeed } from './safeStorage';

const FEED_KEY = 'raver_bridge_feed_v1';
const STATS_KEY = 'raver_bridge_stats_v1';
const MAX_FEED = 40;

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function emptyStats() {
  return {
    date: todayStr(),
    pos: { ventas: 0, total: 0 },
    web: { pedidos: 0, total: 0 },
    updatedAt: new Date().toISOString(),
  };
}

export function getStats() {
  const stats = safeGetJSON(STATS_KEY, null, isValidStats);
  if (!stats || stats.date !== todayStr()) return emptyStats();
  return stats;
}

export function getFeed() {
  return safeGetJSON(FEED_KEY, [], isValidFeed);
}

function writeJSON(key, value) {
  const ok = safeSetJSON(key, value);
  if (ok) {
    document.dispatchEvent(new CustomEvent('raver-bridge-update', { detail: { key, value } }));
  }
  return ok;
}

function pushEvent(evt) {
  const feed = getFeed();
  feed.unshift({ ts: new Date().toISOString(), ...evt });
  writeJSON(FEED_KEY, feed.slice(0, MAX_FEED));
}

/** Deriva ventas/total del día desde el arreglo completo de ventas del POS, sin reescribirlo. */
export function publishPOSSales(salesArray, lastSale) {
  const today = todayStr();
  const ventasHoy = (salesArray || []).filter((s) => s.fecha === today);
  const totalHoy = ventasHoy.reduce((acc, s) => acc + (s.total || 0), 0);

  const stats = getStats();
  stats.pos = { ventas: ventasHoy.length, total: totalHoy };
  stats.updatedAt = new Date().toISOString();
  writeJSON(STATS_KEY, stats);

  if (lastSale) {
    pushEvent({
      system: 'POS',
      type: 'venta',
      ref: lastSale.numero_venta,
      amount: lastSale.total,
      label: `Venta ${lastSale.numero_venta} en Caja POS`,
    });
  }
}

/** Deriva pedidos/total del día desde el arreglo completo de pedidos web, sin reescribirlo. */
export function publishWebOrders(ordersArray, lastOrder) {
  const stats = getStats();
  const totalWeb = (ordersArray || []).reduce((acc, o) => acc + (o.totalNum || 0), 0);
  stats.web = { pedidos: (ordersArray || []).length, total: totalWeb };
  stats.updatedAt = new Date().toISOString();
  writeJSON(STATS_KEY, stats);

  if (lastOrder) {
    pushEvent({
      system: 'WEB',
      type: 'pedido',
      ref: lastOrder.num,
      amount: lastOrder.totalNum,
      label: `Pedido ${lastOrder.num} en Tienda Online`,
    });
  }
}

export function onUpdate(cb) {
  const storageHandler = (e) => {
    if (e.key === STATS_KEY || e.key === FEED_KEY) cb();
  };
  window.addEventListener('storage', storageHandler);
  document.addEventListener('raver-bridge-update', cb);
  return () => {
    window.removeEventListener('storage', storageHandler);
    document.removeEventListener('raver-bridge-update', cb);
  };
}