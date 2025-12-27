# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [2.0.0] - 2025-12-27

### 🚀 Major Changes
- Migrated entire codebase from **discord.js v13 → v14**
- Refactored command, event, and client architecture to align with modern Discord.js standards
- Reworked slash command handling to use Chat Input commands only
- Updated permission handling to v14-compatible enums and flags
- Updated intents, embeds, attachments, and interaction APIs

### 🧠 Architecture
- Simplified handler structure while preserving extensibility
- Improved type-safety across commands, events, and managers
- Refactored MongoDB manager to work cleanly with modern Mongoose typings
- Removed legacy API usage and deprecated Discord features

### 🧰 Tooling
- Updated TypeScript configuration for modern targets
- Migrated ESLint to **ESLint v9 (flat config)**
- Fixed all linting issues across the project
- Improved developer experience with stricter but practical lint rules

### 🛠 Fixes
- Fixed breaking type issues caused by outdated Discord.js typings
- Fixed interaction handling edge cases
- Fixed command registration inconsistencies
- Removed unsafe or deprecated patterns

### ⚠️ Breaking Changes
- **discord.js v13 is no longer supported**
- Node.js **18+ is now required**
- Prefix/message commands are not supported (slash commands only)
- Some internal APIs were renamed or removed

---

## [1.0.0] - Initial Release

### Added
- Initial TypeScript handler for discord.js v13
- Command and event handler system
- Optional MongoDB integration
