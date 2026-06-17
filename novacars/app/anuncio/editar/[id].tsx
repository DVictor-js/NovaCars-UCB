import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormularioAnuncio from '../../../components/FormularioAnuncio';
import { Cores } from '../../../constants/cores';
import { useAuth } from '../../../contexts/AuthContext';
import { Veiculo } from '../../../db/schema';
import { atualizarAnuncio, obterVeiculo } from '../../../lib/consultas';

export default function EditarAnuncio() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { usuario } = useAuth();
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    obterVeiculo(Number(id)).then((dados) => {
      setVeiculo(dados?.veiculo ?? null);
      setCarregando(false);
    });
  }, [id]);

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator color={Cores.primariaContainer} size="large" />
      </View>
    );
  }

  if (!veiculo) {
    return (
      <SafeAreaView style={styles.centro}>
        <Text style={{ color: Cores.textoVariante }}>Anúncio não encontrado.</Text>
      </SafeAreaView>
    );
  }

  if (usuario?.id !== veiculo.usuarioId) {
    return (
      <SafeAreaView style={styles.centro}>
        <Text style={{ color: Cores.textoVariante }}>
          Você só pode editar os seus próprios anúncios.
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: Cores.primaria, fontWeight: '700' }}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnVoltar}>
          <MaterialIcons name="arrow-back" size={24} color={Cores.texto} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Editar Anúncio</Text>
      </View>

      <FormularioAnuncio
        inicial={veiculo}
        textoBotao="Salvar alterações"
        onSalvar={async (dados) => {
          await atualizarAnuncio(veiculo.id, dados);
          Alert.alert('Pronto!', 'Anúncio atualizado com sucesso.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Cores.fundo },
  centro: { flex: 1, backgroundColor: Cores.fundo, alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  btnVoltar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Cores.superficieContainer,
  },
  titulo: { color: Cores.texto, fontSize: 20, fontWeight: '800' },
});
