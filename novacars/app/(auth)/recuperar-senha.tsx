import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cores } from '../../constants/cores';

export default function RecuperarSenha() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  function enviar() {
    if (!email.trim()) {
      Alert.alert('Atenção', 'Informe seu e-mail.');
      return;
    }
    Alert.alert(
      'Link enviado',
      `Se houver uma conta para ${email.trim()}, enviaremos um link de redefinição.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }

  return (
    <SafeAreaView style={styles.tela}>
      <View style={styles.conteudo}>
        <View style={styles.icone}>
          <MaterialIcons name="lock-reset" size={26} color={Cores.primariaContainer} />
        </View>

        <Text style={styles.titulo}>Recuperação de Senha</Text>
        <Text style={styles.subtitulo}>
          Esqueceu sua senha? Sem problemas. Digite o e-mail associado à sua conta
          e enviaremos um link seguro para redefini-la.
        </Text>

        <View style={{ marginTop: 24 }}>
          <Text style={styles.rotulo}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            placeholderTextColor={Cores.textoSuave}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity style={styles.botao} onPress={enviar}>
          <Text style={styles.botaoTexto}>ENVIAR LINK</Text>
          <MaterialIcons name="send" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.voltar} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={18} color={Cores.textoVariante} />
          <Text style={styles.voltarTexto}>Voltar ao Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Cores.fundo },
  conteudo: { flex: 1, justifyContent: 'center', padding: 28 },
  icone: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Cores.superficieAlta,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Cores.superficieMaisAlta,
    marginBottom: 24,
  },
  titulo: { color: Cores.texto, fontSize: 28, fontWeight: '800' },
  subtitulo: {
    color: Cores.textoVariante,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  rotulo: {
    color: Cores.texto,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Cores.superficieAlta,
    color: Cores.texto,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    borderBottomWidth: 2,
    borderBottomColor: Cores.contornoVariante,
  },
  botao: {
    backgroundColor: Cores.primariaContainer,
    borderRadius: 6,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  botaoTexto: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  voltar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Cores.superficieAlta,
  },
  voltarTexto: { color: Cores.textoVariante, fontSize: 14, fontWeight: '700' },
});
