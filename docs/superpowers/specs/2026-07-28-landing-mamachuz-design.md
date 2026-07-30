# Landing page — Carnitas Mamá Chuz

**Fecha:** 2026-07-28
**Estado:** propuesta, pendiente de reunión con el cliente el 2026-07-30

## Contexto

Carnitas Mamá Chuz es un restaurante salvadoreño/mexicano, "La Original, desde 1980", con dos
sucursales: 5ta Avenida Norte (Pasaje Venecia N° 1931, San Salvador) y Paseo El Carmen
(7ª Avenida Norte y 1ª Calle Oriente, local 4-12 A, Santa Tecla, La Libertad).

El único material existente es `Menu Carnitas mamachuz 2025.pdf`: 10 páginas, 28 categorías,
unos 150 platos, 31 imágenes embebidas. Las imágenes grandes del PDF son texturas de madera
de fondo, no comida. Solo hay 4-5 fotos de platos aprovechables.

Este documento describe una propuesta que se presenta al cliente el jueves 2026-07-30. Los
colores, la tipografía y la dirección de marca se definen en esa reunión. Todo lo que sigue
está diseñado para que esas decisiones se apliquen sin reescribir la página.

## Objetivo

Vitrina de marca. La historia de los 45 años es el argumento principal; el menú acompaña.

No es un sistema de pedidos. No hay carrito, backend, ni panel de administración.

## Decisiones tomadas

| Decisión | Elegido | Descartado |
|---|---|---|
| Objetivo | Vitrina de marca | Pedidos por WhatsApp, reservas, menú digital puro |
| Alcance del menú | Destacados en la landing + página `/menu` completa | Todo en la landing, solo PDF, solo destacados |
| Stack | Astro + Tailwind v4 | HTML sin build, HTML + JSON, Next.js |
| Fotografía | Stock de Unsplash como placeholder marcado | Diseño sin fotos, esperar sesión de fotos |
| Dirección visual | "Cantina cálida": madera, crema, naranja | Editorial serif, nocturna oscura |
| Sistema de color | Tokens CSS + selector de paletas en vivo | Solo tokens, styleguide, capturas exportables |

### Riesgos aceptados por el cliente

- **Stock como placeholder:** comida genérica en un restaurante con 45 años de historia se
  nota. Se aceptó para poder lanzar antes de la sesión de fotos. Mitigación: cada imagen de
  stock lleva `data-placeholder` para poder listarlas y reemplazarlas de una.
- **Madera y crema no diferencian:** es la paleta que usan casi todos los restaurantes de la
  zona. Se aceptó porque la reconocibilidad frente al cliente actual pesa más. La reunión del
  30 puede corregir esto y el sistema de tokens lo permite sin retrabajo.

## Arquitectura

```
src/
  data/
    menu.json              Fuente única del menú: 28 categorías, ~150 platos
    sucursales.json        Direcciones, WhatsApp, horarios, enlaces de mapa
  styles/
    tokens.css             Todo el color. 4 paletas. Único archivo con valores de color
    global.css             Tipografía base, reset, utilidades
  components/
    Hero.astro
    Historia.astro
    Destacados.astro
    Sucursales.astro
    Eventos.astro
    Footer.astro
    SelectorPaleta.astro   Temporal, para la reunión
    MenuCategoria.astro    Una categoría con sus platos
    MenuBuscador.astro     Filtro en vivo de la página /menu
  layouts/
    Base.astro             <head>, metadatos, carga de tokens
  pages/
    index.astro            Landing
    menu.astro             Menú completo
public/
  menu-2025.pdf            El PDF original, descargable
  img/                     Fotos (stock por ahora)
```

### Regla dura de color

**Ningún componente escribe un valor de color literal.** Ni hex, ni `rgb()`, ni colores de la
paleta por defecto de Tailwind (`bg-orange-500`). Solo utilidades derivadas de los tokens:
`bg-marca`, `text-acento`, `border-linea`.

Esta es la restricción que hace que la reunión del jueves funcione. Si se rompe, cambiar la
paleta deja de ser editar un archivo.

