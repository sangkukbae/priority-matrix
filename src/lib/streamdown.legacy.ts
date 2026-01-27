const CODE_BLOCK_PATTERN = /```(\w+)?\n([\s\S]*?)```/g
const INLINE_CODE_PATTERN = /`([^`]+)`/g
const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g
const URL_PATTERN = /(^|[\s(])((https?:\/\/)[^\s)]+)(?=$|[\s)])/g

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, '\n')
}

function renderLineBlocks(lines: string[]): string {
  const output: string[] = []
  let inUl = false
  let inOl = false

  const closeLists = () => {
    if (inUl) {
      output.push('</ul>')
      inUl = false
    }
    if (inOl) {
      output.push('</ol>')
      inOl = false
    }
  }

  lines.forEach((rawLine) => {
    const line = rawLine.trimEnd()
    if (!line.trim()) {
      closeLists()
      return
    }

    const unorderedMatch = line.match(/^[-*]\s+(.+)/)
    if (unorderedMatch) {
      if (inOl) {
        output.push('</ol>')
        inOl = false
      }
      if (!inUl) {
        output.push('<ul>')
        inUl = true
      }
      output.push(`<li>${unorderedMatch[1]}</li>`)
      return
    }

    const orderedMatch = line.match(/^\d+\.\s+(.+)/)
    if (orderedMatch) {
      if (inUl) {
        output.push('</ul>')
        inUl = false
      }
      if (!inOl) {
        output.push('<ol>')
        inOl = true
      }
      output.push(`<li>${orderedMatch[1]}</li>`)
      return
    }

    const headerMatch = line.match(/^(#{1,6})\s+(.+)/)
    if (headerMatch) {
      closeLists()
      const level = headerMatch[1].length
      output.push(`<h${level}>${headerMatch[2]}</h${level}>`)
      return
    }

    const quoteMatch = line.match(/^>\s+(.+)/)
    if (quoteMatch) {
      closeLists()
      output.push(`<blockquote>${quoteMatch[1]}</blockquote>`)
      return
    }

    closeLists()
    output.push(`<p>${line}</p>`)
  })

  closeLists()
  return output.join('\n')
}

export function renderStreamdownToHtml(markdown: string): string {
  if (!markdown) return ''

  const normalized = normalizeNewlines(markdown)
  const codeBlocks: string[] = []
  let working = normalized.replace(CODE_BLOCK_PATTERN, (_match, lang, code) => {
    const trimmed = code.replace(/\n$/, '')
    const escaped = escapeHtml(trimmed)
    const languageClass = lang ? ` class="language-${lang}"` : ''
    const index = codeBlocks.push(`<pre><code${languageClass}>${escaped}</code></pre>`) - 1
    return `@@CODE_BLOCK_${index}@@`
  })

  const inlineCodes: string[] = []
  working = working.replace(INLINE_CODE_PATTERN, (_match, code) => {
    const escaped = escapeHtml(code)
    const index = inlineCodes.push(`<code>${escaped}</code>`) - 1
    return `@@INLINE_CODE_${index}@@`
  })

  working = escapeHtml(working)

  working = working
    .replace(LINK_PATTERN, '<a href="$2">$1</a>')
    .replace(URL_PATTERN, '$1<a href="$2">$2</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')

  const lines = working.split('\n')
  let html = renderLineBlocks(lines)

  inlineCodes.forEach((value, index) => {
    html = html.replace(`@@INLINE_CODE_${index}@@`, value)
  })

  codeBlocks.forEach((value, index) => {
    html = html.replace(`@@CODE_BLOCK_${index}@@`, value)
  })

  return html
}
