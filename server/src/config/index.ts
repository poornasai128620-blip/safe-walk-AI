import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root .env or server .env
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
  webAppUrl: process.env.WEB_APP_URL || 'http://localhost:5173',
  jwtSecret: process.env.SUPABASE_JWT_SECRET || 'safewalk-ai-super-secret-jwt-key-2026',
  
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },
  
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    transcriptionModel: process.env.OPENAI_TRANSCRIPTION_MODEL || 'whisper-1',
    analysisModel: process.env.OPENAI_ANALYSIS_MODEL || 'gpt-4o-mini'
  },
  
  evidence: {
    storageBucket: process.env.EVIDENCE_STORAGE_BUCKET || 'emergency-evidence',
    maxFileSizeMb: parseInt(process.env.MAX_EVIDENCE_FILE_SIZE_MB || '50', 10),
    retentionDays: parseInt(process.env.EVIDENCE_RETENTION_DAYS || '30', 10)
  },
  
  integrationMode: {
    emergency: process.env.EMERGENCY_INTEGRATION_MODE || 'mock',
    cctv: process.env.CCTV_INTEGRATION_MODE || 'mock',
    sms: process.env.SMS_PROVIDER || 'mock',
    email: process.env.EMAIL_PROVIDER || 'mock'
  }
};