## Sistema de color

### Tokens

`src/styles/tokens.css` define la paleta como variables CSS y las expone a Tailwind v4 con
`@theme`. Tokens semánticos, no literales — se llaman por su función, no por su color, para
que sigan teniendo sentido cuando el jueves cambien los valores:

| Token | Función |
|---|---|
| `--color-marca` | Café oscuro del logo. Titulares, barra superior |
| `--color-marca-suave` | Variante clara de la marca, para fondos de sección |
| `--color-acento` | Naranja. Botones, precios destacados, la llama |
| `--color-acento-fuerte` | Estado hover y foco del acento |
| `--color-sobre-acento` | Tinta (texto e iconos) que va **encima** de una superficie de acento |
| `--color-fondo` | Fondo general de la página |
| `--color-fondo-alt` | Fondo de secciones alternas |
| `--color-superficie` | Fondo de tarjetas |
| `--color-texto` | Texto principal |
| `--color-texto-suave` | Descripciones, texto secundario |
| `--color-linea` | Bordes y separadores |
| `--color-exito` | Confirmaciones, WhatsApp |
| `--color-sobre-exito` | Tinta (texto e iconos) que va **encima** de una superficie de éxito |
| `--color-sombra` | Color base de las sombras |

Son 14 tokens de color, y las cuatro paletas declaran exactamente el mismo conjunto: la prueba
guarda `tests/no-colores-literales.test.js` lo verifica.

Los dos tokens `sobre-…` existen porque `acento` y `exito` son tonos medios: no se puede saber
desde el nombre si encima va tinta clara u oscura, y cada componente lo adivinaba distinto — el
CTA principal del Hero llegó a quedar en 2.08:1 con la paleta `pdf`. El token nombra el rol
("lo que va encima del acento"), así que sigue siendo correcto cuando el jueves cambien los
valores: en `pdf`, `crema` y `carbon` resuelve a una tinta oscura y en `terracota` a una clara,
y en las cuatro el contraste contra su propia superficie es ≥ 4.5:1 (WCAG AA).

Los tamaños de tipografía, radios de borde y espaciados también viven acá, por la misma razón:
si el jueves se define tipografía, hay un solo lugar donde tocar.

### Paletas

Cuatro paletas en el mismo archivo, todas partiendo de la dirección "Cantina cálida". Son tres
bloques `html[data-palette="…"]` más el `@theme`: la primera paleta **es** el default del
`@theme` y no lleva selector propio, así que cada color se escribe una sola vez en el archivo.
Cuando `data-palette` vale `pdf`, ninguna regla de paleta coincide y quedan los valores base.

1. `pdf` — los colores exactos del menú actual. El punto de partida y la referencia. Vive en el
   `@theme`, sin bloque propio.
2. `crema` — más claro y aireado, menos madera, más blanco roto.
3. `terracota` — el naranja corrido hacia rojo ladrillo, más tierra.
4. `carbon` — fondo oscuro conservando el naranja. La opción nocturna dentro de la misma dirección.

Cambiar de paleta es cambiar el atributo `data-palette` en `<html>`. Sin recompilar.

### Selector de paletas

Botón flotante abajo a la derecha, visible solo cuando la variable de entorno
`PUBLIC_MOSTRAR_SELECTOR` está activa. Lista las 4 paletas, aplica al instante, guarda la
elección en `localStorage` para que sobreviva a la recarga.

Existe para la reunión del 30: el cliente decide viendo la página real en vez de un papel.
Después se quita apagando la variable de entorno, y el componente se puede borrar entero.

## Datos del menú

`src/data/menu.json`:

```json
{
  "moneda": "USD",
  "nota": "Se aplica 10% de propina",
  "categorias": [
    {
      "id": "carnes-clasicas",
      "nombre": "Carnes clásicas",
      "nota": null,
      "items": [
        {
          "nombre": "Plato Mixto #1",
          "precio": 6.79,
          "descripcion": "Carne, chorizo argentino, chirimol, casamiento y dos tortillas.",
          "destacado": true,
          "imagen": null
        }
      ]
    }
  ]
}
```

