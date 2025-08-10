-- Beispiel-Daten
insert into mitarbeiter (name, titel) values
('Jürgen Bauer','Polier'),
('Anna Krüger','Vorarbeiter'),
('Max Müller','Facharbeiter'),
('Sofia Lange','Facharbeiter'),
('Peter Schmidt','Werkpolier');

insert into fahrzeug (kennzeichen, sitzplaetze, fahrer_id) values
('B-AB 1234', 5, (select id from mitarbeiter where name='Jürgen Bauer')),
('M-XY 9876', 4, (select id from mitarbeiter where name='Peter Schmidt'));

insert into baustelle (name, ort, start, ende, soll_besetzung) values
('Berlin-Turm','Berlin','2025-08-01','2025-12-31','{"Polier":1,"Vorarbeiter":1,"Facharbeiter":3}'::jsonb),
('München-Brücke','München','2025-09-01','2026-03-31','{"Polier":1,"Vorarbeiter":1,"Facharbeiter":4}'::jsonb);
