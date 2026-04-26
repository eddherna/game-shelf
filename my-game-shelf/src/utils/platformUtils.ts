export interface PlatformConfig {
  name: string;
  displayName: string;
  color: string;
  icon?: string;
}

export const PLATFORM_CONFIG: Record<string, PlatformConfig> = {
  switch: {
    name: "switch",
    displayName: "Nintendo Switch",
    color: "#e60012"
  },
  switch2: {
    name: "switch2",
    displayName: "Nintendo Switch 2",
    color: "#000"
  }
  // Add more platforms as needed
};

export const getPlatformDisplayName = (platform: string): string => {
  return PLATFORM_CONFIG[platform]?.displayName || platform;
};

export const getPlatformColor = (platform: string): string => {
  return PLATFORM_CONFIG[platform]?.color || "gray";
};

export const isSwitch2 = (platform: string): boolean => {
  return platform === "switch2";
};