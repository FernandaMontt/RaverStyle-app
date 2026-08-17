import { useState, useEffect, useRef } from 'react';
import { safeGetJSON, safeSetJSON } from '../lib/safeStorage';
import { publishWebOrders } from '../lib/raverBridge';
import { hashPassword, verifyPassword } from '../lib/hash';

// Formateador defensivo universal para CLP (Evita crashes por null/undefined)
const formatCLP = (val) => {
  const num = Number(val);
  return isNaN(num) ? '0' : num.toLocaleString('es-CL');
};

// Reserva de seguridad: La tienda online mostrará 2 unidades MENOS que la Caja POS
const ONLINE_STOCK_BUFFER = 2;

const getOnlineStock = (posStock) => {
  const stock = Number(posStock) || 0;
  return Math.max(0, stock - ONLINE_STOCK_BUFFER);
};

// Llaves de almacenamiento local (raver_users_v1 es la MISMA clave que usa Caja POS)
const PRODUCTS_KEY = 'raver_products_v1';
const USERS_KEY = 'raver_users_v1';
const ORDERS_KEY = 'raver_web_orders_v1';

// CATALOGO OFICIAL RAVER STYLE (Compatible con formato POS: SKU, nombre, stock_actual, categoria, precio)
const INITIAL_PRODUCTS = [
  // Mascarillas
  { id: 101, SKU: 'RS-MSK-CYB-V1', nombre: 'Mascarilla Cyber V1', categoria: 'Mascarillas', precio: 19990, stock_actual: 10, color: 'Negro + Naranja', talla: 'Ajustable', icon: '🥽', imagen: '/vestuario/Mascarilla Cyber V1.png' },
  { id: 102, SKU: 'RS-MSK-CYB-V2', nombre: 'Mascarilla Cyber V2', categoria: 'Mascarillas', precio: 18990, stock_actual: 8, color: 'Negro + Blanco', talla: 'Ajustable', icon: '🥽', imagen: '/vestuario/Mascarilla Cyber V2.png' },
  { id: 103, SKU: 'RS-MSK-CYB-V3', nombre: 'Mascarilla Cyber V3', categoria: 'Mascarillas', precio: 21990, stock_actual: 6, color: 'Negro Mate', talla: 'Ajustable', icon: '🥽', imagen: '/vestuario/Mascarilla Cyber V3.png' },
  { id: 104, SKU: 'RS-MSK-CYB-V4', nombre: 'Mascarilla Cyber V4', categoria: 'Mascarillas', precio: 16990, stock_actual: 12, color: 'Negro + Gris', talla: 'Ajustable', icon: '🥽', imagen: '/vestuario/Mascarilla Cyber V4.png' },
  { id: 105, SKU: 'RS-MSK-CYB-V5', nombre: 'Mascarilla Cyber V5 Visor', categoria: 'Mascarillas', precio: 23990, stock_actual: 5, color: 'Reflectante', talla: 'Ajustable', icon: '🥽', imagen: '/vestuario/Mascarilla Cyber V5.png' },
  { id: 106, SKU: 'RS-MSK-TAC-PRO', nombre: 'Mascarilla Tactic Pro', categoria: 'Mascarillas', precio: 17990, stock_actual: 9, color: 'Negro Táctico', talla: 'Ajustable', icon: '😷', imagen: '/vestuario/Mascarilla Tactic Pro.png' },
  { id: 107, SKU: 'RS-MSK-TAC-CAMO', nombre: 'Mascarilla Tactic Camo', categoria: 'Mascarillas', precio: 16990, stock_actual: 7, color: 'Camo Negro', talla: 'Ajustable', icon: '😷', imagen: '/vestuario/Mascarilla Tactic Camo.png' },
  { id: 108, SKU: 'RS-MSK-LED-NEON', nombre: 'Mascarilla LED Neon', categoria: 'Mascarillas', precio: 22990, stock_actual: 11, color: 'Azul Neon', talla: 'Ajustable', icon: '⚡', imagen: '/vestuario/Mascarilla LED Neon.png' },
  { id: 109, SKU: 'RS-MSK-LED-PULSE', nombre: 'Mascarilla LED Pulse', categoria: 'Mascarillas', precio: 22990, stock_actual: 8, color: 'Morado Glow', talla: 'Ajustable', icon: '⚡', imagen: '/vestuario/Mascarilla LED Pulse.png' },
  { id: 110, SKU: 'RS-MSK-SAM-KAI', nombre: 'Mascarilla Samurai Kai', categoria: 'Mascarillas', precio: 24990, stock_actual: 6, color: 'Negro', talla: 'Ajustable', icon: '👺', imagen: '/vestuario/Mascarilla Samurai Kai.png' },
  { id: 111, SKU: 'RS-MSK-SAM-DRK', nombre: 'Mascarilla Samurai Dark', categoria: 'Mascarillas', precio: 26990, stock_actual: 4, color: 'Negro Mate', talla: 'Ajustable', icon: '👺', imagen: '/vestuario/Mascarilla Samurai Dark.png' },
  { id: 112, SKU: 'RS-MSK-SAM-BLD', nombre: 'Mascarilla Samurai Blood', categoria: 'Mascarillas', precio: 26990, stock_actual: 5, color: 'Negro + Rojo', talla: 'Ajustable', icon: '👺', imagen: '/vestuario/Mascarilla Samurai Blood.png' },

  // Poleras
  { id: 201, SKU: 'RS-TEE-MEN-01', nombre: 'Raver Tech Tee (Hombre)', categoria: 'Poleras', precio: 22990, stock_actual: 15, color: 'Negro + Naranja', talla: 'L', icon: '👕', imagen: '/vestuario/Raver Tech Tee Hombre.png' },
  { id: 202, SKU: 'RS-TEE-WM-01', nombre: 'Raver Fit Tee (Mujer)', categoria: 'Poleras', precio: 19990, stock_actual: 12, color: 'Negro Mate + Glow', talla: 'M', icon: '👕', imagen: '/vestuario/Raver Tech Tee Mujer.png' },

  // Polerones y Cortavientos
  { id: 301, SKU: 'RS-HD-CYBARMOR', nombre: 'Cyber Armor Hoodie', categoria: 'Polerones', precio: 39990, stock_actual: 7, color: 'Negro + Naranja Glow', talla: 'XL', icon: '🧥', imagen: '/vestuario/Cyber Armor Hoodie Hombre.png' },
  { id: 302, SKU: 'RS-HD-NEONPULSE', nombre: 'Neon Pulse Hoodie', categoria: 'Polerones', precio: 38990, stock_actual: 6, color: 'Negro + Morado Glow', talla: 'M', icon: '🧥', imagen: '/vestuario/Cyber Armor Hoodie Mujer.png' },
  { id: 401, SKU: 'RS-CV-CYBARMOR', nombre: 'Cyber Armor Cortavientos', categoria: 'Cortavientos', precio: 34990, stock_actual: 8, color: 'Negro + Naranja', talla: 'L', icon: '🧥', imagen: '/vestuario/Cyber Armor Cortavientos Hombre.png' },
  { id: 402, SKU: 'RS-CV-NEONPULSE', nombre: 'Neon Pulse Cortavientos Crop', categoria: 'Cortavientos', precio: 32990, stock_actual: 5, color: 'Negro + Morado', talla: 'S', icon: '🧥', imagen: '/vestuario/Cyber Armor Cortavientos Mujer.png' },

  // Pantalones
  { id: 501, SKU: 'RS-PNT-TECH-MEN', nombre: 'Tech Cargo Pants', categoria: 'Pantalones', precio: 36990, stock_actual: 9, color: 'Negro Desgastado', talla: '42', icon: '👖', imagen: '/vestuario/Tech Cargo Pants Hombre.png' },
  { id: 502, SKU: 'RS-PNT-CYB-WM', nombre: 'Cyber Cargo Fit High Waist', categoria: 'Pantalones', precio: 34990, stock_actual: 8, color: 'Negro', talla: '38', icon: '👖', imagen: '/vestuario/Tech Cargo Pants Mujer.png' },

  // Calzado
  { id: 601, SKU: 'RS-SNK-TECH', nombre: 'Raver Tech Sneakers LED', categoria: 'Zapatillas', precio: 59990, stock_actual: 10, color: 'Negro + Naranja Glow', talla: '41', icon: '👟', imagen: '/vestuario/zapatillas.png' },

  // Lentes de Sol
  { id: 701, SKU: 'RS-GLS-SPORT-BLK', nombre: 'Cyber Vision Glasses (Sport 180°)', categoria: 'Lentes de Sol', precio: 15990, stock_actual: 20, color: 'Cyber Black', talla: 'Única', icon: '🕶️', imagen: '/vestuario/Cyber Vision Glasses (Sport 180°).png' },
  { id: 702, SKU: 'RS-GLS-SPORT-PUR', nombre: 'Cyber Vision Glasses Purple 180°', categoria: 'Lentes de Sol', precio: 15990, stock_actual: 15, color: 'Cyber Purple', talla: 'Única', icon: '🕶️', imagen: '/vestuario/Cyber Vision Glasses Purple (Sport 180°).png' },
  { id: 703, SKU: 'RS-GLS-WAY-BLK', nombre: 'Cyber Vision Glasses (Wayfarer)', categoria: 'Lentes de Sol', precio: 14990, stock_actual: 18, color: 'Cyber Black', talla: 'Única', icon: '🕶️', imagen: '/vestuario/Cyber Vision Glasses (Wayfarer).png' },

  // Accesorios
  { id: 801, SKU: 'RS-BAG-LEG-ORG', nombre: 'Leg Utility Bag / Musera Tactical', categoria: 'Accesorios', precio: 18990, stock_actual: 14, color: 'Naranja Neón', talla: 'Ajustable', icon: '🎒', imagen: '/vestuario/LegUtilityBag.png' },
  { id: 802, SKU: 'RS-BAG-BAN-BLK', nombre: 'Banano Raver Style YKK', categoria: 'Accesorios', precio: 12990, stock_actual: 25, color: 'Negro', talla: 'Ajustable', icon: '🎒', imagen: '/vestuario/Banano.png' },
  { id: 803, SKU: 'RS-ACC-BOTTLE', nombre: 'Porta Botella Táctico Holder', categoria: 'Accesorios', precio: 8990, stock_actual: 30, color: 'Negro + Naranja', talla: 'Ajustable', icon: '🧪', imagen: '/vestuario/Bottle Holder.png' },
  { id: 804, SKU: 'RS-ACC-GLOVES', nombre: 'Guantes Raver Tech Touchscreen', categoria: 'Accesorios', precio: 11990, stock_actual: 12, color: 'Negro', talla: 'L', icon: '🥊', imagen: '/vestuario/Guantes.png' }
];

