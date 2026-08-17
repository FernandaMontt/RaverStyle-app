export default function ModalOverlay({ open, onClose, maxWidth = 'max-w-lg', glow = 'glow-cyan', children, contentClassName = 'bg-slate-900 border border-slate-800' }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div className={`${contentClassName} w-full ${maxWidth} rounded-2xl p-6 shadow-2xl relative ${glow}`}>
        {children}
      </div>
    </div>
  );
}
