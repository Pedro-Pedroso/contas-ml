// Componente raiz — controla sessão: Login ou Dashboard

import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import './styles/globals.css'
import { Dashboard } from './components/Dashboard'
import { Login } from './components/Login'
import { supabase } from './lib/supabase'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [verificando, setVerificando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setVerificando(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, novaSessao) => {
      setSession(novaSessao)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  if (verificando) return null
  if (!session) return <Login />
  return <Dashboard />
}
