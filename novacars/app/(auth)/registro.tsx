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

export default function Registro() {
  const { registrar } = useAuth();
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [aceito, setAceito] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function cadastrar() {
    if (!nome.trim() || !email.trim() || !senha) {
      Alert.alert('Atenção', 'Preencha nome, e-mail e senha.');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Senha curta', 'A senha precisa ter ao menos 6 caracteres.');
      return;
    }
    if (!aceito) {
      Alert.alert('Termos de uso', 'É preciso aceitar os termos para continuar.');
      return;
    }
    setCarregando(true);
    try {
      await registrar({ nome, email, telefone, senha });
      router.replace('/(tabs)/explorar');
    } catch (e: any) {
      Alert.alert('Não foi possível cadastrar', e?.message ?? 'Tente novamente.');
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
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.marca}>NOVACARS</Text>
          <Text style={styles.titulo}>Criar Conta</Text>
          <Text style={styles.subtitulo}>
            Insira seus dados para acessar o marketplace.
          </Text>

          <View style={styles.form}>
            <Campo rotulo="Nome Completo" valor={nome} onChange={setNome} placeholder="Digite seu nome completo" />
            <Campo rotulo="E-mail" valor={email} onChange={setEmail} placeholder="seu@email.com" teclado="email-address" />
            <Campo rotulo="Telefone" valor={telefone} onChange={setTelefone} placeholder="(00) 00000-0000" teclado="phone-pad" />

            <View>
              <Text style={styles.rotulo}>Senha</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  value={senha}
                  onChangeText={setSenha}
                  placeholder="Mínimo de 6 caracteres"
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

            <TouchableOpacity style={styles.termos} onPress={() => setAceito((a) => !a)}>
              <View style={[styles.check, aceito && styles.checkAtivo]}>
                {aceito && <MaterialIcons name="check" size={14} color="#fff" />}
              </View>
              <Text style={styles.termosTexto}>
                Li e concordo com os{' '}
                <Text style={{ color: Cores.primaria }}>Termos de uso</Text> da plataforma.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botao, carregando && { opacity: 0.6 }]}
              onPress={cadastrar}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.botaoTexto}>CADASTRAR</Text>
                  <MaterialIcons name="arrow-forward" size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.rodape}>
            <Text style={styles.rodapeTexto}>Já tenho conta, </Text>
            <Link href="/(auth)/login" style={styles.link}>
              fazer login
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Campo({
  rotulo,
  valor,
  onChange,
  placeholder,
  teclado,
}: {
  rotulo: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder: string;
  teclado?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput
        style={styles.input}
        value={valor}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Cores.textoSuave}
        keyboardType={teclado ?? 'default'}
        autoCapitalize={teclado === 'email-address' ? 'none' : 'sentences'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Cores.fundo },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  marca: {
    color: Cores.primariaContainer,
    fontSize: 18,
    fontWeight: '800',
    fontStyle: 'italic',
    letterSpacing: 2,
    marginBottom: 24,
  },
  titulo: { color: Cores.texto, fontSize: 30, fontWeight: '800' },
  subtitulo: { color: Cores.textoVariante, fontSize: 15, marginTop: 6, marginBottom: 24 },
  form: { gap: 16 },
  rotulo: {
    color: Cores.textoVariante,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputWrap: { position: 'relative', justifyContent: 'center' },
  iconeDir: { position: 'absolute', right: 14 },
  input: {
    backgroundColor: Cores.superficieMaisAlta,
    color: Cores.texto,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    borderBottomWidth: 2,
    borderBottomColor: Cores.contornoVariante,
  },
  termos: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  check: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Cores.contornoVariante,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkAtivo: {
    backgroundColor: Cores.primariaContainer,
    borderColor: Cores.primariaContainer,
  },
  termosTexto: { flex: 1, color: Cores.textoVariante, fontSize: 14, lineHeight: 20 },
  botao: {
    backgroundColor: Cores.primariaContainer,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  botaoTexto: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  rodape: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  rodapeTexto: { color: Cores.textoVariante, fontSize: 14 },
  link: { color: Cores.texto, fontSize: 14, fontWeight: '700' },
});
