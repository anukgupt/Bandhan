/// <amd-module name="Aex/Platform/UI/Styling/ColorClassNames" />
export const prefix = "aex-";

export const BackgroundColorClassNames = {
    default: "background-color-default",
    communicationBackground: "background-color-communication-background",
    neutral2: "background-color-neutral-2",
    statusInfoBackground: "background-color-status-info-background",
    statusErrorBackground: "background-color-status-error-background",
};

export const ColorClassNames = {
    primaryText: prefix + "color-primary-text",
    secondaryText: prefix + "color-secondary-text",
    textOnCommunicationBackground: "color-text-on-communication-background",
    communicationForeground: "color-communication-foreground",
    white: "color-white",
    statusErrorForeground: "color-status-error-foreground",
};

export type ColorCategory = "neutral";
export type ColorLevel = 80 | 70 | 60 | 30 | 20 | 10 | 8 | 6 | 4 | 2;
export type ColorKey = "color" | "border-top-color";
export function getColorClassName(category: ColorCategory, level: ColorLevel, colorKey: ColorKey = "color") {
    return `${prefix}${colorKey}-${category}-${level}`;
}
