# Reiseplaner

Eine reine Frontend-Web-App zur Reiseplanung: Reisen anlegen und verwalten,
pro Reise einen Tagesplan mit Aktivitäten (Uhrzeit, Ort, Kosten, Kategorie)
pflegen, die Ausgaben je Kategorie im Budget überblicken und eine Packliste
abhaken. Es gibt kein Backend — der komplette Zustand liegt im localStorage
des Browsers unter dem einen Schlüssel aus Namespace `trip-planner` und
Version `v1`.

## Tech-Stack

- **Sprache:** TypeScript (strict)
- **Framework:** React
- **Build:** Vite
- **Routing:** React Router (`react-router-dom`)
- **Styling:** handgeschriebenes CSS mit CSS-Variablen, kein UI-Framework
- **Persistenz:** localStorage (ein Schlüssel: Namespace `trip-planner` + Version `v1`)
- **Tests:** Vitest + @testing-library/react + @testing-library/user-event + jsdom

## Installation

Voraussetzung: Node.js (empfohlen: aktuelle LTS-Version) und npm.

```bash
npm ci
```

Gibt es noch keine `package-lock.json`, installiert `npm install` die
Abhängigkeiten und erzeugt sie.

## Entwicklung starten

```bash
npm run dev
```

Danach die im Terminal angezeigte Adresse öffnen (standardmäßig
`http://localhost:5173`).

## Produktions-Build

```bash
npm run build
```

Das erzeugt den gebauten Stand im Ordner `dist/`. Zum lokalen Ansehen des
Builds:

```bash
npm run preview
```

## Tests

```bash
npm test
```

## So benutzt du die App

- **Reiseliste (`/`):** die Startseite. Sie zeigt alle gespeicherten Reisen mit
  Name, Reiseziel und Zeitraum. Solange noch keine Reise existiert, erscheint
  ein leerer Zustand mit dem Hinweis, die erste Reise anzulegen.
- **Reise-Detailseite (`/trips/:tripId`):** der Tagesplan einer Reise mit einem
  Tagesabschnitt pro Datum des Reisezeitraums und den Aktivitäten je Tag.
- **Budget (`/trips/:tripId/budget`):** Gesamtsumme und Summe je Kategorie,
  dargestellt als Balkendiagramm ohne Chart-Bibliothek.
- **Packliste (`/trips/:tripId/packing`):** Gegenstände hinzufügen, abhaken und
  löschen; erledigte Einträge werden durchgestrichen dargestellt.

Die Kopfzeile ist auf allen Seiten sichtbar; der Titel „Reiseplaner" führt
jederzeit zurück zur Reiseliste.

Alle Eingaben werden sofort im localStorage gespeichert und beim nächsten
Aufruf automatisch wieder geladen. Ein Neuladen der Seite verliert keine Daten.
Die Anwendung funktioniert vollständig ohne Server und ohne Netzwerkanfragen.

## Funktionsumfang

- Reisen anlegen, umbenennen und mit Bestätigung löschen (samt Aktivitäten,
  Kosten und Packliste)
- Tagesplan je Reise mit Aktivitäten (Uhrzeit, Ort, Kosten, Kategorie),
  sortiert nach Uhrzeit, inklusive Bearbeiten und Löschen
- Budget-Übersicht mit Gesamtsumme und Aufschlüsselung je Kategorie als
  CSS-Balkendiagramm
- Packliste mit Hinzufügen, Abhaken und Löschen inklusive Fortschrittsanzeige
- Formularvalidierung mit verständlichen, feldnahen Fehlermeldungen
- Ruhiges, responsives Design (ab 360px Breite ohne horizontales Scrollen)
