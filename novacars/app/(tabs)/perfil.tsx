import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CartaoVeiculo from '../../components/CartaoVeiculo';
import { Cores } from '../../constants/cores';
import { useAuth } from '../../contexts/AuthContext';
import { Veiculo } from '../../db/schema';
import { formatarReal, formatarKm } from '../../lib/formato';
import {
  alternarFavorito,
  contarPorStatus,
  definirStatus,
  excluirAnuncio,
  listarFavoritos,
  listarPorUsuario,
} from '../../lib/consultas';

type Aba = 'anuncios' | 'favoritos';

export default function Perfil() {
  const { usuario, sair } = useAuth();
  const router = useRouter();
  const [aba, setAba] = useState<Aba>('anuncios');
  const [anuncios, setAnuncios] = useState<Veiculo[]>([]);
  const [favoritos, setFavoritos] = useState<Veiculo[]>([]);
  const [resumo, setResumo] = useState({ anunciados: 0, vendidos: 0 });

  const carregar = useCallback(async () => {
    if (!usuario) return;
    setAnuncios(await listarPorUsuario(usuario.id));
    setFavoritos(await listarFavoritos(usuario.id));
    setResumo(await contarPorStatus(usuario.id));
  }, [usuario]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  if (!usuario) return null;

  function abrirAcoes(v: Veiculo) {
    const opcoes: any[] = [
      { text: 'Editar', onPress: () => router.push(`/anuncio/editar/${v.id}`) },
    ];
    if (v.status !== 'vendido') {
      opcoes.push({
        text: 'Marcar como vendido',
        onPress: async () => {
          await definirStatus(v.id, 'vendido');
          carregar();
        },
      });
    } else {
      opcoes.push({
        text: 'Reativar anúncio',
        onPress: async () => {
          await definirStatus(v.id, 'ativo');
          carregar();
        },
      });
    }
    opcoes.push({
      text: 'Excluir',
      style: 'destructive',
      onPress: () =>
        Alert.alert('Excluir anúncio', 'Esta ação não pode ser desfeita.', [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: async () => {
              await excluirAnuncio(v.id);
              carregar();
            },
          },
        ]),
    });
    opcoes.push({ text: 'Cancelar', style: 'cancel' });
    Alert.alert(`${v.marca} ${v.modelo}`, 'O que deseja fazer?', opcoes);
  }

  async function removerFavorito(id: number) {
    await alternarFavorito(usuario!.id, id);
    setFavoritos((prev) => prev.filter((v) => v.id !== id));
  }

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        {/* Cabeçalho do perfil */}
        <View style={styles.perfilHeader}>
          <View style={styles.glow} />
          <View style={styles.perfilTopo}>
            <Image source={{ uri: usuario.avatarUrl ?? undefined }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <View style={styles.nomeLinha}>
                <Text style={styles.nome}>{usuario.nome}</Text>
                <View style={styles.badgePremium}>
                  <MaterialIcons name="star" size={12} color={Cores.primaria} />
                  <Text style={styles.badgePremiumTexto}>Premium</Text>
                </View>
              </View>
              <Text style={styles.subinfo}>
                {usuario.membroDesde ? `Entrou em ${usuario.membroDesde}` : 'Membro'}
                {usuario.cidade ? ` • ${usuario.cidade}` : ''}
                {usuario.estado ? `, ${usuario.estado}` : ''}
              </Text>
            </View>
          </View>

          <View style={styles.stats}>
            <Stat valor={resumo.anunciados} rotulo="ANUNCIADOS" />
            <View style={styles.statDivisor} />
            <Stat valor={resumo.vendidos} rotulo="VENDIDOS" />
            <View style={styles.statDivisor} />
            <Stat valor={favoritos.length} rotulo="FAVORITOS" />
          </View>

          <View style={styles.acoesPerfil}>
            <TouchableOpacity style={styles.btnSecundario} onPress={() => router.push('/(tabs)/vender')}>
              <MaterialIcons name="add" size={18} color="#fff" />
              <Text style={styles.btnSecundarioTexto}>Novo anúncio</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnSair}
              onPress={() =>
                Alert.alert('Sair', 'Deseja encerrar a sessão?', [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Sair', style: 'destructive', onPress: () => sair() },
                ])
              }
            >
              <MaterialIcons name="logout" size={18} color={Cores.textoVariante} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Abas */}
        <View style={styles.abas}>
          <Tab rotulo="Meus Anúncios" ativo={aba === 'anuncios'} onPress={() => setAba('anuncios')} />
          <Tab rotulo="Favoritos" ativo={aba === 'favoritos'} onPress={() => setAba('favoritos')} />
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          {aba === 'anuncios' ? (
            anuncios.length === 0 ? (
              <Vazio
                icone="directions-car"
                titulo="Você ainda não tem anúncios"
                texto="Toque em 'Novo anúncio' para colocar seu veículo à venda."
              />
            ) : (
              anuncios.map((v) => (
                <CartaoMeuAnuncio key={v.id} veiculo={v} onAcoes={() => abrirAcoes(v)} />
              ))
            )
          ) : favoritos.length === 0 ? (
            <Vazio icone="favorite-border" titulo="Nenhum favorito" texto="Salve anúncios tocando no coração." />
          ) : (
            favoritos.map((v) => (
              <CartaoVeiculo key={v.id} veiculo={v} favoritado onToggleFavorito={removerFavorito} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ valor, rotulo }: { valor: number; rotulo: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValor}>{valor}</Text>
      <Text style={styles.statRotulo}>{rotulo}</Text>
    </View>
  );
}

function Tab({ rotulo, ativo, onPress }: { rotulo: string; ativo: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.tab, ativo && styles.tabAtiva]} onPress={onPress}>
      <Text style={[styles.tabTexto, ativo && styles.tabTextoAtivo]}>{rotulo}</Text>
    </TouchableOpacity>
  );
}

