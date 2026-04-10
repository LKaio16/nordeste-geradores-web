import { useEffect, useState } from 'react'
import { api } from '@/config/api'
import { Loader2, ImageOff } from 'lucide-react'

type Props = {
  /** Caminho retornado pela API, ex.: /api/files/os-fotos/... */
  path: string
  alt: string
  className?: string
}

/** Carrega a imagem com JWT (tag img com src absoluto não envia Authorization). */
export function OsFotoAutenticada({ path, alt, className }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    let objectUrl = ''

    const load = async () => {
      setFailed(false)
      setBlobUrl(null)
      try {
        const res = await api.get(path, {
          responseType: 'blob',
          timeout: 60000,
          headers: { Accept: 'image/*,*/*' },
        })
        if (cancelled) return
        objectUrl = URL.createObjectURL(res.data)
        setBlobUrl(objectUrl)
      } catch {
        if (!cancelled) setFailed(true)
      }
    }

    void load()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [path])

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 bg-slate-100 text-slate-500 ${className ?? ''}`}
      >
        <ImageOff className="h-8 w-8" />
        <span className="text-xs">Não foi possível carregar</span>
      </div>
    )
  }

  if (!blobUrl) {
    return (
      <div className={`flex items-center justify-center bg-slate-50 ${className ?? ''}`}>
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return <img src={blobUrl} alt={alt} className={className} />
}
