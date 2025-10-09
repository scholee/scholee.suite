# GitHub Setup - Compare Fields Plugin

## 🎉 Git-Repository ist bereit!

Das lokale Git-Repository wurde erfolgreich initialisiert und der erste Commit wurde erstellt.

---

## 📋 Nächste Schritte: Repository auf GitHub hochladen

### Schritt 1: Privates Repository auf GitHub erstellen

1. **Gehe zu GitHub**: https://github.com
2. **Klicke auf "New repository"** (grüner Button oben rechts oder bei https://github.com/new)
3. **Fülle die Details aus**:
   - **Repository name**: `lexicon-plugin-compare-fields` (oder ein Name Ihrer Wahl)
   - **Description**: `Compare Fields Plugin for Lexicon DJ - v3.0.5`
   - **Visibility**: ✅ **Private** (wichtig!)
   - **Initialize repository**: ❌ **NICHT** "Add a README file" ankreuzen (wir haben bereits Dateien)
   - **Add .gitignore**: ❌ **NICHT** auswählen (wir haben bereits eine)
   - **Choose a license**: Optional (empfohlen: MIT License)
4. **Klicke auf "Create repository"**

### Schritt 2: Remote hinzufügen und pushen

Nachdem das Repository auf GitHub erstellt wurde, zeigt GitHub Ihnen Befehle an. Sie benötigen diese Befehle:

```bash
# Wechsle ins Plugin-Verzeichnis
cd /Users/joelkuhn/Documents/Lexicon/Plugins/scholee.suite

# Füge GitHub als Remote hinzu (ersetze USERNAME mit Ihrem GitHub-Benutzernamen)
git remote add origin https://github.com/USERNAME/lexicon-plugin-compare-fields.git

# Pushe den Code zu GitHub
git push -u origin main
```

**WICHTIG**: Ersetzen Sie `USERNAME` mit Ihrem GitHub-Benutzernamen!

### Schritt 3: Authentifizierung

Beim ersten Push werden Sie nach Ihren GitHub-Zugangsdaten gefragt:

**Option A: Personal Access Token (empfohlen)**
1. Gehe zu: https://github.com/settings/tokens
2. Klicke "Generate new token (classic)"
3. Wähle Scope: `repo` (voller Zugriff auf private Repositories)
4. Generiere Token und kopiere es
5. Verwende Token als Passwort beim Git-Push

**Option B: SSH-Key (fortgeschritten)**
- Siehe: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

---

## 📝 Zukünftige Updates

Wenn Sie Änderungen am Plugin machen:

```bash
# 1. Wechsle ins Verzeichnis
cd /Users/joelkuhn/Documents/Lexicon/Plugins/scholee.suite

# 2. Prüfe geänderte Dateien
git status

# 3. Füge Änderungen hinzu
git add .

# 4. Commit mit Beschreibung
git commit -m "Beschreibung der Änderung"

# 5. Push zu GitHub
git push
```

### Beispiel für Version-Update:

```bash
# Nach Änderung der Versionsnummer auf 3.0.6
git add compare.fields.js CHANGELOG.md README.md
git commit -m "Update to v3.0.6: Fix XYZ"
git push
```

---

## 🏷️ Git Tags für Versionen (optional)

Um Versionen zu markieren:

```bash
# Tag für aktuelle Version erstellen
git tag -a v3.0.5 -m "Version 3.0.5 - Stable release"

# Tag zu GitHub pushen
git push origin v3.0.5

# Alle Tags anzeigen
git tag
```

---

## 📊 Repository-Struktur auf GitHub

Nach dem Upload sieht Ihr Repository so aus:

```
lexicon-plugin-compare-fields/
├── .gitignore
├── CHANGELOG.md
├── README.md
├── compare.fields.js
├── config.json
├── create.playlist.js
├── test.edge.cases.js
├── test.html
└── test.playlist.workflow.js
```

---

## ✅ Checkliste

- [x] Git-Repository initialisiert
- [x] .gitignore erstellt
- [x] Initial Commit erstellt
- [ ] GitHub-Repository erstellt (privat)
- [ ] Remote hinzugefügt
- [ ] Code zu GitHub gepusht
- [ ] Optional: Release-Tag v3.0.5 erstellt

---

## 🆘 Hilfe

Falls Probleme auftreten:

**Remote prüfen:**
```bash
git remote -v
```

**Remote ändern:**
```bash
git remote set-url origin https://github.com/USERNAME/lexicon-plugin-compare-fields.git
```

**Commit-Historie anzeigen:**
```bash
git log --oneline
```

**Lokale Änderungen verwerfen:**
```bash
git reset --hard HEAD
```

---

**Viel Erfolg! 🚀**

