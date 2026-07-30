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

  it('tiene las 28 categorías del PDF', () => {
    expect(menu.categorias).toHaveLength(28);
  });

  it('incluye las categorías de bebida', () => {
    const ids = menu.categorias.map((c) => c.id);
    for (const id of ['bebidas-frias', 'sodas', 'cervezas', 'micheladas', 'cocteles', 'baldes', 'bebidas-calientes', 'postres']) {
      expect(ids).toContain(id);
    }
  });
});
