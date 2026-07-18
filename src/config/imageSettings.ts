import type { CSSProperties } from "react";
import type { ImageAsset, SizeValue } from "../types/portfolio";

export const imageObjectFitOptions = [
  { label: "Cover", value: "cover" },
  { label: "Contain", value: "contain" },
  { label: "Fill", value: "fill" },
  { label: "Natural size", value: "none" },
  { label: "Scale down", value: "scale-down" },
] as const;

export const imageCropPositionOptions = [
  { label: "Center", value: "center" },
  { label: "Top", value: "top" },
  { label: "Bottom", value: "bottom" },
  { label: "Left", value: "left" },
  { label: "Right", value: "right" },
  { label: "Top left", value: "left top" },
  { label: "Top right", value: "right top" },
  { label: "Bottom left", value: "left bottom" },
  { label: "Bottom right", value: "right bottom" },
] as const;

export const imageShapeOptions = [
  { label: "Slot default", value: "auto" },
  { label: "Square", value: "square" },
  { label: "Rounded", value: "rounded" },
  { label: "Circle", value: "circle" },
  { label: "Arch", value: "arch" },
] as const;

export const imageAspectRatioOptions = [
  { label: "Slot default", value: "auto" },
  { label: "Square · 1:1", value: "1 / 1" },
  { label: "Landscape · 4:3", value: "4 / 3" },
  { label: "Landscape · 16:9", value: "16 / 9" },
  { label: "Portrait · 3:4", value: "3 / 4" },
  { label: "Portrait · 4:5", value: "4 / 5" },
  { label: "Wide · 21:9", value: "21 / 9" },
] as const;

export const defaultImageSettings = {
  objectFit: "cover",
  objectPosition: "center",
  shape: "auto",
  aspectRatio: "auto",
} as const;

const shapeRadius: Partial<
  Record<NonNullable<ImageAsset["shape"]>, string>
> = {
  square: "0",
  rounded: "12px",
  circle: "9999px",
  arch: "9999px 9999px 16px 16px",
};

export function toImageFrameStyle(
  image: ImageAsset | undefined,
): CSSProperties {
  if (!image) return {};
  const aspectRatio = image.aspectRatio || defaultImageSettings.aspectRatio;
  const shape = image.shape || defaultImageSettings.shape;

  return {
    width: sizeValue(image.width),
    height: sizeValue(image.height),
    maxWidth: image.width ? "none" : undefined,
    minHeight: aspectRatio !== "auto" || image.height ? 0 : undefined,
    aspectRatio: aspectRatio === "auto" ? undefined : aspectRatio,
    borderRadius: shape === "auto" ? undefined : shapeRadius[shape],
    overflow: "hidden",
  };
}

export function toImageContentStyle(
  image: ImageAsset | undefined,
): CSSProperties {
  return {
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: image?.objectFit || defaultImageSettings.objectFit,
    objectPosition:
      image?.objectPosition || defaultImageSettings.objectPosition,
  };
}

function sizeValue(size: SizeValue | undefined) {
  if (!size) return undefined;
  if (size.unit === "fill") return "100%";
  if (size.value === undefined) return undefined;
  return `${size.value}${size.unit}`;
}
