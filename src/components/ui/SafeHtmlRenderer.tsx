import { sanitizeHtml } from '@/lib/sanitize'
import { cn } from '@/lib/utils'

interface SafeHtmlRendererProps {
  html: string
  className?: string
}

/**
 * HTML 문자열을 안전하게 렌더링하는 컴포넌트
 * DOMPurify로 sanitize한 후 렌더링하여 XSS 방지
 */
export function SafeHtmlRenderer({ html, className }: SafeHtmlRendererProps) {
  const sanitizedHtml = sanitizeHtml(html)

  return (
    <div
      className={cn('safe-html-content', className)}
      // DOMPurify로 sanitize된 안전한 HTML만 렌더링
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}
