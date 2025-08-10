'use client';
import { useState } from 'react';
import { parseCommand } from '@/utils/commandParser';
import { supabase } from '@/lib/supabaseClient';
import { Titel } from '@/utils/types';

export default function CommandBar({ onRefresh }: { onRefresh: () => void }) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  function onChange(e: any) {
    setValue(e.target.value);
    setError(null);
    setPreview(parseCommand(e.target.value));
  }

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const cmd = parseCommand(value);
      if (!cmd) { setError('Nicht verstanden. Beispiele: "Max Müller Urlaub 12.08.2025–16.08.2025"'); return; }

      if (cmd.kind === 'verfuegbarkeit') {
        const { data: person } = await supabase.from('mitarbeiter').select('*').ilike('name', cmd.name).maybeSingle();
        if (!person) throw new Error('Mitarbeiter nicht gefunden: '+cmd.name);
        const von = cmd.von ?? new Date().toISOString().slice(0,10);
        const { error } = await supabase.from('verfuegbarkeit').insert({ mitarbeiter_id: person.id, typ: cmd.typ, von, bis: cmd.bis });
        if (error) throw error;

      } else if (cmd.kind === 'zuweisung') {
        const { data: person } = await supabase.from('mitarbeiter').select('*').ilike('name', cmd.name).maybeSingle();
        if (!person) throw new Error('Mitarbeiter nicht gefunden: '+cmd.name);
        const { data: site } = await supabase.from('baustelle').select('*').ilike('name', cmd.baustelle).maybeSingle();
        if (!site) throw new Error('Baustelle nicht gefunden: '+cmd.baustelle);
        const { error } = await supabase.from('zuweisung').insert({ baustelle_id: site.id, mitarbeiter_id: person.id, rolle: cmd.rolle as Titel, von: cmd.von, bis: cmd.bis });
        if (error) throw error;

      } else if (cmd.kind === 'baustelle') {
        const payload: any = { name: cmd.name };
        if (cmd.ort) payload.ort = cmd.ort;
        if (cmd.von) payload.start = cmd.von;
        if (cmd.bis) payload.ende = cmd.bis;
        if (cmd.soll) payload.soll_besetzung = cmd.soll;
        const { error } = await supabase.from('baustelle').insert(payload);
        if (error) throw error;
      }

      setValue('');
      setPreview(null);
      onRefresh();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{marginBottom:16}}>
      <div style={{display:'flex', gap:8}}>
        <input className="input" placeholder='z.B. "Max Müller Urlaub 12.08.2025–16.08.2025" | "Weise Anna Krüger als Vorarbeiterin vom 01.09.2025 bis 30.09.2025 Berlin zu" | "Erstelle Baustelle Berlin-Turm in Berlin vom 01.09.2025 bis 31.12.2025 mit Soll Polier=1, Vorarbeiter=1, Facharbeiter=3"'
          value={value} onChange={onChange} />
        <button className="btn primary" onClick={run} disabled={busy}>Ausführen</button>
      </div>
      {preview && (
        <div className="small" style={{marginTop:8}}>
          Vorschau: <code>{JSON.stringify(preview)}</code>
        </div>
      )}
      {error && <div className="badge error" style={{marginTop:8}}>{error}</div>}
    </div>
  );
}
