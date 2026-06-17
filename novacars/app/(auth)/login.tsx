import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cores } from '../../constants/cores';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const { entrar } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function aoEntrar() {
    if (!email.trim() || !senha) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }
    setCarregando(true);
    try {
      await entrar(email, senha);
      router.replace('/(tabs)/explorar');
    } catch (e: any) {
      Alert.alert('Não foi possível entrar', e?.message ?? 'Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SafeAreaView style={styles.tela}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.cabecalho}>
            <Text style={styles.marca}>NOVACARS</Text>
            <Text style={styles.subtitulo}>
              Acesso exclusivo ao marketplace automotivo.
            </Text>
          </View>

          <View style={styles.card}>
            <Campo
              rotulo="E-mail"
              icone="mail-outline"
              valor={email}
              onChange={setEmail}
              placeholder="seu@email.com"
              teclado="email-address"
            />

            <View>
              <View style={styles.linhaRotulo}>
                <Text style={styles.rotulo}>Senha</Text>
                <Link href="/(auth)/recuperar-senha" style={styles.link}>
                  Esqueci minha senha
                </Link>
              </View>
              <View style={styles.inputWrap}>
                <MaterialIcons name="lock-outline" size={20} color={Cores.textoVariante} style={styles.iconeEsq} />
                <TextInput
                  style={styles.input}
                  value={senha}
                  onChangeText={setSenha}
                  placeholder="••••••••"
                  placeholderTextColor={Cores.textoSuave}
                  secureTextEntry={!verSenha}
                />
                <TouchableOpacity onPress={() => setVerSenha((v) => !v)} style={styles.iconeDir}>
                  <MaterialIcons
                    name={verSenha ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={Cores.textoVariante}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.botao, carregando && { opacity: 0.6 }]}
              onPress={aoEntrar}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.botaoTexto}>ENTRAR</Text>
                  <MaterialIcons name="arrow-forward" size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divisor}>
              <View style={styles.linha} />
              <Text style={styles.divisorTexto}>Ou acesse com</Text>
              <View style={styles.linha} />
            </View>

            <View style={styles.social}>
              <BotaoSocial icone="account-circle" texto="Google" />
              <BotaoSocial icone="devices" texto="Apple" />
            </View>

            <View style={styles.rodape}>
              <Text style={styles.rodapeTexto}>Não tem uma conta? </Text>
              <Link href="/(auth)/registro" style={styles.linkForte}>
                CRIAR CONTA
              </Link>
            </View>
          </View>

          <Text style={styles.demo}>
            Conta de demonstração:{'\n'}paulo@novacars.com · senha 123456
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Campo({
  rotulo,
  icone,
  valor,
  onChange,
  placeholder,
  teclado,
}: {
  rotulo: string;
  icone: keyof typeof MaterialIcons.glyphMap;
  valor: string;
  onChange: (v: string) => void;
  placeholder: string;
  teclado?: 'default' | 'email-address';
}) {
  return (
    <View>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <View style={styles.inputWrap}>
        <MaterialIcons name={icone} size={20} color={Cores.textoVariante} style={styles.iconeEsq} />
        <TextInput
          style={styles.input}
          value={valor}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={Cores.textoSuave}
          keyboardType={teclado ?? 'default'}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}

function BotaoSocial({
  icone,
  texto,
}: {
  icone: keyof typeof MaterialIcons.glyphMap;
  texto: string;
}) {
  return (
    <TouchableOpacity
      style={styles.botaoSocial}
      onPress={() => Alert.alert('Em breve', `Login com ${texto} ainda não disponível.`)}
    >
      <MaterialIcons name={icone} size={20} color={Cores.texto} />
      <Text style={styles.botaoSocialTexto}>{texto}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Cores.fundo },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  cabecalho: { alignItems: 'center', marginBottom: 28 },
  marca: {
    color: Cores.primariaContainer,
    fontSize: 34,
    fontWeight: '800',
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  subtitulo: { color: Cores.textoVariante, fontSize: 15, marginTop: 8 },
  card: {
    backgroundColor: Cores.superficieBaixa,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Cores.superficieContainer,
    padding: 24,
    gap: 18,
  },
  linhaRotulo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rotulo: {
    color: Cores.textoVariante,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  link: { color: Cores.primaria, fontSize: 12, marginBottom: 8 },
  inputWrap: { position: 'relative', justifyContent: 'center' },
  iconeEsq: { position: 'absolute', left: 14, zIndex: 1 },
  iconeDir: { position: 'absolute', right: 14, zIndex: 1 },
  input: {
    backgroundColor: Cores.superficieAlta,
    color: Cores.texto,
    borderRadius: 6,
    paddingVertical: 14,
    paddingLeft: 44,
    paddingRight: 44,
    fontSize: 15,
  },
  botao: {
    backgroundColor: Cores.primariaContainer,
    borderRadius: 6,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  divisor: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  linha: { flex: 1, height: 1, backgroundColor: Cores.superficieMaisAlta },
  divisorTexto: {
    color: Cores.textoVariante,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  social: { flexDirection: 'row', gap: 8 },
  botaoSocial: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: Cores.superficieContainer,
    borderWidth: 1,
    borderColor: Cores.superficieMaisAlta,
  },
  botaoSocialTexto: { color: Cores.texto, fontSize: 14, fontWeight: '700' },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  rodapeTexto: { color: Cores.textoVariante, fontSize: 14 },
  linkForte: {
    color: Cores.primaria,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  demo: {
    color: Cores.textoSuave,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
});
