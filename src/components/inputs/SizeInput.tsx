import { Field, HStack, Input, NativeSelect } from "@chakra-ui/react";
import type { SizeValue } from "../../types/portfolio";

export function SizeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: SizeValue;
  onChange: (value: SizeValue | undefined) => void;
}) {
  const unit = value?.unit || "px";
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <HStack gap={1} w="full">
        <Input
          flex={1}
          size="xs"
          type="number"
          min="0"
          max={unit === "%" ? "100" : "2000"}
          value={value?.value ?? ""}
          onChange={(event) =>
            onChange(
              event.target.value === ""
                ? undefined
                : { value: Number(event.target.value), unit },
            )
          }
        />
        <NativeSelect.Root size="xs" w="128px">
          <NativeSelect.Field
            value={unit}
            onChange={(event) => {
              const nextUnit = event.target.value as SizeValue["unit"];
              onChange(
                value?.value === undefined
                  ? { unit: nextUnit }
                  : { value: value.value, unit: nextUnit },
              );
            }}
          >
            <option value="px">px</option>
            <option value="%">%</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </HStack>
    </Field.Root>
  );
}
