'use client';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Mitarbeiter, Baustelle, Zuweisung, Verfuegbarkeit } from '@/utils/types';
import { computeWarnings } from '@/utils/warnings';

function DraggableCard({ id, label, subtitle }:{ id:string, label:string, subtitle?:string }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cardItem">
      <div><strong>{label}</strong></div>
      {subtitle && <div className="small">{subtitle}</div>}
    </div>
  );
}

function DropCol({ id, title, children }:{ id:string, title:string, children:React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="column" style={{ background: isOver ? '#eef2ff' : undefined}}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export default function Board() {
  const [mitarbeiter, setMitarbeiter] = useState<Mitarbeiter[]>([]);
  const [baustellen, setBaustellen] = useState<Baustelle[]>([]);
  const [zuweisungen, setZuweisungen] = useState<Zuweisung[]>([]);
  const [verfuegbarkeiten, setVerfuegbarkeiten] = useState<Verfuegbarkeit[]>([]);
  const [warnings, setWarnings] = useState<any[]>([]);

  async function load() {
    const [{ data: m }, { data: b }, { data: z }, { data: v }] = await Promise.all([
      supabase.from('mitarbeiter').select('*').order('name'),
      supabase.from('baustelle').select('*').order('name'),
      supabase.from('zuweisung').select('*'),
      supabase.from('verfuegbarkeit').select('*'),
    ]);
    setMitarbeiter(m || []);
    setBaustellen(b || []);
    setZuweisungen(z || []);
    setVerfuegbarkeiten(v || []);
    setWarnings(computeWarnings(b || [], z || [], v || [], m || []));
  }

  useEffect(() => { load(); }, []);

  const assignedIds = new Set(zuweisungen.map(z => z.mitarbeiter_id));
  const unassigned = mitarbeiter.filter(m => !assignedIds.has(m.id));

  async function handleDrop(e: any) {
    const personId = e.active?.id;
    const targetBaustelleId = e.over?.id;
    if (!personId || !targetBaustelleId) return;
    if (targetBaustelleId === 'unassigned') return; // Ignorieren fürs MVP
    const person = mitarbeiter.find(m => m.id === personId);
    if (!person) return;
    const today = new Date();
    const in7 = new Date(Date.now()+7*86400000);
    const toISO = (d: Date) => d.toISOString().slice(0,10);
    await supabase.from('zuweisung').insert({
      baustelle_id: targetBaustelleId,
      mitarbeiter_id: personId,
      rolle: person.titel,
      von: toISO(today),
      bis: toISO(in7),
    });
    load();
  }

  return (
    <div>
      <div style={{marginBottom:8}}>
        {warnings.map((w,i)=>(<span key={i} className={`badge ${w.level}`}>{w.text}</span>))}
      </div>
      <DndContext onDragEnd={handleDrop}>
        <div className="board">
          <DropCol id="unassigned" title="Unzugeordnet">
            {unassigned.map(m => (<DraggableCard key={m.id} id={m.id} label={m.name} subtitle={m.titel} />))}
          </DropCol>
          {baustellen.map(b => (
            <DropCol key={b.id} id={b.id} title={`${b.name}${b.ort? ' – '+b.ort:''}`}>
              {zuweisungen.filter(z => z.baustelle_id===b.id).map(z => {
                const person = mitarbeiter.find(m => m.id===z.mitarbeiter_id);
                return (<DraggableCard key={z.id} id={person?.id || z.id} label={person?.name || 'Unbekannt'} subtitle={`${z.rolle} ${z.von}–${z.bis}`} />);
              })}
            </DropCol>
          ))}
        </div>
      </DndContext>
    </div>
  );
}
