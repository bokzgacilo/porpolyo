const shadowPresets = [
  { label: "None", value: "" },
  { label: "Small", value: "0 2px 8px rgba(15, 23, 42, 0.12)" },
  { label: "Medium", value: "0 12px 30px rgba(15, 23, 42, 0.16)" },
  { label: "Large", value: "0 24px 60px rgba(15, 23, 42, 0.22)" },
  { label: "Hard offset", value: "6px 6px 0 rgba(15, 23, 42, 0.95)" },
  { label: "Glow", value: "0 0 0 4px rgba(37, 99, 255, 0.18)" },
  { label: "Custom", value: "__custom__" },
];

export function BoxShadowInput({ value, onChange }: {
  value?: string;
  onChange: (value: string | undefined) => void;
}) {
  const presetValue = shadowPresets.some((preset) => preset.value === (value || ""))
    ? value || ""
    : "__custom__";
  return (
    <>
      <label className="field">
        <span>Box shadow</span>
        <select value={presetValue} onChange={(event) => {
          if (event.target.value !== "__custom__") onChange(event.target.value || undefined);
        }}>
          {shadowPresets.map((preset) => <option key={preset.label} value={preset.value}>{preset.label}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Custom shadow</span>
        <input
          value={value || ""}
          placeholder="0 12px 30px rgba(15, 23, 42, 0.16)"
          onChange={(event) => onChange(event.target.value || undefined)}
        />
      </label>
    </>
  );
}
