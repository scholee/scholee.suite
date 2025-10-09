// Minimal, ES5-safe. Use top-level await like the example plugins
var folderDisplayName = "Plugins Scholee";

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

var playlist = null;
var all = _vars.playlistsAll || [];
playlist = (typeof all.find === 'function') ? all.find(function(x){ return x && x.id === playlistResult.id; }) : null;
if (!playlist) { _helpers.Report("Created playlist but could not find it in _vars."); return; }

// Add selected tracks if any; otherwise keep it empty
var selected = Array.isArray(_vars.tracksSelected) ? _vars.tracksSelected : [];
var selectedCount = selected.length || 0;
_helpers.Report('Selected tracks detected: ' + selectedCount);
if (selectedCount > 0) {
  // Use id field only (as in example plugin)
  playlist.trackIds = selected.map(function(x){ return x && x.id; }).filter(function(id){ return id!=null; });
  _helpers.Report('Created playlist "' + nextName + '" in Plugin Folder and added ' + playlist.trackIds.length + ' selected track(s).');
} else {
  playlist.trackIds = [];
  _helpers.Report('Created playlist "' + nextName + '" in Plugin Folder (no tracks selected).');
}

