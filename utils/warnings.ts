import { Baustelle, Verfuegbarkeit, Zuweisung, Mitarbeiter } from './types';

export type Warning = { level: 'error'|'warn', text: string, baustelleId?: string };

export function computeWarnings(
  baustellen: Baustelle[],
  zuweisungen: Zuweisung[],
  verfuegbarkeiten: Verfuegbarkeit[],
  mitarbeiter: Mitarbeiter[]
): Warning[] {
  const out: Warning[] = [];
  const byBaustelle: Record<string, Zuweisung[]> = {};
  for (const z of zuweisungen) {
    (byBaustelle[z.baustelle_id] ||= []).push(z);
  }
  // 1) Unter-/Überdeckung gegen Sollbesetzung (vereinfacht: aktuelles Datum)
  const today = new Date().toISOString().slice(0,10);
  for (const b of baustellen) {
    const active = (byBaustelle[b.id] || []).filter(z => !(z.von > today || z.bis < today));
    const counts: Record<string, number> = {};
    for (const z of active) counts[z.rolle] = (counts[z.rolle]||0)+1;
    const soll = b.soll_besetzung || {};
    for (const r of Object.keys(soll)) {
      const ist = counts[r]||0;
      if (ist < (soll as any)[r]) out.push({ level:'error', text:`${b.name}: Unterdeckung ${r} (Soll ${(soll as any)[r]}, Ist ${ist})`, baustelleId: b.id });
      if (ist > (soll as any)[r]) out.push({ level:'warn', text:`${b.name}: Überdeckung ${r} (Soll ${(soll as any)[r]}, Ist ${ist})`, baustelleId: b.id });
    }
    // Hierarchie-Regel: Vorarbeiter → mind. 1 Polier
    if ((counts['Vorarbeiter']||0) > 0 && (counts['Polier']||0) === 0) {
      out.push({ level:'error', text:`${b.name}: Vorarbeiter ohne Polier`, baustelleId: b.id });
    }
  }
  // 2) Verfügbarkeitskonflikte
  for (const z of zuweisungen) {
    const conflicts = verfuegbarkeiten.filter(v => v.mitarbeiter_id === z.mitarbeiter_id && !(v.von > z.bis || v.bis < z.von));
    for (const _ of conflicts) {
      out.push({ level:'error', text:`Konflikt: Mitarbeiter parallel abwesend (Baustelle ${z.baustelle_id})`, baustelleId: z.baustelle_id });
      break;
    }
  }
  return out;
}
