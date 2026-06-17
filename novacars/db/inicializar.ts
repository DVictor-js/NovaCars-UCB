
import { db, sqlite } from './cliente';
import { usuarios, veiculos } from './schema';
import { gerarHashSenha } from '../lib/seguranca';

let inicializado = false;

// Cria as tabelas (idempotente) caso ainda não existam.
function criarTabelas() {
  sqlite.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      telefone TEXT,
      senha TEXT NOT NULL,
      avatar_url TEXT,
      cidade TEXT,
      estado TEXT,
      membro_desde TEXT,
      criado_em TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS veiculos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
      marca TEXT NOT NULL,
      modelo TEXT NOT NULL,
      ano INTEGER NOT NULL,
      preco REAL NOT NULL,
      preco_antigo REAL,
      quilometragem INTEGER NOT NULL DEFAULT 0,
      combustivel TEXT NOT NULL DEFAULT 'Flex',
      cambio TEXT NOT NULL DEFAULT 'Automático',
      cor TEXT,
      categoria TEXT NOT NULL DEFAULT 'Sedã',
      motor TEXT,
      potencia TEXT,
      cidade TEXT,
      estado TEXT,
      descricao TEXT,
      imagem_url TEXT,
      imagens TEXT,
      destaque INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'ativo',
      criado_em TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS favoritos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
      veiculo_id INTEGER NOT NULL REFERENCES veiculos(id),
      criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(usuario_id, veiculo_id)
    );
  `);
}

// Popula dados de demonstração na primeira execução.
async function popularDados() {
  const total = await db.$count(usuarios);
  if (total > 0) return;

  const senhaDemo = await gerarHashSenha('123456');

  const inseridos = await db
    .insert(usuarios)
    .values([
      {
        nome: 'Paulo Henrique',
        email: 'paulo@novacars.com',
        telefone: '(61) 99999-0001',
        senha: senhaDemo,
        avatarUrl: 'https://i.pravatar.cc/150?img=12',
        cidade: 'Brasília',
        estado: 'DF',
        membroDesde: 'Outubro 2022',
      },
      {
        nome: 'Velocity Motors',
        email: 'contato@velocity.com',
        telefone: '(11) 98888-0002',
        senha: senhaDemo,
        avatarUrl: 'https://i.pravatar.cc/150?img=33',
        cidade: 'São Paulo',
        estado: 'SP',
        membroDesde: 'Janeiro 2021',
      },
    ])
    .returning({ id: usuarios.id });

  const paulo = inseridos[0].id;
  const velocity = inseridos[1].id;

  await db.insert(veiculos).values([
    {
      usuarioId: velocity,
      marca: 'Porsche',
      modelo: '911 GT3 RS',
      ano: 2023,
      preco: 1485000,
      precoAntigo: 1590000,
      quilometragem: 3200,
      combustivel: 'Gasolina',
      cambio: 'Automático',
      cor: 'Prata GT',
      categoria: 'Esportivo',
      motor: '4.0L Flat-6 Aspirado',
      potencia: '525 cv',
      cidade: 'São Paulo',
      estado: 'SP',
      descricao:
        'Porsche 911 GT3 RS 2023 em estado impecável com pacote Weissach. Acabamento em prata GT metálico com interior em Race-Tex preto e costura em vermelho. Teto, capô e capas de retrovisor em fibra de carbono. Rodas forjadas em magnésio, sistema de elevação do eixo dianteiro e freios cerâmicos PCCB. Carfax limpo, sem retoques de pintura.',
      imagemUrl:
        'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=1200&auto=format&fit=crop',
      imagens: JSON.stringify([
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop',
      ]),
      destaque: 1,
    },
    {
      usuarioId: velocity,
      marca: 'Audi',
      modelo: 'RS6 Avant',
      ano: 2022,
      preco: 798500,
      quilometragem: 19000,
      combustivel: 'Gasolina',
      cambio: 'Automático',
      cor: 'Cinza Nardo',
      categoria: 'Sedã',
      motor: '4.0L V8 BiTurbo',
      potencia: '600 cv',
      cidade: 'São Paulo',
      estado: 'SP',
      descricao:
        'Audi RS6 Avant 2022, a perua mais desejada do mercado. V8 biturbo com 600 cv, tração quattro e acabamento premium. Revisões em dia na concessionária.',
      imagemUrl:
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=1200&auto=format&fit=crop',
      destaque: 1,
    },
    {
      usuarioId: paulo,
      marca: 'BMW',
      modelo: 'M4 Competition',
      ano: 2024,
      preco: 689900,
      quilometragem: 800,
      combustivel: 'Gasolina',
      cambio: 'Automático',
      cor: 'Verde São Paulo',
      categoria: 'Esportivo',
      motor: '3.0L I6 BiTurbo',
      potencia: '510 cv',
      cidade: 'Brasília',
      estado: 'DF',
      descricao:
        'BMW M4 Competition 2024, praticamente zero km. Pacote M Carbon, bancos de fibra de carbono e escapamento esportivo. Único dono.',
      imagemUrl:
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1200&auto=format&fit=crop',
      destaque: 1,
    },
    {
      usuarioId: velocity,
      marca: 'Porsche',
      modelo: 'Taycan 4S',
      ano: 2021,
      preco: 645000,
      quilometragem: 8200,
      combustivel: 'Elétrico',
      cambio: 'Automático',
      cor: 'Branco Carrara',
      categoria: 'Elétrico',
      motor: 'Dois motores elétricos',
      potencia: '530 cv',
      cidade: 'São Paulo',
      estado: 'SP',
      descricao:
        'Porsche Taycan 4S elétrico, autonomia real de 400 km. Carregamento ultrarrápido e performance de esportivo. Garantia de fábrica vigente.',
      imagemUrl:
        'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=1200&auto=format&fit=crop',
    },
    {
      usuarioId: paulo,
      marca: 'Jeep',
      modelo: 'Compass Limited',
      ano: 2023,
      preco: 189900,
      quilometragem: 22000,
      combustivel: 'Flex',
      cambio: 'Automático',
      cor: 'Preto Carbon',
      categoria: 'SUV',
      motor: '1.3L Turbo Flex',
      potencia: '185 cv',
      cidade: 'Brasília',
      estado: 'DF',
      descricao:
        'Jeep Compass Limited 2023, completo, teto solar e bancos em couro. Revisões na concessionária e IPVA pago.',
      imagemUrl:
        'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=1200&auto=format&fit=crop',
    },
    {
      usuarioId: velocity,
      marca: 'Toyota',
      modelo: 'Corolla Altis Hybrid',
      ano: 2024,
      preco: 215000,
      quilometragem: 12000,
      combustivel: 'Híbrido',
      cambio: 'Automático',
      cor: 'Prata',
      categoria: 'Sedã',
      motor: '1.8L Híbrido',
      potencia: '122 cv',
      cidade: 'São Paulo',
      estado: 'SP',
      descricao:
        'Corolla Altis Hybrid 2024, economia excepcional e baixíssima quilometragem. Estado de zero km.',
      imagemUrl:
        'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?q=80&w=1200&auto=format&fit=crop',
    },
  ]);
}

export async function inicializarBanco() {
  if (inicializado) return;
  criarTabelas();
  await popularDados();
  inicializado = true;
}
