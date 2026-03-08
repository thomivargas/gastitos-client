# Gastitos - Arquitectura del Frontend

Guia de arquitectura para el cliente web de Gastitos. El backend ya expone 51 endpoints REST listos para consumir.

## Stack recomendado

| Capa | Tecnologia | Por que |
|---|---|---|
| Framework | **React 19** | Ecosistema maduro, soporte masivo |
| Build | **Vite** | Rapido, HMR instantaneo, ya configurado el CORS para `:5173` |
| Routing | **React Router 7** | File-based routing, loaders, actions |
| State server | **TanStack Query v5** | Cache, revalidacion, mutations, estados de carga |
| State client | **Zustand** | Ligero, para auth/theme/sidebar. Sin boilerplate |
| Formularios | **React Hook Form + Zod** | Validacion compartida con el backend |
| UI | **Tailwind CSS 4 + shadcn/ui** | Componentes accesibles, customizables, sin lock-in |
| Graficos | **Recharts** | Simple, declarativo, buen soporte para finanzas |
| Iconos | **Lucide React** | Consistentes, tree-shakeable |
| HTTP | **axios** | Liviano, interceptors para auth |
| Fechas | **date-fns** | Ligero, tree-shakeable, soporte locale es |
| Numeros | **Intl.NumberFormat** | Nativo, formato de moneda ARS/USD |

## Estructura del proyecto

