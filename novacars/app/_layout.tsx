import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Cores } from '../constants/cores';
import { ProvedorAuth, useAuth } from '../contexts/AuthContext';
import { inicializarBanco } from '../db/inicializar';

function GateAuth() {
  const { usuario, carregando } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (carregando) return;
    const emAuth = segments[0] === '(auth)';
    if (!usuario && !emAuth) {
      router.replace('/(auth)/login');
    } else if (usuario && emAuth) {
      router.replace('/(tabs)/explorar');
    }
  }, [usuario, carregando, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Cores.fundo },
        animation: 'slide_from_right',
      }}
    />
  );
}

export default function LayoutRaiz() {
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    inicializarBanco()
      .then(() => setPronto(true))
      .catch((e) => {
        console.error(e);
        setErro(String(e?.message ?? e));
      });
  }, []);

  if (erro) {
    return (
      <View style={tela.centro}>
        <Text style={{ color: Cores.erro, textAlign: 'center', padding: 24 }}>
          Erro ao iniciar o banco:{'\n'}
          {erro}
        </Text>
      </View>
    );
  }

  if (!pronto) {
    return (
      <View style={tela.centro}>
        <ActivityIndicator color={Cores.primariaContainer} size="large" />
        <Text style={tela.marca}>NOVACARS</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ProvedorAuth>
          <StatusBar style="light" />
          <GateAuth />
        </ProvedorAuth>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const tela = {
  centro: {
    flex: 1,
    backgroundColor: Cores.fundo,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 16,
  },
  marca: {
    color: Cores.primariaContainer,
    fontSize: 22,
    fontWeight: '800' as const,
    fontStyle: 'italic' as const,
    letterSpacing: 2,
  },
};
