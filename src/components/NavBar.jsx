export default function NavBar() {
  return (
    <nav className="flex justify-between items-center px-6 md:px-12 py-5 border-b border-raver-line bg-raver-bg/85 backdrop-blur-md sticky top-0 z-50">
      <div className="font-orbitron font-black text-[1.15rem] tracking-[0.12em] text-raver-white">
        RAVER <span className="text-raver-bridge">PLATFORM</span>
      </div>
      <div className="flex items-center gap-2 font-mono text-[0.68rem] tracking-[0.15em] text-raver-dim uppercase">
        <span className="w-[7px] h-[7px] rounded-full bg-emerald-500 shadow-[0_0_8px_#22c55e] animate-blink" />
        Ecosistema en línea
      </div>
    </nav>
  );
}
