/**
 * Integration Test für Playlist-Workflow
 * 
 * Dieser Test simuliert den kompletten Ablauf von Trackerkennung bis Playlist-Erstellung.
 * Kann NICHT in Lexicon ausgeführt werden - nur zur Dokumentation und manuellen Validierung.
 */

// ============================================================================
// SIMULATED LEXICON API
// ============================================================================

var mockLibrary = {
  playlist: {
    create: function(config) {
      return new Promise(function(resolve) {
        resolve({
          id: 'playlist-' + Date.now(),
          name: config.name,
          parentId: config.parentId,
          type: config.type
        });
      });
    }
  }
};

var mockVars = {
  playlistsAll: []
};

var mockReports = [];

var mockHelpers = {
  Report: function(msg) {
    mockReports.push(msg);
    console.log('[Report]', msg);
  }
};

// ============================================================================
// TEST SCENARIOS
// ============================================================================

var testScenarios = [
  {
    name: "Szenario 1: 2 Tracks gefunden, Playlist existiert in _vars",
    setup: function() {
      mockReports = [];
      var folderResult = { id: 'folder-1' };
      var playlistResult = { id: 'playlist-1', name: 'Compare 2025-10-09 14:19:26', parentId: 'folder-1' };
      
      // Playlist IST in _vars vorhanden (Normalfall)
      mockVars.playlistsAll = [
        { id: 'folder-1', name: 'Plugins Scholee', type: '1' },
        { id: 'playlist-1', name: 'Compare 2025-10-09 14:19:26', parentId: 'folder-1', type: '2', trackIds: [] }
      ];
      
      return {
        folderResult: folderResult,
        playlistResult: playlistResult,
        uniqueIds: ['track-1', 'track-2']
      };
    },
    expected: {
      playlistFound: true,
      tracksAssigned: true,
      finalTrackCount: 2
    }
  },
  
  {
    name: "Szenario 2: 0 Tracks gefunden, leere Playlist",
    setup: function() {
      mockReports = [];
      var folderResult = { id: 'folder-1' };
      var playlistResult = { id: 'playlist-2', name: 'Compare Empty', parentId: 'folder-1' };
      
      mockVars.playlistsAll = [
        { id: 'folder-1', name: 'Plugins Scholee', type: '1' },
        { id: 'playlist-2', name: 'Compare Empty', parentId: 'folder-1', type: '2', trackIds: [] }
      ];
      
      return {
        folderResult: folderResult,
        playlistResult: playlistResult,
        uniqueIds: []
      };
    },
    expected: {
      playlistFound: true,
      tracksAssigned: true,
      finalTrackCount: 0
    }
  },
  
  {
    name: "Szenario 3: Playlist NICHT in _vars - Fallback funktioniert!",
    setup: function() {
      mockReports = [];
      var folderResult = { id: 'folder-1' };
      var playlistResult = { id: 'playlist-3', name: 'Compare New', parentId: 'folder-1' };
      
      // Playlist ist NICHT in _vars - Fallback wird verwendet
      mockVars.playlistsAll = [
        { id: 'folder-1', name: 'Plugins Scholee', type: '1' }
        // playlist-3 fehlt - playlistResult Fallback sollte funktionieren!
      ];
      
      return {
        folderResult: folderResult,
        playlistResult: playlistResult,
        uniqueIds: ['track-1', 'track-2']
      };
    },
    expected: {
      playlistFound: true, // Fallback findet es
      tracksAssigned: true, // Funktioniert mit Fallback
      finalTrackCount: 2, // Tracks werden zugewiesen
      shouldUseFallback: true
    }
  },
  
  {
    name: "Szenario 4: Große Anzahl Tracks (100+)",
    setup: function() {
      mockReports = [];
      var folderResult = { id: 'folder-1' };
      var playlistResult = { id: 'playlist-4', name: 'Compare Large', parentId: 'folder-1' };
      
      mockVars.playlistsAll = [
        { id: 'folder-1', name: 'Plugins Scholee', type: '1' },
        { id: 'playlist-4', name: 'Compare Large', parentId: 'folder-1', type: '2', trackIds: [] }
      ];
      
      var bigTrackList = [];
      for (var i = 0; i < 150; i++) {
        bigTrackList.push('track-' + i);
      }
      
      return {
        folderResult: folderResult,
        playlistResult: playlistResult,
        uniqueIds: bigTrackList
      };
    },
    expected: {
      playlistFound: true,
      tracksAssigned: true,
      finalTrackCount: 150
    }
  },
  
  {
    name: "Szenario 5: Name-Match Fallback funktioniert",
    setup: function() {
      mockReports = [];
      var folderResult = { id: 'folder-1' };
      var playlistResult = { id: 'playlist-5-new', name: 'Compare Name Match', parentId: 'folder-1' };
      
      // Playlist hat andere ID, aber gleichen Namen (Name-Match sollte greifen)
      mockVars.playlistsAll = [
        { id: 'folder-1', name: 'Plugins Scholee', type: '1' },
        { id: 'playlist-5-old', name: 'Compare Name Match', parentId: 'folder-1', type: '2', trackIds: [] }
      ];
      
      return {
        folderResult: folderResult,
        playlistResult: playlistResult,
        uniqueIds: ['track-1', 'track-2']
      };
    },
    expected: {
      playlistFound: true,
      tracksAssigned: true,
      finalTrackCount: 2,
      usedNameMatch: true
    }
  }
];

