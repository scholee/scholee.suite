# Compare Fields - Lexicon DJ Plugin

[![Version](https://img.shields.io/badge/version-3.0.8-blue.svg)](https://github.com/scholee/scholee.suite/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Lexicon DJ](https://img.shields.io/badge/Lexicon%20DJ-Plugin-orange.svg)](https://www.lexicondj.com)

A powerful plugin to compare track fields and automatically create playlists with the results.

**Version:** 3.0.8  
**Author:** Joël Kuhn  
**Status:** ✅ Stable & Production-Ready

---

## 📋 Features

### Core Features
- ✅ **Field Comparison**: Compare any two track fields (e.g., Artist vs. Extra1)
- ✅ **Flexible Modes**: "Matching" (same values) or "Not matching" (different values)
- ✅ **Three Scopes**: All tracks, Current view, Selected tracks
- ✅ **Smart Empty Handling**: Three policies for empty fields
- ✅ **Whitespace Trimming**: Optionally remove leading/trailing whitespace
- ✅ **Auto-Playlist**: Creates timestamped playlist in "Plugins Scholee" folder
- ✅ **Progress Tracking**: Real-time updates for large libraries

### Comparable Fields

**All fields based on official Lexicon API documentation:**

**Basic Metadata:**
`id`, `type`, `title`, `artist`, `albumTitle`, `label`, `remixer`, `mix`, `composer`, `producer`, `grouping`, `lyricist`, `comment`

**Musical Properties:**
`key`, `genre`, `bpm`, `year`

**Ratings & Colors:**
`rating`, `color`

**Technical Properties:**
`duration`, `bitrate`, `sizeBytes`, `sampleRate`, `fileType`

**Play Statistics:**
`playCount`, `lastPlayed`

**Dates:**
`dateAdded`, `dateModified`

**File Information:**
`location`, `locationUnique`

**Track Numbers:**
`trackNumber`

**Energy/Mood Analysis:**
`energy`, `danceability`, `popularity`, `happiness`

**Custom Fields:**
`extra1`, `extra2`

**Advanced Features (read-only):**
`tags`, `importSource`, `tempomarkers`, `cuepoints`, `incoming`, `archived`, `archivedSince`, `beatshiftCase`, `fingerprint`, `streamingService`, `streamingId`

**Total:** 48 fields available for comparison

> **Note:** Some fields are read-only and belong to file properties (location, bitrate, etc.)

---

## 🚀 Usage

### 1. Start Plugin
**Plugins → Compare Fields → Run**

### 2. Complete Dialogs

| Dialog | Description | Example |
|--------|-------------|---------|
| **Field A** | First comparison field | `artist` |
| **Field B** | Second comparison field | `extra1` |
| **Mode** | Matching (equal) or Not matching (different) | `Not matching` |
| **Scope** | Data source | `All tracks` |
| **Trim whitespace** | Ignore whitespace? | `true` |
| **Empty handling** | Behavior for empty fields | `exclude` |

### 3. Confirmation
- Preview shows number of tracks found
- "Yes" → Playlist is created
- "No" → Cancel without changes

### 4. Result
Playlist is created at: **Plugins Scholee / Compare YYYY-MM-DD HH:mm:ss**

---

## 📊 Empty-Handling Policies

| Policy | Behavior |
|--------|----------|
| **exclude** | Tracks with empty fields are skipped (recommended) |
| **countAsMatch** | Both fields empty = Match |
| **countAsMismatch** | Both fields empty = Mismatch |

---

## 💡 Usage Examples

### Example 1: Validate Tags
**Goal:** Find tracks where Artist and Extra1 are different
```
Field A: artist
Field B: extra1
Mode: Not matching
Scope: All tracks
Result: Tracks with different values in both fields
```

### Example 2: Find Duplicates
**Goal:** Find tracks with same title but different artist
```
Field A: title
Field B: artist
Mode: Matching (for title check in two passes)
```

### Example 3: Metadata Cleanup
**Goal:** Find tracks where Comment and Grouping are identical
```
Field A: comment
Field B: grouping
Mode: Matching
Scope: Selected tracks
Result: Potential cleanup candidates
```

---

## ⚙️ Technical Details

### Performance
- **Chunked Processing**: 500 tracks per batch
- **Progress Updates**: Real-time progress for "All tracks"
- **Memory Efficient**: Only track IDs in result

### API Integration
- Uses `_library.track.getNextAllBatch()` for large libraries
- Uses `_vars.playlistsAll` for playlist manipulation
- Compatible with Lexicon Plugin API v2.x

### Code Quality
- ✅ 0 Linter errors
- ✅ Modern ES6+ syntax (const/let, arrow functions, for...of)
- ✅ Top-level await support
- ✅ No continue/break statements (Lexicon compatibility)

---

## 🐛 Troubleshooting

### Plugin doesn't start
- **Restart Lexicon**
- **Check logs**: `Logs/scholee.suite/Compare Fields.log`

### No tracks found
- **Check scope**: Are there tracks in "Selected" or "Current view"?
- **Empty handling**: "exclude" skips empty fields

### Playlist not created
- **Check permissions**: Plugin requires `playlist.create` permission
- **_vars.playlistsAll**: Lexicon must have updated playlist list

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for details on all versions.

### Version 3.0.8 (2025-10-13) - Current
✅ **Fixed scope loading issues**
- 🐛 Fixed: "All tracks" now works correctly
- 🐛 Fixed: "Current view" now works correctly
- ✅ Changed: `getNextAllBatch(500)` → `getNextAllBatch()` (correct API usage)
- ✅ Changed: `_vars.tracksVisible` → `_vars.tracksView` (correct variable)
- ✅ Added: "view" permission for "Current view" scope
- ✅ Added: Better logging/reporting for debugging
- **Status: All three scopes now working** 🎉

---

## 📞 Support

**Author:** Joël Kuhn  
**Discord:** joelkuhn  
**Email:** joelkuhn@hotmail.com

For questions or issues:
- 💬 **Discord:** joelkuhn (preferred)
- 🐛 **GitHub Issues:** [Report a bug](https://github.com/scholee/scholee.suite/issues)
- 📧 **Email:** joelkuhn@hotmail.com

---

## 🚀 Installation

1. Download the latest release from [Releases](https://github.com/scholee/scholee.suite/releases)
2. Extract to your Lexicon Plugins folder:
   - **macOS:** `~/Documents/Lexicon/Plugins/`
   - **Windows:** `%USERPROFILE%\Documents\Lexicon\Plugins\`
3. Restart Lexicon or reload plugins
4. Find plugin under **Plugins → Compare Fields**

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- 🐛 Report bugs via [Issues](https://github.com/scholee/scholee.suite/issues)
- 💡 Suggest features
- 🔀 Submit Pull Requests

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Thank you for using! 🎵**
