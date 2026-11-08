/**
 * Normalização de endereços (rua/bairro) dos clientes.
 *
 * Valores com a mesma chave ("Goiás ", "goias", "Goias") são tratados como o
 * mesmo endereço.
 */

/** Remove espaços nas pontas e colapsa espaços internos. */
export function cleanDisplay(value: string | null | undefined): string {
  if (value == null) return '';
  return String(value).trim().replace(/\s+/g, ' ');
}

/** Chave de comparação: limpo, minúsculo e sem acentos. */
export function normalizeKey(value: string | null | undefined): string {
  return cleanDisplay(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/** Indica se o texto possui caracteres acentuados. */
export function hasAccents(value: string): boolean {
  return /[̀-ͯ]/.test(value.normalize('NFD'));
}

const LOWERCASE_WORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos']);

/** Title Case com preposições em minúsculo (exceto a primeira palavra). */
export function toTitleCase(value: string): string {
  const cleaned = cleanDisplay(value);
  if (!cleaned) return cleaned;
  return cleaned
    .toLocaleLowerCase('pt-BR')
    .split(' ')
    .map((word, index) => {
      if (index > 0 && LOWERCASE_WORDS.has(word)) return word;
      return word.charAt(0).toLocaleUpperCase('pt-BR') + word.slice(1);
    })
    .join(' ');
}

/**
 * Resolve a grafia canônica: reaproveita um valor existente com a mesma chave
 * (versão limpa) ou devolve o valor em Title Case.
 */
export function resolveCanonical(value: string, existing: Iterable<string>): string {
  const cleaned = cleanDisplay(value);
  if (!cleaned) return cleaned;
  const key = normalizeKey(cleaned);
  let match: string | undefined;
  for (const candidate of existing) {
    if (candidate == null || normalizeKey(candidate) !== key) continue;
    const display = cleanDisplay(candidate);
    // Prefere a grafia com acento quando houver mais de uma.
    if (match === undefined || (!hasAccents(match) && hasAccents(display))) {
      match = display;
    }
  }
  return match ?? toTitleCase(cleaned);
}

/** Lista distinta, deduplicada pela chave e ordenada (pt-BR). */
export function distinctByKey(values: Iterable<string>): string[] {
  const map = new Map<string, string>();
  for (const value of values) {
    const cleaned = cleanDisplay(value);
    if (!cleaned) continue;
    const key = normalizeKey(cleaned);
    const current = map.get(key);
    // Prefere a grafia com acento quando houver variação.
    if (current === undefined || (!hasAccents(current) && hasAccents(cleaned))) {
      map.set(key, cleaned);
    }
  }
  return [...map.values()].sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
}
