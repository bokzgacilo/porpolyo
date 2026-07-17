import { Field, Input } from "@chakra-ui/react";

export function TextInput({
  label,
  value,
  limit,
  onChange,
}: {
  label: string;
  value: string;
  limit?: number;
  onChange: (value: string) => void;
}) {
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <Input
        size="xs"
        value={value}
        maxLength={limit}
        onChange={(event) => onChange(event.target.value)}
      />
      {limit && (
        <Field.HelperText>
          {limit - value.length} characters remaining
        </Field.HelperText>
      )}
    </Field.Root>
  );
}
