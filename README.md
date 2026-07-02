# ⚔️ MU Dashboard — Balduneta Monitor

> Dashboard en tiempo real para monitorear personajes del servidor MU Online **Balduneta** (Realm: `balduneta_v2`).

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=flat-square)
![Zustand](https://img.shields.io/badge/Zustand-5-orange?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3-38BDF8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## 📸 Vista General

El proyecto combina dos conceptos:

- **Dashboard Multicuenta** — Vista panorámica de todas tus cuentas en una sola pantalla
- **Live Companion** — Ficha detallada con estadísticas en tiempo real, alertas nativas y seguimiento de EXP

---

## ✨ Funcionalidades

### 🗂️ Monitoreo Multicuenta (Live Grid)
- Agrega múltiples personajes y monitoréalos todos desde una grilla compacta
- Cada tarjeta muestra el estado en tiempo real: **Safe 🛡️**, **Farm ⚔️** u **Offline 💀**
- Actualización automática cada 60 segundos via TanStack Query
- Persistencia en `localStorage` gracias a Zustand

### 📊 Ficha Detallada del Personaje
- **GearScore**, posición en ranking de su clase, guild, estado de ubicación
- **Anillo SVG de Master Level** — Progreso porcentual animado hacia el siguiente ML
- **Anillo SVG de Nivel Normal** — Progreso de nivel 1 → 400, con alerta visual cuando faltan ≤10 niveles
- **Estadísticas de combate**: Vida, Mana, BP, Escudo
- **Estadísticas base**: STR, AGI, VIT, ENE, CMD
- Seguimiento de **ganancia de EXP** entre sesiones (`+X EXP` desde la última carga)

### 🔔 Sistema de Alertas
- **Notificaciones nativas del navegador** (HTML5 Notification API) ante cambios de estado:
  - Personaje desconectado
  - Salida de Safe Zone → Farm Zone
  - ¡Nivel 400 próximo! (≤10 niveles restantes)
- Las notificaciones usan `tag` por personaje para evitar spam
- Toast visual flotante en la parte inferior de la pantalla

### 🏆 Rankings
- Vista dedicada con ranking por clase (DK, DW, Elf, MG, Lord, Summoner, RF)
- Buscador global de personajes en tiempo real
- **CharacterDrawer** — Panel lateral deslizante para inspeccionar cualquier personaje del ranking sin perder la tabla

### ⚔️ Vista de Equipamiento (Paperdoll)
- Inventario en formato silueta de 3 columnas inspirado en los juegos RPG clásicos
- Slots por categoría: Armadura, Accesorios, Armas, Mascota, Alas
- Tooltips interactivos con nombre y rareza de cada item
- Slots vacantes mostrados con borde punteado

### 📱 Diseño Responsivo (Mobile-First)
- **Desktop**: Sidebar lateral fijo con navegación vertical
- **Mobile**: Barra de navegación inferior tipo app nativa
- Optimizado para ser usado desde el celular mientras se juega

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| [React](https://react.dev/) | 19 | UI y componentes |
| [Vite](https://vitejs.dev/) | 8 | Build tool y servidor de desarrollo |
| [React Router](https://reactrouter.com/) | 6 | Navegación entre vistas |
| [TanStack Query](https://tanstack.com/query) | 5 | Fetching, caché y refetch automático |
| [Zustand](https://zustand-demo.pmnd.rs/) | 5 | Estado global + persistencia en localStorage |
| [Tailwind CSS](https://tailwindcss.com/) | 3 | Estilos utilitarios |
| [Google Fonts](https://fonts.google.com/) | — | Fuentes: Outfit + Cinzel |

---

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── Layout.jsx           # Sidebar (desktop) + Bottombar (móvil) + Navbar
│   ├── Dashboard.jsx        # Vista principal: grid de cuentas + ficha activa
│   ├── AccountStatusCard.jsx # Tarjeta compacta de estado por cuenta
│   ├── CharacterCard.jsx    # Ficha detallada con anillos SVG y alertas
│   ├── CharacterDrawer.jsx  # Panel lateral deslizante de inspección
│   ├── Equipamiento.jsx     # Vista Paperdoll de inventario
│   ├── RankingsView.jsx     # Rankings por clase con buscador
│   └── Onboarding.jsx       # Pantalla de bienvenida (sin personajes)
├── services/
│   └── muApi.js             # Funciones de fetch a la API + utilidades matemáticas
├── store/
│   └── useCharacterStore.js # Store Zustand con persistencia localStorage
├── App.jsx                  # Router principal (/, /equip, /ranking)
├── main.jsx                 # Entry point + QueryClientProvider
└── index.css                # Estilos globales + animaciones
```

---

## 🚀 Cómo Ejecutar Localmente

### Pre-requisitos
- Node.js ≥ 18
- npm ≥ 9

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/dashboard-mu.git
cd dashboard-mu

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

Abrí [http://localhost:5173](http://localhost:5173) en tu navegador.

### Build de Producción

```bash
npm run build
```

Los archivos listos para deploy se generan en la carpeta `dist/`.

---

## 🌐 Deploy en Vercel

Este proyecto incluye un [`vercel.json`](./vercel.json) preconfigurado para que React Router funcione correctamente (todas las rutas redirigen a `index.html`).

### Pasos:
1. Subí el proyecto a GitHub
2. Entrá a [vercel.com](https://vercel.com) y conectá tu repo
3. Vercel detecta Vite automáticamente con estas configuraciones:

| Campo | Valor |
|---|---|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

4. Click en **Deploy** 🚀

---

## 🔌 API Utilizada

El proyecto consume la **API pública de Balduneta MU**:

| Endpoint | Descripción |
|---|---|
| `GET /api/characters/public-profile?name=X&realm=balduneta_v2` | Perfil completo del personaje |
| `GET /api/ranking/level?realm=balduneta_v2&classFilter=dk` | Ranking de nivel por clase |

### Filtros de clase disponibles:
`dw` · `dk` · `elf` · `mg` · `lord` · `sum` · `rf`

---

## ⚙️ Configuración

No se requieren variables de entorno. El realm y los endpoints están centralizados en [`src/services/muApi.js`](./src/services/muApi.js):

```js
export const PROFILE_API = 'https://www.baldunetamu.com/api/characters/public-profile'
export const RANKING_API = 'https://www.baldunetamu.com/api/ranking/level'
export const REALM = 'balduneta_v2'
```

Si querés adaptar el dashboard a otro servidor MU, solo cambiá estas constantes.

---

## 📋 Rutas

| Ruta | Vista |
|---|---|
| `/` | Dashboard principal (monitoreo + ficha activa) |
| `/equip?name=X` | Vista de equipamiento Paperdoll del personaje X |
| `/ranking` | Rankings por clase con buscador |

---

## 📄 Licencia

MIT © 2025 — Proyecto personal para la comunidad de Balduneta MU.

> Este proyecto no está afiliado oficialmente con el servidor Balduneta MU. Usa la API pública disponible para todos los jugadores.
