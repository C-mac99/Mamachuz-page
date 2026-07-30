export function enlaceWhatsapp(numero, mensaje) {
  if (!/^503\d{8}$/.test(numero)) {
    throw new Error(`Número de WhatsApp inválido: ${numero}. Se espera 503 + 8 dígitos.`);
  }
  const base = `https://wa.me/${numero}`;
  if (!mensaje) return base;
  return `${base}?text=${encodeURIComponent(mensaje)}`;
}
