import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useStore } from '../context/StoreContext';
import { formatCLP } from '../lib/format';

export default function ReportesView() {
  const { state } = useStore();
  const paymentCanvasRef = useRef(null);
  const stockCanvasRef = useRef(null);
  const paymentChartRef = useRef(null);
  const stockChartRef = useRef(null);

  const totalVentas = state.sales.reduce((acc, s) => acc + s.total, 0);

  useEffect(() => {
    const methods = { efectivo: 0, tarjeta_debito: 0, tarjeta_credito: 0 };
    state.sales.forEach((s) => {
      if (methods[s.medio_pago] !== undefined) methods[s.medio_pago] += s.total;
    });

    if (paymentChartRef.current) paymentChartRef.current.destroy();
    if (paymentCanvasRef.current) {
      paymentChartRef.current = new Chart(paymentCanvasRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Efectivo', 'Débito', 'Crédito'],
          datasets: [{ data: [methods.efectivo, methods.tarjeta_debito, methods.tarjeta_credito], backgroundColor: ['#22c55e', '#00f0ff', '#a855f7'] }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8' } } } },
      });
    }

    const categories = {};
    state.products.forEach((p) => {
      categories[p.categoria] = (categories[p.categoria] || 0) + p.stock_actual;
    });

    if (stockChartRef.current) stockChartRef.current.destroy();
    if (stockCanvasRef.current) {
      stockChartRef.current = new Chart(stockCanvasRef.current, {
        type: 'bar',
        data: { labels: Object.keys(categories), datasets: [{ label: 'Unidades en Stock', data: Object.values(categories), backgroundColor: '#00f0ff' }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { x: { ticks: { color: '#94a3b8' } }, y: { ticks: { color: '#94a3b8' } } },
          plugins: { legend: { labels: { color: '#94a3b8' } } },
        },
      });
    }

    return () => {
      if (paymentChartRef.current) paymentChartRef.current.destroy();
      if (stockChartRef.current) stockChartRef.current.destroy();
    };
  }, [state.sales, state.products]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs uppercase font-semibold text-slate-400">Ventas Totales</span>
          <p className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">{formatCLP(totalVentas)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs uppercase font-semibold text-slate-400">Total Transacciones</span>
          <p className="text-2xl font-extrabold text-white font-mono mt-1">{state.sales.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs uppercase font-semibold text-slate-400">Ticket Promedio</span>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">{state.sales.length > 0 ? formatCLP(Math.round(totalVentas / state.sales.length)) : '$0'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-white font-display mb-4">Ventas por Medio de Pago</h3>
          <div className="h-64">
            <canvas ref={paymentCanvasRef} />
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-white font-display mb-4">Stock por Categoría</h3>
          <div className="h-64">
            <canvas ref={stockCanvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
