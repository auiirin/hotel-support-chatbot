import 'dotenv/config';

export const config = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  adminSecret: process.env.ADMIN_SECRET || 'admin123',
  port: process.env.PORT || 3001,
};