// Semilla de usuarios: la contraseña en texto plano SOLO se usa una vez, para
// generar el hash inicial. Nunca se guarda ni compara en texto plano — así
// coincide con el mismo formato { salt, hash } que usa Caja POS.
export const DEFAULT_USERS_PLAIN = [
  { id: 1, nombre: 'Jonathan', apellidos: 'Arevalo', email: 'cajero@raver.cl', password: '123', rol: 'cajero', estado: 'activo', fecha_creacion: '2026-01-10', failed_attempts: 0 },
  { id: 2, nombre: 'Diego', apellidos: 'Soto', email: 'inventario@raver.cl', password: '123', rol: 'encargado_inventario', estado: 'activo', fecha_creacion: '2026-01-12', failed_attempts: 0 },
  { id: 3, nombre: 'Fernanda', apellidos: 'Montt', email: 'admin@raver.cl', password: '123', rol: 'administrador', estado: 'activo', fecha_creacion: '2026-01-01', failed_attempts: 0 },
  { id: 4, nombre: 'Alex', apellidos: 'Vortex', email: 'cliente@raver.cl', password: '12345678', rol: 'cliente', estado: 'activo', fecha_creacion: '2026-01-15', failed_attempts: 0 },
];

const TICKER_ITEMS = [
  'Cyberpunk Apparel',
  'Webpay Transbank Synchronized',
  'Electronic Culture',
  'Raver Tech Wear',
];

// Normalizador: agrega alias en inglés (name/role/status/attempts) sin pisar
// los campos en español (nombre/rol/estado/failed_attempts), que son la
// fuente de verdad real en toda la app.
const normalizeUser = (u) => ({
  ...u,
  name: u.name || u.nombre || 'Usuario',
  lastname: u.lastname || u.apellidos || '',
  role: u.role || (u.rol === 'administrador' ? 'admin' : u.rol) || 'cliente',
  status: u.status || u.estado || 'activo',
  attempts: u.attempts ?? u.failed_attempts ?? 0,
});

/** Genera los usuarios semilla ya hasheados (async, Web Crypto). */
async function buildSeedUsers() {
  return Promise.all(
    DEFAULT_USERS_PLAIN.map(async ({ password, ...rest }) => {
      const { salt, hash } = await hashPassword(password);
      return normalizeUser({ ...rest, salt, hash });
    })
  );
}

