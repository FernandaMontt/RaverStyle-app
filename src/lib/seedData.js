export const DEFAULT_USERS_PLAIN = [
  { id: 1, nombre: 'Jonathan', apellidos: 'Arevalo', email: 'cajero@raver.cl', password: '123', rol: 'cajero', estado: 'activo', fecha_creacion: '2026-01-10', failed_attempts: 0 },
  { id: 2, nombre: 'Diego', apellidos: 'Soto', email: 'inventario@raver.cl', password: '123', rol: 'encargado_inventario', estado: 'activo', fecha_creacion: '2026-01-12', failed_attempts: 0 },
  { id: 3, nombre: 'Fernanda', apellidos: 'Montt', email: 'admin@raver.cl', password: '123', rol: 'administrador', estado: 'activo', fecha_creacion: '2026-01-01', failed_attempts: 0 },
  { id: 4, nombre: 'Alex', apellidos: 'Vortex', email: 'cliente@raver.cl', password: '12345678', rol: 'cliente', estado: 'activo', fecha_creacion: '2026-01-15', failed_attempts: 0 },
];

export const DEFAULT_PRODUCTS = [
  // Mascarillas
  { id: 101, SKU: 'RS-MSK-CYB-V1', nombre: 'Mascarilla Cyber V1', descripcion: 'Mascarilla de protección estilo cyberpunk con visor frontal', categoria: 'Mascarillas', talla: 'Ajustable', color: 'Negro + Naranja', precio: 19990, stock_actual: 10, stock_minimo: 3, estado: 'activo', icon: '🥽', imagen: '/vestuario/Mascarilla Cyber V1.png' },
  { id: 102, SKU: 'RS-MSK-CYB-V2', nombre: 'Mascarilla Cyber V2', descripcion: 'Mascarilla táctica futurista transpirable', categoria: 'Mascarillas', talla: 'Ajustable', color: 'Negro + Blanco', precio: 18990, stock_actual: 8, stock_minimo: 3, estado: 'activo', icon: '🥽', imagen: '/vestuario/Mascarilla Cyber V2.png' },
  { id: 103, SKU: 'RS-MSK-CYB-V3', nombre: 'Mascarilla Cyber V3', descripcion: 'Diseño rígido mate estilo cyberpunk', categoria: 'Mascarillas', talla: 'Ajustable', color: 'Negro Mate', precio: 21990, stock_actual: 6, stock_minimo: 2, estado: 'activo', icon: '🥽', imagen: '/vestuario/Mascarilla Cyber V3.png' },
  { id: 104, SKU: 'RS-MSK-CYB-V4', nombre: 'Mascarilla Cyber V4', descripcion: 'Filtro removible y tiras ajustables reforzadas', categoria: 'Mascarillas', talla: 'Ajustable', color: 'Negro + Gris', precio: 16990, stock_actual: 12, stock_minimo: 4, estado: 'activo', icon: '🥽', imagen: '/vestuario/Mascarilla Cyber V4.png' },
  { id: 105, SKU: 'RS-MSK-CYB-V5', nombre: 'Mascarilla Cyber V5 Visor', descripcion: 'Visor panorámico iridiscente reflectante', categoria: 'Mascarillas', talla: 'Ajustable', color: 'Reflectante', precio: 23990, stock_actual: 5, stock_minimo: 2, estado: 'activo', icon: '🥽', imagen: '/vestuario/Mascarilla Cyber V5.png' },
  { id: 106, SKU: 'RS-MSK-TAC-PRO', nombre: 'Mascarilla Tactic Pro', descripcion: 'Construcción militar ligera con doble filtro', categoria: 'Mascarillas', talla: 'Ajustable', color: 'Negro Táctico', precio: 17990, stock_actual: 9, stock_minimo: 3, estado: 'activo', icon: '😷', imagen: '/vestuario/Mascarilla Tactic Pro.png' },
  { id: 107, SKU: 'RS-MSK-TAC-CAMO', nombre: 'Mascarilla Tactic Camo', descripcion: 'Estampado camuflaje urbano en tonalidades oscuras', categoria: 'Mascarillas', talla: 'Ajustable', color: 'Camo Negro', precio: 16990, stock_actual: 7, stock_minimo: 2, estado: 'activo', icon: '😷', imagen: '/vestuario/Mascarilla Tactic Camo.png' },
  { id: 108, SKU: 'RS-MSK-LED-NEON', nombre: 'Mascarilla LED Neon', descripcion: 'Iluminación LED integradas con patrón electro', categoria: 'Mascarillas', talla: 'Ajustable', color: 'Azul Neon', precio: 22990, stock_actual: 11, stock_minimo: 3, estado: 'activo', icon: '⚡', imagen: '/vestuario/Mascarilla LED Neon.png' },
  { id: 109, SKU: 'RS-MSK-LED-PULSE', nombre: 'Mascarilla LED Pulse', descripcion: 'Responde al ritmo de la música con luz púrpura', categoria: 'Mascarillas', talla: 'Ajustable', color: 'Morado Glow', precio: 22990, stock_actual: 8, stock_minimo: 3, estado: 'activo', icon: '⚡', imagen: '/vestuario/Mascarilla LED Pulse.png' },
  { id: 110, SKU: 'RS-MSK-SAM-KAI', nombre: 'Mascarilla Samurai Kai', descripcion: 'Máscara Mengu de fibra de carbono ligera', categoria: 'Mascarillas', talla: 'Ajustable', color: 'Negro', precio: 24990, stock_actual: 6, stock_minimo: 2, estado: 'activo', icon: '👺', imagen: '/vestuario/Mascarilla Samurai Kai.png' },
  { id: 111, SKU: 'RS-MSK-SAM-DRK', nombre: 'Mascarilla Samurai Dark', descripcion: 'Diseño Oni tradicional en acabado mate', categoria: 'Mascarillas', talla: 'Ajustable', color: 'Negro Mate', precio: 26990, stock_actual: 4, stock_minimo: 2, estado: 'activo', icon: '👺', imagen: '/vestuario/Mascarilla Samurai Dark.png' },
  { id: 112, SKU: 'RS-MSK-SAM-BLD', nombre: 'Mascarilla Samurai Blood', descripcion: 'Detalles en rojo neón impresos en relieve 3D', categoria: 'Mascarillas', talla: 'Ajustable', color: 'Negro + Rojo', precio: 26990, stock_actual: 5, stock_minimo: 2, estado: 'activo', icon: '👺', imagen: '/vestuario/Mascarilla Samurai Blood.png' },

  // Poleras
  { id: 201, SKU: 'RS-TEE-MEN-01', nombre: 'Raver Tech Tee (Hombre)', descripcion: 'Polera oversize en algodón de 240g con estampados reflectantes', categoria: 'Poleras', talla: 'L', color: 'Negro + Naranja', precio: 22990, stock_actual: 15, stock_minimo: 5, estado: 'activo', icon: '👕', imagen: '/vestuario/Raver Tech Tee Hombre.png' },
  { id: 202, SKU: 'RS-TEE-WM-01', nombre: 'Raver Fit Tee (Mujer)', descripcion: 'Corte semi-fitted con detalles de circuitos reactivos a la luz UV', categoria: 'Poleras', talla: 'M', color: 'Negro Mate + Glow', precio: 19990, stock_actual: 12, stock_minimo: 4, estado: 'activo', icon: '👕', imagen: '/vestuario/Raver Tech Tee Mujer.png' },

  // Polerones y Cortavientos
  { id: 301, SKU: 'RS-HD-CYBARMOR', nombre: 'Cyber Armor Hoodie', descripcion: 'Polerón pesado con capucha y bordados técnicos de neón', categoria: 'Polerones', talla: 'XL', color: 'Negro + Naranja Glow', precio: 39990, stock_actual: 7, stock_minimo: 3, estado: 'activo', icon: '🧥', imagen: '/vestuario/Cyber Armor Hoodie Hombre.png' },
  { id: 302, SKU: 'RS-HD-NEONPULSE', nombre: 'Neon Pulse Hoodie', descripcion: 'Polerón oversize con gráfico Cyber Wave traseros', categoria: 'Polerones', talla: 'M', color: 'Negro + Morado Glow', precio: 38990, stock_actual: 6, stock_minimo: 2, estado: 'activo', icon: '🧥', imagen: '/vestuario/Cyber Armor Hoodie Mujer.png' },
  { id: 401, SKU: 'RS-CV-CYBARMOR', nombre: 'Cyber Armor Cortavientos', descripcion: 'Chaqueta rompevientos repelente al agua con bolsillos tácticos', categoria: 'Cortavientos', talla: 'L', color: 'Negro + Naranja', precio: 34990, stock_actual: 8, stock_minimo: 3, estado: 'activo', icon: '🧥', imagen: '/vestuario/Cyber Armor Cortavientos Hombre.png' },
  { id: 402, SKU: 'RS-CV-NEONPULSE', nombre: 'Neon Pulse Cortavientos Crop', descripcion: 'Chaqueta ligera con corte crop y cierre YKK reinforced', categoria: 'Cortavientos', talla: 'S', color: 'Negro + Morado', precio: 32990, stock_actual: 5, stock_minimo: 2, estado: 'activo', icon: '🧥', imagen: '/vestuario/Cyber Armor Cortavientos Mujer.png' },

  // Pantalones
  { id: 501, SKU: 'RS-PNT-TECH-MEN', nombre: 'Tech Cargo Pants', descripcion: 'Pantalones cargo con correas de ajuste y múltiples compartimentos', categoria: 'Pantalones', talla: '42', color: 'Negro Desgastado', precio: 36990, stock_actual: 9, stock_minimo: 3, estado: 'activo', icon: '👖', imagen: '/vestuario/Tech Cargo Pants Hombre.png' },
  { id: 502, SKU: 'RS-PNT-CYB-WM', nombre: 'Cyber Cargo Fit High Waist', descripcion: 'Pantalón tiro alto estilo techwear con ajustadores en tobillos', categoria: 'Pantalones', talla: '38', color: 'Negro', precio: 34990, stock_actual: 8, stock_minimo: 3, estado: 'activo', icon: '👖', imagen: '/vestuario/Tech Cargo Pants Mujer.png' },

  // Calzado
  { id: 601, SKU: 'RS-SNK-TECH', nombre: 'Raver Tech Sneakers LED', descripcion: 'Zapatillas de plataforma urbana con suela translúcida amortiguada', categoria: 'Zapatillas', talla: '41', color: 'Negro + Naranja Glow', precio: 59990, stock_actual: 10, stock_minimo: 3, estado: 'activo', icon: '👟', imagen: '/vestuario/zapatillas.png' },

  // Lentes de Sol
  { id: 701, SKU: 'RS-GLS-SPORT-BLK', nombre: 'Cyber Vision Glasses (Sport 180°)', descripcion: 'Lentes envolventes con protección UV400 y cristal ahumado', categoria: 'Lentes de Sol', talla: 'Única', color: 'Cyber Black', precio: 15990, stock_actual: 20, stock_minimo: 5, estado: 'activo', icon: '🕶️', imagen: '/vestuario/Cyber Vision Glasses (Sport 180°).png' },
  { id: 702, SKU: 'RS-GLS-SPORT-PUR', nombre: 'Cyber Vision Glasses Purple 180°', descripcion: 'Lentes de sol reflectantes tono púrpura espectro neón', categoria: 'Lentes de Sol', talla: 'Única', color: 'Cyber Purple', precio: 15990, stock_actual: 15, stock_minimo: 5, estado: 'activo', icon: '🕶️', imagen: '/vestuario/Cyber Vision Glasses Purple (Sport 180°).png' },
  { id: 703, SKU: 'RS-GLS-WAY-BLK', nombre: 'Cyber Vision Glasses (Wayfarer)', descripcion: 'Marco angular cyberpunk con patillas grabadas con láser', categoria: 'Lentes de Sol', talla: 'Única', color: 'Cyber Black', precio: 14990, stock_actual: 18, stock_minimo: 5, estado: 'activo', icon: '🕶️', imagen: '/vestuario/Cyber Vision Glasses (Wayfarer).png' },

  // Accesorios
  { id: 801, SKU: 'RS-BAG-LEG-ORG', nombre: 'Leg Utility Bag / Musera Tactical', descripcion: 'Bolso musera táctico de liberación rápida e impermeable', categoria: 'Accesorios', talla: 'Ajustable', color: 'Naranja Neón', precio: 18990, stock_actual: 14, stock_minimo: 4, estado: 'activo', icon: '🎒', imagen: '/vestuario/LegUtilityBag.png' },
  { id: 802, SKU: 'RS-BAG-BAN-BLK', nombre: 'Banano Raver Style YKK', descripcion: 'Banano cruzado de alta resistencia con cierres herméticos', categoria: 'Accesorios', talla: 'Ajustable', color: 'Negro', precio: 12990, stock_actual: 25, stock_minimo: 6, estado: 'activo', icon: '🎒', imagen: '/vestuario/Banano.png' },
  { id: 803, SKU: 'RS-ACC-BOTTLE', nombre: 'Porta Botella Táctico Holder', descripcion: 'Arnés porta caramañola compatible con sistema MOLLE', categoria: 'Accesorios', talla: 'Ajustable', color: 'Negro + Naranja', precio: 8990, stock_actual: 30, stock_minimo: 8, estado: 'activo', icon: '🧪', imagen: '/vestuario/Bottle Holder.png' },
  { id: 804, SKU: 'RS-ACC-GLOVES', nombre: 'Guantes Raver Tech Touchscreen', descripcion: 'Guantes tácticos sin dedos con parches antideslizantes', categoria: 'Accesorios', talla: 'L', color: 'Negro', precio: 11990, stock_actual: 12, stock_minimo: 4, estado: 'activo', icon: '🥊', imagen: '/vestuario/Guantes.png' }
];

