import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
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
  Filtros,
  idsFavoritos,
  listarMarcas,
  listarVeiculos,
  Ordenacao,
} from '../../lib/consultas';

const CATEGORIAS = ['SUV', 'Sedã', 'Esportivo', 'Elétrico', 'Hatch', 'Picape'];
const COMBUSTIVEIS = ['Flex', 'Gasolina', 'Diesel', 'Elétrico', 'Híbrido'];
const CAMBIOS = ['Automático', 'Manual'];
const ORDENS: { valor: Ordenacao; rotulo: string }[] = [
  { valor: 'recentes', rotulo: 'Mais recentes' },
  { valor: 'preco_asc', rotulo: 'Menor preço' },
  { valor: 'preco_desc', rotulo: 'Maior preço' },
  { valor: 'ano_desc', rotulo: 'Mais novo' },
  { valor: 'km_asc', rotulo: 'Menor KM' },
];

export default function Buscar() {
  const params = useLocalSearchParams<{ texto?: string; categoria?: string }>();
  const { usuario } = useAuth();

  const [texto, setTexto] = useState(params.texto ?? '');
  const [filtros, setFiltros] = useState<Filtros>({
    categoria: params.categoria,
    ordenar: 'recentes',
  });
  const [resultados, setResultados] = useState<Veiculo[]>([]);
  const [favs, setFavs] = useState<number[]>([]);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    listarMarcas().then(setMarcas);
  }, []);

  const buscar = useCallback(async () => {
    const f: Filtros = { ...filtros, texto };
    setResultados(await listarVeiculos(f));
    if (usuario) setFavs(await idsFavoritos(usuario.id));
  }, [filtros, texto, usuario]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  useFocusEffect(
    useCallback(() => {
      buscar();
    }, [buscar])
  );

  async function toggleFav(id: number) {
    if (!usuario) return;
    const novo = await alternarFavorito(usuario.id, id);
    setFavs((prev) => (novo ? [...prev, id] : prev.filter((x) => x !== id)));
  }

  const chipsAtivos = useMemo(() => {
    const c: { rotulo: string; remover: () => void }[] = [];
    if (filtros.categoria)
      c.push({ rotulo: filtros.categoria, remover: () => setFiltros((f) => ({ ...f, categoria: undefined })) });
    if (filtros.marca)
      c.push({ rotulo: filtros.marca, remover: () => setFiltros((f) => ({ ...f, marca: undefined })) });
    if (filtros.combustivel)
      c.push({ rotulo: filtros.combustivel, remover: () => setFiltros((f) => ({ ...f, combustivel: undefined })) });
    if (filtros.cambio)
      c.push({ rotulo: filtros.cambio, remover: () => setFiltros((f) => ({ ...f, cambio: undefined })) });
    if (filtros.precoMin || filtros.precoMax)
      c.push({
        rotulo: `R$ ${filtros.precoMin ?? 0} - ${filtros.precoMax ?? '∞'}`,
        remover: () => setFiltros((f) => ({ ...f, precoMin: undefined, precoMax: undefined })),
      });
    if (filtros.anoMin || filtros.anoMax)
      c.push({
        rotulo: `${filtros.anoMin ?? ''} - ${filtros.anoMax ?? ''}`,
        remover: () => setFiltros((f) => ({ ...f, anoMin: undefined, anoMax: undefined })),
      });
    return c;
  }, [filtros]);

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <View style={styles.cabecalho}>
        <View>
          <Text style={styles.titulo}>Resultados</Text>
          <Text style={styles.contador}>
            {resultados.length} veículo(s) encontrado(s)
          </Text>
        </View>
        <TouchableOpacity style={styles.btnFiltrar} onPress={() => setModal(true)}>
          <MaterialIcons name="tune" size={18} color="#fff" />
          <Text style={styles.btnFiltrarTexto}>Filtrar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buscaWrap}>
        <MaterialIcons name="search" size={20} color={Cores.textoVariante} />
        <TextInput
          style={styles.buscaInput}
          placeholder="Procurar modelos"
          placeholderTextColor={Cores.textoSuave}
          value={texto}
          onChangeText={setTexto}
        />
        {texto.length > 0 && (
          <TouchableOpacity onPress={() => setTexto('')}>
            <MaterialIcons name="close" size={18} color={Cores.textoVariante} />
          </TouchableOpacity>
        )}
      </View>

      {chipsAtivos.length > 0 && (
        <View style={styles.chipsLinha}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, alignItems: 'center' }}>
            {chipsAtivos.map((c, i) => (
              <View key={i} style={styles.chipAtivo}>
                <Text style={styles.chipAtivoTexto}>{c.rotulo}</Text>
                <TouchableOpacity onPress={c.remover} hitSlop={6}>
                  <MaterialIcons name="close" size={14} color={Cores.primaria} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => setFiltros({ ordenar: filtros.ordenar })}
            >
              <Text style={styles.limpar}>Limpar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      <FlatList
        data={resultados}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <CartaoVeiculo
            veiculo={item}
            favoritado={favs.includes(item.id)}
            onToggleFavorito={toggleFav}
          />
        )}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <MaterialIcons name="search-off" size={40} color={Cores.textoSuave} />
            <Text style={styles.vazioTexto}>
              Nenhum veículo encontrado com esses filtros.
            </Text>
          </View>
        }
      />

      <ModalFiltros
        visivel={modal}
        fechar={() => setModal(false)}
        filtros={filtros}
        aplicar={setFiltros}
        marcas={marcas}
      />
    </SafeAreaView>
  );
}

