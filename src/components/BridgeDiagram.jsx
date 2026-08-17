import { formatCLP } from '../lib/format';

export default function BridgeDiagram({ stats, onOpenOnline }) {
  const ventas = stats.pos.ventas;
  const pedidos = stats.web.pedidos;

  return (
    <section
      aria-label="Estado en vivo del puente de integración"
      className="max-w-[980px] mx-auto mt-16 px-6 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-5"
    >
      <div className="border border-raver-pos/35 shadow-[0_0_22px_rgba(0,240,255,0.08)_inset] bg-raver-panel px-5 py-6 relative">
        <div className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-raver-pos">
          <i className="fa-solid fa-cash-register" aria-hidden="true" /> Caja POS
        </div>
        <div className="font-orbitron text-[1.9rem] font-bold mt-1">{formatCLP(stats.pos.total)}</div>
        <div className="font-mono text-[0.62rem] text-raver-dim mt-1 tracking-wide">
          {ventas} venta{ventas === 1 ? '' : 's'} registrada{ventas === 1 ? '' : 's'} hoy
        </div>
      </div>

      <div
        className="conduit-pulse bg-raver-line w-full h-[3px] max-md:w-[3px] max-md:h-[60px] max-md:mx-auto"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34px] h-[34px] rounded-full
                         bg-raver-bg border border-raver-bridge flex items-center justify-center text-raver-bridge
                         text-[0.85rem] shadow-bridge-glow">
          <i className="fa-solid fa-bolt" aria-hidden="true" />
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenOnline}
        title="Abrir RAVER Tienda Online"
        className="border border-raver-web/35 shadow-[0_0_22px_rgba(255,107,0,0.08)_inset] bg-raver-panel px-5 py-6 relative text-left w-full cursor-pointer transition-all hover:border-raver-web hover:shadow-web-glow"
      >
        <div className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-raver-web">
          <i className="fa-solid fa-bag-shopping" aria-hidden="true" /> Tienda Online
        </div>
        <div className="font-orbitron text-[1.9rem] font-bold mt-1">{formatCLP(stats.web.total)}</div>
        <div className="font-mono text-[0.62rem] text-raver-dim mt-1 tracking-wide">
          {pedidos} pedido{pedidos === 1 ? '' : 's'} registrado{pedidos === 1 ? '' : 's'} hoy
        </div>
      </button>
    </section>
  );
}
