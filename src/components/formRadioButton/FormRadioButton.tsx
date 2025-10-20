import { type ReactElement } from "react";

import type { RequirementOption } from '../../types'
import type { RequirementToggleProps } from "./types";

const FormRadioButton = (props: RequirementToggleProps): ReactElement => {
  const { value, onChange, label, disabled = false, disabledOptions = [], name, defaultValue = 'mandatory' } = props;

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
    <div className="flex flex-row gap-2 w-full justify-between items-center">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="flex flex-row gap-3">
        {options.map((option) => {
          const isSelected = currentValue === option.value;
          const isDisabled = disabled || disabledOptions.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange(option.value)}
              disabled={isDisabled}
              className={`
                px-6 py-2 rounded-full text-sm font-medium transition-all
                ${isSelected && !isDisabled
                  ? "bg-white border-1 border-teal-500 text-teal-500"
                  : ""
                }
                ${!isSelected && !isDisabled
                  ? "bg-transparent text-black border-1 border-gray-300"
                  : ""
                }
                ${isDisabled
                  ? "bg-gray-200 text-gray-400 border-1 border-transparent cursor-not-allowed opacity-60"
                  : "cursor-pointer"
                }
              `}
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