'use client';
import { supabase } from '@/lib/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [allowed, setAllowed] = useState<string[] | null>(null);
  useEffect(() => {
    const v = process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
    setAllowed(v ? v.split(',').map(s=>s.trim().toLowerCase()) : null);
  }, []);

  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user?.email && allowed && !allowed.includes(session.user.email.toLowerCase())) {
      await supabase.auth.signOut();
      alert('Diese E-Mail ist nicht für den Zugriff freigeschaltet.');
    }
    if (session) window.location.href = '/dashboard';
  });

  return (
    <div className="container">
      <div className="card" style={{maxWidth:420, margin:'40px auto'}}>
        <h2>Login</h2>
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={[]} />
      </div>
    </div>
  );
}
