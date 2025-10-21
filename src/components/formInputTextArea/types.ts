export type InputFormTextAreaProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement | null>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
};