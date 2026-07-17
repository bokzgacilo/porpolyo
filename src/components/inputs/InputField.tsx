import { Field, Input } from "@chakra-ui/react";
import type { ChangeEventHandler } from "react";

type InputFieldProps = {
  label: string;
  value: string | number;
  limit?: number;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export const InputField = ({
  label,
  value,
  limit,
  onChange,
}: InputFieldProps) => {
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>
      <Input maxLength={limit} value={value} onChange={onChange} />
      {limit !== undefined && (
        <Field.HelperText>
          {String(value).length}/{limit} characters
        </Field.HelperText>
      )}
    </Field.Root>
  );
};
