/**
 * Test Suite für Compare Fields Plugin - Edge Cases
 * 
 * Diese Datei ist NICHT für die Ausführung in Lexicon gedacht.
 * Sie dient zur Dokumentation und manuellen Validierung von Edge Cases.
 */

// ============================================================================
// TEST HELPER FUNCTIONS
// ============================================================================

/**
 * Simuliert die norm() Funktion aus compare.fields.js
 */
function norm(v, opt) {
  var s = (v == null) ? "" : String(v);
  if (opt.trim) {
    s = s.trim();
  }
  return s;
}

/**
 * Simuliert die safe() Funktion aus compare.fields.js
 */
function safe(o, k) {
  if (!o) {
    return "";
  }
  if (k.indexOf('.') === -1) {
    return (o[k] !== undefined && o[k] !== null) ? o[k] : "";
  }
  var parts = k.split('.');
  var acc = o;
  for (var i = 0; i < parts.length; i++) {
    var p2 = parts[i];
    if (acc && typeof acc === 'object' && acc[p2] !== undefined) {
      acc = acc[p2];
    } else {
      return "";
    }
  }
  return (acc !== undefined && acc !== null) ? acc : "";
}

/**
 * Simuliert die Vergleichslogik
 */
function compareFields(track, fieldA, fieldB, opt, wantMatch, emptyPolicy) {
  var aRaw = safe(track, fieldA);
  var bRaw = safe(track, fieldB);
  
  // Normalize first, then check if empty (respects trim option)
  var a = norm(aRaw, opt);
  var b = norm(bRaw, opt);
  var aEmpty = (a === "");
  var bEmpty = (b === "");
  
  var emptyAsMatch = (emptyPolicy === "countAsMatch");
  var emptyExclude = (emptyPolicy === "exclude");
  
  // Handle empty fields according to policy
  if (emptyExclude && (aEmpty || bEmpty)) {
    return { included: false, skipped: true };
  }
  
  var isMatch;
  
  // Determine if values match
  if (a === "" && b === "") {
    isMatch = emptyAsMatch;
  } else {
    isMatch = (a === b);
  }
  
  // Add to results if criteria met
  var included = (wantMatch && isMatch) || (!wantMatch && !isMatch);
  return { included: included, skipped: false, a: a, b: b, isMatch: isMatch };
}

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

var tests = [];

// TEST 1: Null-Werte
tests.push({
  name: "Null-Werte in beiden Feldern",
  track: { id: 1, artist: null, title: null },
  fieldA: "artist",
  fieldB: "title",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "countAsMatch",
  expected: { included: true, skipped: false }
});

tests.push({
  name: "Null vs Undefined",
  track: { id: 2, artist: null, title: undefined },
  fieldA: "artist",
  fieldB: "title",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "countAsMatch",
  expected: { included: true, skipped: false }
});

// TEST 2: Empty Strings
tests.push({
  name: "Empty Strings - countAsMatch",
  track: { id: 3, artist: "", title: "" },
  fieldA: "artist",
  fieldB: "title",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "countAsMatch",
  expected: { included: true, skipped: false }
});

tests.push({
  name: "Empty Strings - countAsMismatch",
  track: { id: 4, artist: "", title: "" },
  fieldA: "artist",
  fieldB: "title",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "countAsMismatch",
  expected: { included: false, skipped: false }
});

tests.push({
  name: "Empty Strings - exclude",
  track: { id: 5, artist: "", title: "" },
  fieldA: "artist",
  fieldB: "title",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "exclude",
  expected: { included: false, skipped: true }
});

// TEST 3: Whitespace-Handling
tests.push({
  name: "Trim whitespace - führende/nachfolgende Leerzeichen",
  track: { id: 6, artist: "  Hello  ", title: "Hello" },
  fieldA: "artist",
  fieldB: "title",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "countAsMismatch",
  expected: { included: true, skipped: false }
});

tests.push({
  name: "Ohne Trim - führende/nachfolgende Leerzeichen",
  track: { id: 7, artist: "  Hello  ", title: "Hello" },
  fieldA: "artist",
  fieldB: "title",
  opt: { trim: false },
  wantMatch: true,
  emptyPolicy: "countAsMismatch",
  expected: { included: false, skipped: false }
});

