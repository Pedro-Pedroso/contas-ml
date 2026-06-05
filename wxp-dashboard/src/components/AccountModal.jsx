import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { ASSESSORES, TIPOS, generateId } from '../utils/data'

const inputStyle = {
  width: '100%',
  background: 'var(--bg-input)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  padding: '10px 12px',
  color: 'var(--text-primary)',
  fontSize: 13,
  fontFamily: 'var(--font-body)',
  outline: 'none',
  transition: 'border-color 0.15s',
}

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-display)',
  marginBottom: 6,
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

const EMPTY = {
  cliente: '',
  assessor: ASSESSORES[0],
  tipo: TIPOS[0],
  estrela: false,
  inicio: '',
  termino: '',
  meta: '',
  real: '',
  risco: false,
  status: 'Ativo',
}

export default function AccountModal({ account, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (account) {
      setForm({ ...account, meta: account.meta || '', real: account.real || '' })
    } else {
      setForm(EMPTY)
    }
  }, [account])

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const validate = () => {
    const e = {}
    if (!form.cliente.trim()) e.cliente = 'Obrigatório'
    if (!form.inicio) e.inicio = 'Obrigatório'
    if (!form.termino) e.termino = 'Obrigatório'
    if (!form.meta || isNaN(Number(form.meta))) e.meta = 'Valor inválido'
    if (form.real !== '' && isNaN(Number(form.real))) e.real = 'Valor inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSave({
      ...form,
      id: account?.id || generateId(),
      meta: Number(form.meta),
      real: Number(form.real) || 0,
    })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease',
      padding: 24,
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: 560,
        maxHeight: '90vh',
        overflowY: 'auto',
        animation: 'fadeUp 0.25s ease',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '24px 28px 0',
          marginBottom: 24,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 18,
            color: 'var(--text-primary)',
          }}>
            {account ? 'Editar Conta' : 'Nova Conta'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex', padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '0 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          <Field label="Nome do Cliente">
            <input
              style={{ ...inputStyle, borderColor: errors.cliente ? 'var(--red)' : 'var(--border)' }}
              value={form.cliente}
              onChange={e => set('cliente', e.target.value)}
              placeholder="Ex: Kenno Esportes"
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = errors.cliente ? 'var(--red)' : 'var(--border)'}
            />
            {errors.cliente && <span style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.cliente}</span>}
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Assessor">
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.assessor}
                onChange={e => set('assessor', e.target.value)}
              >
                {ASSESSORES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Tipo">
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.tipo}
                onChange={e => set('tipo', e.target.value)}
              >
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Data de Início">
              <input
                type="date"
                style={{ ...inputStyle, borderColor: errors.inicio ? 'var(--red)' : 'var(--border)' }}
                value={form.inicio}
                onChange={e => set('inicio', e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = errors.inicio ? 'var(--red)' : 'var(--border)'}
              />
              {errors.inicio && <span style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.inicio}</span>}
            </Field>
            <Field label="Data de Término">
              <input
                type="date"
                style={{ ...inputStyle, borderColor: errors.termino ? 'var(--red)' : 'var(--border)' }}
                value={form.termino}
                onChange={e => set('termino', e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = errors.termino ? 'var(--red)' : 'var(--border)'}
              />
              {errors.termino && <span style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.termino}</span>}
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Meta de Faturamento (R$)">
              <input
                type="number"
                style={{ ...inputStyle, borderColor: errors.meta ? 'var(--red)' : 'var(--border)' }}
                value={form.meta}
                onChange={e => set('meta', e.target.value)}
                placeholder="50000"
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = errors.meta ? 'var(--red)' : 'var(--border)'}
              />
              {errors.meta && <span style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.meta}</span>}
            </Field>
            <Field label="Faturamento Real (R$)">
              <input
                type="number"
                style={{ ...inputStyle }}
                value={form.real}
                onChange={e => set('real', e.target.value)}
                placeholder="0"
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </Field>
          </div>

          <Field label="Status">
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.status}
              onChange={e => set('status', e.target.value)}
            >
              <option value="Ativo">Ativo</option>
              <option value="Pausado">Pausado</option>
              <option value="Concluído">Concluído</option>
            </select>
          </Field>

          {/* Toggles */}
          <div style={{ display: 'flex', gap: 24, paddingTop: 4 }}>
            {[
              { key: 'estrela', label: '⭐ Cliente Estrela' },
              { key: 'risco', label: '⚠️ Em Risco' },
            ].map(({ key, label }) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <div
                  onClick={() => set(key, !form[key])}
                  style={{
                    width: 36, height: 20,
                    borderRadius: 10,
                    background: form[key] ? 'var(--accent)' : 'var(--border)',
                    position: 'relative',
                    transition: 'background 0.2s',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 2, left: form[key] ? 18 : 2,
                    width: 16, height: 16,
                    borderRadius: '50%',
                    background: 'white',
                    transition: 'left 0.2s',
                  }} />
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
              </label>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '11px',
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 13,
                transition: 'all 0.15s',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              style={{
                flex: 2,
                padding: '11px',
                background: 'var(--accent)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: 'white',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 13,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {account ? 'Salvar Alterações' : 'Adicionar Conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
