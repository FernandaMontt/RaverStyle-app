import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { storeReducer, initialStoreState } from './storeReducer';
import { safeGetJSON, safeSetJSON } from '../lib/safeStorage';
import { hashPassword, verifyPassword } from '../lib/hash';
import { cleanText } from '../lib/validators';
import { DB_KEYS, SESSION_KEYS } from '../lib/dbKeys';
import { DEFAULT_USERS_PLAIN, DEFAULT_PRODUCTS, DEFAULT_SETTINGS } from '../lib/seedData';
import { publishPOSSales } from '../lib/raverBridge';
import { useToast } from './ToastContext';

const StoreContext = createContext(null);

const INACTIVITY_MS = 1800000; // 30 minutos

async function buildSeedUsers() {
  const withHash = await Promise.all(
    DEFAULT_USERS_PLAIN.map(async ({ password, ...rest }) => {
      const { salt, hash } = await hashPassword(password);
      return { ...rest, salt, hash };
    })
  );
  return withHash;
}

function actorLabelOf(user) {
  return user ? `${user.nombre} (${user.rol})` : 'Sistema';
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(storeReducer, initialStoreState);
  const showToast = useToast();
  const hydrated = useRef(false);
  const inactivityTimer = useRef(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // ─── Hidratación inicial ───
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 1. Usuarios
      const savedUsers = safeGetJSON(DB_KEYS.USERS, null);
      const users = (Array.isArray(savedUsers) && savedUsers.length > 0)
        ? savedUsers
        : (await buildSeedUsers());

      // 2. Productos (Asegura icono en productos existentes en localStorage)
      const savedProducts = safeGetJSON(DB_KEYS.PRODUCTS, null);
      const products = (Array.isArray(savedProducts) && savedProducts.length > 0)
        ? savedProducts.map((p) => {
            if (!p.icon) {
              const match = DEFAULT_PRODUCTS.find((dp) => dp.id === p.id || dp.SKU === p.SKU);
              return { ...p, icon: match?.icon || '👕' };
            }
            return p;
          })
        : DEFAULT_PRODUCTS;

      // 3. Historial y colecciones generales
      const sales = safeGetJSON(DB_KEYS.SALES, []);
      const saleDetails = safeGetJSON(DB_KEYS.SALE_DETAILS, []);
      const shifts = safeGetJSON(DB_KEYS.SHIFTS, []);
      const movements = safeGetJSON(DB_KEYS.MOVEMENTS, []);
      const refunds = safeGetJSON(DB_KEYS.REFUNDS, []);
      const settings = safeGetJSON(DB_KEYS.SETTINGS, null) || DEFAULT_SETTINGS;
      const logs = safeGetJSON(DB_KEYS.LOGS, []);

      // 4. Estado de sesión activa y carrito
      const currentUserId = safeGetJSON(SESSION_KEYS.CURRENT_USER_ID, null);
      const currentShiftId = safeGetJSON(SESSION_KEYS.CURRENT_SHIFT_ID, null);
      const cart = safeGetJSON(SESSION_KEYS.CART, []);

      if (cancelled) return;

      dispatch({
        type: 'HYDRATE',
        payload: {
          users,
          products,
          sales,
          saleDetails,
          shifts,
          movements,
          refunds,
          settings,
          logs,
          currentUserId,
          currentShiftId,
          cart,
        },
      });
      hydrated.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Persistencia por colección ───
  useEffect(() => {
    if (hydrated.current) safeSetJSON(DB_KEYS.USERS, state.users);
  }, [state.users]);
  useEffect(() => {
    if (hydrated.current) safeSetJSON(DB_KEYS.PRODUCTS, state.products);
  }, [state.products]);
  useEffect(() => {
    if (hydrated.current) safeSetJSON(DB_KEYS.SALES, state.sales);
  }, [state.sales]);
  useEffect(() => {
    if (hydrated.current) safeSetJSON(DB_KEYS.SALE_DETAILS, state.saleDetails);
  }, [state.saleDetails]);
  useEffect(() => {
    if (hydrated.current) safeSetJSON(DB_KEYS.SHIFTS, state.shifts);
  }, [state.shifts]);
  useEffect(() => {
    if (hydrated.current) safeSetJSON(DB_KEYS.MOVEMENTS, state.movements);
  }, [state.movements]);
  useEffect(() => {
    if (hydrated.current) safeSetJSON(DB_KEYS.REFUNDS, state.refunds);
  }, [state.refunds]);
  useEffect(() => {
    if (hydrated.current) safeSetJSON(DB_KEYS.SETTINGS, state.settings);
  }, [state.settings]);
  useEffect(() => {
    if (hydrated.current) safeSetJSON(DB_KEYS.LOGS, state.logs);
  }, [state.logs]);

  useEffect(() => {
    if (!hydrated.current) return;
    safeSetJSON(SESSION_KEYS.CURRENT_USER_ID, state.currentUserId);
    safeSetJSON(SESSION_KEYS.CURRENT_SHIFT_ID, state.currentShiftId);
    safeSetJSON(SESSION_KEYS.CART, state.cart);
  }, [state.currentUserId, state.currentShiftId, state.cart]);

  const currentUser = useMemo(() => state.users.find((u) => u.id === state.currentUserId) || null, [state.users, state.currentUserId]);
  const currentShift = useMemo(() => state.shifts.find((s) => s.id === state.currentShiftId) || null, [state.shifts, state.currentShiftId]);

  // ─── Cierre de sesión por inactividad (30 min) ───
  function resetInactivityTimer() {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      if (stateRef.current.currentUserId) {
        showToast('Su sesión ha expirado por inactividad (30 min). La caja permanece en su estado actual.', 'warning');
        logout(false);
      }
    }, INACTIVITY_MS);
  }

  useEffect(() => {
    resetInactivityTimer();
    const onActivity = () => resetInactivityTimer();
    window.addEventListener('mousemove', onActivity);
    window.addEventListener('keydown', onActivity);
    return () => {
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('keydown', onActivity);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Auth ───
  async function login(emailRaw, password) {
    const email = cleanText(emailRaw, 254).toLowerCase();
    const user = state.users.find((u) => u.email.toLowerCase() === email);

    if (!user) {
      showToast('Usuario o contraseña incorrectos.', 'error');
      return false;
    }
    if (user.estado === 'bloqueado') {
      showToast('Su cuenta está bloqueada.', 'error');
      return false;
    }

    const ok = await verifyPassword(password, user.salt, user.hash);
    if (!ok) {
      const attempts = (user.failed_attempts || 0) + 1;
      if (attempts >= 5) {
        dispatch({
          type: 'LOGIN_RESULT',
          userId: user.id,
          userPatch: { failed_attempts: attempts, estado: 'bloqueado' },
          logAccion: 'BLOQUEO_USUARIO',
          logDetalle: `Cuenta de ${user.email} bloqueada tras 5 intentos fallidos`,
          actorLabel: actorLabelOf(user),
        });
        showToast('Su cuenta está bloqueada.', 'error');
      } else {
        dispatch({ type: 'LOGIN_RESULT', userId: user.id, userPatch: { failed_attempts: attempts } });
        showToast(`Usuario o contraseña incorrectos. (Intento ${attempts}/5)`, 'error');
      }
      return false;
    }

    const activeShift = state.shifts.find((s) => s.cajero_id === user.id && s.estado === 'abierta');
    dispatch({
      type: 'LOGIN_SUCCESS',
      userId: user.id,
      shiftId: activeShift ? activeShift.id : null,
      detalle: `Inicio de sesión exitoso de ${user.email}`,
      actorLabel: actorLabelOf(user),
    });
    showToast('Bienvenido al sistema.', 'success');
    return true;
  }

  function logout(manual = true) {
    dispatch({ type: 'LOGOUT', detalle: currentUser ? `Cierre de sesión de ${currentUser.email}` : '', actorLabel: actorLabelOf(currentUser) });
    if (manual) showToast('Sesión cerrada correctamente.', 'success');
  }

  // ─── Carrito / POS ───
  const cartSubtotal = useMemo(
    () => state.cart.reduce((sum, i) => sum + (i.precio * i.cantidad - (i.descuento || 0)), 0),
    [state.cart]
  );
  const cartTotal = Math.max(0, cartSubtotal - (state.cartGlobalDiscount || 0));

  function addToCart(productId) {
    const prod = state.products.find((p) => p.id === productId);
    if (!prod) return;
    if (prod.estado !== 'activo') {
      showToast('Producto inactivo.', 'warning');
      return;
    }
    if (prod.stock_actual <= 0) {
      showToast('Stock insuficiente.', 'warning');
      return;
    }
    const existing = state.cart.find((i) => i.id === productId);
    if (existing && existing.cantidad + 1 > prod.stock_actual) {
      showToast('Stock insuficiente.', 'warning');
      return;
    }
    dispatch({
      type: 'ADD_TO_CART',
      item: { 
        id: prod.id, 
        SKU: prod.SKU, 
        nombre: prod.nombre, 
        talla: prod.talla, 
        precio: prod.precio, 
        cantidad: 1, 
        descuento: 0, 
        stock_actual: prod.stock_actual,
        icon: prod.icon || '👕',
        imagen: prod.imagen || ''
      },
    });
  }

  function updateCartQty(index, newQty) {
    if (newQty <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', index });
      return;
    }
    const item = state.cart[index];
    if (!item) return;
    if (newQty > item.stock_actual) {
      showToast('Stock insuficiente.', 'warning');
      return;
    }
    dispatch({ type: 'UPDATE_CART_QTY', index, qty: newQty });
  }

  function removeFromCart(index) {
    dispatch({ type: 'REMOVE_FROM_CART', index });
  }

  function clearCart() {
    dispatch({ type: 'CLEAR_CART' });
  }

  function setGlobalDiscount(amount) {
    dispatch({ type: 'SET_GLOBAL_DISCOUNT', amount: Math.max(0, amount) });
  }

  // ─── Caja / turnos ───
  function openShift(fondoInicial) {
    if (currentShift) {
      showToast('Caja ya abierta.', 'warning');
      return;
    }
    const now = new Date();
    const shift = {
      id: state.shifts.length + 1001,
      cajero_id: currentUser.id,
      estado: 'abierta',
      fondo_inicial: fondoInicial,
      fecha_apertura: now.toISOString().split('T')[0],
      hora_apertura: now.toLocaleTimeString('es-CL'),
      total_efectivo: 0,
      total_tarjetas: 0,
      total_ventas: 0,
    };
    dispatch({ type: 'OPEN_SHIFT', shift, detalle: `Turno #${shift.id} abierto con $${fondoInicial}`, actorId: currentUser.id, actorLabel: actorLabelOf(currentUser) });
    showToast('Caja abierta correctamente.', 'success');
  }

  function closeShift(declarado, observaciones) {
    if (!currentShift) return;
    const esperado = currentShift.fondo_inicial + (currentShift.total_efectivo || 0);
    const dif = declarado - esperado;
    const now = new Date();
    const patch = {
      estado: 'cerrada',
      fecha_cierre: now.toISOString().split('T')[0],
      hora_cierre: now.toLocaleTimeString('es-CL'),
      monto_declarado_arqueo: declarado,
      diferencia_arqueo: dif,
      observaciones,
    };
    dispatch({
      type: 'CLOSE_SHIFT',
      shiftId: currentShift.id,
      patch,
      detalle: `Turno #${currentShift.id} cerrado. Diferencia: $${dif}`,
      actorId: currentUser.id,
      actorLabel: actorLabelOf(currentUser),
    });
    showToast(dif !== 0 ? 'Existen diferencias en el arqueo.' : 'Caja cerrada.', dif !== 0 ? 'warning' : 'success');
  }

  function validateCartStock() {
    for (const item of state.cart) {
      const prod = state.products.find((p) => p.id === item.id);
      if (!prod || prod.stock_actual < item.cantidad) {
        showToast(`Stock insuficiente para ${item.nombre}.`, 'error');
        return false;
      }
    }
    return true;
  }

  /** Confirma el cobro: valida stock, descuenta inventario, registra venta y boleta. */
  function confirmPayment({ medioPago, montoRecibido }) {
    if (!currentShift) {
      showToast('Caja cerrada.', 'error');
      return null;
    }
    if (!validateCartStock()) return null;
    if (montoRecibido < cartTotal) {
      showToast('Pago rechazado. Monto recibido es menor al total.', 'error');
      return null;
    }

    const now = new Date();
    const saleNum = 'BOL-' + now.getFullYear() + '-' + String(Date.now()).slice(-6);
    const cartSnapshot = state.cart;

    const movements = [];
    const saleDetails = [];
    cartSnapshot.forEach((item) => {
      const prod = state.products.find((p) => p.id === item.id);
      const stockAnterior = prod.stock_actual;
      const stockNuevo = stockAnterior - item.cantidad;
      movements.push({
        id: Date.now() + Math.random(),
        producto_id: prod.id,
        tipo: 'venta',
        cantidad: -item.cantidad,
        stock_anterior: stockAnterior,
        stock_nuevo: stockNuevo,
        usuario_id: currentUser.id,
        fecha: now.toISOString(),
        observaciones: `Venta presencial ${saleNum}`,
        numero_venta_referencia: saleNum,
      });
      saleDetails.push({
        id: Date.now() + Math.random(),
        venta_num: saleNum,
        producto_id: prod.id,
        producto_nombre: prod.nombre,
        SKU: prod.SKU,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        descuento_item: item.descuento || 0,
        subtotal_item: item.precio * item.cantidad - (item.descuento || 0),
      });
    });

    const vuelto = medioPago === 'efectivo' ? Math.max(0, montoRecibido - cartTotal) : 0;
    const sale = {
      id: Date.now(),
      numero_venta: saleNum,
      cajero_id: currentUser.id,
      cajero_nombre: `${currentUser.nombre} ${currentUser.apellidos}`,
      caja_id: currentShift.id,
      estado: 'confirmada',
      subtotal: cartTotal + (state.cartGlobalDiscount || 0),
      descuento: state.cartGlobalDiscount || 0,
      total: cartTotal,
      medio_pago: medioPago,
      monto_recibido: montoRecibido,
      vuelto,
      fecha: now.toISOString().split('T')[0],
      hora: now.toLocaleTimeString('es-CL'),
    };

    const shiftPatch = {
      total_ventas: (currentShift.total_ventas || 0) + cartTotal,
      total_efectivo: (currentShift.total_efectivo || 0) + (medioPago === 'efectivo' ? cartTotal : 0),
      total_tarjetas: (currentShift.total_tarjetas || 0) + (medioPago !== 'efectivo' ? cartTotal : 0),
    };

    dispatch({
      type: 'CONFIRM_SALE',
      sale,
      movements,
      saleDetails,
      shiftPatch,
      detalle: `Boleta ${saleNum} generada por $${cartTotal}`,
      actorId: currentUser.id,
      actorLabel: actorLabelOf(currentUser),
    });
    showToast('Venta registrada correctamente.', 'success');

    publishPOSSales([sale, ...state.sales], sale);

    return { sale, cartItems: cartSnapshot };
  }

  // ─── Productos ───
  function saveProduct(productData, productId) {
    const sku = cleanText(productData.SKU, 40);
    const clash = state.products.find((p) => p.SKU.toLowerCase() === sku.toLowerCase() && p.id !== productId);
    if (clash) {
      showToast('SKU ya existe.', 'error');
      return false;
    }
    const product = {
      id: productId || Date.now(),
      SKU: sku,
      categoria: productData.categoria,
      nombre: cleanText(productData.nombre, 120),
      talla: cleanText(productData.talla, 20),
      color: cleanText(productData.color, 40),
      precio: Math.max(0, parseInt(productData.precio, 10) || 0),
      stock_actual: Math.max(0, parseInt(productData.stock_actual, 10) || 0),
      stock_minimo: Math.max(0, parseInt(productData.stock_minimo, 10) || 3),
      imagen: cleanText(productData.imagen, 500),
      icon: productData.icon || '👕',
      descripcion: productId ? undefined : 'Polera urbana estilo ' + productData.categoria,
      estado: 'activo',
      fecha_creacion: new Date().toISOString(),
    };
    if (productId) delete product.descripcion;
    dispatch({
      type: 'SAVE_PRODUCT',
      product,
      isEdit: Boolean(productId),
      detalle: `Producto ${sku} - ${product.nombre} ${productId ? 'editado' : 'creado'}`,
      actorId: currentUser.id,
      actorLabel: actorLabelOf(currentUser),
    });
    showToast('Producto registrado correctamente.', 'success');
    return true;
  }

  function toggleProductState(id) {
    dispatch({ type: 'TOGGLE_PRODUCT_STATE', id });
    showToast('Operación realizada correctamente.', 'success');
  }

  // ─── Inventario ───
  function adjustStock({ productId, tipo, cantidad, observaciones }) {
    const prod = state.products.find((p) => p.id === productId);
    if (!prod) return false;
    const delta = tipo === 'ingreso' ? cantidad : -cantidad;
    const nuevoStock = prod.stock_actual + delta;
    if (nuevoStock < 0) {
      showToast('Stock insuficiente.', 'error');
      return false;
    }
    const movement = {
      id: Date.now(),
      producto_id: prod.id,
      tipo,
      cantidad: delta,
      stock_anterior: prod.stock_actual,
      stock_nuevo: nuevoStock,
      usuario_id: currentUser.id,
      fecha: new Date().toISOString(),
      observaciones,
    };
    dispatch({
      type: 'ADJUST_STOCK',
      product: { ...prod, stock_actual: nuevoStock },
      movement,
      detalle: `Ajuste en ${prod.SKU}: ${delta} unidades. Stock final: ${nuevoStock}`,
      actorId: currentUser.id,
      actorLabel: actorLabelOf(currentUser),
    });
    showToast('Inventario actualizado.', 'success');
    return true;
  }

  // ─── Devoluciones ───
  function requestRefund(saleNum, motivo) {
    const refund = {
      id: Date.now(),
      venta_num: saleNum,
      cajero_id: currentUser.id,
      motivo: cleanText(motivo, 300),
      estado: 'pendiente',
      fecha_solicitud: new Date().toISOString(),
    };
    dispatch({
      type: 'REQUEST_REFUND',
      refund,
      detalle: `Solicitud de devolución enviada para ${saleNum}`,
      actorId: currentUser.id,
      actorLabel: actorLabelOf(currentUser),
    });
    showToast('Operación realizada correctamente. En espera de aprobación.', 'success');
  }

  function resolveRefund(refundId, decision) {
    const ref = state.refunds.find((r) => r.id === refundId);
    if (!ref) return;

    const patch = { estado: decision, fecha_resolución: new Date().toISOString(), administrador_id: currentUser.id };
    let products = state.products;
    let movements = null;

    if (decision === 'aprobada') {
      const details = state.saleDetails.filter((d) => d.venta_num === ref.venta_num);
      movements = [];
      products = state.products.map((p) => {
        const detail = details.find((d) => d.producto_id === p.id);
        if (!detail) return p;
        const stockAnt = p.stock_actual;
        const stockNuevo = stockAnt + detail.cantidad;
        movements.push({
          id: Date.now() + Math.random(),
          producto_id: p.id,
          tipo: 'devolución',
          cantidad: detail.cantidad,
          stock_anterior: stockAnt,
          stock_nuevo: stockNuevo,
          usuario_id: currentUser.id,
          fecha: new Date().toISOString(),
          observaciones: `Devolución aprobada Boleta ${ref.venta_num}`,
        });
        return { ...p, stock_actual: stockNuevo };
      });
    }

    dispatch({
      type: 'RESOLVE_REFUND',
      refundId,
      patch,
      products,
      movements,
      detalle: `Devolución #DEV-${refundId} ${decision}`,
      actorId: currentUser.id,
      actorLabel: actorLabelOf(currentUser),
    });
    showToast('Operación realizada correctamente.', 'success');
  }

  // ─── Usuarios ───
  async function createUser({ nombre, apellidos, email, rol, password }) {
    const cleanEmail = cleanText(email, 254).toLowerCase();
    if (state.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      showToast('El correo ya existe en el sistema.', 'error');
      return false;
    }
    const { salt, hash } = await hashPassword(password);
    const user = {
      id: Date.now(),
      nombre: cleanText(nombre, 80),
      apellidos: cleanText(apellidos, 80),
      email: cleanEmail,
      salt,
      hash,
      rol,
      estado: 'activo',
      fecha_creacion: new Date().toISOString().split('T')[0],
      failed_attempts: 0,
    };
    dispatch({ type: 'CREATE_USER', user, detalle: `Usuario ${cleanEmail} creado`, actorId: currentUser.id, actorLabel: actorLabelOf(currentUser) });
    showToast('Operación realizada correctamente.', 'success');
    return true;
  }

  function unlockUser(userId) {
    dispatch({ type: 'UNLOCK_USER', userId });
    showToast('Operación realizada correctamente.', 'success');
  }

  async function resetUserPassword(userId, newPassword) {
    const { salt, hash } = await hashPassword(newPassword);
    dispatch({ type: 'RESET_PASSWORD', userId, salt, hash });
    showToast('Operación realizada correctamente.', 'success');
  }

  // ─── Configuración ───
  function saveSettings(settingsPatch) {
    dispatch({ type: 'SAVE_SETTINGS', settings: settingsPatch });
    showToast('Operación realizada correctamente.', 'success');
  }

  // ─── Simulador de escáner ───
  function scanRandomProduct() {
    const activeProducts = state.products.filter((p) => p.estado === 'activo');
    const prod = activeProducts[Math.floor(Math.random() * activeProducts.length)];
    if (prod) {
      addToCart(prod.id);
      showToast(`Escáner simulado: ${prod.SKU} detectado.`, 'success');
    }
  }

  const value = {
    state,
    currentUser,
    currentShift,
    cartSubtotal,
    cartTotal,
    login,
    logout,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    setGlobalDiscount,
    openShift,
    closeShift,
    confirmPayment,
    saveProduct,
    toggleProductState,
    adjustStock,
    requestRefund,
    resolveRefund,
    createUser,
    unlockUser,
    resetUserPassword,
    saveSettings,
    scanRandomProduct,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>');
  return ctx;
}