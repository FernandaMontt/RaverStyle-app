export default function AmbientBackground() {
  return (
    <>
      <div id="ambient-grid" className="fixed inset-0 z-0 pointer-events-none animate-drift" aria-hidden="true" />
      <div id="scanlines" className="fixed inset-0 z-[1] pointer-events-none" aria-hidden="true" />
    </>
  );
}
