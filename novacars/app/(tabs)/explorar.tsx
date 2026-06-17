import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CartaoVeiculo from '../../components/CartaoVeiculo';
import { Cores } from '../../constants/cores';
import { useAuth } from '../../contexts/AuthContext';
import { Veiculo } from '../../db/schema';
import {
  alternarFavorito,
  idsFavoritos,
  listarDestaques,
} from '../../lib/consultas';

const CATEGORIAS = [
  { nome: 'SUV', icone: 'directions-car' as const },
  { nome: 'Sedã', icone: 'directions-car' as const },
  { nome: 'Elétrico', icone: 'electric-car' as const },
  { nome: 'Esportivo', icone: 'sports-score' as const },
];

export default function Explorar() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [destaques, setDestaques] = useState<Veiculo[]>([]);
  const [favs, setFavs] = useState<number[]>([]);
  const [busca, setBusca] = useState('');

  const carregar = useCallback(async () => {
    setDestaques(await listarDestaques());
    if (usuario) setFavs(await idsFavoritos(usuario.id));
  }, [usuario]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  async function toggleFav(id: number) {
    if (!usuario) return;
    const novo = await alternarFavorito(usuario.id, id);
    setFavs((prev) => (novo ? [...prev, id] : prev.filter((x) => x !== id)));
  }

  function explorar() {
    router.push(
      busca.trim()
        ? `/(tabs)/buscar?texto=${encodeURIComponent(busca.trim())}`
        : '/(tabs)/buscar'
    );
  }

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.marca}>NOVACARS</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/perfil')}>
          <Image
            source={{ uri: usuario?.avatarUrl ?? undefined }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=1200&auto=format&fit=crop',
            }}
            style={styles.heroImg}
            contentFit="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroConteudo}>
            <Text style={styles.heroTitulo}>VELOCIDADE</Text>
            <View style={styles.buscaWrap}>
              <MaterialIcons name="search" size={20} color={Cores.textoVariante} />
              <TextInput
                style={styles.buscaInput}
                placeholder="Procurar modelo ou marca"
                placeholderTextColor={Cores.textoSuave}
                value={busca}
                onChangeText={setBusca}
                onSubmitEditing={explorar}
                returnKeyType="search"
              />
              <TouchableOpacity style={styles.buscaBotao} onPress={explorar}>
                <Text style={styles.buscaBotaoTexto}>Explorar</Text>
                <MaterialIcons name="chevron-right" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Categorias */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Explorar Categorias</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 20 }}
          >
            {CATEGORIAS.map((c) => (
              <TouchableOpacity
                key={c.nome}
                style={styles.catCard}
                onPress={() =>
                  router.push(`/(tabs)/buscar?categoria=${encodeURIComponent(c.nome)}`)
                }
              >
                <MaterialIcons name={c.icone} size={26} color={Cores.primaria} />
                <Text style={styles.catTexto}>{c.nome}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Destaques */}
        <View style={[styles.secao, { paddingBottom: 24 }]}>
          <View style={styles.secaoHeader}>
            <Text style={styles.secaoTitulo}>Destaques</Text>
            <TouchableOpacity
              style={styles.verTodos}
              onPress={() => router.push('/(tabs)/buscar')}
            >
              <Text style={styles.verTodosTexto}>Ver todos</Text>
              <MaterialIcons name="arrow-forward" size={16} color={Cores.primaria} />
            </TouchableOpacity>
          </View>

          {destaques.map((v) => (
            <CartaoVeiculo
              key={v.id}
              veiculo={v}
              favoritado={favs.includes(v.id)}
              onToggleFavorito={toggleFav}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Cores.fundo },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  marca: {
    color: Cores.primariaContainer,
    fontSize: 20,
    fontWeight: '800',
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Cores.superficieAlta },
  hero: { height: 220, margin: 20, borderRadius: 20, overflow: 'hidden' },
  heroImg: { ...StyleSheet.absoluteFillObject },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(19,19,19,0.45)',
  },
  heroConteudo: { flex: 1, justifyContent: 'flex-end', padding: 18, gap: 14 },
  heroTitulo: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  buscaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20,20,20,0.85)',
    borderRadius: 12,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 8,
  },
  buscaInput: { flex: 1, color: Cores.texto, fontSize: 14 },
  buscaBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Cores.primariaContainer,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  buscaBotaoTexto: { color: '#fff', fontWeight: '700', fontSize: 13 },
  secao: { paddingLeft: 20, marginTop: 4, marginBottom: 8 },
  secaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
    marginBottom: 14,
  },
  secaoTitulo: { color: Cores.texto, fontSize: 19, fontWeight: '800', marginBottom: 14 },
  verTodos: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verTodosTexto: { color: Cores.primaria, fontSize: 13, fontWeight: '600' },
  catCard: {
    width: 100,
    height: 90,
    borderRadius: 14,
    backgroundColor: Cores.superficieContainer,
    borderWidth: 1,
    borderColor: Cores.superficieAlta,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  catTexto: { color: Cores.texto, fontSize: 13, fontWeight: '600' },
});
