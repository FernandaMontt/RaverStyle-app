function withLog(state, logs, accion, detalle, actorId, actorLabel) {
  const entry = {
    id: Date.now() + Math.random(),
    usuario_id: actorId ?? null,
    usuario_nombre: actorLabel || 'Sistema',
    accion,
    detalle,
    fecha_hora: new Date().toISOString(),
  };
  return [entry, ...logs];
}

export function storeReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload };

    case 'LOGIN_RESULT': {
      const users = state.users.map((u) => (u.id === action.userId ? { ...u, ...action.userPatch } : u));
      const logs = action.logAccion ? withLog(state, state.logs, action.logAccion, action.logDetalle, action.userId, action.actorLabel) : state.logs;
      return { ...state, users, logs };
    }

    case 'LOGIN_SUCCESS': {
      const users = state.users.map((u) => (u.id === action.userId ? { ...u, failed_attempts: 0 } : u));
      const logs = withLog(state, state.logs, 'LOGIN', action.detalle, action.userId, action.actorLabel);
      return {
        ...state,
        users,
        logs,
        currentUserId: action.userId,
        currentShiftId: action.shiftId ?? null,
      };
    }

    case 'LOGOUT': {
      const logs = state.currentUserId
        ? withLog(state, state.logs, 'LOGOUT', action.detalle, state.currentUserId, action.actorLabel)
        : state.logs;
      return { ...state, logs, currentUserId: null, currentShiftId: null, cart: [], cartGlobalDiscount: 0 };
    }

    case 'ADD_TO_CART': {
      const existingIndex = state.cart.findIndex((i) => i.id === action.item.id);
      let cart;
      if (existingIndex >= 0) {
        cart = state.cart.map((i, idx) => (idx === existingIndex ? { ...i, cantidad: i.cantidad + 1 } : i));
      } else {
        cart = [...state.cart, action.item];
      }
      return { ...state, cart };
    }

    case 'UPDATE_CART_QTY': {
      const cart = state.cart.map((i, idx) => (idx === action.index ? { ...i, cantidad: action.qty } : i));
      return { ...state, cart };
    }

    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((_, idx) => idx !== action.index) };

    case 'CLEAR_CART':
      return { ...state, cart: [], cartGlobalDiscount: 0 };

    case 'SET_GLOBAL_DISCOUNT':
      return { ...state, cartGlobalDiscount: action.amount };

    case 'OPEN_SHIFT': {
      const shifts = [action.shift, ...state.shifts];
      const logs = withLog(state, state.logs, 'APERTURA_CAJA', action.detalle, action.actorId, action.actorLabel);
      return { ...state, shifts, currentShiftId: action.shift.id, logs };
    }

    case 'CLOSE_SHIFT': {
      const shifts = state.shifts.map((s) => (s.id === action.shiftId ? { ...s, ...action.patch } : s));
      const logs = withLog(state, state.logs, 'CIERRE_CAJA', action.detalle, action.actorId, action.actorLabel);
      return { ...state, shifts, currentShiftId: null, logs };
    }

    case 'CONFIRM_SALE': {
      const products = state.products.map((p) => {
        const item = state.cart.find((i) => i.id === p.id);
        return item ? { ...p, stock_actual: p.stock_actual - item.cantidad } : p;
      });
      const movements = [...action.movements, ...state.movements];
      const saleDetails = [...state.saleDetails, ...action.saleDetails];
      const sales = [action.sale, ...state.sales];
      const shifts = state.shifts.map((s) => (s.id === action.sale.caja_id ? { ...s, ...action.shiftPatch } : s));
      const logs = withLog(state, state.logs, 'VENTA_CONFIRMADA', action.detalle, action.actorId, action.actorLabel);
      return { ...state, products, movements, saleDetails, sales, shifts, cart: [], cartGlobalDiscount: 0, logs };
    }

    case 'SAVE_PRODUCT': {
      let products;
      if (action.isEdit) {
        products = state.products.map((p) => (p.id === action.product.id ? { ...p, ...action.product } : p));
      } else {
        products = [action.product, ...state.products];
      }
      const logs = withLog(state, state.logs, 'GESTION_PRODUCTO', action.detalle, action.actorId, action.actorLabel);
      return { ...state, products, logs };
    }

    case 'TOGGLE_PRODUCT_STATE': {
      const products = state.products.map((p) =>
        p.id === action.id ? { ...p, estado: p.estado === 'activo' ? 'inactivo' : 'activo' } : p
      );
      return { ...state, products };
    }

    case 'ADJUST_STOCK': {
      const products = state.products.map((p) => (p.id === action.product.id ? action.product : p));
      const movements = [action.movement, ...state.movements];
      const logs = withLog(state, state.logs, 'AJUSTE_INVENTARIO', action.detalle, action.actorId, action.actorLabel);
      return { ...state, products, movements, logs };
    }

    case 'REQUEST_REFUND': {
      const refunds = [action.refund, ...state.refunds];
      const logs = withLog(state, state.logs, 'SOLICITUD_DEVOLUCION', action.detalle, action.actorId, action.actorLabel);
      return { ...state, refunds, logs };
    }

    case 'RESOLVE_REFUND': {
      const refunds = state.refunds.map((r) => (r.id === action.refundId ? { ...r, ...action.patch } : r));
      const products = action.products || state.products;
      const movements = action.movements ? [...action.movements, ...state.movements] : state.movements;
      const logs = withLog(state, state.logs, 'RESOLUCION_DEVOLUCION', action.detalle, action.actorId, action.actorLabel);
      return { ...state, refunds, products, movements, logs };
    }

    case 'CREATE_USER': {
      const users = [...state.users, action.user];
      const logs = withLog(state, state.logs, 'CREAR_USUARIO', action.detalle, action.actorId, action.actorLabel);
      return { ...state, users, logs };
    }

    case 'UNLOCK_USER': {
      const users = state.users.map((u) => (u.id === action.userId ? { ...u, estado: 'activo', failed_attempts: 0 } : u));
      return { ...state, users };
    }

    case 'RESET_PASSWORD': {
      const users = state.users.map((u) => (u.id === action.userId ? { ...u, salt: action.salt, hash: action.hash } : u));
      return { ...state, users };
    }

    case 'SAVE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };

    default:
      return state;
  }
}

export const initialStoreState = {
  users: [],
  products: [],
  sales: [],
  saleDetails: [],
  shifts: [],
  movements: [],
  refunds: [],
  settings: {},
  logs: [],
  currentUserId: null,
  currentShiftId: null,
  cart: [],
  cartGlobalDiscount: 0,
};
