import type { BoxSpacing } from "../../types/portfolio";

export function BoxSpacingInput({
  label,
  value = {},
  onChange,
}: {
  label: string;
  value?: BoxSpacing;
  onChange: (value: BoxSpacing) => void;
}) {
  const setSide = (side: keyof BoxSpacing, next: number | undefined) =>
    onChange({ ...value, [side]: next });

  return (
    <div className="field box-spacing-field">
      <span>{label}</span>
      <div className="box-spacing-grid">
        <NumberMini label="Top" value={value.top} onChange={(next) => setSide("top", next)} />
        <NumberMini label="Right" value={value.right} onChange={(next) => setSide("right", next)} />
        <NumberMini label="Bottom" value={value.bottom} onChange={(next) => setSide("bottom", next)} />
        <NumberMini label="Left" value={value.left} onChange={(next) => setSide("left", next)} />
      </div>
    </div>
  );
}

function NumberMini({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <label>
      <small>{label}</small>
      <input
        type="number"
        min="0"
        max="240"
        value={value ?? ""}
        placeholder="Auto"
        onChange={(event) =>
          onChange(event.target.value === "" ? undefined : Number(event.target.value))
        }
      />
    </label>
  );
}
