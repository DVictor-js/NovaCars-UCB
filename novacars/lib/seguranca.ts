import * as Crypto from 'expo-crypto';

// Gera o hash SHA-256 da senha. (Para um protótipo local isto já evita
// guardar senha em texto puro; em produção use bcrypt/argon2 no servidor.)
export async function gerarHashSenha(senha: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    senha
  );
}

export async function conferirSenha(
  senha: string,
  hashArmazenado: string
): Promise<boolean> {
  const hash = await gerarHashSenha(senha);
  return hash === hashArmazenado;
}
