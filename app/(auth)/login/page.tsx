'use client';
import { supabase } from '@/lib/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [allowed, setAllowed] = useState<string[] | null>(null);

  // 1) Adminliste einmalig aus ENV laden
  useEffect(() => {
    const v = process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
    setAllowed(v ? v.split(',').map(s => s.trim().toLowerCase()) : null);
  }, []);

  // 2) Auf Login-Status reagieren (und Abo sauber aufräumen)
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user?.email && allowed && !allowed.includes(session.user.email.toLowerCase())) {
        await supabase.auth.signOut();
        alert('Diese E-Mail ist nicht für den Zugriff freigeschaltet.');
        return;
      }
      if (session) window.location.href = '/dashboard';
    });
    return () => sub.subscription.unsubscribe();
  }, [allowed]);

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 420, margin: '40px auto' }}>
        <h2>Login</h2>
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={[]} />
      </div>
    </div>
  );
}
