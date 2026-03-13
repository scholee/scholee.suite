// Minimal, ES5-safe. Use top-level await like the example plugins
var ACTION_NAME = "Create Playlist";
var LOG_SESSION = String(Date.now());
function logInfo(msg) { _helpers.Log("[" + ACTION_NAME + "][INFO][" + LOG_SESSION + "] " + msg); }
function logError(msg) { _helpers.Log("[" + ACTION_NAME + "][ERROR][" + LOG_SESSION + "] " + msg); }

try {
  var folderDisplayName = "Plugins Scholee";
  logInfo("Start. folderDisplayName=" + folderDisplayName);

  // Reuse existing folder (match by label/name/title) if present, otherwise create it
  var allForFolder = _vars.playlistsAll || [];
  var existingFolder = (typeof allForFolder.find === 'function') ? allForFolder.find(function(pf){
    var pfName = pf ? (pf.name!=null ? pf.name : (pf.label!=null ? pf.label : pf.title)) : null;
    return pf && pfName === folderDisplayName;
  }) : null;
  var pluginFolderResult = existingFolder ? { id: existingFolder.id } : await _library.playlist.create({
    name: folderDisplayName,
    parentId: null,
    type: "1"
  });
  logInfo(existingFolder ? ("Folder reused. id=" + existingFolder.id) : ("Folder created. id=" + pluginFolderResult.id));

  // Playlist name as timestamp: "Select YYYY-MM-DD HH:mm"
  function pad2(n){ return (n<10?('0'+n):String(n)); }
  var d=new Date();
  var ts=d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate())+" "+pad2(d.getHours())+":"+pad2(d.getMinutes())+":"+pad2(d.getSeconds());
  var nextName = "Select " + ts;

  var playlistResult = await _library.playlist.create({
    name: nextName,
    parentId: pluginFolderResult.id,
    type: "2"
  });
  logInfo("Playlist created. id=" + playlistResult.id + ", name=" + nextName);

  var playlist = null;
  var all = _vars.playlistsAll || [];
  playlist = (typeof all.find === 'function') ? all.find(function(x){ return x && x.id === playlistResult.id; }) : null;
  if (!playlist) {
    logError("Playlist not found in _vars.playlistsAll after create. createdId=" + playlistResult.id);
    _helpers.Report("Created playlist but could not find it in _vars.");
    return;
  }

  // Add selected tracks if any; otherwise keep it empty
  var selected = Array.isArray(_vars.tracksSelected) ? _vars.tracksSelected : [];
  var selectedCount = selected.length || 0;
  _helpers.Report('Selected tracks detected: ' + selectedCount);
  logInfo("Selected track count=" + selectedCount);
  if (selectedCount > 0) {
    // Use id field only (as in example plugin)
    playlist.trackIds = selected.map(function(x){ return x && x.id; }).filter(function(id){ return id!=null; });
    _helpers.Report('Created playlist "' + nextName + '" in Plugin Folder and added ' + playlist.trackIds.length + ' selected track(s).');
    logInfo("Tracks assigned. trackIds=" + playlist.trackIds.length);
  } else {
    playlist.trackIds = [];
    _helpers.Report('Created playlist "' + nextName + '" in Plugin Folder (no tracks selected).');
    logInfo("Created empty playlist.");
  }
  logInfo("Completed successfully.");
} catch (_unhandledError) {
  var message = "Unexpected error in create playlist action.";
  logError("Unhandled error: " + message);
  _helpers.Report("Create Playlist fehlgeschlagen: " + message);
}

