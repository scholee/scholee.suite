/**
 * Export CloudPlay Playlists - Lexicon DJ Plugin
 *
 * Exportiert alle Playlists aus einem Folder (Default: CloudPlay) als M3U8-Dateien
 * mit relativen Pfaden fuer Astiga-Import.
 *
 * @author Joel Kuhn
 * @version 1.0.0
 */

const DEFAULT_SETTINGS = {
  cloudplayFolder: "CloudPlay",
  musicLibrary: "~/Library/CloudStorage/Dropbox/Music/Music",
  targetDir: "~/Library/CloudStorage/Dropbox/Music/CloudPlaylists",
  relPathFromPlaylistToMusic: "../Music"
};

function getPlaylistName(playlist) {
  if (!playlist) return "";
  return playlist.name || playlist.label || playlist.title || "";
}

function getTrackTitle(track) {
  if (!track) return "Unknown";
  return track.title || track.name || "Unknown";
}

function getTrackArtist(track) {
  if (!track) return "Unknown Artist";
  return track.artist || track.albumArtist || "Unknown Artist";
}

function normPath(pathValue) {
  if (!pathValue) return "";
  let p = String(pathValue).trim();

  if (p.startsWith("file://")) {
    p = p.replace(/^file:\/\//, "");
  }

  try {
    p = decodeURIComponent(p);
  } catch (err) {
    // Keep original path if decode fails
  }

  p = p.replace(/\\/g, "/");
  p = p.replace(/\/+/g, "/");

  if (p.length > 1 && p.endsWith("/")) {
    p = p.slice(0, -1);
  }

  return p;
}

function expandTildeByTrackPath(pathValue, trackPath) {
  const raw = String(pathValue || "").trim();
  if (!raw.startsWith("~/")) {
    return raw;
  }

  const normalizedTrackPath = normPath(trackPath);
  const match = normalizedTrackPath.match(/^\/Users\/([^/]+)\//);
  if (!match || !match[1]) {
    return raw;
  }
  return "/Users/" + match[1] + raw.slice(1);
}

function expandTildeByTracks(pathValue, tracks) {
  const raw = String(pathValue || "").trim();
  if (!raw.startsWith("~/")) {
    return raw;
  }
  if (!Array.isArray(tracks) || tracks.length === 0) {
    return raw;
  }

  for (const track of tracks) {
    const loc = track && (track.location || track.locationUnique);
    const normalizedTrackPath = normPath(loc || "");
    const match = normalizedTrackPath.match(/^\/Users\/([^/]+)\//);
    if (match && match[1]) {
      return "/Users/" + match[1] + raw.slice(1);
    }
  }
  return raw;
}

function sanitizeFileName(name) {
  const safe = String(name || "Playlist")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, " ")
    .trim();
  return safe || "Playlist";
}

function joinPath(a, b) {
  const left = normPath(a);
  const right = String(b || "").replace(/^\/+/, "");
  if (!left) return right;
  if (!right) return left;
  return left + "/" + right;
}

function toRelativeTrackPath(trackPath, musicLibrary, relPrefix) {
  const absTrack = normPath(trackPath);
  const absMusic = normPath(expandTildeByTrackPath(musicLibrary, trackPath));
  const rel = normPath(relPrefix).replace(/^\/+/, "");

  if (!absTrack || !absMusic) {
    return null;
  }

  const musicPrefix = absMusic + "/";
  if (absTrack === absMusic) {
    return rel;
  }
  if (!absTrack.startsWith(musicPrefix)) {
    return null;
  }

  const insideMusic = absTrack.slice(musicPrefix.length).replace(/^\/+/, "");
  if (!insideMusic) {
    return null;
  }
  return joinPath(rel, insideMusic);
}

function getTrackIdsFromPlaylist(playlist) {
  if (!playlist) return [];

  if (Array.isArray(playlist.trackIds)) {
    return playlist.trackIds.filter((id) => id !== null && id !== undefined);
  }

  if (Array.isArray(playlist.tracks)) {
    return playlist.tracks
      .map((track) => (track && track.id !== undefined ? track.id : null))
      .filter((id) => id !== null);
  }

  if (Array.isArray(playlist.items)) {
    return playlist.items
      .map((item) => (item && item.id !== undefined ? item.id : null))
      .filter((id) => id !== null);
  }

  return [];
}

_helpers.Report("Export CloudPlay Playlists gestartet.");

const cloudplayFolderName = await _ui.showInputDialog({
  input: "text",
  message: "CloudPlay Folder Name",
  settingsKey: "cloudplayFolder",
  defaultValue: DEFAULT_SETTINGS.cloudplayFolder
});
if (!cloudplayFolderName) {
  _helpers.Report("Abgebrochen (Folder-Name fehlt).");
  return;
}

const musicLibrary = await _ui.showInputDialog({
  input: "text",
  message: "Music Library Path",
  settingsKey: "musicLibrary",
  defaultValue: DEFAULT_SETTINGS.musicLibrary
});
if (!musicLibrary) {
  _helpers.Report("Abgebrochen (Music Library Path fehlt).");
  return;
}

const targetDir = await _ui.showInputDialog({
  input: "text",
  message: "Export Target Directory",
  settingsKey: "targetDir",
  defaultValue: DEFAULT_SETTINGS.targetDir
});
if (!targetDir) {
  _helpers.Report("Abgebrochen (Target Directory fehlt).");
  return;
}

const relPathFromPlaylistToMusic = await _ui.showInputDialog({
  input: "text",
  message: "Relative Path (Playlist -> Music)",
  settingsKey: "relPathFromPlaylistToMusic",
  defaultValue: DEFAULT_SETTINGS.relPathFromPlaylistToMusic
});
if (!relPathFromPlaylistToMusic) {
  _helpers.Report("Abgebrochen (relativer Pfad fehlt).");
  return;
}

const allPlaylists = Array.isArray(_vars.playlistsAll) ? _vars.playlistsAll : [];
const sourceFolder = allPlaylists.find((playlist) => {
  const name = getPlaylistName(playlist);
  return playlist && playlist.type === "1" && name === cloudplayFolderName;
});

if (!sourceFolder) {
  _helpers.Report('Folder "' + cloudplayFolderName + '" nicht gefunden.');
  return;
}

const exportCandidates = allPlaylists.filter((playlist) => {
  const isChild = playlist && playlist.parentId === sourceFolder.id;
  const isPlaylistOrSmartlist = playlist && (playlist.type === "2" || playlist.type === "3");
  return isChild && isPlaylistOrSmartlist;
});

if (exportCandidates.length === 0) {
  _helpers.Report('Keine Playlists unter "' + cloudplayFolderName + '" gefunden.');
  return;
}

_helpers.Report("Lade Track-Index...");
const allTracks = [];
const totalAmount = _vars.tracksAllAmount || 1;
let batch;
while ((batch = await _library.track.getNextAllBatch()) && batch.length > 0) {
  allTracks.push(...batch);
  _ui.progress(Math.min(allTracks.length / totalAmount, 0.6));
}

const tracksById = {};
for (const track of allTracks) {
  if (track && track.id !== undefined && track.id !== null) {
    tracksById[String(track.id)] = track;
  }
}
const resolvedTargetDir = normPath(expandTildeByTracks(targetDir, allTracks)) || targetDir;

let exported = 0;
let skippedNoTracks = 0;
let skippedPathIssues = 0;
let totalTracksWritten = 0;

for (let i = 0; i < exportCandidates.length; i += 1) {
  const playlist = exportCandidates[i];
  const playlistName = getPlaylistName(playlist);
  const rawTrackIds = getTrackIdsFromPlaylist(playlist);

  if (!rawTrackIds.length) {
    skippedNoTracks += 1;
    _helpers.Log('Uebersprungen (keine trackIds): "' + playlistName + '"');
  } else {
    const uniqueTrackIds = [];
    const seen = {};
    for (const trackId of rawTrackIds) {
      const key = String(trackId);
      if (!seen[key]) {
        seen[key] = true;
        uniqueTrackIds.push(key);
      }
    }

    const lines = ["#EXTM3U"];
    let playlistTracksWritten = 0;

    for (const trackId of uniqueTrackIds) {
      const track = tracksById[trackId];
      if (!track) {
        _helpers.Log('Track nicht im Index gefunden: "' + trackId + '"');
      } else {
        const relTrackPath = toRelativeTrackPath(
          track.location || track.locationUnique || "",
          musicLibrary,
          relPathFromPlaylistToMusic
        );

        if (!relTrackPath) {
          skippedPathIssues += 1;
          _helpers.Log(
            'Pfad nicht relativ aufloesbar fuer Track "' +
              getTrackArtist(track) +
              " - " +
              getTrackTitle(track) +
              '"'
          );
        } else {
          lines.push("#EXTINF:NaN," + getTrackArtist(track) + " - " + getTrackTitle(track));
          lines.push(relTrackPath);
          playlistTracksWritten += 1;
        }
      }
    }

    if (playlistTracksWritten === 0) {
      skippedNoTracks += 1;
      _helpers.Log('Uebersprungen (0 exportierbare Tracks): "' + playlistName + '"');
    } else {
      const fileName = sanitizeFileName(playlistName) + ".m3u8";
      const filePath = joinPath(resolvedTargetDir, fileName);
      try {
        await _files.write(filePath, lines.join("\n") + "\n");
      } catch (writeErr) {
        // Fallback for environments where absolute writes are restricted.
        await _files.write(fileName, lines.join("\n") + "\n");
        _helpers.Log(
          'Konnte nicht nach "' +
            filePath +
            '" schreiben. Fallback auf Plugin-Ordner fuer "' +
            fileName +
            '".'
        );
      }

      exported += 1;
      totalTracksWritten += playlistTracksWritten;
      _helpers.Report('Exportiert: "' + playlistName + '" (' + playlistTracksWritten + " Tracks)");
    }
    _ui.progress(0.6 + ((i + 1) / exportCandidates.length) * 0.4);
  }
}

_ui.progress(1);
_helpers.Report("Export abgeschlossen.");
_helpers.Report(
  "Playlists exportiert: " +
    exported +
    ", Tracks geschrieben: " +
    totalTracksWritten +
    ", uebersprungen (keine Tracks): " +
    skippedNoTracks +
    ", uebersprungen (Pfadproblem): " +
    skippedPathIssues
);
