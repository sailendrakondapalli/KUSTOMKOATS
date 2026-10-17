// Quick environment check script
// Run: node check-env.js

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('🔍 Checking Razorpay Environment Setup...\n');

// Check main .env
const mainEnvPath = join(__dirname, '.env');
const mainEnvExists = existsSync(mainEnvPath);

console.log('📄 Main .env file:', mainEnvExists ? '✅ Found' : '❌ Missing');

if (mainEnvExists) {
  const mainEnv = readFileSync(mainEnvPath, 'utf8');
  const hasSupabaseUrl = mainEnv.includes('VITE_SUPABASE_URL=');
  const hasAnonKey = mainEnv.includes('VITE_SUPABASE_ANON_KEY=');
  const hasRazorpayKey = mainEnv.includes('VITE_RAZORPAY_KEY_ID=');
  
  console.log('  - VITE_SUPABASE_URL:', hasSupabaseUrl ? '✅' : '❌');
  console.log('  - VITE_SUPABASE_ANON_KEY:', hasAnonKey ? '✅' : '❌');
  console.log('  - VITE_RAZORPAY_KEY_ID:', hasRazorpayKey ? '✅' : '❌');
  
  if (mainEnv.includes('RAZORPAY_KEY_SECRET')) {
    console.log('  ⚠️  WARNING: Found RAZORPAY_KEY_SECRET in main .env (should be in supabase/.env only!)');
  }
}

// Check supabase/.env
console.log('\n📄 Supabase .env file:');
const supabaseEnvPath = join(__dirname, 'supabase', '.env');
const supabaseEnvExists = existsSync(supabaseEnvPath);

if (supabaseEnvExists) {
  console.log('  ✅ Found');
  const supabaseEnv = readFileSync(supabaseEnvPath, 'utf8');
  const hasKeyId = supabaseEnv.includes('RAZORPAY_KEY_ID=');
  const hasKeySecret = supabaseEnv.includes('RAZORPAY_KEY_SECRET=');
  
  console.log('  - RAZORPAY_KEY_ID:', hasKeyId ? '✅' : '❌');
  console.log('  - RAZORPAY_KEY_SECRET:', hasKeySecret ? '✅' : '❌');
} else {
  console.log('  ⚠️  Not found');
  console.log('  → Create supabase/.env from supabase/.env.example');
  console.log('  → Add your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
}

// Check .gitignore
console.log('\n📄 Git safety:');
const gitignorePath = join(__dirname, '.gitignore');
if (existsSync(gitignorePath)) {
  const gitignore = readFileSync(gitignorePath, 'utf8');
  console.log('  - Main .env gitignored:', gitignore.includes('.env') ? '✅' : '⚠️  Check .gitignore');
}

const supabaseGitignorePath = join(__dirname, 'supabase', '.gitignore');
if (existsSync(supabaseGitignorePath)) {
  const supabaseGitignore = readFileSync(supabaseGitignorePath, 'utf8');
  console.log('  - Supabase .env gitignored:', supabaseGitignore.includes('.env') ? '✅' : '⚠️  Check supabase/.gitignore');
}

console.log('\n✨ Setup guide: See RAZORPAY-SETUP.md for detailed instructions\n');
