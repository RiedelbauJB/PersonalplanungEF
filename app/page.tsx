'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);
  if (!session) {
    return (
      <div className="container">
        <div className="card">
          <h1>Personalplanung</h1>
          <p>Bitte einloggen.</p>
          <Link className="btn primary" href="/login">Zum Login</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="container">
      <div className="card">
        <h1>Willkommen</h1>
        <p><Link className="btn primary" href="/dashboard">Zum Dashboard</Link></p>
      </div>
    </div>
  );
}
