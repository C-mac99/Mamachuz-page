# Landing Carnitas Mamá Chuz — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir una landing de vitrina de marca para Carnitas Mamá Chuz, con página de menú completa, cuya paleta de color entera se cambie editando un solo archivo o alternando en vivo desde un selector.

**Architecture:** Sitio estático generado con Astro. El menú vive en `src/data/menu.json` y las páginas se generan desde ahí en tiempo de build. Todo el color se define como variables CSS en `src/styles/tokens.css`, expuestas a Tailwind v4 vía `@theme`. Hay cuatro paletas: la primera es el default del `@theme` y las otras tres se declaran como bloques `html[data-palette="…"]` que sobrescriben esas variables, lo que permite cambiar de paleta en el navegador sin recompilar.

**Tech Stack:** Astro 7.1.5, Tailwind CSS v4 (`@tailwindcss/vite`), Vitest 4 para validación de datos y guardas de estilo, Node 24.

**Spec:** `docs/superpowers/specs/2026-07-28-landing-mamachuz-design.md`

**Desviación del spec, ya conversada:** el spec decía "12-16 destacados" en la landing. Al transcribir el PDF resultaron **21 platos con 🔥**. La landing muestra los 21. Si en la reunión del 30 se quiere recortar, es cambiar `destacado` a `false` en `menu.json`, sin tocar código.

---

## File Structure

| Archivo | Responsabilidad |
|---|---|
| `astro.config.mjs` | Configuración de Astro y del plugin de Tailwind |
| `src/styles/tokens.css` | **Único archivo con valores de color.** 12 tokens semánticos, `@theme`, 4 paletas |
| `src/styles/global.css` | Import de Tailwind y de tokens, tipografía base |
| `src/data/menu.json` | 28 categorías, ~150 platos. Fuente única del menú |
| `src/data/sucursales.json` | Direcciones, WhatsApp, mapas, redes sociales |
| `src/lib/menu.js` | Funciones puras de lectura del menú: destacados, categorías |
| `src/lib/whatsapp.js` | Construcción de enlaces `wa.me` con mensaje prellenado |
| `src/layouts/Base.astro` | `<head>`, metadatos, atributo `data-palette`, carga de estilos |
| `src/components/Hero.astro` | Titular, subtítulo, dos botones |
| `src/components/Historia.astro` | Relato de los 45 años |
| `src/components/Destacados.astro` | Grilla de platos con `destacado: true` |
| `src/components/Sucursales.astro` | Dos tarjetas de sucursal |
| `src/components/Eventos.astro` | Bloque de eventos con botón de WhatsApp |
| `src/components/Footer.astro` | Redes, correo, propina, medios de pago |
| `src/components/MenuCategoria.astro` | Una categoría con sus platos |
| `src/components/MenuBuscador.astro` | Filtro en vivo de `/menu` |
| `src/components/SelectorPaleta.astro` | Selector de paletas, temporal |
| `src/pages/index.astro` | Landing |
| `src/pages/menu.astro` | Menú completo |
| `tests/menu.test.js` | Validación del esquema y contenido de `menu.json` |
| `tests/sucursales.test.js` | Validación de `sucursales.json` |
| `tests/no-colores-literales.test.js` | Guarda: ningún componente escribe color literal |
| `public/menu-2025.pdf` | El PDF original, descargable |

---

### Task 1: Repositorio e infraestructura

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Inicializar el repositorio**

La carpeta del proyecto todavía no es un repositorio git. Desde
`c:/Users/00167/Documents/Tempest/NAVATEMPEST/MAMACHUZ`:

```bash
git init -b main
```

- [ ] **Step 2: Crear `.gitignore`**

```
node_modules/
dist/
.astro/
.superpowers/
.env
.DS_Store
```

`.superpowers/` contiene los mockups del brainstorming; no van al repositorio.

- [ ] **Step 3: Primer commit**

```bash
git add .gitignore docs/
git commit -m "chore: init repo with design spec and plan"
```

Resultado esperado: el commit incluye `.gitignore`, el spec y este plan. El PDF del menú
todavía no — entra en la Task 3.

---

### Task 2: Scaffold de Astro y Tailwind

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`

- [ ] **Step 1: Crear el proyecto Astro en la carpeta actual**

```bash
npm create astro@latest . -- --template minimal --no-install --no-git --skip-houston --yes
```

`--no-git` es importante: el repositorio ya existe de la Task 1 y no queremos que lo reinicie.

La carpeta no está vacía — ya tiene `docs/`, el PDF y `.git/`. El instalador avisa de eso y
pide confirmación; hay que aceptar. No sobrescribe archivos existentes, solo agrega los suyos.

- [ ] **Step 2: Instalar dependencias**

```bash
npm install
```

- [ ] **Step 3: Agregar Tailwind v4**

```bash
npx astro add tailwind --yes
```

Esto instala `tailwindcss` y `@tailwindcss/vite`, y agrega el plugin a `astro.config.mjs`.

- [ ] **Step 4: Verificar que el servidor arranca**

```bash
npm run dev
```

Esperado: `astro dev` imprime una URL local y responde con la página por defecto de Astro.
Cortar con Ctrl+C.

- [ ] **Step 5: Instalar Vitest**

```bash
npm install -D vitest
```

- [ ] **Step 6: Agregar el script de test a `package.json`**

En la sección `scripts`, agregar:

```json
"test": "vitest run"
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold astro with tailwind v4 and vitest"
```

---

### Task 3: Datos de sucursales

**Files:**
- Create: `src/data/sucursales.json`
- Create: `tests/sucursales.test.js`
- Create: `public/menu-2025.pdf` (copia del PDF existente)

- [ ] **Step 1: Escribir el test que falla**

`tests/sucursales.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import datos from '../src/data/sucursales.json';