export const DEFAULT_SETTINGS = {
  taxRate: 19,
  categories: ['Mascarillas', 'Poleras', 'Polerones', 'Cortavientos', 'Pantalones', 'Zapatillas', 'Lentes de Sol', 'Accesorios'],
  paymentMethods: ['efectivo', 'tarjeta_debito', 'tarjeta_credito'],
  storeName: 'RAVER STYLE',
  rut: '77.849.201-9',
  address: 'Av. Providencia 2124, Local 45, Santiago',
};

export const ROLES = [
  { value: 'cajero', label: 'Cajero' },
  { value: 'encargado_inventario', label: 'Encargado de Inventario' },
  { value: 'administrador', label: 'Administrador' },
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard Operativo', icon: 'fa-chart-pie', roles: ['administrador', 'encargado_inventario', 'cajero'], hidden: true },
  { id: 'tienda', label: 'Tienda Online', icon: 'fa-globe', roles: ['cajero', 'encargado_inventario', 'administrador'], hidden: true },
  { id: 'pos', label: 'Nueva Venta', icon: 'fa-cart-shopping', roles: ['cajero', 'administrador'], hidden: false },
  { id: 'caja', label: 'Gestión de Caja', icon: 'fa-vault', roles: ['cajero', 'administrador'], hidden: false },
  { id: 'productos', label: 'Catálogo Productos', icon: 'fa-shirt', roles: ['cajero', 'encargado_inventario', 'administrador'], hidden: false },
  { id: 'inventario', label: 'Mov. Inventario', icon: 'fa-boxes-stacked', roles: ['encargado_inventario', 'administrador', 'cajero'], hidden: false },
  { id: 'ventas', label: 'Historial Ventas', icon: 'fa-receipt', roles: ['cajero', 'administrador'], hidden: false },
  { id: 'devoluciones', label: 'Devoluciones', icon: 'fa-rotate-left', roles: ['cajero', 'administrador'], hidden: false },
  { id: 'reportes', label: 'Reportes y Stats', icon: 'fa-chart-pie', roles: ['administrador'], hidden: false },
  { id: 'usuarios', label: 'Usuarios y Roles', icon: 'fa-users-gear', roles: ['administrador'], hidden: false },
  { id: 'configuracion', label: 'Configuración', icon: 'fa-sliders', roles: ['administrador'], hidden: false },
];

export const VIEW_TITLES = {
  dashboard: 'Dashboard Operativo y Control de Métricas',
  tienda: 'Tienda Online E-Commerce',
  pos: 'Nueva Venta (Caja POS)',
  caja: 'Apertura, Movimientos y Arqueo de Caja',
  productos: 'Catálogo e Inventario de Productos',
  inventario: 'Registro de Movimientos de Inventario',
  ventas: 'Historial de Ventas y Comprobantes',
  devoluciones: 'Solicitudes y Aprobación de Devoluciones',
  reportes: 'Reportes y Métricas del Negocio',
  usuarios: 'Administración de Usuarios y Permisos',
  configuracion: 'Configuración Parámetros del Sistema',
};