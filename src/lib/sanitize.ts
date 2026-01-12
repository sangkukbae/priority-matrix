import DOMPurify from 'dompurify'

// TipTap 에디터 출력에 맞는 허용 태그
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 's', 'strike', 'del',
  'code', 'ul', 'ol', 'li', 'a', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'pre', 'hr'
]

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class', 'style']

// 허용할 스타일 속성 (폰트 관련만)
const ALLOWED_STYLES = ['font-family', 'font-size']

/**
 * HTML 엔티티를 디코딩 (예: &lt; -> <)
 */
function decodeHtmlEntities(html: string): string {
  const txt = document.createElement('textarea')
  txt.innerHTML = html
  return txt.value
}

/**
 * HTML 문자열을 안전하게 sanitize
 * XSS 공격을 방지하면서 TipTap 포매팅 유지
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''
  
  // 데이터가 이중 이스케이프된 경우(예: &lt;p&gt;)를 대비해 디코딩 시도
  // <p 가 없고 &lt;p 가 있는 경우 디코딩 수행
  let processedHtml = html
  if (html.includes('&lt;') && !html.includes('<')) {
    processedHtml = decodeHtmlEntities(html)
  }

  return DOMPurify.sanitize(processedHtml, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_CONTENTS: ['script', 'style', 'iframe'],
  })
}

// DOMPurify 후처리 훅: 링크 보안 강화
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  // 모든 링크에 target="_blank" rel="noopener noreferrer" 강제
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
  }

  // 인라인 스타일은 폰트 관련만 허용
  if (node.hasAttribute('style')) {
    const style = node.getAttribute('style') || ''
    const sanitizedStyles = style
      .split(';')
      .filter((s) => {
        const prop = s.split(':')[0]?.trim().toLowerCase()
        return ALLOWED_STYLES.includes(prop)
      })
      .join(';')

    if (sanitizedStyles) {
      node.setAttribute('style', sanitizedStyles)
    } else {
      node.removeAttribute('style')
    }
  }
})
