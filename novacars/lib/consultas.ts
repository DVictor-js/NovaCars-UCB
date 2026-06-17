import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../db/cliente';
import {
  favoritos,
  NovoVeiculo,
  usuarios,
  veiculos,
  Veiculo,
} from '../db/schema';

export type Ordenacao =
  | 'recentes'
  | 'preco_asc'
  | 'preco_desc'
  | 'ano_desc'
  | 'km_asc';

export interface Filtros {
  texto?: string;
  categoria?: string;
  marca?: string;
  combustivel?: string;
  cambio?: string;
  precoMin?: number;
  precoMax?: number;
  anoMin?: number;
  anoMax?: number;
  ordenar?: Ordenacao;
}

function montarCondicoes(f: Filtros) {
  const cond: any[] = [eq(veiculos.status, 'ativo')];

  if (f.texto && f.texto.trim()) {
    const t = `%${f.texto.trim()}%`;
    cond.push(
      sql`(${veiculos.modelo} LIKE ${t} OR ${veiculos.marca} LIKE ${t})`
    );
  }
  if (f.categoria) cond.push(eq(veiculos.categoria, f.categoria));
  if (f.marca) cond.push(eq(veiculos.marca, f.marca));
  if (f.combustivel) cond.push(eq(veiculos.combustivel, f.combustivel));
  if (f.cambio) cond.push(eq(veiculos.cambio, f.cambio));
  if (typeof f.precoMin === 'number') cond.push(gte(veiculos.preco, f.precoMin));
  if (typeof f.precoMax === 'number') cond.push(lte(veiculos.preco, f.precoMax));
  if (typeof f.anoMin === 'number') cond.push(gte(veiculos.ano, f.anoMin));
  if (typeof f.anoMax === 'number') cond.push(lte(veiculos.ano, f.anoMax));

  return and(...cond);
}

function montarOrdenacao(ordenar?: Ordenacao) {
  switch (ordenar) {
    case 'preco_asc':
      return asc(veiculos.preco);
    case 'preco_desc':
      return desc(veiculos.preco);
    case 'ano_desc':
      return desc(veiculos.ano);
    case 'km_asc':
      return asc(veiculos.quilometragem);
    default:
      return desc(veiculos.id);
  }
}

// ---- Listagens ------------------------------------------------------------

export async function listarVeiculos(filtros: Filtros = {}): Promise<Veiculo[]> {
  return db
    .select()
    .from(veiculos)
    .where(montarCondicoes(filtros))
    .orderBy(montarOrdenacao(filtros.ordenar));
}

export async function listarDestaques(): Promise<Veiculo[]> {
  return db
    .select()
    .from(veiculos)
    .where(and(eq(veiculos.status, 'ativo'), eq(veiculos.destaque, 1)))
    .orderBy(desc(veiculos.id));
}

export async function obterVeiculo(id: number) {
  const [veiculo] = await db
    .select()
    .from(veiculos)
    .where(eq(veiculos.id, id))
    .limit(1);
  if (!veiculo) return null;

  const [vendedor] = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.id, veiculo.usuarioId))
    .limit(1);

  return { veiculo, vendedor };
}

export async function listarMarcas(): Promise<string[]> {
  const linhas = await db
    .selectDistinct({ marca: veiculos.marca })
    .from(veiculos);
  return linhas.map((l) => l.marca).sort();
}

// ---- Anúncios do vendedor -------------------------------------------------

export async function listarPorUsuario(usuarioId: number): Promise<Veiculo[]> {
  return db
    .select()
    .from(veiculos)
    .where(eq(veiculos.usuarioId, usuarioId))
    .orderBy(desc(veiculos.id));
}

export async function contarPorStatus(usuarioId: number) {
  const linhas = await db
    .select({ status: veiculos.status, total: sql<number>`count(*)` })
    .from(veiculos)
    .where(eq(veiculos.usuarioId, usuarioId))
    .groupBy(veiculos.status);

  const resumo = { anunciados: 0, vendidos: 0 };
  for (const l of linhas) {
    if (l.status === 'vendido') resumo.vendidos += Number(l.total);
    else resumo.anunciados += Number(l.total);
  }
  return resumo;
}

export async function criarAnuncio(dados: NovoVeiculo): Promise<number> {
  const [linha] = await db
    .insert(veiculos)
    .values(dados)
    .returning({ id: veiculos.id });
  return linha.id;
}

export async function atualizarAnuncio(
  id: number,
  dados: Partial<NovoVeiculo>
): Promise<void> {
  await db.update(veiculos).set(dados).where(eq(veiculos.id, id));
}

export async function excluirAnuncio(id: number): Promise<void> {
  await db.delete(favoritos).where(eq(favoritos.veiculoId, id));
  await db.delete(veiculos).where(eq(veiculos.id, id));
}

export async function definirStatus(id: number, status: string): Promise<void> {
  await db.update(veiculos).set({ status }).where(eq(veiculos.id, id));
}

// ---- Favoritos ------------------------------------------------------------

export async function idsFavoritos(usuarioId: number): Promise<number[]> {
  const linhas = await db
    .select({ veiculoId: favoritos.veiculoId })
    .from(favoritos)
    .where(eq(favoritos.usuarioId, usuarioId));
  return linhas.map((l) => l.veiculoId);
}

export async function listarFavoritos(usuarioId: number): Promise<Veiculo[]> {
  const linhas = await db
    .select({ v: veiculos })
    .from(favoritos)
    .innerJoin(veiculos, eq(favoritos.veiculoId, veiculos.id))
    .where(eq(favoritos.usuarioId, usuarioId))
    .orderBy(desc(favoritos.id));
  return linhas.map((l) => l.v);
}

export async function ehFavorito(
  usuarioId: number,
  veiculoId: number
): Promise<boolean> {
  const [linha] = await db
    .select({ id: favoritos.id })
    .from(favoritos)
    .where(
      and(
        eq(favoritos.usuarioId, usuarioId),
        eq(favoritos.veiculoId, veiculoId)
      )
    )
    .limit(1);
  return !!linha;
}

// Alterna o favorito e devolve o novo estado (true = favoritado).
export async function alternarFavorito(
  usuarioId: number,
  veiculoId: number
): Promise<boolean> {
  const jaEh = await ehFavorito(usuarioId, veiculoId);
  if (jaEh) {
    await db
      .delete(favoritos)
      .where(
        and(
          eq(favoritos.usuarioId, usuarioId),
          eq(favoritos.veiculoId, veiculoId)
        )
      );
    return false;
  }
  await db.insert(favoritos).values({ usuarioId, veiculoId });
  return true;
}
