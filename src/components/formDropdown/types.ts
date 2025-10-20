export type DropdownOption = {
  value: string;
  label: string;
}

export type FormDropdownProps = {
  label?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}