describe('sucursales.json', () => {
  it('tiene exactamente dos sucursales', () => {
    expect(datos.sucursales).toHaveLength(2);
  });

  it('cada sucursal tiene id, nombre, direccion, ciudad y whatsapp', () => {
    for (const s of datos.sucursales) {
      expect(s.id).toBeTruthy();
      expect(s.nombre).toBeTruthy();
      expect(s.direccion).toBeTruthy();
      expect(s.ciudad).toBeTruthy();
      expect(s.whatsapp).toBeTruthy();
    }
  });

  it('los ids de sucursal son únicos', () => {
    const ids = datos.sucursales.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todo número de whatsapp son 11 dígitos empezando en 503', () => {
    const numeros = [datos.eventos.whatsapp, ...datos.sucursales.map((s) => s.whatsapp)];
    for (const n of numeros) {
      expect(n).toMatch(/^503\d{8}$/);
    }
  });

  it('el horario es null cuando no se conoce, nunca una cadena inventada', () => {
    for (const s of datos.sucursales) {
      expect(s.horario === null || typeof s.horario === 'string').toBe(true);
    }
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

```bash
npm test
```

Esperado: FAIL con `Failed to resolve import "../src/data/sucursales.json"`.

- [ ] **Step 3: Crear `src/data/sucursales.json`**

```json
{
  "negocio": {
    "nombre": "Carnitas Mamá Chuz",
    "lema": "La Original",
    "desde": 1980,
    "correo": "carnitasmamachuz1980@gmail.com",
    "propina": "Se aplica 10% de propina",
    "pagos": ["Visa", "Mastercard"]
  },
  "eventos": {
    "whatsapp": "50371715309",
    "tipos": [
      "Cumpleaños",
      "Graduaciones",
      "15 años",
      "Eventos corporativos",
      "Bodas"
    ]
  },
  "redes": {
    "instagram": "https://www.instagram.com/carnitasmamachuzoficial",
    "facebook": "https://www.facebook.com/carnitasmamachuzoficial",
    "tiktok": "https://www.tiktok.com/@carnitas.mama.chu"
  },
  "sucursales": [
    {
      "id": "5ta-avenida",
      "nombre": "5ta Avenida Norte",
      "direccion": "Pasaje Venecia, N° 1931",
      "ciudad": "San Salvador",
      "whatsapp": "50361801581",
      "horario": null,
      "mapa": "https://www.google.com/maps/search/?api=1&query=Carnitas+Mam%C3%A1+Chuz+Pasaje+Venecia+San+Salvador"
    },
    {
      "id": "paseo-el-carmen",
      "nombre": "Paseo El Carmen",
      "direccion": "7ª Avenida Norte y 1ª Calle Oriente, local 4-12 A. Frente al parqueo del Cafetalón",
      "ciudad": "Santa Tecla, La Libertad",
      "whatsapp": "50377849283",
      "horario": null,
      "mapa": "https://www.google.com/maps/search/?api=1&query=Carnitas+Mam%C3%A1+Chuz+Paseo+El+Carmen+Santa+Tecla"
    }
  ]
}
```

`horario` queda en `null` a propósito: el PDF solo indica 11:30 a.m. – 3:00 p.m. para los
platos del día, no el horario general. Los componentes omiten el horario mientras sea `null`
en vez de inventar uno.

Las URL de Instagram y Facebook son las que corresponden a los nombres de usuario del PDF
("Carnitas Mamá Chuz Oficial"). **Confirmarlas con el cliente antes de publicar** — si alguna
no existe, el enlace queda roto.

- [ ] **Step 4: Correr el test y verificar que pasa**

```bash
npm test
```

Esperado: PASS, 5 tests.

- [ ] **Step 5: Copiar el PDF a `public/`**

```bash
cp "Menu Carnitas mamachuz 2025.pdf" public/menu-2025.pdf
```

- [ ] **Step 6: Commit**

```bash
git add src/data/sucursales.json tests/sucursales.test.js public/menu-2025.pdf
git commit -m "feat: add sucursales data and downloadable menu pdf"
```

---

### Task 4: Esquema del menú y comida

**Files:**
- Create: `src/data/menu.json`
- Create: `tests/menu.test.js`

- [ ] **Step 1: Escribir el test que falla**

`tests/menu.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import menu from '../src/data/menu.json';

describe('menu.json', () => {
  const items = menu.categorias.flatMap((c) => c.items);

  it('los ids de categoría son únicos', () => {
    const ids = menu.categorias.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('los ids de categoría son slugs en minúscula', () => {
    for (const c of menu.categorias) {
      expect(c.id).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('ninguna categoría está vacía', () => {
    for (const c of menu.categorias) {
      expect(c.items.length).toBeGreaterThan(0);
    }
  });

  it('todo plato tiene nombre no vacío', () => {
    for (const i of items) {
      expect(typeof i.nombre).toBe('string');
      expect(i.nombre.trim().length).toBeGreaterThan(0);
    }
  });

  it('todo precio es un número mayor que cero con dos decimales', () => {
    for (const i of items) {
      expect(typeof i.precio).toBe('number');
      expect(i.precio).toBeGreaterThan(0);
      expect(Number(i.precio.toFixed(2))).toBe(i.precio);
    }
  });

  it('todo plato declara destacado como booleano', () => {
    for (const i of items) {
      expect(typeof i.destacado).toBe('boolean');
    }
  });

  it('hay al menos 12 platos destacados', () => {
    const destacados = items.filter((i) => i.destacado);
    expect(destacados.length).toBeGreaterThanOrEqual(12);
  });

  it('no hay nombres de plato duplicados dentro de una misma categoría', () => {
    for (const c of menu.categorias) {
      const nombres = c.items.map((i) => i.nombre);
      expect(new Set(nombres).size).toBe(nombres.length);
    }
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

```bash
npm test
```

Esperado: FAIL con `Failed to resolve import "../src/data/menu.json"`.

- [ ] **Step 3: Crear `src/data/menu.json` con las categorías de comida**

Transcripción de las páginas 1 a 6 del PDF. `destacado: true` corresponde al ícono 🔥.

Dos decisiones de agrupación tomadas al transcribir, porque el PDF las presenta juntas en la
misma página sin encabezado propio: las hamburguesas quedan dentro de `infantiles`, y
"La Extra Especial" queda dentro de `papas-rellenas`. Si el cliente prefiere separarlas, es
agregar una categoría en este archivo.

```json
{
  "moneda": "USD",
  "nota": "Se aplica 10% de propina",
  "categorias": [
    {
      "id": "platos-del-dia",
      "nombre": "Platos del día",
      "nota": "Lunes a viernes, de 11:30 a.m. a 3:00 p.m.",
      "items": [
        { "nombre": "El de Carne", "precio": 4.00, "descripcion": "Carne, casamiento, chirimol, ensalada fresca, 2 tortillas + una soda.", "destacado": false, "imagen": null },
        { "nombre": "El de Pollo", "precio": 4.00, "descripcion": "Pierna de pollo, chirimol, ensalada fresca, 2 tortillas + una soda.", "destacado": false, "imagen": null }
      ]
    },
    {
      "id": "entradas",
      "nombre": "Entradas",
      "nota": null,
      "items": [
        { "nombre": "Alitas", "precio": 5.99, "descripcion": null, "destacado": true, "imagen": null },
        { "nombre": "Aros de Cebolla", "precio": 4.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Nachos", "precio": 5.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Chicharrones", "precio": 6.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Dedos de queso", "precio": 4.99, "descripcion": null, "destacado": true, "imagen": null },
        { "nombre": "Pan con ajo", "precio": 1.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Pan con ajo y queso", "precio": 2.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Chilones", "precio": 2.99, "descripcion": "4 unidades.", "destacado": false, "imagen": null },
        { "nombre": "Papas fritas", "precio": 3.29, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Cebollines", "precio": 2.29, "descripcion": null, "destacado": false, "imagen": null }
      ]
    },
    {
      "id": "carnes-clasicas",
      "nombre": "Carnes clásicas",
      "nota": null,
      "items": [
        { "nombre": "Plato con carne", "precio": 5.79, "descripcion": "Casamiento, ensalada fresca, chirimol y dos tortillas.", "destacado": false, "imagen": null },
        { "nombre": "Plato con pollo", "precio": 5.79, "descripcion": "Casamiento, ensalada fresca y dos tortillas.", "destacado": false, "imagen": null },
        { "nombre": "Plato con Chorizo", "precio": 5.79, "descripcion": "Dos chorizos argentinos, chirimol, ensalada fresca, casamiento y 2 tortillas.", "destacado": false, "imagen": null },
        { "nombre": "Plato Mixto #1", "precio": 6.79, "descripcion": "Carne, chorizo argentino, chirimol, ensalada fresca, casamiento y dos tortillas.", "destacado": true, "imagen": null },
        { "nombre": "Plato Mixto #2", "precio": 7.89, "descripcion": "Carne, chorizo argentino, huevo duro, casamiento, queso duro, chirimol y dos tortillas.", "destacado": false, "imagen": null },
        { "nombre": "El Choricero", "precio": 6.99, "descripcion": "6 chorizos de tuza, casamiento ó frijoles volteados, ensalada fresca, chirimol y 2 tortillas.", "destacado": true, "imagen": null },
        { "nombre": "Plato Típico", "precio": 9.99, "descripcion": "Carne, chorizo argentino, queso, plátano, aguacate, frijoles fritos, chirimol, dos tortillas y ensalada fresca.", "destacado": false, "imagen": null }
      ]
    },
    {
      "id": "picadas",
      "nombre": "Las meras Picadas",
      "nota": null,
      "items": [
        { "nombre": "Picada #1", "precio": 19.99, "descripcion": "Un delicioso azafatón combinado de alitas, dedos de queso, aros de cebolla y papas fritas.", "destacado": false, "imagen": null },
        { "nombre": "Picada #2", "precio": 32.99, "descripcion": "El azafatón que combina los clásicos que amamos tanto: chorizos de tusa, alitas, chicharrones, papas fritas, 3 tortillas fritas ó tostadas y chirimol.", "destacado": true, "imagen": null }
      ]
    },
    {
      "id": "carnes-especiales",
      "nombre": "Carnes especiales",
      "nota": null,
      "items": [
        { "nombre": "Típico Mamá Chuz", "precio": 12.99, "descripcion": "Lomo de aguja, 1/2 aguacate, queso, plátano frito, ensalada fresca, frijoles fritos, chirimol y dos tortillas.", "destacado": true, "imagen": null },
        { "nombre": "Costilla BBQ", "precio": 12.89, "descripcion": "1 libra de costillas + papas fritas.", "destacado": false, "imagen": null },
        { "nombre": "Costilla de Cerdo", "precio": 12.89, "descripcion": "Casamiento, ensalada fresca y tortillas.", "destacado": false, "imagen": null },
        { "nombre": "Puyazo Especial", "precio": 16.99, "descripcion": "Puyazo más 3 camarones a la plancha.", "destacado": false, "imagen": null },
        { "nombre": "1/2 libra de Puyazo", "precio": 14.99, "descripcion": "Casamiento, chorizo, chirimol, ensalada fresca y dos tortillas.", "destacado": false, "imagen": null },
        { "nombre": "Plato Combinado", "precio": 11.49, "descripcion": "1/4 de pollo y carne, casamiento, ensalada fresca, chirimol y dos tortillas.", "destacado": true, "imagen": null },
        { "nombre": "Plato Especial", "precio": 12.69, "descripcion": "Carne, chorizo argentino, papa con 3 ingredientes, casamiento, quesito, huevo duro, cebollines, ensalada fresca y dos tortillas.", "destacado": false, "imagen": null },
        { "nombre": "Punta Jalapeña", "precio": 16.99, "descripcion": "1/2 libra de lomo con ensalada, casamiento, salsa jalapeña y 2 tortillas.", "destacado": false, "imagen": null },
        { "nombre": "Pechuga deshuesada", "precio": 12.69, "descripcion": "Casamiento, ensalada fresca, papa con un ingrediente y dos tortillas.", "destacado": true, "imagen": null }
      ]
    },
    {
      "id": "pal-familion",
      "nombre": "Pal' Familión y la cherada",
      "nota": null,
      "items": [
        { "nombre": "Tablazo Mamá Chuz", "precio": 39.99, "descripcion": "4 medias sopas de tortilla, 1 filete de pollo, 4 filetes de res, 10 chorizos de tusa y de complemento un clásico: casamiento de la casa, chirimol y tortillas tostadas.", "destacado": true, "imagen": null },
        { "nombre": "Taquiza Mamá Chuz", "precio": 23.99, "descripcion": "10 tacos tradicionales (res, pollo ó mixtos), 1 torta tradicional (res, pollo ó mixta) más 1 soda de 1.25 litros gratis.", "destacado": false, "imagen": null },
        { "nombre": "La Parrillada", "precio": 41.99, "descripcion": "4 chuletas de cerdo, dos cuartos de pollo, cuatro filetes de carne de res, 4 chorizos, casamiento, chirimol, ensalada fresca, dos panes con ajo ó 4 tortillas y una soda de 1.25 lt.", "destacado": false, "imagen": null }
      ]
    },
    {
      "id": "platos-light",
      "nombre": "Platos Light",
      "nota": null,
      "items": [
        { "nombre": "Filete de carne", "precio": 5.79, "descripcion": "Con vegetales o ensalada fresca.", "destacado": false, "imagen": null },
        { "nombre": "Ensalada César con pollo", "precio": 7.89, "descripcion": null, "destacado": true, "imagen": null },
        { "nombre": "Pechuga de pollo", "precio": 6.99, "descripcion": "Con vegetales o ensalada fresca.", "destacado": false, "imagen": null }
      ]
    },
    {
      "id": "mariscos",
      "nombre": "Mariscos",
      "nota": null,
      "items": [
        { "nombre": "Camarones a la plancha", "precio": 17.24, "descripcion": "Casamiento, ensalada fresca, pan con ajo y papa al horno.", "destacado": false, "imagen": null },
        { "nombre": "Camarones empanizados", "precio": 19.54, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Lonja de pescado", "precio": 13.79, "descripcion": "A la plancha ó al ajillo, casamiento y ensalada fresca.", "destacado": false, "imagen": null },
        { "nombre": "Lonja empanizada", "precio": 14.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Orden de Camarones", "precio": 7.89, "descripcion": "Incluye 5 unidades.", "destacado": false, "imagen": null },
        { "nombre": "Ceviche de camarón", "precio": 11.49, "descripcion": "Con jugo de limón ó jugo de tomate.", "destacado": false, "imagen": null },
        { "nombre": "Cóctel de Camarones", "precio": 11.49, "descripcion": "En salsa rosada ó ceviche.", "destacado": true, "imagen": null }
      ]
    },
    {
      "id": "sopas",
      "nombre": "Sopas",
      "nota": "Solamente sábados y domingos",
      "items": [
        { "nombre": "Sopa de Gallina", "precio": 6.00, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "1/4 de Gallina", "precio": 5.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "1/2 Sopa de Gallina", "precio": 4.00, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Combo 1/4 de Gallina", "precio": 9.99, "descripcion": "1/4 de gallina + media sopa.", "destacado": false, "imagen": null },
        { "nombre": "Combo Familiar Gallina", "precio": 45.00, "descripcion": "Ensalada, casamiento, 4 cuartos de gallina, 4 medias sopas de gallina y soda de 1.5 lt.", "destacado": false, "imagen": null },
        { "nombre": "Combo 4 Panes con Pollo", "precio": 26.99, "descripcion": "4 panes con pollo o gallina y soda de 1.5 lt.", "destacado": false, "imagen": null }
      ]
    },
    {
      "id": "las-mexicanas",
      "nombre": "Las mexicanas",
      "nota": null,
      "items": [
        { "nombre": "Sopa de Tortilla", "precio": 5.79, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "1/2 Sopa de Tortilla", "precio": 3.59, "descripcion": null, "destacado": false, "imagen": null }
      ]
    },
    {
      "id": "tortas",
      "nombre": "Tortas",
      "nota": null,
      "items": [
        { "nombre": "Campechana", "precio": 6.89, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Mexicana", "precio": 5.99, "descripcion": "Res ó pollo.", "destacado": false, "imagen": null },
        { "nombre": "Alemana", "precio": 5.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Hawaiana", "precio": 5.99, "descripcion": "Jamón y piña.", "destacado": false, "imagen": null },
        { "nombre": "Mixta", "precio": 6.89, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Torta al pastor con piña", "precio": 7.89, "descripcion": null, "destacado": false, "imagen": null }
      ]
    },
    {
      "id": "burritos",
      "nombre": "Burritos",
      "nota": null,
      "items": [
        { "nombre": "Res", "precio": 5.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Americano", "precio": 5.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Picante", "precio": 5.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Mixto", "precio": 6.89, "descripcion": "Res y pollo.", "destacado": false, "imagen": null },
        { "nombre": "Al pastor", "precio": 6.89, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Mega Burro", "precio": 14.99, "descripcion": "45 cm. Res, pollo ó mixto.", "destacado": true, "imagen": null },
        { "nombre": "Bacon Burrito", "precio": 7.99, "descripcion": null, "destacado": true, "imagen": null }
      ]
    },
    {
      "id": "tacos",
      "nombre": "Tacos",
      "nota": null,
      "items": [
        { "nombre": "Pancho Villa", "precio": 6.89, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Pastor", "precio": 7.19, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Alambre", "precio": 7.29, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Mixtos", "precio": 6.89, "descripcion": "Res y pollo.", "destacado": false, "imagen": null },
        { "nombre": "Res", "precio": 5.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Pollo", "precio": 5.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Tacos al pastor con piña", "precio": 7.89, "descripcion": null, "destacado": false, "imagen": null }
      ]
    },
    {
      "id": "quesadillas",
      "nombre": "Quesadillas",
      "nota": null,
      "items": [
        { "nombre": "La tradicional", "precio": 6.39, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Quesadilla con hongos", "precio": 6.39, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Quesadilla con cebollines", "precio": 6.39, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Sincronizadas", "precio": 7.29, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Gringas", "precio": 6.89, "descripcion": "Res, pollo, pastor ó mixtas.", "destacado": false, "imagen": null }
      ]
    },
    {
      "id": "combos-mexicanos",
      "nombre": "Combos mexicanos",
      "nota": null,
      "items": [
        { "nombre": "Combo #1", "precio": 7.99, "descripcion": "3 tacos + 1/2 sopa de tortilla.", "destacado": false, "imagen": null },
        { "nombre": "Combo #2", "precio": 7.99, "descripcion": "1 torta jr + 1/2 sopa de tortilla.", "destacado": false, "imagen": null },
        { "nombre": "Combo #3", "precio": 9.99, "descripcion": "1 burrito + 1/2 sopa de tortilla.", "destacado": false, "imagen": null },
        { "nombre": "Combo #4", "precio": 11.99, "descripcion": "1/2 torta jr + 2 tacos + 1/2 sopa de tortilla.", "destacado": false, "imagen": null },
        { "nombre": "Combo #5", "precio": 12.99, "descripcion": "1 burrito + 2 tacos + 1/2 sopa de tortilla.", "destacado": false, "imagen": null }
      ]
    },
    {
      "id": "papas-rellenas",
      "nombre": "Papas rellenas",
      "nota": "Queso | Aderezo | Ajo | Margarina",
      "items": [
        { "nombre": "Con 1 ingrediente", "precio": 2.59, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Con 2 ingredientes", "precio": 2.89, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Con 3 ingredientes", "precio": 2.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "La de Carnitas", "precio": 5.99, "descripcion": "La Extra Especial: carne de res + 3 ingredientes.", "destacado": false, "imagen": null },
        { "nombre": "La de Carnitas con chorizo", "precio": 6.99, "descripcion": "La Extra Especial: carne y chorizo + 3 ingredientes.", "destacado": false, "imagen": null }
      ]
    },
    {
      "id": "pa-cenar",
      "nombre": "Pa' cenar",
      "nota": null,
      "items": [
        { "nombre": "La Cenita Mamá Chuz", "precio": 6.00, "descripcion": "2 huevos estrellados ó picados, casamiento ó frijoles fritos, plátano y queso ó crema.", "destacado": true, "imagen": null }
      ]
    },
    {
      "id": "infantiles",
      "nombre": "Infantiles y hamburguesas",
      "nota": null,
      "items": [
        { "nombre": "Nuggets con papas", "precio": 5.99, "descripcion": null, "destacado": true, "imagen": null },
        { "nombre": "Pizza personal", "precio": 5.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Mito Burger", "precio": 5.99, "descripcion": "Hamburguesa sólo de carne de res sin vegetales.", "destacado": false, "imagen": null },
        { "nombre": "Hamburguesa con papas", "precio": 6.99, "descripcion": null, "destacado": true, "imagen": null },
        { "nombre": "La Mera Burger", "precio": 8.89, "descripcion": "Hamburguesa con 100% carne de res, tocino, jalapeño y papas francesas.", "destacado": false, "imagen": null },
        { "nombre": "Chicken Burger", "precio": 8.79, "descripcion": "Carne de pollo, queso mozzarella, queso amarillo, aderezo ranch, vegetales, papas fritas o papa camote.", "destacado": false, "imagen": null },
        { "nombre": "Pig Burger", "precio": 9.99, "descripcion": "Carne de cerdo, aderezo chipotle, queso amarillo, vegetales, tocino, papas fritas o papa camote.", "destacado": false, "imagen": null },
        { "nombre": "La Mixta", "precio": 10.99, "descripcion": "Elegí 2 carnes entre res, pollo y cerdo. Aderezo ranch, chipotle y vegetales.", "destacado": false, "imagen": null }
      ]
    },
    {
      "id": "panes",
      "nombre": "Panes",
      "nota": null,
      "items": [
        { "nombre": "Pan con Gallina ó pollo", "precio": 6.99, "descripcion": null, "destacado": true, "imagen": null },
        { "nombre": "Pan Mixto #1", "precio": 3.99, "descripcion": "Relleno de casamiento, chirimol y chorizo argentino.", "destacado": true, "imagen": null },
        { "nombre": "Pan Mixto #2", "precio": 4.99, "descripcion": "Relleno de casamiento, chirimol y filete de carne.", "destacado": true, "imagen": null },
        { "nombre": "Torta de Carne", "precio": 4.19, "descripcion": "Filete de carne + huevo.", "destacado": false, "imagen": null },
        { "nombre": "El de casamiento", "precio": 2.99, "descripcion": null, "destacado": false, "imagen": null }
      ]
    },
    {
      "id": "extras",
      "nombre": "Extras",
      "nota": null,
      "items": [
        { "nombre": "Orden de queso", "precio": 1.99, "descripcion": "Queso rallado ó crema.", "destacado": false, "imagen": null },
        { "nombre": "1/2 aguacate", "precio": 1.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "1/2 aguacate con aderezo", "precio": 2.29, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Orden de limón", "precio": 1.39, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Chiles Toreados", "precio": 2.69, "descripcion": "3 unidades.", "destacado": false, "imagen": null },
        { "nombre": "Aderezo ó escabeche", "precio": 2.89, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Orden de plátano", "precio": 2.89, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Orden de hielo", "precio": 1.39, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Tortilla", "precio": 0.39, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Filete de carne de res", "precio": 3.69, "descripcion": "Dos tortillas y chirimol.", "destacado": false, "imagen": null },
        { "nombre": "Filete de pollo", "precio": 4.29, "descripcion": "Dos tortillas y chirimol.", "destacado": false, "imagen": null },
        { "nombre": "1/4 de pollo", "precio": 3.89, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Frijoles fritos ó casamiento", "precio": 2.99, "descripcion": "Más 2 tortillas.", "destacado": false, "imagen": null },
        { "nombre": "Ensalada fresca", "precio": 5.99, "descripcion": "Con queso y aguacate.", "destacado": false, "imagen": null },
        { "nombre": "Chorizo Extra", "precio": 1.99, "descripcion": null, "destacado": false, "imagen": null }
      ]
    }
  ]
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

```bash
npm test
```

Esperado: PASS, 8 tests. Las bebidas todavía no están; el test no las exige.

- [ ] **Step 5: Commit**

```bash
git add src/data/menu.json tests/menu.test.js
git commit -m "feat: add food menu data with schema tests"
```

---

### Task 5: Bebidas y postres

**Files:**
- Modify: `src/data/menu.json`
- Modify: `tests/menu.test.js`

- [ ] **Step 1: Escribir el test que falla**

Agregar al final de `describe('menu.json', …)` en `tests/menu.test.js`:

```javascript
  it('tiene las 28 categorías del PDF', () => {
    expect(menu.categorias).toHaveLength(28);
  });

  it('incluye las categorías de bebida', () => {
    const ids = menu.categorias.map((c) => c.id);
    for (const id of ['bebidas-frias', 'sodas', 'cervezas', 'micheladas', 'cocteles', 'baldes', 'bebidas-calientes', 'postres']) {
      expect(ids).toContain(id);
    }
  });
```

- [ ] **Step 2: Correr el test y verificar que falla**

```bash
npm test
```

Esperado: FAIL con `expected [ …20 items ] to have a length of 28 but got 20`.

- [ ] **Step 3: Agregar las categorías de bebida a `menu.json`**

Transcripción de las páginas 7 a 9. Van dentro del array `categorias`, después de `extras`.

Nota de agrupación: el PDF separa "Cervezas nacionales" y "Cervezas premium" en dos bloques
visuales. Acá van en una sola categoría `cervezas`, con la distinción en la descripción de
cada ítem, porque como listado de precios se leen mejor juntas.

```json
    {
      "id": "bebidas-frias",
      "nombre": "Bebidas frías",
      "nota": null,
      "items": [
        { "nombre": "Jugo de naranja", "precio": 2.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Jugo de naranja con huevo", "precio": 3.49, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Jugo de naranja con zanahoria", "precio": 3.49, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Naranja con apio", "precio": 3.49, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Refresco de ensalada", "precio": 2.89, "descripcion": null, "destacado": true, "imagen": null },
        { "nombre": "Refresco de horchata", "precio": 2.89, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Refresco de tamarindo", "precio": 2.89, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Refresco de Jamaica", "precio": 2.89, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Limonada", "precio": 2.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Limonada con soda", "precio": 3.29, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Limonada Mamá Chuz", "precio": 3.49, "descripcion": "Hierba buena, rosa ó con pepino.", "destacado": false, "imagen": null },
        { "nombre": "Licuados", "precio": 3.29, "descripcion": "Fresa, papaya, melón, zapote ó coco.", "destacado": false, "imagen": null },
        { "nombre": "Frozen de limón", "precio": 5.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Frozen de estación", "precio": 5.09, "descripcion": "Sandía, fresa, melón, papaya, piña ó coco.", "destacado": false, "imagen": null },
        { "nombre": "Licuados Mixtos", "precio": 4.39, "descripcion": "Doble fruta.", "destacado": false, "imagen": null },
        { "nombre": "Refrescos Dobles", "precio": 5.79, "descripcion": null, "destacado": false, "imagen": null }
      ]
    },
    {
      "id": "sodas",
      "nombre": "Sodas y más",
      "nota": null,
      "items": [
        { "nombre": "Agua en botella", "precio": 1.29, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Gaseosa", "precio": 1.89, "descripcion": "Vidrio o lata.", "destacado": false, "imagen": null },
        { "nombre": "Té Lipton", "precio": 1.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Soda Familiar 3 litros", "precio": 5.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Soda Familiar 2.5 litros", "precio": 3.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Soda Familiar 1.25 litros", "precio": 2.99, "descripcion": null, "destacado": false, "imagen": null }
      ]
    },
    {
      "id": "cervezas",
      "nombre": "Cervezas",
      "nota": null,
      "items": [
        { "nombre": "Pilsener", "precio": 1.99, "descripcion": "Nacional.", "destacado": false, "imagen": null },
        { "nombre": "Golden", "precio": 1.99, "descripcion": "Nacional.", "destacado": false, "imagen": null },
        { "nombre": "Regia", "precio": 4.89, "descripcion": "Nacional.", "destacado": false, "imagen": null },
        { "nombre": "Corona", "precio": 2.89, "descripcion": "Premium.", "destacado": false, "imagen": null },
        { "nombre": "Michelob Ultra", "precio": 2.89, "descripcion": "Premium.", "destacado": false, "imagen": null },
        { "nombre": "Heineken", "precio": 2.89, "descripcion": "Premium.", "destacado": false, "imagen": null },
        { "nombre": "Miller", "precio": 2.89, "descripcion": "Premium.", "destacado": false, "imagen": null },
        { "nombre": "Modelo", "precio": 2.89, "descripcion": "Premium.", "destacado": false, "imagen": null },
        { "nombre": "Stella Artois", "precio": 2.99, "descripcion": "Premium.", "destacado": false, "imagen": null },
        { "nombre": "Suprema", "precio": 2.89, "descripcion": "Premium.", "destacado": false, "imagen": null },
        { "nombre": "Smirnoff Ice", "precio": 2.89, "descripcion": "Premium.", "destacado": false, "imagen": null }
      ]
    },
    {
      "id": "micheladas",
      "nombre": "Micheladas y mixes",
      "nota": null,
      "items": [
        { "nombre": "Michelada Nacional", "precio": 3.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Michelada Extranjera", "precio": 4.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Mix de Michelada", "precio": 2.79, "descripcion": null, "destacado": false, "imagen": null }
      ]
    },
    {
      "id": "cocteles",
      "nombre": "Cócteles",
      "nota": null,
      "items": [
        { "nombre": "Margarita", "precio": 5.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Mojito", "precio": 5.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Piña Colada", "precio": 5.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Tequila", "precio": 5.99, "descripcion": null, "destacado": false, "imagen": null }
      ]
    },
    {
      "id": "baldes",
      "nombre": "Baldes",
      "nota": "6 unidades",
      "items": [
        { "nombre": "Pilsener", "precio": 11.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Golden y Extra", "precio": 11.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Corona", "precio": 16.79, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Suprema", "precio": 14.10, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Regia Chola", "precio": 14.99, "descripcion": "3 unidades.", "destacado": false, "imagen": null },
        { "nombre": "Modelo", "precio": 16.79, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Miller", "precio": 14.99, "descripcion": null, "destacado": false, "imagen": null }
      ]
    },
    {
      "id": "bebidas-calientes",
      "nombre": "Bebidas calientes",
      "nota": null,
      "items": [
        { "nombre": "Té", "precio": 1.89, "descripcion": "Manzanilla, canela ó jamaica.", "destacado": false, "imagen": null },
        { "nombre": "Café", "precio": 1.29, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Café con leche", "precio": 1.89, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Café con refill", "precio": 1.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Chocolate", "precio": 1.89, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Chocolate con leche", "precio": 2.49, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Leche", "precio": 1.89, "descripcion": null, "destacado": false, "imagen": null }
      ]
    },
    {
      "id": "postres",
      "nombre": "Postres",
      "nota": "Tardes dulces: por la compra de un postre llevate un café gratis",
      "items": [
        { "nombre": "Tres Leches", "precio": 3.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Pie de Limón", "precio": 3.89, "descripcion": null, "destacado": true, "imagen": null },
        { "nombre": "Brownie a la moda", "precio": 3.89, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Cheesecake", "precio": 3.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Hojuelas con sorbete", "precio": 3.99, "descripcion": null, "destacado": false, "imagen": null },
        { "nombre": "Pie de Chocolate", "precio": 3.89, "descripcion": null, "destacado": false, "imagen": null }
      ]
    }
```

- [ ] **Step 4: Correr el test y verificar que pasa**

```bash
npm test
```

Esperado: PASS, 10 tests. Las 28 categorías presentes, 21 destacados.

- [ ] **Step 5: Commit**

```bash
git add src/data/menu.json tests/menu.test.js
git commit -m "feat: add drinks and desserts to menu data"
```

---

### Task 6: Tokens de color y paletas

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`

- [ ] **Step 1: Crear `src/styles/tokens.css`**

`@theme` declara los tokens y hace que Tailwind genere las utilidades (`bg-marca`,
`text-acento`, …). Las utilidades de Tailwind v4 compilan a `var(--color-marca)`, así que
sobrescribir esa variable bajo `html[data-palette="…"]` repinta la página entera sin
recompilar. Los selectores de paleta usan `html[…]` (especificidad 0,1,1) para ganarle
al `:root` que emite `@theme` (0,1,0), sin depender del orden de las reglas.

```css
@theme {
  /* Paleta por defecto: los colores del PDF del menú 2025 */
  --color-marca: #3b2416;
  --color-marca-suave: #6b5238;
  --color-acento: #e8922a;
  --color-acento-fuerte: #c8761a;
  --color-fondo: #f5ebdd;
  --color-fondo-alt: #efe3d2;
  --color-superficie: #ffffff;
  --color-texto: #2e2418;
  --color-texto-suave: #6b5238;
  --color-linea: #ddd0bb;
  --color-exito: #1f8a4c;
  --color-sombra: #3b2416;

  /* Tipografía */
  --font-titulo: 'Archivo Black', system-ui, sans-serif;
  --font-cuerpo: 'Inter', system-ui, sans-serif;

  /* Radios */
  --radius-tarjeta: 0.75rem;
  --radius-boton: 999px;
}

html[data-palette='crema'] {
  --color-marca: #4a3627;
  --color-marca-suave: #7d6753;
  --color-acento: #e0872b;
  --color-acento-fuerte: #bf6d1c;
  --color-fondo: #fbf7f1;
  --color-fondo-alt: #f2ece2;
  --color-superficie: #ffffff;
  --color-texto: #33291f;
  --color-texto-suave: #6f6153;
  --color-linea: #e3dacd;
  --color-exito: #1f8a4c;
  --color-sombra: #4a3627;
}

html[data-palette='terracota'] {
  --color-marca: #52251a;
  --color-marca-suave: #8a4a37;
  --color-acento: #c2451f;
  --color-acento-fuerte: #9c3416;
  --color-fondo: #faf1e8;
  --color-fondo-alt: #f2e2d4;
  --color-superficie: #ffffff;
  --color-texto: #341a12;
  --color-texto-suave: #6d4636;
  --color-linea: #e0cbb8;
  --color-exito: #1f7a48;
  --color-sombra: #52251a;
}

html[data-palette='carbon'] {
  --color-marca: #f5ebdd;
  --color-marca-suave: #c9b49f;
  --color-acento: #ff6b1a;
  --color-acento-fuerte: #ff8a3d;
  --color-fondo: #140d08;
  --color-fondo-alt: #1f1610;
  --color-superficie: #241710;
  --color-texto: #fff6ea;
  --color-texto-suave: #c9b49f;
  --color-linea: #3a2517;
  --color-exito: #35c47a;
  --color-sombra: #000000;
}
```

Los cuatro bloques declaran **exactamente los mismos 12 tokens**. Si se agrega un token nuevo,
va en los cuatro o la paleta que lo omita hereda el valor del `@theme` por defecto y se rompe
visualmente. La Task 7 agrega un test que lo verifica.

- [ ] **Step 2: Crear `src/styles/global.css`**

```css
@import 'tailwindcss';
@import './tokens.css';

body {
  background-color: var(--color-fondo);
  color: var(--color-texto);
  font-family: var(--font-cuerpo);
}

h1, h2, h3 {
  font-family: var(--font-titulo);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/
git commit -m "feat: add color tokens with four palettes"
```

---

### Task 7: Guarda contra colores literales

**Files:**
- Create: `tests/no-colores-literales.test.js`

Esta es la prueba que sostiene la reunión del jueves. Si alguien escribe un color dentro de un
componente, la paleta deja de ser intercambiable y hay que descubrirlo automáticamente.

- [ ] **Step 1: Escribir el test**

`tests/no-colores-literales.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function archivosEn(dir, ext) {
  const salida = [];
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) salida.push(...archivosEn(ruta, ext));
    else if (nombre.endsWith(ext)) salida.push(ruta);
  }
  return salida;
}

const HEX = /#[0-9a-fA-F]{3,8}\b/;
const FUNCION_COLOR = /\b(rgba?|hsla?|oklch|color-mix)\s*\(/;
const TAILWIND_POR_DEFECTO =
  /\b(bg|text|border|from|to|via|ring|outline|decoration|shadow)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/;

describe('ningún componente escribe color literal', () => {
  const fuentes = [
    ...archivosEn('src/components', '.astro'),
    ...archivosEn('src/layouts', '.astro'),
    ...archivosEn('src/pages', '.astro'),
  ];

  it('encuentra archivos que revisar', () => {
    expect(fuentes.length).toBeGreaterThan(0);
  });

  for (const ruta of fuentes) {
    it(`${ruta} no tiene hex ni rgb() ni hsl()`, () => {
      const texto = readFileSync(ruta, 'utf8');
      expect(HEX.test(texto), `hex encontrado en ${ruta}`).toBe(false);
      expect(FUNCION_COLOR.test(texto), `función de color en ${ruta}`).toBe(false);
    });

    it(`${ruta} no usa la paleta por defecto de Tailwind`, () => {
      const texto = readFileSync(ruta, 'utf8');
      expect(TAILWIND_POR_DEFECTO.test(texto), `color de Tailwind en ${ruta}`).toBe(false);
    });
  }
});

describe('las cuatro paletas declaran los mismos tokens', () => {
  const css = readFileSync('src/styles/tokens.css', 'utf8');

  function tokensDe(bloque) {
    return new Set([...bloque.matchAll(/--color-[a-z-]+(?=\s*:)/g)].map((m) => m[0]));
  }

  const bloques = [...css.matchAll(/(?:@theme|html\[data-palette='[a-z]+'\])\s*\{([^}]*)\}/g)].map(
    (m) => m[1],
  );

  it('hay tres bloques de paleta más el bloque @theme', () => {
    expect(bloques).toHaveLength(4);
  });

  it('todas las paletas declaran el mismo conjunto de tokens de color', () => {
    const base = tokensDe(bloques[0]);
    expect(base.size).toBe(12);
    for (const bloque of bloques.slice(1)) {
      expect([...tokensDe(bloque)].sort()).toEqual([...base].sort());
    }
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

```bash
npm test
```

Esperado: FAIL en `encuentra archivos que revisar` con `ENOENT: no such file or directory,
scandir 'src/components'` — todavía no existe la carpeta. Es el fallo correcto: el test está
listo antes que los componentes.

- [ ] **Step 3: Crear la carpeta de componentes con un archivo mínimo**

`src/components/.gitkeep` no sirve porque el test busca `.astro`. Crear
`src/components/Hero.astro` con contenido mínimo, que la Task 9 completa:

```astro
---
---
<section class="bg-fondo text-texto">
  <h1>Carnitas Mamá Chuz</h1>
</section>
```

- [ ] **Step 4: Correr el test y verificar que pasa**

```bash
npm test
```

Esperado: PASS. La guarda de colores y la de paridad de paletas en verde.

- [ ] **Step 5: Commit**

```bash
git add tests/no-colores-literales.test.js src/components/Hero.astro
git commit -m "test: guard against literal colors outside tokens"
```

---

### Task 8: Utilidades de menú y WhatsApp

**Files:**
- Create: `src/lib/menu.js`
- Create: `src/lib/whatsapp.js`
- Create: `tests/lib.test.js`

- [ ] **Step 1: Escribir el test que falla**

`tests/lib.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { destacados, categorias, formatearPrecio } from '../src/lib/menu.js';
import { enlaceWhatsapp } from '../src/lib/whatsapp.js';

describe('menu.js', () => {
  it('destacados devuelve solo platos con destacado true', () => {
    const lista = destacados();
    expect(lista.length).toBeGreaterThanOrEqual(12);
    expect(lista.every((i) => i.destacado === true)).toBe(true);
  });

  it('cada destacado lleva el nombre de su categoría', () => {
    for (const i of destacados()) {
      expect(typeof i.categoria).toBe('string');
      expect(i.categoria.length).toBeGreaterThan(0);
    }
  });

  it('categorias devuelve las 28 con id y nombre', () => {
    const lista = categorias();
    expect(lista).toHaveLength(28);
    expect(lista[0]).toHaveProperty('id');
    expect(lista[0]).toHaveProperty('nombre');
  });

  it('formatearPrecio pone dos decimales y el signo', () => {
    expect(formatearPrecio(4)).toBe('$4.00');
    expect(formatearPrecio(14.1)).toBe('$14.10');
    expect(formatearPrecio(6.79)).toBe('$6.79');
  });
});

describe('whatsapp.js', () => {
  it('arma el enlace con el número y el mensaje codificado', () => {
    expect(enlaceWhatsapp('50371715309', 'Hola, quiero reservar')).toBe(
      'https://wa.me/50371715309?text=Hola%2C%20quiero%20reservar',
    );
  });

  it('sin mensaje devuelve el enlace pelado', () => {
    expect(enlaceWhatsapp('50361801581')).toBe('https://wa.me/50361801581');
  });

  it('rechaza un número mal formado', () => {
    expect(() => enlaceWhatsapp('+503 7171 5309')).toThrow();
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

```bash
npm test
```

Esperado: FAIL con `Failed to resolve import "../src/lib/menu.js"`.

- [ ] **Step 3: Crear `src/lib/menu.js`**

```javascript
import menu from '../data/menu.json';

export function categorias() {
  return menu.categorias.map(({ id, nombre, nota }) => ({ id, nombre, nota }));
}

export function destacados() {
  return menu.categorias.flatMap((c) =>
    c.items.filter((i) => i.destacado).map((i) => ({ ...i, categoria: c.nombre })),
  );
}

export function formatearPrecio(precio) {
  return `$${precio.toFixed(2)}`;
}

export default menu;
```

- [ ] **Step 4: Crear `src/lib/whatsapp.js`**

```javascript
export function enlaceWhatsapp(numero, mensaje) {
  if (!/^503\d{8}$/.test(numero)) {
    throw new Error(`Número de WhatsApp inválido: ${numero}. Se espera 503 + 8 dígitos.`);
  }
  const base = `https://wa.me/${numero}`;
  if (!mensaje) return base;
  return `${base}?text=${encodeURIComponent(mensaje)}`;
}
```

`encodeURIComponent` deja los espacios como `%20`, que es lo que espera el test.

- [ ] **Step 5: Correr el test y verificar que pasa**

```bash
npm test
```

Esperado: PASS, 7 tests nuevos.

- [ ] **Step 6: Commit**

```bash
git add src/lib/ tests/lib.test.js
git commit -m "feat: add menu and whatsapp helpers"
```

---

### Task 9: Layout base y Hero

**Files:**
- Create: `src/layouts/Base.astro`
- Modify: `src/components/Hero.astro`

- [ ] **Step 1: Crear `src/layouts/Base.astro`**

```astro
---
import '../styles/global.css';

const { titulo, descripcion } = Astro.props;
const paletaInicial = import.meta.env.PUBLIC_PALETA ?? 'pdf';
---
<html lang="es" data-palette={paletaInicial}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{titulo}</title>
    <meta name="description" content={descripcion} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;600;800&display=swap"
    />
  </head>
  <body>
    <slot />
  </body>
</html>
```

`data-palette` sale de una variable de entorno para que el valor por defecto se pueda cambiar
sin editar código. Si no está definida, usa `pdf`.

- [ ] **Step 2: Escribir `src/components/Hero.astro` completo**

```astro
---
import datos from '../data/sucursales.json';
import { enlaceWhatsapp } from '../lib/whatsapp.js';

const wa = enlaceWhatsapp(
  datos.eventos.whatsapp,
  'Hola, vi la página de Carnitas Mamá Chuz y quiero hacer una consulta.',
);
---
<section class="bg-fondo-alt px-6 py-20 md:py-28">
  <div class="mx-auto max-w-5xl">
    <p class="text-xs tracking-[0.22em] text-marca-suave uppercase">
      La Original · Desde {datos.negocio.desde}
    </p>
    <h1 class="mt-4 text-5xl leading-none text-marca md:text-7xl">
      La original,<br />desde siempre
    </h1>
    <p class="mt-6 max-w-xl text-lg text-texto-suave">
      Carnitas, chorizo de tusa y casamiento como los hace la familia hace
      {new Date().getFullYear() - datos.negocio.desde} años.
    </p>
    <div class="mt-8 flex flex-wrap gap-3">
      <a
        href="/menu"
        class="rounded-boton bg-acento px-7 py-3 font-semibold text-fondo transition-colors hover:bg-acento-fuerte"
      >
        Ver el menú
      </a>
      <a
        href={wa}
        class="rounded-boton border border-marca px-7 py-3 font-semibold text-marca transition-colors hover:bg-marca hover:text-fondo"
      >
        Escribinos
      </a>
    </div>
  </div>
</section>
```

El cálculo de años usa el año actual, así que la página nunca dice "45 años" cuando ya son 46.

- [ ] **Step 3: Correr los tests**

```bash
npm test
```

Esperado: PASS. La guarda de colores sigue en verde porque el Hero solo usa utilidades de
token.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Base.astro src/components/Hero.astro
git commit -m "feat: add base layout and hero section"
```

---

### Task 10: Historia y Destacados

**Files:**
- Create: `src/components/Historia.astro`
- Create: `src/components/Destacados.astro`

- [ ] **Step 1: Crear `src/components/Historia.astro`**

El texto es provisional hasta que el cliente entregue el suyo. Va marcado con un comentario
para que sea fácil de encontrar.

```astro
---
import datos from '../data/sucursales.json';
const anios = new Date().getFullYear() - datos.negocio.desde;
---
<section id="historia" class="bg-fondo px-6 py-20">
  <div class="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:items-center">
    <div>
      <p class="text-xs tracking-[0.22em] text-acento uppercase">Nuestra historia</p>
      <h2 class="mt-3 text-4xl leading-tight text-marca">{anios} años de brasa</h2>
      <!-- TEXTO PROVISIONAL: reemplazar con el relato que entregue el cliente -->
      <p class="mt-5 text-texto-suave">
        Lo que empezó en 1980 como un puesto de carnitas hoy alimenta a tres generaciones
        en dos sucursales. La receta no cambió: carne al fuego, casamiento de la casa y
        chirimol hecho el mismo día.
      </p>
      <p class="mt-4 text-texto-suave">
        Cada plato que sale de la cocina lleva el nombre de Mamá Chuz, y eso es lo que
        cuidamos desde el primer día.
      </p>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <img
        data-placeholder="true"
        src="https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=800&q=70"
        alt="Interior del restaurante"
        loading="lazy"
        class="col-span-2 h-56 w-full rounded-tarjeta object-cover"
      />
      <img
        data-placeholder="true"
        src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=70"
        alt="Carne a la parrilla"
        loading="lazy"
        class="h-40 w-full rounded-tarjeta object-cover"
      />
      <img
        data-placeholder="true"
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=70"
        alt="Plato servido en mesa"
        loading="lazy"
        class="h-40 w-full rounded-tarjeta object-cover"
      />
    </div>
  </div>
</section>
```

Cada imagen de stock lleva `data-placeholder="true"`. Para listarlas todas cuando llegue la
sesión de fotos: `grep -rn 'data-placeholder' src/`.

- [ ] **Step 2: Crear `src/components/Destacados.astro`**

```astro
---
import { destacados, formatearPrecio } from '../lib/menu.js';
const platos = destacados();
---
<section id="destacados" class="bg-fondo-alt px-6 py-20">
  <div class="mx-auto max-w-6xl">
    <p class="text-xs tracking-[0.22em] text-acento uppercase">Los que más piden</p>
    <h2 class="mt-3 text-4xl text-marca">Nuestros destacados</h2>

    <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {platos.map((plato) => (
        <article class="flex flex-col rounded-tarjeta bg-superficie p-5 shadow-sm">
          <p class="text-xs tracking-wider text-texto-suave uppercase">{plato.categoria}</p>
          <h3 class="mt-2 text-xl text-marca">{plato.nombre}</h3>
          {plato.descripcion && (
            <p class="mt-2 flex-1 text-sm text-texto-suave">{plato.descripcion}</p>
          )}
          <p class="mt-4 text-2xl font-bold text-acento">{formatearPrecio(plato.precio)}</p>
        </article>
      ))}
    </div>

    <a
      href="/menu"
      class="mt-10 inline-block rounded-boton bg-marca px-7 py-3 font-semibold text-fondo transition-colors hover:bg-marca-suave"
    >
      Ver el menú completo
    </a>
  </div>
</section>
```

Sin fotos en las tarjetas: el campo `imagen` de todos los platos está en `null` y una tarjeta
con marcador gris se ve peor que una tarjeta tipográfica limpia. Cuando haya fotos reales, se
llena `imagen` en `menu.json` y se agrega el `<img>` acá.

- [ ] **Step 3: Correr los tests**

```bash
npm test
```

Esperado: PASS, incluida la guarda de colores sobre los dos componentes nuevos.

- [ ] **Step 4: Commit**

```bash
git add src/components/Historia.astro src/components/Destacados.astro
git commit -m "feat: add historia and destacados sections"
```

---

### Task 11: Sucursales, Eventos y Footer

**Files:**
- Create: `src/components/Sucursales.astro`
- Create: `src/components/Eventos.astro`
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Crear `src/components/Sucursales.astro`**

```astro
---
import datos from '../data/sucursales.json';
import { enlaceWhatsapp } from '../lib/whatsapp.js';
---
<section id="sucursales" class="bg-fondo px-6 py-20">
  <div class="mx-auto max-w-5xl">
    <p class="text-xs tracking-[0.22em] text-acento uppercase">Dónde estamos</p>
    <h2 class="mt-3 text-4xl text-marca">Nuestras sucursales</h2>

    <div class="mt-10 grid gap-6 md:grid-cols-2">
      {datos.sucursales.map((s) => (
        <article class="rounded-tarjeta border border-linea bg-superficie p-6">
          <h3 class="text-2xl text-marca">{s.nombre}</h3>
          <p class="mt-3 text-texto-suave">{s.direccion}</p>
          <p class="text-texto-suave">{s.ciudad}</p>
          {s.horario && <p class="mt-3 text-sm text-texto-suave">{s.horario}</p>}
          <div class="mt-5 flex flex-wrap gap-3">
            <a
              href={enlaceWhatsapp(s.whatsapp, `Hola, quiero consultar por la sucursal ${s.nombre}.`)}
              class="rounded-boton bg-exito px-5 py-2 text-sm font-semibold text-fondo"
            >
              WhatsApp
            </a>
            <a
              href={s.mapa}
              target="_blank"
              rel="noopener"
              class="rounded-boton border border-marca px-5 py-2 text-sm font-semibold text-marca"
            >
              Cómo llegar
            </a>
          </div>
        </article>
      ))}
    </div>
  </div>
</section>
```

El horario solo se renderiza si existe. Mientras sea `null` en `sucursales.json`, la tarjeta
simplemente no lo muestra.

- [ ] **Step 2: Crear `src/components/Eventos.astro`**

```astro
---
import datos from '../data/sucursales.json';
import { enlaceWhatsapp } from '../lib/whatsapp.js';

const wa = enlaceWhatsapp(
  datos.eventos.whatsapp,
  'Hola, quiero cotizar un evento en Carnitas Mamá Chuz.',
);
---
<section id="eventos" class="bg-marca px-6 py-20">
  <div class="mx-auto max-w-4xl text-center">
    <p class="text-xs tracking-[0.22em] text-acento uppercase">Reserva para eventos</p>
    <h2 class="mt-3 text-4xl text-fondo">Celebremos juntos tus mejores momentos</h2>
    <p class="mt-5 text-fondo-alt">{datos.eventos.tipos.join(' · ')} y mucho más.</p>
    <a
      href={wa}
      class="mt-8 inline-block rounded-boton bg-acento px-8 py-3 font-semibold text-marca transition-colors hover:bg-acento-fuerte"
    >
      Cotizar por WhatsApp
    </a>
  </div>
</section>
```

- [ ] **Step 3: Crear `src/components/Footer.astro`**

```astro
---
import datos from '../data/sucursales.json';
---
<footer class="bg-fondo-alt px-6 py-14">
  <div class="mx-auto max-w-5xl">
    <p class="text-2xl text-marca">{datos.negocio.nombre}</p>
    <p class="mt-1 text-sm text-texto-suave">
      {datos.negocio.lema} · Desde {datos.negocio.desde}
    </p>

    <div class="mt-6 flex flex-wrap gap-5 text-sm font-semibold text-marca">
      <a href={datos.redes.instagram} target="_blank" rel="noopener">Instagram</a>
      <a href={datos.redes.facebook} target="_blank" rel="noopener">Facebook</a>
      <a href={datos.redes.tiktok} target="_blank" rel="noopener">TikTok</a>
      <a href={`mailto:${datos.negocio.correo}`}>{datos.negocio.correo}</a>
    </div>

    <div class="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-linea pt-6 text-sm text-texto-suave">
      <span>{datos.negocio.propina}</span>
      <span>Aceptamos {datos.negocio.pagos.join(' y ')}</span>
      <a href="/menu-2025.pdf" download class="font-semibold text-marca">Descargar el menú en PDF</a>
    </div>
  </div>
</footer>
```

- [ ] **Step 4: Correr los tests**

```bash
npm test
```

Esperado: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Sucursales.astro src/components/Eventos.astro src/components/Footer.astro
git commit -m "feat: add sucursales, eventos and footer sections"
```

---

### Task 12: Armar la landing

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Reemplazar `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import Historia from '../components/Historia.astro';
import Destacados from '../components/Destacados.astro';
import Sucursales from '../components/Sucursales.astro';
import Eventos from '../components/Eventos.astro';
import Footer from '../components/Footer.astro';
---
<Base
  titulo="Carnitas Mamá Chuz — La Original desde 1980"
  descripcion="Restaurante salvadoreño desde 1980. Carnitas, chorizo de tusa, mariscos y comida mexicana en San Salvador y Santa Tecla."
>
  <Hero />
  <Historia />
  <Destacados />
  <Sucursales />
  <Eventos />
  <Footer />
</Base>
```

- [ ] **Step 2: Verificar el build**

```bash
npm run build
```

Esperado: `astro build` termina sin errores y genera `dist/index.html`.

- [ ] **Step 3: Revisar la página en el navegador**

```bash
npm run preview
```

Abrir la URL que imprime. Confirmar que se ven las seis secciones, que los colores salen de la
paleta `pdf`, y que los botones de WhatsApp abren con el mensaje prellenado. Cortar con Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: assemble landing page"
```

---

### Task 13: Página de menú

**Files:**
- Create: `src/components/MenuCategoria.astro`
- Create: `src/pages/menu.astro`

- [ ] **Step 1: Crear `src/components/MenuCategoria.astro`**

```astro
---
import { formatearPrecio } from '../lib/menu.js';
const { categoria } = Astro.props;
---
<section id={categoria.id} class="scroll-mt-24 border-t border-linea py-10">
  <div class="flex flex-wrap items-baseline gap-3">
    <h2 class="text-3xl text-marca">{categoria.nombre}</h2>
    {categoria.nota && (
      <span class="rounded-boton bg-acento px-3 py-1 text-xs font-semibold text-marca">
        {categoria.nota}
      </span>
    )}
  </div>

  <ul class="mt-6 grid gap-x-10 gap-y-5 md:grid-cols-2">
    {categoria.items.map((item) => (
      <li
        class="plato flex items-baseline gap-3"
        data-nombre={item.nombre.toLowerCase()}
        data-descripcion={(item.descripcion ?? '').toLowerCase()}
      >
        <div class="flex-1">
          <p class="font-semibold text-texto">
            {item.nombre}
            {item.destacado && <span class="ml-1 text-acento" aria-label="Destacado">★</span>}
          </p>
          {item.descripcion && <p class="text-sm text-texto-suave">{item.descripcion}</p>}
        </div>
        <p class="font-bold text-marca">{formatearPrecio(item.precio)}</p>
      </li>
    ))}
  </ul>
</section>
```

- [ ] **Step 2: Crear `src/pages/menu.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import MenuCategoria from '../components/MenuCategoria.astro';
import Footer from '../components/Footer.astro';
import menu from '../lib/menu.js';
---
<Base
  titulo="Menú completo — Carnitas Mamá Chuz"
  descripcion="Menú completo de Carnitas Mamá Chuz: carnes, mariscos, comida mexicana, bebidas y postres, con precios actualizados."
>
  <header class="bg-fondo-alt px-6 py-14">
    <div class="mx-auto max-w-5xl">
      <a href="/" class="text-sm font-semibold text-texto-suave">← Volver al inicio</a>
      <h1 class="mt-4 text-5xl text-marca">Menú completo</h1>
      <p class="mt-3 text-texto-suave">{menu.nota}</p>
      <a
        href="/menu-2025.pdf"
        download
        class="mt-6 inline-block rounded-boton bg-acento px-6 py-2.5 text-sm font-semibold text-marca"
      >
        Descargar en PDF
      </a>
    </div>
  </header>

  <nav class="sticky top-0 z-10 border-b border-linea bg-fondo px-6 py-3">
    <div class="mx-auto flex max-w-5xl gap-2 overflow-x-auto">
      {menu.categorias.map((c) => (
        <a
          href={`#${c.id}`}
          class="shrink-0 rounded-boton border border-linea px-3 py-1.5 text-sm text-texto-suave"
        >
          {c.nombre}
        </a>
      ))}
    </div>
  </nav>

  <main class="mx-auto max-w-5xl px-6 pb-16">
    {menu.categorias.map((c) => <MenuCategoria categoria={c} />)}
  </main>

  <Footer />
</Base>
```

- [ ] **Step 3: Verificar el build**

```bash
npm run build
```

Esperado: sin errores, genera `dist/menu/index.html`.

- [ ] **Step 4: Contar los platos renderizados**

```bash
node --input-type=module -e "import {readFileSync} from 'node:fs';const t=readFileSync('dist/menu/index.html','utf8');console.log('en html:',(t.match(/class=\"plato/g)||[]).length)"
```

Esperado: el mismo número de platos que hay en `menu.json`. Comprobarlo contra:

```bash
node --input-type=module -e "import {readFileSync} from 'node:fs';const m=JSON.parse(readFileSync('src/data/menu.json','utf8'));console.log('en json:',m.categorias.flatMap(c=>c.items).length)"
```

Se usa `--input-type=module` porque Astro deja `"type": "module"` en `package.json` y `require`
no existe en ese contexto.

Los dos números tienen que coincidir. Si no, hay una categoría que no se está renderizando.

- [ ] **Step 5: Commit**

```bash
git add src/components/MenuCategoria.astro src/pages/menu.astro
git commit -m "feat: add full menu page"
```

---

### Task 14: Buscador del menú

**Files:**
- Create: `src/components/MenuBuscador.astro`
- Modify: `src/pages/menu.astro`

- [ ] **Step 1: Crear `src/components/MenuBuscador.astro`**

El menú completo ya está en el HTML. El buscador solo esconde nodos, así que si el JavaScript
falla, el menú sigue completo y legible.

```astro
<div class="mx-auto max-w-5xl px-6 pt-5">
  <label for="buscador" class="sr-only">Buscar en el menú</label>
  <input
    id="buscador"
    type="search"
    placeholder="Buscar un plato…"
    autocomplete="off"
    class="w-full rounded-tarjeta border border-linea bg-superficie px-4 py-3 text-texto placeholder:text-texto-suave"
  />
  <p id="sin-resultados" class="mt-3 hidden text-sm text-texto-suave">
    No encontramos ese plato. Probá con otra palabra.
  </p>
</div>

<script>
  const entrada = document.getElementById('buscador');
  const aviso = document.getElementById('sin-resultados');
  const platos = [...document.querySelectorAll('.plato')];
  const secciones = [...document.querySelectorAll('main section')];

  entrada.addEventListener('input', () => {
    const q = entrada.value.trim().toLowerCase();
    let visibles = 0;

    for (const plato of platos) {
      const coincide =
        q === '' ||
        plato.dataset.nombre.includes(q) ||
        plato.dataset.descripcion.includes(q);
      plato.hidden = !coincide;
      if (coincide) visibles++;
    }

    for (const seccion of secciones) {
      const algunoVisible = [...seccion.querySelectorAll('.plato')].some((p) => !p.hidden);
      seccion.hidden = !algunoVisible;
    }

    aviso.classList.toggle('hidden', visibles > 0);
  });
</script>
```

- [ ] **Step 2: Insertar el buscador en `src/pages/menu.astro`**

Agregar el import junto a los demás:

```astro
import MenuBuscador from '../components/MenuBuscador.astro';
```

Y colocar `<MenuBuscador />` inmediatamente después del `</nav>` y antes del `<main>`.

- [ ] **Step 3: Verificar el build y probar el buscador**

```bash
npm run build && npm run preview
```

Abrir `/menu` y comprobar tres casos:
- Escribir `camaron`: quedan visibles los platos de mariscos, las demás secciones desaparecen.
- Escribir `zzz`: no queda ningún plato y aparece el aviso "No encontramos ese plato".
- Borrar el campo: vuelven a verse las 28 categorías completas.

- [ ] **Step 4: Commit**

```bash
git add src/components/MenuBuscador.astro src/pages/menu.astro
git commit -m "feat: add live search to menu page"
```

---

### Task 15: Selector de paletas

**Files:**
- Create: `src/components/SelectorPaleta.astro`
- Modify: `src/pages/index.astro`, `src/pages/menu.astro`
- Create: `.env.example`

Este componente existe para la reunión del 2026-07-30. Se apaga con una variable de entorno y
se borra entero después.

- [ ] **Step 1: Crear `.env.example`**

```
# Poner en "true" para mostrar el selector de paletas durante la reunión con el cliente.
# Dejar vacío o borrar la variable para producción.
PUBLIC_MOSTRAR_SELECTOR=true

# Paleta por defecto: pdf | crema | terracota | carbon
PUBLIC_PALETA=pdf
```

Crear también un `.env` local con el mismo contenido para poder probarlo. `.env` ya está en
`.gitignore` desde la Task 1.

- [ ] **Step 2: Crear `src/components/SelectorPaleta.astro`**

```astro
---
const visible = import.meta.env.PUBLIC_MOSTRAR_SELECTOR === 'true';
const paletas = [
  { id: 'pdf', nombre: 'PDF actual' },
  { id: 'crema', nombre: 'Crema' },
  { id: 'terracota', nombre: 'Terracota' },
  { id: 'carbon', nombre: 'Carbón' },
];
---
{visible && (
  <div
    id="selector-paleta"
    class="fixed right-4 bottom-4 z-50 rounded-tarjeta border border-linea bg-superficie p-3 shadow-lg"
  >
    <p class="mb-2 text-xs font-semibold tracking-wider text-texto-suave uppercase">Paleta</p>
    <div class="flex flex-col gap-1">
      {paletas.map((p) => (
        <button
          type="button"
          data-paleta={p.id}
          class="rounded-boton px-3 py-1.5 text-left text-sm text-texto hover:bg-fondo-alt"
        >
          {p.nombre}
        </button>
      ))}
    </div>
  </div>

  <script>
    const CLAVE = 'mamachuz-paleta';
    const raiz = document.documentElement;
    const guardada = localStorage.getItem(CLAVE);
    if (guardada) raiz.dataset.palette = guardada;

    function marcarActiva() {
      for (const boton of document.querySelectorAll('#selector-paleta button')) {
        const activa = boton.dataset.paleta === raiz.dataset.palette;
        boton.classList.toggle('bg-acento', activa);
        boton.classList.toggle('font-bold', activa);
      }
    }

    for (const boton of document.querySelectorAll('#selector-paleta button')) {
      boton.addEventListener('click', () => {
        raiz.dataset.palette = boton.dataset.paleta;
        localStorage.setItem(CLAVE, boton.dataset.paleta);
        marcarActiva();
      });
    }

    marcarActiva();
  </script>
)}
```

`bg-acento` se aplica desde JavaScript, así que Tailwind tiene que verla en el marcado para
generarla. Ya aparece en el Hero y en Eventos, con lo cual la clase existe en el CSS final.
Si en algún momento se quitan esos usos, hay que agregar un `@source inline("bg-acento")` en
`global.css` o la clase desaparece del build.

- [ ] **Step 3: Insertar el selector en las dos páginas**

En `src/pages/index.astro` y en `src/pages/menu.astro`, agregar el import:

```astro
import SelectorPaleta from '../components/SelectorPaleta.astro';
```

Y colocar `<SelectorPaleta />` como último hijo dentro de `<Base>`, después del `<Footer />`.

- [ ] **Step 4: Correr los tests**

```bash
npm test
```

Esperado: PASS. El selector no escribe colores literales: usa `bg-superficie`, `bg-acento`,
`border-linea`.

- [ ] **Step 5: Probar las cuatro paletas**

```bash
npm run build && npm run preview
```

Con `PUBLIC_MOSTRAR_SELECTOR=true`, abrir la página y hacer clic en las cuatro paletas.
Confirmar que la página entera cambia sin recargar, que la elección sobrevive a un F5, y que
`carbon` deja el texto legible sobre el fondo oscuro.

Después poner `PUBLIC_MOSTRAR_SELECTOR=` (vacío), rehacer el build y confirmar que el selector
no aparece.

- [ ] **Step 6: Commit**

```bash
git add src/components/SelectorPaleta.astro src/pages/index.astro src/pages/menu.astro .env.example
git commit -m "feat: add live palette switcher for client meeting"
```

---

### Task 16: Verificación final

**Files:**
- Create: `README.md`

- [ ] **Step 1: Correr la suite completa**

```bash
npm test
```

Esperado: todos los tests en verde. Suma: sucursales, esquema del menú, utilidades, guarda de
colores y paridad de paletas.

- [ ] **Step 2: Build limpio**

```bash
npm run build
```

Esperado: sin errores ni advertencias.

- [ ] **Step 3: Verificar a mano que ningún color se escapó**

```bash
grep -rniE "#[0-9a-f]{3,8}|rgb\(|hsl\(" src/components src/pages src/layouts
```

Esperado: sin resultados. Si aparece algo, mover ese color a `tokens.css`.

- [ ] **Step 4: Contrastar los precios contra el PDF**

Generar la lista para revisar en paralelo con el PDF:

```bash
node --input-type=module -e "import {readFileSync} from 'node:fs';const m=JSON.parse(readFileSync('src/data/menu.json','utf8'));for(const c of m.categorias){console.log('##',c.nombre);for(const i of c.items)console.log(' ',i.precio.toFixed(2),i.nombre)}" > precios.txt
```

Revisar `precios.txt` categoría por categoría contra las páginas 1 a 9 del PDF. Es la
verificación más importante del proyecto: un precio mal transcrito es un problema con clientes,
no un bug visual. Borrar `precios.txt` al terminar.

- [ ] **Step 5: Revisar el contraste de las cuatro paletas**

Para cada paleta, comprobar con las herramientas de desarrollo del navegador que estas
combinaciones alcanzan AA (4.5:1 en texto normal, 3:1 en texto grande):

- `--color-texto` sobre `--color-fondo`
- `--color-texto-suave` sobre `--color-fondo` y sobre `--color-fondo-alt`
- `--color-marca` sobre `--color-fondo`
- El texto de los botones sobre `--color-acento` y sobre `--color-exito`

La paleta `carbon` es la de mayor riesgo. Si alguna combinación no llega, ajustar el valor en
`tokens.css`; ningún componente cambia.

- [ ] **Step 6: Revisar en tres anchos**

Con las herramientas de desarrollo, revisar `/` y `/menu` en 360 px, 768 px y 1440 px.
Confirmar que la barra de categorías del menú se desplaza en horizontal sin romper el ancho de
la página, y que ninguna sección provoca desplazamiento horizontal del documento.

- [ ] **Step 7: Probar todos los enlaces**

Abrir uno por uno los tres enlaces de WhatsApp, los dos de mapa, los tres de redes, el de
correo y la descarga del PDF. Los de redes sociales son los que más probablemente estén mal:
las URL de Instagram y Facebook se dedujeron del nombre visible en el PDF y hay que
confirmarlas con el cliente.

- [ ] **Step 8: Lighthouse**

En Chrome, con `npm run preview` corriendo, pasar Lighthouse en modo móvil sobre `/` y `/menu`.
Esperado: rendimiento y accesibilidad por encima de 90. Si accesibilidad baja de 90, casi
siempre es contraste — volver al Step 5.

- [ ] **Step 9: Escribir el `README.md`**

```markdown
# Carnitas Mamá Chuz — landing

Sitio estático hecho con Astro y Tailwind v4.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Genera el sitio en `dist/` |
| `npm run preview` | Sirve `dist/` para revisar |
| `npm test` | Valida los datos del menú y las guardas de estilo |

## Cambiar los colores

Todo el color vive en `src/styles/tokens.css`. Son 12 tokens y cuatro paletas.
Ningún componente escribe un color: si alguien lo hace, `npm test` falla.

Para cambiar la paleta por defecto, editar `PUBLIC_PALETA` en `.env`.

## Selector de paletas

`PUBLIC_MOSTRAR_SELECTOR=true` muestra un selector flotante para comparar las cuatro paletas
en vivo. Se usó en la reunión del 2026-07-30. Para quitarlo del todo: borrar
`src/components/SelectorPaleta.astro` y sus dos usos en `src/pages/`.

## Cambiar el menú

`src/data/menu.json`. Un precio es una línea. `destacado: true` hace que el plato aparezca en
la landing.

## Fotos

Las imágenes actuales son de stock y están marcadas con `data-placeholder="true"`.
Para encontrarlas todas: `grep -rn 'data-placeholder' src/`.

## Pendiente

- Horarios de atención de cada sucursal (`horario` está en `null` en `sucursales.json`)
- Texto definitivo de la historia (`src/components/Historia.astro`, marcado como provisional)
- Confirmar las URL de Instagram y Facebook
- Sesión de fotos propias
```

- [ ] **Step 10: Commit final**

```bash
git add README.md
git commit -m "docs: add readme with palette and menu instructions"
```

---

## Antes de la reunión del 2026-07-30

1. `PUBLIC_MOSTRAR_SELECTOR=true` en `.env`, `npm run build`, `npm run preview`.
2. Tener las cuatro paletas listas para alternar en vivo.
3. Llevar anotado lo que falta y solo el cliente puede dar: horarios por sucursal, texto de la
   historia, usuarios reales de redes, y si van a hacer sesión de fotos.
