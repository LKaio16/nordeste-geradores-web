/**
 * Valida se um email está em formato correto
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Normaliza email para minúsculas e remove espaços
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Aplica máscara de CNPJ (00.000.000/0000-00)
 */
export function maskCNPJ(value: string): string {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length === 0) return ''
  
  // Limita a 14 dígitos
  const limited = cleaned.slice(0, 14)
  
  if (limited.length <= 2) {
    return limited
  } else if (limited.length <= 5) {
    return `${limited.slice(0, 2)}.${limited.slice(2)}`
  } else if (limited.length <= 8) {
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`
  } else if (limited.length <= 12) {
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8)}`
  } else {
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8, 12)}-${limited.slice(12)}`
  }
}

/**
 * Aplica máscara de CPF (000.000.000-00)
 */
export function maskCPF(value: string): string {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length === 0) return ''
  
  // Limita a 11 dígitos
  const limited = cleaned.slice(0, 11)
  
  if (limited.length <= 3) {
    return limited
  } else if (limited.length <= 6) {
    return `${limited.slice(0, 3)}.${limited.slice(3)}`
  } else if (limited.length <= 9) {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`
  } else {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`
  }
}

/**
 * Aplica máscara de CPF/CNPJ (detecta automaticamente)
 */
export function maskCPFCNPJ(value: string): string {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length === 0) return ''
  
  // Se tem 11 ou menos dígitos, considera CPF
  // Se tem mais de 11, considera CNPJ
  if (cleaned.length <= 11) {
    return maskCPF(value)
  } else {
    return maskCNPJ(value)
  }
}

/**
 * Remove máscara de CPF/CNPJ
 */
export function unmaskCPFCNPJ(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Valida CPF
 */
export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleaned)) return false

  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i)
  }
  let digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(cleaned.charAt(9))) return false

  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i)
  }
  digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(cleaned.charAt(10))) return false

  return true
}

/**
 * Valida CNPJ - valida apenas formato (14 dígitos e não todos iguais)
 * Para validação rigorosa de dígitos verificadores, considere usar uma biblioteca externa
 */
export function isValidCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '')
  if (cleaned.length !== 14) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleaned)) return false

  // Validação básica de formato passou
  // Nota: Validação rigorosa de dígitos verificadores pode ser implementada futuramente
  // Por enquanto, aceita qualquer CNPJ com 14 dígitos e formato válido
  return true
}

/**
 * Valida CPF ou CNPJ
 */
export function isValidCPForCNPJ(value: string): boolean {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return isValidCPF(value)
  } else if (cleaned.length === 14) {
    return isValidCNPJ(value)
  }
  return false
}

/**
 * Aplica máscara de telefone (00) 00000-0000 ou (00) 0000-0000
 */
export function maskPhone(value: string): string {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length === 0) return ''
  
  // Limita a 11 dígitos (celular) ou 10 (fixo)
  const limited = cleaned.slice(0, 11)
  
  if (limited.length <= 2) {
    return limited.length === 2 ? `(${limited})` : limited
  } else if (limited.length <= 6) {
    // Telefone fixo: (00) 0000-0000
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`
  } else if (limited.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`
  } else {
    // Celular: (00) 00000-0000
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`
  }
}

/**
 * Remove máscara de telefone
 */
export function unmaskPhone(value: string): string {
  return value.replace(/\D/g, '')
}

