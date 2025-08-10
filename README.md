
# Personalplanung Starter (Next.js + Supabase)

Kostenloser MVP für Bauleitungs-Personalplanung:
- Login (Supabase Email/Passwort)
- Mitarbeiter/ Baustellen/ Fahrzeuge (Supabase Tabellen)
- Drag & Drop Board (Zuweisungen)
- Command-Zeile (Urlaub/Krank/Zuweisung/Neue Baustelle)
- Warnungen (Unter-/Überdeckung, Verfügbarkeitskonflikte, Hierarchie)

## 1) Setup – Supabase
1. Neues Supabase-Projekt (EU-Region) anlegen.
2. Im Dashboard -> SQL Editor -> `sql/schema.sql` ausführen.
3. Optional: `sql/seed.sql` ausführen (Beispieldaten).
4. Settings -> API: `PROJECT URL` und `anon public key` merken.

## 2) Setup – Vercel
- `.env` Variablen in Vercel setzen (siehe `.env.example`).

## 3) Deploy (Vercel)
- Repo importieren -> Environment Variables setzen -> Deploy.
- Danach App-URL öffnen.

## 4) Login
- Registriere dich mit deiner E-Mail (Supabase Auth). 
- Optional: `NEXT_PUBLIC_ADMIN_EMAILS` setzen, um den Zugriff auf bestimmte E-Mails zu beschränken.

## Command-Zeilen-Beispiele
- Verfügbarkeit: 
  - `Max Müller Urlaub 12.08.2025–16.08.2025`
  - `Sofia krank bis 22.08.2025`
- Zuweisung:
  - `Weise Anna Krüger als Vorarbeiterin vom 01.09.2025 bis 30.09.2025 Berlin-Turm zu`
- **Neue Baustelle**:
  - `Erstelle Baustelle Berlin-Turm in Berlin vom 01.09.2025 bis 31.12.2025 mit Soll Polier=1, Vorarbeiter=1, Facharbeiter=3`
  - Zeitraum und Ort optional: `Erstelle Baustelle München-Brücke mit Soll Polier=1, Facharbeiter=4`

## Erweitern
- Warnregeln: `utils/warnings.ts`
- Parser: `utils/commandParser.ts`
- Board: `components/Board.tsx`
