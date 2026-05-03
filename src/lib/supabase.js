import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygmqynpfzpyojwzuvmwa.supabase.co';
const supabaseAnonKey = 'sb_publishable_wClLbV-4pZLD5bbelrf1Mg_Ys9JjLGg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
