import { Action, ActionPanel, Color, Icon, List, showToast, Toast, openExtensionPreferences } from "@raycast/api";
import React, { useEffect, useState } from "react";
import { checkFnmInstalled, getInstalledVersions, NodeVersion, useVersion, getFnmPath } from "./utils/fnm";

export default function ListVersions() {
  const [versions, setVersions] = useState<NodeVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fnmInstalled, setFnmInstalled] = useState(true);

  useEffect(() => {
    loadVersions();
  }, []);

  async function loadVersions() {
    setIsLoading(true);

    const installed = await checkFnmInstalled();
    setFnmInstalled(installed);

    if (!installed) {
      const fnmPath = getFnmPath();
      await showToast({
        style: Toast.Style.Failure,
        title: "fnm not found",
        message: fnmPath.includes("/") ? `Path ${fnmPath} does not exist, please check configuration` : "Please install fnm or configure path in settings",
      });
      setIsLoading(false);
      return;
    }

    const installedVersions = await getInstalledVersions();
    setVersions(installedVersions);
    setIsLoading(false);
  }

  async function handleUseVersion(version: string) {
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: `Setting Node.js ${version} as default...`,
    });

    const result = await useVersion(version);

    if (result.success) {
      toast.style = Toast.Style.Success;
      toast.title = `Node.js ${version} set as default`;
      toast.message = "New terminal sessions will use this version";
      await loadVersions();
    } else {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to set default";
      toast.message = result.message;
    }
  }

  if (!fnmInstalled) {
    const fnmPath = getFnmPath();
    return (
      <List>
        <List.EmptyView
          icon={{ source: Icon.XMarkCircle, tintColor: Color.Red }}
          title="fnm not found"
          description={
            fnmPath.includes("/")
              ? `Configured path ${fnmPath} does not exist\nPlease check the path in extension settings`
              : "Please install fnm or configure fnm path in extension settings\n\nInstall: brew install fnm"
          }
          actions={
            <ActionPanel>
              <Action title="Open Extension Settings" icon={Icon.Gear} onAction={openExtensionPreferences} />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  return (
    <List isLoading={isLoading}>
      {versions.length === 0 && !isLoading ? (
        <List.EmptyView
          icon={Icon.Download}
          title="No Node.js versions installed"
          description="Use 'Install Node.js Version' command to install a version"
        />
      ) : (
        versions.map((version) => (
          <List.Item
            key={version.version}
            icon={{
              source: version.isCurrent ? Icon.CheckCircle : Icon.Circle,
              tintColor: version.isCurrent ? Color.Green : Color.SecondaryText,
            }}
            title={version.version}
            accessories={[
              ...(version.isCurrent ? [{ tag: { value: "current", color: Color.Green } }] : []),
              ...(version.isDefault ? [{ tag: { value: "default", color: Color.Blue } }] : []),
              ...(version.isLts ? [{ tag: { value: "lts", color: Color.Orange } }] : []),
            ]}
            actions={
              <ActionPanel>
                <Action title="Set as Default" icon={Icon.Star} onAction={() => handleUseVersion(version.version)} />
                <Action
                  title="Refresh List"
                  icon={Icon.ArrowClockwise}
                  onAction={loadVersions}
                  shortcut={{ modifiers: ["cmd"], key: "r" }}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
