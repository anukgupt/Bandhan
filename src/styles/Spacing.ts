/// <amd-module name="Aex/Platform/UI/Styling/Spacing" />
export const prefix = "aex-";

export type SpacingSize = 4 | 8 | 12 | 16 | 20 | 32 | 40;

export type ExtendedSpacingSize = SpacingSize | 0 | -4 | -8 | -12 | -16 | -20 | -32 | -40;

export function getSpacingContainerClassName(side: "x" | "y", size: SpacingSize): string {
    return `${prefix}spacing-container-${side}-${size}`;
}

export function getSpacingClassName<TProperty extends "margin" | "padding" = "margin" | "padding">(
    property: TProperty,
    sides: "top" | "bottom" | "left" | "right" | "x" | "y" | "all",
    size: TProperty extends "padding" ? ExtendedSpacingSize
        : ExtendedSpacingSize | "auto"): string {
    const sidesString = (sides === "all") ? "" : "-" + sides;
    return `${prefix}${property}${sidesString}-${size}`;
}
