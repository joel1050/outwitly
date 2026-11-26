/** ["a", "b", "c"] → "a, b and c" (or "a, b or c"). */
export const listJoin = (xs: string[], conj: 'and' | 'or' = 'and') =>
  xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ${conj} ${xs.at(-1)}`;
