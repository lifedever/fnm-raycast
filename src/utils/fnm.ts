/// <reference path="../../raycast-env.d.ts" />
import { exec } from "child_process";
import { promisify } from "util";
import { getPreferenceValues } from "@raycast/api";

const execAsync = promisify(exec);

// Use auto-generated Preferences type from raycast-env.d.ts
// Get user preferences
function getPreferences(): Preferences {
  try {
    return getPreferenceValues<Preferences>();
  } catch {
    return {};
  }
}

/**
 * Validate version string to prevent command injection
 * Allows: numbers, dots, dashes, and common aliases (lts, latest, etc.)
 */
function isValidVersion(version: string): boolean {
  // Allow common aliases
  const validAliases = ["lts", "latest", "lts-latest", "lts/*", "current"];
  if (validAliases.includes(version.toLowerCase())) {
    return true;
  }
  // Allow version patterns: numbers, dots, dashes, letters (for codenames like "lts/iron")
  const versionPattern = /^[a-zA-Z0-9.\-\/\*]+$/;
  return versionPattern.test(version) && version.length <= 50;
}

// Get fnm command, prioritize user configured path
function getFnmCommand(): string {
  const preferences = getPreferences();

  // If user configured a custom path, use it
  if (preferences.fnmPath && preferences.fnmPath.trim()) {
    return preferences.fnmPath.trim();
  }

  // Otherwise use default fnm command
  return "fnm";
}

// Get correct PATH, including common package manager paths and user custom paths
function getEnvWithPath() {
  const preferences = getPreferences();

  const paths = [
    "/opt/homebrew/bin", // Homebrew (Apple Silicon)
    "/usr/local/bin", // Homebrew (Intel)
    "/usr/bin",
    "/bin",
    "/usr/sbin",
    "/sbin",
  ];

  // Add user custom paths
  if (preferences.customPaths && preferences.customPaths.trim()) {
    const customPaths = preferences.customPaths.split(":").filter(Boolean);
    paths.unshift(...customPaths);
  }

  // Add system PATH
  if (process.env.PATH) {
    paths.push(process.env.PATH);
  }

  return {
    ...process.env,
    PATH: paths.filter(Boolean).join(":"),
  };
}

// Execute command with correct environment variables
async function execWithEnv(command: string) {
  return execAsync(command, { env: getEnvWithPath() });
}

export interface NodeVersion {
  version: string;
  isDefault: boolean;
  isCurrent: boolean;
  isLts: boolean;
}

/**
 * Check if fnm is installed
 */
