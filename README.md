# Material Icons Updater

A Figma plugin that updates Material Icons components to Material Symbols with customizable parameters (style, weight, size, grade, fill).

## Features

- **Smart Detection**: Automatically detects icon components and frames by name (e.g., "error_outline")
- **Parameter Control**: Style (outlined/rounded/sharp), weight (100-700), size (20-48px), grade (-25 to 200), fill
- **Real-time Preview**: See icon changes before applying
- **Bulk Updates**: Progress bar for updating multiple icons (>5 shows progress)
- **Settings Persistence**: Remembers your preferences between sessions
- **Progressive UI**: Collapsed settings by default with smart summary
- **Error Handling**: Clear feedback for invalid selections or missing icons

## Quick Start

### Prerequisites
- Node.js (includes npm)
- Figma Desktop or Browser

### Installation
1. Clone this repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
   *(Note: This project uses pnpm as package manager)*

3. Build the plugin:
   ```bash
   pnpm run build
   ```

4. In Figma: **Plugins → Development → Import plugin from manifest**
5. Select the `manifest.json` file from this directory

## Development

### Commands
```bash
# Build plugin (compiles TypeScript)
pnpm run build

# Watch mode (auto-rebuild on changes)  
pnpm run watch

# Lint code
pnpm run lint

# Fix linting issues
pnpm run lint:fix
```

### File Structure
- **`code.ts`** - Main plugin logic (compiles to `code.js`)
- **`ui.html`** - Plugin interface with inline JavaScript
- **`manifest.json`** - Plugin configuration
- **`tsconfig.json`** - TypeScript configuration

### Development Workflow
1. Make changes to `code.ts` or `ui.html`
2. Run `pnpm run build` to compile
3. Reload plugin in Figma to test changes

### Architecture Notes
- All JavaScript is inlined in `ui.html` (Figma security requirement)
- Uses Figma's clientStorage for settings persistence
- Fetches icons from GitHub's Material Symbols repository
- Progressive disclosure UI pattern for better UX

## Usage

1. Select component(s) or frame(s) with icon names (e.g., "add", "home", "error_outline")
2. Adjust parameters in the plugin panel (or use defaults)
3. Preview shows the icon with current settings
4. Click "Update icon(s)" to apply changes

### Supported Node Types
- ✅ Components
- ✅ Frames  
- ❌ Instances (use main component instead)
- ❌ Text, shapes, etc.

## API Reference

The plugin fetches icons from Google's Material Symbols repository:
```
https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/{iconName}/{style}/{filename}
```

Filename format: `{iconName}_[wght{weight}][grad{grade}][fill1]_{size}px.svg`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Run `pnpm run lint` to check code style
5. Submit a pull request

## License

See LICENSE file for details.