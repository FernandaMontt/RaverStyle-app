export default function Hero() {
  return (
    <section className="pt-24 md:pt-[5.5rem] pb-16 px-8 text-center">
      <div className="font-mono text-[0.72rem] tracking-[0.5em] text-raver-bridge uppercase mb-6">
        // Panel Unificado · Dos Sistemas · Un Ecosistema //
      </div>
      <h1 className="font-orbitron font-black leading-[0.95] text-[clamp(2.6rem,7vw,5.2rem)] tracking-[-0.01em]">
        RAVER{' '}
        <span className="text-transparent" style={{ WebkitTextStroke: '1.5px #f0ede8' }}>
          STYLE
        </span>
      </h1>
      <p className="max-w-[620px] mx-auto mt-6 text-raver-dim text-[1.05rem] leading-relaxed">
        Caja POS y Tienda Online operan como aplicaciones independientes — cada una con su propia lógica,
        su propia base de datos y su propia interfaz. Este panel las conecta en un solo ecosistema visible,
        sin tocar ni una línea de su código ni de su información.
      </p>
    </section>
  );
}