```
client/
├── public/
├── src/
│   ├── main.tsx                  # Entry point
│   ├── App.tsx                   # Router + providers
│   │
│   ├── api/                      # Capa HTTP
│   │   ├── client.ts             # Fetch wrapper con interceptors (auth, refresh)
│   │   ├── auth.api.ts           # login, registro, refresh
│   │   ├── cuentas.api.ts        # CRUD cuentas
│   │   ├── transacciones.api.ts  # CRUD transacciones
│   │   ├── transferencias.api.ts
│   │   ├── categorias.api.ts
│   │   ├── etiquetas.api.ts
│   │   ├── presupuestos.api.ts
│   │   ├── recurrentes.api.ts
│   │   ├── reportes.api.ts
│   │   ├── monedas.api.ts
│   │   ├── importacion.api.ts
│   │   └── reglas.api.ts
│   │
│   ├── hooks/                    # Custom hooks (queries + mutations)
│   │   ├── use-auth.ts
│   │   ├── use-cuentas.ts
│   │   ├── use-transacciones.ts
│   │   ├── use-reportes.ts
│   │   └── ...
│   │
│   ├── stores/                   # Estado global (Zustand)
│   │   ├── auth.store.ts         # accessToken (solo), usuario, isAuthenticated
│   │   └── ui.store.ts           # sidebar, theme, moneda display
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn/ui (button, input, dialog, etc.)
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx     # Sidebar + header + main content
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegistroForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── cuentas/
│   │   │   ├── CuentaCard.tsx
│   │   │   ├── CuentaForm.tsx
│   │   │   └── ResumenCuentas.tsx
│   │   ├── transacciones/
│   │   │   ├── TransaccionForm.tsx
│   │   │   ├── TransaccionList.tsx
│   │   │   ├── TransaccionFilters.tsx
│   │   │   └── TransaccionRow.tsx
│   │   ├── transferencias/
│   │   │   ├── TransferenciaForm.tsx
│   │   │   └── TransferenciaList.tsx
│   │   ├── presupuestos/
│   │   │   ├── PresupuestoForm.tsx
│   │   │   ├── PresupuestoProgreso.tsx
│   │   │   └── CategoriaBarraProgreso.tsx
│   │   ├── reportes/
│   │   │   ├── ResumenMensual.tsx
│   │   │   ├── GraficoTendencia.tsx
│   │   │   ├── GraficoCategoria.tsx    # Donut chart
│   │   │   ├── FlujoCaja.tsx
│   │   │   └── TopGastos.tsx
│   │   ├── recurrentes/
│   │   │   ├── RecurrenteForm.tsx
│   │   │   └── RecurrenteList.tsx
│   │   ├── moneda/
│   │   │   ├── TasasDolar.tsx
│   │   │   └── Convertidor.tsx
│   │   ├── importacion/
│   │   │   ├── ImportCSV.tsx           # Wizard: upload -> preview -> mapeo -> ejecutar
│   │   │   └── ExportButton.tsx
│   │   └── reglas/
│   │       ├── ReglaForm.tsx
│   │       └── ReglaList.tsx
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegistroPage.tsx
│   │   ├── DashboardPage.tsx           # Resumen general
│   │   ├── CuentasPage.tsx
│   │   ├── CuentaDetallePage.tsx
│   │   ├── TransaccionesPage.tsx
│   │   ├── TransferenciasPage.tsx
│   │   ├── PresupuestosPage.tsx
│   │   ├── PresupuestoDetallePage.tsx
│   │   ├── ReportesPage.tsx
│   │   ├── RecurrentesPage.tsx
│   │   ├── MonedaPage.tsx
│   │   ├── ImportacionPage.tsx
│   │   ├── ReglasPage.tsx
│   │   └── ConfiguracionPage.tsx       # Perfil, preferencias
│   │
│   ├── lib/
│   │   ├── formatters.ts               # formatMonto, formatFecha
│   │   ├── validators.ts               # Schemas Zod compartidos
│   │   └── constants.ts                # Colores, iconos, tipos de cuenta
│   │
│   └── types/
│       └── api.ts                      # Tipos de respuesta de la API
│
├── index.html
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Paginas y rutas

```
/login                    → LoginPage          (publica)
/registro                 → RegistroPage       (publica)
/                         → DashboardPage      (protegida)
/cuentas                  → CuentasPage
/cuentas/:id              → CuentaDetallePage
/transacciones            → TransaccionesPage
/transferencias           → TransferenciasPage
/presupuestos             → PresupuestosPage
/presupuestos/:id         → PresupuestoDetallePage
/reportes                 → ReportesPage
/recurrentes              → RecurrentesPage
/moneda                   → MonedaPage
/importar                 → ImportacionPage
/reglas                   → ReglasPage
/configuracion            → ConfiguracionPage
/configuracion/sesiones   → SesionesPage        (sesiones activas)
```

## Flujo de autenticacion

El refresh token **nunca llega al cliente**. El servidor lo setea como cookie HttpOnly.
El cliente solo maneja el `accessToken` en memoria (Zustand).

```
Login:
┌─────────────┐     POST /auth/login      ┌─────────┐
│  LoginForm  │ ────────────────────────→  │  Server │
│             │ ←────────────────────────  │         │
└─────────────┘  Body: { accessToken,     └─────────┘
                         usuario }
                 Cookie: gastitos_rt=xxx
                   (HttpOnly, Secure, SameSite=Strict)

Request normal:
  Header: Authorization: Bearer <accessToken>
  (la cookie NO se envia — Path=/api/auth)

Refresh (access expiro):
  POST /auth/refresh (sin body)
  → el browser envia la cookie automaticamente
  → server responde con nuevo accessToken en body
  → server rota la cookie con nuevo refresh token

Logout:
  POST /auth/logout
  → server borra sesion de DB + limpia cookie
```

**Implementacion del interceptor:**

```typescript
// api/client.ts
const API_BASE = 'http://localhost:3000/api';

async function fetchAPI(path: string, options: RequestInit = {}) {
  const { accessToken, setAccessToken, logout } = useAuthStore.getState();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include', // IMPORTANTE: envia cookies en cross-origin
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options.headers,
    },
  });

  // Auto-refresh en 401
  if (res.status === 401 && accessToken) {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // envia cookie gastitos_rt
    });

    if (refreshRes.ok) {
      const { data } = await refreshRes.json();
      setAccessToken(data.accessToken);
      // Reintentar request original con nuevo token
      return fetchAPI(path, options);
    }

    logout();
    throw new Error('Sesion expirada');
  }

  return res;
}
```

**Auth store (Zustand):**

```typescript
// stores/auth.store.ts
interface AuthState {
  accessToken: string | null;
  usuario: Usuario | null;
  isAuthenticated: boolean;
  setAccessToken: (token: string) => void;
  setAuth: (token: string, usuario: Usuario) => void;
  logout: () => void;
}

