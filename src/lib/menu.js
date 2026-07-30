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
