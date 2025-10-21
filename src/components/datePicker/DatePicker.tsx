import React from "react";
import DatePicker, { type ReactDatePickerCustomHeaderProps } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import calendarIcon from "../../assets/calendarIcon.png";

import "./DatePicker.css";
import type { CustomDatePickerProps } from "./types";

const FormDatePicker: React.FC<CustomDatePickerProps> = ({
  label = "Select Date",
  value,
  onChange,
  required = false,
  error,
  placeholder = "Select a date",
}) => {
  const CustomHeader: React.FC<ReactDatePickerCustomHeaderProps> = ({
    date,
    changeYear,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
    prevYearButtonDisabled,
    nextYearButtonDisabled,
  }) => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    return (
      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => changeYear(date.getFullYear() - 1)}
            disabled={prevYearButtonDisabled}
            type="button"
            className="text-gray-600 hover:text-black disabled:text-gray-300 text-lg font-light"
          >
            &laquo;
          </button>
          <button
            onClick={decreaseMonth}
            disabled={prevMonthButtonDisabled}
            type="button"
            className="text-gray-600 hover:text-black disabled:text-gray-300"
          >
            &lt;
          </button>
        </div>

        <div className="text-center font-semibold text-gray-800">
          {months[date.getMonth()]} {date.getFullYear()}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={increaseMonth}
            disabled={nextMonthButtonDisabled}
            type="button"
            className="text-gray-600 hover:text-black disabled:text-gray-300"
          >
            &gt;
          </button>
          <button
            onClick={() => changeYear(date.getFullYear() + 1)}
            disabled={nextYearButtonDisabled}
            type="button"
            className="text-gray-600 hover:text-black disabled:text-gray-300 text-lg font-light"
          >
            &raquo;
          </button>
        </div>
      </div>
    );
  };

  const CustomInput = React.forwardRef<
    HTMLDivElement,
    { value?: string; onClick?: () => void }
  >(({ value, onClick }, ref) => (
    <div ref={ref} onClick={onClick} className="relative w-full cursor-pointer">
      <img
        src={calendarIcon}
        alt="calendar icon"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400"
      />
      <div
        className={`
          w-full pl-10 pr-3 py-2.5 border rounded-md shadow-sm text-gray-700 bg-white text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          flex items-center
          ${error ? "border-red-500" : "border-gray-300"}
        `}
      >
        <span className="text-left">
          {value || <span className="text-gray-400">{placeholder}</span>}
        </span>
      </div>
    </div>
  ));

  return (
    <div className="flex flex-col w-full">
      <label className="text-xs font-medium text-black mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <DatePicker
        selected={value}
        onChange={onChange}
        dateFormat="dd MMM yyyy"
        customInput={<CustomInput />}
        renderCustomHeader={(props) => <CustomHeader {...props} />}
        showPopperArrow={false}
      />

      {error && (
        <p className="mt-1 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormDatePicker;
