export type CustomDatePickerProps = {
  label?: string;
  value?: Date | null;
  onChange: (date: Date | null) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
}