function ModalFiltros({
  visivel,
  fechar,
  filtros,
  aplicar,
  marcas,
}: {
  visivel: boolean;
  fechar: () => void;
  filtros: Filtros;
  aplicar: (f: Filtros) => void;
  marcas: string[];
}) {
  const [temp, setTemp] = useState<Filtros>(filtros);

  useEffect(() => {
    if (visivel) setTemp(filtros);
  }, [visivel, filtros]);

  const num = (s: string) => {
    const n = parseInt(s.replace(/\D/g, ''), 10);
    return isNaN(n) ? undefined : n;
  };

  return (
    <Modal visible={visivel} animationType="slide" transparent onRequestClose={fechar}>
      <View style={styles.modalFundo}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitulo}>Filtros</Text>
            <TouchableOpacity onPress={fechar}>
              <MaterialIcons name="close" size={24} color={Cores.texto} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
            <Grupo titulo="Ordenar por">
              {ORDENS.map((o) => (
                <Chip
                  key={o.valor}
                  rotulo={o.rotulo}
                  ativo={temp.ordenar === o.valor}
                  onPress={() => setTemp((t) => ({ ...t, ordenar: o.valor }))}
                />
              ))}
            </Grupo>

            <Grupo titulo="Categoria">
              {CATEGORIAS.map((c) => (
                <Chip
                  key={c}
                  rotulo={c}
                  ativo={temp.categoria === c}
                  onPress={() =>
                    setTemp((t) => ({ ...t, categoria: t.categoria === c ? undefined : c }))
                  }
                />
              ))}
            </Grupo>

            {marcas.length > 0 && (
              <Grupo titulo="Marca">
                {marcas.map((m) => (
                  <Chip
                    key={m}
                    rotulo={m}
                    ativo={temp.marca === m}
                    onPress={() =>
                      setTemp((t) => ({ ...t, marca: t.marca === m ? undefined : m }))
                    }
                  />
                ))}
              </Grupo>
            )}

            <Grupo titulo="Combustível">
              {COMBUSTIVEIS.map((c) => (
                <Chip
                  key={c}
                  rotulo={c}
                  ativo={temp.combustivel === c}
                  onPress={() =>
                    setTemp((t) => ({ ...t, combustivel: t.combustivel === c ? undefined : c }))
                  }
                />
              ))}
            </Grupo>

            <Grupo titulo="Câmbio">
              {CAMBIOS.map((c) => (
                <Chip
                  key={c}
                  rotulo={c}
                  ativo={temp.cambio === c}
                  onPress={() =>
                    setTemp((t) => ({ ...t, cambio: t.cambio === c ? undefined : c }))
                  }
                />
              ))}
            </Grupo>

            <Text style={styles.grupoTitulo}>Faixa de preço (R$)</Text>
            <View style={styles.linhaNum}>
              <CampoNum placeholder="Mín" valor={temp.precoMin} onChange={(v) => setTemp((t) => ({ ...t, precoMin: num(v) }))} />
              <CampoNum placeholder="Máx" valor={temp.precoMax} onChange={(v) => setTemp((t) => ({ ...t, precoMax: num(v) }))} />
            </View>

            <Text style={styles.grupoTitulo}>Ano</Text>
            <View style={styles.linhaNum}>
              <CampoNum placeholder="De" valor={temp.anoMin} onChange={(v) => setTemp((t) => ({ ...t, anoMin: num(v) }))} />
              <CampoNum placeholder="Até" valor={temp.anoMax} onChange={(v) => setTemp((t) => ({ ...t, anoMax: num(v) }))} />
            </View>
          </ScrollView>

          <View style={styles.modalAcoes}>
            <TouchableOpacity
              style={styles.btnLimpar}
              onPress={() => setTemp({ ordenar: temp.ordenar })}
            >
              <Text style={styles.btnLimparTexto}>Limpar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnAplicar}
              onPress={() => {
                aplicar(temp);
                fechar();
              }}
            >
              <Text style={styles.btnAplicarTexto}>Aplicar filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={styles.grupoTitulo}>{titulo}</Text>
      <View style={styles.grupoChips}>{children}</View>
    </View>
  );
}

