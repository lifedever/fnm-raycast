# FNM - Fast Node Manager

A Raycast extension for managing Node.js versions with [fnm](https://github.com/Schniz/fnm) (Fast Node Manager).

## Features

- 📋 **List Installed Versions** - View all installed Node.js versions with current and default indicators
- 📥 **Install Versions** - Quickly install any Node.js version (LTS, latest, or specific version)
- 🔄 **Switch Versions** - Quickly switch between different Node.js versions
- 🗑️ **Uninstall Versions** - Remove Node.js versions you no longer need

## Prerequisites

Before using this extension, you need to install fnm:

### macOS / Linux

```bash
# Using Homebrew (recommended)
brew install fnm

# Or using the install script
curl -fsSL https://fnm.vercel.app/install | bash
```

### Shell Configuration

After installation, add the fnm initialization code to your shell configuration file:

**Zsh (~/.zshrc)**

```bash
eval "$(fnm env --use-on-cd)"
```

**Bash (~/.bashrc)**

```bash
eval "$(fnm env --use-on-cd)"
```

**Fish (~/.config/fish/config.fish)**

```fish
fnm env --use-on-cd | source
```

## Usage

### List Installed Versions

1. Open Raycast
2. Type `List Node.js Versions`
3. View all installed versions; the current version is marked with green
4. You can switch versions or set default directly from the list

### Install a Version

1. Open Raycast
2. Type `Install Node.js Version`
3. Choose one of the following:
   - Install LTS version (recommended)
   - Install latest version
   - Enter a custom version number (e.g., 18.17.0)
   - Select from available versions list

### Switch Version

1. Open Raycast
2. Type `Use Node.js Version`
3. Select the version you want to use from the installed versions list

### Uninstall a Version

1. Open Raycast
2. Type `Uninstall Node.js Version`
3. Select the version to uninstall
4. Confirm the uninstallation

## Keyboard Shortcuts

- `⌘ + R` - Refresh list
- `⌘ + ,` - Open extension settings

## Configuration Options

The extension provides flexible configuration options in Raycast extension settings:

### FNM Path

Custom full path to the fnm executable. Use this if fnm is installed in a non-standard location or auto-detection fails.

**Examples**:

- `/opt/homebrew/bin/fnm` (Apple Silicon Mac)
- `/usr/local/bin/fnm` (Intel Mac)
- `/Users/username/.local/bin/fnm` (Custom location)

### Additional PATH

Add extra search paths, separated by colons (`:`).

**Example**: `/custom/path/bin:/another/path/bin`

## Troubleshooting

### fnm command not found

If the extension reports that fnm cannot be found, please ensure:

1. fnm is correctly installed
2. fnm initialization code is added to your shell configuration file
3. Restart terminal or reload configuration file

### Version switch not taking effect

fnm version switching is based on the current shell session. After switching version in Raycast:

- New terminal sessions will use the new version
- Existing terminal sessions need to run `fnm use <version>` again or restart

## About fnm

fnm (Fast Node Manager) is a fast and simple Node.js version manager written in Rust. Compared to other version managers, fnm has the following advantages:

- 🚀 **Fast** - Written in Rust with excellent performance
- 🎯 **Simple** - Clean API, easy to use
- 🔄 **Auto-switching** - Supports automatic version switching based on `.node-version` or `.nvmrc` files
- 🌍 **Cross-platform** - Supports macOS, Linux, and Windows

## Development Commands

```bash
npm install        # Install dependencies
npm run dev        # Development mode
npm run build      # Build extension
npm run lint       # Code linting
npm run fix-lint   # Auto-fix lint issues
npm run publish    # Publish to Raycast Store
```

## License

MIT

## Related Links

- [fnm GitHub Repository](https://github.com/Schniz/fnm)
- [Raycast Extension Development Docs](https://developers.raycast.com)
- [Raycast Store](https://www.raycast.com/store)
