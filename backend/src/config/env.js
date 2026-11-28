/**
 * Centralised environment configuration.
 * Import this instead of reading process.env directly throughout the codebase.
 * Fails fast at startup if required variables are missing.
 */
import dotenv from 'dotenv';
dotenv.config();

function require(key) {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env variable: ${key}`);
  return val;
}

function optional(key, fallback = '') {
  return process.env[key] || fallback;
}

export const env = {
  // ── Supabase ─────────────────────────────────────
  supabaseUrl:            require('SUPABASE_URL'),
  supabaseServiceRoleKey: require('SUPABASE_SERVICE_ROLE_KEY'),

  // ── Server ───────────────────────────────────────
  port:        parseInt(optional('PORT', '3001')),
  nodeEnv:     optional('NODE_ENV', 'development'),
  frontendUrl: optional('FRONTEND_URL', 'http://localhost:5173'),

  // ── SMTP / Hostinger Email ────────────────────────
  smtpHost:      optional('SMTP_HOST', 'smtp.hostinger.com'),
  smtpPort:      parseInt(optional('SMTP_PORT', '465')),
  smtpUser:      optional('SMTP_USER'),
  smtpPass:      optional('SMTP_PASS'),
  receiverEmail: optional('RECEIVER_EMAIL'),

  // ── Shiprocket ───────────────────────────────────
  shiprocketEmail:    optional('SHIPROCKET_EMAIL'),
  shiprocketPassword: optional('SHIPROCKET_PASSWORD'),

  // ── Helpers ──────────────────────────────────────
  isProd: optional('NODE_ENV') === 'production',
  isDev:  optional('NODE_ENV') !== 'production',
};
