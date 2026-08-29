import DOMPurify from 'dompurify';

export const parseSender = (senderString) => {
  if (!senderString) return { name: 'Unknown', email: '' };

  const match = senderString.match(/^(.*?)\s*<(.+?)>$/);
  if (match) {
    return {
      name: match[1].replace(/["']/g, '').trim() || match[2],
      email: match[2].trim(),
    };
  }

  if (senderString.includes('@')) {
    return {
      name: senderString.split('@')[0],
      email: senderString.trim(),
    };
  }

  return { name: senderString, email: '' };
};

export const sanitizeEmailBody = (htmlOrText) => {
  if (!htmlOrText) return '';

  // If it's pure HTML, sanitize with DOMPurify
  if (htmlOrText.includes('<') && htmlOrText.includes('>')) {
    return DOMPurify.sanitize(htmlOrText, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ['target'],
    });
  }

  // If plain text, convert newlines to <br> and sanitize
  const escaped = htmlOrText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped.replace(/\n/g, '<br/>');
};

export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};
