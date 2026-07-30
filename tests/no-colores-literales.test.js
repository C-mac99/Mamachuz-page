import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function archivosEn(dir, ext) {
  // src/layouts todavía no existe (lo crea la Task 9). Una carpeta ausente no es
  // un error; cualquier otro fallo de lectura sí debe reventar la prueba.
  if (!existsSync(dir)) return [];
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

// `white` y `black` no llevan sufijo numérico, así que necesitan su propia rama.
// Son literales duros en Tailwind: no cambian con la paleta, y con `carbon`
// (fondo casi negro) un `bg-white` suelto es justo el bug que aparece proyectado.
// Los tokens correctos son `superficie` y `texto`.
const TAILWIND_POR_DEFECTO =
  /\b(bg|text|border|from|to|via|ring|outline|decoration|shadow)-(?:(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}|white|black)\b/;

// Colores CSS con nombre en estilos en línea (`style="color: tomato"`). Se permiten
// las palabras clave que no fijan un color: var(), inherit, currentColor, etc.
const COLOR_NOMBRADO =
  /(?:^|[;"'\s])(?:color|background|background-color|border-color|fill|stroke)\s*:\s*(?!var\(|inherit|currentColor|transparent|none|unset|initial|revert)[a-zA-Z]+/;

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

    it(`${ruta} no usa colores CSS con nombre`, () => {
      const texto = readFileSync(ruta, 'utf8');
      expect(COLOR_NOMBRADO.test(texto), `color con nombre en ${ruta}`).toBe(false);
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
    expect(base.size).toBe(14);
    for (const bloque of bloques.slice(1)) {
      expect([...tokensDe(bloque)].sort()).toEqual([...base].sort());
    }
  });
});