tests.push({
  name: "Nur Leerzeichen in beiden Feldern - trim true",
  track: { id: 8, artist: "   ", title: "   " },
  fieldA: "artist",
  fieldB: "title",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "countAsMatch",
  expected: { included: true, skipped: false }
});

tests.push({
  name: "Nur Leerzeichen in einem Feld - exclude",
  track: { id: 9, artist: "   ", title: "Test" },
  fieldA: "artist",
  fieldB: "title",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "exclude",
  expected: { included: false, skipped: true }
});

// TEST 4: Verschiedene Datentypen
tests.push({
  name: "Number vs String",
  track: { id: 10, bpm: 120, extra1: "120" },
  fieldA: "bpm",
  fieldB: "extra1",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "countAsMismatch",
  expected: { included: true, skipped: false }
});

tests.push({
  name: "Boolean vs String",
  track: { id: 11, custom: true, extra1: "true" },
  fieldA: "custom",
  fieldB: "extra1",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "countAsMismatch",
  expected: { included: true, skipped: false }
});

tests.push({
  name: "Number 0 vs Empty String",
  track: { id: 12, rating: 0, extra1: "" },
  fieldA: "rating",
  fieldB: "extra1",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "countAsMatch",
  expected: { included: false, skipped: false }
});

// TEST 5: Fehlende Felder
tests.push({
  name: "Feld existiert nicht - countAsMatch",
  track: { id: 13, artist: "Test" },
  fieldA: "artist",
  fieldB: "nonExistentField",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "countAsMatch",
  expected: { included: false, skipped: false }
});

tests.push({
  name: "Beide Felder existieren nicht - countAsMatch",
  track: { id: 14, artist: "Test" },
  fieldA: "nonExistentField1",
  fieldB: "nonExistentField2",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "countAsMatch",
  expected: { included: true, skipped: false }
});

tests.push({
  name: "Feld existiert nicht - exclude",
  track: { id: 15, artist: "Test" },
  fieldA: "artist",
  fieldB: "nonExistentField",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "exclude",
  expected: { included: false, skipped: true }
});

// TEST 6: Sonderzeichen
tests.push({
  name: "Unicode-Zeichen",
  track: { id: 16, artist: "Café", title: "Café" },
  fieldA: "artist",
  fieldB: "title",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "countAsMismatch",
  expected: { included: true, skipped: false }
});

tests.push({
  name: "Emojis",
  track: { id: 17, artist: "DJ 🎵", title: "DJ 🎵" },
  fieldA: "artist",
  fieldB: "title",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "countAsMismatch",
  expected: { included: true, skipped: false }
});

tests.push({
  name: "Newlines und Tabs",
  track: { id: 18, artist: "Hello\nWorld", title: "Hello\tWorld" },
  fieldA: "artist",
  fieldB: "title",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "countAsMismatch",
  expected: { included: false, skipped: false }
});

// TEST 7: Case Sensitivity
tests.push({
  name: "Case Sensitivity - unterschiedliche Groß-/Kleinschreibung",
  track: { id: 19, artist: "Hello", title: "hello" },
  fieldA: "artist",
  fieldB: "title",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "countAsMismatch",
  expected: { included: false, skipped: false }
});

tests.push({
  name: "Case Sensitivity - identische Groß-/Kleinschreibung",
  track: { id: 20, artist: "Hello", title: "Hello" },
  fieldA: "artist",
  fieldB: "title",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "countAsMismatch",
  expected: { included: true, skipped: false }
});

// TEST 8: Not Matching Mode
tests.push({
  name: "Not Matching - unterschiedliche Werte",
  track: { id: 21, artist: "Artist A", title: "Title B" },
  fieldA: "artist",
  fieldB: "title",
  opt: { trim: true },
  wantMatch: false,
  emptyPolicy: "countAsMismatch",
  expected: { included: true, skipped: false }
});

