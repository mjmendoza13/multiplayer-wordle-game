'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function InviteCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    const url = `${window.location.origin}/game/${code}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', url)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-dashed bg-card p-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Waiting for opponent</span>
        <p className="text-sm text-muted-foreground">
          Share this code or link. You can start guessing now.
        </p>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-2xl font-bold tracking-[0.25em]">{code}</span>
        <Button variant="outline" size="sm" onClick={copyLink}>
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy link'}
        </Button>
      </div>
    </div>
  )
}
