# RAVER Platform — Panel Unificado (React + Tailwind)

Migración del `index.html` original (vanilla JS) a React + Tailwind CSS,
manteniendo el **mismo diseño visual** (colores, tipografías, animaciones,
layout responsive) pero con una base de código mucho más mantenible y
robusta.

## Cómo correrlo

```bash
npm install
npm run dev      # desarrollo, http://localhost:5173 
npm run build    # genera /dist listo para producción
npm run preview  # sirve /dist localmente para probarlo
```

Este panel sigue leyendo las mismas claves de `localStorage`
(`raver_bridge_stats_v1`, `raver_bridge_feed_v1`) que usan Caja POS y
Tienda Online a través de `raver-bridge.js`. Por eso, para ver actividad
real en el feed, **Caja POS y Tienda Online deben servirse desde el mismo
origen** (mismo dominio/puerto) que este panel — así comparten el mismo
`localStorage` del navegador. Si copias `dist/index.html` a la misma
carpeta donde ya tienes `sistema_pos_raver_tienda_de_ropa_urbana.html` y
`sistema_tienda_online_raver.html`, todo sigue funcionando igual que antes.

## Qué cambió

**Estructura**
- `src/components/` — un componente por sección (NavBar, Hero,
  BridgeDiagram, LaunchCards, FeedSection, Footer), en vez de un único
  bloque de HTML + `innerHTML` manual.
- `src/hooks/useBridgeData.js` — sincroniza stats/feed con el bridge en
  vivo (evento `storage`, evento propio, y polling de respaldo cada 4s),
  reemplazando el `render()` global + `setInterval` del original.
- `src/lib/raverBridge.js` — puerto a módulo ES de `raver-bridge.js`.
- `src/lib/safeStorage.js` — capa defensiva sobre `localStorage`.
- `tailwind.config.js` — todos los tokens de diseño originales (colores,
  fuentes, animaciones `drift`/`blink`/`pulse-travel`) portados como
  configuración de Tailwind.

**Seguridad (mejoras posibles en frontend puro)**

Este panel en particular no maneja contraseñas ni datos sensibles —
solo lee estadísticas agregadas — pero se dejó preparada la base que
también usarán Caja POS y Tienda Online cuando se migren:

1. **Sin XSS por concatenación de HTML.** El original armaba las filas
   del feed con `innerHTML = '<div>' + e.label + '</div>'`. Si algún
   dato del feed llegara a contener HTML/JS (por un bug, o por alguien
   editando `localStorage` a mano), se ejecutaría en la página. React
   escapa automáticamente todo el contenido renderizado con `{}`, así
   que esa clase de inyección ya no es posible.
2. **Lectura de `localStorage` a prueba de datos corruptos.**
   `safeGetJSON` nunca lanza una excepción: si el dato no existe, no es
   JSON válido, o no tiene la forma esperada (se valida con
   `isValidStats` / `isValidFeed`), se usa un valor por defecto seguro
   en lugar de romper la página completa (el original hacía
   `JSON.parse(...)` sin `try/catch`).
3. **Base reutilizable.** `safeStorage.js` está pensado para que, al
   migrar Caja POS y Tienda Online, se reutilice para *todas* las
   colecciones (usuarios, productos, ventas, pedidos) y se le sumen ahí
   las mejoras que sí aplican a esos sistemas: hash de contraseñas en
   vez de texto plano, límite de intentos de login, sanitización de
   inputs de formularios, etc.

**Importante — límite real de esta arquitectura:** al ser una app 100%
frontend (sin servidor ni base de datos real), cualquiera con acceso al
navegador puede abrir DevTools y leer/editar `localStorage` directamente,
sin importar cuánto se refuerce el código React. Estas mejoras evitan
errores accidentales y los vectores de ataque típicos de una SPA (XSS,
datos corruptos), pero no reemplazan un backend con autenticación real
si en algún momento se necesita seguridad de nivel producción.

## Próximos pasos

Cuando quieras seguir con **Caja POS** o **Tienda Online**, dime cuál y
seguimos con la misma estructura: componentes por sección/vista, el
mismo `safeStorage`, y ahí sí entran las mejoras de contraseñas
(hash), validación de formularios y sanitización de inputs de usuario para la seguridad.