function Vazio({ icone, titulo, texto }: { icone: any; titulo: string; texto: string }) {
  return (
    <View style={styles.vazio}>
      <MaterialIcons name={icone} size={42} color={Cores.textoSuave} />
      <Text style={styles.vazioTitulo}>{titulo}</Text>
      <Text style={styles.vazioTexto}>{texto}</Text>
    </View>
  );
}

function CartaoMeuAnuncio({ veiculo, onAcoes }: { veiculo: Veiculo; onAcoes: () => void }) {
  const router = useRouter();
  const vendido = veiculo.status === 'vendido';
  return (
    <Pressable style={styles.meuCard} onPress={() => router.push(`/veiculo/${veiculo.id}`)}>
      <View style={styles.meuImgWrap}>
        <Image source={{ uri: veiculo.imagemUrl ?? undefined }} style={styles.meuImg} contentFit="cover" />
        <View style={[styles.statusBadge, vendido ? styles.statusVendido : styles.statusAtivo]}>
          {vendido ? (
            <MaterialIcons name="check-circle" size={12} color={Cores.fundo} />
          ) : (
            <View style={styles.pontoAtivo} />
          )}
          <Text style={[styles.statusTexto, vendido && { color: Cores.fundo }]}>
            {vendido ? 'Vendido' : 'Ativo'}
          </Text>
        </View>
        <View style={styles.precoTag}>
          <Text style={styles.precoTagTexto}>{formatarReal(veiculo.preco)}</Text>
        </View>
      </View>
      <View style={styles.meuCorpo}>
        <View style={styles.meuLinha}>
          <Text style={styles.meuTitulo} numberOfLines={1}>
            {veiculo.ano} {veiculo.marca} {veiculo.modelo}
          </Text>
          <TouchableOpacity onPress={onAcoes} hitSlop={8}>
            <MaterialIcons name="more-vert" size={22} color={Cores.textoVariante} />
          </TouchableOpacity>
        </View>
        <View style={styles.meuSpecs}>
          <Text style={styles.meuSpec}>
            <MaterialIcons name="speed" size={13} color={Cores.textoVariante} /> {formatarKm(veiculo.quilometragem)}
          </Text>
          <Text style={styles.meuSpec}>
            <MaterialIcons name="settings" size={13} color={Cores.textoVariante} /> {veiculo.cambio}
          </Text>
          {veiculo.cidade ? (
            <Text style={styles.meuSpec}>
              <MaterialIcons name="location-on" size={13} color={Cores.textoVariante} /> {veiculo.cidade}
            </Text>
          ) : null}
        </View>
        <View style={styles.meuAcoes}>
          <TouchableOpacity style={styles.meuBtn} onPress={() => router.push(`/anuncio/editar/${veiculo.id}`)}>
            <MaterialIcons name="edit-square" size={16} color={Cores.texto} />
            <Text style={styles.meuBtnTexto}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.meuBtn} onPress={onAcoes}>
            <MaterialIcons name="tune" size={16} color={Cores.texto} />
            <Text style={styles.meuBtnTexto}>Gerenciar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Cores.fundo },
  perfilHeader: {
    margin: 20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: Cores.superficieContainer,
    borderWidth: 1,
    borderColor: Cores.superficieAlta,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(220,20,60,0.18)',
  },
  perfilTopo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Cores.primariaContainer,
    backgroundColor: Cores.superficieAlta,
  },
  nomeLinha: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  nome: { color: Cores.texto, fontSize: 22, fontWeight: '800' },
  badgePremium: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(220,20,60,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgePremiumTexto: { color: Cores.primaria, fontSize: 11, fontWeight: '700' },
  subinfo: { color: Cores.textoVariante, fontSize: 13, marginTop: 4 },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Cores.superficieAlta,
  },
  stat: { alignItems: 'center', flex: 1 },
  statValor: { color: Cores.texto, fontSize: 22, fontWeight: '800' },
  statRotulo: { color: Cores.textoVariante, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  statDivisor: { width: 1, height: 30, backgroundColor: Cores.superficieAlta },
  acoesPerfil: { flexDirection: 'row', gap: 10, marginTop: 18 },
  btnSecundario: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Cores.primariaContainer,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnSecundarioTexto: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnSair: {
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Cores.superficieAlta,
    borderRadius: 10,
  },
  abas: { flexDirection: 'row', gap: 8, paddingHorizontal: 20 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: Cores.superficieContainer },
  tabAtiva: { backgroundColor: Cores.primariaContainer },
  tabTexto: { color: Cores.textoVariante, fontWeight: '700', fontSize: 14 },
  tabTextoAtivo: { color: '#fff' },
  vazio: { alignItems: 'center', justifyContent: 'center', paddingTop: 50, gap: 10 },
  vazioTitulo: { color: Cores.texto, fontSize: 16, fontWeight: '700' },
  vazioTexto: { color: Cores.textoSuave, fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
  meuCard: {
    backgroundColor: Cores.superficieContainer,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Cores.superficieAlta,
    marginBottom: 16,
  },
  meuImgWrap: { height: 160, position: 'relative' },
  meuImg: { width: '100%', height: '100%' },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusAtivo: { backgroundColor: 'rgba(0,0,0,0.6)' },
  statusVendido: { backgroundColor: Cores.terciaria },
  pontoAtivo: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2ecc71' },
  statusTexto: { color: '#fff', fontSize: 11, fontWeight: '700' },
  precoTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  precoTagTexto: { color: '#fff', fontWeight: '800', fontSize: 14 },
  meuCorpo: { padding: 14 },
  meuLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  meuTitulo: { color: Cores.texto, fontSize: 16, fontWeight: '700', flex: 1 },
  meuSpecs: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 8 },
  meuSpec: { color: Cores.textoVariante, fontSize: 12 },
  meuAcoes: { flexDirection: 'row', gap: 10, marginTop: 14 },
  meuBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Cores.superficieAlta,
    paddingVertical: 10,
    borderRadius: 8,
  },
  meuBtnTexto: { color: Cores.texto, fontSize: 13, fontWeight: '600' },
});
