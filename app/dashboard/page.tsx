'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Board from '@/components/Board';
import CommandBar from '@/components/CommandBar';

export default function Dashboard() {
  const [ready, setReady] = useState(false);
  const [, setTick] = useState(0);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) window.location.href = '/login';
      else setReady(true);
    });
  }, []);
  if (!ready) return null;
  return (
    <div className="container">
      <h1>Dashboard</h1>
      <CommandBar onRefresh={() => setTick(t => t+1)} />
      <div className="card">
        <h3>Planungsboard</h3>
        <p className="small">Ziehe Mitarbeiter auf eine Baustelle, um eine Zuweisung für 7 Tage anzulegen (Rolle = Titel).</p>
        <Board />
      </div>
    </div>
  );
}
