import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// ---------------------------------------------------------------------------
// Tabela de usuários (compradores e vendedores são o mesmo cadastro)
// ---------------------------------------------------------------------------
export const usuarios = sqliteTable('usuarios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  email: text('email').notNull().unique(),
  telefone: text('telefone'),
  // senha armazenada como hash SHA-256 (ver lib/seguranca.ts)
  senha: text('senha').notNull(),
  avatarUrl: text('avatar_url'),
  cidade: text('cidade'),
  estado: text('estado'),
  membroDesde: text('membro_desde'),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
});

// ---------------------------------------------------------------------------
// Tabela de veículos / anúncios
// ---------------------------------------------------------------------------
export const veiculos = sqliteTable('veiculos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  usuarioId: integer('usuario_id')
    .notNull()
    .references(() => usuarios.id),
  marca: text('marca').notNull(),
  modelo: text('modelo').notNull(),
  ano: integer('ano').notNull(),
  preco: real('preco').notNull(),
  precoAntigo: real('preco_antigo'),
  quilometragem: integer('quilometragem').notNull().default(0),
  // Gasolina | Flex | Diesel | Elétrico | Híbrido
  combustivel: text('combustivel').notNull().default('Flex'),
  // Automático | Manual
  cambio: text('cambio').notNull().default('Automático'),
  cor: text('cor'),
  // SUV | Sedã | Esportivo | Elétrico | Hatch | Picape
  categoria: text('categoria').notNull().default('Sedã'),
  motor: text('motor'),
  potencia: text('potencia'),
  cidade: text('cidade'),
  estado: text('estado'),
  descricao: text('descricao'),
  imagemUrl: text('imagem_url'),
  // galeria extra como JSON (array de URLs)
  imagens: text('imagens'),
  destaque: integer('destaque').notNull().default(0),
  // ativo | vendido | inativo
  status: text('status').notNull().default('ativo'),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
});

// ---------------------------------------------------------------------------
// Tabela de favoritos (relação usuário <-> veículo)
// ---------------------------------------------------------------------------
export const favoritos = sqliteTable('favoritos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  usuarioId: integer('usuario_id')
    .notNull()
    .references(() => usuarios.id),
  veiculoId: integer('veiculo_id')
    .notNull()
    .references(() => veiculos.id),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
});

export type Usuario = typeof usuarios.$inferSelect;
export type NovoUsuario = typeof usuarios.$inferInsert;
export type Veiculo = typeof veiculos.$inferSelect;
export type NovoVeiculo = typeof veiculos.$inferInsert;
export type Favorito = typeof favoritos.$inferSelect;
