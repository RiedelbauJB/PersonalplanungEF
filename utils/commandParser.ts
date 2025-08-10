/**
 * Deutscher Mini-Parser für drei Kategorien:
 * 1) Verfügbarkeit: "Max Müller Urlaub 12.08.2025–16.08.2025" / "Sofia krank bis 22.08.2025"
 * 2) Zuweisung: "Weise Anna Krüger als Vorarbeiterin vom 01.09.2025 bis 30.09.2025 Berlin zu"
 * 3) Baustelle anlegen:
 *    - "Erstelle Baustelle Berlin-Turm in Berlin mit Soll Polier=1, Vorarbeiter=1, Facharbeiter=3"
 *    - Optional Zeitraum: "vom 01.09.2025 bis 31.12.2025"
 */
import { Titel } from './types';

function normDate(d: string) {
  // erwartet TT.MM.JJJJ
  const m = d?.match(/(\d{1,2})[\.\-](\d{1,2})[\.\-](\d{4})/);
  if (!m) return null;
  const [_, dd, mm, yyyy] = m;
  const pad = (s: string) => s.padStart(2,'0');
  return `${yyyy}-${pad(mm)}-${pad(dd)}`;
}

function parseSoll(input: string | undefined | null): Record<string, number> | null {
  if (!input) return null;
  // Akzeptiere: "Polier=1, Vorarbeiter=2, Facharbeiter=3" oder mit ":"
  const obj: Record<string, number> = {};
  const pairs = input.split(/[;,]/).map(s => s.trim()).filter(Boolean);
  for (const p of pairs) {
    const m = p.match(/(Polier|Werkpolier|Vorarbeiter(?:in)?|Facharbeiter(?:in)?)\s*[=:]\s*(\d+)/i);
    if (m) {
      let role = m[1].toLowerCase();
      if (role.startsWith('vorarbeiter')) role = 'Vorarbeiter';
      else if (role.startsWith('facharbeiter')) role = 'Facharbeiter';
      else if (role.startsWith('werkpolier')) role = 'Werkpolier';
      else role = 'Polier';
      obj[role] = parseInt(m[2], 10);
    }
  }
  return Object.keys(obj).length ? obj : null;
}

export type ParsedCommand =
 | { kind: 'verfuegbarkeit', name: string, typ: 'Urlaub'|'Krank', von: string|null, bis: string }
 | { kind: 'zuweisung', name: string, rolle: Titel, baustelle: string, von: string, bis: string }
 | { kind: 'baustelle', name: string, ort: string|null, von: string|null, bis: string|null, soll: Record<string, number>|null }

export function parseCommand(input: string): ParsedCommand | null {
  const s = input.trim();

  // 1) Urlaub/Krank mit von–bis
  let m = s.match(/^(.+?)\s+(Urlaub|krank)\s+(\d{1,2}[\.\-]\d{1,2}[\.\-]\d{4})[\s–-]+(\d{1,2}[\.\-]\d{1,2}[\.\-]\d{4})$/i);
  if (m) {
    const name = m[1].trim();
    const typ = m[2].toLowerCase() === 'urlaub' ? 'Urlaub' : 'Krank';
    const von = normDate(m[3])!;
    const bis = normDate(m[4])!;
    return { kind: 'verfuegbarkeit', name, typ, von, bis };
  }

  // Krank bis Datum
  m = s.match(/^(.+?)\s+krank\s+bis\s+(\d{1,2}[\.\-]\d{1,2}[\.\-]\d{4})$/i);
  if (m) {
    const name = m[1].trim();
    const bis = normDate(m[2])!;
    return { kind: 'verfuegbarkeit', name, typ: 'Krank', von: null, bis };
  }

  // 2) Zuweisung: Weise {Name} als {Rolle} vom {von} bis {bis} {Baustelle} zu
  m = s.match(/^Weise\s+(.+?)\s+als\s+(Polier|Werkpolier|Vorarbeiter(in)?|Facharbeiter(in)?)\s+vom\s+(\d{1,2}[\.\-]\d{1,2}[\.\-]\d{4})\s+bis\s+(\d{1,2}[\.\-]\d{1,2}[\.\-]\d{4})\s+(.+?)\s+zu$/i);
  if (m) {
    const name = m[1].trim();
    let rolle = m[2].toLowerCase();
    if (rolle.startsWith('vorarbeiter')) rolle = 'Vorarbeiter';
    if (rolle.startsWith('facharbeiter')) rolle = 'Facharbeiter';
    const von = normDate(m[5])!;
    const bis = normDate(m[6])!;
    const baustelle = m[7].trim();
    return { kind: 'zuweisung', name, rolle: rolle as Titel, baustelle, von, bis };
  }

  // 3) Baustelle anlegen
  // Varianten:
  // "Erstelle Baustelle {Name} in {Ort} vom {von} bis {bis} mit Soll {Polier=1, Vorarbeiter=2, ...}"
  // "Neue Baustelle {Name} in {Ort} mit Soll Polier=1, Facharbeiter=3"
  m = s.match(/^(?:Erstelle|Neue|Erzeuge|Eröffne)\s+Baustelle\s+(.+?)(?:\s+in\s+([A-Za-zÄÖÜäöüß\-\s]+?))?(?:\s+vom\s+(\d{1,2}[\.\-]\d{1,2}[\.\-]\d{4})\s+bis\s+(\d{1,2}[\.\-]\d{1,2}[\.\-]\d{4}))?(?:\s+mit\s+Soll\s+(.+))?$/i);
  if (m) {
    const name = m[1].trim();
    const ort = m[2]?.trim() || null;
    const von = m[3] ? normDate(m[3]) : null;
    const bis = m[4] ? normDate(m[4]) : null;
    const soll = parseSoll(m[5]);
    return { kind: 'baustelle', name, ort, von, bis, soll };
  }

  return null;
}
