import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormularioAnuncio from '../../components/FormularioAnuncio';
import { Cores } from '../../constants/cores';
import { useAuth } from '../../contexts/AuthContext';
import { criarAnuncio } from '../../lib/consultas';

export default function Vender() {
  const { usuario } = useAuth();
  const router = useRouter();

  if (!usuario) {
    return (
      <SafeAreaView style={styles.tela}>
        <Text style={styles.aviso}>Faça login para anunciar.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <View style={styles.header}>
        <MaterialIcons name="add-box" size={22} color={Cores.primariaContainer} />
        <Text style={styles.titulo}>Anunciar Veículo</Text>
      </View>

      <FormularioAnuncio
        textoBotao="Publicar anúncio"
        onSalvar={async (dados) => {
          const id = await criarAnuncio({
            ...dados,
            usuarioId: usuario.id,
            status: 'ativo',
          });
          Alert.alert('Anúncio publicado!', 'Seu veículo já está no marketplace.', [
            {
              text: 'Ver anúncio',
              onPress: () => router.push(`/veiculo/${id}`),
            },
            {
              text: 'Ir para o perfil',
              onPress: () => router.push('/(tabs)/perfil'),
            },
          ]);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Cores.fundo },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  titulo: { color: Cores.texto, fontSize: 22, fontWeight: '800' },
  aviso: { color: Cores.textoVariante, textAlign: 'center', marginTop: 40, fontSize: 15 },
});
