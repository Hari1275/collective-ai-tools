/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

const UTM_PARAMS: Record<string, string> = {
  utm_source: 'collectiveai.tools',
  utm_medium: 'referral',
  utm_campaign: 'ai_tools_directory',
};

/**
 * Append consistent UTM attribution to an outbound external link.
 *
 * - Only touches absolute http(s) URLs; relative/internal or unparseable
 *   values are returned unchanged, so it is safe to call on any href.
 * - Never overwrites a UTM param the destination URL already sets.
 */
export function withUtm(url: string): string {
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return url;
    for (const [key, value] of Object.entries(UTM_PARAMS)) {
      if (!u.searchParams.has(key)) u.searchParams.set(key, value);
    }
    return u.toString();
  } catch {
    return url;
  }
}
