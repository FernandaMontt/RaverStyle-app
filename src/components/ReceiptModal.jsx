import { useStore } from '../context/StoreContext';
import { formatCLP } from '../lib/format';

export default function ReceiptModal({ open, onClose, sale, cartItems }) {
  const { state } = useStore();
  if (!open || !sale) return null;
  const settings = state.settings;

  return (
    <div id="print-receipt-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white text-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative font-mono text-xs">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-black">
          <i className="fa-solid fa-xmark text-base" />
        </button>

        <div className="text-center pb-4 border-b border-dashed border-slate-300">
          <h2 className="font-extrabold text-lg text-black font-display tracking-widest">{settings.storeName}</h2>
          <p className="text-[10px] text-slate-600">RUT: {settings.rut}</p>
          <p className="text-[10px] text-slate-600">{settings.address}</p>
          <p className="mt-2 font-bold text-xs border border-slate-900 inline-block px-2 py-0.5">BOLETA ELECTRÓNICA</p>
          <p className="mt-1 text-slate-800 font-bold">{sale.numero_venta}</p>
        </div>

        <div className="py-3 border-b border-dashed border-slate-300 space-y-1">
          <p>
            Fecha: {sale.fecha} {sale.hora}
          </p>
          <p>Cajero: {sale.cajero_nombre}</p>
          <p>Caja Turno: #{sale.caja_id}</p>
        </div>

        <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
          {cartItems.map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <div>
                <p className="font-bold">
                  {item.nombre} ({item.talla})
                </p>
                <p className="text-[10px] text-slate-600">
                  {item.cantidad} x {formatCLP(item.precio)}
                </p>
              </div>
              <p className="font-bold">{formatCLP(item.cantidad * item.precio)}</p>
            </div>
          ))}
        </div>

        <div className="py-3 border-b border-dashed border-slate-300 space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCLP(sale.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Descuento:</span>
            <span>-{formatCLP(sale.descuento)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm pt-1 text-black">
            <span>TOTAL:</span>
            <span>{formatCLP(sale.total)}</span>
          </div>
          <div className="flex justify-between text-[11px] pt-1">
            <span>Medio Pago:</span>
            <span className="uppercase font-bold">{sale.medio_pago.replace('_', ' ')}</span>
          </div>
          {sale.medio_pago === 'efectivo' && (
            <>
              <div className="flex justify-between text-[11px]">
                <span>Monto Recibido:</span>
                <span>{formatCLP(sale.monto_recibido)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Vuelto:</span>
                <span>{formatCLP(sale.vuelto)}</span>
              </div>
            </>
          )}
        </div>

        <div className="pt-4 text-center text-[10px] text-slate-600">
          <p>¡Gracias por tu compra en RAVER!</p>
          <p className="mt-1 font-bold">www.raver.cl</p>
        </div>

        <div className="mt-5 flex gap-2">
          <button onClick={() => window.print()} className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-bold">
            <i className="fa-solid fa-print" /> Imprimir
          </button>
          <button onClick={onClose} className="flex-1 py-2 bg-slate-200 text-slate-800 rounded-lg font-bold">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