function TickerBar() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]; // duplicado para loop perfecto
  return (
    <div className="w-full bg-[#FF6B00] overflow-hidden py-2.5">
      <div className="ticker-track">
        {items.map((text, i) => (
          <span
            key={i}
            className="font-['Orbitron'] text-xs font-bold tracking-[0.3em] uppercase text-[#080808] px-12"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

const CATEGORY_SLIDES = [
  { label: 'Mascarillas', img: '/imagenes/mascarillas.png', categoria: 'Mascarillas' },
  { label: 'Poleras', img: '/imagenes/poleras.png', categoria: 'Poleras' },
  { label: 'Polerones', img: '/imagenes/polerones.png', categoria: 'Polerones' },
  { label: 'Cortavientos', img: '/imagenes/cortavientos.png', categoria: 'Cortavientos' },
  { label: 'Pantalones', img: '/imagenes/pantalonesr.png', categoria: 'Pantalones' },
  { label: 'Zapatillas', img: '/imagenes/zapatillas.png', categoria: 'Zapatillas' },
  { label: 'Accesorios', img: '/imagenes/leg_bag.png', categoria: 'Accesorios' },
  { label: 'Gorros — Próximamente', img: '/imagenes/gorros_proximamente.png', categoria: null, comingSoon: true },
];

function HeroCarousel({ slides, onSelectCategory }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const stop = () => timerRef.current && clearTimeout(timerRef.current);
  const start = () => {
    stop();
    timerRef.current = setTimeout(() => setIndex((i) => (i + 1) % slides.length), 4000);
  };

  useEffect(() => {
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const goTo = (i) => setIndex((i + slides.length) % slides.length);
  const current = slides[index];

  return (
    <div
      className="relative w-full max-w-5xl mx-auto mt-8 mb-2 select-none"
      onMouseEnter={stop}
      onMouseLeave={start}
    >
      <div className="relative h-[340px] md:h-[520px] overflow-hidden border border-[#FF6B00]/30 bg-[#0d0d0d]">
        {slides.map((s, i) => (
          <img
            key={s.label}
            src={s.img}
            alt={s.label}
            onClick={() => !s.comingSoon && onSelectCategory(s.categoria)}
            className={`carousel-fade absolute inset-0 w-full h-full object-cover ${
              i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
            } ${s.comingSoon ? '' : 'cursor-pointer'}`}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ))}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-6 left-6 z-20 font-['Share_Tech_Mono'] text-sm md:text-base tracking-widest text-[#FF6B00] uppercase">
          {current.label}
        </div>

        <button
          onClick={() => goTo(index - 1)}
          aria-label="Anterior"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center bg-black/60 border border-[#FF6B00]/50 text-[#FF6B00] hover:bg-[#FF6B00] hover:text-black transition-colors text-2xl"
        >
          ‹
        </button>
        <button
          onClick={() => goTo(index + 1)}
          aria-label="Siguiente"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center bg-black/60 border border-[#FF6B00]/50 text-[#FF6B00] hover:bg-[#FF6B00] hover:text-black transition-colors text-2xl"
        >
          ›
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Ir al slide ${i + 1}`}
            className={`h-2.5 rounded-full transition-all ${i === index ? 'bg-[#FF6B00] w-8' : 'bg-white/25 w-2.5'}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function TiendaOnlineApp({ onReturnHub }) {
  const [currentView, setCurrentView] = useState('home');
  const [toasts, setToasts] = useState([]);

  // Carga inicial desde LocalStorage
  const [products, setProducts] = useState(() => {
    return safeGetJSON(PRODUCTS_KEY, INITIAL_PRODUCTS, (arr) => Array.isArray(arr));
  });

  // Los usuarios se hidratan de forma ASÍNCRONA porque hashear requiere
  // Web Crypto (Promise). Si ya existen en localStorage (por ejemplo,
  // porque Caja POS ya corrió antes en este navegador), se usan tal cual
  // -- ya vienen hasheados. Si no existen, se siembran y se hashean recién
  // en ese momento.
  const [users, setUsers] = useState([]);
  const [usersReady, setUsersReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = safeGetJSON(USERS_KEY, null, (arr) => Array.isArray(arr) && arr.length > 0);
      if (cancelled) return;
      if (stored) {
        setUsers(stored);
      } else {
        const seeded = await buildSeedUsers();
        if (cancelled) return;
        setUsers(seeded);
        safeSetJSON(USERS_KEY, seeded);
      }
      setUsersReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  const [orders, setOrders] = useState(() => {
    return safeGetJSON(ORDERS_KEY, [], (arr) => Array.isArray(arr));
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Filtros del Catálogo
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCats, setSelectedCats] = useState([]);
  const [stockOnly, setStockOnly] = useState(false);

  // Modales
  const [modalAuthOpen, setModalAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [loginEmail, setLoginEmail] = useState('cliente@raver.cl');
  const [loginPass, setLoginPass] = useState('12345678');
  const [loginBusy, setLoginBusy] = useState(false);

  const [regName, setRegName] = useState('');
  const [regLastname, setRegLastname] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regBusy, setRegBusy] = useState(false);

  const [modalCartOpen, setModalCartOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');

  const [modalCheckoutOpen, setModalCheckoutOpen] = useState(false);
  const [shippingCost] = useState(3990);

  const [modalWebpayOpen, setModalWebpayOpen] = useState(false);
  const [pendingOrderNum, setPendingOrderNum] = useState('');
  const [pendingOrderTotal, setPendingOrderTotal] = useState(0);

  const [modalBoletaOpen, setModalBoletaOpen] = useState(false);
  const [activeBoleta, setActiveBoleta] = useState(null);

  const canvasRef = useRef(null);

  // Escuchar cambios de stock desde Caja POS / Pestañas externas
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedProducts = safeGetJSON(PRODUCTS_KEY, INITIAL_PRODUCTS, (arr) => Array.isArray(arr));
      setProducts(updatedProducts);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('raver_products_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('raver_products_updated', handleStorageChange);
    };
  }, []);

  // Sincronizar hacia localStorage
  useEffect(() => {
    safeSetJSON(PRODUCTS_KEY, products);
  }, [products]);

  useEffect(() => {
    safeSetJSON(ORDERS_KEY, orders);
  }, [orders]);

  const showToast = (msg, type = 'exito') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Canvas Vortex Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() { this.reset(true); }
      reset(init = false) {
        this.angle = Math.random() * Math.PI * 2;
        this.radius = init ? Math.random() * Math.min(W, H) * 0.5 : 0;
        this.speed = 0.002 + Math.random() * 0.004;
        this.radiusSpeed = 0.3 + Math.random() * 0.8;
        this.maxRadius = 80 + Math.random() * Math.min(W, H) * 0.45;
        this.size = 0.5 + Math.random() * 1.5;
        this.opacity = 0;
        this.targetOpacity = 0.15 + Math.random() * 0.5;
        this.color = Math.random() < 0.75 ? `rgba(255,107,0,` : `rgba(155,48,255,`;
      }
      update() {
        this.angle += this.speed;
        this.radius += this.radiusSpeed;
        this.opacity = Math.min(this.opacity + 0.008, this.targetOpacity);
        if (this.radius > this.maxRadius) {
          this.opacity -= 0.015;
          if (this.opacity <= 0) this.reset();
        }
        this.x = W * 0.5 + Math.cos(this.angle) * this.radius;
        this.y = H * 0.5 + Math.sin(this.angle) * this.radius;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.opacity + ')';
        ctx.fill();
      }
    }

    resize();
    particles = Array.from({ length: 140 }, () => new Particle());
    let animId;
    const loop = () => {
      ctx.fillStyle = 'rgba(8,8,8,0.2)';
      ctx.fillRect(0, 0, W, H);
      particles.forEach((p) => { p.update(); p.draw(); });
      animId = requestAnimationFrame(loop);
    };
    loop();

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  // ─── Autenticación (contraseñas hasheadas, mismo formato que Caja POS) ───
  const execLogin = async (e) => {
    e.preventDefault();
    if (!usersReady) {
      showToast('Cargando usuarios, intenta de nuevo en un segundo.', 'advertencia');
      return;
    }
    const email = loginEmail.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === email);
    if (!user) {
      showToast('Credenciales incorrectas.', 'error');
      return;
    }
    if (user.estado === 'bloqueado') {
      showToast('Cuenta bloqueada temporalmente.', 'error');
      return;
    }

    setLoginBusy(true);
    const ok = await verifyPassword(loginPass.trim(), user.salt, user.hash);
    setLoginBusy(false);

    if (!ok) {
      const nextAttempts = (user.failed_attempts || 0) + 1;
      const nextStatus = nextAttempts >= 5 ? 'bloqueado' : user.estado;
      const updatedUsers = users.map((u) =>
        u.email === user.email ? { ...u, failed_attempts: nextAttempts, estado: nextStatus } : u
      );
      setUsers(updatedUsers);
      safeSetJSON(USERS_KEY, updatedUsers);
      showToast(nextStatus === 'bloqueado' ? 'Cuenta bloqueada.' : 'Contraseña incorrecta.', 'error');
      return;
    }

    // Login correcto: resetea intentos fallidos
    const updatedUsers = users.map((u) =>
      u.email === user.email ? { ...u, failed_attempts: 0 } : u
    );
    setUsers(updatedUsers);
    safeSetJSON(USERS_KEY, updatedUsers);

    setCurrentUser(user);
    setModalAuthOpen(false);
    showToast('Sesión iniciada correctamente.', 'exito');
  };

  const execRegister = async (e) => {
    e.preventDefault();
    const email = regEmail.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === email)) {
      showToast('Correo ya registrado.', 'error');
      return;
    }
    if (regPass.length < 8) {
      showToast('Contraseña mínimo 8 caracteres.', 'advertencia');
      return;
    }

    setRegBusy(true);
    const { salt, hash } = await hashPassword(regPass.trim());
    setRegBusy(false);

    const newUser = normalizeUser({
      id: Date.now(),
      nombre: regName.trim() || 'Raver Customer',
      apellidos: regLastname.trim(),
      email,
      salt,
      hash,
      rol: 'cliente',
      estado: 'activo',
      fecha_creacion: new Date().toISOString().split('T')[0],
      failed_attempts: 0,
    });
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    safeSetJSON(USERS_KEY, updatedUsers);
    setCurrentUser(newUser);
    setModalAuthOpen(false);
    showToast('Cuenta creada correctamente.', 'exito');
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
    setFavorites([]);
    showToast('Sesión cerrada.', 'exito');
    setCurrentView('home');
  };

  // Favoritos
  const toggleFavorite = (id) => {
    if (!currentUser) {
      showToast('Debe iniciar sesión para continuar.', 'advertencia');
      setAuthMode('login');
      setModalAuthOpen(true);
      return;
    }
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((fId) => fId !== id));
      showToast('Eliminado de favoritos.', 'advertencia');
    } else {
      setFavorites([...favorites, id]);
      showToast('Agregado a favoritos.', 'exito');
    }
  };

  // Carrito con control de Stock Web (POS - Buffer)
  const addToCart = (productId) => {
    if (!currentUser) {
      showToast('Debe iniciar sesión para continuar.', 'advertencia');
      setAuthMode('login');
      setModalAuthOpen(true);
      return;
    }
    const product = products.find((p) => p.id === productId);
    const stockVal = product?.stock_actual ?? product?.stock ?? 0;
    const availableOnline = getOnlineStock(stockVal);

    if (!product || availableOnline === 0) {
      showToast('Producto agotado para venta online.', 'advertencia');
      return;
    }

    const existing = cart.find((i) => (i.product?.id || i.id) === productId);
    if (existing) {
      if (existing.quantity + 1 > availableOnline) {
        showToast('Stock máximo disponible en web alcanzado.', 'advertencia');
        return;
      }
      setCart(cart.map((i) => ((i.product?.id || i.id) === productId ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    showToast('Producto agregado al carrito.', 'exito');
  };

  const updateCartQty = (productId, delta) => {
    const item = cart.find((i) => (i.product?.id || i.id) === productId);
    if (!item) return;

    const nextQty = item.quantity + delta;
    const itemPosStock = item.product?.stock_actual ?? item.product?.stock ?? item.stock_actual ?? item.stock ?? 0;
    const availableOnline = getOnlineStock(itemPosStock);

    if (nextQty > availableOnline) {
      showToast('Supera el stock disponible para web.', 'advertencia');
      return;
    }
    if (nextQty <= 0) {
      setCart(cart.filter((i) => (i.product?.id || i.id) !== productId));
    } else {
      setCart(cart.map((i) => ((i.product?.id || i.id) === productId ? { ...i, quantity: nextQty } : i)));
    }
  };

  const cartSubtotal = cart.reduce((sum, i) => sum + (i.product?.precio ?? i.product?.price ?? i.precio ?? i.price ?? 0) * (i.quantity ?? 1), 0);
  let cartDiscount = 0;
  if (appliedCoupon) {
    cartDiscount = appliedCoupon.type === 'porcentaje' ? Math.round(cartSubtotal * (appliedCoupon.value / 100)) : appliedCoupon.value;
  }
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount);

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    const coupons = [
      { code: 'RAVER10', type: 'porcentaje', value: 10 },
      { code: 'NEON5000', type: 'monto_fijo', value: 5000 }
    ];
    const found = coupons.find((c) => c.code === code);
    if (!found) {
      showToast('Cupón no válido.', 'advertencia');
      return;
    }
    setAppliedCoupon(found);
    showToast('Cupón aplicado con éxito.', 'exito');
  };

  // Checkout
  const openCheckout = () => {
    if (cart.length === 0) {
      showToast('El carrito está vacío.', 'advertencia');
      return;
    }
    setModalCartOpen(false);
    setModalCheckoutOpen(true);
  };

  const triggerWebpay = () => {
    for (let item of cart) {
      const pId = item.product?.id || item.id;
      const liveProd = products.find((p) => p.id === pId);
      const stockVal = liveProd?.stock_actual ?? liveProd?.stock ?? 0;
      const onlineAvail = getOnlineStock(stockVal);
      if (!liveProd || item.quantity > onlineAvail) {
        showToast(`Stock insuficiente en web para ${item.product?.nombre || item.product?.name || item.name}.`, 'advertencia');
        return;
      }
    }
    const orderNum = 'RVR-' + Math.floor(100000 + Math.random() * 900000);
    setPendingOrderNum(orderNum);
    setPendingOrderTotal(cartTotal + shippingCost);

    setModalCheckoutOpen(false);
    setModalWebpayOpen(true);
  };

  const processPaymentResult = (status) => {
    setModalWebpayOpen(false);
    if (status === 'aprobado') {
      const updatedProducts = products.map((p) => {
        const cartItem = cart.find((i) => (i.product?.id || i.id) === p.id);
        if (cartItem) {
          const currentStock = p.stock_actual ?? p.stock ?? 0;
          const nextStock = Math.max(0, currentStock - cartItem.quantity);
          return { ...p, stock_actual: nextStock, stock: nextStock };
        }
        return p;
      });

      setProducts(updatedProducts);
      safeSetJSON(PRODUCTS_KEY, updatedProducts);
      window.dispatchEvent(new Event('raver_products_updated'));

      const newOrder = {
        num: pendingOrderNum,
        date: new Date().toLocaleDateString('es-CL'),
        user: currentUser.email,
        userName: `${currentUser.nombre} ${currentUser.apellidos || ''}`.trim(),
        total: `$${formatCLP(pendingOrderTotal)}`,
        totalNum: pendingOrderTotal,
        status: 'pagado',
        items: [...cart]
      };

      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
      publishWebOrders(updatedOrders, newOrder);

      setCart([]);
      setAppliedCoupon(null);

      showToast('¡Pago exitoso y pedido registrado!', 'exito');
      setActiveBoleta(newOrder);
      setModalBoletaOpen(true);
      setCurrentView('orders');
    } else {
      showToast('Pago rechazado por Transbank.', 'error');
    }
  };

  // Filtrado de productos
  const query = (searchTerm || '').toLowerCase();
  const filteredProducts = products.filter((p) => {
    if (!p) return false;
    const nombre = (p.nombre || p.name || '').toLowerCase();
    const categoria = (p.categoria || p.category || '').toLowerCase();
    const sku = (p.SKU || p.sku || '').toLowerCase();

    const matchesQuery = nombre.includes(query) || categoria.includes(query) || sku.includes(query);
    const matchesCat = selectedCats.length === 0 || selectedCats.includes(p.categoria || p.category);
    const stockVal = p.stock_actual ?? p.stock ?? 0;
    const onlineStock = getOnlineStock(stockVal);
    const matchesStock = !stockOnly || onlineStock > 0;

    return matchesQuery && matchesCat && matchesStock;
  });

  const CATEGORIES = ['Mascarillas', 'Poleras', 'Polerones', 'Cortavientos', 'Pantalones', 'Zapatillas', 'Lentes de Sol', 'Accesorios'];

  return (
    <div className="bg-[#080808] text-[#F0EDE8] font-['Rajdhani'] min-h-screen relative overflow-x-hidden pb-8">
      {/* Botón HUB RAVER */}
      <a
        href="/"
        onClick={(e) => {
          if (onReturnHub) {
            e.preventDefault();
            onReturnHub();
          }
        }}
        title="Volver al Panel Unificado RAVER"
        style={{
          position: 'fixed',
          bottom: '18px',
          left: '18px',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '9px 14px',
          background: 'rgba(13,13,13,0.92)',
          border: '1px solid rgba(255,107,0,0.45)',
          borderRadius: '2px',
          color: '#FF6B00',
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textDecoration: 'none',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 0 16px rgba(255,107,0,0.18)',
          textTransform: 'uppercase',
          cursor: 'pointer'
        }}
      >
        ◆ HUB RAVER
      </a>

      {/* Canvas Vortex Background */}
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" />

      <style>{`
        .glitch-title {
          position: relative;
          display: inline-block;
          color: #F0EDE8;
          text-shadow: 0 0 12px rgba(255,107,0,0.5), 0 0 2px rgba(255,255,255,0.8);
        }
        .glitch-title::before,
        .glitch-title::after {
          content: attr(data-text);
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: transparent;
        }
        .glitch-title::before {
          color: #00f0ff;
          mix-blend-mode: screen;
          animation: glitchBefore 4.5s infinite steps(1, end);
        }
        .glitch-title::after {
          color: #ff0055;
          mix-blend-mode: screen;
          animation: glitchAfter 4.5s infinite steps(1, end);
        }
        @keyframes glitchBefore {
          0%, 91%, 100% { clip-path: inset(0 0 0 0); transform: translate(0,0); }
          92% { clip-path: inset(8% 0 68% 0);  transform: translate(-4px, 0); }
          93% { clip-path: inset(58% 0 12% 0); transform: translate(3px, 1px); }
          94% { clip-path: inset(25% 0 45% 0); transform: translate(-3px, 0); }
          95% { clip-path: inset(0 0 0 0);     transform: translate(0,0); }
          97% { clip-path: inset(40% 0 30% 0); transform: translate(4px, -1px); }
          98% { clip-path: inset(0 0 0 0);     transform: translate(0,0); }
        }
        @keyframes glitchAfter {
          0%, 89%, 100% { clip-path: inset(0 0 0 0); transform: translate(0,0); }
          90% { clip-path: inset(70% 0 6% 0);  transform: translate(4px, 0); }
          91% { clip-path: inset(15% 0 60% 0); transform: translate(-4px, 0); }
          92% { clip-path: inset(45% 0 20% 0); transform: translate(3px, -1px); }
          93% { clip-path: inset(0 0 0 0);     transform: translate(0,0); }
          96% { clip-path: inset(20% 0 55% 0); transform: translate(-3px, 1px); }
          97% { clip-path: inset(0 0 0 0);     transform: translate(0,0); }
        }

        .carousel-fade { transition: opacity 0.7s ease-in-out; }

        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          animation: tickerScroll 25s linear infinite;
        }
      `}</style>

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`font-['Share_Tech_Mono'] text-xs tracking-wider px-4 py-3 shadow-[0_0_15px_rgba(0,0,0,0.8)] flex items-center gap-2 ${
              t.type === 'exito'
                ? 'bg-[#002211] text-[#00ff66] border border-[#00ff66]'
                : t.type === 'advertencia'
                ? 'bg-[#221c00] text-[#ffcc00] border border-[#ffcc00]'
                : 'bg-[#220008] text-[#ff0055] border border-[#ff0055]'
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>

      {/* Navbar Header */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-between items-center px-10 py-4 border-b border-[#FF6B00]/20 bg-[#080808]/92 backdrop-blur-md">
        <a className="font-['Orbitron'] text-lg font-black tracking-widest text-[#F0EDE8] cursor-pointer" onClick={() => setCurrentView('home')}>
          RAVER<span className="text-[#FF6B00]">◆</span>STYLE
        </a>
        <ul className="flex gap-7 list-none items-center font-['Share_Tech_Mono'] text-xs tracking-widest text-[#888]">
          <li>
            <button onClick={() => setCurrentView('catalog')} className="hover:text-[#FF6B00] transition-colors bg-transparent border-none cursor-pointer uppercase">
              Catálogo
            </button>
          </li>
          <li>
            <button onClick={() => setCurrentView('favorites')} className="hover:text-[#FF6B00] transition-colors bg-transparent border-none cursor-pointer uppercase flex items-center gap-1">
              Favoritos ❤️ <span className="bg-[#FF6B00] text-[#080808] px-1.5 py-0.5 font-bold text-[10px]">{favorites.length}</span>
            </button>
          </li>
          <li>
            <button onClick={() => setModalCartOpen(true)} className="hover:text-[#FF6B00] transition-colors bg-transparent border-none cursor-pointer uppercase flex items-center gap-1">
              Carrito 🛒 <span className="bg-[#FF6B00] text-[#080808] px-1.5 py-0.5 font-bold text-[10px]">{cart.reduce((a, b) => a + (b.quantity || 1), 0)}</span>
            </button>
          </li>
          <li>
            {currentUser ? (
              <div className="flex items-center gap-3">
                {currentUser.rol === 'administrador' && (
                  <button onClick={() => setCurrentView('administrador')} className="text-[#9B30FF] font-bold bg-transparent border-none cursor-pointer">
                    [ADMIN]
                  </button>
                )}
                <button onClick={() => setCurrentView('orders')} className="text-[#FF6B00] bg-transparent border-none cursor-pointer">
                  PERFIL: {currentUser.nombre}
                </button>
                <button onClick={logout} className="border border-[#888] text-[#F0EDE8] px-2.5 py-1 text-[10px] bg-transparent cursor-pointer hover:border-[#FF6B00] hover:text-[#FF6B00]">
                  SALIR
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setModalAuthOpen(true);
                }}
                className="font-['Share_Tech_Mono'] text-[11px] tracking-widest text-[#FF6B00] border border-[#FF6B00] px-4 py-2 uppercase bg-transparent cursor-pointer hover:bg-[#FF6B00] hover:text-[#080808] transition-all"
              >
                Ingresar
              </button>
            )}
          </li>
        </ul>
      </nav>

      {/* VIEWS MAIN */}
      <main className="relative z-[2]">
        {/* HOME VIEW (Unificada) */}
        {currentView === 'home' && (
          <div className="pt-[90px] min-h-[80vh]">
            <section className="min-h-[80vh] flex flex-col justify-center items-center text-center px-4">
              <div className="font-['Share_Tech_Mono'] text-xs tracking-[0.5em] text-[#FF6B00] uppercase mb-6">// CYBERPUNK · ELECTRONIC · FUTURE //</div>
              <h1 className="font-['Orbitron'] text-6xl md:text-8xl font-black leading-none tracking-tight">
                <span className="glitch-title" data-text="RAVER">RAVER</span>
                <span className="block text-transparent [-webkit-text-stroke:1px_#FF6B00] text-[0.55em] tracking-[0.3em] mt-2">STYLE</span>
              </h1>
              <p className="font-['Share_Tech_Mono'] tracking-[0.3em] text-[#888] my-6">DISEÑO · TECNOLOGÍA · ACTITUD URBANA</p>

              <HeroCarousel
                slides={CATEGORY_SLIDES}
                onSelectCategory={(cat) => {
                  setSelectedCats([cat]);
                  setCurrentView('catalog');
                }}
              />
              <div className="flex gap-4 mt-4 mb-8">
                <button
                  onClick={() => setCurrentView('catalog')}
                  className="font-['Share_Tech_Mono'] text-xs tracking-[0.2em] uppercase text-[#080808] bg-[#FF6B00] border-none px-7 py-3 cursor-pointer hover:bg-[#ff8533] transition-all font-bold"
                >
                  Explorar Catálogo
                </button>
              </div>
            </section>

            <TickerBar />
          </div>
        )}

        {/* CATALOG VIEW */}
        {currentView === 'catalog' && (
          <div className="pt-[110px] max-w-[1300px] mx-auto px-6">
            <h2 className="font-['Orbitron'] text-3xl font-bold mb-6">CATÁLOGO <span className="text-[#FF6B00]">URBANO</span></h2>
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
              {/* Filtros Lateral */}
              <aside className="bg-[#0d0d0d] border border-[#FF6B00]/25 p-6 h-fit">
                <div className="font-['Orbitron'] text-sm text-[#FF6B00] tracking-widest uppercase mb-4 border-b border-[#FF6B00]/25 pb-2">
                  Filtros
                </div>
                <div className="mb-4">
                  <label className="block font-['Share_Tech_Mono'] text-xs text-[#FF6B00] uppercase mb-1">Buscar</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nombre o SKU..."
                    className="w-full p-2.5 bg-[#111] border border-[#222] text-[#F0EDE8] outline-none focus:border-[#FF6B00]"
                  />
                </div>
                <div className="mb-4">
                  <label className="block font-['Share_Tech_Mono'] text-xs text-[#FF6B00] uppercase mb-2">Categorías</label>
                  <div className="flex flex-col gap-2 text-sm">
                    {CATEGORIES.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 text-[#888] cursor-pointer hover:text-[#F0EDE8]">
                        <input
                          type="checkbox"
                          checked={selectedCats.includes(cat)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedCats([...selectedCats, cat]);
                            else setSelectedCats(selectedCats.filter((c) => c !== cat));
                          }}
                          className="accent-[#FF6B00]"
                        />
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 font-['Share_Tech_Mono'] text-xs text-[#888] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stockOnly}
                      onChange={(e) => setStockOnly(e.target.checked)}
                      className="accent-[#FF6B00]"
                    />
                    Solo disponible en Web
                  </label>
                </div>
              </aside>

              {/* Grid de Productos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.length === 0 ? (
                  <p className="font-['Share_Tech_Mono'] text-[#888]">No se encontraron productos.</p>
                ) : (
                  filteredProducts.map((p) => {
                    const isFav = favorites.includes(p.id);
                    const stockVal = p.stock_actual ?? p.stock ?? 0;
                    const onlineStock = getOnlineStock(stockVal);

                    return (
                      <div key={p.id} className="bg-[#0d0d0d] border border-white/10 flex flex-col transition-all hover:border-[#FF6B00] hover:-translate-y-1">
                        <div className="h-[220px] bg-[#111] flex items-center justify-center relative border-b border-[#222] overflow-hidden">
                          {p.imagen ? (
                            <img
                              src={p.imagen}
                              alt={p.name || p.nombre}
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-5xl">{p.icon}</span>
                          )}

                          <button
                            onClick={() => toggleFavorite(p.id)}
                            className={`absolute top-2.5 left-2.5 bg-black/70 border ${
                              isFav ? 'border-[#FF6B00] text-[#FF6B00]' : 'border-[#222] text-white'
                            } w-8 h-8 flex items-center justify-center cursor-pointer transition-colors z-10`}
                          >
                            ❤️
                          </button>

                          <span
                            className={`absolute top-2.5 right-2.5 font-['Share_Tech_Mono'] text-[10px] px-2 py-0.5 bg-black/80 border ${
                              onlineStock > 0 ? 'text-[#00ff66] border-[#00ff66]' : 'text-[#ff0055] border-[#ff0055]'
                            } z-10`}
                          >
                            {onlineStock > 0 ? `WEB STOCK: ${onlineStock}` : 'AGOTADO EN WEB'}
                          </span>
                        </div>

                        <div className="p-5 flex flex-col flex-1">
                          <div className="font-bold text-lg">{p.name || p.nombre}</div>
                          <div className="font-['Share_Tech_Mono'] text-xs text-[#888] my-1">
                            {p.category || p.categoria} // TALLA {p.size || p.talla || 'Única'}
                          </div>
                          <div className="font-['Orbitron'] text-xl text-[#FF6B00] font-bold mt-auto mb-4">
                            ${formatCLP(p.price ?? p.precio)}
                          </div>
                          <button
                            disabled={onlineStock === 0}
                            onClick={() => addToCart(p.id)}
                            className={`w-full font-['Share_Tech_Mono'] text-xs tracking-wider uppercase py-3 border-none cursor-pointer font-bold ${
                              onlineStock === 0 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#FF6B00] text-[#080808] hover:bg-[#ff8533]'
                            }`}
                          >
                            {onlineStock > 0 ? 'AGREGAR AL CARRITO' : 'AGOTADO EN WEB'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* FAVORITES VIEW */}
        {currentView === 'favorites' && (
          <div className="pt-[110px] max-w-[1200px] mx-auto px-6">
            <h2 className="font-['Orbitron'] text-3xl font-bold mb-6">MIS <span className="text-[#FF6B00]">FAVORITOS ❤️</span></h2>
            {favorites.length === 0 ? (
              <p className="font-['Share_Tech_Mono'] text-[#888]">No tienes productos guardados en tus favoritos.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.filter((p) => favorites.includes(p.id)).map((p) => {
                  const stockVal = p.stock_actual ?? p.stock ?? 0;
                  const onlineStock = getOnlineStock(stockVal);
                  return (
                    <div key={p.id} className="bg-[#0d0d0d] border border-white/10 flex flex-col p-5 relative">
                      <div className="h-[180px] bg-[#111] flex items-center justify-center text-5xl mb-4 border-b border-[#222]">
                        {p.icon}
                        <button
                          onClick={() => toggleFavorite(p.id)}
                          className="absolute top-4 right-4 text-xs bg-black/80 border border-[#FF6B00] text-[#FF6B00] px-2 py-1 cursor-pointer"
                        >
                          QUITAR
                        </button>
                      </div>
                      <div className="font-bold text-lg">{p.name || p.nombre}</div>
                      <div className="font-['Orbitron'] text-xl text-[#FF6B00] font-bold my-2">${formatCLP(p.price ?? p.precio)}</div>
                      <button
                        disabled={onlineStock === 0}
                        onClick={() => addToCart(p.id)}
                        className={`w-full font-['Share_Tech_Mono'] text-xs uppercase py-3 border-none cursor-pointer font-bold mt-auto ${
                          onlineStock === 0 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#FF6B00] text-[#080808] hover:bg-[#ff8533]'
                        }`}
                      >
                        {onlineStock > 0 ? 'AGREGAR AL CARRITO' : 'AGOTADO EN WEB'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ORDERS / PROFILE VIEW */}
        {currentView === 'orders' && (
          <div className="pt-[110px] max-w-[1000px] mx-auto px-6">
            <h2 className="font-['Orbitron'] text-3xl font-bold mb-6">MI <span className="text-[#FF6B00]">PERFIL Y PEDIDOS</span></h2>
            {currentUser ? (
              <div>
                <div className="bg-[#0d0d0d] border border-[#FF6B00]/30 p-5 mb-8 font-['Share_Tech_Mono'] text-sm space-y-1">
                  <div><strong>Nombre:</strong> {currentUser.nombre} {currentUser.apellidos}</div>
                  <div><strong>Email:</strong> {currentUser.email}</div>
                  <div><strong>Rol:</strong> <span className="uppercase">{currentUser.rol}</span></div>
                  <div><strong>Estado:</strong> <span className="text-[#00ff66] uppercase">{currentUser.estado}</span></div>
                </div>

                <h3 className="font-['Orbitron'] text-xl mb-4 text-[#FF6B00]">HISTORIAL DE COMPRAS</h3>
                {orders.filter((o) => o.user === currentUser.email).length === 0 ? (
                  <p className="font-['Share_Tech_Mono'] text-[#888]">Aún no registras pedidos realizados.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {orders.filter((o) => o.user === currentUser.email).map((o, idx) => (
                      <div key={idx} className="bg-[#0d0d0d] border border-white/10 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="font-['Orbitron'] text-[#FF6B00] font-bold text-lg">{o.num}</div>
                          <div className="font-['Share_Tech_Mono'] text-xs text-[#888]">Fecha: {o.date} | Estado: <span className="text-[#00ff66]">{o.status}</span></div>
                          <div className="mt-2 text-xs text-[#ccc] space-y-1">
                            {o.items?.map((it, i) => (
                              <div key={i}>• {it.quantity}x {it.product?.nombre || it.product?.name || it.nombre || it.name}</div>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-['Orbitron'] text-xl font-bold text-[#F0EDE8]">{o.total}</div>
                          <button
                            onClick={() => { setActiveBoleta(o); setModalBoletaOpen(true); }}
                            className="mt-2 font-['Share_Tech_Mono'] text-xs text-[#FF6B00] border border-[#FF6B00] px-3 py-1 bg-transparent cursor-pointer hover:bg-[#FF6B00] hover:text-black transition-colors"
                          >
                            Ver Boleta
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="font-['Share_Tech_Mono'] text-[#888]">Inicia sesión para revisar tu información y pedidos.</p>
            )}
          </div>
        )}

        {/* ADMIN VIEW */}
        {currentView === 'administrador' && currentUser?.rol === 'administrador' && (
          <div className="pt-[110px] max-w-[1200px] mx-auto px-6">
            <h2 className="font-['Orbitron'] text-3xl font-bold mb-6">PANEL <span className="text-[#9B30FF]">ADMINISTRADOR</span></h2>
            <div className="bg-[#0d0d0d] border border-[#9B30FF]/40 p-6">
              <h3 className="font-['Orbitron'] text-lg text-[#9B30FF] mb-4">Registro Global de Pedidos Web ({orders.length})</h3>
              {orders.length === 0 ? (
                <p className="font-['Share_Tech_Mono'] text-[#888]">No hay órdenes registradas.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-['Share_Tech_Mono'] text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#333] text-[#FF6B00]">
                        <th className="p-2">N° Pedido</th>
                        <th className="p-2">Fecha</th>
                        <th className="p-2">Cliente</th>
                        <th className="p-2">Total</th>
                        <th className="p-2">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o, idx) => (
                        <tr key={idx} className="border-b border-[#222] hover:bg-[#151515]">
                          <td className="p-2 font-bold">{o.num}</td>
                          <td className="p-2 text-[#888]">{o.date}</td>
                          <td className="p-2">{o.userName || o.user}</td>
                          <td className="p-2 text-[#00ff66]">{o.total}</td>
                          <td className="p-2 uppercase">{o.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      {/* Auth Modal */}
      {modalAuthOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[500] flex items-center justify-center p-4">
          <div className="bg-[#0d0d0d] border border-[#FF6B00] p-6 max-w-md w-full relative">
            <button onClick={() => setModalAuthOpen(false)} className="absolute top-4 right-4 text-[#888] hover:text-white bg-transparent border-none cursor-pointer">✕</button>
            <div className="flex gap-4 mb-6 border-b border-[#222]">
              <button
                onClick={() => setAuthMode('login')}
                className={`pb-2 font-['Orbitron'] text-sm uppercase bg-transparent border-none cursor-pointer ${authMode === 'login' ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]' : 'text-[#888]'}`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`pb-2 font-['Orbitron'] text-sm uppercase bg-transparent border-none cursor-pointer ${authMode === 'register' ? 'text-[#FF6B00] border-b-2 border-[#FF6B00]' : 'text-[#888]'}`}
              >
                Registrarse
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={execLogin} className="flex flex-col gap-4 font-['Share_Tech_Mono']">
                <div>
                  <label className="block text-xs text-[#888] mb-1">Email</label>
                  <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="w-full p-2 bg-[#111] border border-[#333] text-white outline-none focus:border-[#FF6B00]" />
                </div>
                <div>
                  <label className="block text-xs text-[#888] mb-1">Contraseña</label>
                  <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} required className="w-full p-2 bg-[#111] border border-[#333] text-white outline-none focus:border-[#FF6B00]" />
                </div>
                <button type="submit" disabled={loginBusy} className="bg-[#FF6B00] text-black font-bold py-2.5 mt-2 border-none cursor-pointer hover:bg-[#ff8533] disabled:opacity-50">
                  {loginBusy ? 'VERIFICANDO...' : 'INGRESAR'}
                </button>
              </form>
            ) : (
              <form onSubmit={execRegister} className="flex flex-col gap-3 font-['Share_Tech_Mono']">
                <div>
                  <label className="block text-xs text-[#888] mb-1">Nombre</label>
                  <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} required className="w-full p-2 bg-[#111] border border-[#333] text-white outline-none focus:border-[#FF6B00]" />
                </div>
                <div>
                  <label className="block text-xs text-[#888] mb-1">Apellido</label>
                  <input type="text" value={regLastname} onChange={(e) => setRegLastname(e.target.value)} className="w-full p-2 bg-[#111] border border-[#333] text-white outline-none focus:border-[#FF6B00]" />
                </div>
                <div>
                  <label className="block text-xs text-[#888] mb-1">Email</label>
                  <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required className="w-full p-2 bg-[#111] border border-[#333] text-white outline-none focus:border-[#FF6B00]" />
                </div>
                <div>
                  <label className="block text-xs text-[#888] mb-1">Contraseña (Mín. 8 caracteres)</label>
                  <input type="password" value={regPass} onChange={(e) => setRegPass(e.target.value)} required className="w-full p-2 bg-[#111] border border-[#333] text-white outline-none focus:border-[#FF6B00]" />
                </div>
                <button type="submit" disabled={regBusy} className="bg-[#FF6B00] text-black font-bold py-2.5 mt-2 border-none cursor-pointer hover:bg-[#ff8533] disabled:opacity-50">
                  {regBusy ? 'CREANDO...' : 'CREAR CUENTA'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {modalCartOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[500] flex items-center justify-center p-4">
          <div className="bg-[#0d0d0d] border border-[#FF6B00] p-6 max-w-lg w-full relative max-h-[85vh] flex flex-col">
            <button onClick={() => setModalCartOpen(false)} className="absolute top-4 right-4 text-[#888] hover:text-white bg-transparent border-none cursor-pointer">✕</button>
            <h3 className="font-['Orbitron'] text-xl text-[#FF6B00] mb-4">CARRITO DE COMPRAS</h3>

            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
              {cart.length === 0 ? (
                <p className="font-['Share_Tech_Mono'] text-[#888]">El carrito está vacío.</p>
              ) : (
                cart.map((item) => {
                  const prod = item.product || item;
                  const pId = prod.id;
                  return (
                    <div key={pId} className="flex justify-between items-center bg-[#111] p-3 border border-[#222]">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{prod.icon}</span>
                        <div>
                          <div className="font-bold text-sm">{prod.name || prod.nombre}</div>
                          <div className="text-xs text-[#FF6B00] font-['Orbitron']">${formatCLP(prod.price ?? prod.precio)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 font-['Share_Tech_Mono']">
                        <button onClick={() => updateCartQty(pId, -1)} className="bg-[#222] text-white w-6 h-6 border-none cursor-pointer font-bold">-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateCartQty(pId, 1)} className="bg-[#222] text-white w-6 h-6 border-none cursor-pointer font-bold">+</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#222]">
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="CUPÓN (ej: RAVER10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="p-2 bg-[#111] border border-[#333] text-white text-xs flex-1 uppercase outline-none focus:border-[#FF6B00]"
                  />
                  <button onClick={applyCoupon} className="bg-[#222] text-[#FF6B00] border border-[#FF6B00] px-3 text-xs font-bold cursor-pointer hover:bg-[#FF6B00] hover:text-black">
                    APLICAR
                  </button>
                </div>

                <div className="font-['Share_Tech_Mono'] text-xs flex flex-col gap-1 mb-4">
                  <div className="flex justify-between text-[#888]"><span>Subtotal:</span><span>${formatCLP(cartSubtotal)}</span></div>
                  {cartDiscount > 0 && <div className="flex justify-between text-[#00ff66]"><span>Descuento:</span><span>-${formatCLP(cartDiscount)}</span></div>}
                  <div className="flex justify-between text-base font-bold text-[#F0EDE8] mt-1 pt-1 border-t border-[#333]"><span>Total:</span><span className="text-[#FF6B00] font-['Orbitron']">${formatCLP(cartTotal)}</span></div>
                </div>

                <button onClick={openCheckout} className="w-full bg-[#FF6B00] text-black font-bold py-3 font-['Share_Tech_Mono'] tracking-wider border-none cursor-pointer hover:bg-[#ff8533]">
                  PROCEDER AL PAGO
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {modalCheckoutOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[500] flex items-center justify-center p-4">
          <div className="bg-[#0d0d0d] border border-[#FF6B00] p-6 max-w-md w-full relative">
            <button onClick={() => setModalCheckoutOpen(false)} className="absolute top-4 right-4 text-[#888] hover:text-white bg-transparent border-none cursor-pointer">✕</button>
            <h3 className="font-['Orbitron'] text-xl text-[#FF6B00] mb-4">RESUMEN DE COMPRA</h3>
            <div className="font-['Share_Tech_Mono'] text-xs flex flex-col gap-2 mb-6 bg-[#111] p-4 border border-[#222]">
              <div className="flex justify-between"><span>Productos ({cart.reduce((a, b) => a + b.quantity, 0)}):</span><span>${formatCLP(cartTotal)}</span></div>
              <div className="flex justify-between"><span>Despacho Domicilio:</span><span>${formatCLP(shippingCost)}</span></div>
              <div className="flex justify-between text-sm font-bold text-[#FF6B00] pt-2 border-t border-[#333]"><span>TOTAL A PAGAR:</span><span>${formatCLP(cartTotal + shippingCost)}</span></div>
            </div>
            <button onClick={triggerWebpay} className="w-full bg-[#000000] text-[#00ff66] border border-[#00ff66] font-bold py-3 font-['Share_Tech_Mono'] tracking-wider cursor-pointer hover:bg-[#00ff66] hover:text-black transition-colors">
              PAGAR CON WEBPAY PLUS 💳
            </button>
          </div>
        </div>
      )}

      {/* Webpay Simulation Modal */}
      {modalWebpayOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[600] flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#FF6B00] p-6 max-w-sm w-full text-center">
            <div className="text-3xl mb-2">💳</div>
            <h3 className="font-['Orbitron'] text-lg text-white mb-2">PASARELA WEBPAY PLUS</h3>
            <p className="font-['Share_Tech_Mono'] text-xs text-[#888] mb-4">Pedido: {pendingOrderNum}<br />Monto: ${formatCLP(pendingOrderTotal)} CLP</p>
            <div className="flex flex-col gap-3 font-['Share_Tech_Mono'] text-xs">
              <button onClick={() => processPaymentResult('aprobado')} className="bg-[#00ff66] text-black font-bold py-2.5 border-none cursor-pointer hover:bg-[#33ff88]">
                SIMULAR PAGO APROBADO
              </button>
              <button onClick={() => processPaymentResult('rechazado')} className="bg-[#ff0055] text-white font-bold py-2.5 border-none cursor-pointer hover:bg-[#ff3377]">
                SIMULAR PAGO RECHAZADO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Boleta Modal */}
      {modalBoletaOpen && activeBoleta && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[500] flex items-center justify-center p-4">
          <div className="bg-[#0d0d0d] border border-[#00ff66] p-6 max-w-md w-full relative font-['Share_Tech_Mono']">
            <button onClick={() => setModalBoletaOpen(false)} className="absolute top-4 right-4 text-[#888] hover:text-white bg-transparent border-none cursor-pointer">✕</button>
            <div className="text-center border-b border-[#222] pb-4 mb-4">
              <div className="font-['Orbitron'] font-bold text-lg text-[#00ff66]">RAVER STYLE CHILE</div>
              <div className="text-xs text-[#888]">BOLETA ELECTRÓNICA DE VENTA</div>
              <div className="text-xs text-[#FF6B00] mt-1">N° {activeBoleta.num}</div>
            </div>
            <div className="text-xs space-y-1 mb-4 text-[#ccc]">
              <div>Fecha: {activeBoleta.date}</div>
              <div>Cliente: {activeBoleta.userName || activeBoleta.user}</div>
            </div>
            <div className="border-t border-b border-[#222] py-3 my-3 space-y-2 text-xs">
              {activeBoleta.items?.map((it, i) => {
                const name = it.product?.nombre || it.product?.name || it.nombre || it.name || 'Producto';
                const price = Number(it.product?.precio ?? it.product?.price ?? it.precio ?? it.price ?? 0);
                const qty = Number(it.quantity ?? it.cantidad ?? 1);

                return (
                  <div key={i} className="flex justify-between">
                    <span>{qty}x {name}</span>
                    <span>${formatCLP(price * qty)}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-sm font-bold text-[#00ff66] mt-4">
              <span>TOTAL PAGADO:</span>
              <span>{activeBoleta.total}</span>
            </div>
            <button onClick={() => window.print()} className="w-full mt-6 bg-[#222] text-[#00ff66] border border-[#00ff66] py-2 text-xs cursor-pointer hover:bg-[#00ff66] hover:text-black">
              IMPRIMIR BOLETA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}