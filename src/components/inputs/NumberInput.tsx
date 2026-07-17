import { Field, NumberInput as ChakraNumberInput } from "@chakra-ui/react";

type NumberInputProps = {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
};

export function NumberInput({ label, value, onChange }: NumberInputProps) {
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>

      <ChakraNumberInput.Root
        w="full"
        size="xs"
        value={value?.toString() ?? ""}
        onValueChange={(details) => {
          onChange(details.value === "" ? undefined : details.valueAsNumber);
        }}
      >
        <ChakraNumberInput.Control />
        <ChakraNumberInput.Input />
      </ChakraNumberInput.Root>
    </Field.Root>
  );
}
