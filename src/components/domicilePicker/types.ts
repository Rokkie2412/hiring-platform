export type CustomSelectProps = {
  label?: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  value?: string;
  onChange: (name: string, value: string) => void;
  name: string;
  error?: string;
  touched?: boolean;
};