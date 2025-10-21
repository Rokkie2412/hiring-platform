import { useEffect, useRef, type ReactElement } from "react";

import type { InputFormTextAreaProps } from "./types";

const useDynamicHeight = (
  value: string,
  ref: React.RefObject<HTMLTextAreaElement | null>
): void => {
  useEffect(() => {
    if (!ref.current) return;

    const textarea = ref.current;
    textarea.style.height = "auto";
    const newHeight = Math.max(textarea.scrollHeight, 88);
    textarea.style.height = `${newHeight}px`;
  }, [value, ref]);
};

const FormInputTextArea = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  placeholder = "",
}: InputFormTextAreaProps): ReactElement => {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useDynamicHeight(value, ref);

  return (
    <span className="flex flex-col w-full text-black">
      {label && (
        <label className="text-xs mb-1 font-medium text-gray-700">
          {label}
          {required && <span className="text-red-700 text-xs ml-0.5">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={1}
        className="resize-none text-sm px-4 py-2 border-2 border-gray-300 rounded-lg outline-none focus:border-teal-600 transition-colors"
      />

      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
    </span>
  );
};

export default FormInputTextArea;
