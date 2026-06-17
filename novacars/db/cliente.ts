import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

// Conexão única com o arquivo SQLite local do dispositivo.
export const sqlite = openDatabaseSync('novacars.db');

// Instância do Drizzle ORM usada em todas as consultas type-safe.
export const db = drizzle(sqlite, { schema });
