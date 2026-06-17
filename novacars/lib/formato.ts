// Formatação de valores monetários em Real (R$).
export function formatarReal(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// Formatação compacta para cards (ex.: R$ 1,4 mi / R$ 215 mil).
export function formatarRealCompacto(valor: number): string {
  if (valor >= 1000000) {
    return 'R$ ' + (valor / 1000000).toFixed(1).replace('.', ',') + ' mi';
  }
  if (valor >= 1000) {
    return 'R$ ' + Math.round(valor / 1000) + ' mil';
  }
  return formatarReal(valor);
}

export function formatarKm(km: number): string {
  return km.toLocaleString('pt-BR') + ' km';
}

export function formatarNumero(n: number): string {
  return n.toLocaleString('pt-BR');
}
