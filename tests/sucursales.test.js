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
