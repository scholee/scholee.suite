/**
 * Import Lyricist Tags - Lexicon DJ Plugin
 * 
 * Importiert komma-getrennte Werte aus dem LYRICIST-Feld als Custom Tags.
 * - Verwendet existierende Tags aus "Genre & Style" falls vorhanden
 * - Erstellt neue Tags in "Imported Tags" für unbekannte Werte
 * - Leert das LYRICIST-Feld nach dem Import
 * 
 * @author Joël Kuhn
 * @version 1.0.0
 */

const GENRE_CATEGORY = 'Genre & Style'
const IMPORTED_CATEGORY = 'Imported Tags'

let totalTracks = 0
let totalTagsAdded = 0
let totalTagsCreated = 0
let totalTracksModified = 0

_helpers.Report(`Starte Lyricist Import für ${_vars.tracksSelected.length} Track(s)...`)

// Finde die beiden Kategorien
const genreCategory = _vars.customTagCategories.find(x => x.label === GENRE_CATEGORY)
const importedCategory = _vars.customTagCategories.find(x => x.label === IMPORTED_CATEGORY)

if (!genreCategory) {
  throw new Error(`Custom Tag Kategorie "${GENRE_CATEGORY}" nicht gefunden. Bitte erstellen Sie diese Kategorie zuerst.`)
}

if (!importedCategory) {
  throw new Error(`Custom Tag Kategorie "${IMPORTED_CATEGORY}" nicht gefunden. Bitte erstellen Sie diese Kategorie zuerst.`)
}

_helpers.Log(`Kategorien gefunden: "${GENRE_CATEGORY}" (ID: ${genreCategory.id}), "${IMPORTED_CATEGORY}" (ID: ${importedCategory.id})`)

// Erstelle Maps für schnellen Lookup
// Key = Label (lowercase für case-insensitive), Value = { id, label, categoryId }
const genreTagsMap = {}
const importedTagsMap = {}

for (const tag of _vars.customTags) {
  const lowerLabel = tag.label.toLowerCase()
  
  if (tag.categoryId === genreCategory.id) {
    genreTagsMap[lowerLabel] = { id: tag.id, label: tag.label, categoryId: tag.categoryId }
  } else if (tag.categoryId === importedCategory.id) {
    importedTagsMap[lowerLabel] = { id: tag.id, label: tag.label, categoryId: tag.categoryId }
  }
}

_helpers.Log(`${Object.keys(genreTagsMap).length} Tags in "${GENRE_CATEGORY}", ${Object.keys(importedTagsMap).length} Tags in "${IMPORTED_CATEGORY}"`)

// Cache für neu erstellte Tags in dieser Session
const newlyCreatedTags = {}

// Verarbeite alle selektierten Tracks
for (const track of _vars.tracksSelected) {
  const lyricistValue = track.lyricist
  
  if (lyricistValue && lyricistValue.trim() !== '') {
    totalTracks += 1
    let tagsAddedThisTrack = 0
    
    _helpers.Log(`Track "${track.title}" - ${track.artist}: LYRICIST = "${lyricistValue}"`)
    
    // Splitte nach Komma und trimme jeden Wert
    const values = lyricistValue.split(',').map(v => v.trim()).filter(v => v !== '')
    
    _helpers.Log(`  → ${values.length} Wert(e) gefunden: ${values.join(', ')}`)
    
    // Verarbeite jeden einzelnen Wert
    for (const value of values) {
      const lowerValue = value.toLowerCase()
      let tagToAdd = null
      
      // 1. Prüfe ob Tag in "Genre & Style" existiert
      if (genreTagsMap[lowerValue]) {
        tagToAdd = genreTagsMap[lowerValue]
        _helpers.Log(`  → "${value}": Gefunden in "${GENRE_CATEGORY}"`)
      }
      // 2. Prüfe ob Tag in "Imported Tags" existiert
      else if (importedTagsMap[lowerValue]) {
        tagToAdd = importedTagsMap[lowerValue]
        _helpers.Log(`  → "${value}": Gefunden in "${IMPORTED_CATEGORY}"`)
      }
      // 3. Prüfe ob wir ihn in dieser Session bereits erstellt haben
      else if (newlyCreatedTags[lowerValue]) {
        tagToAdd = newlyCreatedTags[lowerValue]
        _helpers.Log(`  → "${value}": Verwendet neu erstellten Tag`)
      }
      // 4. Tag existiert nicht → Erstelle in "Imported Tags"
      else {
        _helpers.Log(`  → "${value}": Nicht gefunden, erstelle in "${IMPORTED_CATEGORY}"`)
        const newTag = await _library.customTag.create({
          label: value,
          categoryId: importedCategory.id
        })
        
        tagToAdd = { id: newTag.id, label: value, categoryId: importedCategory.id }
        
        // Cache für zukünftige Tracks
        newlyCreatedTags[lowerValue] = tagToAdd
        importedTagsMap[lowerValue] = tagToAdd
        
        totalTagsCreated += 1
        _helpers.Log(`  → Neuer Tag erstellt: "${value}" (ID: ${newTag.id})`)
      }
      
      // Füge Tag zum Track hinzu (wenn nicht bereits vorhanden)
      if (tagToAdd && !track.tags.includes(tagToAdd.id)) {
        track.tags.push(tagToAdd.id)
        totalTagsAdded += 1
        tagsAddedThisTrack += 1
        _helpers.Log(`  → Tag "${tagToAdd.label}" zu Track hinzugefügt`)
      } else if (tagToAdd) {
        _helpers.Log(`  → Tag "${tagToAdd.label}" bereits vorhanden`)
      }
    }
    
    // WICHTIG: Leere das LYRICIST-Feld IMMER wenn es verarbeitet wurde
    // (auch wenn alle Tags bereits vorhanden waren)
    track.lyricist = ''
    totalTracksModified += 1
    _helpers.Log(`  → LYRICIST-Feld geleert (${tagsAddedThisTrack} neue Tag(s) hinzugefügt)`)
  } else {
    _helpers.Log(`Track "${track.title}" - ${track.artist}: LYRICIST-Feld ist leer. Übersprungen.`)
  }
}

// Finale Reports
_helpers.Report(`✓ ${totalTracksModified} Track(s) aktualisiert`)
_helpers.Report(`✓ ${totalTagsAdded} Tag(s) hinzugefügt`)
if (totalTagsCreated > 0) {
  _helpers.Report(`✓ ${totalTagsCreated} neue Tag(s) in "${IMPORTED_CATEGORY}" erstellt`)
}
if (totalTracks === 0) {
  _helpers.Report(`○ Keine Tracks mit LYRICIST-Daten gefunden`)
}
