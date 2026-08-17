const CARDS = [
  {
    id: 'pos',
    color: 'pos',
    icon: 'fa-cash-register',
    tag: 'Sistema 01 // Operación en tienda',
    title: 'RAVER Caja POS',
    desc: 'Punto de venta presencial: apertura de caja, cobro, boletas, inventario y devoluciones para el equipo en tienda.',
    meta: 'Roles: Cajero · Inventario · Admin',
  },
  {
    id: 'online',
    color: 'web',
    icon: 'fa-bag-shopping',
    tag: 'Sistema 02 // Canal e-commerce',
    title: 'RAVER Tienda Online',
    desc: 'Catálogo, carrito, favoritos, checkout con Webpay y boleta electrónica para clientes finales.',
    meta: 'Roles: Cliente · Admin',
  },
];

const colorClasses = {
  pos: {
    text: 'text-raver-pos',
    border: 'hover:border-raver-pos',
    shadow: 'hover:shadow-pos-glow',
  },
  web: {
    text: 'text-raver-web',
    border: 'hover:border-raver-web',
    shadow: 'hover:shadow-web-glow',
  },
};

const CARD_CLASSES =
  'card-corners bg-raver-panel border border-raver-line p-9 relative flex flex-col gap-3.5 ' +
  'no-underline transition-all duration-200 overflow-hidden hover:-translate-y-1';

function CardContent({ card, c }) {
  return (
    <>
      <div className="text-[1.8rem]">
        <i className={`fa-solid ${card.icon}`} aria-hidden="true" />
      </div>
      <div className="font-mono text-[0.65rem] tracking-[0.2em] uppercase">{card.tag}</div>
      <div className="font-orbitron text-2xl font-bold text-raver-white">{card.title}</div>
      <p className="text-raver-dim text-[0.92rem] leading-relaxed">{card.desc}</p>
      <div className="flex gap-5 font-mono text-[0.68rem] text-raver-dim">
        <span>{card.meta}</span>
      </div>
      <div className="mt-auto flex items-center gap-2 font-grotesk text-[0.8rem] font-bold tracking-wide uppercase pt-2.5">
        Abrir sistema <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </div>
    </>
  );
}

export default function LaunchCards({ onOpenOnline, onOpenPOS }) {
  return (
    <section aria-label="Acceso a los sistemas" className="max-w-[1080px] mx-auto mt-20 px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {CARDS.map((card) => {
        const c = colorClasses[card.color];
        
        // Determinamos qué función ejecutar según el ID de la tarjeta
        const handleClick = card.id === 'pos' ? onOpenPOS : onOpenOnline;

        return (
          <button
            key={card.id}
            type="button"
            onClick={handleClick}
            className={`${CARD_CLASSES} ${c.text} text-left w-full cursor-pointer ${c.border} ${c.shadow}`}
          >
            <CardContent card={card} c={c} />
          </button>
        );
      })}
    </section>
  );
}