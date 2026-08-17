export const DB_KEYS = {
  USERS: 'raver_users_v1',
  PRODUCTS: 'raver_products_v1',
  SALES: 'raver_sales_v1',
  SALE_DETAILS: 'raver_sale_details_v1',
  SHIFTS: 'raver_shifts_v1',
  MOVEMENTS: 'raver_movements_v1',
  REFUNDS: 'raver_refunds_v1',
  SETTINGS: 'raver_settings_v1',
  LOGS: 'raver_audit_logs_v1',
};

// Sesión (no es "de negocio"): usuario activo, turno activo, carrito en curso.
export const SESSION_KEYS = {
  CURRENT_USER_ID: 'raver_current_user_id',
  CURRENT_SHIFT_ID: 'raver_current_shift_id',
  CART: 'raver_cart',
};