// Solo guarda accessToken en memoria. El refreshToken
// vive exclusivamente en la cookie HttpOnly.
```

**Gestion de sesiones:**

```typescript
// api/auth.api.ts
export const listarSesiones = () => fetchAPI('/auth/sesiones');
export const cerrarSesion = (id: string) => fetchAPI(`/auth/sesiones/${id}`, { method: 'DELETE' });
export const cerrarTodas = () => fetchAPI('/auth/sesiones', { method: 'DELETE' });
```

La pagina de configuracion puede mostrar las sesiones activas del usuario
(IP, navegador, fecha) con opcion de cerrar cada una o todas.

## Capa de datos con TanStack Query

Cada modulo tiene un hook que encapsula queries y mutations:

```typescript
// hooks/use-transacciones.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/transacciones.api';

export function useTransacciones(filtros: TransaccionFiltros) {
  return useQuery({
    queryKey: ['transacciones', filtros],
    queryFn: () => api.listar(filtros),
  });
}

export function useCrearTransaccion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.crear,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transacciones'] });
      qc.invalidateQueries({ queryKey: ['cuentas'] }); // balance cambio
      qc.invalidateQueries({ queryKey: ['reportes'] });
    },
  });
}
```

**Invalidacion en cascada:** cuando se crea/edita/elimina una transaccion, se invalidan tambien cuentas (balance), presupuestos (progreso) y reportes.

## Dashboard (pagina principal)

El dashboard muestra un resumen financiero completo:

```
┌──────────────────────────────────────────────────────────┐
│  Header: Hola Thomas        [Dolar Blue: $1,250]  [👤]  │
├──────────┬───────────────────────────────────────────────┤
│          │                                               │
│          │  ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ Sidebar  │  │ Balance │ │Ingresos │ │ Gastos  │        │
│          │  │ $XXXXX  │ │ $XXXXX  │ │ $XXXXX  │        │
│ - Inicio │  └─────────┘ └─────────┘ └─────────┘        │
│ - Cuentas│                                               │
│ - Trans. │  ┌─────────────────┐ ┌──────────────────┐    │
│ - Transf.│  │   Tendencia     │ │  Gastos por      │    │
│ - Presup.│  │   mensual       │ │  categoria       │    │
│ - Report.│  │   (lineas)      │ │  (donut)         │    │
│ - Recur. │  └─────────────────┘ └──────────────────┘    │
│ - Moneda │                                               │
│ - Import │  ┌──────────────────────────────────────┐    │
│ - Reglas │  │  Ultimas transacciones               │    │
│ - Config │  │  ────────────────────────────────     │    │
│          │  │  15/03 Supermercado    -$12,500  🔴   │    │
│          │  │  15/03 Sueldo         +$850,000 🟢   │    │
│          │  │  14/03 Netflix        -$4,500   🔴   │    │
│          │  └──────────────────────────────────────┘    │
│          │                                               │
└──────────┴───────────────────────────────────────────────┘
```

**Datos que consume del backend:**
- `GET /cuentas/resumen` → tarjetas de balance
- `GET /reportes/resumen-mensual` → ingresos/gastos del mes
- `GET /reportes/tendencia-mensual` → grafico de lineas
- `GET /reportes/gastos-por-categoria` → donut chart
- `GET /transacciones?limit=5` → ultimas transacciones
- `GET /monedas/tasas` → cotizacion dolar en header

## Componentes clave

### TransaccionForm

```
┌──────────────────────────────────────┐
│  Nueva transaccion                   │
│                                      │
│  Tipo:  [INGRESO] [GASTO]           │
│  Cuenta: [▼ Banco Galicia       ]   │
│  Monto:  [$___________]             │
│  Fecha:  [📅 2025-03-15        ]    │
│  Descripcion: [________________]    │
│  Categoria:   [▼ Alimentacion   ]   │
│  Etiquetas:   [+ agregar tag    ]   │
│  Notas:  [____________________]     │
│                                      │
│              [Cancelar] [Guardar]    │
└──────────────────────────────────────┘
```

Abre como dialog/drawer. Al guardar invalida queries de transacciones, cuentas y reportes.

### ImportCSV (wizard de 3 pasos)

```
Paso 1: Subir archivo
┌──────────────────────────────┐
│  Arrastra un archivo CSV     │
│  o haz click para buscar     │
│  [Seleccionar archivo]       │
│  Cuenta: [▼ Banco Galicia]  │
└──────────────────────────────┘

