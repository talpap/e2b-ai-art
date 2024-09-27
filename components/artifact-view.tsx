'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Terminal } from 'lucide-react'

import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui/alert'
import { ExecutionResult } from '@/app/api/sandbox/route'
import { TemplateId } from '@/lib/templates'

function LogsOutput({ stdout, stderr }: {
  stdout: string[]
  stderr: string[]
}) {
  if (stdout.length === 0 && stderr.length === 0) return null

  return (
    <div className="w-full h-32 max-h-32 overflow-y-auto flex flex-col items-start justify-start space-y-1 p-4 border-t">
      {stdout && stdout.length > 0 && stdout.map((out: string, index: number) => (
        <pre key={index} className="text-xs">
          {out}
        </pre>
      ))}
      {stderr && stderr.length > 0 && stderr.map((err: string, index: number) => (
        <pre key={index} className="text-xs text-red-500">
          {err}
        </pre>
      ))}
    </div>
  )
}

export function ArtifactView({
  iframeKey,
  result,
  template,
}: {
  iframeKey: number
  result: ExecutionResult
  template?: TemplateId
}) {
  if (!result) return null

  if (template !== 'code-interpreter-multilang') {
    return (
      <div className="w-full h-full">
        <iframe
          key={iframeKey}
          className="h-full w-full"
          sandbox="allow-forms allow-scripts allow-same-origin"
          loading="lazy"
          src={result.url}
        />
      </div>
    )
  }

  const { cellResults, stdout, stderr, runtimeError } = result

  // The AI-generated code experienced runtime error
  if (runtimeError) {
    const { name, value, tracebackRaw } = runtimeError
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4"/>
          <AlertTitle>{name}: {value}</AlertTitle>
          <AlertDescription className="font-mono whitespace-pre-wrap">
            {tracebackRaw}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Cell results can contain text, pdfs, images, and code (html, latex, json)
  // TODO: Show all results
  // TODO: Check other formats than `png`
  if (cellResults.length > 0) {
    const imgInBase64 = cellResults[0].png
    return (
      <>
        <div className="w-full flex-1 p-4 flex items-start justify-center">
          <Image
            src={`data:image/png;base64,${imgInBase64}`}
            alt="result"
            width={600}
            height={400}
          />
        </div>
        <LogsOutput stdout={stdout} stderr={stderr} />
      </>
    )
  }

  // No cell results, but there is stdout or stderr
  if (stdout.length > 0 || stderr.length > 0) {
    return (
      <LogsOutput stdout={stdout} stderr={stderr} />
    )
  }

  return (
    <span>No output or logs</span>
  )
}
