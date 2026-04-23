# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

招聘助手 (Recruitment Assistant) is a Chrome Extension (Manifest V3) that helps HR/recruiters intelligently screen candidates and send personalized greeting messages on recruitment platforms. It uses AI to analyze resume-JD matching.

## Commands

```bash
npm install          # Install dependencies
npm run build        # Production build (outputs to dist/)
npm run dev          # Development build with watch mode
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run test         # Run tests with Vitest
npm run test:watch   # Run tests in watch mode
```

After building, load the `dist/` directory in Chrome as an unpacked extension (chrome://extensions/ → Developer mode → Load unpacked).

## Architecture

### Chrome Extension Structure

- **Background Service Worker** (`src/background/`): Handles settings storage, daily send limits, action logging via `chrome.storage` and `chrome.alarms`
- **Content Script** (`src/content/`): Injected into recruitment platform pages, renders React sidebar
- **Popup** (`src/popup/`): Extension popup UI
- **Options** (`src/options/`): Settings page for AI configuration and JD profiles

### Platform Adapters

Platform-specific logic is abstracted via `PlatformAdapter` interface (`src/types/platform.ts`). Each adapter handles:
- Detecting target pages
- Extracting resume list items and details from DOM
- Sending messages on the platform

Currently implemented: **智联招聘 (Zhilian)** in `src/content/platforms/zhilian.ts`

### AI Service

`src/services/ai-provider/` provides an `AIService` singleton with OpenAI-compatible API support for multiple providers:
- 通义千问 (Qwen) - default
- OpenAI
- 智谱 AI (Zhipu)
- Moonshot

### Matching Service

`src/services/matcher.ts`:
- `quickMatch()`: Local rule-based matching (education, experience, skills)
- `detailedMatch()`: AI-powered deep analysis returning structured `MatchResult`

### State Management

Zustand stores in `src/stores/`:
- `useSettingsStore`: User settings
- `useJDStore`: JD profiles management
- `useCandidateStore`: Candidate list state

### Storage

- **IndexedDB** (`src/services/storage.ts`): Resumes, JD profiles, match results, user feedback using `idb` library
- **Chrome Storage**: Settings and send records

## Key Types

- `ResumeData` (`src/types/resume.ts`): Candidate resume structure
- `JDProfile` (`src/types/jd.ts`): Job description with requirements and scoring rules
- `MatchResult` (`src/types/match.ts`): AI analysis result with scores and recommendations
- `Settings` (`src/types/settings.ts`): Extension configuration including AI provider settings

## Build System

Uses `@crxjs/vite-plugin` for Chrome Extension MV3 builds. The plugin handles:
- ES module to IIFE conversion for content scripts
- Service worker module loading
- Manifest transformation with correct asset paths

**Important**: Content scripts must export `onExecute()` function (required by CRXJS loader pattern).

## Adding a New Platform

1. Create adapter in `src/content/platforms/newplatform.ts` implementing `PlatformAdapter`
2. Add to adapters array in `src/content/index.tsx`
3. Add host permissions in `public/manifest.json`
4. Update content_scripts matches in manifest
