export type Titel = 'Polier' | 'Werkpolier' | 'Vorarbeiter' | 'Facharbeiter';

export interface Mitarbeiter {
  id: string;
  name: string;
  titel: Titel;
  qualifikationen: string[] | null;
  fuehrerschein: boolean | null;
  erstellt_am?: string;
}

export interface Fahrzeug {
  id: string;
  kennzeichen: string;
  sitzplaetze: number;
  fahrer_id: string | null;
}

export interface Baustelle {
  id: string;
  name: string;
  ort: string | null;
  start: string | null;
  ende: string | null;
  soll_besetzung: Record<string, number> | null;
}

export interface Verfuegbarkeit {
  id: string;
  mitarbeiter_id: string;
  typ: 'Urlaub' | 'Krank' | 'Schulung';
  von: string;
  bis: string;
}

export interface Zuweisung {
  id: string;
  baustelle_id: string;
  mitarbeiter_id: string;
  rolle: Titel;
  von: string;
  bis: string;
}