export async function checkFnmInstalled(): Promise<boolean> {
  try {
    const fnmCmd = getFnmCommand();

    // If user configured a full path, check if file exists
    if (fnmCmd.includes("/")) {
      const { existsSync } = await import("fs");
      return existsSync(fnmCmd);
    }

    // Otherwise use which command to find
    await execWithEnv(`which ${fnmCmd}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the configured fnm path for display
 */
export function getFnmPath(): string {
  return getFnmCommand();
}

/**
 * Get all installed Node.js versions
 */
export async function getInstalledVersions(): Promise<NodeVersion[]> {
  try {
    const fnmCmd = getFnmCommand();
    const { stdout } = await execWithEnv(`${fnmCmd} list`);
    const lines = stdout.trim().split("\n");
    const versions: NodeVersion[] = [];

    // Get current version in use
    let currentVersion: string | null = null;
    try {
      const { stdout: currentStdout } = await execWithEnv(`${fnmCmd} current`);
      const currentMatch = currentStdout.match(/v?(\d+\.\d+\.\d+)/);
      if (currentMatch) {
        currentVersion = currentMatch[1];
      }
    } catch {
      // Ignore error if getting current version fails
    }

    for (const line of lines) {
      if (!line.trim() || line.includes("system")) continue;

      const isDefault = line.includes("default");
      const isLts = line.includes("lts");

      // Extract version number (e.g., "v18.17.0" or "18.17.0")
      const versionMatch = line.match(/v?(\d+\.\d+\.\d+)/);
      if (versionMatch) {
        const version = versionMatch[1];
        versions.push({
          version,
          isDefault,
          isCurrent: version === currentVersion,
          isLts,
        });
      }
    }

    // Sort by version number descending (latest first)
    versions.sort((a, b) => {
      const [aMajor, aMinor, aPatch] = a.version.split(".").map(Number);
      const [bMajor, bMinor, bPatch] = b.version.split(".").map(Number);

      if (aMajor !== bMajor) return bMajor - aMajor;
      if (aMinor !== bMinor) return bMinor - aMinor;
      return bPatch - aPatch;
    });

    return versions;
  } catch (error) {
    console.error("Error getting installed versions:", error);
    return [];
  }
}

/**
 * Get current Node.js version
 */
export async function getCurrentVersion(): Promise<string | null> {
  try {
    const fnmCmd = getFnmCommand();
    const { stdout } = await execWithEnv(`${fnmCmd} current`);
    const versionMatch = stdout.match(/v?(\d+\.\d+\.\d+)/);
    return versionMatch ? versionMatch[1] : null;
  } catch {
    return null;
  }
}

/**
 * Install a Node.js version
 */
export async function installVersion(version: string): Promise<{ success: boolean; message: string }> {
  // Validate version to prevent command injection
  if (!isValidVersion(version)) {
    return {
      success: false,
      message: "Invalid version format",
    };
  }

  try {
    const fnmCmd = getFnmCommand();
    const { stdout, stderr } = await execWithEnv(`${fnmCmd} install ${version}`);
    return {
      success: true,
      message: stdout || stderr || `Successfully installed Node.js ${version}`,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: errorMessage || `Failed to install Node.js ${version}`,
    };
  }
}

/**
 * Use a specific Node.js version
 * Note: fnm use requires shell integration, so we set it as default instead
 */
export async function useVersion(version: string): Promise<{ success: boolean; message: string }> {
  // Validate version to prevent command injection
  if (!isValidVersion(version)) {
    return {
      success: false,
      message: "Invalid version format",
    };
  }

  try {
    const fnmCmd = getFnmCommand();
    // Use fnm default instead of fnm use, because use requires shell integration
    await execWithEnv(`${fnmCmd} default ${version}`);
    return {
      success: true,
      message: `Node.js ${version} set as default\nNew terminal sessions will use this version`,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: errorMessage || `Failed to switch to Node.js ${version}`,
    };
  }
}

/**
 * Set default Node.js version
 */
export async function setDefaultVersion(version: string): Promise<{ success: boolean; message: string }> {
  // Validate version to prevent command injection
  if (!isValidVersion(version)) {
    return {
      success: false,
      message: "Invalid version format",
    };
  }

  try {
    const fnmCmd = getFnmCommand();
    const { stdout, stderr } = await execWithEnv(`${fnmCmd} default ${version}`);
    return {
      success: true,
      message: stdout || stderr || `Set Node.js ${version} as default`,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: errorMessage || `Failed to set Node.js ${version} as default`,
    };
  }
}

/**
 * Uninstall a Node.js version
 */
export async function uninstallVersion(version: string): Promise<{ success: boolean; message: string }> {
  // Validate version to prevent command injection
  if (!isValidVersion(version)) {
    return {
      success: false,
      message: "Invalid version format",
    };
  }

  try {
    const fnmCmd = getFnmCommand();
    const { stdout, stderr } = await execWithEnv(`${fnmCmd} uninstall ${version}`);
    return {
      success: true,
      message: stdout || stderr || `Successfully uninstalled Node.js ${version}`,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: errorMessage || `Failed to uninstall Node.js ${version}`,
    };
  }
}

export interface RemoteVersion {
  version: string;
  isLts: boolean;
  ltsName?: string;
}

/**
 * Get available remote versions
 */
export async function getRemoteVersions(): Promise<RemoteVersion[]> {
  try {
    const fnmCmd = getFnmCommand();
    const { stdout } = await execWithEnv(`${fnmCmd} list-remote`);
    const lines = stdout.trim().split("\n");
    const versions: RemoteVersion[] = [];

    for (const line of lines) {
      // fnm output format: "v22.11.0 (Jod)" where parentheses contain LTS codename
      const ltsMatch = line.match(/\(([^)]+)\)/);
      const isLts = ltsMatch !== null;
      const ltsName = ltsMatch ? ltsMatch[1] : undefined;

      const versionMatch = line.match(/v?(\d+\.\d+\.\d+)/);
      if (versionMatch) {
        versions.push({
          version: versionMatch[1],
          isLts,
          ltsName,
        });
      }
    }

    // Sort by version number descending (latest first)
    versions.sort((a, b) => {
      const [aMajor, aMinor, aPatch] = a.version.split(".").map(Number);
      const [bMajor, bMinor, bPatch] = b.version.split(".").map(Number);

      if (aMajor !== bMajor) return bMajor - aMajor;
      if (aMinor !== bMinor) return bMinor - aMinor;
      return bPatch - aPatch;
    });

    return versions;
  } catch (error) {
    console.error("Error getting remote versions:", error);
    return [];
  }
}
