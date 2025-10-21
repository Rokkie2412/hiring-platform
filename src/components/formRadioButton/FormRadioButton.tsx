import { type ReactElement } from "react";
import type { RequirementOption } from "../../types";
import type { RequirementToggleProps } from "./types";

const FormRadioButton = ({
  value,
  onChange,
  label,
  name,
  disabled = false,
  disabledOptions = [],
  defaultValue = "mandatory",
}: RequirementToggleProps): ReactElement => {
  const currentValue = value ?? defaultValue;

  const options: { value: RequirementOption; label: string }[] = [
    { value: "mandatory", label: "Mandatory" },
    { value: "optional", label: "Optional" },
    { value: "off", label: "Off" },
  ];

  const handleChange = (selectedValue: RequirementOption) => {
    if (!disabled && !disabledOptions.includes(selectedValue)) {
      onChange(selectedValue);
    }
  };

  return (
    <div className="flex flex-row items-center justify-between w-full gap-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}

      <div className="flex flex-row gap-3">
        {options.map((option) => {
          const isSelected = currentValue === option.value;
          const isDisabled = disabled || disabledOptions.includes(option.value);

          const baseClass =
            "px-6 py-2 rounded-full text-sm font-medium border transition-all";
          const activeClass =
            "bg-white border-teal-500 text-teal-600 shadow-sm";
          const inactiveClass = "bg-transparent border-gray-300 text-black";
          const disabledClass =
            "bg-gray-200 text-gray-400 border-transparent cursor-not-allowed opacity-60";

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange(option.value)}
              disabled={isDisabled}
              className={`${baseClass} ${isDisabled
                ? disabledClass
                : isSelected
                  ? activeClass
                  : inactiveClass
                }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {name && <input type="hidden" name={name} value={currentValue} />}
    </div>
  );
};

export default FormRadioButton;