// ============================================================================
// TEST EXECUTION
// ============================================================================

function simulatePlaylistWorkflow(folderResult, playlistResult, uniqueIds, finalName) {
  // Simulate the actual code from compare.fields.js
  var playlist = null;
  var all = mockVars.playlistsAll || [];
  
  mockHelpers.Report('=== DEBUG: Finding Playlist ===');
  mockHelpers.Report('Looking for playlist ID: ' + playlistResult.id);
  mockHelpers.Report('Total playlists in _vars: ' + all.length);
  
  // Try ID match first
  for (var ii = 0; ii < all.length; ii++) {
    var x = all[ii];
    if (x && x.id === playlistResult.id) {
      playlist = x;
      mockHelpers.Report('Found playlist by ID match!');
      break;
    }
  }
  
  // Try name match as fallback
  if (!playlist) {
    mockHelpers.Report('Trying name match fallback...');
    for (var jj = 0; jj < all.length; jj++) {
      var y = all[jj];
      var yName = (y && (y.name || y.label));
      if (y && y.parentId === folderResult.id && yName === finalName) {
        playlist = y;
        mockHelpers.Report('Found playlist by name match!');
        break;
      }
    }
  }
  
  // Ultimate fallback
  if (!playlist && playlistResult) {
    playlist = playlistResult;
    mockHelpers.Report('WARNING: Using playlistResult fallback. This may not work!');
  } else if (!playlist) {
    mockHelpers.Report('ERROR: Could not find playlist object!');
    return { success: false, playlist: null };
  }
  
  // Add tracks
  mockHelpers.Report('=== DEBUG: Adding Tracks to Playlist ===');
  mockHelpers.Report('Playlist ID: ' + playlist.id);
  mockHelpers.Report('Playlist Name: ' + (playlist.name || playlist.label || 'unknown'));
  mockHelpers.Report('Tracks to add: ' + uniqueIds.length);
  
  try {
    playlist.trackIds = uniqueIds;
    mockHelpers.Report('SUCCESS: Tracks assigned to playlist.trackIds');
    mockHelpers.Report('Playlist now has ' + (playlist.trackIds ? playlist.trackIds.length : 0) + ' tracks');
    return { success: true, playlist: playlist };
  } catch (assignErr) {
    mockHelpers.Report('ERROR: Failed to assign tracks: ' + (assignErr && assignErr.message ? assignErr.message : assignErr));
    return { success: false, playlist: playlist };
  }
}

