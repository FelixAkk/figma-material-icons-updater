# Material Icons Updater - Figma Plugin

## Overview
A Figma plugin that updates Material Icons components to Material Symbols. The plugin detects components/frames by name (e.g., "error_outline"), allows parameter customization (style, weight, size, grade, fill), shows real-time previews, and replaces selected nodes with new SVG data from Google's Material Symbols repository.

## Architecture
- **`code.ts`** - Main plugin logic (TypeScript, compiles to `code.js`)
- **`ui.html`** - Plugin UI with inline JavaScript (no external files due to Figma security)
- **`manifest.json`** - Plugin configuration and metadata

## Key Features
- **Node Support**: Components and frames (instances explicitly rejected)
- **Icon Detection**: Extracts icon names from node names using regex `^[a-z0-9_]+$`
- **Parameter Controls**: Style (outlined/rounded/sharp), weight (100-700), size (20/24/40/48px), grade (-25/0/200), fill (boolean)
- **Progressive Disclosure**: Settings collapsed by default with smart summary
- **Bulk Operations**: Progress bar for >5 icons, real-time status updates
- **Settings Persistence**: Uses Figma clientStorage, loads on startup, saves on update
- **Responsive UI**: Window resizes based on content height

## API Integration
- **Source**: GitHub raw files from `google/material-design-icons/master/symbols/web/`
- **URL Pattern**: `{baseUrl}/{iconName}/{style}/{filename}`
- **Filename Logic**: `iconName_[wght{weight}][grad{grade}][fill1]_{size}px.svg`
- **Defaults**: Weight 400 and grade 0 omitted from filenames
- **Grade Handling**: Negative values use `gradN{abs}` format (e.g., `gradN25` for -25)

## Build Process
- **TypeScript**: `npm run build` compiles `code.ts` → `code.js`
- **Dependencies**: Node.js, TypeScript, @figma/plugin-typings
- **Package Manager**: pnpm (lockfile: `pnpm-lock.yaml`)

## UI Conventions
- **Flexbox Layout**: Uses `gap` properties, no margins
- **Hidden Class**: `.hidden` for show/hide (no inline styles)
- **Status System**: Preview area toggles with status messages
- **Error Handling**: Button disabled for invalid selections/unsupported nodes
- **Progress Display**: Shows "(current / total)" appended to status text during updates

## Message Passing
```typescript
// Plugin → UI
{ type: 'selection-changed', nodes: NodeInfo[], hasUnsupportedNodes: boolean }
{ type: 'settings-loaded', parameters: MaterialSymbolsParams }
{ type: 'update-progress', message: string, current?: number, total?: number }
{ type: 'update-complete', count: number }

// UI → Plugin  
{ type: 'update-icons', parameters: MaterialSymbolsParams, nodes: NodeInfo[] }
{ type: 'resize', width: number, height: number }
```

## Development Notes
- **No External JS**: All JavaScript inlined in HTML due to Figma security restrictions
- **Icon Preview**: 2x scaled for visibility using dynamic sizing
- **Error States**: Comprehensive validation with user-friendly messages
- **Code Structure**: Clean separation between plugin logic and UI handling
- **Lint/Build**: Run `npm run build` after TypeScript changes

## AI Assistant Guidelines
- Always use flexbox with gap, never margins
- Maintain progressive disclosure pattern
- Keep settings persistence invisible to user
- Use proper TypeScript types (NodeInfo, MaterialSymbolsParams)  
- Test build after significant changes
- Follow existing error handling patterns
