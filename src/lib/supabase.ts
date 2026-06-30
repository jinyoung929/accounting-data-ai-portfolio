import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Supabase 환경변수가 없습니다. .env.local 파일을 확인해 주세요.",
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
);
