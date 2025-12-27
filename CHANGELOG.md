# Changelog

All notable changes to this project will be documented in this file.

The format follows **Keep a Changelog**  
https://keepachangelog.com/en/1.1.0/

This project adheres to **Semantic Versioning**  
https://semver.org/

---

## [2.4.1] - 2025-12-27

### 🛠 Fixes
- Enforced runtime validation for command execute methods
- Tightened interaction typing for utility helpers
- Corrected package metadata and Node.js requirements
- Improved registry safety and developer clarity

---

## [2.4.0] - 2025-12-27

### ✨ Added
- Optional per-command cooldown system
- User, guild, and global cooldown scopes
- Unified cooldown handling for slash and context menu commands

### 🚀 Changed
- Updated command templates to reflect unified execution contract
- Improved documentation for context menus and cooldowns

### 🛠 Fixes
- Ensured cooldown checks occur before command execution
- Prevented duplicate command execution during cooldown windows

---

## [2.3.0] - 2025-12-27

### ✨ Added
- User and Message context menu commands
- Unified execution pipeline across all command types
- Typed execution context shared across slash and context menu commands

---

## [2.2.0] - 2025-12-27

### ✨ Added
- Inline slash command autocomplete
- Typed autocomplete execution context

---

## [2.1.0] - 2025-12-27

### 🚀 Changed
- Hardened command execution typing
- Introduced shared execution context

---

## [2.0.1] - 2025-12-27

### 🛠 Fixes
- Enforced ownerOnly and devOnly flags
- Prevented MongoDB connection without URI

---

## [2.0.0] - 2025-12-27

### 🚀 Major Changes
- Migrated discord.js v13 → v14
- Slash commands only
- Node.js 18+ required

---

## [1.0.0] - Initial Release