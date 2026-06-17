# 🚗 NOVACARS
Marketplace de Veículos 

A NOVACARS é uma plataforma mobile desenvolvida para conectar compradores e vendedores de veículos de forma rápida, segura e transparente. Inspirada no conceito de marketplaces modernos, a aplicação oferece uma experiência completa para busca, anúncio e gerenciamento de veículos premium diretamente pelo smartphone.

O projeto foi desenvolvido utilizando React Native com Expo, com persistência local de dados através de SQLite e Drizzle ORM, permitindo que a aplicação funcione integralmente dentro do Expo Go, sem necessidade de um servidor externo.

# 📱 Visão Geral

A NOVACARS centraliza todo o processo de compra e venda de veículos em uma única plataforma intuitiva, oferecendo recursos para:

Pesquisa avançada de veículos
Cadastro e gerenciamento de anúncios
Sistema de favoritos
Contato direto com vendedores
Autenticação de usuários
Persistência local de dados

# 🚀 Como Executar o Projeto
Pré-requisitos: Node.js 18+ & Expo Go (Android ou iOS)

# Instalar dependências
npm install

# Corrigir versões compatíveis com o SDK
npx expo install --fix

# Executar aplicação
npx expo start

Leia o QR Code com o app **Expo Go** (Android) ou pela **Câmera** (iOS).


# 🔑 Conta de Demonstração

O banco é populado automaticamente na primeira execução:

| E-mail | Senha |
|--------|-------|
| `paulo@novacars.com` | `123456` |
| `contato@velocity.com` | `123456` |

Você também pode criar uma conta nova pela tela de cadastro.


# ✨ Funcionalidades

👤 Comprador
Exploração de veículos em destaque
Pesquisa avançada por filtros
Visualização detalhada dos anúncios
Sistema de favoritos
Contato via WhatsApp
Ligação direta para vendedores

🚘 Vendedor
Cadastro de novos anúncios
Upload de imagens pela galeria
Edição de anúncios
Exclusão de anúncios
Marcação de veículos vendidos
Reativação de anúncios
Estatísticas do perfil

🔐 Autenticação
Cadastro de usuários
Login
Logout
Persistência de sessão
Armazenamento seguro de senhas utilizando SHA-256

## Estrutura

```
novacars/
├── app/                       # Rotas (Expo Router, file-based)
│   ├── _layout.tsx            # Inicializa o banco + provê auth + protege rotas
│   ├── index.tsx              # Redireciona para a home
│   ├── (auth)/                # login, registro, recuperar-senha
│   ├── (tabs)/                # explorar, buscar, vender, favoritos, perfil
│   ├── veiculo/[id].tsx       # Detalhes do veículo
│   └── anuncio/editar/[id].tsx# Edição de anúncio
├── components/
│   ├── CartaoVeiculo.tsx      # Card reutilizável
│   └── FormularioAnuncio.tsx  # Form de criar/editar
├── contexts/
│   └── AuthContext.tsx        # Autenticação + sessão
├── db/
│   ├── schema.ts              # Schema Drizzle (PT): usuarios, veiculos, favoritos
│   ├── cliente.ts             # Conexão SQLite + Drizzle
│   └── inicializar.ts         # Cria tabelas + dados de exemplo
├── lib/
│   ├── consultas.ts           # Camada de dados (queries Drizzle)
│   ├── seguranca.ts           # Hash de senha (SHA-256)
│   └── formato.ts             # Formatação R$ / km
└── constants/cores.ts         # Paleta do design
```


# 📂 Banco de dados

- **usuarios**: `id, nome, email, telefone, senha, avatar_url, cidade, estado, membro_desde, criado_em`
- **veiculos**: `id, usuario_id, marca, modelo, ano, preco, preco_antigo, quilometragem, combustivel, cambio, cor, categoria, motor, potencia, cidade, estado, descricao, imagem_url, imagens, destaque, status, criado_em`
- **favoritos**: `id, usuario_id, veiculo_id, criado_em` (único por par usuário/veículo)

Todas as leituras e escritas passam pelo **Drizzle ORM** (`lib/consultas.ts`). As tabelas são criadas com `CREATE TABLE IF NOT EXISTS` na inicialização — sem necessidade de drizzle-kit ou plugins extras de build, o que garante máxima confiabilidade no Expo Go.

---

## Stack

- Expo SDK 54 · React Native 0.81 · React 19.1 · Expo Router 6
- expo-sqlite 16 + Drizzle ORM
- expo-image, expo-image-picker, expo-crypto
- @react-native-async-storage/async-storage (sessão)
- @expo/vector-icons (MaterialIcons)

---

## Dicas

- As imagens dos veículos de exemplo vêm da web (Unsplash) — precisa de internet na primeira carga. Fotos enviadas pelo vendedor ficam locais no aparelho.
- Para zerar o banco e recriar os dados de exemplo, desinstale o app do Expo Go (ou limpe os dados) e abra de novo.

# 👨‍💻 Desenvolvido por:
# Victor De Jesus UC24202209 - Lider Da Equipe / Desenvolvedor Principal
# Davi Rodrigues - Auxilio Front-End
# Arthur Fagundes - Auxilio Front-End
# Dhavi Pinheiro - Auxilio Front-End