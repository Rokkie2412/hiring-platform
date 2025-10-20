import { useEffect, useRef, type ReactElement } from "react";
import type { InputFormTextAreaProps } from "./types";

const useDynamicHeight = (
  value: string,
  ref: React.RefObject<HTMLTextAreaElement | null>
): void => {
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      const newHeight = Math.max(ref.current.scrollHeight, 88);
      ref.current.style.height = `${newHeight}px`;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
};

const FormInputTextArea = (props: InputFormTextAreaProps): ReactElement => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const { label, name, value, onChange, error, required, placeholder } = props;

  useDynamicHeight(value, ref);

  return (
    <span className="flex flex-col w-full text-black">
      <label className="text-xs mb-1 font-medium text-gray-700">
        {label}
        {required && <span className="text-red-700 text-xs ml-0.5">*</span>}
      </label>
      <textarea
        ref={ref}
        name={name}
        required={required}
        placeholder={placeholder || "Ex."}
        value={value}
        onChange={onChange}
        rows={1}
        className="resize-none text-sm px-4 py-2 border-2 border-gray-300 rounded-lg outline-none focus:border-teal-600 transition-colors"
      />
      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
    </span>
  );
};

export default FormInputTextArea;
