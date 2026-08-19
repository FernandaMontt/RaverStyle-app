import { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { formatCLP } from '../lib/format';
import ModalOverlay from './ModalOverlay';
import PaymentModal from './PaymentModal';
import ReceiptModal from './ReceiptModal';

function GlobalDiscountModal({ open, onClose, current, onApply }) {
  const [value, setValue] = useState(current || 0);
  return (
    <ModalOverlay open={open} onClose={onClose} maxWidth="max-w-sm">
      <h3 className="text-base font-bold text-white font-display mb-4">Descuento Global</h3>
      <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Monto de descuento (CLP)</label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-lg focus:outline-none focus:border-cyan-500 mb-5"
      />
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs uppercase">
          Cancelar
        </button>
        <button
          onClick={() => {
            onApply(parseInt(value, 10) || 0);
            onClose();
          }}
          className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-xl text-xs uppercase shadow-lg"
        >
          Aplicar
        </button>
      </div>
    </ModalOverlay>
  );
}

export default function POSView() {
  const { currentUser, currentShift, state, cartSubtotal, cartTotal, addToCart, updateCartQty, removeFromCart, clearCart, setGlobalDiscount, confirmPayment } = useStore();
  const showToast = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('TODAS');
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [receipt, setReceipt] = useState(null); // { sale, cartItems }

  const categories = state.settings.categories || [];

  const products = useMemo(() => {
    const active = state.products.filter((p) => p.estado === 'activo');
    const q = search.toLowerCase();
    return active.filter((p) => {
      const matchQuery = !q || p.nombre.toLowerCase().includes(q) || p.SKU.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q);
      const matchCat = category === 'TODAS' || p.categoria === category;
      return matchQuery && matchCat;
    });
  }, [state.products, search, category]);

  if (currentUser.rol === 'encargado_inventario') {
    return (
      <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 max-w-lg mx-auto mt-10">
        <i className="fa-solid fa-ban text-4xl text-rose-500 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">No posee permisos</h3>
        <p className="text-sm text-slate-400">El rol de Encargado de Inventario no puede procesar ventas de caja.</p>
      </div>
    );
  }

  function handleConfirmPayment(payment) {
    const result = confirmPayment(payment);
    setPaymentOpen(false);
    if (result) setReceipt(result);
  }

  function openPayment() {
    if (!currentShift) {
      showToast('Caja cerrada.', 'error');
      return;
    }
    if (state.cart.length === 0) return;
    setPaymentOpen(true);
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Columna izquierda: catálogo */}
      <div className="flex-1 flex flex-col h-full min-h-0 bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-hidden">
        <div className="space-y-3 mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <i className="fa-solid fa-magnifying-glass" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por Nombre, SKU o Código de Barras..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              onClick={() => {
                setSearch('');
                setCategory('TODAS');
              }}
              className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition"
            >
              Limpiar
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setCategory('TODAS')}
              className={'px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap ' + (category === 'TODAS' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700')}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={'px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap ' + (category === cat ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700')}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pr-1">
          {products.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500">
              <i className="fa-solid fa-ghost text-3xl mb-2" />
              <p className="text-sm font-semibold">No existen resultados.</p>
            </div>
          ) : (
            products.map((prod) => (
              <div
                key={prod.id}
                onClick={() => addToCart(prod.id)}
                className={
                  'group cursor-pointer bg-slate-950 border border-slate-800/80 hover:border-cyan-500/50 rounded-xl p-3 flex flex-col justify-between transition duration-200 relative ' +
                  (prod.stock_actual === 0 ? 'opacity-50 cursor-not-allowed' : '')
                }
              >
                <div className="aspect-square w-full bg-slate-900 rounded-lg overflow-hidden mb-2 relative shrink-0">
                  <img
                    src={prod.imagen}
                    alt={prod.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/300x300/0f172a/ffffff?text=RAVER';
                    }}
                  />
                  <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-bold text-cyan-400 border border-cyan-500/30">{prod.talla}</span>
                </div>
                <div className="shrink-0 leading-tight space-y-0.5">
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{prod.categoria}</span>
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-400 transition">{prod.nombre}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">SKU: {prod.SKU}</p>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-slate-800/60 pt-2 shrink-0">
                  <span className="text-xs font-extrabold text-cyan-400 font-mono">{formatCLP(prod.precio)}</span>
                  <span className={'text-[10px] font-medium ' + (prod.stock_actual <= prod.stock_minimo ? 'text-amber-400 font-bold' : 'text-slate-400')}>Stock: {prod.stock_actual}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Columna derecha: carrito */}
      <div className="w-full lg:w-96 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-cart-shopping text-cyan-400" />
            <h3 className="font-bold text-white text-sm font-display">Detalle de la Venta</h3>
          </div>
          <button onClick={clearCart} className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1">
            <i className="fa-solid fa-trash-can" /> Vaciar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {state.cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <i className="fa-solid fa-basket-shopping text-4xl mb-3 text-slate-700" />
              <p className="text-sm font-semibold">El carrito está vacío</p>
              <p className="text-xs">Haga clic en un producto para agregarlo a la venta</p>
            </div>
          ) : (
            state.cart.map((item, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-xs font-bold text-white truncate">{item.nombre}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {item.talla} • {formatCLP(item.precio)} c/u
                    </p>
                  </div>
                  <button onClick={() => removeFromCart(idx)} className="text-slate-500 hover:text-rose-400 text-xs">
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                    <button onClick={() => updateCartQty(idx, item.cantidad - 1)} className="px-2 py-1 text-slate-300 hover:bg-slate-800">
                      -
                    </button>
                    <span className="px-2 font-mono text-cyan-400 font-bold">{item.cantidad}</span>
                    <button onClick={() => updateCartQty(idx, item.cantidad + 1)} className="px-2 py-1 text-slate-300 hover:bg-slate-800">
                      +
                    </button>
                  </div>
                  <span className="text-xs font-bold text-white font-mono">{formatCLP(item.precio * item.cantidad - (item.descuento || 0))}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono text-white">{formatCLP(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Descuento Global</span>
              <button onClick={() => setDiscountModalOpen(true)} className="text-cyan-400 hover:underline font-mono">
                -{formatCLP(state.cartGlobalDiscount || 0)}
              </button>
            </div>
            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
              <span>TOTAL VENTA</span>
              <span className="font-mono text-cyan-400 text-lg">{formatCLP(cartTotal)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button onClick={clearCart} className="py-3 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 transition uppercase">
              Cancelar
            </button>
            <button
              disabled={state.cart.length === 0}
              onClick={openPayment}
              className="py-3 px-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition uppercase flex items-center justify-center gap-1.5 glow-green"
            >
              <i className="fa-solid fa-money-bill-wave" /> COBRAR
            </button>
          </div>
        </div>
      </div>

      <GlobalDiscountModal open={discountModalOpen} onClose={() => setDiscountModalOpen(false)} current={state.cartGlobalDiscount} onApply={setGlobalDiscount} />
      <PaymentModal open={paymentOpen} onClose={() => setPaymentOpen(false)} total={cartTotal} onConfirm={handleConfirmPayment} />
      <ReceiptModal open={Boolean(receipt)} onClose={() => setReceipt(null)} sale={receipt?.sale} cartItems={receipt?.cartItems || []} />
    </div>
  );
}