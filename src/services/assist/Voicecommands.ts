export type Option = { label: string; value: string };

export type Command =
  | { type: 'open'; target: string }
  | { type: 'close'; target: string }
  | { type: 'clear'; target: string }
  | { type: 'check'; target: string; on: boolean }
  | { type: 'save'; send: boolean }
  | { type: 'stopListening' }
  | { type: 'stopDictation' }
  | { type: 'confirm' }
  | { type: 'cancel'; target: string }
  | { type: 'help' }
  | { type: 'unknown' };

const NUMBER_WORDS: Record<string, string> = {
  zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5',
  six: '6', seven: '7', eight: '8', nine: '9', ten: '10',
  eleven: '11', twelve: '12',
};

const LETTER_WORDS: Record<string, string> = {
  jay: 'j', kay: 'k', see: 'c', sea: 'c', cee: 'c', dee: 'd',
  tee: 't', pee: 'p', em: 'm', aitch: 'h', age: 'h',
};


export function normalize(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[-_/.,]/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => NUMBER_WORDS[w] ?? LETTER_WORDS[w] ?? w)   // <-- changed line
    .join(' ');
}

/** "JH-C" -> "JH C" so the text-to-speech reads it naturally */
export function speakable(text: string): string {
  return (text || '').replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function capitalizeFirst(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[n];
}

/**
 * 0..1 similarity between what was heard and a candidate.
 * allowContain=false is used for field names so "jh c" does not match the alias "jh".
 */
export function similarity(spoken: string, candidate: string, allowContain = true): number {
  const a = normalize(spoken);
  const b = normalize(candidate);
  if (!a || !b) return 0;
  if (a === b) return 1;

  const ca = a.replace(/\s/g, '');
  const cb = b.replace(/\s/g, '');
  if (ca === cb) return 0.97; // "j h c" vs "jh-c"

  let score = 0;

  if (allowContain && (cb.includes(ca) || ca.includes(cb))) {
    const ratio = Math.min(ca.length, cb.length) / Math.max(ca.length, cb.length);
    score = Math.max(score, 0.7 + 0.25 * ratio);
  }

  const ta = new Set(a.split(' '));
  const tb = new Set(b.split(' '));
  let inter = 0;
  ta.forEach(t => {
    if (tb.has(t)) inter++;
  });
  const jaccard = inter / (ta.size + tb.size - inter);
  score = Math.max(score, jaccard * 0.9);

  const lev = 1 - levenshtein(ca, cb) / Math.max(ca.length, cb.length);
  score = Math.max(score, lev * 0.95);

  return score;
}

export function rank(spoken: string, options: Option[]): { option: Option; score: number }[] {
  return options
    .map(option => ({ option, score: similarity(spoken, option.label) }))
    .filter(r => r.score > 0)
    .sort((x, y) => y.score - x.score);
}

/** Rough "sounds like" key: team/theme/deme -> same key, funtion/function -> near-same */
export function phonetic(word: string): string {
  let w = normalize(word).replace(/\s/g, '');
  if (!w) return '';
  w = w
    .replace(/ph/g, 'f').replace(/th/g, 't').replace(/ck/g, 'k')
    .replace(/c(?=[eiy])/g, 's').replace(/[cq]/g, 'k')
    .replace(/x/g, 'ks').replace(/w/g, 'v');
  let s = w[0] + w.slice(1).replace(/[aeiouh]/g, '');
  s = s.replace(/[dt]/g, 't').replace(/[bp]/g, 'p').replace(/[gk]/g, 'k')
    .replace(/[vf]/g, 'f').replace(/[zs]/g, 's');
  return s.replace(/(.)\1+/g, '$1');
}

function tokenScore(tok: string, kw: string): number {
  if (tok === kw) return 1;
  if (tok.length >= 3 && kw.startsWith(tok)) return 0.9;          // "loca" -> "location"
  const pt = phonetic(tok);
  const pk = phonetic(kw);
  if (pt && pt === pk && tok.length >= 3) return 0.88;            // team / theme / deme
  if (tok.length >= 3 && pt.length >= 2 && pk.startsWith(pt)) return 0.8;
  const l = 1 - levenshtein(tok, kw) / Math.max(tok.length, kw.length);
  if (tok.length >= 4 && l >= 0.75) return l * 0.9;               // "catogory"
  const lp = 1 - levenshtein(pt, pk) / Math.max(pt.length, pk.length, 1);
  if (pt.length >= 4 && lp >= 0.75) return lp * 0.85;             // "funtion"
  return 0;
}

const FILLER = new Set(['the', 'my', 'field', 'box', 'dropdown', 'drop', 'down', 'list', 'option', 'section']);

/** Score a spoken field name against a control's label + aliases + keywords (word by word). */
export function fieldScore(spoken: string, label: string, names: string[]): number {
  const toks = normalize(spoken).split(' ').filter(t => t && !FILLER.has(t));
  if (!toks.length) return 0;
  const pool = Array.from(
    new Set(
      [label, ...names]
        .flatMap(n => normalize(n).split(' '))
        .filter(t => t && !FILLER.has(t)),
    ),
  );
  const best = toks.map(t => Math.max(0, ...pool.map(k => tokenScore(t, k))));
  const avg = best.reduce((a, b) => a + b, 0) / toks.length;
  // tie-breaker: "jh" should prefer the field labelled "jh" over "non jh esp"
  const labelToks = normalize(label).split(' ').filter(Boolean);
  const cov = labelToks.filter(l => toks.some(t => tokenScore(t, l) >= 0.7)).length / labelToks.length;
  return avg * (0.9 + 0.1 * cov);
}

export function parseCommand(raw: string): Command {
  const t = normalize(raw);
  if (!t) return { type: 'unknown' };

  if (
    /^(save|submit)( (it|this|that|the|my))*( suggestion| record| records| form| data)? and send( it)?( to( the)? (leader|lead|leaders))?$/.test(t) ||
    /^send( it)? to( the)? (leader|lead|leaders)$/.test(t)
  ) {
    return { type: 'save', send: true };
  }
  if (/^(save|submit)( (it|this|that|the|my))*( suggestion| record| records| form| data)?$/.test(t)) {
    return { type: 'save', send: false };
  }
  if (/^(stop listening|stop voice|stop voice control|exit voice|voice off)$/.test(t)) {
    return { type: 'stopListening' };
  }
  if (/^(stop|done|finish|finished|that is all|end)$/.test(t)) {
    return { type: 'stopDictation' };
  }
  if (/^(help|what can i say)$/.test(t)) {
    return { type: 'help' };
  }
  if (/^(ok|okay|confirm|apply)$/.test(t)) {
    return { type: 'confirm' };
  }

  let m = t.match(/^(open|enter\w*|inter|center|select|choose|go to|edit|fill|type|set)\s+(.+)$/);
  if (m) return { type: 'open', target: m[2].replace(/^(the|my)\s+/, '') };

  m = t.match(/^cancel(?:\s+(.+))?$/);
  if (m) return { type: 'cancel', target: (m[1] || '').replace(/^(the|my)\s+/, '') };

  m = t.match(/^close(?:\s+(.+))?$/);
  if (m) return { type: 'close', target: (m[1] || '').replace(/^(the|my)\s+/, '') };

  m = t.match(/^(clear|erase|delete)\s+(.+)$/);
  if (m) return { type: 'clear', target: m[2].replace(/^(the|my)\s+/, '') };

  m = t.match(/^(check|tick|enable|turn on)\s+(.+)$/);
  if (m) return { type: 'check', target: m[2].replace(/^(the|my)\s+/, ''), on: true };

  m = t.match(/^(uncheck|untick|disable|turn off)\s+(.+)$/);
  if (m) return { type: 'check', target: m[2].replace(/^(the|my)\s+/, ''), on: false };

  return { type: 'unknown' };
}

/** "today", "yesterday", "day before yesterday", "3 days ago" (future dates are not allowed) */
export function parseSpokenDate(spoken: string): Date | null {
  const t = normalize(spoken);
  const d = new Date();
  if (/^(today|now)$/.test(t)) return d;
  if (t === 'yesterday') {
    d.setDate(d.getDate() - 1);
    return d;
  }
  if (t === 'day before yesterday') {
    d.setDate(d.getDate() - 2);
    return d;
  }
  const m = t.match(/^(\d+) days? ago$/);
  if (m) {
    d.setDate(d.getDate() - parseInt(m[1], 10));
    return d;
  }
  return null;
}