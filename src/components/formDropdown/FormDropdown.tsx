import { type ReactElement, useState, useRef, useEffect } from "react";

import type { DropdownOption, FormDropdownProps } from './types'

const FormDropdown = (props: FormDropdownProps): ReactElement => {
  const {
    label,
    name,
    value,
    onChange,
    options,
    placeholder = "Select option",
    error,
    required = false,
    disabled = false,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(
    options.find((opt) => opt.value === value) || null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const option = options.find((opt) => opt.value === value);
    setSelectedOption(option || null);
  }, [value, options]);

  const handleSelect = (option: DropdownOption) => {
    setSelectedOption(option);
    onChange(option.value);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="text-xs mb-1 font-medium text-gray-700">
          {label}
          {required && <span className="text-red-700 text-xs ml-0.5">*</span>}
        </label>
      )}

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            w-full px-4 py-3 text-left text-sm rounded-lg border-2 transition-all
            flex items-center justify-between
            focus:border-teal-600
            border-gray-300
            ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
            ${error ? "border-red-500" : ""}
          `}
        >
          <span
            className={selectedOption ? "text-gray-900" : "text-gray-400"}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""
              }`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border-1 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {options.map((option, index) => {
              const isSelected = selectedOption?.value === option.value;
              const isLast = index === options.length - 1;

              return (
                <div key={option.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`
                      w-full px-4 py-3 text-left text-sm transition-colors
                      flex items-center justify-between
                      ${isSelected
                        ? "text-black font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    <span>{option.label}</span>
                  </button>
                  {!isLast && <div className="border-t border-dashed border-gray-200"></div>}
                </div>
              );
            })}
          </div>
        )}
        <input type="hidden" name={name} value={value} />
      </div>

      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
    </div>
  );
};

export default FormDropdown;