- `destacado: true` corresponde al ícono 🔥 del PDF. La landing muestra estos platos; elegir
  qué se destaca es cambiar un booleano, sin tocar componentes.
- `nota` a nivel de categoría lleva restricciones como "Solamente sábados y domingos" (Sopas)
  o "Lunes a viernes, 11:30 a.m. a 3:00 p.m." (Platos del día).
- `imagen` en `null` significa que se renderiza un marcador de posición en vez de una foto.

Las 28 categorías: Platos del día, Entradas, Carnes clásicas, Picadas, Carnes especiales,
Pal' Familión, Platos Light, Mariscos, Sopas, Las mexicanas, Tortas, Burritos, Tacos,
Quesadillas, Combos mexicanos, Papas rellenas, Pa' cenar, Infantiles, Panes, Extras,
Bebidas frías, Sodas, Cervezas, Micheladas y mixes, Cócteles, Baldes, Bebidas calientes,
Postres.

## Landing (`/`)

| Sección | Contenido | Acción |
|---|---|---|
| Hero | "La original, desde 1980", frase de apoyo | Ver el menú · WhatsApp |
| Historia | El relato de los 45 años, texto del cliente, 2-3 fotos | — |
| Destacados | 12-16 platos con `destacado: true`: foto, nombre, descripción, precio | Ver menú completo |
| Sucursales | Dos tarjetas: dirección, WhatsApp, horario, enlace a mapa | Cómo llegar · WhatsApp |
| Eventos | Cumpleaños, 15 años, graduaciones, bodas, corporativos | WhatsApp 7171 5309 |
| Footer | Instagram, Facebook, TikTok, correo, aviso del 10% de propina, medios de pago | — |

Contactos del PDF: WhatsApp eventos 7171 5309; sucursal 5ta Avenida 6180 1581; sucursal
Paseo El Carmen 7784 9283; correo `carnitasmamachuz1980@gmail.com`; Instagram y Facebook
"Carnitas Mamá Chuz Oficial"; TikTok "Carnitas.mama.chu". Aceptan Visa y Mastercard.

Los enlaces de WhatsApp usan el formato `https://wa.me/50371715309?text=…`, es decir código de
país 503 sin el signo más y sin espacios, con mensaje prellenado distinto por sección
(eventos vs. consulta general). Los tres números salen de `sucursales.json`, no escritos a mano
en los componentes.

## Página de menú (`/menu`)

- Las 28 categorías completas, generadas desde `menu.json` en tiempo de build.
- Barra de categorías pegajosa arriba, con desplazamiento suave al hacer clic.
- Buscador que filtra platos en vivo por nombre y descripción. JavaScript en el cliente sobre
  el HTML ya renderizado — el menú completo existe en el HTML aunque el JavaScript falle.
- Botón para descargar `menu-2025.pdf`.
- Las notas de categoría se muestran junto al título ("Solamente sábados y domingos").

## Decisiones abiertas

Ninguna bloquea la construcción:

- **Dominio y hosting.** Astro genera estático; Netlify, Vercel o Cloudflare Pages sirven igual.
- **Horarios de atención.** El PDF solo indica 11:30 a.m. – 3:00 p.m. para platos del día. Falta
  el horario general de cada sucursal. Hasta tenerlo, la tarjeta de sucursal omite el horario en
  vez de inventarlo.
- **Texto de la historia.** El cliente lo tiene escrito. Hasta recibirlo se usa un texto marcado
  como provisional.

## Verificación

1. `npm run build` termina sin errores ni advertencias.
2. Los ~150 precios y nombres de `menu.json` contrastados uno a uno contra el PDF.
3. Las 4 paletas revisadas con contraste AA en texto y en botones.
4. Lighthouse en móvil: rendimiento y accesibilidad por encima de 90.
5. `grep` sobre `src/components` y `src/pages` sin resultados de valores de color literales
   ni de utilidades de color por defecto de Tailwind.
6. Revisión en 360 px, 768 px y 1440 px de ancho.
7. Todos los enlaces de WhatsApp y de mapa abiertos y comprobados.
