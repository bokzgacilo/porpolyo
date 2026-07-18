import { Box } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { BoxSpacing } from "../../types/portfolio";

export function BoxModelPreview({
  margin = {},
  padding = {},
  borderWidth,
}: {
  margin?: BoxSpacing;
  padding?: BoxSpacing;
  borderWidth?: number;
}) {
  return (
    <Box className="box-model-preview" aria-label="Selected element box model">
      <BoxModelLayer
        label="Margin"
        className="box-model-margin"
        top={formatBoxValue(margin.top, margin.unit)}
        right={formatBoxValue(margin.right, margin.unit)}
        bottom={formatBoxValue(margin.bottom, margin.unit)}
        left={formatBoxValue(margin.left, margin.unit)}
      >
        <BoxModelLayer
          label="Border"
          className="box-model-border"
          top={formatBoxValue(borderWidth)}
          right={formatBoxValue(borderWidth)}
          bottom={formatBoxValue(borderWidth)}
          left={formatBoxValue(borderWidth)}
        >
          <BoxModelLayer
            label="Padding"
            className="box-model-padding"
            top={formatBoxValue(padding.top, padding.unit)}
            right={formatBoxValue(padding.right, padding.unit)}
            bottom={formatBoxValue(padding.bottom, padding.unit)}
            left={formatBoxValue(padding.left, padding.unit)}
          >
            <div className="box-model-content">Content</div>
          </BoxModelLayer>
        </BoxModelLayer>
      </BoxModelLayer>
    </Box>
  );
}

function BoxModelLayer({
  label,
  className,
  top,
  right,
  bottom,
  left,
  children,
}: {
  label: string;
  className: string;
  top: string;
  right: string;
  bottom: string;
  left: string;
  children: ReactNode;
}) {
  return (
    <div className={`box-model-layer ${className}`}>
      <span className="box-model-label">{label}</span>
      <span className="box-model-value top">{top}</span>
      <span className="box-model-value right">{right}</span>
      <span className="box-model-value bottom">{bottom}</span>
      <span className="box-model-value left">{left}</span>
      {children}
    </div>
  );
}

function formatBoxValue(value?: number, unit = "px") {
  return `${value ?? 0}${unit}`;
}
