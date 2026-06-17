import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cores } from '../../constants/cores';
import { useAuth } from '../../contexts/AuthContext';
import { Usuario, Veiculo } from '../../db/schema';
import { formatarKm, formatarReal } from '../../lib/formato';
import { alternarFavorito, ehFavorito, obterVeiculo } from '../../lib/consultas';

export default function DetalhesVeiculo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { usuario } = useAuth();

  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [vendedor, setVendedor] = useState<Usuario | null>(null);
  const [imagemAtual, setImagemAtual] = useState<string | null>(null);
  const [favorito, setFavorito] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    const dados = await obterVeiculo(Number(id));
    if (dados) {
      setVeiculo(dados.veiculo);
      setVendedor(dados.vendedor ?? null);
      setImagemAtual(dados.veiculo.imagemUrl ?? null);
      if (usuario) setFavorito(await ehFavorito(usuario.id, dados.veiculo.id));
    }
    setCarregando(false);
  }, [id, usuario]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

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
        <Text style={{ color: Cores.textoVariante }}>Veículo não encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: Cores.primaria, fontWeight: '700' }}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const galeria: string[] = [
    veiculo.imagemUrl,
    ...(veiculo.imagens ? safeParse(veiculo.imagens) : []),
  ].filter(Boolean) as string[];

  async function toggleFav() {
    if (!usuario || !veiculo) return;
    setFavorito(await alternarFavorito(usuario.id, veiculo.id));
  }

  function abrirWhatsApp() {
    if (!vendedor?.telefone) {
      Alert.alert('Indisponível', 'Este vendedor não informou telefone.');
      return;
    }
    const num = vendedor.telefone.replace(/\D/g, '');
    const texto = encodeURIComponent(
      `Olá! Tenho interesse no ${veiculo!.marca} ${veiculo!.modelo} (${veiculo!.ano}) anunciado no NOVACARS.`
    );
    const url = `whatsapp://send?phone=55${num}&text=${texto}`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://wa.me/55${num}?text=${texto}`).catch(() =>
        Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.')
      )
    );
  }

  function ligar() {
    if (!vendedor?.telefone) {
      Alert.alert('Indisponível', 'Este vendedor não informou telefone.');
      return;
    }
    Linking.openURL(`tel:${vendedor.telefone.replace(/\D/g, '')}`);
  }

  const ehDono = usuario?.id === veiculo.usuarioId;

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topo}>
        <TouchableOpacity onPress={() => router.back()} style={styles.topoBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Cores.texto} />
        </TouchableOpacity>
        <Text style={styles.topoTitulo}>NOVACARS</Text>
        <TouchableOpacity onPress={toggleFav} style={styles.topoBtn}>
          <MaterialIcons
            name={favorito ? 'favorite' : 'favorite-border'}
            size={24}
            color={favorito ? Cores.primariaContainer : Cores.texto}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Galeria */}
        <View style={styles.galeriaWrap}>
          <Image source={{ uri: imagemAtual ?? undefined }} style={styles.imagemPrincipal} contentFit="cover" />
          {veiculo.status === 'vendido' && (
            <View style={styles.vendidoFaixa}>
              <Text style={styles.vendidoTexto}>VENDIDO</Text>
            </View>
          )}
        </View>

        {galeria.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbs}
          >
            {galeria.map((img, i) => (
              <TouchableOpacity key={i} onPress={() => setImagemAtual(img)}>
                <Image
                  source={{ uri: img }}
                  style={[styles.thumb, imagemAtual === img && styles.thumbAtivo]}
                  contentFit="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.conteudo}>
          {/* Título e preço */}
          <Text style={styles.titulo}>
            {veiculo.ano} {veiculo.marca} {veiculo.modelo}
          </Text>
          {veiculo.motor ? <Text style={styles.subtitulo}>{veiculo.motor}</Text> : null}

          <View style={styles.precoLinha}>
            <Text style={styles.preco}>{formatarReal(veiculo.preco)}</Text>
            {veiculo.precoAntigo ? (
              <Text style={styles.precoAntigo}>{formatarReal(veiculo.precoAntigo)}</Text>
            ) : null}
          </View>

          {/* Specs bento */}
          <View style={styles.specs}>
            <SpecCard icone="speed" rotulo="Quilometragem" valor={formatarKm(veiculo.quilometragem)} />
            <SpecCard icone="settings" rotulo="Câmbio" valor={veiculo.cambio} />
            <SpecCard icone="local-gas-station" rotulo="Combustível" valor={veiculo.combustivel} />
            <SpecCard icone="calendar-month" rotulo="Ano" valor={String(veiculo.ano)} />
            {veiculo.potencia ? <SpecCard icone="bolt" rotulo="Potência" valor={veiculo.potencia} /> : null}
            {veiculo.cor ? <SpecCard icone="palette" rotulo="Cor" valor={veiculo.cor} /> : null}
          </View>

          {/* Descrição */}
          {veiculo.descricao ? (
            <View style={styles.bloco}>
              <Text style={styles.blocoTitulo}>Sobre o veículo</Text>
              <Text style={styles.descricao}>{veiculo.descricao}</Text>
            </View>
          ) : null}

          {/* Localização */}
          {veiculo.cidade ? (
            <View style={styles.localLinha}>
              <MaterialIcons name="location-on" size={18} color={Cores.primaria} />
              <Text style={styles.localTexto}>
                {veiculo.cidade}
                {veiculo.estado ? `, ${veiculo.estado}` : ''}
              </Text>
            </View>
          ) : null}

          {/* Vendedor */}
          {vendedor && (
            <View style={styles.vendedorCard}>
              <Image source={{ uri: vendedor.avatarUrl ?? undefined }} style={styles.vendedorAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.vendedorNome}>{vendedor.nome}</Text>
                <Text style={styles.vendedorInfo}>
                  {vendedor.cidade ? `${vendedor.cidade}` : 'Vendedor'}
                  {vendedor.estado ? `, ${vendedor.estado}` : ''}
                </Text>
              </View>
              <MaterialIcons name="verified-user" size={22} color={Cores.terciaria} />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Barra fixa de contato */}
      {!ehDono && veiculo.status !== 'vendido' && (
        <View style={styles.barraContato}>
          <TouchableOpacity style={styles.btnLigar} onPress={ligar}>
            <MaterialIcons name="call" size={22} color={Cores.texto} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnWhats} onPress={abrirWhatsApp}>
            <MaterialIcons name="chat" size={20} color="#fff" />
            <Text style={styles.btnWhatsTexto}>Contatar vendedor</Text>
          </TouchableOpacity>
        </View>
      )}

      {ehDono && (
        <View style={styles.barraContato}>
          <TouchableOpacity
            style={[styles.btnWhats, { flex: 1 }]}
            onPress={() => router.push(`/anuncio/editar/${veiculo.id}`)}
          >
            <MaterialIcons name="edit-square" size={20} color="#fff" />
            <Text style={styles.btnWhatsTexto}>Editar meu anúncio</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function SpecCard({
  icone,
  rotulo,
  valor,
}: {
  icone: keyof typeof MaterialIcons.glyphMap;
  rotulo: string;
  valor: string;
}) {
  return (
    <View style={styles.specCard}>
      <MaterialIcons name={icone} size={22} color={Cores.primaria} />
      <View style={{ flex: 1 }}>
        <Text style={styles.specRotulo}>{rotulo}</Text>
        <Text style={styles.specValor} numberOfLines={1}>
          {valor}
        </Text>
      </View>
    </View>
  );
}

function safeParse(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Cores.fundo },
  centro: { flex: 1, backgroundColor: Cores.fundo, alignItems: 'center', justifyContent: 'center' },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  topoBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Cores.superficieContainer,
  },
  topoTitulo: {
    color: Cores.primariaContainer,
    fontSize: 18,
    fontWeight: '800',
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  galeriaWrap: { height: 280, marginTop: 4 },
  imagemPrincipal: { width: '100%', height: '100%' },
  vendidoFaixa: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: Cores.terciaria,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  vendidoTexto: { color: Cores.fundo, fontWeight: '800', letterSpacing: 1 },
  thumbs: { gap: 10, paddingHorizontal: 20, paddingVertical: 14 },
  thumb: { width: 72, height: 56, borderRadius: 10, backgroundColor: Cores.superficieAlta },
  thumbAtivo: { borderWidth: 2, borderColor: Cores.primariaContainer },
  conteudo: { paddingHorizontal: 20, paddingTop: 6 },
  titulo: { color: Cores.texto, fontSize: 26, fontWeight: '800' },
  subtitulo: { color: Cores.textoVariante, fontSize: 14, marginTop: 4 },
  precoLinha: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 12 },
  preco: { color: Cores.primaria, fontSize: 30, fontWeight: '800' },
  precoAntigo: {
    color: Cores.textoSuave,
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  specs: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 22 },
  specCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '47%',
    backgroundColor: Cores.superficieContainer,
    borderWidth: 1,
    borderColor: Cores.superficieAlta,
    borderRadius: 14,
    padding: 14,
  },
  specRotulo: { color: Cores.textoVariante, fontSize: 11 },
  specValor: { color: Cores.texto, fontSize: 14, fontWeight: '700', marginTop: 2 },
  bloco: { marginTop: 24 },
  blocoTitulo: { color: Cores.texto, fontSize: 17, fontWeight: '800', marginBottom: 10 },
  descricao: { color: Cores.textoVariante, fontSize: 15, lineHeight: 23 },
  localLinha: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 18 },
  localTexto: { color: Cores.texto, fontSize: 14, fontWeight: '600' },
  vendedorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    padding: 16,
    backgroundColor: Cores.superficieContainer,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Cores.superficieAlta,
  },
  vendedorAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Cores.superficieAlta },
  vendedorNome: { color: Cores.texto, fontSize: 16, fontWeight: '700' },
  vendedorInfo: { color: Cores.textoVariante, fontSize: 13, marginTop: 2 },
  barraContato: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
    backgroundColor: Cores.superficieMaisBaixa,
    borderTopWidth: 1,
    borderTopColor: Cores.superficieContainer,
  },
  btnLigar: {
    width: 54,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Cores.superficieAlta,
    borderRadius: 12,
  },
  btnWhats: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Cores.primariaContainer,
    paddingVertical: 16,
    borderRadius: 12,
  },
  btnWhatsTexto: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
