import { useState, useEffect, type ReactElement } from "react";
import type { InputFormTextProps } from "./types";

// === Fungsi Validasi URL ===
const validateUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return (
      ["http:", "https:"].includes(parsed.protocol) &&
      parsed.host.includes("linkedin.com") &&
      parsed.pathname.startsWith("/in/")
    );
  } catch {
    return false;
  }
};

const FormInputText = (props: InputFormTextProps): ReactElement => {
  const { label, name, value, onChange, error, required, placeholder } = props;

  const [status, setStatus] = useState<"idle" | "valid" | "invalid">("idle");

  useEffect(() => {
    if (!value) {
      setStatus("idle");
      return;
    }

    // debounce 1 detik sebelum validasi
    const timer = setTimeout(() => {
      const isValid = validateUrl(value);
      setStatus(isValid ? "valid" : "invalid");
    }, 1000);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <span className="flex flex-col w-full text-black">
      {/* Label */}
      <label className="text-xs mb-2">
        {label}
        {required && <span className="text-red-700 text-xs ml-0.5">*</span>}
      </label>

      {/* Input Field */}
      <input
        placeholder={placeholder}
        required={required}
        className={`text-sm px-4 py-2 border-2 rounded-lg outline-none transition-colors ${status === "valid"
            ? "border-teal-600 focus:border-teal-600"
            : status === "invalid"
              ? "border-red-500 focus:border-red-500"
              : "border-gray-300 focus:border-teal-600"
          }`}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
      />

      {/* Pesan error manual dari props */}
      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}

      {/* Status URL */}
      {status === "valid" && (
        <div className="flex items-center gap-2 mt-1 text-teal-600 text-xs">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>URL address found</span>
        </div>
      )}

      {status === "invalid" && (
        <div className="flex items-center gap-2 mt-1 text-red-500 text-xs">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z" />
          </svg>
          <span>Invalid URL address</span>
        </div>
      )}
    </span>
  );
};

export default FormInputText;
