import { Stack } from 'expo-router';
import { Cores } from '../../constants/cores';

export default function LayoutAuth() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Cores.fundo },
      }}
    />
  );
}
