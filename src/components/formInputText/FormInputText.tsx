import { type ReactElement } from "react";

import type { InputFormTextProps } from "./types";

const FormInputText = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  placeholder = "",
}: InputFormTextProps): ReactElement => {
  return (
    <span className="flex flex-col w-full text-black">
      {label && (
        <label className="text-xs mb-2">
          {label}
          {required && <span className="text-red-700 text-xs ml-0.5">*</span>}
        </label>
      )}

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="text-sm px-4 py-2 border-2 border-gray-300 rounded-lg outline-none focus:border-teal-600 transition-colors"
      />

      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
    </span>
  );
};

export default FormInputText;
