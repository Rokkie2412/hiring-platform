export type Country = {
  name: string;
  code: string;
  flag: string;
};

export type FormPhoneNumberProps = {
  label?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
};