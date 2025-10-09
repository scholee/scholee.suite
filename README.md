# Compare Fields - Lexicon DJ Plugin

Ein leistungsstarkes Plugin zum Vergleichen von Track-Feldern und automatischen Erstellen von Playlists mit den Ergebnissen.

**Version:** 3.0.5  
**Autor:** Joel Kuhn  
**Status:** ✅ Stabil & Produktiv

---

## 📋 Funktionen

### Kern-Features
- ✅ **Feldvergleich**: Vergleicht zwei beliebige Track-Felder (z.B. Artist vs. Extra1)
- ✅ **Flexible Modi**: "Matching" (gleiche Werte) oder "Not matching" (unterschiedliche Werte)
- ✅ **Drei Scopes**: All tracks, Current view, Selected tracks
- ✅ **Smart Empty-Handling**: Drei Policies für leere Felder
- ✅ **Whitespace-Trimming**: Optional Leerzeichen an Rändern entfernen
- ✅ **Auto-Playlist**: Erstellt Playlist mit Zeitstempel im Ordner "Plugins Scholee"
- ✅ **Progress-Tracking**: Echtzeit-Updates bei großen Bibliotheken

### Vergleichbare Felder
```
id, title, artist, albumTitle, label, remixer, mix,
composer, producer, grouping, lyricist, comment, key,
genre, bpm, rating, color, year, duration, bitrate,
playCount, location, lastPlayed, dateAdded, dateModified,
sizeBytes, sampleRate, trackNumber, energy, danceability,
popularity, happiness, extra1, extra2, extra3
```

---

## 🚀 Verwendung

### 1. Plugin starten
**Plugins → Compare Fields → Run**

### 2. Dialoge durchgehen

| Dialog | Beschreibung | Beispiel |
|--------|--------------|----------|
| **Field A** | Erstes Vergleichsfeld | `artist` |
| **Field B** | Zweites Vergleichsfeld | `extra1` |
| **Mode** | Matching (gleich) oder Not matching (unterschiedlich) | `Not matching` |
| **Scope** | Datenquelle | `All tracks` |
| **Trim whitespace** | Leerzeichen ignorieren? | `true` |
| **Empty handling** | Verhalten bei leeren Feldern | `exclude` |

### 3. Bestätigung
- Vorschau zeigt Anzahl gefundener Tracks
- "Yes" → Playlist wird erstellt
- "No" → Abbruch ohne Änderungen

### 4. Ergebnis
Playlist wird erstellt unter: **Plugins Scholee / Compare YYYY-MM-DD HH:mm:ss**

---

## 📊 Empty-Handling Policies

| Policy | Verhalten |
|--------|-----------|
| **exclude** | Tracks mit leeren Feldern werden übersprungen (empfohlen) |
| **countAsMatch** | Beide Felder leer = Match |
| **countAsMismatch** | Beide Felder leer = Mismatch |

---

## 💡 Anwendungsbeispiele

### Beispiel 1: Tags validieren
**Ziel:** Finde Tracks wo Artist und Extra1 unterschiedlich sind
```
Field A: artist
Field B: extra1
Mode: Not matching
Scope: All tracks
Result: Tracks mit unterschiedlichen Werten in beiden Feldern
```

### Beispiel 2: Duplikate finden
**Ziel:** Finde Tracks mit gleichem Titel aber unterschiedlichem Artist
```
Field A: title
Field B: artist
Mode: Matching (für Titel-Check in zwei Durchläufen)
```

### Beispiel 3: Metadaten-Cleanup
**Ziel:** Finde Tracks wo Comment und Grouping identisch sind
```
Field A: comment
Field B: grouping
Mode: Matching
Scope: Selected tracks
Result: Potenzielle Cleanup-Kandidaten
```

---

## ⚙️ Technische Details

### Performance
- **Chunked Processing**: 500 Tracks pro Batch
- **Progress Updates**: Echtzeit-Fortschritt bei "All tracks"
- **Speicher-effizient**: Nur Track-IDs im Ergebnis

### API-Integration
- Verwendet `_library.track.getNextAllBatch()` für große Bibliotheken
- Verwendet `_vars.playlistsAll` für Playlist-Manipulation
- Kompatibel mit Lexicon Plugin API v2.x

### Code-Qualität
- ✅ 0 Linter-Fehler
- ✅ Modern ES6+ Syntax (const/let, arrow functions, for...of)
- ✅ Top-Level await Support
- ✅ Keine continue/break Statements (Lexicon-Kompatibilität)

---

## 🐛 Troubleshooting

### Plugin startet nicht
- **Lexicon neu starten**
- **Logs prüfen**: `Logs/scholee.suite/Compare Fields.log`

### Keine Tracks gefunden
- **Scope prüfen**: Sind Tracks in "Selected" oder "Current view"?
- **Empty-Handling**: "exclude" überspringt leere Felder

### Playlist wird nicht erstellt
- **Permissions prüfen**: Plugin benötigt `playlist.create` Berechtigung
- **_vars.playlistsAll**: Lexicon muss Playlist-Liste aktualisiert haben

---

## 📝 Changelog

Siehe [CHANGELOG.md](CHANGELOG.md) für Details zu allen Versionen.

### Version 3.0.5 (2025-10-09) - Aktuell
✅ **Alle kritischen Bugs behoben**
- Entfernt: `async function run()` Wrapper
- Entfernt: `continue` Statements
- Entfernt: `_ui.showDialog()` (nicht existierende API)
- Fix: `_vars.playlistsAll` für Track-Zuweisung
- **Status: Stabil & Produktiv** 🎉

---

## 📞 Support

**Autor:** Joel Kuhn  
**Discord:** joelkuhn  
**E-Mail:** joel@example.com

Bei Fragen oder Problemen bitte via Discord kontaktieren.

---

**Vielen Dank für die Nutzung! 🎵**