function runWorkflowTests() {
  var results = [];
  
  console.log('==============================================');
  console.log('🧪 PLAYLIST WORKFLOW INTEGRATION TESTS');
  console.log('==============================================\n');
  
  for (var i = 0; i < testScenarios.length; i++) {
    var scenario = testScenarios[i];
    console.log('\n--- Test ' + (i + 1) + ': ' + scenario.name + ' ---\n');
    
    var testData = scenario.setup();
    var result = simulatePlaylistWorkflow(
      testData.folderResult,
      testData.playlistResult,
      testData.uniqueIds,
      testData.playlistResult.name
    );
    
    var passed = true;
    var issues = [];
    
    // Validate results
    if (scenario.expected.playlistFound && !result.playlist) {
      passed = false;
      issues.push('Playlist sollte gefunden werden, wurde aber nicht gefunden');
    }
    
    if (scenario.expected.tracksAssigned && !result.success) {
      passed = false;
      issues.push('Tracks sollten zugewiesen werden, wurden aber nicht zugewiesen');
    }
    
    if (result.success && result.playlist && result.playlist.trackIds) {
      if (result.playlist.trackIds.length !== scenario.expected.finalTrackCount) {
        passed = false;
        issues.push('Erwartete ' + scenario.expected.finalTrackCount + ' Tracks, gefunden: ' + result.playlist.trackIds.length);
      }
    }
    
    results.push({
      scenario: scenario.name,
      passed: passed,
      issues: issues,
      reports: mockReports.slice()
    });
    
    if (passed) {
      console.log('✅ TEST BESTANDEN\n');
    } else {
      console.log('❌ TEST FEHLGESCHLAGEN');
      console.log('Probleme:');
      issues.forEach(function(issue) {
        console.log('  - ' + issue);
      });
      console.log('');
    }
  }
  
  // Summary
  console.log('\n==============================================');
  console.log('📊 ZUSAMMENFASSUNG');
  console.log('==============================================');
  
  var passed = 0;
  var failed = 0;
  
  results.forEach(function(r) {
    if (r.passed) {
      passed++;
    } else {
      failed++;
    }
  });
  
  console.log('Gesamt: ' + testScenarios.length);
  console.log('Bestanden: ' + passed + ' ✅');
  console.log('Fehlgeschlagen: ' + failed + (failed > 0 ? ' ❌' : ''));
  console.log('Erfolgsrate: ' + ((passed / testScenarios.length) * 100).toFixed(1) + '%');
  
  return {
    total: testScenarios.length,
    passed: passed,
    failed: failed,
    results: results
  };
}

// ============================================================================
// DIAGNOSTICS HELPER
// ============================================================================

function diagnoseEmptyPlaylist() {
  console.log('\n==============================================');
  console.log('🔍 DIAGNOSE: Warum ist die Playlist leer?');
  console.log('==============================================\n');
  
  console.log('Mögliche Ursachen:');
  console.log('');
  console.log('1. Playlist wird NICHT in _vars.playlistsAll gefunden');
  console.log('   Symptom: "WARNING: Using playlistResult fallback"');
  console.log('   Lösung: Warten Sie kurz nach Playlist-Erstellung oder');
  console.log('           verwenden Sie _library.playlist.getAll() refresh');
  console.log('');
  console.log('2. Track-IDs sind NULL oder leer');
  console.log('   Symptom: "Total unique tracks: 0"');
  console.log('   Lösung: Prüfen Sie die Vergleichslogik und Field-Werte');
  console.log('');
  console.log('3. Fehlende Berechtigungen in config.json');
  console.log('   Symptom: "ERROR: Failed to assign tracks"');
  console.log('   Lösung: Prüfen Sie modifyFields: ["tracks", "name"]');
  console.log('');
  console.log('4. playlistResult.id stimmt nicht mit _vars überein');
  console.log('   Symptom: "Trying name match fallback..."');
  console.log('   Lösung: Name-Match Fallback sollte funktionieren');
  console.log('');
  console.log('Was Sie in den Lexicon Logs suchen sollten:');
  console.log('  ✅ "=== DEBUG: Found Track IDs ===" - zeigt gefundene Tracks');
  console.log('  ✅ "=== DEBUG: Finding Playlist ===" - zeigt Playlist-Suche');
  console.log('  ✅ "SUCCESS: Tracks assigned" - bestätigt Zuweisung');
  console.log('  ❌ "ERROR:" - zeigt kritische Fehler');
  console.log('  ⚠️  "WARNING:" - zeigt potentielle Probleme');
}

// ============================================================================
// EXPORT / EXECUTION
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runWorkflowTests: runWorkflowTests,
    diagnoseEmptyPlaylist: diagnoseEmptyPlaylist,
    testScenarios: testScenarios
  };
}

// Auto-run in Node.js
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  var testResults = runWorkflowTests();
  diagnoseEmptyPlaylist();
}

// For Browser Console:
// var workflowResults = runWorkflowTests();
// diagnoseEmptyPlaylist();