tests.push({
  name: "Not Matching - identische Werte",
  track: { id: 22, artist: "Same", title: "Same" },
  fieldA: "artist",
  fieldB: "title",
  opt: { trim: true },
  wantMatch: false,
  emptyPolicy: "countAsMismatch",
  expected: { included: false, skipped: false }
});

tests.push({
  name: "Not Matching - beide leer mit countAsMatch",
  track: { id: 23, artist: "", title: "" },
  fieldA: "artist",
  fieldB: "title",
  opt: { trim: true },
  wantMatch: false,
  emptyPolicy: "countAsMatch",
  expected: { included: false, skipped: false }
});

// TEST 9: Sehr lange Strings
tests.push({
  name: "Sehr lange identische Strings",
  track: { id: 24, artist: "A".repeat(10000), title: "A".repeat(10000) },
  fieldA: "artist",
  fieldB: "title",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "countAsMismatch",
  expected: { included: true, skipped: false }
});

tests.push({
  name: "Sehr lange unterschiedliche Strings",
  track: { id: 25, artist: "A".repeat(10000), title: "B".repeat(10000) },
  fieldA: "artist",
  fieldB: "title",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "countAsMismatch",
  expected: { included: false, skipped: false }
});

// TEST 10: Nested Dot-Notation (sollte mit safe() funktionieren)
tests.push({
  name: "Nested Field - existiert",
  track: { id: 26, metadata: { genre: "Rock" }, extra1: "Rock" },
  fieldA: "metadata.genre",
  fieldB: "extra1",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "countAsMismatch",
  expected: { included: true, skipped: false }
});

tests.push({
  name: "Nested Field - existiert nicht",
  track: { id: 27, metadata: { genre: "Rock" }, extra1: "Rock" },
  fieldA: "metadata.nonExistent",
  fieldB: "extra1",
  opt: { trim: true },
  wantMatch: true,
  emptyPolicy: "exclude",
  expected: { included: false, skipped: true }
});

// ============================================================================
// TEST EXECUTION
// ============================================================================

function runTests() {
  var passed = 0;
  var failed = 0;
  var results = [];
  
  for (var i = 0; i < tests.length; i++) {
    var test = tests[i];
    var result = compareFields(
      test.track,
      test.fieldA,
      test.fieldB,
      test.opt,
      test.wantMatch,
      test.emptyPolicy
    );
    
    var success = (
      result.included === test.expected.included &&
      result.skipped === test.expected.skipped
    );
    
    if (success) {
      passed++;
    } else {
      failed++;
    }
    
    results.push({
      testName: test.name,
      success: success,
      expected: test.expected,
      actual: result
    });
  }
  
  return {
    total: tests.length,
    passed: passed,
    failed: failed,
    results: results
  };
}

// ============================================================================
// MANUAL TEST EXECUTION (for Node.js or Browser Console)
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTests: runTests, tests: tests };
}

// For Browser Console:
// var testResults = runTests();
// console.table(testResults.results);
// console.log("Passed:", testResults.passed, "/ Failed:", testResults.failed);

// ============================================================================
// EXPECTED RESULTS SUMMARY
// ============================================================================

/*
ERWARTETE ERGEBNISSE:

Alle 27 Tests sollten bestehen (passed: 27, failed: 0)

KRITISCHE EDGE CASES:
1. Null/Undefined werden als leere Strings behandelt
2. Empty Strings verhalten sich gemäß emptyPolicy
3. Trim entfernt führende/nachfolgende Leerzeichen korrekt
4. Verschiedene Datentypen werden zu Strings konvertiert
5. Fehlende Felder werden als leere Strings behandelt
6. Unicode und Sonderzeichen werden korrekt verglichen
7. Case-Sensitivity ist standardmäßig aktiv
8. Not Matching Mode invertiert die Logik korrekt
9. Sehr lange Strings werden performant verglichen
10. Nested Dot-Notation funktioniert mit safe()

BEKANNTE LIMITIERUNGEN (nicht getestet):
- Keine ignoreCase-Option
- Keine stripDiacritics-Option (Café ≠ Cafe)
- Keine removePunctuation-Option
- Keine Regex-Replacements
- Keine collapseSpaces-Option (mehrfache Leerzeichen bleiben erhalten)
*/

