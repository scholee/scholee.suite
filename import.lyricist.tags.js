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
const ACTION_NAME = 'Import Lyricist Tags'
const LOG_SESSION = String(Date.now())
const logInfo = (msg) => _helpers.Log(`[${ACTION_NAME}][INFO][${LOG_SESSION}] ${msg}`)
const logError = (msg) => _helpers.Log(`[${ACTION_NAME}][ERROR][${LOG_SESSION}] ${msg}`)

try {
  let totalTracks = 0
  let totalTagsAdded = 0
  let totalTagsCreated = 0
  let totalTracksModified = 0

  _helpers.Report(`Starte Lyricist Import für ${_vars.tracksSelected.length} Track(s)...`)
  logInfo(`Start. selectedTracks=${_vars.tracksSelected.length}`)

  // Finde die beiden Kategorien
  const genreCategory = _vars.customTagCategories.find(x => x.label === GENRE_CATEGORY)
  const importedCategory = _vars.customTagCategories.find(x => x.label === IMPORTED_CATEGORY)

  if (!genreCategory) {
    throw new Error(`Custom Tag Kategorie "${GENRE_CATEGORY}" nicht gefunden. Bitte erstellen Sie diese Kategorie zuerst.`)
  }

  if (!importedCategory) {
    throw new Error(`Custom Tag Kategorie "${IMPORTED_CATEGORY}" nicht gefunden. Bitte erstellen Sie diese Kategorie zuerst.`)
  }

  logInfo(`Kategorien gefunden: "${GENRE_CATEGORY}" (ID: ${genreCategory.id}), "${IMPORTED_CATEGORY}" (ID: ${importedCategory.id})`)

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

  logInfo(`${Object.keys(genreTagsMap).length} Tags in "${GENRE_CATEGORY}", ${Object.keys(importedTagsMap).length} Tags in "${IMPORTED_CATEGORY}"`)

  // Cache für neu erstellte Tags in dieser Session
  const newlyCreatedTags = {}

  // Verarbeite alle selektierten Tracks
  for (const track of _vars.tracksSelected) {
    const lyricistValue = track.lyricist
    
    if (lyricistValue && lyricistValue.trim() !== '') {
      totalTracks += 1
      let tagsAddedThisTrack = 0
      
      logInfo(`Track "${track.title}" - ${track.artist}: LYRICIST = "${lyricistValue}"`)
      
      // Splitte nach Komma und trimme jeden Wert
      const values = lyricistValue.split(',').map(v => v.trim()).filter(v => v !== '')
      
      logInfo(`  → ${values.length} Wert(e) gefunden: ${values.join(', ')}`)
      
      // Verarbeite jeden einzelnen Wert
      for (const value of values) {
        const lowerValue = value.toLowerCase()
        let tagToAdd = null
        
        // 1. Prüfe ob Tag in "Genre & Style" existiert
        if (genreTagsMap[lowerValue]) {
          tagToAdd = genreTagsMap[lowerValue]
          logInfo(`  → "${value}": Gefunden in "${GENRE_CATEGORY}"`)
        }
        // 2. Prüfe ob Tag in "Imported Tags" existiert
        else if (importedTagsMap[lowerValue]) {
          tagToAdd = importedTagsMap[lowerValue]
          logInfo(`  → "${value}": Gefunden in "${IMPORTED_CATEGORY}"`)
        }
        // 3. Prüfe ob wir ihn in dieser Session bereits erstellt haben
        else if (newlyCreatedTags[lowerValue]) {
          tagToAdd = newlyCreatedTags[lowerValue]
          logInfo(`  → "${value}": Verwendet neu erstellten Tag`)
        }
        // 4. Tag existiert nicht → Erstelle in "Imported Tags"
        else {
          logInfo(`  → "${value}": Nicht gefunden, erstelle in "${IMPORTED_CATEGORY}"`)
          const newTag = await _library.customTag.create({
            label: value,
            categoryId: importedCategory.id
          })
          
          tagToAdd = { id: newTag.id, label: value, categoryId: importedCategory.id }
          
          // Cache für zukünftige Tracks
          newlyCreatedTags[lowerValue] = tagToAdd
          importedTagsMap[lowerValue] = tagToAdd
          
          totalTagsCreated += 1
          logInfo(`  → Neuer Tag erstellt: "${value}" (ID: ${newTag.id})`)
        }
        
        // Füge Tag zum Track hinzu (wenn nicht bereits vorhanden)
        if (tagToAdd && !track.tags.includes(tagToAdd.id)) {
          track.tags.push(tagToAdd.id)
          totalTagsAdded += 1
          tagsAddedThisTrack += 1
          logInfo(`  → Tag "${tagToAdd.label}" zu Track hinzugefügt`)
        } else if (tagToAdd) {
          logInfo(`  → Tag "${tagToAdd.label}" bereits vorhanden`)
        }
      }
      
      // WICHTIG: Leere das LYRICIST-Feld IMMER wenn es verarbeitet wurde
      // (auch wenn alle Tags bereits vorhanden waren)
      track.lyricist = ''
      totalTracksModified += 1
      logInfo(`  → LYRICIST-Feld geleert (${tagsAddedThisTrack} neue Tag(s) hinzugefügt)`)
    } else {
      logInfo(`Track "${track.title}" - ${track.artist}: LYRICIST-Feld ist leer. Übersprungen.`)
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
  logInfo(`Done. tracksModified=${totalTracksModified}, tagsAdded=${totalTagsAdded}, tagsCreated=${totalTagsCreated}`)
} catch (_unhandledError) {
  const message = 'Unexpected error in lyricist import action.'
  logError(`Unhandled error: ${message}`)
  _helpers.Report(`Import Lyricist Tags fehlgeschlagen: ${message}`)
}
