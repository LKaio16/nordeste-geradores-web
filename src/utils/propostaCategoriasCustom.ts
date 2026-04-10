import { CategoriaPropostaItem } from '@/types'

const STORAGE_KEY = 'nordeste-geradores.propostaCategoriasCustom'

const PRESET_SET = new Set<string>(Object.values(CategoriaPropostaItem))

export function isCategoriaPreset(categoria: string): boolean {
  return PRESET_SET.has(categoria.trim())
}

export function loadCategoriasCustomSalvas(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((x): x is string => typeof x === 'string')
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => !PRESET_SET.has(s))
      .filter((s, i, a) => a.findIndex((t) => t.toLowerCase() === s.toLowerCase()) === i)
  } catch {
    return []
  }
}

/** Grava categoria personalizada para sugerir na próxima proposta (máx. 50 entradas). */
export function rememberCategoriaCustom(nome: string) {
  const t = nome.trim()
  if (!t || t.length > 100) return
  if (PRESET_SET.has(t)) return
  const cur = loadCategoriasCustomSalvas()
  const next = [t, ...cur.filter((s) => s.toLowerCase() !== t.toLowerCase())].slice(0, 50)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}
