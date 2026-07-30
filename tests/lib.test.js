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
