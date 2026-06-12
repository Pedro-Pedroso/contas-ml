import { createClient } from '@supabase/supabase-js'

// Chave publicável — projetada para ficar no código do site.
// A proteção dos dados vem do RLS: só usuário autenticado lê/grava.
const SUPABASE_URL = 'https://cajibundgwpsfvsnecgk.supabase.co'
const SUPABASE_KEY = 'sb_publishable_9cGH0yh9ptaCfXbTmulSTA_ozMJ5SFm'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
