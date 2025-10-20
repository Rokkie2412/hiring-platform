import { type ReactElement } from "react";

import type { FormInputAmountProps } from './types';

const formatCurrency = (num: string | number) => {
  const str = num.toString().replace(/[^\d]/g, "");
  if (!str) return "";
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const FormInputAmount = (props: FormInputAmountProps): ReactElement => {
  const { label, name, value, onChange, error, required, placeholder } = props

  return (
    <span className="flex flex-col w-full text-black">
      {label && (
        <label className="text-xs mb-1 font-medium text-gray-700">
          {label}
          {required && <span className="text-red-700 text-xs ml-0.5">*</span>}
        </label>
      )}
      <div className="flex flex-row items-center border-2 border-gray-300 px-4 py-2 rounded-lg focus-within:border-teal-600 transition-colors">
        <span className="font-semibold text-black mr-2">Rp</span>
        <input
          type="text"
          name={name}
          value={formatCurrency(value)}
          placeholder={placeholder}
          onChange={onChange}
          className="text-sm flex-1 outline-none"
        />
      </div>

      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
    </span>
  );
};

export default FormInputAmount;