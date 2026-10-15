import { config } from 'dotenv';

// Charge les variables d'environnement
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local`});

// Exporte les variables d'environnement
export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_uo8Vz5xTZfmC@ep-bold-shape-ag7466xs-pooler.c-2.eu-central-1.aws.neon.tech/queen-style-db?sslmode=require&channel_binding=require';
export const JWT_SECRET = process.env.JWT_SECRET || '5019c8de968b44b5cd84749dd972c1b8cd5913704f597e0070569db10a4e5ad904340d36997f15ee9edabf8f9489a1e76da3c3868fa71df949bfca677a22dfa0 ';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
export const SESSION_SECRET = process.env.SESSION_SECRET || 'your-default-session-secret-change-in-production';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
export const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
