import AsyncStorage from '@react-native-async-storage/async-storage';
import { eq } from 'drizzle-orm';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { db } from '../db/cliente';
import { Usuario, usuarios } from '../db/schema';
import { conferirSenha, gerarHashSenha } from '../lib/seguranca';

const CHAVE_SESSAO = '@novacars:usuarioId';

interface DadosCadastro {
  nome: string;
  email: string;
  telefone?: string;
  senha: string;
}

interface AuthContexto {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  registrar: (dados: DadosCadastro) => Promise<void>;
  sair: () => Promise<void>;
  atualizarPerfil: (dados: Partial<Usuario>) => Promise<void>;
  recarregar: () => Promise<void>;
}

const Contexto = createContext<AuthContexto | undefined>(undefined);

export function ProvedorAuth({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  async function carregarSessao() {
    try {
      const id = await AsyncStorage.getItem(CHAVE_SESSAO);
      if (id) {
        const [u] = await db
          .select()
          .from(usuarios)
          .where(eq(usuarios.id, Number(id)))
          .limit(1);
        setUsuario(u ?? null);
      }
    } catch (e) {
      console.warn('Falha ao carregar sessão', e);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarSessao();
  }, []);

  async function entrar(email: string, senha: string) {
    const emailNorm = email.trim().toLowerCase();
    const [u] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, emailNorm))
      .limit(1);

    if (!u) throw new Error('E-mail não cadastrado.');

    const ok = await conferirSenha(senha, u.senha);
    if (!ok) throw new Error('Senha incorreta.');

    await AsyncStorage.setItem(CHAVE_SESSAO, String(u.id));
    setUsuario(u);
  }

  async function registrar(dados: DadosCadastro) {
    const emailNorm = dados.email.trim().toLowerCase();

    const [existente] = await db
      .select({ id: usuarios.id })
      .from(usuarios)
      .where(eq(usuarios.email, emailNorm))
      .limit(1);
    if (existente) throw new Error('Já existe uma conta com este e-mail.');

    const hash = await gerarHashSenha(dados.senha);
    const dataAtual = new Date().toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });

    const [novo] = await db
      .insert(usuarios)
      .values({
        nome: dados.nome.trim(),
        email: emailNorm,
        telefone: dados.telefone?.trim() || null,
        senha: hash,
        avatarUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(emailNorm)}`,
        membroDesde: dataAtual,
      })
      .returning();

    await AsyncStorage.setItem(CHAVE_SESSAO, String(novo.id));
    setUsuario(novo);
  }

  async function sair() {
    await AsyncStorage.removeItem(CHAVE_SESSAO);
    setUsuario(null);
  }

  async function atualizarPerfil(dados: Partial<Usuario>) {
    if (!usuario) return;
    await db.update(usuarios).set(dados).where(eq(usuarios.id, usuario.id));
    setUsuario({ ...usuario, ...dados });
  }

  async function recarregar() {
    if (!usuario) return;
    const [u] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.id, usuario.id))
      .limit(1);
    if (u) setUsuario(u);
  }

  return (
    <Contexto.Provider
      value={{
        usuario,
        carregando,
        entrar,
        registrar,
        sair,
        atualizarPerfil,
        recarregar,
      }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de ProvedorAuth');
  return ctx;
}
