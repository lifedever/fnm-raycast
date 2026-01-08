/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** FNM 路径 - 自定义 fnm 可执行文件的路径(如果自动检测失败) */
  "fnmPath"?: string,
  /** 额外的 PATH 路径 - 额外的搜索路径,用冒号分隔 */
  "customPaths"?: string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `list-versions` command */
  export type ListVersions = ExtensionPreferences & {}
  /** Preferences accessible in the `install-version` command */
  export type InstallVersion = ExtensionPreferences & {}
  /** Preferences accessible in the `use-version` command */
  export type UseVersion = ExtensionPreferences & {}
  /** Preferences accessible in the `uninstall-version` command */
  export type UninstallVersion = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `list-versions` command */
  export type ListVersions = {}
  /** Arguments passed to the `install-version` command */
  export type InstallVersion = {
  /** Version (e.g., 18.17.0 or lts) */
  "version": string
}
  /** Arguments passed to the `use-version` command */
  export type UseVersion = {}
  /** Arguments passed to the `uninstall-version` command */
  export type UninstallVersion = {}
}

