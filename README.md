# Carnitas Mamá Chuz — landing

Sitio estático hecho con Astro 7 y Tailwind v4. Es una **propuesta**: los colores, la tipografía
y el texto de la historia se definen en la reunión con el cliente.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Genera el sitio en `dist/` |
| `npm run preview` | Sirve `dist/` para revisar |
| `npm test` | Valida los datos del menú y las guardas de estilo |

Requiere Node ≥ 22.12.

## Cambiar los colores

Todo el color vive en `src/styles/tokens.css`. Son 14 tokens y cuatro paletas: `pdf` (la del menú
impreso, y el default del `@theme`), `crema`, `terracota` y `carbon`.

**Ningún componente escribe un color.** Si alguien lo hace, `npm test` falla — la guarda
`tests/no-colores-literales.test.js` rechaza hex, `rgb()`, `hsl()`, las utilidades de color por
defecto de Tailwind (incluidas `bg-white` y `text-black`) y los colores CSS con nombre.

Los tokens `--color-sobre-acento` y `--color-sobre-exito` son la tinta que va **encima** de una
superficie de acento o de éxito. `acento` y `exito` son tonos medios, así que desde el nombre no se
puede saber si encima va tinta clara u oscura: en `pdf`, `crema` y `carbon` resuelven a oscuro, en
`terracota` a claro. Nunca poner `text-fondo` ni `text-marca` sobre `bg-acento`.

Para cambiar la paleta por defecto, editar `PUBLIC_PALETA` en `.env`.

## Selector de paletas

`PUBLIC_MOSTRAR_SELECTOR=true` en `.env` muestra un selector flotante para comparar las cuatro
paletas en vivo, pensado para la reunión con el cliente. Vaciar la variable lo saca del build.
Para quitarlo del todo: borrar `src/components/SelectorPaleta.astro` y sus dos usos en `src/pages/`.

Copiar `.env.example` a `.env` para empezar.

## Cambiar el menú

`src/data/menu.json`. 28 categorías, 175 platos. Un precio es una línea.

`destacado: true` corresponde al ícono 🔥 del menú impreso y hace que el plato aparezca en la
landing. Hoy hay 21. Los datos fueron auditados uno a uno contra el PDF.

Los datos del negocio, sucursales y redes están en `src/data/sucursales.json`. Los números de
WhatsApp se guardan como `503` + 8 dígitos, sin `+` ni espacios; `src/lib/whatsapp.js` rechaza
cualquier otro formato.

## Fotos

Las imágenes actuales son de stock y están marcadas con `data-placeholder="true"`.
Para encontrarlas todas: `grep -rn 'data-placeholder' src/`.

## Pendiente

- Horarios de atención de cada sucursal (`horario` está en `null` en `sucursales.json`; el menú
  impreso solo da el horario de los platos del día)
- Texto definitivo de la historia (`src/components/Historia.astro`, marcado como provisional)
- Confirmar las URL de Instagram y Facebook: se dedujeron del nombre visible en el PDF
- Sesión de fotos propias
- Dominio y hosting
