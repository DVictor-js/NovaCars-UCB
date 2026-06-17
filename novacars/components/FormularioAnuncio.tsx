import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Cores } from '../constants/cores';
import { NovoVeiculo, Veiculo } from '../db/schema';

const CATEGORIAS = ['SUV', 'Sedã', 'Esportivo', 'Elétrico', 'Hatch', 'Picape'];
const COMBUSTIVEIS = ['Flex', 'Gasolina', 'Diesel', 'Elétrico', 'Híbrido'];
const CAMBIOS = ['Automático', 'Manual'];

interface Props {
  inicial?: Veiculo;
  textoBotao: string;
  onSalvar: (dados: Omit<NovoVeiculo, 'usuarioId'>) => Promise<void>;
}

export default function FormularioAnuncio({
  inicial,
  textoBotao,
  onSalvar,
}: Props) {
  const [marca, setMarca] = useState(inicial?.marca ?? '');
  const [modelo, setModelo] = useState(inicial?.modelo ?? '');
  const [ano, setAno] = useState(inicial ? String(inicial.ano) : '');
  const [preco, setPreco] = useState(inicial ? String(inicial.preco) : '');
  const [km, setKm] = useState(
    inicial ? String(inicial.quilometragem) : ''
  );
  const [categoria, setCategoria] = useState(inicial?.categoria ?? 'Sedã');
  const [combustivel, setCombustivel] = useState(
    inicial?.combustivel ?? 'Flex'
  );
  const [cambio, setCambio] = useState(inicial?.cambio ?? 'Automático');
  const [cor, setCor] = useState(inicial?.cor ?? '');
  const [cidade, setCidade] = useState(inicial?.cidade ?? '');
  const [estado, setEstado] = useState(inicial?.estado ?? '');
  const [motor, setMotor] = useState(inicial?.motor ?? '');
  const [potencia, setPotencia] = useState(inicial?.potencia ?? '');
  const [descricao, setDescricao] = useState(inicial?.descricao ?? '');
  const [imagemUrl, setImagemUrl] = useState(inicial?.imagemUrl ?? '');
  const [salvando, setSalvando] = useState(false);

  async function escolherImagem() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permissão necessária', 'Libere o acesso às fotos para continuar.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.7,
    });
    if (!res.canceled) setImagemUrl(res.assets[0].uri);
  }

  async function salvar() {
    if (!marca.trim() || !modelo.trim()) {
      Alert.alert('Campos obrigatórios', 'Informe marca e modelo.');
      return;
    }
    const anoNum = parseInt(ano, 10);
    const precoNum = parseFloat(preco.replace(/\./g, '').replace(',', '.'));
    const kmNum = parseInt(km.replace(/\D/g, ''), 10) || 0;

    if (!anoNum || anoNum < 1950 || anoNum > 2100) {
      Alert.alert('Ano inválido', 'Informe um ano válido (ex.: 2023).');
      return;
    }
    if (!precoNum || precoNum <= 0) {
      Alert.alert('Preço inválido', 'Informe um preço válido.');
      return;
    }

    setSalvando(true);
    try {
      await onSalvar({
        marca: marca.trim(),
        modelo: modelo.trim(),
        ano: anoNum,
        preco: precoNum,
        quilometragem: kmNum,
        categoria,
        combustivel,
        cambio,
        cor: cor.trim() || null,
        cidade: cidade.trim() || null,
        estado: estado.trim() || null,
        motor: motor.trim() || null,
        potencia: potencia.trim() || null,
        descricao: descricao.trim() || null,
        imagemUrl: imagemUrl || null,
      });
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity style={styles.uploadArea} onPress={escolherImagem}>
        {imagemUrl ? (
          <Image source={{ uri: imagemUrl }} style={styles.preview} contentFit="cover" />
        ) : (
          <>
            <MaterialIcons name="add-a-photo" size={32} color={Cores.textoVariante} />
            <Text style={styles.uploadTexto}>Adicionar foto do veículo</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.linha}>
        <Campo
          rotulo="Marca"
          valor={marca}
          onChange={setMarca}
          placeholder="Porsche"
          estilo={{ flex: 1 }}
        />
        <Campo
          rotulo="Modelo"
          valor={modelo}
          onChange={setModelo}
          placeholder="911 GT3"
          estilo={{ flex: 1 }}
        />
      </View>

      <View style={styles.linha}>
        <Campo
          rotulo="Ano"
          valor={ano}
          onChange={setAno}
          placeholder="2023"
          teclado="number-pad"
          estilo={{ flex: 1 }}
        />
        <Campo
          rotulo="Quilometragem"
          valor={km}
          onChange={setKm}
          placeholder="3200"
          teclado="number-pad"
          estilo={{ flex: 1 }}
        />
      </View>

      <Campo
        rotulo="Preço (R$)"
        valor={preco}
        onChange={setPreco}
        placeholder="1485000"
        teclado="number-pad"
      />

      <Seletor rotulo="Categoria" opcoes={CATEGORIAS} valor={categoria} onChange={setCategoria} />
      <Seletor rotulo="Combustível" opcoes={COMBUSTIVEIS} valor={combustivel} onChange={setCombustivel} />
      <Seletor rotulo="Câmbio" opcoes={CAMBIOS} valor={cambio} onChange={setCambio} />

      <View style={styles.linha}>
        <Campo rotulo="Cor" valor={cor} onChange={setCor} placeholder="Prata" estilo={{ flex: 1 }} />
        <Campo rotulo="Potência" valor={potencia} onChange={setPotencia} placeholder="525 cv" estilo={{ flex: 1 }} />
      </View>

      <Campo rotulo="Motor" valor={motor} onChange={setMotor} placeholder="4.0L Flat-6" />

      <View style={styles.linha}>
        <Campo rotulo="Cidade" valor={cidade} onChange={setCidade} placeholder="Brasília" estilo={{ flex: 2 }} />
        <Campo rotulo="UF" valor={estado} onChange={setEstado} placeholder="DF" estilo={{ flex: 1 }} />
      </View>

      <Campo
        rotulo="Descrição"
        valor={descricao}
        onChange={setDescricao}
        placeholder="Detalhes, estado de conservação, opcionais..."
        multilinha
      />

      <TouchableOpacity
        style={[styles.botao, salvando && { opacity: 0.6 }]}
        onPress={salvar}
        disabled={salvando}
      >
        {salvando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botaoTexto}>{textoBotao}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

function Campo({
  rotulo,
  valor,
  onChange,
  placeholder,
  teclado,
  multilinha,
  estilo,
}: {
  rotulo: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
  teclado?: 'default' | 'number-pad' | 'email-address';
  multilinha?: boolean;
  estilo?: object;
}) {
  return (
    <View style={[{ gap: 6 }, estilo]}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput
        style={[styles.input, multilinha && styles.inputMulti]}
        value={valor}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Cores.textoSuave}
        keyboardType={teclado ?? 'default'}
        multiline={multilinha}
      />
    </View>
  );
}

function Seletor({
  rotulo,
  opcoes,
  valor,
  onChange,
}: {
  rotulo: string;
  opcoes: string[];
  valor: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {opcoes.map((op) => {
            const ativo = op === valor;
            return (
              <TouchableOpacity
                key={op}
                onPress={() => onChange(op)}
                style={[styles.chip, ativo && styles.chipAtivo]}
              >
                <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>
                  {op}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: 20, gap: 16, paddingBottom: 60 },
  uploadArea: {
    height: 180,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Cores.contornoVariante,
    borderStyle: 'dashed',
    backgroundColor: Cores.superficieContainer,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%' },
  uploadTexto: { color: Cores.textoVariante, fontSize: 14 },
  linha: { flexDirection: 'row', gap: 12 },
  rotulo: {
    color: Cores.textoVariante,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Cores.superficieAlta,
    color: Cores.texto,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  inputMulti: { height: 110, textAlignVertical: 'top' },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: Cores.superficieAlta,
    borderWidth: 1,
    borderColor: Cores.superficieMaisAlta,
  },
  chipAtivo: {
    backgroundColor: Cores.primariaContainer,
    borderColor: Cores.primariaContainer,
  },
  chipTexto: { color: Cores.textoVariante, fontSize: 13, fontWeight: '600' },
  chipTextoAtivo: { color: '#fff' },
  botao: {
    backgroundColor: Cores.primariaContainer,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Cores.primariaContainer,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
