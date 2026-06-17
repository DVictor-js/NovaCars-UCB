import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Cores } from '../constants/cores';
import { Veiculo } from '../db/schema';
import { formatarKm, formatarReal } from '../lib/formato';

interface Props {
  veiculo: Veiculo;
  favoritado?: boolean;
  onToggleFavorito?: (id: number) => void;
}

const ICONE_COMBUSTIVEL: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  Elétrico: 'electric-car',
  Híbrido: 'eco',
};

export default function CartaoVeiculo({
  veiculo,
  favoritado,
  onToggleFavorito,
}: Props) {
  const router = useRouter();
  const iconeComb = ICONE_COMBUSTIVEL[veiculo.combustivel] ?? 'local-gas-station';

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/veiculo/${veiculo.id}`)}
    >
      <View style={styles.imagemWrap}>
        <Image
          source={{ uri: veiculo.imagemUrl ?? undefined }}
          style={styles.imagem}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.overlay} />

        {veiculo.destaque === 1 && (
          <View style={styles.badge}>
            <Text style={styles.badgeTexto}>Destaque</Text>
          </View>
        )}
        {veiculo.status === 'vendido' && (
          <View style={[styles.badge, styles.badgeVendido]}>
            <MaterialIcons name="check-circle" size={12} color={Cores.fundo} />
            <Text style={[styles.badgeTexto, { color: Cores.fundo }]}>
              Vendido
            </Text>
          </View>
        )}

        {onToggleFavorito && (
          <TouchableOpacity
            style={styles.coracao}
            onPress={() => onToggleFavorito(veiculo.id)}
            hitSlop={8}
          >
            <MaterialIcons
              name={favoritado ? 'favorite' : 'favorite-border'}
              size={20}
              color={favoritado ? Cores.primariaContainer : '#fff'}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.corpo}>
        <View style={styles.linhaTopo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.modelo} numberOfLines={1}>
              {veiculo.modelo}
            </Text>
            <Text style={styles.marca}>{veiculo.marca}</Text>
          </View>
          <Text style={styles.preco}>{formatarReal(veiculo.preco)}</Text>
        </View>

        <View style={styles.specs}>
          <Espec icone="calendar-month" texto={String(veiculo.ano)} />
          <Espec icone="speed" texto={formatarKm(veiculo.quilometragem)} />
          <Espec icone={iconeComb} texto={veiculo.combustivel} />
          <Espec icone="settings" texto={veiculo.cambio} />
        </View>
      </View>
    </Pressable>
  );
}

function Espec({
  icone,
  texto,
}: {
  icone: keyof typeof MaterialIcons.glyphMap;
  texto: string;
}) {
  return (
    <View style={styles.espec}>
      <MaterialIcons name={icone} size={14} color={Cores.textoVariante} />
      <Text style={styles.especTexto} numberOfLines={1}>
        {texto}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Cores.superficieContainer,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Cores.superficieAlta,
    marginBottom: 16,
  },
  imagemWrap: { height: 170, position: 'relative' },
  imagem: { width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(19,19,19,0.15)',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Cores.primariaContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeVendido: { backgroundColor: Cores.terciaria },
  badgeTexto: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coracao: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corpo: { padding: 14 },
  linhaTopo: { flexDirection: 'row', alignItems: 'flex-start' },
  modelo: { color: Cores.texto, fontSize: 17, fontWeight: '700' },
  marca: { color: Cores.textoVariante, fontSize: 13, marginTop: 2 },
  preco: {
    color: Cores.primaria,
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },
  specs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Cores.superficieAlta,
    paddingTop: 12,
  },
  espec: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  especTexto: { color: Cores.textoVariante, fontSize: 12 },
});
