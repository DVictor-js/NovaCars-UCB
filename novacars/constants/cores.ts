// Paleta extraída diretamente do design (NOVACARS / Velocity Premium).
export const Cores = {
  fundo: '#131313',
  superficie: '#131313',
  superficieBaixa: '#1c1b1b',
  superficieContainer: '#201f1f',
  superficieAlta: '#2a2a2a',
  superficieMaisAlta: '#353534',
  superficieBrilho: '#393939',
  superficieMaisBaixa: '#0e0e0e',

  primaria: '#ffb3b3',
  primariaContainer: '#dc143c', // vermelho carmesim (cor de marca)
  primariaFixa: '#ffdad9',
  sobrePrimariaContainer: '#fff1f0',
  primariaVariante: '#920022',
  primariaInversa: '#bf0030',

  secundaria: '#ffb4a6',
  secundariaContainer: '#ff5539',

  terciaria: '#78d6d5',
  terciariaContainer: '#007d7d',

  texto: '#e5e2e1',
  textoVariante: '#e6bdbc',
  textoSuave: '#ac8888',

  contorno: '#ac8888',
  contornoVariante: '#5c3f3f',

  erro: '#ffb4ab',
  sucesso: '#78d6d5',
};

export const Fontes = {
  titulo: 'PlusJakartaSans_800ExtraBold',
  tituloBold: 'PlusJakartaSans_700Bold',
  corpo: 'Inter_400Regular',
  corpoMedio: 'Inter_500Medium',
};

// Quando as fontes customizadas não estiverem carregadas, o app usa as do
// sistema sem quebrar — então deixamos as famílias como opcionais no estilo.
export const FONTE_DISPONIVEL = false;