Paso 2: Mapear columnas
┌──────────────────────────────┐
│  Columna CSV    →  Campo     │
│  "Date"         →  fecha     │
│  "Amount"       →  monto    │
│  "Description"  →  desc.    │
│  "Category"     →  categ.   │
│                              │
│  Formato fecha: [DD/MM/YYYY] │
│  Sep. decimal:  [, (coma)  ] │
│  Auto-categorizar: [✓]      │
│                              │
│  Preview:                    │
│  ┌────────────────────────┐  │
│  │ 15/03 | 12500 | Super │  │
│  │ 14/03 | 4500  | Netfl │  │
│  └────────────────────────┘  │
└──────────────────────────────┘

Paso 3: Resultado
┌──────────────────────────────┐
│  ✓ 45 transacciones import. │
│  ✗ 2 filas con errores:     │
│    Fila 12: monto invalido  │
│    Fila 38: fecha invalida  │
│                              │
│  [Ver transacciones]         │
└──────────────────────────────┘
```

### PresupuestoProgreso

```
┌──────────────────────────────────┐
│  Marzo 2025                      │
│  Presupuesto: $500,000           │
│  Gastado:     $320,000 (64%)     │
│  ████████████████░░░░░░░░░ 64%   │
│                                  │
│  Por categoria:                  │
│  Alimentacion   $120K / $150K    │
│  ████████████████░░░░ 80%        │
│  Transporte     $45K / $60K     │
│  ████████████░░░░░░░░ 75%        │
│  Entretenimiento $90K / $80K    │
│  ████████████████████████ 112% ⚠ │
└──────────────────────────────────┘
```

## Formato de moneda

```typescript
// lib/formatters.ts
export function formatMonto(monto: number, moneda: string = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: moneda === 'ARS' ? 0 : 2,
  }).format(monto);
}

// formatMonto(1500.5, 'ARS')  → "$ 1.501"
// formatMonto(150.75, 'USD')  → "US$ 150,75"
```

## Responsive

- **Desktop (>1024px):** Sidebar fija + contenido principal
- **Tablet (768-1024px):** Sidebar colapsable, grids de 2 columnas
- **Mobile (<768px):** Bottom navigation bar, contenido full-width, formularios como pagina completa en vez de dialogs

## Temas

Soporte para modo claro/oscuro usando CSS variables de shadcn/ui. La preferencia se persiste en `localStorage` y en las preferencias del usuario (`PATCH /usuario/perfil`).

## Orden de implementacion sugerido

```
1. Setup       → Vite + React + Tailwind + shadcn/ui + Router
2. Auth        → Login, registro, store, interceptor, ProtectedRoute
3. Layout      → Sidebar, header, navegacion
4. Cuentas     → CRUD completo + resumen
5. Categorias  → CRUD + selector reutilizable
6. Transacc.   → CRUD + filtros + paginacion
7. Dashboard   → Tarjetas + graficos con datos reales
8. Transfer.   → Formulario con selector de cuentas
9. Presupuest. → CRUD + barra de progreso
10. Reportes   → Graficos (tendencia, donut, flujo)
11. Recurrent. → CRUD + activar/desactivar
12. Moneda     → Tasas + convertidor
13. Import     → Wizard CSV
14. Reglas     → CRUD reglas
15. Config     → Perfil, preferencias, theme
```
