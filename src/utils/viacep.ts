export interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export async function buscarCep(cep: string): Promise<ViaCepResponse | null> {
  const digits = cep.replace(/\D/g, '')
  if (digits.length !== 8) return null

  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
  if (!res.ok) return null
  const data = (await res.json()) as ViaCepResponse
  if (data.erro) return null
  return data
}

export function formatarCep(digits: string): string {
  const d = digits.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

export function montarEnderecoOsParaMaps(os: {
  enderecoLogradouro?: string
  enderecoNumero?: string
  enderecoBairro?: string
  enderecoCidade?: string
  enderecoEstado?: string
}): string | null {
  const parts: string[] = []
  const rua = [os.enderecoLogradouro, os.enderecoNumero].filter(Boolean).join(' ')
  if (rua) parts.push(rua)
  if (os.enderecoBairro) parts.push(os.enderecoBairro)
  const loc = [os.enderecoCidade, os.enderecoEstado].filter(Boolean).join(' ')
  if (loc) parts.push(loc)
  if (parts.length === 0) return null
  return `${parts.join(', ')}, Brasil`
}

export function mapsSearchUrl(endereco: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`
}

export function enderecoOsLinha(os: {
  enderecoLogradouro?: string
  enderecoNumero?: string
  enderecoComplemento?: string
  enderecoBairro?: string
  enderecoCidade?: string
  enderecoEstado?: string
  enderecoCep?: string
}): string {
  const parts: string[] = []
  const rua = [os.enderecoLogradouro, os.enderecoNumero].filter(Boolean).join(', ')
  if (rua) parts.push(rua)
  if (os.enderecoComplemento) parts.push(os.enderecoComplemento)
  if (os.enderecoBairro) parts.push(os.enderecoBairro)
  const loc = [os.enderecoCidade, os.enderecoEstado].filter(Boolean).join('/')
  if (loc) parts.push(loc)
  if (os.enderecoCep) parts.push(`CEP ${formatarCep(os.enderecoCep)}`)
  return parts.length > 0 ? parts.join(' · ') : '—'
}
