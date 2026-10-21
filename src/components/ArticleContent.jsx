import React from 'react';

/**
 * Parses inline formatting like **bold**, *italic*, and [links](url)
 */
function renderInlineFormatted(text) {
  if (!text) return null;

  // Split by links [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', val: text.substring(lastIndex, match.index) });
    }
    parts.push({ type: 'link', text: match[1], url: match[2] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', val: text.substring(lastIndex) });
  }

  return parts.map((part, pIdx) => {
    if (part.type === 'link') {
      const isExternal = part.url.startsWith('http');
      return (
        <a
          key={pIdx}
          href={part.url}
          target={isExternal ? '_blank' : '_self'}
          rel={isExternal ? 'noopener noreferrer' : ''}
          className="article-inline-link"
        >
          {part.text}
        </a>
      );
    }

    // Process bold (**...**) within text
    const boldParts = part.val.split(/\*\*(.*?)\*\*/g);
    return boldParts.map((bPart, bIdx) => {
      if (bIdx % 2 === 1) {
        return <strong key={`${pIdx}-${bIdx}`}>{bPart}</strong>;
      }
      return bPart;
    });
  });
}

/**
 * ArticleContent Component
 * Renders rich editorial article content with inline images, alignment (center/left/right),
 * captions, headings, quotes, and responsive layout.
 */
export default function ArticleContent({ content, className = '' }) {
  if (!content) return null;

  // Split content into blocks by double newline or image tags
  const rawBlocks = content.split(/\n\s*\n/);
  const elements = [];

  rawBlocks.forEach((block, index) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    // 1. Check for Markdown Image: ![caption](url) or ![align: caption](url)
    const mdImgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (mdImgMatch) {
      let rawCaption = mdImgMatch[1] || '';
      const imgUrl = mdImgMatch[2] || '';
      let align = 'center';

      // Check alignment prefix: e.g. "align-left: Caption" or "left: Caption"
      const alignMatch = rawCaption.match(/^(?:align-)?(left|right|center|full)(?::|\s*\|\s*)\s*(.*)$/i);
      if (alignMatch) {
        align = alignMatch[1].toLowerCase();
        if (align === 'full') align = 'center';
        rawCaption = alignMatch[2] || '';
      }

      elements.push(
        <figure key={`img-${index}`} className={`article-figure article-figure-${align}`}>
          <div className="article-figure-img-wrap">
            <img
              src={imgUrl}
              alt={rawCaption}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f0eeee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%23888888">Ảnh bài viết</text></svg>';
              }}
              className="article-figure-img"
            />
          </div>
          {rawCaption && (
            <figcaption className="article-figcaption">
              {rawCaption}
            </figcaption>
          )}
        </figure>
      );
      return;
    }

    // 2. Check for HTML Image Tag: <img src="..." alt="..." />
    const htmlImgMatch = trimmed.match(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i);
    if (htmlImgMatch) {
      const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
      const altMatch = trimmed.match(/alt=["']([^"']*)["']/i);
      const alignMatch = trimmed.match(/data-align=["']([^"']+)["']/i);

      const imgUrl = srcMatch ? srcMatch[1] : '';
      const alt = altMatch ? altMatch[1] : '';
      const align = alignMatch ? alignMatch[1].toLowerCase() : 'center';

      elements.push(
        <figure key={`html-img-${index}`} className={`article-figure article-figure-${align}`}>
          <div className="article-figure-img-wrap">
            <img
              src={imgUrl}
              alt={alt}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f0eeee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%23888888">Ảnh bài viết</text></svg>';
              }}
              className="article-figure-img"
            />
          </div>
          {alt && <figcaption className="article-figcaption">{alt}</figcaption>}
        </figure>
      );
      return;
    }

    // 3. Headings: ## Heading 2, ### Heading 3
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${index}`} className="article-h3">
          {renderInlineFormatted(trimmed.slice(4))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${index}`} className="article-h2">
          {renderInlineFormatted(trimmed.slice(3))}
        </h2>
      );
      return;
    }

    // 4. Blockquotes: > quote
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={`quote-${index}`} className="article-quote">
          {renderInlineFormatted(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    // 5. Unordered List: - item or * item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items = trimmed.split('\n').filter(l => l.trim().startsWith('- ') || l.trim().startsWith('* '));
      elements.push(
        <ul key={`list-${index}`} className="article-list">
          {items.map((item, iIdx) => (
            <li key={iIdx} className="article-list-item">
              {renderInlineFormatted(item.trim().slice(2))}
            </li>
          ))}
        </ul>
      );
      return;
    }

    // 6. Regular Paragraph with possible embedded single linebreaks
    elements.push(
      <p key={`p-${index}`} className="article-p">
        {trimmed.split('\n').map((line, lIdx, arr) => (
          <React.Fragment key={lIdx}>
            {renderInlineFormatted(line)}
            {lIdx < arr.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    );
  });

  return (
    <div className={`article-content-body ${className}`}>
      {elements}
    </div>
  );
}
