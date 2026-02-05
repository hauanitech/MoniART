/**
 * Builds a mailto: URI from prepared email data and opens it.
 */
export function openMailto(to: string[], subject: string, body: string): void {
  const params = new URLSearchParams();
  params.set('subject', subject);
  params.set('body', body);

  const toStr = to.join(',');
  const href = `mailto:${encodeURIComponent(toStr)}?${params.toString()}`;

  window.open(href, '_blank');
}
