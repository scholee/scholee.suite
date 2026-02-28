/**
 * Energy to Tag - Lexicon DJ Plugin
 * 
 * Schreibt den Energy-Wert (0-10) automatisch als Custom Tag in die Kategorie "Energy".
 * 
 * @author Joël Kuhn
 * @version 1.0.0
 */

const CATEGORY_NAME = 'Energy'

let totalModified = 0
let totalSkipped = 0
let totalNotFound = 0

_helpers.Report(`Starte Energy to Tag für ${_vars.tracksSelected.length} Track(s)...`)

// Finde die Energy-Kategorie
const energyCategory = _vars.customTagCategories.find(x => x.label === CATEGORY_NAME)

if (!energyCategory) {
  throw new Error(`Custom Tag Kategorie "${CATEGORY_NAME}" nicht gefunden. Bitte erstellen Sie diese Kategorie zuerst.`)
}

_helpers.Log(`Energy-Kategorie gefunden: ID ${energyCategory.id}`)

// Erstelle ein Mapping von Label zu Tag-ID für schnellen Lookup
const energyTagsMap = {}
for (const tag of _vars.customTags) {
  if (tag.categoryId === energyCategory.id) {
    energyTagsMap[tag.label] = tag.id
    _helpers.Log(`Gefunden: Energy Tag "${tag.label}" mit ID ${tag.id}`)
  }
}

_helpers.Log(`${Object.keys(energyTagsMap).length} Energy-Tags gefunden`)

// Verarbeite alle selektierten Tracks
for (const track of _vars.tracksSelected) {
  // Energy-Wert lesen
  const energyValue = track.energy
  
  if (energyValue === null || energyValue === undefined) {
    _helpers.Log(`Track "${track.title}" hat keinen Energy-Wert. Übersprungen.`)
    totalSkipped += 1
    continue
  }
  
  // Energy-Wert in String umwandeln für Tag-Lookup
  const energyLabel = String(energyValue)
  
  // Suche den entsprechenden Tag
  const tagId = energyTagsMap[energyLabel]
  
  if (!tagId) {
    _helpers.Log(`Tag "${energyLabel}" nicht in Kategorie "${CATEGORY_NAME}" gefunden. Track: "${track.title}"`)
    totalNotFound += 1
    continue
  }
  
  // Prüfe ob der Tag bereits vorhanden ist
  if (!track.tags.includes(tagId)) {
    track.tags.push(tagId)
    _helpers.Log(`Tag "${energyLabel}" zu Track "${track.title}" hinzugefügt`)
    totalModified += 1
  } else {
    _helpers.Log(`Tag "${energyLabel}" bereits bei Track "${track.title}" vorhanden`)
    totalSkipped += 1
  }
}

// Finale Report
_helpers.Report(`✓ ${totalModified} Track(s) aktualisiert`)
if (totalSkipped > 0) {
  _helpers.Report(`○ ${totalSkipped} Track(s) übersprungen (kein Energy-Wert oder Tag bereits vorhanden)`)
}
if (totalNotFound > 0) {
  _helpers.Report(`✗ ${totalNotFound} Track(s): Energy-Tag nicht gefunden`)
}
