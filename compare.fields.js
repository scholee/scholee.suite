/**
 * Compare Fields - Lexicon DJ Plugin
 *
 * This plugin compares two track fields and creates a playlist with the results.
 * It is designed to be stable and follows the patterns from official Lexicon example plugins.
 *
 * @author Joel Kuhn
 * @version 3.0.5
 */

_helpers.Report("Plugin execution started (v3.0.5).");

// --- HELPER FUNCTIONS ---

function norm(v, opt) {
    let s = (v === null || v === undefined) ? "" : String(v);
    if (opt && opt.trim) {
        s = s.trim();
    }
    return s;
}

function safe(o, k) {
    if (!o || !k) return "";
    if (k.indexOf('.') === -1) return (o[k] !== undefined && o[k] !== null) ? o[k] : "";
    const parts = k.split('.');
    let acc = o;
    for (const part of parts) {
        if (acc && typeof acc === 'object' && acc[part] !== undefined && acc[part] !== null) {
            acc = acc[part];
        } else {
            return "";
        }
    }
    return (acc !== undefined && acc !== null) ? acc : "";
}

_helpers.Report("Helper functions defined.");

// --- CORE LOGIC ---

// 1. Define a stable list of fields for the dialogs
_helpers.Report("Step 1: Defining fields for dialogs.");
const allKeys = [
    "id", "title", "artist", "albumTitle", "label", "remixer", "mix",
    "composer", "producer", "grouping", "lyricist", "comment", "key",
    "genre", "bpm", "rating", "color", "year", "duration", "bitrate",
    "playCount", "location", "lastPlayed", "dateAdded", "dateModified",
    "sizeBytes", "sampleRate", "trackNumber", "energy", "danceability",
    "popularity", "happiness", "extra1", "extra2", "extra3"
].sort();
_helpers.Report("Fields defined. Found " + allKeys.length + " common fields.");

// 2. Show user dialogs
_helpers.Report("Step 2: Showing user dialogs...");
const fieldA = await _ui.showInputDialog({ input: "select", message: "Field A", options: allKeys, settingsKey: "fieldA", defaultValue: "artist" });
if (!fieldA) { _helpers.Report("Cancelled by user."); return; }

const fieldB = await _ui.showInputDialog({ input: "select", message: "Field B", options: allKeys, settingsKey: "fieldB", defaultValue: "extra1" });
if (!fieldB) { _helpers.Report("Cancelled by user."); return; }

const mode = await _ui.showInputDialog({ input: "select", message: "Mode", options: ["Matching", "Not matching"], settingsKey: "mode", defaultValue: "Not matching" });
if (!mode) { _helpers.Report("Cancelled by user."); return; }

const scope = await _ui.showInputDialog({ input: "select", message: "Scope", options: ["All tracks", "Current view", "Selected tracks"], settingsKey: "scope", defaultValue: "All tracks" });
if (!scope) { _helpers.Report("Cancelled by user."); return; }

const trimWhitespace = await _ui.showInputDialog({ input: "select", message: "Trim whitespace?", options: ["true", "false"], settingsKey: "trim", defaultValue: "true" });
if (!trimWhitespace) { _helpers.Report("Cancelled by user."); return; }

const emptyPolicy = await _ui.showInputDialog({ input: "select", message: "Empty handling", options: ["countAsMatch", "countAsMismatch", "exclude"], settingsKey: "emptyPolicy", defaultValue: "exclude" });
if (!emptyPolicy) { _helpers.Report("Cancelled by user."); return; }

_helpers.Report("User dialogs completed.");
const normOptions = { trim: (trimWhitespace === "true") };
const wantMatch = (mode === "Matching");

// 3. Get tracks to process
_helpers.Report("Step 3: Getting tracks for scope: " + scope);
let tracksToProcess = [];
if (scope === "Selected tracks") {
    tracksToProcess = _vars.tracksSelected || [];
} else if (scope === "Current view") {
    tracksToProcess = _vars.tracksVisible || [];
} else { // All tracks
    const totalAmount = _vars.tracksAllAmount || 1;
    let batch;
    while ((batch = await _library.track.getNextAllBatch(500)) && batch.length > 0) {
        tracksToProcess.push(...batch);
        _ui.progress(tracksToProcess.length / totalAmount);
    }
}

if (tracksToProcess.length === 0) {
    _helpers.Report("No tracks found for the selected scope. Aborting.");
    return;
}
_helpers.Report("Found " + tracksToProcess.length + " tracks to process.");

// 4. Compare tracks
_helpers.Report("Step 4: Comparing tracks...");
const resultIds = [];
let compared = 0;
let skipped = 0;

for (const track of tracksToProcess) {
    // Skip invalid tracks
    if (track && track.id !== undefined) {
        const valA = norm(safe(track, fieldA), normOptions);
        const valB = norm(safe(track, fieldB), normOptions);

        // Handle empty values based on policy
        const bothEmpty = (valA === "" && valB === "");
        const anyEmpty = (valA === "" || valB === "");

        if (emptyPolicy === "exclude" && anyEmpty) {
            skipped++;
        } else {
            let isMatch;
            if (bothEmpty) {
                isMatch = (emptyPolicy === "countAsMatch");
            } else {
                isMatch = (valA === valB);
            }

            if ((wantMatch && isMatch) || (!wantMatch && !isMatch)) {
                resultIds.push(track.id);
            }
            compared++;
        }
    }
}
_helpers.Report("Comparison finished. Compared: " + compared + ", Found: " + resultIds.length + ", Skipped: " + skipped);

// 5. Preview and confirm
if (resultIds.length === 0) {
    _helpers.Report("No matching tracks found.");
    return;
}

_helpers.Report("Found " + resultIds.length + " matching tracks.");
const confirmRun = await _ui.showInputDialog({
    input: "select",
    message: "Found " + resultIds.length + " tracks. Create playlist?",
    options: ["Yes", "No"],
    defaultValue: "Yes",
    type: "info"
});

if (confirmRun !== "Yes") {
    _helpers.Report("Playlist creation cancelled by user.");
    return;
}

// 6. Create playlist
_helpers.Report("Step 6: Creating playlist...");
const folderName = "Plugins Scholee";
let pluginFolder = _vars.playlistsAll.find(p => p && p.name === folderName && p.type === "1");

if (!pluginFolder) {
    const newFolderResult = await _library.playlist.create({ name: folderName, type: "1", parentId: null });
    pluginFolder = { id: newFolderResult.id };
    _helpers.Report("Created new folder: " + folderName);
}

const pad2 = (n) => (n < 10 ? '0' : '') + n;
const d = new Date();
const ts = d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) + " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
const playlistName = "Compare " + ts;

const playlistResult = await _library.playlist.create({
    name: playlistName,
    parentId: pluginFolder.id,
    type: "2"
});

// CRITICAL: Use _vars.playlistsAll to find the playlist, NOT _library.playlist.get()
// This is required for track assignment to work properly (see official example plugins)
const finalPlaylist = _vars.playlistsAll.find(p => p && p.id === playlistResult.id);
if (finalPlaylist) {
    finalPlaylist.trackIds = resultIds;
    _helpers.Report("SUCCESS: Created playlist '" + playlistName + "' with " + resultIds.length + " tracks.");
} else {
    _helpers.Report("ERROR: Could not find newly created playlist in _vars.playlistsAll to assign tracks.");
}

_ui.progress(1);
_helpers.Report("Plugin execution finished.");
