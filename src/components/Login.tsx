import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setErro('')
    setEnviando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setEnviando(false)
    if (error) {
      setErro('E-mail ou senha incorretos.')
    }
    // Sucesso: o App troca para o Dashboard via onAuthStateChange
  }

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <span className="brand-mark">C</span>
          <div>
            <span className="brand-name">Contas</span>
            <span className="brand-sub">Gestão de carteira</span>
          </div>
        </div>

        <label className="field">
          <span>E-mail</span>
          <input
            type="email"
            className="control"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com"
          />
        </label>

        <label className="field">
          <span>Senha</span>
          <input
            type="password"
            className="control"
            required
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        {erro && <p className="login-erro" role="alert">{erro}</p>}

        <button type="submit" className="button button-primary login-btn" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>

        <p className="login-hint">Acesso restrito. A sessão fica salva neste dispositivo.</p>
      </form>
    </div>
  )
}
