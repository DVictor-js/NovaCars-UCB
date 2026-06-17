import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CartaoVeiculo from '../../components/CartaoVeiculo';
import { Cores } from '../../constants/cores';
import { useAuth } from '../../contexts/AuthContext';
import { Veiculo } from '../../db/schema';
import { alternarFavorito, listarFavoritos } from '../../lib/consultas';

export default function Favoritos() {
  const { usuario } = useAuth();
  const [lista, setLista] = useState<Veiculo[]>([]);

  const carregar = useCallback(async () => {
    if (usuario) setLista(await listarFavoritos(usuario.id));
  }, [usuario]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  async function remover(id: number) {
    if (!usuario) return;
    await alternarFavorito(usuario.id, id);
    setLista((prev) => prev.filter((v) => v.id !== id));
  }

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Favoritos</Text>
        <Text style={styles.contador}>{lista.length} salvo(s)</Text>
      </View>

      <FlatList
        data={lista}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <CartaoVeiculo veiculo={item} favoritado onToggleFavorito={remover} />
        )}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <MaterialIcons name="favorite-border" size={44} color={Cores.textoSuave} />
            <Text style={styles.vazioTitulo}>Nenhum favorito ainda</Text>
            <Text style={styles.vazioTexto}>
              Toque no coração dos anúncios para salvá-los aqui.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Cores.fundo },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  titulo: { color: Cores.texto, fontSize: 24, fontWeight: '800' },
  contador: { color: Cores.textoVariante, fontSize: 13, marginTop: 2 },
  vazio: { alignItems: 'center', justifyContent: 'center', paddingTop: 100, gap: 10 },
  vazioTitulo: { color: Cores.texto, fontSize: 17, fontWeight: '700' },
  vazioTexto: { color: Cores.textoSuave, fontSize: 14, textAlign: 'center', paddingHorizontal: 50 },
});
