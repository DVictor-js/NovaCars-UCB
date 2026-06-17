import { Redirect } from 'expo-router';

// A rota inicial apenas encaminha para a área logada; o GateAuth no layout
// raiz redireciona para o login caso não haja sessão ativa.
export default function Inicio() {
  return <Redirect href="/(tabs)/explorar" />;
}
