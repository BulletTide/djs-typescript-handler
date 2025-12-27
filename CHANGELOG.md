# Changelog

All notable changes to this project will be documented in this file.

The format follows **Keep a Changelog**  
https://keepachangelog.com/en/1.1.0/

This project adheres to **Semantic Versioning**  
https://semver.org/

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

### 🚀 Changed
- Formalized command execution contract via abstract base method
- Improved internal type safety and ESLint enforcement

### 🛠 Fixes
- Correct command registration by application command type
- Prevented invalid command payloads during registration

---

## [2.2.0] - 2025-12-27

### ✨ Added
- Inline slash command autocomplete
- Typed autocomplete execution context
- Centralized autocomplete routing

### 🚀 Changed
- Updated command templates to use unified execution context
- Improved developer experience for command authors

### 🛠 Fixes
- Prevented autocomplete collisions across subcommands
- Fixed grouped autocomplete routing

---

## [2.1.0] - 2025-12-27

### 🚀 Changed
- Hardened command execution typing
- Introduced shared execution context
- Centralized config typing
- Improved internal type safety

---

## [2.0.1] - 2025-12-27

### 🛠 Fixes
- Enforced ownerOnly and devOnly flags
- Added per-command execution error isolation
- Prevented MongoDB connection without URI
- Improved interaction safety

---

## [2.0.0] - 2025-12-27

### 🚀 Major Changes
- Migrated discord.js v13 → v14
- Refactored command, event, and client architecture
- Slash commands only (Chat Input)

### 🧠 Architecture
- Simplified handler structure
- Improved type safety
- Refactored MongoDB manager

### 🧰 Tooling
- Updated TypeScript targets
- Migrated to ESLint v9 (flat config)
- Fixed all linting issues

### ⚠️ Breaking Changes
- discord.js v13 no longer supported
- Node.js 18+ required
- Message/prefix commands removed

---

## [1.0.0] - Initial Release

### ✨ Added
- Initial TypeScript handler
- Command and event system
- Optional MongoDB integration
