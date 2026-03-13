# Scholee Suite - Lexicon DJ Plugin Collection

[![Version](https://img.shields.io/badge/version-4.1.0-blue.svg)](https://github.com/scholee/scholee.suite/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Lexicon DJ](https://img.shields.io/badge/Lexicon%20DJ-Plugin-orange.svg)](https://www.lexicondj.com)

A powerful plugin suite for Lexicon DJ with utilities for field comparison, tag management, and metadata import.

**Version:** 4.1.0  
**Author:** Joël Kuhn  
**Status:** ✅ Stable & Production-Ready

---

## 📦 Included Actions

### 1. Compare Fields
Compare any two track fields and automatically create playlists with the results.

**Features:**
- ✅ Compare any two track fields (e.g., Artist vs. Extra1)
- ✅ Flexible Modes: "Matching" or "Not matching"
- ✅ Three Scopes: All tracks, Current view, Selected tracks
- ✅ Smart Empty Handling: Three policies for empty fields
- ✅ Whitespace Trimming
- ✅ Auto-Playlist creation with timestamp
- ✅ Progress Tracking for large libraries

### 2. Create Playlist
Quickly create timestamped playlists with selected tracks.

**Features:**
- ✅ Creates playlist in "Plugins Scholee" folder
- ✅ Automatic timestamp naming
- ✅ Adds selected tracks or creates empty playlist

### 3. Energy to Tag
Automatically adds the Energy value (0-10) as a Custom Tag.

**Features:**
- ✅ Reads Energy field value
- ✅ Adds corresponding tag from "Energy" category
- ✅ Works with selected tracks
- ✅ Skips tracks without Energy value
- ✅ Avoids duplicate tags

### 4. Import Lyricist Tags
Imports comma-separated values from LYRICIST field as Custom Tags (perfect for Onetagger workflow).

**Features:**
- ✅ Parses comma-separated values from LYRICIST field
- ✅ Uses existing tags from "Genre & Style" if available
- ✅ Creates new tags in "Imported Tags" for unknown values
- ✅ Clears LYRICIST field after import
- ✅ Case-insensitive matching
- ✅ Automatic whitespace trimming

### 5. Export CloudPlay Playlists
Exports playlists from a Lexicon folder (default: `CloudPlay`) as M3U8 files with relative paths for Astiga.

**Features:**
- ✅ Exports all playlists and smartlists below a source folder
- ✅ Writes `#EXTINF:NaN,Artist - Title` entries
- ✅ Relative paths via configurable base (`../Music` by default)
- ✅ Configurable source folder, music library path, and target directory
- ✅ M3U8 filename sanitization for safe export

---

## 📋 Compare Fields - Detailed Features

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

## 🚀 Quick Start

### Prerequisites
- Lexicon DJ must be running
- Enable API in Lexicon settings under _Integrations_ (for advanced features)

### Usage by Action

#### Compare Fields
1. **Plugins → Compare Fields → Run**
2. Complete dialogs (Field A, Field B, Mode, Scope, etc.)
3. Confirm to create playlist
4. Result: **Plugins Scholee / Compare YYYY-MM-DD HH:mm:ss**

#### Create Playlist
1. Select tracks (optional)
2. **Plugins → Create Playlist → Run**
3. Result: **Plugins Scholee / Select YYYY-MM-DD HH:mm:ss**

#### Energy to Tag
1. Select tracks with Energy values
2. **Plugins → Energy to Tag → Run**
3. Energy value (0-10) added as tag in "Energy" category

#### Import Lyricist Tags
1. Select tracks with comma-separated values in LYRICIST field
2. **Plugins → Import Lyricist Tags → Run**
3. Tags are imported and LYRICIST field is cleared

#### Export CloudPlay Playlists
1. **Plugins → Export CloudPlay Playlists → Run**
2. Confirm/adapt dialogs:
   - CloudPlay Folder Name (`CloudPlay`)
   - Music Library Path (`~/Library/CloudStorage/Dropbox/Music/Music`)
   - Export Target Directory (`~/Library/CloudStorage/Dropbox/Music/CloudPlaylists`)
   - Relative Path (Playlist -> Music) (`../Music`)
3. Result: one `.m3u8` file per playlist in target directory

---

## 📖 Detailed Documentation

### Compare Fields - Configuration

| Dialog | Description | Example |
|--------|-------------|---------|
| **Field A** | First comparison field | `artist` |
| **Field B** | Second comparison field | `extra1` |
| **Mode** | Matching (equal) or Not matching (different) | `Not matching` |
| **Scope** | Data source | `All tracks` |
| **Trim whitespace** | Ignore whitespace? | `true` |
| **Empty handling** | Behavior for empty fields | `exclude` |

---

## 📊 Empty-Handling Policies

| Policy | Behavior |
|--------|----------|
| **exclude** | Tracks with empty fields are skipped (recommended) |
| **countAsMatch** | Both fields empty = Match |
| **countAsMismatch** | Both fields empty = Mismatch |

---

## 💡 Usage Examples

### Compare Fields Examples

#### Example 1: Validate Tags
**Goal:** Find tracks where Artist and Extra1 are different
```
Field A: artist
Field B: extra1
Mode: Not matching
Scope: All tracks
Result: Tracks with different values in both fields
```

#### Example 2: Find Duplicates
**Goal:** Find tracks with same title but different artist
```
Field A: title
Field B: artist
Mode: Matching (for title check in two passes)
```

#### Example 3: Metadata Cleanup
**Goal:** Find tracks where Comment and Grouping are identical
```
Field A: comment
Field B: grouping
Mode: Matching
Scope: Selected tracks
Result: Potential cleanup candidates
```

### Import Lyricist Tags Example

**Onetagger Workflow:**
1. Tag tracks with Onetagger, write genres to LYRICIST field
2. Import to Lexicon
3. Select tracks with LYRICIST data
4. Run **Import Lyricist Tags**
5. Result: Tags imported, LYRICIST field cleared

**Example:**
```
Before: LYRICIST = "House,Tech House,Minimal Techno"
After:  LYRICIST = "" (cleared)
        Tags: House, Tech House, Minimal Techno (added to track)
```

### Energy to Tag Example

**Workflow:**
1. Analyze tracks with Lexicon (Energy 0-10)
2. Select tracks to tag
3. Run **Energy to Tag**
4. Result: Energy value added as tag

**Example:**
```
Track: Air - Kelly Watch The Stars
Energy: 5
Result: Tag "5" added from "Energy" category
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
- **Check logs**: `Logs/scholee.suite/<Action Name>.log`
- **Verify config.json** syntax

### Compare Fields: No tracks found
- **Check scope**: Are there tracks in "Selected" or "Current view"?
- **Empty handling**: "exclude" skips empty fields

### Compare Fields: Playlist not created
- **Check permissions**: Plugin requires `playlist.create` permission
- **_vars.playlistsAll**: Lexicon must have updated playlist list

### Energy to Tag: Error "Category not found"
- **Create Category**: Custom Tag Category "Energy" must exist
- **Create Tags**: Tags "0" through "10" must exist in category

### Import Lyricist Tags: Error "Category not found"
- **Create Categories**: Both "Genre & Style" and "Imported Tags" must exist
- **Check spelling**: Category names are case-sensitive

### Import Lyricist Tags: LYRICIST field not cleared
- Fixed in version 4.0.0
- Field is now cleared even if tags already exist on track

### Export CloudPlay Playlists: Playlist skipped
- **No track IDs available**: Some playlists/smartlists may not expose track lists in `_vars.playlistsAll`
- **Path issue**: Track location is outside configured Music Library path
- **Fix**: Verify `Music Library Path` and relative path setting (`../Music`)

---

## 📝 Changelog

### Version 4.1.0 (2026-03-13) - Current
✅ **New Action: CloudPlay Export**
- ✨ New: **Export CloudPlay Playlists** - Export folder playlists as M3U8 for Astiga
- ✅ Added: Config dialogs for source folder, music path, target directory and relative path
- ✅ Added: Relative-path M3U8 output with `#EXTINF:NaN,Artist - Title`

### Version 4.0.0 (2026-02-28)
✅ **Major Update: Suite Expansion**
- ✨ New: **Energy to Tag** - Automatically convert Energy values to Custom Tags
- ✨ New: **Import Lyricist Tags** - Import comma-separated tags from LYRICIST field (Onetagger workflow)
- ✨ New: **Create Playlist** - Quick playlist creation with selected tracks
- 📚 Enhanced: Project renamed to "Scholee Suite" (plugin collection)
- 🐛 Fixed: Lexicon compatibility (removed continue statements)
- 📖 Updated: Comprehensive documentation for all actions

### Version 3.0.8 (2025-10-13)
✅ **Fixed scope loading issues**
- 🐛 Fixed: "All tracks" now works correctly
- 🐛 Fixed: "Current view" now works correctly
- ✅ Changed: `getNextAllBatch(500)` → `getNextAllBatch()` (correct API usage)
- ✅ Changed: `_vars.tracksVisible` → `_vars.tracksView` (correct variable)
- ✅ Added: "view" permission for "Current view" scope
- ✅ Added: Better logging/reporting for debugging

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
4. Find actions under **Plugins → Scholee Suite**

### Available Actions
- Compare Fields
- Create Playlist
- Energy to Tag
- Import Lyricist Tags
- Export CloudPlay Playlists

### Requirements for Tag Actions

**For Energy to Tag:**
- Custom Tag Category "Energy" must exist
- Tags "0" through "10" must exist in this category

**For Import Lyricist Tags:**
- Custom Tag Category "Genre & Style" must exist (for matching existing tags)
- Custom Tag Category "Imported Tags" must exist (for new tags)

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