function Chip({ rotulo, ativo, onPress }: { rotulo: string; ativo: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.chip, ativo && styles.chipAtivoSel]}>
      <Text style={[styles.chipTexto, ativo && styles.chipTextoSel]}>{rotulo}</Text>
    </TouchableOpacity>
  );
}

function CampoNum({
  placeholder,
  valor,
  onChange,
}: {
  placeholder: string;
  valor?: number;
  onChange: (v: string) => void;
}) {
  return (
    <TextInput
      style={styles.campoNum}
      placeholder={placeholder}
      placeholderTextColor={Cores.textoSuave}
      keyboardType="number-pad"
      value={valor !== undefined ? String(valor) : ''}
      onChangeText={onChange}
    />
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: Cores.fundo },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  titulo: { color: Cores.texto, fontSize: 24, fontWeight: '800' },
  contador: { color: Cores.textoVariante, fontSize: 13, marginTop: 2 },
  btnFiltrar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Cores.primariaContainer,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnFiltrarTexto: { color: '#fff', fontWeight: '700', fontSize: 14 },
  buscaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    backgroundColor: Cores.superficieAlta,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buscaInput: { flex: 1, color: Cores.texto, fontSize: 15 },
  chipsLinha: { paddingHorizontal: 20, paddingVertical: 12 },
  chipAtivo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(220,20,60,0.15)',
    borderWidth: 1,
    borderColor: Cores.primariaContainer,
    borderRadius: 999,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
  },
  chipAtivoTexto: { color: Cores.primaria, fontSize: 12, fontWeight: '600' },
  limpar: { color: Cores.textoVariante, fontSize: 13, fontWeight: '700', paddingHorizontal: 6 },
  vazio: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  vazioTexto: { color: Cores.textoSuave, fontSize: 15, textAlign: 'center', paddingHorizontal: 40 },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Cores.superficieBaixa,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitulo: { color: Cores.texto, fontSize: 20, fontWeight: '800' },
  grupoTitulo: {
    color: Cores.textoVariante,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  grupoChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Cores.superficieAlta,
    borderWidth: 1,
    borderColor: Cores.superficieMaisAlta,
  },
  chipAtivoSel: { backgroundColor: Cores.primariaContainer, borderColor: Cores.primariaContainer },
  chipTexto: { color: Cores.textoVariante, fontSize: 13, fontWeight: '600' },
  chipTextoSel: { color: '#fff' },
  linhaNum: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  campoNum: {
    flex: 1,
    backgroundColor: Cores.superficieAlta,
    color: Cores.texto,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  modalAcoes: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btnLimpar: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: Cores.superficieAlta,
  },
  btnLimparTexto: { color: Cores.texto, fontWeight: '700' },
  btnAplicar: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: Cores.primariaContainer,
  },
  btnAplicarTexto: { color: '#fff', fontWeight: '800' },
});
